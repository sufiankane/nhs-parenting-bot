import { Env } from "./types";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const inMemoryStore = new Map<string, RateLimitEntry>();

export async function checkRateLimit(
  request: Request,
  env: Env
): Promise<{ allowed: boolean; retryAfter?: string }> {
  const rawLimit = env.RATE_LIMIT_PER_MINUTE;
  let limit = 20;
  if (typeof rawLimit === "string") {
    const parsed = parseInt(rawLimit, 10);
    if (!isNaN(parsed) && parsed > 0) {
      limit = parsed;
    }
  } else if (typeof rawLimit === "number" && rawLimit > 0) {
    limit = rawLimit;
  }

  const ip =
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For") ||
    "127.0.0.1";

  const now = Date.now();
  const windowMs = 60 * 1000;

  const entry = inMemoryStore.get(ip);
  if (!entry || now > entry.resetTime) {
    inMemoryStore.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= limit) {
    const retryAfter = Math.max(1, Math.ceil((entry.resetTime - now) / 1000)).toString();
    return { allowed: false, retryAfter };
  }

  entry.count += 1;
  return { allowed: true };
}
