import { describe, it, expect } from "vitest";
import worker from "../src/index";

const CANARY = "CANARY-LEAK-MARKER-9f3c7a1e";

type Env = Record<string, unknown>;

type Ctx = {
  waitUntil?(promise: Promise<unknown>): void;
  passThroughOnException?(): void;
};
const ctx: Ctx = {
  waitUntil: () => {},
  passThroughOnException: () => {},
};

const BINDING_NAMES = [
  "AI",
  "VECTOR_INDEX",
  "DB",
  "SESSIONS",
  "RAW_CONTENT",
  "INGEST_QUEUE",
] as const;

const MODEL_MARKERS = ["llama", "bge"];

const INTERNAL_TRACE_PATTERNS: ReadonlyArray<RegExp> = [
  /^\s*at\s+/m,
  /at\s+(?:Object\.|async\s+)?[A-Za-z_$][\w$]*\s*\([^)]*:\d+:\d+\)/,
  /\b(?:Type|Reference|Range|URI|Syntax)Error\b/,
  /<anonymous>/,
  /src\/[A-Za-z0-9._-]+\.ts:\d+/,
  /node_modules\/[A-Za-z0-9._-]+/,
];

function assertNoEnvLeak(raw: string): void {
  const leaks: string[] = [];
  if (raw.includes(CANARY)) leaks.push("canary/env value");
  for (const name of BINDING_NAMES) {
    if (new RegExp(`\\b${name}\\b`, "i").test(raw)) leaks.push(`binding "${name}"`);
  }
  for (const m of MODEL_MARKERS) {
    if (raw.toLowerCase().includes(m)) leaks.push(`model "${m}"`);
  }
  expect(leaks, `Response leaked internal details: ${leaks.join(", ")}`).toEqual([]);
}

function assertNoInternalDetails(raw: string): void {
  const found: string[] = [];
  for (const re of INTERNAL_TRACE_PATTERNS) {
    if (re.test(raw)) found.push(re.toString());
  }
  expect(found, `Response leaked stack traces: ${found.join(", ")}`).toEqual([]);
}

const mockKvStore = new Map<string, string>();
const env: Env = {
  AI: { __brand: `${CANARY}-AI` },
  VECTOR_INDEX: { __brand: `${CANARY}-VECTOR_INDEX` },
  DB: { __brand: `${CANARY}-DB` },
  SESSIONS: {
    __brand: `${CANARY}-SESSIONS`,
    async get(key: string) {
      return mockKvStore.get(key) ?? null;
    },
    async put(key: string, value: string) {
      mockKvStore.set(key, value);
    },
  },
  RAW_CONTENT: { __brand: `${CANARY}-RAW_CONTENT` },
  INGEST_QUEUE: { __brand: `${CANARY}-INGEST_QUEUE` },
  SIMILARITY_THRESHOLD: "0.5",
  RATE_LIMIT_PER_MINUTE: "20",
  ALLOWED_ORIGINS: "http://localhost:3000,https://app.example.com",
};

describe("POST /chat CORS handling [P1-T2, rule 02.5]", () => {
  it("handles OPTIONS preflight for allowed origin", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/chat", {
        method: "OPTIONS",
        headers: {
          Origin: "http://localhost:3000",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type",
        },
      }),
      env,
      ctx
    );
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:3000");
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
    expect(res.headers.get("Access-Control-Allow-Headers")).toContain("Content-Type");
    expect(res.headers.get("Access-Control-Allow-Credentials")).toBeNull();
  });

  it("does not set Access-Control-Allow-Origin when Origin header is absent", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/chat", {
        method: "OPTIONS",
      }),
      env,
      ctx
    );
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("does not allow origin when Origin is not in ALLOWED_ORIGINS", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/chat", {
        method: "OPTIONS",
        headers: {
          Origin: "http://malicious.com",
          "Access-Control-Request-Method": "POST",
        },
      }),
      env,
      ctx
    );
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });
});

describe("CORS headers on error responses [P1-T2, rule 02.5]", () => {
  it("includes Access-Control-Allow-Origin on 415 error when Origin is allowed", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/chat", {
        method: "POST",
        body: JSON.stringify({ message: "Hello" }),
        headers: {
          "Content-Type": "text/plain",
          Origin: "http://localhost:3000",
        },
      }),
      env,
      ctx
    );
    expect(res.status).toBe(415);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:3000");
  });

  it("includes Access-Control-Allow-Origin on 400 error when Origin is allowed", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/chat", {
        method: "POST",
        body: '{"message": unquoted',
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
      }),
      env,
      ctx
    );
    expect(res.status).toBe(400);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:3000");
  });

  it("does not include Access-Control-Allow-Origin on error when Origin is not allowed", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/chat", {
        method: "POST",
        body: JSON.stringify({ message: "Hello" }),
        headers: {
          "Content-Type": "text/plain",
          Origin: "http://malicious.com",
        },
      }),
      env,
      ctx
    );
    expect(res.status).toBe(415);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });
});

describe("POST /chat request validation [P1-T2, rule 04.6]", () => {
  it("rejects request without Content-Type: application/json with 415", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/chat", {
        method: "POST",
        body: JSON.stringify({ message: "Hello" }),
        headers: { "Content-Type": "text/plain" },
      }),
      env,
      ctx
    );
    expect(res.status).toBe(415);
    const body = (await res.json()) as any;
    expect(body.type).toBe("error");
    expect(body.payload.code).toBe("INVALID_CONTENT_TYPE");
    expect(typeof body.payload.message).toBe("string");
  });

  it("rejects payload exceeding 4KB with 413", async () => {
    const oversizedMessage = "a".repeat(4097);
    const res = await worker.fetch(
      new Request("http://localhost/chat", {
        method: "POST",
        body: JSON.stringify({ message: oversizedMessage }),
        headers: { "Content-Type": "application/json" },
      }),
      env,
      ctx
    );
    expect(res.status).toBe(413);
    const body = (await res.json()) as any;
    expect(body.type).toBe("error");
    expect(body.payload.code).toBe("PAYLOAD_TOO_LARGE");
  });

  it("rejects malformed JSON body with 400", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/chat", {
        method: "POST",
        body: '{"message": unquoted',
        headers: { "Content-Type": "application/json" },
      }),
      env,
      ctx
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as any;
    expect(body.type).toBe("error");
    expect(body.payload.code).toBe("INVALID_JSON");
  });

  it("rejects non-object JSON body with 400", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/chat", {
        method: "POST",
        body: JSON.stringify(["message"]),
        headers: { "Content-Type": "application/json" },
      }),
      env,
      ctx
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as any;
    expect(body.type).toBe("error");
    expect(body.payload.code).toBe("INVALID_JSON");
  });

  it("rejects missing message field with 400", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/chat", {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      }),
      env,
      ctx
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as any;
    expect(body.type).toBe("error");
    expect(body.payload.code).toBe("VALIDATION_ERROR");
  });

  it("rejects empty or whitespace-only message with 400", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/chat", {
        method: "POST",
        body: JSON.stringify({ message: "   " }),
        headers: { "Content-Type": "application/json" },
      }),
      env,
      ctx
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as any;
    expect(body.type).toBe("error");
    expect(body.payload.code).toBe("VALIDATION_ERROR");
  });

  it("rejects message exceeding 2000 characters with 400", async () => {
    const longMessage = "a".repeat(2001);
    const res = await worker.fetch(
      new Request("http://localhost/chat", {
        method: "POST",
        body: JSON.stringify({ message: longMessage }),
        headers: { "Content-Type": "application/json" },
      }),
      env,
      ctx
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as any;
    expect(body.type).toBe("error");
    expect(body.payload.code).toBe("VALIDATION_ERROR");
  });

  it("rejects invalid session_id (>255 chars) with 400", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/chat", {
        method: "POST",
        body: JSON.stringify({ message: "hello", session_id: "s".repeat(256) }),
        headers: { "Content-Type": "application/json" },
      }),
      env,
      ctx
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as any;
    expect(body.type).toBe("error");
    expect(body.payload.code).toBe("VALIDATION_ERROR");
  });
});

describe("POST /chat method constraints [rule 04.14]", () => {
  it("rejects PUT /chat with 405 Method Not Allowed", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/chat", { method: "PUT" }),
      env,
      ctx
    );
    expect(res.status).toBe(405);
    const body = (await res.json()) as any;
    expect(body.type).toBe("error");
    expect(body.payload.code).toBe("METHOD_NOT_ALLOWED");
  });
});

describe("POST /chat rate limiting [P1-T2, Spec §4 M2]", () => {
  it("throttles requests when rate limit is exceeded", async () => {
    const customEnv: Env = {
      ...env,
      RATE_LIMIT_PER_MINUTE: "2",
    };

    const headers = {
      "Content-Type": "application/json",
      "CF-Connecting-IP": "192.0.2.1",
    };

    // First request
    const res1 = await worker.fetch(
      new Request("http://localhost/chat", {
        method: "POST",
        body: JSON.stringify({ message: "msg 1" }),
        headers,
      }),
      customEnv,
      ctx
    );
    expect(res1.status).not.toBe(429);

    // Second request
    const res2 = await worker.fetch(
      new Request("http://localhost/chat", {
        method: "POST",
        body: JSON.stringify({ message: "msg 2" }),
        headers,
      }),
      customEnv,
      ctx
    );
    expect(res2.status).not.toBe(429);

    // Third request (exceeds limit of 2)
    const res3 = await worker.fetch(
      new Request("http://localhost/chat", {
        method: "POST",
        body: JSON.stringify({ message: "msg 3" }),
        headers,
      }),
      customEnv,
      ctx
    );
    expect(res3.status).toBe(429);
    expect(res3.headers.get("Retry-After")).toBeDefined();
    const body = (await res3.json()) as any;
    expect(body.type).toBe("error");
    expect(body.payload.code).toBe("RATE_LIMITED");
  });

  it("defaults to 20 req/min when RATE_LIMIT_PER_MINUTE is not set", async () => {
    const defaultEnv: Env = {
      ...env,
      RATE_LIMIT_PER_MINUTE: undefined,
    };

    const headers = {
      "Content-Type": "application/json",
      "CF-Connecting-IP": "192.0.2.99",
    };

    // First request should be allowed under default limit of 20
    const res = await worker.fetch(
      new Request("http://localhost/chat", {
        method: "POST",
        body: JSON.stringify({ message: "default test" }),
        headers,
      }),
      defaultEnv,
      ctx
    );
    expect(res.status).toBe(503); // passes rate limit and reaches safety stub
  });
});

describe("Unhandled routes return safe generic 404s [rule 04.6, rule 04.14]", () => {
  it("returns 404 with exact frozen error envelope for unknown routes", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/unknown-route"),
      env,
      ctx
    );
    expect(res.status).toBe(404);
    const body = (await res.json()) as any;
    expect(body.type).toBe("error");
    expect(body.payload.code).toBe("NOT_FOUND");
    expect(body.payload.message).toBe("Resource not found");
  });
});

describe("POST /chat valid request & safety stub [P1-T2, rule 02.1]", () => {
  it("returns structured service unavailable response in P1-T2 without calling retrieval/generation", async () => {
    const res = await worker.fetch(
      new Request("http://localhost/chat", {
        method: "POST",
        body: JSON.stringify({ message: "How do I care for a newborn?" }),
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
      }),
      env,
      ctx
    );

    // In P1-T2, triage/generation is not implemented yet; returns safe 503 error envelope
    expect(res.status).toBe(503);
    expect(res.headers.get("Content-Type")).toMatch(/application\/json/);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:3000");

    const raw = await res.text();
    const body = JSON.parse(raw);
    expect(body.type).toBe("error");
    expect(body.payload.code).toBe("SERVICE_UNAVAILABLE");
    expect(body.payload.message).toContain("Service is currently unavailable");

    // Must not leak internal state
    assertNoEnvLeak(raw);
    assertNoInternalDetails(raw);
  });
});

describe("Top-level 500 error handler [rule 02-04, rule 04.14]", () => {
  function throwingUrlRequest(origin?: string): Request {
    const headers = new Headers();
    if (origin) headers.set("Origin", origin);
    return {
      headers,
      method: "POST",
      get url() {
        throw new Error("simulated unexpected failure");
      },
    } as unknown as Request;
  }

  it("returns 500 with frozen SERVER_ERROR envelope and CORS origin when allowed", async () => {
    const res = await worker.fetch(throwingUrlRequest("http://localhost:3000"), env, ctx);
    expect(res.status).toBe(500);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:3000");
    const raw = await res.text();
    const body = JSON.parse(raw);
    expect(body.type).toBe("error");
    expect(body.payload.code).toBe("SERVER_ERROR");
    expect(body.payload.message).toBe("Sorry, we're having trouble right now. Please try again or contact NHS 111.");
    assertNoEnvLeak(raw);
    assertNoInternalDetails(raw);
  });

  it("returns 500 with frozen SERVER_ERROR envelope and no CORS header when Origin is absent", async () => {
    const res = await worker.fetch(throwingUrlRequest(), env, ctx);
    expect(res.status).toBe(500);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
    const raw = await res.text();
    const body = JSON.parse(raw);
    expect(body.type).toBe("error");
    expect(body.payload.code).toBe("SERVER_ERROR");
    expect(body.payload.message).toBe("Sorry, we're having trouble right now. Please try again or contact NHS 111.");
    assertNoEnvLeak(raw);
    assertNoInternalDetails(raw);
  });
});