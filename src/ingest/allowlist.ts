/**
 * M7 Ingestion Allow-List & Governance Gate (Spec §4 M7, rule 02.7).
 *
 * Safety rules protected:
 *  - rule 02.7: Ingest strictly from curated, verified NHS sources.
 *    Non-NHS domains require explicit human approval.
 */

export const CANONICAL_CATEGORIES = [
  "newborn-care",
  "feeding",
  "weaning-nutrition",
  "sleep",
  "teething-development",
  "minor-ailments",
  "emotional-wellbeing",
] as const;

export type CanonicalCategory = (typeof CANONICAL_CATEGORIES)[number];

export const ALLOWED_NHS_HOSTS = new Set([
  "nhs.uk",
  "www.nhs.uk",
  "service.nhs.uk",
  "111.nhs.uk",
]);

/**
 * Validate that a source URL conforms strictly to NHS allow-list rules (rule 02.7).
 */
export function validateSourceUrl(rawUrl: string): { valid: boolean; reason?: string } {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { valid: false, reason: "Source URL must be a non-empty string" };
  }

  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== "https:") {
      return { valid: false, reason: "Source URL must use secure HTTPS protocol" };
    }

    const hostname = parsed.hostname.toLowerCase();
    const isAllowedHost =
      ALLOWED_NHS_HOSTS.has(hostname) || hostname.endsWith(".nhs.uk");

    if (!isAllowedHost) {
      return {
        valid: false,
        reason: `Domain '${hostname}' is not on the approved NHS allow-list (rule 02.7). Requires human approval.`,
      };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: "Malformed URL format" };
  }
}

/**
 * Validate that a category belongs to the 7 canonical NHS parenting categories.
 */
export function validateCategory(category: string): category is CanonicalCategory {
  return (CANONICAL_CATEGORIES as readonly string[]).includes(category.trim());
}
