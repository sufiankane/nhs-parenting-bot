import { TIER_1_RULES, TIER_2_RULES, TIER_3_RULES } from "./lexicon";
import { normalizeText } from "./normalize";
import { LexiconRule, TriageResult } from "./types";
import { classifyRisk, resolveTier } from "./classifier";

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
interface CompiledLexiconFilter {
  regex: RegExp;
  wordToPhrases: Map<string, { phrase: string; category: string; search: string }[]>;
}

function compileLexiconFilter(rules: readonly LexiconRule[]): CompiledLexiconFilter {
  const firstWords = new Set<string>();
  const wordToPhrases = new Map<string, { phrase: string; category: string; search: string }[]>();

  for (const rule of rules) {
    for (const phrase of rule.phrases) {
      const firstWord = phrase.split(' ')[0];
      firstWords.add(firstWord);

      if (!wordToPhrases.has(firstWord)) {
        wordToPhrases.set(firstWord, []);
      }
      wordToPhrases.get(firstWord)!.push({ phrase, category: rule.category, search: ` ${phrase} ` });
    }
  }

  const sortedFirstWords = Array.from(firstWords).sort((a, b) => b.length - a.length);

  let regexStr = "";
  for (let i = 0; i < sortedFirstWords.length; i++) {
    const w = sortedFirstWords[i];
    let escaped = "";
    for (let j = 0; j < w.length; j++) {
      if (".*+?^$()|[]{}".includes(w[j]) || w[j] === "\\") {
        escaped += "\\" + w[j];
      } else {
        escaped += w[j];
      }
    }
    if (i > 0) regexStr += "|";
    regexStr += escaped;
  }

  const regex = new RegExp(`(?<= )(?:${regexStr})(?= )`, 'g');

  return { regex, wordToPhrases };
}

const TIER_1_FILTER = compileLexiconFilter(TIER_1_RULES);
const TIER_2_FILTER = compileLexiconFilter(TIER_2_RULES);
const TIER_3_FILTER = compileLexiconFilter(TIER_3_RULES);

function matchRules(normalizedText: string, filter: CompiledLexiconFilter): PhraseMatch[] {
  const matches: PhraseMatch[] = [];
  const padded = ` ${normalizedText} `;

  const foundWords = new Set<string>();
  const results = padded.matchAll(filter.regex);
  for (const match of results) {
     foundWords.add(match[0]);
  }

  for (const word of foundWords) {
    const phrases = filter.wordToPhrases.get(word)!;
    for (let i = 0; i < phrases.length; i++) {
      if (padded.includes(phrases[i].search)) {
         matches.push({ phrase: phrases[i].phrase, category: phrases[i].category });
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
    const tier1Matches = matchRules(normalized, TIER_1_FILTER);
    const tier2Matches = matchRules(normalized, TIER_2_FILTER);
    const tier3Matches = matchRules(normalized, TIER_3_FILTER);

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

/**
 * Enhanced asynchronous triage with lightweight classifier pass (P2-T1).
 *
 * Enforces rule 02.2 & 02.3:
 *  1. Synchronous lexicon check runs first.
 *  2. Tier 1 lexicon match resolves immediately with zero extra latency.
 *  3. Optional classifier runs in background on non-Tier-1 queries.
 *  4. Classifier can escalate, NEVER downgrade a lexicon hit.
 *  5. On any classifier failure, degrades instantly to deterministic lexicon result.
 */
export async function triageWithClassifier(
  message: unknown,
  env?: unknown
): Promise<TriageResult> {
  const lexiconResult = triage(message);

  // If already Tier 1, return immediately (rule 02.2: Tier 1 precedence is absolute)
  if (lexiconResult.tier === 1) {
    return lexiconResult;
  }

  // If no env or string message, return lexicon result
  if (!env || typeof message !== "string") {
    return lexiconResult;
  }

  try {
    const prediction = await classifyRisk(env, message);
    return resolveTier(lexiconResult, prediction);
  } catch {
    // Instant deterministic degradation on any error (rule 02.3)
    return lexiconResult;
  }
}

export * from "./classifier";
