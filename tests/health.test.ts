/**
 * Health endpoint & error-path contract tests (TDD, authored against the Spec).
 *
 * Spec task IDs / safety rules protected:
 *  - P1-T1 (Spec §4.0, §5): `GET /health` returns HTTP 200.
 *  - rule 02.8 (Data protection): responses must never echo bindings, secrets,
 *    model names, or env-var values.
 *  - rule 02.9 (No secrets in code/tests): tests use synthetic canary values —
 *    no real PII, no real secrets.
 *  - rule 04.14 (Errors): unhandled routes return a safe, generic payload —
 *    never a stack trace or internal detail.
 *  - rule 04.6 (frozen envelope): error responses are safe and structured.
 *
 * Strategy: invoke the Worker `fetch` handler directly with a mock `env` that
 * embeds a unique CANARY string in every binding, var, secret and model
 * identifier. Any accidental echo of env state into a client response becomes
 * unmistakable. This needs no Miniflare / real bindings — the `/health` and 404
 * surface must not touch platform services (rule 04.7: access bindings via env).
 *
 * Expected Worker contract (worker-dev, P1-T2):
 *   export default { fetch(request, env, ctx) { ... returns Response } }
 */

import { describe, it, expect } from "vitest";
import worker from "../src/index";

/* -------------------------------------------------------------------------- */
/* Test fixtures (synthetic, clearly-labelled — no real PII/secrets)            */
/* -------------------------------------------------------------------------- */

// Unique canary. If this string appears in any response, env state leaked.
const CANARY = "CANARY-LEAK-MARKER-9f3c7a1e";

type Env = Record<string, unknown>;

// Minimal stand-in for the Worker ExecutionContext. The /health and 404 paths
// must not depend on it; no-op stubs are provided defensively so a handler
// that (incorrectly) calls waitUntil cannot crash the test.
type Ctx = {
  waitUntil?(promise: Promise<unknown>): void;
  passThroughOnException?(): void;
};
const ctx: Ctx = {
  waitUntil: (p) => {
    void p;
  },
  passThroughOnException: () => {},
};

// Mock env mirrors the bindings/vars in the wrangler.toml reference (Spec §7).
// Every value embeds the CANARY so a leak is detectable.
const env: Env = {
  // --- Platform bindings (rule 02.8: never persisted or surfaced to clients) ---
  AI: { __brand: `${CANARY}-AI`, run: async () => new Response() },
  VECTOR_INDEX: {
    __brand: `${CANARY}-VECTOR_INDEX`,
    getVector: async () => [],
  },
  DB: { __brand: `${CANARY}-DB`, prepare: () => ({ all: async () => [] }) },
  SESSIONS: {
    __brand: `${CANARY}-SESSIONS`,
    get: async () => null,
    put: async () => undefined,
  },
  RAW_CONTENT: { __brand: `${CANARY}-RAW_CONTENT`, get: async () => null },
  INGEST_QUEUE: {
    __brand: `${CANARY}-INGEST_QUEUE`,
    send: async () => undefined,
  },
  // --- Vars (Spec §7 [vars]) ---
  SIMILARITY_THRESHOLD: "0.5",
  RATE_LIMIT_PER_MINUTE: "20",
  // --- Secrets & pinned model identifiers (rules 02.8, 02.9, 04.14) ---
  CLOUDFLARE_API_TOKEN: `${CANARY}-cf-api-token-secret`,
  AI_GATEWAY_API_KEY: `${CANARY}-gateway-api-key`,
  ADMIN_INGEST_KEY: `${CANARY}-admin-ingest-secret`,
  // Pinned per Spec §7; model drift is a deploy gate (rule 04.12).
  EMBEDDING_MODEL: "@cf/baai/bge-base-en-v1.5",
  GENERATION_MODEL: "@cf/meta/llama-3.1-8b-instruct-fp8-fast",
};

/* -------------------------------------------------------------------------- */
/* Safety helpers                                                              */
/* -------------------------------------------------------------------------- */

// Binding names declared in wrangler.toml (Spec §7). Matched as whole tokens
// so ordinary words never trigger false positives (rule 02.8).
const BINDING_NAMES = [
  "AI",
  "VECTOR_INDEX",
  "DB",
  "SESSIONS",
  "RAW_CONTENT",
  "INGEST_QUEUE",
] as const;

// Substrings for pinned model identifiers (rule 04.12, Spec §7).
const MODEL_MARKERS = ["llama", "bge"];

// Patterns that betray an internal/stack-trace leak (rule 04.14).
const INTERNAL_TRACE_PATTERNS: ReadonlyArray<RegExp> = [
  /^\s*at\s+/m, // V8 stack frames: "    at foo (...)"
  /at\s+(?:Object\.|async\s+)?[A-Za-z_$][\w$]*\s*\([^)]*:\d+:\d+\)/, // at fn (file:1:2)
  /\b(?:Type|Reference|Range|URI|Syntax)Error\b/, // error constructor names
  /<anonymous>/,
  /src\/[A-Za-z0-9._-]+\.ts:\d+/, // source:line references
  /node_modules\/[A-Za-z0-9._-]+/, // internal module paths
];

// Assert a response body contains NO bindings, secrets, model names or env
// values (rules 02.8, 02.9, 04.14).
function assertNoEnvLeak(raw: string): void {
  const leaks: string[] = [];

  // 1. Canary (secret/env value) must never appear.
  if (raw.includes(CANARY)) leaks.push("canary/env value");

  // 2. Binding names must never appear (whole-word, case-insensitive).
  for (const name of BINDING_NAMES) {
    if (new RegExp(`\\b${name}\\b`, "i").test(raw))
      leaks.push(`binding "${name}"`);
  }

  // 3. Pinned model identifiers must never appear.
  for (const m of MODEL_MARKERS) {
    if (raw.toLowerCase().includes(m)) leaks.push(`model "${m}"`);
  }

  expect(
    leaks,
    `Response leaked internal details (rules 02.8, 02.9, 04.14): ${leaks.join(", ")}`
  ).toEqual([]);
}

// Assert a response body carries no stack traces or internal paths (rule 04.14).
function assertNoInternalDetails(raw: string): void {
  const found: string[] = [];
  for (const re of INTERNAL_TRACE_PATTERNS) {
    if (re.test(raw)) found.push(re.toString());
  }
  expect(
    found,
    `Response leaked internal/stack-trace details (rule 04.14): ${found.join(", ")}`
  ).toEqual([]);
}

/* -------------------------------------------------------------------------- */
/* Tests                                                                       */
/* -------------------------------------------------------------------------- */

describe("GET /health [P1-T1, rules 02.8/04.14]", () => {
  it("responds with HTTP 200 and a JSON content-type", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/health"),
      env,
      ctx
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/application\/json/);
  });

  it("returns exactly { status: 'ok', timestamp: <ISO-8601> }", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/health"),
      env,
      ctx
    );
    const raw = await res.text();

    // Body must have precisely these two keys — no extra (leaked) properties.
    const body = JSON.parse(raw) as Record<string, unknown>;
    expect(Object.keys(body).sort()).toEqual(["status", "timestamp"]);
    expect(body.status).toBe("ok");

    // Timestamp: non-empty string, valid & parseable ISO-8601.
    const ts = body.timestamp;
    expect(typeof ts).toBe("string");
    expect((ts as string).length).toBeGreaterThan(0);
    const parsed = new Date(ts as string);
    expect(Number.isNaN(parsed.getTime())).toBe(false);
    expect(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/.test(
        ts as string
      )
    ).toBe(true);
  });

  it("does not leak bindings, secrets, model names or env values [P1-T1, rule 02.8]", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/health"),
      env,
      ctx
    );
    const raw = await res.text();
    assertNoEnvLeak(raw);
    assertNoInternalDetails(raw);
  });
});

describe("Unhandled routes return safe generic 404s [rule 04.14]", () => {
  // A representative spread of unknown method/path combinations. None should
  // reach retrieval/generation or surface internal state.
  const cases: ReadonlyArray<{ method: string; url: string }> = [
    { method: "GET", url: "http://localhost/not-found" },
    { method: "POST", url: "http://localhost/unknown" },
    { method: "PUT", url: "http://localhost/api/anything" },
  ];

  for (const c of cases) {
    it(`${c.method} ${new URL(c.url).pathname} -> 404 with a safe generic payload`, async () => {
      const res = await worker.fetch(
        new Request(c.url, { method: c.method }),
        env,
        ctx
      );

      expect(res.status).toBe(404);

      // Safe 404s must be structured, not HTML error pages (rule 04.14).
      const ct = res.headers.get("Content-Type") ?? "";
      expect(ct).toMatch(/application\/json/);

      const raw = await res.text();

      // Structured body: a JSON object exposing at least one human-readable
      // string, and nothing sensitive.
      let body: unknown;
      expect(() => {
        body = JSON.parse(raw);
      }).not.toThrow();
      expect(body).toEqual(expect.any(Object));

      const asObj = body as Record<string, unknown>;
      const hasReadableString = Object.values(asObj).some(
        (v) => typeof v === "string" && v.length > 0
      );
      expect(hasReadableString).toBe(true);

      // Never leak bindings/secrets/model names/env values (rule 02.8).
      assertNoEnvLeak(raw);
      // Never leak stack traces or internal paths (rule 04.14).
      assertNoInternalDetails(raw);
    });
  }
});
