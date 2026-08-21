/**
 * M8 Anonymised Triage Audit Log — Types & Interfaces (Spec §4 M8, rule 02.8).
 *
 * Safety non-negotiables:
 *  - rule 02.8: NEVER store raw user message text, user names, postcodes, or PII.
 *  - Coarse categorical tags only (signal_categories).
 *  - Ephemeral/pseudonymous session identifiers only.
 */

export type TriageTier = 1 | 2 | 3 | 4;

export interface AuditLogEntry {
  readonly tier: TriageTier;
  readonly signal_categories: readonly string[];
  readonly session_id: string;
}

export interface AuditLogRow {
  readonly id?: number;
  readonly timestamp: string;
  readonly tier: TriageTier;
  readonly signal_categories: string; // JSON-serialized array
  readonly session_pseudonym: string;
}
