/**
 * M7 Ingestion Worker & Queue Processor (Spec §4 M7, P2-T2).
 *
 * Safety rules protected:
 *  - rule 02.15: Exact clinical text preservation; deterministic SHA-256 provenance.
 *  - rule 04.12: Pinned embedding model "@cf/baai/bge-base-en-v1.5" (768-dim).
 *  - rule 04.14: Fail-safe audit logging on ingestion runs.
 */

import { chunkContent } from "./chunker";
import { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS } from "../retrieval/index";
import type { IngestJobPayload, IngestResult, IngestChunk } from "./types";

/**
 * Process a single ingestion job (from Queue or direct Admin trigger).
 */
export async function processIngestJob(
  env: Record<string, unknown>,
  job: IngestJobPayload
): Promise<IngestResult> {
  const batchId = job.batch_id || crypto.randomUUID();

  try {
    let rawContent = job.raw_content || "";

    // 1. Fetch from R2 if raw_r2_key is provided and R2 binding exists
    if (!rawContent && job.raw_r2_key && env.RAW_SOURCES) {
      const r2 = env.RAW_SOURCES as {
        get: (key: string) => Promise<{ text: () => Promise<string> } | null>;
      };
      const r2Object = await r2.get(job.raw_r2_key);
      if (r2Object) {
        rawContent = await r2Object.text();
      }
    }

    if (!rawContent.trim()) {
      return {
        success: false,
        batch_id: batchId,
        source_id: job.source_id,
        chunks_created: 0,
        chunks_skipped: 0,
        error: "Raw content is empty or could not be loaded from R2",
      };
    }

    // 2. Chunk text and compute SHA-256 hashes
    const chunks = await chunkContent(job, rawContent);
    if (chunks.length === 0) {
      return {
        success: true,
        batch_id: batchId,
        source_id: job.source_id,
        chunks_created: 0,
        chunks_skipped: 0,
      };
    }

    // 3. Idempotent check: query D1 for existing chunks
    const db = env.DB as {
      prepare: (sql: string) => {
        bind: (...args: unknown[]) => {
          all: () => Promise<
            | Array<{ id: string; content_hash: string }>
            | { results?: Array<{ id: string; content_hash: string }> }
          >;
          run: () => Promise<unknown>;
        };
      };
    } | undefined;

    let existingIds = new Set<string>();
    if (db && typeof db.prepare === "function") {
      try {
        const placeholders = chunks.map(() => "?").join(", ");
        const d1Res = await db
          .prepare(`SELECT id, content_hash FROM guidance_chunks WHERE id IN (${placeholders})`)
          .bind(...chunks.map((c) => c.id))
          .all();
        const rows = Array.isArray(d1Res) ? d1Res : d1Res?.results ?? [];
        existingIds = new Set(rows.map((r) => r.id));
      } catch {
        // Table might be initializing or mock without guidance_chunks
      }
    }

    const newChunks = chunks.filter((c) => !existingIds.has(c.id));
    const skippedCount = chunks.length - newChunks.length;

    // 4. Generate embeddings and upsert into Vectorize & D1
    if (newChunks.length > 0) {
      const ai = env.AI as {
        run: (model: string, input: unknown) => Promise<unknown>;
      } | undefined;

      const vectorIndex = env.VECTOR_INDEX as {
        upsert: (vectors: Array<{ id: string; values: number[]; metadata?: Record<string, unknown> }>) => Promise<unknown>;
      } | undefined;

      const vectorsToUpsert: Array<{ id: string; values: number[]; metadata?: Record<string, unknown> }> = [];

      for (const chunk of newChunks) {
        let embedding: number[] | null = null;

        if (ai && typeof ai.run === "function") {
          try {
            const aiRes = (await ai.run(EMBEDDING_MODEL, { text: [chunk.chunk_text] })) as any;
            if (aiRes && Array.isArray(aiRes.data) && Array.isArray(aiRes.data[0])) {
              embedding = aiRes.data[0];
            } else if (aiRes && Array.isArray(aiRes.data) && aiRes.data[0]?.embedding) {
              embedding = aiRes.data[0].embedding;
            }
          } catch (err) {
            console.error("INGEST_EMBED_ERROR:", err instanceof Error ? err.message : String(err));
          }
        }

        if (embedding && embedding.length === EMBEDDING_DIMENSIONS) {
          vectorsToUpsert.push({
            id: chunk.id,
            values: embedding,
            metadata: {
              source_id: chunk.source_id,
              category: chunk.category,
              safety_relevant: chunk.safety_relevant ? 1 : 0,
            },
          });
        }

        // Insert into D1
        if (db && typeof db.prepare === "function") {
          try {
            await db
              .prepare(
                `INSERT OR REPLACE INTO guidance_chunks (id, source_id, source_url, title, category, chunk_text, chunk_index, token_count, safety_relevant, attribution, content_hash, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
              )
              .bind(
                chunk.id,
                chunk.source_id,
                chunk.source_url,
                chunk.title,
                chunk.category,
                chunk.chunk_text,
                chunk.chunk_index,
                chunk.token_count,
                chunk.safety_relevant ? 1 : 0,
                chunk.attribution,
                chunk.content_hash
              )
              .run();
          } catch (err) {
            console.error("INGEST_D1_ERROR:", err instanceof Error ? err.message : String(err));
          }
        }
      }

      // Upsert vectors in batch
      if (vectorIndex && typeof vectorIndex.upsert === "function" && vectorsToUpsert.length > 0) {
        try {
          await vectorIndex.upsert(vectorsToUpsert);
        } catch (err) {
          console.error("INGEST_VECTORIZE_ERROR:", err instanceof Error ? err.message : String(err));
        }
      }
    }

    // 5. Log to ingestion_log
    if (db && typeof db.prepare === "function") {
      try {
        await db
          .prepare(
            `INSERT INTO ingestion_log (batch_id, source_id, source_url, status, chunks_count, content_hash)
             VALUES (?, ?, ?, ?, ?, ?)`
          )
          .bind(
            batchId,
            job.source_id,
            job.source_url,
            newChunks.length > 0 ? "success" : "skipped",
            newChunks.length,
            chunks[0]?.content_hash || "empty"
          )
          .run();
      } catch {
        // Safe fail on audit insert
      }
    }

    return {
      success: true,
      batch_id: batchId,
      source_id: job.source_id,
      chunks_created: newChunks.length,
      chunks_skipped: skippedCount,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("INGEST_JOB_ERROR:", errorMsg);
    return {
      success: false,
      batch_id: batchId,
      source_id: job.source_id,
      chunks_created: 0,
      chunks_skipped: 0,
      error: errorMsg,
    };
  }
}

/**
 * Cloudflare Queue Consumer batch handler.
 */
export async function processQueueBatch(
  batch: { messages: Array<{ body: IngestJobPayload; ack(): void; retry(): void }> },
  env: Record<string, unknown>
): Promise<{ processed: number; failed: number }> {
  let processed = 0;
  let failed = 0;

  for (const message of batch.messages) {
    try {
      const result = await processIngestJob(env, message.body);
      if (result.success) {
        message.ack();
        processed++;
      } else {
        message.retry();
        failed++;
      }
    } catch {
      message.retry();
      failed++;
    }
  }

  return { processed, failed };
}

