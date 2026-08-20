-- =============================================================================
-- NHS Parenting Companion Chatbot - D1 Database Schema
-- Modules: M4 (Retrieval Context), M7 (Ingestion & Provenance), M8 (Audit Log)
-- =============================================================================

-- Guidance chunks table: stores normalized knowledge base text with provenance
CREATE TABLE IF NOT EXISTS guidance_chunks (
    id TEXT PRIMARY KEY,                       -- Deterministic SHA-256 hash of chunk_text
    source_id TEXT NOT NULL,                  -- Canonical source identifier from content/sources.json
    source_url TEXT NOT NULL,                 -- Canonical NHS.uk URL
    title TEXT NOT NULL,                      -- Section or FAQ topic title
    category TEXT NOT NULL,                   -- One of 7 canonical categories
    chunk_text TEXT NOT NULL,                 -- Plain-text guidance (150-400 words)
    chunk_index INTEGER NOT NULL DEFAULT 0,   -- Index of chunk within the source document
    token_count INTEGER NOT NULL DEFAULT 0,   -- Token count estimate
    safety_relevant INTEGER NOT NULL DEFAULT 0,-- 1 if chunk contains clinical safety warnings / red flags
    attribution TEXT NOT NULL DEFAULT 'Source: NHS.uk', -- Mandatory NHS attribution text
    content_hash TEXT NOT NULL,               -- SHA-256 hash for idempotent change detection
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_guidance_chunks_category ON guidance_chunks(category);
CREATE INDEX IF NOT EXISTS idx_guidance_chunks_source_id ON guidance_chunks(source_id);
CREATE INDEX IF NOT EXISTS idx_guidance_chunks_source_url ON guidance_chunks(source_url);
CREATE INDEX IF NOT EXISTS idx_guidance_chunks_safety ON guidance_chunks(safety_relevant);

-- Ingestion audit and provenance tracking table
CREATE TABLE IF NOT EXISTS ingestion_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id TEXT NOT NULL,                   -- Unique UUID/identifier for the ingestion run
    source_id TEXT NOT NULL,                  -- Reference to source in content/sources.json
    source_url TEXT NOT NULL,                 -- Source URL fetched
    status TEXT NOT NULL CHECK(status IN ('success', 'updated', 'skipped', 'failed')),
    chunks_count INTEGER NOT NULL DEFAULT 0,  -- Number of chunks processed in this record
    content_hash TEXT NOT NULL,               -- Hash of raw source payload
    error_message TEXT,                       -- Null on success, error details on failure
    timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ingestion_log_batch_id ON ingestion_log(batch_id);
CREATE INDEX IF NOT EXISTS idx_ingestion_log_source_id ON ingestion_log(source_id);
CREATE INDEX IF NOT EXISTS idx_ingestion_log_timestamp ON ingestion_log(timestamp);

-- Anonymised triage audit log table (M8) - ZERO PII or free-text allowed
CREATE TABLE IF NOT EXISTS triage_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    tier INTEGER NOT NULL,                    -- Triage tier (1, 2, 3, or 4)
    signal_categories TEXT NOT NULL,          -- JSON string array of coarse categories (e.g. '["emergency_respiratory"]')
    session_pseudonym TEXT NOT NULL           -- Ephemeral/pseudonymous session identifier
);

CREATE INDEX IF NOT EXISTS idx_triage_audit_log_timestamp ON triage_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_triage_audit_log_tier ON triage_audit_log(tier);
