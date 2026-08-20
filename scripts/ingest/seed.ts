import * as fs from "node:fs";
import * as path from "node:path";
import { FAQSeedFile, SourcesFile, hashChunk } from "./types.js";

export interface SeedingResult {
  totalSources: number;
  totalChunks: number;
  categoryDistribution: Record<string, number>;
  verifiedProvenance: boolean;
  sqlStatements: string[];
}

export function generateSeedingPayload(): SeedingResult {
  const sourcesPath = path.resolve("content/sources.json");
  const seedPath = path.resolve("content/nhs_faq_seed.json");

  if (!fs.existsSync(sourcesPath)) {
    throw new Error(`Missing sources allow-list: ${sourcesPath}`);
  }
  if (!fs.existsSync(seedPath)) {
    throw new Error(`Missing seed FAQ chunks: ${seedPath}`);
  }

  const sourcesData: SourcesFile = JSON.parse(fs.readFileSync(sourcesPath, "utf-8"));
  const seedData: FAQSeedFile = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

  const sourceById = new Map(sourcesData.sources.map((s) => [s.id, s]));
  const allowedCategories = new Set(sourcesData.categories);
  const categoryCount: Record<string, number> = {};

  const sqlStatements: string[] = [];

  // Robust SQL literal: double every single quote inside the value.
  const quoteSql = (value: string): string => `'${value.replace(/'/g, "''")}'`;

  for (const chunk of seedData.chunks) {
    const source = sourceById.get(chunk.source_id);
    if (!source) {
      throw new Error(
        `Security validation failed: Chunk ${chunk.id} references unauthorized source_id: ${chunk.source_id}`
      );
    }
    // Allow-list gate (rules 01.1, 01.2): never ingest from a disabled source.
    if (source.enabled !== true) {
      throw new Error(
        `Security validation failed: Source "${chunk.source_id}" is not enabled in the allow-list`
      );
    }
    // Provenance: the chunk must mirror the allow-list entry exactly, not just share a domain.
    if (chunk.source_url !== source.url) {
      throw new Error(
        `Provenance validation failed: Chunk ${chunk.id} URL "${chunk.source_url}" does not match allow-list source "${chunk.source_id}" URL "${source.url}"`
      );
    }
    if (!chunk.source_url.startsWith("https://www.nhs.uk/")) {
      throw new Error(
        `Security validation failed: Chunk ${chunk.id} has non-NHS domain URL: ${chunk.source_url}`
      );
    }

    // Single hash policy: id === content_hash === sha256(chunk_text.trim()).
    const expectedHash = hashChunk(chunk.chunk_text);
    if (chunk.id !== expectedHash) {
      throw new Error(`Integrity validation failed: Chunk ID mismatch for '${chunk.title}'`);
    }
    if (chunk.content_hash !== expectedHash) {
      throw new Error(`Integrity validation failed: content_hash mismatch for '${chunk.title}'`);
    }
    if (chunk.content_hash !== chunk.id) {
      throw new Error(`Integrity validation failed: content_hash must equal chunk id for '${chunk.title}'`);
    }

    // Closed category set: category must be from the allow-list categories,
    // and must match the allow-list source record (SafetyBatch S7, S7b).
    if (chunk.category !== source.category) {
      throw new Error(
        `Provenance validation failed: Chunk ${chunk.id} category "${chunk.category}" does not match allow-list source "${chunk.source_id}" category "${source.category}"`
      );
    }
    if (!allowedCategories.has(chunk.category)) {
      throw new Error(
        `Security validation failed: Chunk ${chunk.id} category "${chunk.category}" is not in the approved allow-list categories`
      );
    }

    // Numeric fields must be real integers before they reach the SQL payload.
    if (!Number.isInteger(chunk.chunk_index) || !Number.isInteger(chunk.token_count)) {
      throw new Error(`Type validation failed: non-integer field in chunk '${chunk.title}'`);
    }

    categoryCount[chunk.category] = (categoryCount[chunk.category] || 0) + 1;

    const safetyInt = chunk.safety_relevant ? 1 : 0;

    sqlStatements.push(
      `INSERT OR REPLACE INTO guidance_chunks (id, source_id, source_url, title, category, chunk_text, chunk_index, token_count, safety_relevant, attribution, content_hash) VALUES (` +
        `${quoteSql(chunk.id)}, ${quoteSql(chunk.source_id)}, ${quoteSql(chunk.source_url)}, ` +
        `${quoteSql(chunk.title)}, ${quoteSql(chunk.category)}, ${quoteSql(chunk.chunk_text)}, ` +
        `${chunk.chunk_index}, ${chunk.token_count}, ${safetyInt}, ` +
        `${quoteSql(chunk.attribution)}, ${quoteSql(chunk.content_hash)});`
    );
  }

  return {
    totalSources: sourcesData.sources.length,
    totalChunks: seedData.chunks.length,
    categoryDistribution: categoryCount,
    verifiedProvenance: true,
    sqlStatements,
  };
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("seed.ts")) {
  const result = generateSeedingPayload();
  console.log("=== NHS Knowledge Base Ingestion Seed Report ===");
  console.log(`Total Allowed Sources: ${result.totalSources}`);
  console.log(`Total Verified Chunks: ${result.totalChunks}`);
  console.log("Category Distribution:", result.categoryDistribution);
  console.log(`Generated ${result.sqlStatements.length} SQL D1 statements.`);
}
