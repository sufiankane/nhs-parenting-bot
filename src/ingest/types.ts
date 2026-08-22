/**
 * M7 Ingestion Pipeline — Types & Contracts (Spec §4 M7, P2-T2).
 *
 * Safety rules protected:
 *  - rule 02.7: Source allow-list validation — only verified NHS sources permitted.
 *  - rule 02.15: Exact clinical text preservation and deterministic SHA-256 provenance.
 *  - rule 04.12: Pinned embedding model "@cf/baai/bge-base-en-v1.5" (768-dim).
 */

export interface IngestJobPayload {
  readonly batch_id: string;
  readonly source_id: string;
  readonly source_url: string;
  readonly title: string;
  readonly category: string;
  readonly raw_r2_key?: string;
  readonly raw_content?: string;
  readonly safety_relevant?: boolean;
}

export interface IngestChunk {
  readonly id: string;
  readonly source_id: string;
  readonly source_url: string;
  readonly title: string;
  readonly category: string;
  readonly chunk_text: string;
  readonly chunk_index: number;
  readonly token_count: number;
  readonly safety_relevant: boolean;
  readonly attribution: string;
  readonly content_hash: string;
}

export interface AdminIngestRequest {
  readonly source_id: string;
  readonly source_url?: string;
  readonly title?: string;
  readonly category?: string;
  readonly content: string;
  readonly safety_relevant?: boolean;
}

export interface IngestResult {
  readonly success: boolean;
  readonly batch_id: string;
  readonly source_id: string;
  readonly chunks_created: number;
  readonly chunks_skipped: number;
  readonly error?: string;
}
