import * as fs from "node:fs";
import * as path from "node:path";
import { ALL_RAW_CHUNKS } from "./data/index.js";
import { FAQSeedFile, SourcesFile, hashChunk } from "./types.js";

/**
 * P1-T5 seed builder.
 *
 * Reads the curated raw chunks from scripts/ingest/data/* and validates every
 * one against the allow-list (content/sources.json) before emitting the
 * deterministic FAQ seed that D1 seeding and Vectorize upsert both consume.
 *
 * Provenance gates (rules 01.1/01.2, SafetyBatch S7): a chunk is admitted only
 * if its source exists in the allow-list, is enabled, and the chunk mirrors the
 * allow-list entry exactly — URL and category included. Any failure throws with
 * the chunk title so a bad chunk is identified, never silently dropped.
 */

const sourcesFilePath = path.resolve("content/sources.json");
const outputFilePath = path.resolve("content/nhs_faq_seed.json");

const sourcesData: SourcesFile = JSON.parse(fs.readFileSync(sourcesFilePath, "utf-8"));
const sourceById = new Map(sourcesData.sources.map((s) => [s.id, s]));

const ATTRIBUTION = "Source: NHS.uk";
const EMBEDDING_MODEL = "@cf/baai/bge-base-en-v1.5";
const EMBEDDING_DIMENSIONS = 768;
const SEED_VERSION = "1.0.0";

/** Rough token estimate shared with the golden test: round(words * 1.3). */
function wordCount(text: string): number {
  return text.trim().split(/\s+/).length;
}

// ---- Provenance gates: fail fast, naming the offending chunk -----------------
for (const chunk of ALL_RAW_CHUNKS) {
  const source = sourceById.get(chunk.source_id);
  if (!source) {
    throw new Error(`Seed build aborted: chunk "${chunk.title}" references allow-list source "${chunk.source_id}" which does not exist in content/sources.json`);
  }
  if (source.enabled !== true) {
    throw new Error(`Seed build aborted: chunk "${chunk.title}" references source "${chunk.source_id}" which is not enabled in the allow-list`);
  }
  if (chunk.source_url !== source.url) {
    throw new Error(`Seed build aborted: chunk "${chunk.title}" URL "${chunk.source_url}" does not match allow-list source "${chunk.source_id}" URL "${source.url}"`);
  }
  if (chunk.category !== source.category) {
    throw new Error(`Seed build aborted: chunk "${chunk.title}" category "${chunk.category}" does not match allow-list source "${chunk.source_id}" category "${source.category}"`);
  }
}

// ---- Map validated raw chunks to the frozen FAQSeedChunk shape ---------------
const chunks = ALL_RAW_CHUNKS.map((chunk) => {
  const id = hashChunk(chunk.chunk_text);
  return {
    id,
    source_id: chunk.source_id,
    source_url: chunk.source_url,
    title: chunk.title,
    category: chunk.category,
    chunk_text: chunk.chunk_text,
    chunk_index: chunk.chunk_index,
    token_count: Math.round(wordCount(chunk.chunk_text) * 1.3),
    safety_relevant: chunk.safety_relevant,
    attribution: ATTRIBUTION,
    content_hash: id,
  };
});

const seedFile: FAQSeedFile = {
  version: SEED_VERSION,
  last_updated: new Date().toISOString().slice(0, 10),
  embedding_model: EMBEDDING_MODEL,
  embedding_dimensions: EMBEDDING_DIMENSIONS,
  total_chunks: chunks.length,
  categories: sourcesData.categories,
  chunks,
};

fs.writeFileSync(outputFilePath, JSON.stringify(seedFile, null, 2) + "\n", "utf-8");

// ---- Report ------------------------------------------------------------------
const categoryCounts: Record<string, number> = {};
for (const chunk of chunks) {
  categoryCounts[chunk.category] = (categoryCounts[chunk.category] ?? 0) + 1;
}
const safetyRelevantCount = chunks.filter((c) => c.safety_relevant).length;

console.log("=== NHS Knowledge Base Seed Build Report ===");
console.log(`Total chunks: ${chunks.length}`);
console.log("Per-category counts:", categoryCounts);
console.log(`Safety-relevant chunks: ${safetyRelevantCount}`);
console.log(`Wrote ${path.relative(process.cwd(), outputFilePath)}`);
