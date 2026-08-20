/**
 * KV-backed rate limiter contract tests (P1-T8, TDD against the worker-dev brief).
 *
 * Spec task IDs / safety rules protected:
 *  - P1-T8 (Spec §4 M2): KV-backed fixed-window rate limiting on /chat.
 *  - rule 02.1 (triage first): rate limiting is abuse control, NOT the safety
 *    gate. A KV failure must fail OPEN (allowed) so a limiter outage can never
 *    masquerade as a safety decision or block a user in crisis.
 *  - rule 02.8 (no PII persistence): the limiter must never log or return the
 *    client IP in its result payload.
 *
 * Expected module contract (worker-dev):
 *   src/gateway/kvRateLimit.ts exports
 *   checkKvRateLimit(request, env): Promise<{ allowed: boolean; retryAfter?: string }>
 *   - KV namespace: env.SESSIONS, key prefix `ratelimit:`, fixed window 60s.
 *   - Limit from env.RATE_LIMIT_PER_MINUTE (default 20; malformed/<=0 -> 20).
 *   - IP from CF-Connecting-IP || X-Forwarded-For || "anonymous".
 *   - Missing KV binding or KV get/put throw -> { allowed: true } (fail open).
 */

import { describe, it, expect, vi } from "vitest";
import { checkKvRateLimit } from "../src/gateway/kvRateLimit";

/* -------------------------------------------------------------------------- */
/* Mock KV (in-memory Map with expirationTtl capture)                          */
/* -------------------------------------------------------------------------- */

interface MockKvEntry {
  value: string;
  expirationTtl?: number;
}

class MockKv {
  readonly store = new Map<string, MockKvEntry>();
  readonly putCalls: Array<{
    key: string;
    value: string;
    options?: { expirationTtl?: number };
  }> = [];
  failGet = false;
  failPut = false;

  async get(key: string): Promise<string | null> {
    if (this.failGet) throw new Error("simulated KV get failure");
    return this.store.get(key)?.value ?? null;
  }

  async put(
    key: string,
    value: string,
    options?: { expirationTtl?: number }
  ): Promise<void> {
    if (this.failPut) throw new Error("simulated KV put failure");
    this.putCalls.push({ key, value, options });
    this.store.set(key, { value, expirationTtl: options?.expirationTtl });
  }
}

type RateLimitEnv = {
  SESSIONS?: MockKv;
  RATE_LIMIT_PER_MINUTE?: string;
};

function requestWithIp(ip: string): Request {
  return new Request("http://localhost/chat", {
    method: "POST",
    headers: { "CF-Connecting-IP": ip },
  });
}

describe("checkKvRateLimit — fixed-window enforcement [P1-T8, Spec §4 M2]", () => {
  it("allows up to the configured limit then blocks with retryAfter", async () => {
    const kv = new MockKv();
    const env: RateLimitEnv = { SESSIONS: kv, RATE_LIMIT_PER_MINUTE: "3" };
    const ip = "192.0.2.10";

    for (let i = 0; i < 3; i++) {
      const res = await checkKvRateLimit(requestWithIp(ip), env);
      expect(res.allowed, `request ${i + 1} within limit`).toBe(true);
    }

    const blocked = await checkKvRateLimit(requestWithIp(ip), env);
    expect(blocked.allowed).toBe(false);
    expect(typeof blocked.retryAfter).toBe("string");
    const retryAfter = Number(blocked.retryAfter);
    expect(Number.isFinite(retryAfter)).toBe(true);
    expect(retryAfter).toBeGreaterThanOrEqual(1);
  });

  it("defaults to 20 when RATE_LIMIT_PER_MINUTE is undefined and falls back to 20 when malformed", async () => {
    const cases: Array<{ label: string; raw: string | undefined }> = [
      { label: "undefined", raw: undefined },
      { label: "abc", raw: "abc" },
      { label: "-5", raw: "-5" },
      { label: "0", raw: "0" },
    ];

    for (const [idx, c] of cases.entries()) {
      const kv = new MockKv();
      const env: RateLimitEnv = { SESSIONS: kv, RATE_LIMIT_PER_MINUTE: c.raw };
      const ip = `192.0.2.${200 + idx}`;

      for (let i = 0; i < 20; i++) {
        const res = await checkKvRateLimit(requestWithIp(ip), env);
        expect(res.allowed, `${c.label}: request ${i + 1}`).toBe(true);
      }
      const blocked = await checkKvRateLimit(requestWithIp(ip), env);
      expect(blocked.allowed, `${c.label}: 21st request`).toBe(false);
    }
  });

  it("tracks IPs independently — different CF-Connecting-IP values do not share a window", async () => {
    const kv = new MockKv();
    const env: RateLimitEnv = { SESSIONS: kv, RATE_LIMIT_PER_MINUTE: "2" };
    const ipA = "192.0.2.1";
    const ipB = "192.0.2.2";

    // Exhaust ipA's window.
    expect((await checkKvRateLimit(requestWithIp(ipA), env)).allowed).toBe(true);
    expect((await checkKvRateLimit(requestWithIp(ipA), env)).allowed).toBe(true);
    expect((await checkKvRateLimit(requestWithIp(ipA), env)).allowed).toBe(false);

    // ipB must still be allowed — its window is independent.
    expect((await checkKvRateLimit(requestWithIp(ipB), env)).allowed).toBe(true);
    expect((await checkKvRateLimit(requestWithIp(ipB), env)).allowed).toBe(true);
    expect((await checkKvRateLimit(requestWithIp(ipB), env)).allowed).toBe(false);
  });

  it("fails OPEN when the KV binding is missing or KV get/put throws (rule 02.1)", async () => {
    // protects rule 02.1 — rate limiting is abuse control only; the safety gate
    // is M3 triage, so a limiter outage must never block a user in crisis.
    const envNoKv: RateLimitEnv = { RATE_LIMIT_PER_MINUTE: "1" };
    const resNoKv = await checkKvRateLimit(requestWithIp("192.0.2.50"), envNoKv);
    expect(resNoKv.allowed).toBe(true);
    expect(resNoKv.retryAfter).toBeUndefined();

    const kvGetThrows = new MockKv();
    kvGetThrows.failGet = true;
    const resGetThrows = await checkKvRateLimit(requestWithIp("192.0.2.51"), {
      SESSIONS: kvGetThrows,
      RATE_LIMIT_PER_MINUTE: "1",
    });
    expect(resGetThrows.allowed).toBe(true);

    const kvPutThrows = new MockKv();
    kvPutThrows.failPut = true;
    const resPutThrows = await checkKvRateLimit(requestWithIp("192.0.2.52"), {
      SESSIONS: kvPutThrows,
      RATE_LIMIT_PER_MINUTE: "1",
    });
    expect(resPutThrows.allowed).toBe(true);
  });

  it("uses the `ratelimit:` key prefix and a 60s fixed window", async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
      const kv = new MockKv();
      const env: RateLimitEnv = { SESSIONS: kv, RATE_LIMIT_PER_MINUTE: "2" };
      const ip = "192.0.2.60";

      await checkKvRateLimit(requestWithIp(ip), env);
      await checkKvRateLimit(requestWithIp(ip), env);
      expect((await checkKvRateLimit(requestWithIp(ip), env)).allowed).toBe(false);

      // Key shape: exactly one key, prefixed `ratelimit:` and carrying the IP.
      expect([...kv.store.keys()]).toEqual([`ratelimit:${ip}`]);

      // Still inside the 60s window at +59s -> still blocked.
      vi.advanceTimersByTime(59_000);
      expect((await checkKvRateLimit(requestWithIp(ip), env)).allowed).toBe(false);

      // Window expired at +61s -> allowed again.
      vi.advanceTimersByTime(2_000);
      expect((await checkKvRateLimit(requestWithIp(ip), env)).allowed).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("never logs or returns the client IP in the result payload (rule 02.8)", async () => {
    const kv = new MockKv();
    const env: RateLimitEnv = { SESSIONS: kv, RATE_LIMIT_PER_MINUTE: "1" };
    const ip = "203.0.113.77";

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const allowed = await checkKvRateLimit(requestWithIp(ip), env);
      const blocked = await checkKvRateLimit(requestWithIp(ip), env);

      // Result payload exposes only the documented fields.
      expect(Object.keys(allowed).sort()).toEqual(["allowed"]);
      expect(Object.keys(blocked).sort()).toEqual(["allowed", "retryAfter"]);
      // protects rule 02.8 — the IP must never appear in any result payload.
      expect(JSON.stringify(allowed)).not.toContain(ip);
      expect(JSON.stringify(blocked)).not.toContain(ip);

      // protects rule 02.8 — the IP must never be logged.
      const logged = [...logSpy.mock.calls, ...errorSpy.mock.calls]
        .map((c) => c.join(" "))
        .join("\n");
      expect(logged).not.toContain(ip);
    } finally {
      logSpy.mockRestore();
      errorSpy.mockRestore();
    }
  });
});
