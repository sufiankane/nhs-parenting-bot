import { TIER_1_RULES, TIER_2_RULES, TIER_3_RULES } from "./lexicon";
import { normalizeText } from "./normalize";
import { LexiconRule, TriageResult } from "./types";

export * from "./types";
export * from "./lexicon";
export * from "./normalize";

/** Internal matched phrase and its coarse category. */
interface PhraseMatch {
  readonly phrase: string;
  readonly category: string;
}

/**
 * Word-boundary phrase matching. The normalized text is padded with a leading
 * and trailing space, then each lexicon phrase is matched with surrounding
 * spaces. This prevents a lexicon term from matching inside a longer word
 * (e.g. "coma" must not match "comatose", "seizure" must not match
 * "seizures") while still matching at the start/end of the message.
 */
function matchRules(normalizedText: string, rules: readonly LexiconRule[]): PhraseMatch[] {
  const matches: PhraseMatch[] = [];
  const padded = ` ${normalizedText} `;

  for (const rule of rules) {
    for (const phrase of rule.phrases) {
      if (padded.includes(` ${phrase} `)) {
        matches.push({ phrase, category: rule.category });
      }
    }
  }

  return matches;
}

export function triage(message: unknown): TriageResult {
  try {
    const normalized = normalizeText(message);

    if (!normalized) {
      return {
        tier: 4,
        matched_signals: [],
        signal_categories: [],
        confidence: 1.0,
      };
    }

    // Scan all three tiers to collect comprehensive signal categories for the audit log (rule 02.8)
    const tier1Matches = matchRules(normalized, TIER_1_RULES);
    const tier2Matches = matchRules(normalized, TIER_2_RULES);
    const tier3Matches = matchRules(normalized, TIER_3_RULES);

    const hasTier1 = tier1Matches.length > 0;
    const hasTier2 = tier2Matches.length > 0;
    const hasTier3 = tier3Matches.length > 0;

    if (!hasTier1 && !hasTier2 && !hasTier3) {
      // Tier 4: Everyday safe parenting query
      return {
        tier: 4,
        matched_signals: [],
        signal_categories: [],
        confidence: 1.0,
      };
    }

    // Combine all matched signals and deduplicate categories
    const allMatches = [...tier1Matches, ...tier2Matches, ...tier3Matches];
    const categories = Array.from(new Set(allMatches.map((m) => m.category)));
    const phrases = Array.from(new Set(allMatches.map((m) => m.phrase)));

    // Precedence resolution (Rule 02.3: Tier 1 precedence is absolute)
    let tier: 1 | 2 | 3;
    if (hasTier1) {
      tier = 1;
    } else if (hasTier2) {
      tier = 2; // Urgent medical
    } else {
      tier = 3; // Safeguarding
    }

    return {
      tier,
      matched_signals: phrases,
      signal_categories: categories,
      confidence: 1.0,
    };
  } catch (_error) {
    // Fail-safe degradation (Spec §4 M3 degradation rule): if triage errors,
    // fall back to Tier 2 (urgent, non-emergency) — never Tier 4. A message
    // must never be classified safe solely because triage threw (rule 02.1).
    // Pure function: no I/O or console logging inside M3 (rule 04.13).
    return {
      tier: 2,
      matched_signals: ["DEGRADATION_FAILSAFE"],
      signal_categories: ["degradation_failsafe"],
      confidence: 0.0,
    };
  }
}
