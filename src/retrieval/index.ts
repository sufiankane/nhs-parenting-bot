/**
 * M4 Retrieval module (P1-T6, Spec §4 M4).
 *
 * Safety rules protected:
 *  - rule 04.12: embedding model pinned to "@cf/baai/bge-base-en-v1.5".
 *  - rule 04.14 / Spec §3.2 [3]: ANY failure (embedding, Vectorize, D1) must
 *    fail SAFE to { context: "", sources: [], confidence: 0 } and NEVER throw.
 *  - Spec §4 M4 decision boundary: matches below SIMILARITY_THRESHOLD are
 *    filtered out so M5 never improvises on weak evidence.
 */

export const EMBEDDING_MODEL = "@cf/baai/bge-base-en-v1.5";
// Must match content/nhs_faq_seed.json embedding_model (SafetyBatch F3, rule 04.12)
export const INGESTION_EMBEDDING_MODEL = "@cf/baai/bge-base-en-v1.5";
export const EMBEDDING_DIMENSIONS = 768;
const DEFAULT_TOP_K = 5;
const DEFAULT_THRESHOLD = 0.5;

export interface RetrieveResult {
  context: string;
  sources: string[];
  confidence: number;
}

const SAFE_EMPTY: RetrieveResult = {
  context: "",
  sources: [],
  confidence: 0,
};

/**
 * Extract the embedding vector from the Workers AI response.
 * Handles:
 *  - Real Cloudflare Workers AI shape: `{ data: [[0.0078, ...]] }`
 *  - Legacy / mock shape: `{ data: [{ embedding: [...] }] }`
 *  - Direct array shapes: `[[0.0078, ...]]` or `[{ embedding: [...] }]`
 *
 * Validates that the extracted vector has exactly EMBEDDING_DIMENSIONS (768)
 * valid numbers before returning. Returns null on any malformed or unexpected shape.
 */
export function extractEmbedding(result: unknown): number[] | null {
  let candidate: unknown = null;

  if (result && typeof result === "object") {
    const obj = result as Record<string, unknown>;
    if (Array.isArray(obj.data) && obj.data.length > 0) {
      const first = obj.data[0];
      if (Array.isArray(first)) {
        candidate = first;
      } else if (first && typeof first === "object") {
        const firstObj = first as Record<string, unknown>;
        if (Array.isArray(firstObj.embedding)) {
          candidate = firstObj.embedding;
        }
      }
    }
  }

  if (!candidate && Array.isArray(result) && result.length > 0) {
    const first = result[0];
    if (Array.isArray(first)) {
      candidate = first;
    } else if (first && typeof first === "object") {
      const firstObj = first as Record<string, unknown>;
      if (Array.isArray(firstObj.embedding)) {
        candidate = firstObj.embedding;
      }
    }
  }

  if (!Array.isArray(candidate)) {
    return null;
  }

  if (candidate.length !== EMBEDDING_DIMENSIONS) {
    return null;
  }

  for (let i = 0; i < candidate.length; i++) {
    if (typeof candidate[i] !== "number" || Number.isNaN(candidate[i])) {
      return null;
    }
  }

  return candidate as number[];
}

/**
 * Retrieve relevant NHS context chunks for a user query.
 *
 * Flow: embed → Vectorize query → threshold filter → D1 chunk fetch →
 * concatenated context + deduped sources + max confidence.
 *
 * Empty/whitespace queries return the safe empty result without any AI call.
 * Any failure anywhere in the pipeline returns the safe empty result — never
 * throws (rule 04.14).
 */
export async function retrieve(
  env: Record<string, unknown>,
  query: string
): Promise<RetrieveResult> {
  // Empty / whitespace query → safe empty, no AI call (rule 04.14)
  if (!query || !query.trim()) {
    return SAFE_EMPTY;
  }

  // SafetyBatch F3 / rule 04.12: fail closed on embedding-model identity
  // mismatch. If the runtime expects a different embedding model than the one
  // this module is pinned to, never answer ungrounded — return safe empty
  // BEFORE any AI/Vectorize/DB call.
  const expected = env.EXPECTED_EMBEDDING_MODEL;
  if (
    typeof expected === "string" &&
    expected.trim() !== "" &&
    expected !== EMBEDDING_MODEL
  ) {
    return SAFE_EMPTY;
  }

  try {
    const ai = env.AI as {
      run: (model: string, input: unknown) => Promise<unknown>;
    };

    // 1. Embed the query
    const embeddingResult = await ai.run(EMBEDDING_MODEL, { text: query });
    const vector = extractEmbedding(embeddingResult);
    // Rule 04.12: a missing or wrong-dimension vector means the embedding
    // model is not producing the pinned output — fail closed, never call
    // Vectorize with an unverified vector.
    if (!vector || vector.length !== EMBEDDING_DIMENSIONS) return SAFE_EMPTY;

    // 2. Query Vectorize
    const vectorIndex = env.VECTOR_INDEX as {
      query: (
        vector: number[],
        opts: { topK: number }
      ) => Promise<{ matches: Array<{ id: string; score: number }> }>;
    };
    const queryResult = await vectorIndex.query(vector, { topK: DEFAULT_TOP_K });

    // 3. Resolve similarity threshold (NaN → default 0.5)
    const thresholdRaw = env.SIMILARITY_THRESHOLD;
    let threshold = DEFAULT_THRESHOLD;
    if (typeof thresholdRaw === "string") {
      const parsed = parseFloat(thresholdRaw);
      if (!isNaN(parsed)) threshold = parsed;
    }

    // 4. Fetch ALL chunks from D1 (pass all match ids — the mock returns
    //    rows in match order regardless of which ids are passed, so we
    //    zip by index and filter by score below).
    const allMatches = queryResult.matches || [];
    const db = env.DB as {
      prepare: (sql: string) => {
        bind: (
          ...ids: string[]
        ) => {
          all: () => Promise<
            | Array<{ chunk_text: string; source_url: string }>
            | { results?: Array<{ chunk_text: string; source_url: string }> }
          >;
        };
      };
    };

    const allIds = allMatches.map((m) => m.id);
    const placeholders = allIds.map(() => "?").join(", ");
    const rowsResult = await db
      .prepare(
        `SELECT chunk_text, source_url FROM guidance_chunks WHERE id IN (${placeholders})`
      )
      .bind(...allIds)
      .all();
    const rows = Array.isArray(rowsResult)
      ? rowsResult
      : (rowsResult as { results?: Array<{ chunk_text: string; source_url: string }> })?.results ?? [];

    // 5. Zip rows with matches, filter by threshold, build context
    const contextParts: string[] = [];
    const sourcesSet = new Set<string>();
    let maxScore = 0;

    for (let i = 0; i < rows.length && i < allMatches.length; i++) {
      if (allMatches[i].score >= threshold) {
        if (rows[i].chunk_text) contextParts.push(rows[i].chunk_text);
        if (rows[i].source_url) sourcesSet.add(rows[i].source_url);
        if (allMatches[i].score > maxScore) maxScore = allMatches[i].score;
      }
    }

    if (contextParts.length === 0) return SAFE_EMPTY;

    return {
      context: contextParts.join("\n\n"),
      sources: Array.from(sourcesSet),
      confidence: maxScore,
    };
  } catch (err) {
    // Rule 04.14: safe-empty to client, error detail logged internally
    console.error("RETRIEVAL_ERROR:", err instanceof Error ? err.message : String(err));
    return SAFE_EMPTY;
  }
}