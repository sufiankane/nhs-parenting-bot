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
import { retrieve } from "../src/retrieval/index";

const EMBEDDING_MODEL = "@cf/baai/bge-base-en-v1.5";

/* -------------------------------------------------------------------------- */
/* Mock env helpers                                                           */
/* -------------------------------------------------------------------------- */

interface ChunkRow {
  chunk_text: string;
  source_url: string;
}

/** D1 mock: prepare().bind(...ids).all() returns rows for the bound ids. */
function makeDb(rowsById: Record<string, ChunkRow>) {
  const prepare = vi.fn(() => ({
    bind: vi.fn((...ids: string[]) => ({
      all: vi.fn(() => ids.map((id) => rowsById[id]).filter(Boolean)),
    })),
  }));
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
function embeddingResult(dim = 4): { data: { embedding: number[] }[] } {
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
        { id: "chunk-a", score: 0.9 },
        { id: "chunk-b", score: 0.7 },
        { id: "chunk-c", score: 0.6 },
      ],
    });
    // chunk-a and chunk-b share a source URL -> sources must be deduped.
    dbPrepare.mockImplementation(() => ({
      bind: vi.fn(() => ({
        all: vi.fn(() => [
          { chunk_text: "Chunk A text.", source_url: "https://www.nhs.uk/a" },
          { chunk_text: "Chunk B text.", source_url: "https://www.nhs.uk/a" },
          { chunk_text: "Chunk C text.", source_url: "https://www.nhs.uk/b" },
        ]),
      })),
    }));

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
    dbPrepare.mockImplementation(() => ({
      bind: vi.fn(() => ({
        all: vi.fn(() => [
          { chunk_text: "Good chunk.", source_url: "https://www.nhs.uk/good" },
          { chunk_text: "Weak chunk.", source_url: "https://www.nhs.uk/weak" },
        ]),
      })),
    }));

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
    dbPrepare.mockImplementation(() => ({
      bind: vi.fn(() => ({
        all: vi.fn(() => [
          { chunk_text: "High chunk.", source_url: "https://www.nhs.uk/high" },
          { chunk_text: "Mid chunk.", source_url: "https://www.nhs.uk/mid" },
        ]),
      })),
    }));

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
    dbPrepare.mockImplementation(() => ({
      bind: vi.fn(() => ({ all: vi.fn(() => []) })),
    }));

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
