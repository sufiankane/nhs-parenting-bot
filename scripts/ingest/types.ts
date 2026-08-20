import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";

export interface NHSSource {
  id: string;
  title: string;
  url: string;
  category: string;
  description: string;
  authority: string;
  last_reviewed: string;
  enabled: boolean;
  license: string;
}

export interface SourcesFile {
  $schema?: string;
  version: string;
  last_updated: string;
  authoritative_domain: string;
  categories: string[];
  sources: NHSSource[];
}

export interface FAQSeedChunk {
  id: string;
  source_id: string;
  source_url: string;
  title: string;
  category: string;
  chunk_text: string;
  chunk_index: number;
  token_count: number;
  safety_relevant: boolean;
  attribution: string;
  content_hash: string;
}

export interface FAQSeedFile {
  $schema?: string;
  version: string;
  last_updated: string;
  embedding_model: string;
  embedding_dimensions: number;
  total_chunks: number;
  categories: string[];
  chunks: FAQSeedChunk[];
}

export interface IngestionLogRecord {
  id?: number;
  batch_id: string;
  source_id: string;
  source_url: string;
  status: "success" | "updated" | "skipped" | "failed";
  chunks_count: number;
  content_hash: string;
  error_message?: string | null;
  timestamp?: string;
}

export interface QualityGateResult {
  passed: boolean;
  total_chunks: number;
  category_counts: Record<string, number>;
  safety_relevant_count: number;
  allow_list_verified: boolean;
  hashes_valid: boolean;
  model_verified: boolean;
  errors: string[];
}

export interface IngestOptions {
  local?: boolean;
  remote?: boolean;
  dryRun?: boolean;
  generateSql?: boolean;
  sqlOutputPath?: string;
  vectorizeOutputPath?: string;
}

export interface SpotCheckQuery {
  query: string;
  expectedCategory: string;
  expectedKeywords: string[];
  expectSafetyRelevant?: boolean;
}
/**
 * Deterministic SHA-256 hex of the trimmed chunk text.
 * Single identity policy: chunk.id === chunk.content_hash === hashChunk(chunk_text)
 * so build-seed, D1 seeding, and future ingestion idempotency all agree.
 */
export function hashChunk(text: string): string {
  return crypto.createHash("sha256").update(text.trim()).digest("hex");
}