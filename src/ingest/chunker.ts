/**
 * M7 Ingestion Chunking & Hashing Engine (Spec §4 M7, P2-T2).
 *
 * Enforces single identity policy: chunk.id === chunk.content_hash === sha256(chunk_text.trim()).
 * Targets 150-400 words (300-600 tokens) per chunk.
 */

import type { IngestChunk, IngestJobPayload } from "./types";

/**
 * Compute deterministic SHA-256 hash string for chunk text.
 */
export async function computeChunkHash(text: string): Promise<string> {
  const data = new TextEncoder().encode(text.trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Split raw markdown/plain text into coherent paragraphs and group into chunks.
 */
export async function chunkContent(
  job: IngestJobPayload,
  rawContent: string
): Promise<IngestChunk[]> {
  const clean = rawContent.replace(/\r\n/g, "\n").trim();
  if (!clean) return [];

  const paragraphs = clean
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const chunkTexts: string[] = [];
  let currentWords: string[] = [];

  for (const para of paragraphs) {
    const words = para.split(/\s+/);
    if (currentWords.length + words.length > 350 && currentWords.length >= 100) {
      chunkTexts.push(currentWords.join(" "));
      currentWords = [...words];
    } else {
      currentWords.push(...words);
    }
  }

  if (currentWords.length > 0) {
    chunkTexts.push(currentWords.join(" "));
  }

  const chunks: IngestChunk[] = [];
  for (let i = 0; i < chunkTexts.length; i++) {
    const text = chunkTexts[i];
    const hash = await computeChunkHash(text);
    const wordCount = text.split(/\s+/).length;
    const tokenEstimate = Math.round(wordCount * 1.35);

    chunks.push({
      id: hash,
      source_id: job.source_id,
      source_url: job.source_url,
      title: job.title || "NHS Guidance",
      category: job.category,
      chunk_text: text,
      chunk_index: i,
      token_count: tokenEstimate,
      safety_relevant: Boolean(job.safety_relevant),
      attribution: "Source: NHS.uk",
      content_hash: hash,
    });
  }

  return chunks;
}
