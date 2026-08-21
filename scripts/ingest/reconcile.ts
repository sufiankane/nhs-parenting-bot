/**
 * Ingestion reconciliation logic (P2-T0).
 *
 * Compares the set of chunk IDs in the current seed against the chunk IDs stored
 * in D1/Vectorize. Detects stale/orphaned chunks resulting from text edits and
 * safely prunes them.
 *
 * Safety rules:
 * - Rule 02.15: Content removal is a content change — dry-run by default, requires --confirm.
 * - Safety Invariant: Abort if stale count exceeds maxStaleFraction (default 20% of corpus)
 *   to guard against corrupt/incomplete seed files.
 */

export interface StaleChunk {
  id: string;
  title: string;
  updated_at: string;
}

export interface ReconcileOptions {
  seedIds: Set<string>;
  d1Rows: Array<{ id: string; title: string; updated_at: string }>;
  maxStaleFraction?: number; // default 0.20 (20%)
}

export interface ReconcileResult {
  staleRows: StaleChunk[];
  totalSeed: number;
  totalD1: number;
  isWithinThreshold: boolean;
  maxAllowedStale: number;
}

export const DEFAULT_MAX_STALE_FRACTION = 0.20;

/**
 * Compute the diff between current seed IDs and stored D1 records.
 */
export function computeStaleChunks(opts: ReconcileOptions): ReconcileResult {
  const { seedIds, d1Rows, maxStaleFraction = DEFAULT_MAX_STALE_FRACTION } = opts;
  const staleRows = d1Rows.filter((r) => !seedIds.has(r.id));
  const maxAllowedStale = Math.ceil(seedIds.size * maxStaleFraction);
  const isWithinThreshold = staleRows.length <= maxAllowedStale;

  return {
    staleRows,
    totalSeed: seedIds.size,
    totalD1: d1Rows.length,
    isWithinThreshold,
    maxAllowedStale,
  };
}
