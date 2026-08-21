/**
 * M4 Retrieval module contract tests (P1-T6, TDD against the worker-dev brief).
 *
 * Spec task IDs / safety rules protected:
 *  - P1-T6 (Spec §4 M4): retrieve(env, query) -> { context, sources, confidence }.
 *  - Spec §4 M4 decision boundary: results below SIMILARITY_THRESHOLD (default
 *    0.5) must be filtered out so M5 never improvises on weak evidence.
 *  - Spec §4 M4 model check: embedding model identity is pinned to
 *    "@cf/baai/bge-base-en-v1.5" (rule 04.12 — a model change must be caught).
 *  - rule 04.14 / Spec §3.2 [3]: ANY retrieval failure (embedding, Vectorize,
 *    or D1) must fail SAFE to { context: "", sources: [], confidence: 0 } and
 *    NEVER throw into the request path. A retrieval outage must never surface
 *    as a 500 or leak internals.
 *
 * Expected module contract (worker-dev):
 *   src/retrieval/index.ts:
 *     retrieve(env, query): Promise<{ context: string; sources: string[]; confidence: number }>
 *       - embed via env.AI.run("@cf/baai/bge-base-en-v1.5", { text: query })
 *       - query env.VECTOR_INDEX.query(vector, { topK })
 *       - filter matches by env.SIMILARITY_THRESHOLD (default 0.5)
 *       - fetch chunk text + source_url from env.DB
 *       - return concatenated context + deduped source URLs + max similarity
 *       - ANY failure -> { context: "", sources: [], confidence: 0 } (never throws)
 */

import { describe, it, expect, vi } from "vitest";
import { retrieve, extractEmbedding } from "../src/retrieval/index";

const EMBEDDING_MODEL = "@cf/baai/bge-base-en-v1.5";

/* -------------------------------------------------------------------------- */
/* Mock env helpers                                                           */
/* -------------------------------------------------------------------------- */

interface ChunkRow {
  chunk_text: string;
  source_url: string;
}

/** D1 mock: prepare().bind(...ids).all() returns { results: [...], success: true, meta: {} }. */
function makeDb(rowsById: Record<string, ChunkRow>) {
  const prepare = vi.fn((sql?: string) => {
    if (sql && !sql.includes("FROM guidance_chunks")) {
      throw new Error(`no such table in query: ${sql}`);
    }
    return {
      bind: vi.fn((...ids: string[]) => ({
        all: vi.fn(() => ({
          results: ids.map((id) => rowsById[id]).filter(Boolean),
          success: true,
          meta: {},
        })),
      })),
    };
  });
  return prepare;
}

interface MockEnv {
  env: Record<string, unknown>;
  aiRun: ReturnType<typeof vi.fn>;
  vectorQuery: ReturnType<typeof vi.fn>;
  dbPrepare: ReturnType<typeof vi.fn>;
}

function makeEnv(overrides: Record<string, unknown> = {}): MockEnv {
  const aiRun = vi.fn();
  const vectorQuery = vi.fn();
  const dbPrepare = vi.fn();
  const env: Record<string, unknown> = {
    AI: { run: aiRun },
    VECTOR_INDEX: { query: vectorQuery },
    DB: { prepare: dbPrepare },
    SIMILARITY_THRESHOLD: "0.5",
    ...overrides,
  };
  return { env, aiRun, vectorQuery, dbPrepare };
}

/** Standard embedding payload shape returned by Workers AI bge-base-en-v1.5. */
function embeddingResult(dim = 768): { data: { embedding: number[] }[] } {
  return { data: [{ embedding: Array.from({ length: dim }, (_, i) => (i + 1) / 10) }] };
}

const SAFE_EMPTY = { context: "", sources: [], confidence: 0 };

/* -------------------------------------------------------------------------- */
/* 1. Happy path                                                              */
/* -------------------------------------------------------------------------- */

describe("retrieve happy path [P1-T6, Spec §4 M4]", () => {
  it("returns concatenated context, deduped sources, and confidence = max similarity", async () => {
    const { env, aiRun, vectorQuery, dbPrepare } = makeEnv();

    aiRun.mockResolvedValue(embeddingResult());
    vectorQuery.mockResolvedValue({
      matches: [
        { id: "chunk-a", score: 0.90 },
        { id: "chunk-b", score: 0.88 },
        { id: "chunk-c", score: 0.85 },
      ],
    });
    // chunk-a and chunk-b share a source URL -> sources must be deduped.
    dbPrepare.mockImplementation((sql: string) => {
      if (!sql.includes("FROM guidance_chunks")) {
        throw new Error(`no such table in query: ${sql}`);
      }
      return {
        bind: vi.fn(() => ({
          all: vi.fn(() => ({
            results: [
              { chunk_text: "Chunk A text.", source_url: "https://www.nhs.uk/a" },
              { chunk_text: "Chunk B text.", source_url: "https://www.nhs.uk/a" },
              { chunk_text: "Chunk C text.", source_url: "https://www.nhs.uk/b" },
            ],
            success: true,
            meta: {},
          })),
        })),
      };
    });

    const result = await retrieve(env, "how do i prepare baby formula safely");

    // context concatenates every above-threshold chunk's text
    expect(result.context).toContain("Chunk A text.");
    expect(result.context).toContain("Chunk B text.");
    expect(result.context).toContain("Chunk C text.");

    // sources are deduped source URLs
    expect(result.sources).toEqual([
      "https://www.nhs.uk/a",
      "https://www.nhs.uk/b",
    ]);

    // confidence is the max similarity across retained matches
    expect(result.confidence).toBe(0.9);
  });
});

/* -------------------------------------------------------------------------- */
/* 2. Threshold filtering                                                      */
/* -------------------------------------------------------------------------- */

describe("retrieve similarity threshold [P1-T6, Spec §4 M4 decision boundary]", () => {
  it("filters out matches below SIMILARITY_THRESHOLD (default 0.5)", async () => {
    const { env, aiRun, vectorQuery, dbPrepare } = makeEnv();

    aiRun.mockResolvedValue(embeddingResult());
    vectorQuery.mockResolvedValue({
      matches: [
        { id: "good", score: 0.8 },
        { id: "weak", score: 0.3 }, // below 0.5 -> must be dropped
      ],
    });
    dbPrepare.mockImplementation((sql: string) => {
      if (!sql.includes("FROM guidance_chunks")) {
        throw new Error(`no such table in query: ${sql}`);
      }
      return {
        bind: vi.fn(() => ({
          all: vi.fn(() => ({
            results: [
              { chunk_text: "Good chunk.", source_url: "https://www.nhs.uk/good" },
              { chunk_text: "Weak chunk.", source_url: "https://www.nhs.uk/weak" },
            ],
            success: true,
            meta: {},
          })),
        })),
      };
    });

    const result = await retrieve(env, "safe parenting question");

    expect(result.context).toContain("Good chunk.");
    expect(result.context).not.toContain("Weak chunk.");
    expect(result.sources).toEqual(["https://www.nhs.uk/good"]);
    expect(result.confidence).toBe(0.8);
  });

  it("honours an env-configurable SIMILARITY_THRESHOLD", async () => {
    const { env, aiRun, vectorQuery, dbPrepare } = makeEnv({
      SIMILARITY_THRESHOLD: "0.8",
    });

    aiRun.mockResolvedValue(embeddingResult());
    vectorQuery.mockResolvedValue({
      matches: [
        { id: "high", score: 0.9 },
        { id: "mid", score: 0.7 }, // below 0.8 -> dropped
      ],
    });
    dbPrepare.mockImplementation((sql: string) => {
      if (!sql.includes("FROM guidance_chunks")) {
        throw new Error(`no such table in query: ${sql}`);
      }
      return {
        bind: vi.fn(() => ({
          all: vi.fn(() => ({
            results: [
              { chunk_text: "High chunk.", source_url: "https://www.nhs.uk/high" },
              { chunk_text: "Mid chunk.", source_url: "https://www.nhs.uk/mid" },
            ],
            success: true,
            meta: {},
          })),
        })),
      };
    });

    const result = await retrieve(env, "safe parenting question");

    expect(result.context).toContain("High chunk.");
    expect(result.context).not.toContain("Mid chunk.");
    expect(result.sources).toEqual(["https://www.nhs.uk/high"]);
  });

  it("returns the safe empty result when every match is below threshold", async () => {
    const { env, aiRun, vectorQuery } = makeEnv();

    aiRun.mockResolvedValue(embeddingResult());
    vectorQuery.mockResolvedValue({ matches: [{ id: "weak", score: 0.2 }] });

    const result = await retrieve(env, "obscure question");
    expect(result).toEqual(SAFE_EMPTY);
  });
});

/* -------------------------------------------------------------------------- */
/* 3. Embedding model identity                                                */
/* -------------------------------------------------------------------------- */

describe("retrieve embedding model identity [P1-T6, Spec §4 M4 model check, rule 04.12]", () => {
  it('calls AI.run with exactly "@cf/baai/bge-base-en-v1.5"', async () => {
    const { env, aiRun, vectorQuery, dbPrepare } = makeEnv();

    aiRun.mockResolvedValue(embeddingResult());
    vectorQuery.mockResolvedValue({ matches: [] });
    dbPrepare.mockImplementation((sql: string) => {
      if (!sql.includes("FROM guidance_chunks")) {
        throw new Error(`no such table in query: ${sql}`);
      }
      return {
        bind: vi.fn(() => ({ all: vi.fn(() => ({ results: [], success: true, meta: {} })) })),
      };
    });

    await retrieve(env, "how do i settle a newborn");

    // protects rule 04.12 — a model change must be caught by this gate.
    expect(aiRun).toHaveBeenCalledTimes(1);
    expect(aiRun.mock.calls[0][0]).toBe(EMBEDDING_MODEL);
  });
});

/* -------------------------------------------------------------------------- */
/* 4-6. Failure fail-safe                                                     */
/* -------------------------------------------------------------------------- */

describe("retrieve failure fail-safe [P1-T6, rule 04.14, Spec §3.2 [3]]", () => {
  it("returns safe empty result when AI.run throws, and never throws", async () => {
    const { env, aiRun } = makeEnv();
    aiRun.mockRejectedValue(new Error("SIMULATED-EMBEDDING-FAILURE"));

    // Must not reject: a rejection here would fail the test with the raw
    // error, proving rule 04.14 (retrieval never throws into the request path).
    const result = await retrieve(env, "safe question");
    expect(result).toEqual(SAFE_EMPTY);
  });

  it("returns safe empty result when VECTOR_INDEX.query throws, and never throws", async () => {
    const { env, aiRun, vectorQuery } = makeEnv();
    aiRun.mockResolvedValue(embeddingResult());
    vectorQuery.mockRejectedValue(new Error("SIMULATED-VECTORIZE-FAILURE"));

    // Must not reject: a rejection here would fail the test with the raw
    // error, proving rule 04.14 (retrieval never throws into the request path).
    const result = await retrieve(env, "safe question");
    expect(result).toEqual(SAFE_EMPTY);
  });

  it("returns safe empty result when DB throws, and never throws", async () => {
    const { env, aiRun, vectorQuery, dbPrepare } = makeEnv();
    aiRun.mockResolvedValue(embeddingResult());
    vectorQuery.mockResolvedValue({ matches: [{ id: "chunk-a", score: 0.9 }] });
    dbPrepare.mockImplementation(() => ({
      bind: vi.fn(() => ({
        all: vi.fn(() => {
          throw new Error("SIMULATED-D1-FAILURE");
        }),
      })),
    }));

    // Must not reject: a rejection here would fail the test with the raw
    // error, proving rule 04.14 (retrieval never throws into the request path).
    const result = await retrieve(env, "safe question");
    expect(result).toEqual(SAFE_EMPTY);
  });
});

/* -------------------------------------------------------------------------- */
/* 7. Empty / whitespace query                                                */
/* -------------------------------------------------------------------------- */

describe("retrieve empty query [P1-T6, rule 04.14]", () => {
  it.each(["", "   ", "\t\n"])(
    "returns safe empty result for %j without calling AI",
    async (query) => {
      const { env, aiRun } = makeEnv();
      const result = await retrieve(env, query);
      expect(result).toEqual(SAFE_EMPTY);
      expect(aiRun).not.toHaveBeenCalled();
    }
  );
});

/* -------------------------------------------------------------------------- */
/* 7. Embedding-model identity gate [SafetyBatch F3, rule 04.12]              */
/* -------------------------------------------------------------------------- */

describe("Embedding-model identity gate [SafetyBatch F3, rule 04.12]", () => {
  it("fails closed when EXPECTED_EMBEDDING_MODEL differs — zero AI and Vectorize calls", async () => {
    const { env, aiRun, vectorQuery } = makeEnv({
      EXPECTED_EMBEDDING_MODEL: "@cf/baai/wrong-model",
    });

    const result = await retrieve(env, "safe question");

    expect(result).toEqual(SAFE_EMPTY);
    expect(aiRun).not.toHaveBeenCalled();
    expect(vectorQuery).not.toHaveBeenCalled();
  });

  it("proceeds normally when EXPECTED_EMBEDDING_MODEL matches the pinned model", async () => {
    const { env, aiRun, vectorQuery, dbPrepare } = makeEnv({
      EXPECTED_EMBEDDING_MODEL: EMBEDDING_MODEL,
    });

    aiRun.mockResolvedValue(embeddingResult());
    vectorQuery.mockResolvedValue({ matches: [] });
    dbPrepare.mockImplementation((sql: string) => {
      if (!sql.includes("FROM guidance_chunks")) {
        throw new Error(`no such table in query: ${sql}`);
      }
      return {
        bind: vi.fn(() => ({ all: vi.fn(() => ({ results: [], success: true, meta: {} })) })),
      };
    });

    const result = await retrieve(env, "safe question");

    expect(aiRun).toHaveBeenCalledTimes(1);
    expect(result.confidence).toBe(0); // no matches above threshold
    expect(result.context).toBe("");
  });

  it("fails closed on a wrong-dimension embedding vector — Vectorize never queried", async () => {
    const { env, aiRun, vectorQuery } = makeEnv();

    aiRun.mockResolvedValue(embeddingResult(767));

    const result = await retrieve(env, "safe question");

    expect(result).toEqual(SAFE_EMPTY);
    expect(vectorQuery).not.toHaveBeenCalled();
  });

  it("fails closed when the embedding response contains no vector", async () => {
    const { env, aiRun, vectorQuery } = makeEnv();

    aiRun.mockResolvedValue({});

    const result = await retrieve(env, "safe question");

    expect(result).toEqual(SAFE_EMPTY);
    expect(vectorQuery).not.toHaveBeenCalled();
  });
});

/* -------------------------------------------------------------------------- */
/* 8. Real Workers AI embedding response shape regression [P1-T6, rule 04.12] */
/* -------------------------------------------------------------------------- */

describe("Real Workers AI embedding response shape regression [P1-T6, rule 04.12, Spec §4 M4]", () => {
  // Recorded fixture from Cloudflare Workers AI @cf/baai/bge-base-en-v1.5 REST / worker response
  const RECORDED_AI_FIXTURE = {
    result: {
      data: [
        [
          0.00789642333984375,
          0.043792724609375,
          0.0745849609375,
          0.050689697265625,
          ...Array.from({ length: 764 }, (_, i) => ((i % 50) - 25) / 100),
        ],
      ],
      shape: [1, 768],
      pooling: "mean",
    },
    success: true,
  };

  it("extractEmbedding succeeds on real Cloudflare Workers AI shape { data: [[...768 numbers]] }", () => {
    // env.AI.run in worker returns the inner result payload: { data: [[...]] }
    const workerAiResult = {
      data: RECORDED_AI_FIXTURE.result.data,
      shape: [1, 768],
    };

    const vector = extractEmbedding(workerAiResult);
    expect(vector).not.toBeNull();
    expect(vector?.length).toBe(768);
    expect(vector?.[0]).toBe(0.00789642333984375);
    expect(vector?.[1]).toBe(0.043792724609375);
  });

  it("extractEmbedding succeeds on legacy/mock shape { data: [{ embedding: [...] }] }", () => {
    const legacyResult = embeddingResult();
    const vector = extractEmbedding(legacyResult);
    expect(vector).not.toBeNull();
    expect(vector?.length).toBe(768);
  });

  it("retrieve() succeeds end-to-end with real Workers AI response shape { data: [[...768 numbers]] }", async () => {
    const { env, aiRun, vectorQuery, dbPrepare } = makeEnv();

    aiRun.mockResolvedValue({
      data: RECORDED_AI_FIXTURE.result.data,
    });
    vectorQuery.mockResolvedValue({
      matches: [{ id: "chunk-1", score: 0.92 }],
    });
    dbPrepare.mockImplementation((sql: string) => {
      if (!sql.includes("FROM guidance_chunks")) {
        throw new Error(`no such table in query: ${sql}`);
      }
      return {
        bind: vi.fn(() => ({
          all: vi.fn(() => ({
            results: [
              { chunk_text: "Clean guidance text.", source_url: "https://www.nhs.uk/guidance" },
            ],
            success: true,
            meta: {},
          })),
        })),
      };
    });

    const result = await retrieve(env, "how do i make formula");
    expect(result.confidence).toBe(0.92);
    expect(result.context).toBe("Clean guidance text.");
    expect(result.sources).toEqual(["https://www.nhs.uk/guidance"]);
  });

  it("extractEmbedding rejects malformed or wrong-dimension arrays", () => {
    expect(extractEmbedding({ data: [[1, 2, 3]] })).toBeNull();
    expect(extractEmbedding({ data: [Array.from({ length: 768 }, (_, i) => (i === 10 ? "not-a-number" : i))] })).toBeNull();
    expect(extractEmbedding({ data: [Array.from({ length: 768 }, (_, i) => (i === 10 ? NaN : i))] })).toBeNull();
    expect(extractEmbedding(null)).toBeNull();
    expect(extractEmbedding(undefined)).toBeNull();
    expect(extractEmbedding("invalid")).toBeNull();
  });
});

/* -------------------------------------------------------------------------- */
/* 9. D1 all() result unboxing [P1-T9, rule 04.18]                             */
/* -------------------------------------------------------------------------- */

describe("D1 all() result unboxing [P1-T9, rule 04.18]", () => {
  it("retrieve() succeeds when D1 all() returns the real Cloudflare { results: [...] } object", async () => {
    const { env, aiRun, vectorQuery, dbPrepare } = makeEnv();

    aiRun.mockResolvedValue(embeddingResult());
    vectorQuery.mockResolvedValue({
      matches: [{ id: "chunk-d1-test", score: 0.89 }],
    });
    dbPrepare.mockImplementation((sql: string) => {
      if (!sql.includes("FROM guidance_chunks")) {
        throw new Error(`no such table in query: ${sql}`);
      }
      return {
        bind: vi.fn(() => ({
          all: vi.fn(() => ({
            results: [
              {
                chunk_text: "Unboxed D1 guidance text.",
                source_url: "https://www.nhs.uk/formula-prep",
              },
            ],
            success: true,
            meta: { duration: 1.2 },
          })),
        })),
      };
    });

    const result = await retrieve(env, "how do i make formula");
    expect(result.confidence).toBe(0.89);
    expect(result.context).toBe("Unboxed D1 guidance text.");
    expect(result.sources).toEqual(["https://www.nhs.uk/formula-prep"]);
  });
});

/* -------------------------------------------------------------------------- */
/* 10. Relative Citation Relevance Margin [P2-CIT, Spec §4 M4]                */
/* -------------------------------------------------------------------------- */

describe("Relative Citation Relevance Margin [P2-CIT, Spec §4 M4]", () => {
  it("filters out low-scoring trailing chunks outside the relevance margin (default 0.08)", async () => {
    const { env, aiRun, vectorQuery, dbPrepare } = makeEnv();

    aiRun.mockResolvedValue(embeddingResult());
    vectorQuery.mockResolvedValue({
      matches: [
        { id: "chunk-1", score: 0.88 }, // primary match (kept)
        { id: "chunk-2", score: 0.82 }, // within 0.08 margin (0.88 - 0.08 = 0.80) (kept)
        { id: "chunk-3", score: 0.68 }, // below 0.80 margin threshold (filtered out)
      ],
    });

    dbPrepare.mockImplementation(() => ({
      bind: vi.fn(() => ({
        all: vi.fn(() => ({
          results: [
            { chunk_text: "Primary formula prep chunk.", source_url: "https://www.nhs.uk/formula" },
            { chunk_text: "Sterilising bottles chunk.", source_url: "https://www.nhs.uk/sterilise" },
            { chunk_text: "Tangential sleep chunk.", source_url: "https://www.nhs.uk/sleep" },
          ],
          success: true,
          meta: {},
        })),
      })),
    }));

    const result = await retrieve(env, "how do i make up formula");
    expect(result.confidence).toBe(0.88);
    expect(result.context).toContain("Primary formula prep chunk.");
    expect(result.context).toContain("Sterilising bottles chunk.");
    expect(result.context).not.toContain("Tangential sleep chunk.");
    expect(result.sources).toEqual([
      "https://www.nhs.uk/formula",
      "https://www.nhs.uk/sterilise",
    ]);
  });

  it("respects custom RELEVANCE_MARGIN from environment", async () => {
    const { env, aiRun, vectorQuery, dbPrepare } = makeEnv({
      RELEVANCE_MARGIN: "0.25",
    });

    aiRun.mockResolvedValue(embeddingResult());
    vectorQuery.mockResolvedValue({
      matches: [
        { id: "chunk-1", score: 0.88 },
        { id: "chunk-2", score: 0.68 }, // 0.88 - 0.25 = 0.63 -> 0.68 >= 0.63 (kept under custom margin)
      ],
    });

    dbPrepare.mockImplementation(() => ({
      bind: vi.fn(() => ({
        all: vi.fn(() => ({
          results: [
            { chunk_text: "Primary chunk.", source_url: "https://www.nhs.uk/primary" },
            { chunk_text: "Broader chunk.", source_url: "https://www.nhs.uk/broader" },
          ],
          success: true,
          meta: {},
        })),
      })),
    }));

    const result = await retrieve(env, "test query");
    expect(result.sources).toEqual([
      "https://www.nhs.uk/primary",
      "https://www.nhs.uk/broader",
    ]);
  });
});

/* -------------------------------------------------------------------------- */
/* 11. Safety-Relevant Context Flagging [P2-CIT, rule 02.15]                   */
/* -------------------------------------------------------------------------- */

describe("Safety-Relevant Context Flagging [P2-CIT, Spec §4 M4, rule 02.15]", () => {
  it("prefixes safety_relevant chunks with [SAFETY WARNING]", async () => {
    const { env, aiRun, vectorQuery, dbPrepare } = makeEnv();

    aiRun.mockResolvedValue(embeddingResult());
    vectorQuery.mockResolvedValue({
      matches: [
        { id: "chunk-safe-1", score: 0.85 },
        { id: "chunk-standard-2", score: 0.83 },
      ],
    });

    dbPrepare.mockImplementation(() => ({
      bind: vi.fn(() => ({
        all: vi.fn(() => ({
          results: [
            {
              chunk_text: "Emergency red flag guidance.",
              source_url: "https://www.nhs.uk/red-flags",
              safety_relevant: 1,
            },
            {
              chunk_text: "Routine advice text.",
              source_url: "https://www.nhs.uk/routine",
              safety_relevant: 0,
            },
          ],
          success: true,
          meta: {},
        })),
      })),
    }));

    const result = await retrieve(env, "baby symptoms");
    expect(result.context).toContain("[SAFETY WARNING] Emergency red flag guidance.");
    expect(result.context).toContain("Routine advice text.");
    expect(result.context).not.toContain("[SAFETY WARNING] Routine advice text.");
  });
});
