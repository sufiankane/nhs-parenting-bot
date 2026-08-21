/**
 * /chat end-to-end flow tests (P1-T6, TDD against the worker-dev brief).
 *
 * Spec task IDs / safety rules protected:
 *  - P1-T6 (Spec �4 M2): wire M4 retrieval + M5 generation into /chat.
 *  - rule 02.1: EVERY inbound message passes M3 triage before retrieval or
 *    generation. Tier 1/2/3 must NEVER reach AI or Vectorize.
 *  - rule 02.2: Tier 1-3 responses come from M6 signposts, never the LLM.
 *  - Spec �4 M4 decision boundary: low retrieval confidence -> honest fallback
 *    (fallback_reason "low_confidence"), no generation call.
 *  - rule 02.9: session history written to KV with expirationTtl 86400 (24h).
 *  - rule 04.6 / Spec �4.0: the frozen SSE envelope and error envelope are
 *    preserved (malformed body still returns the frozen error envelope).
 *
 * These tests drive worker.fetch with a fully mocked env (AI, VECTOR_INDEX,
 * DB, SESSIONS) so no real Cloudflare bindings are required.
 */

import { describe, it, expect, vi } from "vitest";
import worker from "../src/index";

/* -------------------------------------------------------------------------- */
/* Mock KV (sessions.test.ts pattern)                                         */
/* -------------------------------------------------------------------------- */

class MockKv {
  readonly store = new Map<string, { value: string; expirationTtl?: number }>();
  readonly putCalls: Array<{
    key: string;
    value: string;
    options?: { expirationTtl?: number };
  }> = [];

  async get(key: string): Promise<string | null> {
    return this.store.get(key)?.value ?? null;
  }

  async put(
    key: string,
    value: string,
    options?: { expirationTtl?: number }
  ): Promise<void> {
    this.putCalls.push({ key, value, options });
    this.store.set(key, { value, expirationTtl: options?.expirationTtl });
  }
}

/* -------------------------------------------------------------------------- */
/* SSE helpers                                                                */
/* -------------------------------------------------------------------------- */

function sseStream(events: unknown[]): ReadableStream {
  const encoder = new TextEncoder();
  const body = events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join("");
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(body));
      controller.close();
    },
  });
}

async function readStream(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let out = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    out += decoder.decode(value, { stream: true });
  }
  return out;
}

async function readSse(res: Response): Promise<unknown[]> {
  const text = await res.text();
  return text
    .split("\n\n")
    .filter((block) => block.startsWith("data: "))
    .map((block) => JSON.parse(block.replace(/^data: /, "")));
}

/* -------------------------------------------------------------------------- */
/* Full mock env + ctx                                                        */
/* -------------------------------------------------------------------------- */

const EMBEDDING_MODEL = "@cf/baai/bge-base-en-v1.5";
const GENERATION_MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8-fast";

interface ChatHarness {
  env: Record<string, unknown>;
  aiRun: ReturnType<typeof vi.fn>;
  vectorQuery: ReturnType<typeof vi.fn>;
  dbPrepare: ReturnType<typeof vi.fn>;
  kv: MockKv;
  ctx: {
    waitUntil(p: Promise<unknown>): void;
    passThroughOnException?(): void;
  };
  waitUntilPromises: Promise<unknown>[];
}

function makeHarness(overrides: Record<string, unknown> = {}): ChatHarness {
  const aiRun = vi.fn();
  const vectorQuery = vi.fn();
  const dbPrepare = vi.fn();
  const kv = new MockKv();
  const waitUntilPromises: Promise<unknown>[] = [];

  const env: Record<string, unknown> = {
    AI: { run: aiRun },
    VECTOR_INDEX: { query: vectorQuery },
    DB: { prepare: dbPrepare },
    SESSIONS: kv,
    SIMILARITY_THRESHOLD: "0.5",
    RATE_LIMIT_PER_MINUTE: "20",
    ALLOWED_ORIGINS: "http://localhost:3000",
    ...overrides,
  };

  const ctx = {
    waitUntil(p: Promise<unknown>) {
      waitUntilPromises.push(p);
    },
    passThroughOnException() {},
  };

  return { env, aiRun, vectorQuery, dbPrepare, kv, ctx, waitUntilPromises };
}

function postChat(
  harness: ChatHarness,
  body: unknown,
  headers: Record<string, string> = {}
): Promise<Response> {
  return worker.fetch(
    new Request("http://localhost/chat", {
      method: "POST",
      body: typeof body === "string" ? body : JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        ...headers,
      },
    }),
    harness.env,
    harness.ctx
  );
}

/** Count AI.run calls for a specific model. */
function callsFor(aiRun: ReturnType<typeof vi.fn>, model: string): unknown[][] {
  return aiRun.mock.calls.filter((c) => c[0] === model);
}

/* -------------------------------------------------------------------------- */
/* 1. Tier 1 � signpost 999, zero AI / Vectorize                              */
/* -------------------------------------------------------------------------- */

describe("Tier 1 /chat flow [P1-T6, rule 02.1, rule 02.2]", () => {
  it('returns a signpost with contact "999" and done, and NEVER calls AI or Vectorize', async () => {
    const h = makeHarness();

    const res = await postChat(h, { message: "baby is not breathing" });
    expect(res.status).toBe(200);

    const events = await readSse(res);

    const signpost = events.find((e) => (e as any).type === "signpost") as any;
    expect(signpost).toBeDefined();
    expect(signpost.payload.tier).toBe(1);
    expect(signpost.payload.services[0].contact).toBe("999");

    const done = events.find((e) => (e as any).type === "done") as any;
    expect(done).toBeDefined();

    // protects rule 02.1/02.2 � Tier 1 must never reach retrieval or generation.
    expect(h.aiRun).not.toHaveBeenCalled();
    expect(h.vectorQuery).not.toHaveBeenCalled();
  });
});

/* -------------------------------------------------------------------------- */
/* 2. Tier 2 and Tier 3 � correct signposts, zero AI                          */
/* -------------------------------------------------------------------------- */

describe("Tier 2 and Tier 3 /chat flow [P1-T6, rule 02.1, rule 02.2]", () => {
  it("Tier 2 returns NHS 111 signpost with zero AI calls", async () => {
    const h = makeHarness();
    const res = await postChat(h, { message: "my 6 week old baby fever 38" });
    const events = await readSse(res);

    const signpost = events.find((e) => (e as any).type === "signpost") as any;
    expect(signpost.payload.tier).toBe(2);
    expect(signpost.payload.services[0].contact).toBe("111");

    expect(h.aiRun).not.toHaveBeenCalled();
    expect(h.vectorQuery).not.toHaveBeenCalled();
  });

  it("Tier 3 returns NSPCC signpost with zero AI calls", async () => {
    const h = makeHarness();
    const res = await postChat(h, { message: "my partner hurts me" });
    const events = await readSse(res);

    const signpost = events.find((e) => (e as any).type === "signpost") as any;
    expect(signpost.payload.tier).toBe(3);
    expect(signpost.payload.services[0].contact).toBe(
      "0808 800 5000 / help@nspcc.org.uk"
    );

    expect(h.aiRun).not.toHaveBeenCalled();
    expect(h.vectorQuery).not.toHaveBeenCalled();
  });
});

/* -------------------------------------------------------------------------- */
/* 3. Tier 4 � good retrieval -> token stream + done                          */
/* -------------------------------------------------------------------------- */

describe("Tier 4 /chat flow with good retrieval [P1-T6]", () => {
  it("streams token events then done with sources and session_id", async () => {
    const h = makeHarness();

    // Embedding call (retrieval) vs generation call (llama) distinguished by model.
    h.aiRun.mockImplementation(async (model: string) => {
      if (model === EMBEDDING_MODEL) {
        return { data: [{ embedding: Array.from({ length: 768 }, (_, i) => (i % 10) / 10) }] };
      }
      if (model === GENERATION_MODEL) {
        return sseStream([{ type: "token", payload: { text: "Hello" } }]);
      }
      throw new Error("unknown model");
    });
    h.vectorQuery.mockResolvedValue({
      matches: [{ id: "chunk-a", score: 0.9 }],
    });
    h.dbPrepare.mockImplementation(() => ({
      bind: vi.fn(() => ({
        all: vi.fn(() => [
          {
            chunk_text: "SYNTHETIC-FIXTURE: formula guidance.",
            source_url: "https://www.nhs.uk/formula",
          },
        ]),
      })),
    }));

    const res = await postChat(h, {
      message: "how do i prepare baby formula safely",
    });
    expect(res.status).toBe(200);

    const events = await readSse(res);

    const tokens = events.filter((e) => (e as any).type === "token");
    expect(tokens.length).toBeGreaterThan(0);

    const done = events[events.length - 1] as any;
    expect(done.type).toBe("done");
    expect(done.payload.sources).toContain("https://www.nhs.uk/formula");
    expect(typeof done.payload.session_id).toBe("string");
    expect(done.payload.session_id.length).toBeGreaterThan(0);
  });
});

/* -------------------------------------------------------------------------- */
/* 4. Tier 4 � low confidence -> fallback, no generation                      */
/* -------------------------------------------------------------------------- */

describe("Tier 4 /chat flow with low confidence [P1-T6, Spec �4 M4 decision boundary]", () => {
  it("returns done with fallback_reason low_confidence and makes no generation call", async () => {
    const h = makeHarness();

    h.aiRun.mockImplementation(async (model: string) => {
      if (model === EMBEDDING_MODEL) {
        return { data: [{ embedding: Array.from({ length: 768 }, (_, i) => (i % 10) / 10) }] };
      }
      throw new Error("generation must not be called");
    });
    // similarity 0.3 is below the 0.5 threshold -> low confidence fallback.
    h.vectorQuery.mockResolvedValue({
      matches: [{ id: "chunk-a", score: 0.3 }],
    });

    const res = await postChat(h, { message: "some obscure question" });
    expect(res.status).toBe(200);

    const events = await readSse(res);
    const done = events.find((e) => (e as any).type === "done") as any;
    expect(done).toBeDefined();
    expect(done.payload.fallback).toBe(true);
    expect(done.payload.fallback_reason).toBe("low_confidence");

    // protects Spec �4 M4 � no generation call on low confidence.
    expect(callsFor(h.aiRun, GENERATION_MODEL)).toHaveLength(0);
  });
});

/* -------------------------------------------------------------------------- */
/* 5. Session KV put with 24h TTL via waitUntil                               */
/* -------------------------------------------------------------------------- */

describe("Session persistence [P1-T6, rule 02.9]", () => {
  it("writes the session to KV with expirationTtl 86400 via waitUntil", async () => {
    const h = makeHarness();

    h.aiRun.mockImplementation(async (model: string) => {
      if (model === EMBEDDING_MODEL) {
        return { data: [{ embedding: Array.from({ length: 768 }, (_, i) => (i % 10) / 10) }] };
      }
      if (model === GENERATION_MODEL) {
        return sseStream([{ type: "token", payload: { text: "Hi" } }]);
      }
      throw new Error("unknown model");
    });
    h.vectorQuery.mockResolvedValue({
      matches: [{ id: "chunk-a", score: 0.9 }],
    });
    h.dbPrepare.mockImplementation(() => ({
      bind: vi.fn(() => ({
        all: vi.fn(() => [
          {
            chunk_text: "SYNTHETIC-FIXTURE: guidance.",
            source_url: "https://www.nhs.uk/x",
          },
        ]),
      })),
    }));

    const res = await postChat(h, { message: "how do i settle a newborn" });
    const events = await readSse(res);
    const done = events.find((e) => (e as any).type === "done") as any;
    const sessionId = done.payload.session_id as string;

    // The session write is deferred via ctx.waitUntil � await it.
    await Promise.all(h.waitUntilPromises);

    const sessionPuts = h.kv.putCalls.filter((c) =>
      c.key.startsWith("session:")
    );
    expect(sessionPuts.length).toBeGreaterThan(0);

    // protects rule 02.9 � every session put must carry the 24h TTL.
    const sessionPut = sessionPuts.find((c) => c.key === `session:${sessionId}`);
    expect(sessionPut).toBeDefined();
    expect(sessionPut!.options?.expirationTtl).toBe(86400);
  });
});

/* -------------------------------------------------------------------------- */
/* 6. Malformed body -> frozen error envelope (existing behaviour preserved)  */
/* -------------------------------------------------------------------------- */

describe("Malformed body error envelope [P1-T6, rule 04.6, Spec �4.0]", () => {
  it("returns the frozen INVALID_JSON error envelope for malformed JSON", async () => {
    const h = makeHarness();
    const res = await postChat(h, '{"message": unquoted');
    expect(res.status).toBe(400);

    const body = (await res.json()) as any;
    expect(body.type).toBe("error");
    expect(body.payload.code).toBe("INVALID_JSON");
    expect(typeof body.payload.message).toBe("string");
  });
});

/* -------------------------------------------------------------------------- */
/* 7. Multi-Turn Session Flow [P2-T4, Spec §4 M5]                             */
/* -------------------------------------------------------------------------- */

describe("Multi-turn Session Flow [P2-T4, Spec §4 M5]", () => {
  it("loads existing session history and passes it to generation", async () => {
    const h = makeHarness();
    const existingSessionId = "existing-uuid-999";

    // Pre-populate KV with existing session history
    await h.kv.put(
      `session:${existingSessionId}`,
      JSON.stringify({
        session_id: existingSessionId,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        messages: [
          { role: "user", content: "My baby is 2 months old", at: new Date().toISOString() },
        ],
      })
    );

    h.aiRun.mockImplementation((model: string) => {
      if (model === EMBEDDING_MODEL) {
        return Promise.resolve({ data: [Array(768).fill(0.01)] });
      }
      if (model === GENERATION_MODEL) {
        return Promise.resolve(
          sseStream([
            { type: "token", payload: { text: "Follow up answer." } },
            { type: "done", payload: { session_id: existingSessionId, sources: [] } },
          ])
        );
      }
      throw new Error(`Unexpected model: ${model}`);
    });

    h.vectorQuery.mockResolvedValue({
      matches: [{ id: "chunk-1", score: 0.9 }],
    });

    h.dbPrepare.mockImplementation(() => ({
      bind: vi.fn(() => ({
        all: vi.fn(() => ({
          results: [
            {
              chunk_text: "SYNTHETIC-FIXTURE: feeding guidance.",
              source_url: "https://www.nhs.uk/feeding",
            },
          ],
          success: true,
          meta: {},
        })),
      })),
    }));

    const res = await postChat(h, {
      session_id: existingSessionId,
      message: "How much should he drink?",
    });

    expect(res.status).toBe(200);
    const events = await readSse(res);
    expect(events.length).toBeGreaterThan(0);

    // Verify AI generation call received structured history
    const genCall = h.aiRun.mock.calls.find((c) => c[0] === GENERATION_MODEL);
    expect(genCall).toBeDefined();
    const userMsg = genCall![1].messages.find((m: any) => m.role === "user");
    expect(userMsg.content).toContain("Previous conversation turns");
    expect(userMsg.content).toContain('User: "My baby is 2 months old"');
  });
});
