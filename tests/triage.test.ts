import { describe, it, expect, vi } from "vitest";
import { triage, normalizeText, TIER_1_RULES, TIER_2_RULES, TIER_3_RULES } from "../src/triage/index";

// Mock normalizeText so we can force an unexpected error inside triage() and
// prove the degradation failsafe (rule 02.1: a message must never be classified
// safe solely because triage threw). The mock delegates to the real
// implementation for every input except a sentinel that throws, so the rest of
// the suite is unaffected.
vi.mock("../src/triage/normalize", async (importOriginal) => {
  const original = await importOriginal<typeof import("../src/triage/normalize")>();
  return {
    normalizeText: (input: unknown): string => {
      if (input === "__TRIGGER_DEGRADATION__") {
        throw new Error("simulated unexpected triage failure");
      }
      return original.normalizeText(input);
    },
  };
});

describe("normalizeText unit tests [rule 02.3, rule 02.11]", () => {
  it("converts full-width Unicode characters to standard ASCII via NFKD", () => {
    // Full-width "not breathing" -> "not breathing"
    const fullWidth = "\uFF4E\uFF4F\uFF54\u0020\uFF42\uFF52\uFF45\uFF41\uFF54\uFF48\uFF49\uFF4E\uFF47";
    expect(normalizeText(fullWidth)).toBe("not breathing");
  });

  it("strips zero-width and invisible format characters completely", () => {
    expect(normalizeText("not\u200Bbreathing")).toBe("notbreathing");
    expect(normalizeText("not\u200Cbreathing")).toBe("notbreathing");
    expect(normalizeText("not\u200Dbreathing")).toBe("notbreathing");
    expect(normalizeText("not\u200Ebreathing")).toBe("notbreathing"); // LTR mark
    expect(normalizeText("not\u200Fbreathing")).toBe("notbreathing"); // RTL mark
    expect(normalizeText("not\u2060breathing")).toBe("notbreathing"); // word joiner
    expect(normalizeText("not\uFEFFbreathing")).toBe("notbreathing");
    expect(normalizeText("not\u00ADbreathing")).toBe("notbreathing"); // soft hyphen
  });

  it("strips combining diacritical marks", () => {
    // e with combining acute accent
    expect(normalizeText("se\u0301izure")).toBe("seizure");
  });

  it("strips straight, curly, and modifier apostrophes so contractions match uniformly", () => {
    expect(normalizeText("isn't breathing")).toBe("isnt breathing");
    expect(normalizeText("isn\u2019t breathing")).toBe("isnt breathing"); // right single quote
    expect(normalizeText("isn\u2018t breathing")).toBe("isnt breathing"); // left single quote
    expect(normalizeText("can\u02BCt breathe")).toBe("cant breathe"); // modifier letter apostrophe U+02BC
    expect(normalizeText("won't wake up")).toBe("wont wake up");
  });

  it("maps Cyrillic and Greek homoglyphs to Latin equivalents", () => {
    // Cyrillic "о" (U+043E) and "т" (U+0442) in "not"
    expect(normalizeText("n\u043E\u0442 breathing")).toBe("not breathing");
    // Cyrillic "а" (U+0430) in "cant"
    expect(normalizeText("c\u0430nt breathe")).toBe("cant breathe");
    // Greek uppercase Nu "Ν" (U+039D)
    expect(normalizeText("\u039Dot breathing")).toBe("not breathing");
  });
});

describe("M3 Triage Module v1 — Tier 1 Classification [rule 02.1, rule 02.3]", () => {
  const tier1Cases: [string, string][] = [
    ["My baby is not breathing", "respiratory_arrest"],
    ["Child has stopped breathing after crying", "respiratory_arrest"],
    ["Baby can't breathe and lips are blue", "respiratory_arrest"],
    ["Baby isn't breathing properly", "respiratory_arrest"],
    ["Baby is not able to breathe", "respiratory_arrest"],
    ["I feel no pulse and heart stopped", "cardiac_arrest"],
    ["Cannot feel pulse on infant", "cardiac_arrest"],
    ["Need to start cpr immediately", "cardiac_arrest"],
    ["cpr", "cardiac_arrest"],
    ["Toddler is choking on a grape", "choking_obstruction"],
    ["Baby swallowed an object and airway blocked", "choking_obstruction"],
    ["Child is unconscious and won't wake up", "unresponsiveness"],
    ["Baby is completely unresponsive and floppy", "unresponsiveness"],
    ["Baby isn't waking up at all", "unresponsiveness"],
    ["Can't wake him up", "unresponsiveness"],
    ["Severe bleeding from deep cut on arm", "severe_trauma_hemorrhage"],
    ["Blood spurting from deep wound", "severe_trauma_hemorrhage"],
    ["Anaphylaxis throat closing up quickly", "anaphylaxis"],
    ["Severe allergic reaction can't breathe", "anaphylaxis"],
    ["Toddler swallowed bleach from cabinet", "poisoning_toxic_ingestion"],
    ["Baby swallowed button battery", "poisoning_toxic_ingestion"],
    ["Child drank bleach accidentally", "poisoning_toxic_ingestion"],
    ["Seizure won't stop lasting 10 minutes", "seizure_status"],
    ["Baby is having seizures right now", "seizure_status"],
    ["I want to die and end my life", "suicide_active"],
    ["Going to kill myself cannot cope", "suicide_active"],
    ["Planning to take my own life", "suicide_active"],
    ["I am feeling suicidal and overwhelmed", "suicide_active"],
    ["Thinking about self harm tonight", "self_harm_active"],
    ["I have been self-harming", "self_harm_active"],
    ["Cutting myself right now and bleeding heavily", "self_harm_active"],
    ["Purple rash won't fade under glass test", "meningitis_sepsis_emergency"],
    ["Severe burn from boiling water skin peeling off", "severe_burns"],
  ];

  it.each(tier1Cases)("classifies Tier 1: '%s' -> %s", (text, expectedCategory) => {
    // protects rule 02.3 — Tier 1 lexicon precedence
    const res = triage(text);
    expect(res.tier).toBe(1);
    expect(res.confidence).toBe(1.0);
    expect(res.signal_categories).toContain(expectedCategory);
    expect(res.matched_signals.length).toBeGreaterThan(0);
  });
});

describe("M3 Triage Module v1 — Tier 2 Classification [Spec §4 M3]", () => {
  const tier2Cases: [string, string][] = [
    ["6 week old baby fever 38 degrees", "infant_fever_under_3m"],
    ["Newborn with temperature 38.5C", "infant_fever_under_3m"],
    ["Baby can't keep fluids down and no wet nappies for 12 hours", "dehydration_vomiting"],
    ["Baby has sunken fontanelle and dry nappies all day", "dehydration_vomiting"],
    ["Spreading red rash with temperature", "non_emergency_rash"],
    ["Toddler wheezing and ribs pulling in", "breathing_stridor_wheeze"],
    ["Child bumped head vomiting twice afterwards", "head_injury_observed"],
    ["Pus coming from ear and severe earache fever", "severe_ear_infection"],
    ["Severe tummy pain drawing legs up in pain", "acute_abdominal_pain"],
    ["Toddler won't put weight on leg after falling", "suspected_fracture"],
    ["Child had a short febrile fit earlier but is awake now", "febrile_seizure_resolved"],
    ["Eye swollen shut with yellow discharge", "eye_infection_injury"],
  ];

  it.each(tier2Cases)("classifies Tier 2: '%s' -> %s", (text, expectedCategory) => {
    const res = triage(text);
    expect(res.tier).toBe(2);
    expect(res.confidence).toBe(1.0);
    expect(res.signal_categories).toContain(expectedCategory);
    expect(res.matched_signals.length).toBeGreaterThan(0);
  });
});

describe("M3 Triage Module v1 — Tier 3 Classification [Spec §4 M3]", () => {
  const tier3Cases: [string, string][] = [
    ["Partner hit the baby and shook the baby", "physical_abuse"],
    ["My partner hits child with a belt leaving bruises", "physical_abuse"],
    ["Mother left baby alone at home with no food", "neglect"],
    ["Kids have had no food for days living in filth", "neglect"],
    ["My partner hurts me and hit me in front of kids", "domestic_abuse"],
    ["Someone is doing inappropriate touching with child", "child_sexual_abuse_grooming"],
    ["Parent too drunk to look after baby and passed out", "parental_substance_incapacitation"],
    ["I am having intrusive thoughts about harming child", "parental_mental_health_crisis"],
    ["Worried about female genital mutilation fgm", "fgm_forced_marriage"],
    ["I am scared of my dad and want to run away", "childline_direct_disclosure"],
  ];

  it.each(tier3Cases)("classifies Tier 3: '%s' -> %s", (text, expectedCategory) => {
    const res = triage(text);
    expect(res.tier).toBe(3);
    expect(res.confidence).toBe(1.0);
    expect(res.signal_categories).toContain(expectedCategory);
    expect(res.matched_signals.length).toBeGreaterThan(0);
  });
});

describe("M3 Triage Module v1 — Tier 4 Safe Queries [Spec §4 M3]", () => {
  const tier4Cases = [
    "When should I start weaning my 6 month old onto solid foods?",
    "How can I establish a good bedtime routine for my toddler?",
    "What are some healthy finger foods for a 9 month old baby?",
    "Tips for gentle potty training for a 2 year old girl",
    "How to soothe a teething baby with clean cold teething ring",
  ];

  it.each(tier4Cases)("classifies safe query as Tier 4: '%s'", (text) => {
    const res = triage(text);
    expect(res.tier).toBe(4);
    expect(res.signal_categories).toEqual([]);
    expect(res.matched_signals).toEqual([]);
    expect(res.confidence).toBe(1.0);
  });
});

describe("M3 Triage Module v1 — Non-string & Edge Inputs [Spec §4 M3]", () => {
  // protects rule 02.1 — hostile/edge input must never be misclassified as a
  // risk; non-string input is treated as empty and defaults to Tier 4.
  it.each([
    [null],
    [undefined],
    [""],
    ["   "],
    ["\n\t"],
    [123],
    [0],
    [true],
    [false],
    [{}],
    [["not breathing"]],
    [["baby is not breathing"]],
    [Symbol("x")],
  ])("returns Tier 4 with empty categories for non-string or empty input: %s", (input) => {
    const res = triage(input);
    expect(res.tier).toBe(4);
    expect(res.signal_categories).toEqual([]);
    expect(res.matched_signals).toEqual([]);
    expect(res.confidence).toBe(1.0);
  });

  it.each(["a", "x", "no", "hi", "ok"])("handles short inputs safely: '%s'", (shortStr) => {
    const res = triage(shortStr);
    expect(res.tier).toBe(4);
    expect(res.signal_categories).toEqual([]);
  });
});

describe("M3 Triage Module v1 — Compound Signals & Deduplication [Spec §4 M3, rule 02.3, rule 02.8]", () => {
  it("classifies compound Tier 2 + Tier 3 as Tier 2 and captures both categories", () => {
    // protects rule 02.3 & 02.8 — a Tier 2 medical signal escalates over a Tier 3
    // safeguarding signal, and both categories are preserved for the audit log.
    const res = triage("baby has fever under 3 months and partner hurts me");
    expect(res.tier).toBe(2);
    expect(res.signal_categories).toContain("infant_fever_under_3m");
    expect(res.signal_categories).toContain("domestic_abuse");
    expect(res.matched_signals.length).toBeGreaterThanOrEqual(2);
  });

  it("classifies compound Tier 1 + Tier 2 + Tier 3 as Tier 1 and captures all categories for audit", () => {
    // protects rule 02.3 (Tier 1 precedence) and rule 02.8 (complete category audit logging)
    const res = triage("baby is not breathing and has fever under 3 months and partner hurts me");
    expect(res.tier).toBe(1);
    expect(res.signal_categories).toContain("respiratory_arrest");
    expect(res.signal_categories).toContain("infant_fever_under_3m");
    expect(res.signal_categories).toContain("domestic_abuse");
  });

  it("deduplicates signal_categories when multiple phrases match the same category", () => {
    const res = triage("baby is not breathing and can't breathe and cannot breathe");
    expect(res.tier).toBe(1);
    expect(res.signal_categories).toEqual(["respiratory_arrest"]);
    expect(res.matched_signals.length).toBeGreaterThan(1);
  });
});

describe("M3 Triage Module v1 — Word-Boundary & Punctuation Matching [rule 02.3]", () => {
  it("does not match a lexicon phrase inside a longer word", () => {
    // "comatose" contains "coma" but must NOT trigger unresponsiveness
    expect(triage("comatose").tier).toBe(4);
    // "thrash" contains "rash" but must NOT trigger rash
    expect(triage("toddler will thrash around").tier).toBe(4);
    // "whitehit" contains "hit"
    expect(triage("the whitehit color").tier).toBe(4);
  });

  it("matches keywords adjacent to punctuation correctly", () => {
    expect(triage("baby is not breathing!").tier).toBe(1);
    expect(triage("help...not,breathing...now").tier).toBe(1);
    expect(triage("can't breathe???").tier).toBe(1);
  });

  it("still matches the standalone phrase at word boundaries (positive control)", () => {
    expect(triage("baby is in a coma").tier).toBe(1);
    expect(triage("baby is in a coma").signal_categories).toContain("unresponsiveness");
  });
});

describe("M3 Triage Module v1 — Degradation Failsafe [Spec §4 M3, rule 02.1, rule 04.13]", () => {
  it("fails safe to Tier 2 with degradation_failsafe and NEVER degrades to Tier 4 without throwing or side effects", () => {
    // protects rule 02.1 & 04.13 — a message must never be classified safe (Tier 4)
    // solely because triage threw an unexpected error, and degradation produces no I/O.
    const res = triage("__TRIGGER_DEGRADATION__");
    expect(res.tier).toBe(2);
    expect(res.tier).not.toBe(4);
    expect(res.signal_categories).toContain("degradation_failsafe");
    expect(res.confidence).toBe(0.0);
  });
});

describe("M3 Triage Module v1 — Deep Immutability [rule 02.3]", () => {
  it("verifies lexicon rules across all tiers are deeply frozen at runtime", () => {
    expect(Object.isFrozen(TIER_1_RULES)).toBe(true);
    expect(Object.isFrozen(TIER_2_RULES)).toBe(true);
    expect(Object.isFrozen(TIER_3_RULES)).toBe(true);

    for (const rules of [TIER_1_RULES, TIER_2_RULES, TIER_3_RULES]) {
      for (const rule of rules) {
        expect(Object.isFrozen(rule)).toBe(true);
        expect(Object.isFrozen(rule.phrases)).toBe(true);
      }
    }
  });
});
