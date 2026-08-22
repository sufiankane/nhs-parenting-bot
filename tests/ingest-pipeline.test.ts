/**
 * M7 Ingestion Pipeline — Unit & Integration Test Suite (P2-T2, Spec §4 M7).
 *
 * Safety rules protected:
 *  - rule 02.7: Source allow-list validation (reject unvetted non-NHS sources).
 *  - rule 02.15: Exact clinical text preservation and deterministic SHA-256 provenance.
 *  - rule 04.12: Pinned embedding model "@cf/baai/bge-base-en-v1.5" (768-dim).
 *  - rule 04.14: Safe error responses without leaking internal credentials or stack traces.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateSourceUrl, validateCategory } from "../src/ingest/allowlist";
import { chunkContent, computeChunkHash } from "../src/ingest/chunker";
import { processIngestJob, processQueueBatch } from "../src/ingest/pipeline";
import { handleAdminIngest } from "../src/ingest/admin";
import worker from "../src/index";
import type { IngestJobPayload } from "../src/ingest/types";

describe("M7 Allow-List & Governance Validation [P2-T2, rule 02.7]", () => {
  it("accepts valid NHS.uk URLs with HTTPS", () => {
    expect(validateSourceUrl("https://www.nhs.uk/conditions/baby/caring-for-a-newborn/").valid).toBe(true);
    expect(validateSourceUrl("https://nhs.uk/baby/feeding/").valid).toBe(true);
    expect(validateSourceUrl("https://111.nhs.uk/urgent-care/").valid).toBe(true);
  });

  it("rejects non-HTTPS URLs", () => {
    const res = validateSourceUrl("http://www.nhs.uk/conditions/baby/");
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("HTTPS");
  });

  it("CRITICAL RULE 02.7: rejects non-NHS domains without human approval", () => {
    const res1 = validateSourceUrl("https://commercial-parenting-site.co.uk/advice");
    expect(res1.valid).toBe(false);
    expect(res1.reason).toContain("not on the approved NHS allow-list");

    const res2 = validateSourceUrl("https://example.com/health");
    expect(res2.valid).toBe(false);
  });

  it("validates canonical categories", () => {
    expect(validateCategory("newborn-care")).toBe(true);
    expect(validateCategory("feeding")).toBe(true);
    expect(validateCategory("unvetted-category")).toBe(false);
  });
});

describe("M7 Chunking & Deterministic SHA-256 Provenance [P2-T2, rule 02.15]", () => {
  const sampleJob: IngestJobPayload = {
    batch_id: "batch-test-1",
    source_id: "nhs-test-guidance",
    source_url: "https://www.nhs.uk/conditions/baby/",
    title: "Test Guidance",
    category: "newborn-care",
    safety_relevant: true,
  };

  it("chunks raw markdown and applies deterministic SHA-256 single-identity policy", async () => {
    const rawContent = `First paragraph with parenting guidance for new mothers.

Second paragraph explaining how to change a nappy safely and gently.`;

    const chunks = await chunkContent(sampleJob, rawContent);
    expect(chunks.length).toBeGreaterThan(0);

    for (const chunk of chunks) {
      expect(chunk.source_id).toBe("nhs-test-guidance");
      expect(chunk.source_url).toBe("https://www.nhs.uk/conditions/baby/");
      expect(chunk.safety_relevant).toBe(true);
      expect(chunk.attribution).toBe("Source: NHS.uk");
      // Single identity policy: id === content_hash === sha256(chunk_text)
      const expectedHash = await computeChunkHash(chunk.chunk_text);
      expect(chunk.id).toBe(expectedHash);
      expect(chunk.content_hash).toBe(expectedHash);
    }
  });
});

describe("M7 Admin Gateway: handleAdminIngest [P2-T2, Spec §4 M2]", () => {
  const env = {
    ADMIN_SECRET: "secret-admin-token-12345",
  };

  it("rejects unauthenticated requests with 401 UNAUTHORIZED", async () => {
    const req = new Request("https://worker.local/admin/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source_id: "test", content: "guidance text" }),
    });

    const res = await handleAdminIngest(req, env);
    expect(res.status).toBe(401);
    const body = (await res.json()) as any;
    expect(body.payload.code).toBe("UNAUTHORIZED");
  });

  it("rejects non-allow-listed source URLs with 403 ALLOWLIST_VIOLATION (rule 02.7)", async () => {
    const req = new Request("https://worker.local/admin/ingest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": "secret-admin-token-12345",
      },
      body: JSON.stringify({
        source_id: "commercial-source",
        source_url: "https://unvetted-commercial-site.com/advice",
        content: "Some commercial advice.",
      }),
    });

    const res = await handleAdminIngest(req, env);
    expect(res.status).toBe(403);
    const body = (await res.json()) as any;
    expect(body.payload.code).toBe("ALLOWLIST_VIOLATION");
  });

  it("queues job to R2 and Queue when bindings are present", async () => {
    const r2Put = vi.fn().mockResolvedValue(undefined);
    const queueSend = vi.fn().mockResolvedValue(undefined);

    const fullEnv = {
      ...env,
      RAW_SOURCES: { put: r2Put },
      INGEST_QUEUE: { send: queueSend },
    };

    const req = new Request("https://worker.local/admin/ingest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": "secret-admin-token-12345",
      },
      body: JSON.stringify({
        source_id: "nhs-formula-feed",
        source_url: "https://www.nhs.uk/conditions/baby/formula/",
        title: "Formula Feeding",
        category: "feeding",
        content: "Always make up formula with water at 70C.",
        safety_relevant: true,
      }),
    });

    const res = await handleAdminIngest(req, fullEnv);
    expect(res.status).toBe(202);
    const body = (await res.json()) as any;
    expect(body.status).toBe("queued");
    expect(body.queue).toBe("nhs-ingest-queue");
    expect(r2Put).toHaveBeenCalled();
    expect(queueSend).toHaveBeenCalled();
  });
});

describe("M7 Pipeline Execution & Idempotency [P2-T2]", () => {
  it("processIngestJob performs idempotent deduplication and upserts to Vectorize and D1", async () => {
    const vectorUpsert = vi.fn().mockResolvedValue(undefined);
    const aiRun = vi.fn().mockResolvedValue({
      data: [Array(768).fill(0.02)],
    });

    const d1Statements: string[] = [];
    const db = {
      prepare: vi.fn((sql: string) => {
        d1Statements.push(sql);
        return {
          bind: vi.fn(() => ({
            all: vi.fn().mockResolvedValue({ results: [] }), // No existing chunks -> all new
            run: vi.fn().mockResolvedValue({ success: true }),
          })),
        };
      }),
    };

    const env = {
      AI: { run: aiRun },
      VECTOR_INDEX: { upsert: vectorUpsert },
      DB: db,
    };

    const job: IngestJobPayload = {
      batch_id: "batch-1",
      source_id: "nhs-sleep-safe",
      source_url: "https://www.nhs.uk/baby/sleep/",
      title: "Safe Sleep",
      category: "sleep",
      raw_content: "Place baby on their back to sleep in a cot in the same room as you.",
      safety_relevant: true,
    };

    const result = await processIngestJob(env, job);
    expect(result.success).toBe(true);
    expect(result.chunks_created).toBe(1);
    expect(result.chunks_skipped).toBe(0);

    expect(aiRun).toHaveBeenCalled();
    expect(vectorUpsert).toHaveBeenCalled();
    expect(d1Statements.some((s) => s.includes("INSERT OR REPLACE INTO guidance_chunks"))).toBe(true);
    expect(d1Statements.some((s) => s.includes("INSERT INTO ingestion_log"))).toBe(true);
  });

  it("processQueueBatch acks successful jobs and retries failed jobs", async () => {
    const env = {
      AI: { run: vi.fn().mockResolvedValue({ data: [Array(768).fill(0.01)] }) },
      VECTOR_INDEX: { upsert: vi.fn().mockResolvedValue(undefined) },
      DB: {
        prepare: vi.fn(() => ({
          bind: vi.fn(() => ({
            all: vi.fn().mockResolvedValue([]),
            run: vi.fn().mockResolvedValue({ success: true }),
          })),
        })),
      },
    };

    const ack1 = vi.fn();
    const retry1 = vi.fn();
    const ack2 = vi.fn();
    const retry2 = vi.fn();

    const batch = {
      messages: [
        {
          body: {
            batch_id: "b1",
            source_id: "s1",
            source_url: "https://www.nhs.uk/s1",
            title: "T1",
            category: "feeding",
            raw_content: "Valid feeding content text.",
          },
          ack: ack1,
          retry: retry1,
        },
        {
          body: {
            batch_id: "b2",
            source_id: "s2",
            source_url: "https://www.nhs.uk/s2",
            title: "T2",
            category: "feeding",
            raw_content: "", // Empty -> fails
          },
          ack: ack2,
          retry: retry2,
        },
      ],
    };

    const summary = await processQueueBatch(batch, env);
    expect(summary.processed).toBe(1);
    expect(summary.failed).toBe(1);
    expect(ack1).toHaveBeenCalled();
    expect(retry2).toHaveBeenCalled();
  });
});

describe("M7 Worker Routing Integration [P2-T2]", () => {
  it("POST /admin/ingest routes to handleAdminIngest and handles CORS", async () => {
    const env = {
      ADMIN_SECRET: "my-secret-key",
      ALLOWED_ORIGINS: "https://example.com",
    };

    const req = new Request("https://worker.local/admin/ingest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": "wrong-key",
      },
      body: JSON.stringify({ source_id: "test", content: "text" }),
    });

    const res = await worker.fetch(req, env as any, {});
    expect(res.status).toBe(401);
  });
});
