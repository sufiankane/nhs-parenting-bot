/**
 * M8 Anonymised Triage Audit Log (Spec §4 M8, P2-T3).
 *
 * Safety non-negotiables:
 *  - rule 02.8: NEVER store raw user message text, user names, postcodes, or PII.
 *  - rule 04.14: Fail-safe logging — audit write failures are logged internally
 *    and NEVER crash or block the user response.
 */

import type { AuditLogEntry, TriageTier } from "./types";

/**
 * Generate a deterministic one-way pseudonym from a session ID using SHA-256.
 * Guarantees raw session UUIDs are not correlated across systems without authorization.
 */
export async function pseudonymizeSessionId(sessionId: string): Promise<string> {
  if (!sessionId || typeof sessionId !== "string") {
    return "anonymous-session";
  }
  try {
    const data = new TextEncoder().encode(`nhs-audit-salt:${sessionId.trim()}`);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
  } catch {
    // Fallback if crypto.subtle is somehow unavailable
    return `pseudo-${sessionId.slice(0, 8)}`;
  }
}

/**
 * Log an anonymised triage event to the D1 audit database.
 *
 * Enforces rule 02.8: only logs tier, coarse signal_categories, and session_pseudonym.
 * Never throws — returns true on success, false on failure.
 */
export async function logTriageAudit(
  db: unknown,
  entry: AuditLogEntry
): Promise<boolean> {
  try {
    if (!db || typeof (db as { prepare?: unknown }).prepare !== "function") {
      console.warn("AUDIT_LOG_WARN: D1 database binding not available for audit logging");
      return false;
    }

    const tier = entry.tier;
    if (tier !== 1 && tier !== 2 && tier !== 3 && tier !== 4) {
      console.error(`AUDIT_LOG_ERROR: Invalid triage tier ${tier}`);
      return false;
    }

    const categories = Array.isArray(entry.signal_categories)
      ? entry.signal_categories.filter((c): c is string => typeof c === "string")
      : [];
    const signalCategoriesJson = JSON.stringify(categories);
    const pseudonym = await pseudonymizeSessionId(entry.session_id);

    const d1 = db as {
      prepare: (sql: string) => {
        bind: (...args: unknown[]) => {
          run: () => Promise<unknown>;
        };
      };
    };

    await d1
      .prepare(
        `INSERT INTO triage_audit_log (tier, signal_categories, session_pseudonym) VALUES (?, ?, ?)`
      )
      .bind(tier, signalCategoriesJson, pseudonym)
      .run();

    return true;
  } catch (err) {
    // Rule 04.14: internal logging channel, non-blocking for user requests
    console.error(
      "AUDIT_LOG_ERROR:",
      err instanceof Error ? err.message : String(err)
    );
    return false;
  }
}
