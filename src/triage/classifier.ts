/**
 * M3 Lightweight Classifier Pass (Spec §4 M3, P2-T1).
 *
 * Safety rules protected:
 *  - rule 02.2: Lexicon Tier 1 precedence is absolute — classifier may escalate,
 *    NEVER downgrade a Tier 1 lexicon hit.
 *  - rule 02.3: Pure deterministic degradation — if the classifier is unavailable,
 *    slow, or throws, triage falls back immediately to keyword-only mode.
 *  - rule 04.13: Isolated classification pass — never shares context with the
 *    generation model.
 */

import type { Tier, TriageResult } from "./types";

export interface ClassifierPrediction {
  readonly tier: Tier;
  readonly confidence: number; // 0.0 - 1.0
  readonly category?: string;
}

export const DEFAULT_CLASSIFIER_MODEL = "@cf/meta/llama-guard-3-8b";

/**
 * Combine synchronous lexicon triage result with classifier prediction.
 *
 * Enforces rule 02.2 & 02.3:
 *  1. Lexicon Tier 1 is absolute and can NEVER be downgraded.
 *  2. Classifier may escalate to a more severe tier (lower number: 1 < 2 < 3 < 4).
 *  3. Classifier can NEVER downgrade any lexicon tier.
 *  4. On classifier failure/null, falls back cleanly to lexicon result.
 */
export function resolveTier(
  lexiconResult: TriageResult,
  classifierPrediction: ClassifierPrediction | null
): TriageResult {
  // If no classifier output or classifier failed, return lexicon result unchanged (degradation mode)
  if (!classifierPrediction || typeof classifierPrediction.tier !== "number") {
    return lexiconResult;
  }

  // Tier 1 lexicon hit is strictly immutable (rule 02.2, 02.3)
  if (lexiconResult.tier === 1) {
    return lexiconResult;
  }

  const classTier = classifierPrediction.tier;
  const classConf = typeof classifierPrediction.confidence === "number"
    ? Math.max(0.0, Math.min(1.0, classifierPrediction.confidence))
    : 0.8;

  // Escalation check: Lower numeric value means higher urgency (1: Emergency, 2: Urgent, 3: Safeguarding, 4: Safe)
  // Classifier escalates if classTier < lexiconResult.tier
  if (classTier < lexiconResult.tier) {
    const categories = [...lexiconResult.signal_categories];
    const categoryName = classifierPrediction.category || `classifier_tier_${classTier}`;
    if (!categories.includes(categoryName)) {
      categories.push(categoryName);
    }

    const matchedSignals = [...lexiconResult.matched_signals];
    if (!matchedSignals.includes("CLASSIFIER_ESCALATION")) {
      matchedSignals.push("CLASSIFIER_ESCALATION");
    }

    return {
      tier: classTier as Tier,
      matched_signals: matchedSignals,
      signal_categories: categories,
      confidence: classConf,
    };
  }

  // Classifier suggested equal or lower urgency -> keep lexicon tier (NEVER downgrade)
  return lexiconResult;
}

/**
 * Perform an isolated lightweight risk classification call via Workers AI.
 * Fail-safe: returns null on any error, timeout, or missing binding.
 */
export async function classifyRisk(
  env: unknown,
  message: string
): Promise<ClassifierPrediction | null> {
  if (!env || typeof env !== "object") return null;
  const ai = (env as { AI?: { run: (model: string, input: unknown) => Promise<unknown> } }).AI;
  if (!ai || typeof ai.run !== "function") return null;

  const model =
    (env as { CLASSIFIER_MODEL?: string }).CLASSIFIER_MODEL || DEFAULT_CLASSIFIER_MODEL;

  try {
    const prompt =
      `You are a clinical safety risk triage classifier. Classify the following user message into exactly ONE risk tier:\n` +
      `Tier 1: Immediate danger to life, acute emergency, unresponsiveness, breathing cessation, active severe self-harm, anaphylaxis.\n` +
      `Tier 2: Urgent non-emergency medical symptoms requiring clinical evaluation within hours (high fever in young infants, dehydration, severe rash).\n` +
      `Tier 3: Child welfare, safeguarding concern, physical/emotional abuse, domestic abuse.\n` +
      `Tier 4: General everyday parenting questions.\n\n` +
      `Message: "${message.replace(/"/g, '\\"')}"\n\n` +
      `Respond strictly with a JSON object: {"tier": 1|2|3|4, "confidence": float, "category": string}`;

    const rawResponse = await ai.run(model, {
      prompt,
      max_tokens: 64,
      temperature: 0.0,
    });

    if (!rawResponse || typeof rawResponse !== "object") return null;

    let responseText = "";
    if (typeof (rawResponse as { response?: string }).response === "string") {
      responseText = (rawResponse as { response: string }).response;
    } else if (
      Array.isArray((rawResponse as { choices?: Array<{ message?: { content?: string } }> }).choices) &&
      typeof (rawResponse as any).choices[0]?.message?.content === "string"
    ) {
      responseText = (rawResponse as any).choices[0].message.content;
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    const tier = Number(parsed.tier);
    if (tier === 1 || tier === 2 || tier === 3 || tier === 4) {
      return {
        tier: tier as Tier,
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.85,
        category: typeof parsed.category === "string" ? parsed.category : undefined,
      };
    }
    return null;
  } catch {
    // Fail-safe degradation (rule 02.3): any classifier error returns null -> keyword fallback
    return null;
  }
}
