export type Tier = 1 | 2 | 3 | 4;

export interface TriageResult {
  readonly tier: Tier;
  readonly matched_signals: readonly string[]; // in-memory only, never persisted to audit log (rule 02.8)
  readonly signal_categories: readonly string[]; // coarse category strings for D1 audit log (rule 02.8)
  readonly confidence: number; // 1.0 for deterministic keyword matching in Phase 1
}

export interface LexiconRule {
  readonly category: string;
  readonly phrases: readonly string[];
}
