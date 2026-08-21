/**
 * M3 Lightweight Classifier Pass — Unit & Integration Test Suite (P2-T1, Spec §4 M3).
 *
 * Safety rules protected:
 *  - rule 02.2: Tier 1 lexicon matches override classifier output (absolute precedence).
 *  - rule 02.3: Classifier may escalate, NEVER downgrade a lexicon hit.
 *  - rule 04.13: Instant degradation — classifier failure falls back to keyword-only mode.
 */

import { describe, it, expect, vi } from "vitest";
import {
  resolveTier,
  classifyRisk,
  DEFAULT_CLASSIFIER_MODEL,
} from "../src/triage/classifier";
import { triage, triageWithClassifier } from "../src/triage/index";
import type { TriageResult } from "../src/triage/types";

describe("M3 Classifier: resolveTier Precedence & Degradation [P2-T1, rule 02.2, rule 02.3]", () => {
  const t1Lexicon: TriageResult = {
    tier: 1,
    matched_signals: ["not breathing"],
    signal_categories: ["respiratory_arrest"],
    confidence: 1.0,
  };

  const t2Lexicon: TriageResult = {
    tier: 2,
    matched_signals: ["high fever"],
    signal_categories: ["fever_infant"],
    confidence: 1.0,
  };

  const t3Lexicon: TriageResult = {
    tier: 3,
    matched_signals: ["hitting child"],
    signal_categories: ["child_protection"],
    confidence: 1.0,
  };

  const t4Lexicon: TriageResult = {
    tier: 4,
    matched_signals: [],
    signal_categories: [],
    confidence: 1.0,
  };

  it("CRITICAL RULE 02.2: Lexicon Tier 1 is NEVER downgraded even if classifier predicts Tier 4", () => {
    const prediction = { tier: 4 as const, confidence: 1.0, category: "safe" };
    const result = resolveTier(t1Lexicon, prediction);

    expect(result.tier).toBe(1);
    expect(result.matched_signals).toContain("not breathing");
    expect(result.signal_categories).toContain("respiratory_arrest");
  });

  it("CRITICAL RULE 02.3: Classifier may escalate Tier 4 to Tier 1 on paraphrased danger", () => {
    const prediction = {
      tier: 1 as const,
      confidence: 0.95,
      category: "unresponsive_paraphrased",
    };
    const result = resolveTier(t4Lexicon, prediction);

    expect(result.tier).toBe(1);
    expect(result.confidence).toBe(0.95);
    expect(result.signal_categories).toContain("unresponsive_paraphrased");
    expect(result.matched_signals).toContain("CLASSIFIER_ESCALATION");
  });

  it("Classifier may escalate Tier 4 to Tier 2 (urgent medical)", () => {
    const prediction = {
      tier: 2 as const,
      confidence: 0.88,
      category: "dehydration_symptoms",
    };
    const result = resolveTier(t4Lexicon, prediction);

    expect(result.tier).toBe(2);
    expect(result.confidence).toBe(0.88);
    expect(result.signal_categories).toContain("dehydration_symptoms");
  });

  it("Classifier may escalate Tier 4 to Tier 3 (safeguarding)", () => {
    const prediction = {
      tier: 3 as const,
      confidence: 0.92,
      category: "domestic_distress",
    };
    const result = resolveTier(t4Lexicon, prediction);

    expect(result.tier).toBe(3);
    expect(result.confidence).toBe(0.92);
    expect(result.signal_categories).toContain("domestic_distress");
  });

  it("RULE 02.3: Classifier NEVER downgrades Tier 2 to Tier 4", () => {
    const prediction = { tier: 4 as const, confidence: 0.99, category: "general_parenting" };
    const result = resolveTier(t2Lexicon, prediction);

    expect(result.tier).toBe(2);
    expect(result.signal_categories).toContain("fever_infant");
  });

  it("RULE 02.3: Classifier NEVER downgrades Tier 3 to Tier 4", () => {
    const prediction = { tier: 4 as const, confidence: 0.99, category: "general_parenting" };
    const result = resolveTier(t3Lexicon, prediction);

    expect(result.tier).toBe(3);
    expect(result.signal_categories).toContain("child_protection");
  });

  it("RULE 04.13: Instant degradation to lexicon result when classifier prediction is null", () => {
    expect(resolveTier(t4Lexicon, null)).toEqual(t4Lexicon);
    expect(resolveTier(t2Lexicon, null)).toEqual(t2Lexicon);
  });
});

describe("M3 Classifier: classifyRisk & triageWithClassifier [P2-T1]", () => {
  it("classifyRisk executes isolated model call and parses JSON prediction", async () => {
    const aiRun = vi.fn().mockResolvedValue({
      response: JSON.stringify({
        tier: 1,
        confidence: 0.96,
        category: "paraphrased_emergency",
      }),
    });
    const env = { AI: { run: aiRun } };

    const prediction = await classifyRisk(env, "my baby stopped taking breaths suddenly");
    expect(prediction).toEqual({
      tier: 1,
      confidence: 0.96,
      category: "paraphrased_emergency",
    });
    expect(aiRun).toHaveBeenCalledWith(
      DEFAULT_CLASSIFIER_MODEL,
      expect.objectContaining({
        temperature: 0.0,
        max_tokens: 64,
      })
    );
  });

  it("classifyRisk fails safe to null when AI throws or returns non-JSON", async () => {
    const throwingEnv = {
      AI: {
        run: vi.fn().mockRejectedValue(new Error("AI overload 503")),
      },
    };
    expect(await classifyRisk(throwingEnv, "test")).toBeNull();

    const invalidJsonEnv = {
      AI: {
        run: vi.fn().mockResolvedValue({ response: "I cannot classify this." }),
      },
    };
    expect(await classifyRisk(invalidJsonEnv, "test")).toBeNull();
  });

  it("triageWithClassifier skips classifier entirely when lexicon hits Tier 1 (zero added latency)", async () => {
    const aiRun = vi.fn();
    const env = { AI: { run: aiRun } };

    const result = await triageWithClassifier("my baby is not breathing", env);
    expect(result.tier).toBe(1);
    expect(aiRun).not.toHaveBeenCalled();
  });

  it("triageWithClassifier escalates safe message when classifier identifies risk", async () => {
    const aiRun = vi.fn().mockResolvedValue({
      response: JSON.stringify({
        tier: 1,
        confidence: 0.94,
        category: "acute_respiratory_distress",
      }),
    });
    const env = { AI: { run: aiRun } };

    const result = await triageWithClassifier("infant has chest sucking in deeply with every breath", env);
    expect(result.tier).toBe(1);
    expect(result.signal_categories).toContain("acute_respiratory_distress");
  });
});
