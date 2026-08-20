/**
 * KV-backed fixed-window rate limiter for /chat (P1-T8, Spec §4 M2).
 *
 * Safety notes:
 *  - rule 02.1: rate limiting is abuse control ONLY, not the safety gate (that
 *    is M3 triage). Any KV failure or missing binding fails OPEN (allowed) so a
 *    limiter outage can never block a user in crisis.
 *  - rule 02.8: the client IP is used only as a key and is never logged or
 *    returned in the result payload.
 */

/** Structural KV subset (Cloudflare Workers KV). */
interface KVLike {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number }
  ): Promise<void>;
}

interface RateLimitEnv {
  SESSIONS?: KVLike;
  RATE_LIMIT_PER_MINUTE?: string;
}

/** Fixed window length in seconds. */
export const WINDOW_SECONDS = 60;

/**
 * Resolve the per-minute limit from env. Uses the configured value only when
 * it is a positive integer; otherwise falls back to 20 (undefined, malformed,
 * or <=0 all resolve to 20).
 */
export function resolveLimit(env: RateLimitEnv): number {
  const raw = env.RATE_LIMIT_PER_MINUTE;
  if (typeof raw === "string") {
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  } else if (typeof raw === "number" && raw > 0) {
    return raw;
  }
  return 20;
}

function clientIp(request: Request): string {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For") ||
    "anonymous"
  );
}

/**
 * Enforce a fixed 60s window per client IP. Fails OPEN on any KV error or a
 * missing SESSIONS binding (rule 02.1). Never includes the IP in the result.
 */
export async function checkKvRateLimit(
  request: Request,
  env: RateLimitEnv
): Promise<{ allowed: boolean; retryAfter?: string }> {
  const kv = env.SESSIONS;
  if (!kv) return { allowed: true };

  const limit = resolveLimit(env);
  const key = `ratelimit:${clientIp(request)}`;
  const now = Date.now();
  const windowMs = WINDOW_SECONDS * 1000;

  try {
    const raw = await kv.get(key);

    if (raw === null) {
      await kv.put(
        key,
        JSON.stringify({ count: 1, resetAt: now + windowMs }),
        { expirationTtl: WINDOW_SECONDS }
      );
      return { allowed: true };
    }

    let parsed: { count: number; resetAt: number } | null = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }

    // Corrupted or expired window -> start a fresh window.
    if (
      !parsed ||
      typeof parsed.count !== "number" ||
      typeof parsed.resetAt !== "number" ||
      now > parsed.resetAt
    ) {
      await kv.put(
        key,
        JSON.stringify({ count: 1, resetAt: now + windowMs }),
        { expirationTtl: WINDOW_SECONDS }
      );
      return { allowed: true };
    }

    if (parsed.count >= limit) {
      const retryAfter = String(
        Math.max(1, Math.ceil((parsed.resetAt - now) / 1000))
      );
      return { allowed: false, retryAfter };
    }

    const newCount = parsed.count + 1;
    const remainingMs = parsed.resetAt - now;
    const ttl = Math.max(1, Math.ceil(remainingMs / 1000));
    await kv.put(
      key,
      JSON.stringify({ count: newCount, resetAt: parsed.resetAt }),
      { expirationTtl: ttl }
    );
    return { allowed: true };
  } catch {
    // Fail OPEN (rule 02.1) — a limiter outage must never block a user.
    return { allowed: true };
  }
}
