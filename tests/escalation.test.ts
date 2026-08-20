import { describe, it, expect } from "vitest";
import { escalate } from "../src/escalation/index";
import {
  EMERGENCY_SERVICES,
  NHS_111,
  TIER_3_CONTACTS,
  NSPCC_HELPLINE,
  CHILDLINE,
  YOUNG_MINDS_PARENTS_HELPLINE,
  NATIONAL_DA_HELPLINE,
} from "../src/escalation/contacts";
import {
  TIER_1_TEMPLATE,
  TIER_2_TEMPLATE,
  TIER_3_TEMPLATE,
} from "../src/escalation/templates";
import type { SignpostEvent } from "../src/escalation/types";

describe("M6 Escalation Module — Canonical UK Contact Constants [rule 02.4, rules-01 §5]", () => {
  it("renders exact verbatim emergency numbers and contact details (rule 02.4)", () => {
    // Emergency services
    expect(EMERGENCY_SERVICES.name).toBe("Emergency services");
    expect(EMERGENCY_SERVICES.contact).toBe("999");
    expect(EMERGENCY_SERVICES.use).toBe("Immediate danger to a child or parent");

    // NHS 111
    expect(NHS_111.name).toBe("NHS 111");
    expect(NHS_111.contact).toBe("111");
    expect(NHS_111.use).toBe("Urgent medical concern, non-emergency");

    // NSPCC
    expect(NSPCC_HELPLINE.name).toBe("NSPCC Helpline");
    expect(NSPCC_HELPLINE.contact).toBe("0808 800 5000 / help@nspcc.org.uk");
    expect(NSPCC_HELPLINE.use).toBe("Worried about a child's safety or welfare");

    // Childline
    expect(CHILDLINE.name).toBe("Childline");
    expect(CHILDLINE.contact).toBe("0800 1111");
    expect(CHILDLINE.use).toBe("For the child/young person directly");

    // Young Minds
    expect(YOUNG_MINDS_PARENTS_HELPLINE.name).toBe("Young Minds Parents Helpline");
    expect(YOUNG_MINDS_PARENTS_HELPLINE.contact).toBe("0808 802 5544");
    expect(YOUNG_MINDS_PARENTS_HELPLINE.use).toBe("Child mental-health concerns");

    // National Domestic Abuse Helpline
    expect(NATIONAL_DA_HELPLINE.name).toBe("National Domestic Abuse Helpline");
    expect(NATIONAL_DA_HELPLINE.contact).toBe("0808 2000 247");
    expect(NATIONAL_DA_HELPLINE.use).toBe("Domestic abuse");
  });

  it("verifies deep immutability of all contact constants (rule 02.4)", () => {
    expect(Object.isFrozen(EMERGENCY_SERVICES)).toBe(true);
    expect(Object.isFrozen(NHS_111)).toBe(true);
    expect(Object.isFrozen(NSPCC_HELPLINE)).toBe(true);
    expect(Object.isFrozen(CHILDLINE)).toBe(true);
    expect(Object.isFrozen(YOUNG_MINDS_PARENTS_HELPLINE)).toBe(true);
    expect(Object.isFrozen(NATIONAL_DA_HELPLINE)).toBe(true);
    expect(Object.isFrozen(TIER_3_CONTACTS)).toBe(true);
  });
});

describe("M6 Escalation Module — Templates and Immutability [Spec §4 M6, rule 02.2]", () => {
  it("verifies templates are deeply frozen and match approved copy", () => {
    expect(Object.isFrozen(TIER_1_TEMPLATE)).toBe(true);
    expect(Object.isFrozen(TIER_2_TEMPLATE)).toBe(true);
    expect(Object.isFrozen(TIER_3_TEMPLATE)).toBe(true);

    expect(TIER_1_TEMPLATE.tier).toBe(1);
    expect(TIER_1_TEMPLATE.headline).toBe("Your child needs help right now");

    expect(TIER_2_TEMPLATE.tier).toBe(2);
    expect(TIER_2_TEMPLATE.headline).toBe("Your child needs urgent medical advice");

    expect(TIER_3_TEMPLATE.tier).toBe(3);
    expect(TIER_3_TEMPLATE.headline).toBe("You're not alone — there are people who can help");
  });
});

describe("M6 Escalation Module — Tier-Only Signature (Spec §4 M6, rule 02.2, rule 02.6)", () => {
  it("escalate(1) returns the canonical Tier 1 emergency signpost (rule 02.2)", () => {
    // protects rule 02.2 — deterministic Tier 1 signpost from hard-coded template
    const event: SignpostEvent | null = escalate(1);
    expect(event).not.toBeNull();
    expect(event!.type).toBe("signpost");
    expect(event!.payload.tier).toBe(1);
    // protects rule 02.2 — headline and reason_plain_language are approved copy, verbatim
    expect(event!.payload.headline).toBe(TIER_1_TEMPLATE.headline);
    expect(event!.payload.reason_plain_language).toBe(TIER_1_TEMPLATE.reason_plain_language);
    // protects rule 02.4 — the only service is the canonical 999 constant
    expect(event!.payload.services).toEqual([EMERGENCY_SERVICES]);
  });

  it("escalate(2) returns the canonical Tier 2 urgent-medical signpost (rule 02.2)", () => {
    // protects rule 02.2 — deterministic Tier 2 signpost from hard-coded template
    const event: SignpostEvent | null = escalate(2);
    expect(event).not.toBeNull();
    expect(event!.type).toBe("signpost");
    expect(event!.payload.tier).toBe(2);
    expect(event!.payload.headline).toBe(TIER_2_TEMPLATE.headline);
    expect(event!.payload.reason_plain_language).toBe(TIER_2_TEMPLATE.reason_plain_language);
    // protects rule 02.4 — the only service is the canonical NHS 111 constant
    expect(event!.payload.services).toEqual([NHS_111]);
  });

  it("escalate(3) returns the canonical Tier 3 safeguarding signpost with all 4 services (rule 02.2)", () => {
    // protects rule 02.2 — deterministic Tier 3 signpost from hard-coded template
    const event: SignpostEvent | null = escalate(3);
    expect(event).not.toBeNull();
    expect(event!.type).toBe("signpost");
    expect(event!.payload.tier).toBe(3);
    expect(event!.payload.headline).toBe(TIER_3_TEMPLATE.headline);
    expect(event!.payload.reason_plain_language).toBe(TIER_3_TEMPLATE.reason_plain_language);
    // protects rule 02.2 — a safeguarding disclosure must never drop a service
    expect(event!.payload.services).toEqual(TIER_3_CONTACTS);
    expect(event!.payload.services.length).toBe(4);
    expect(event!.payload.services).toContainEqual(NSPCC_HELPLINE);
    expect(event!.payload.services).toContainEqual(CHILDLINE);
    expect(event!.payload.services).toContainEqual(YOUNG_MINDS_PARENTS_HELPLINE);
    expect(event!.payload.services).toContainEqual(NATIONAL_DA_HELPLINE);
  });

  it("escalate(4) returns null (no signpost interruption for everyday parenting)", () => {
    // protects Spec §4.2 — Tier 4 passes through without a signpost
    expect(escalate(4)).toBeNull();
  });

  it("deeply freezes the event, payload, and services across tiers 1, 2, and 3 (rule 02.4)", () => {
    // protects rule 02.4 — a generated signpost must be immutable at runtime
    for (const tier of [1, 2, 3] as const) {
      const event = escalate(tier);
      expect(event).not.toBeNull();
      expect(Object.isFrozen(event)).toBe(true);
      expect(Object.isFrozen(event!.payload)).toBe(true);
      expect(Object.isFrozen(event!.payload.services)).toBe(true);
      for (const service of event!.payload.services) {
        expect(Object.isFrozen(service)).toBe(true);
      }
    }
  });

  it("returns identical frozen payloads across repeated calls (rule 02.2)", () => {
    // protects rule 02.2 — escalation is deterministic: same tier, same payload
    for (const tier of [1, 2, 3] as const) {
      const a = escalate(tier);
      const b = escalate(tier);
      expect(a).not.toBeNull();
      expect(b).not.toBeNull();
      expect(a!.payload).toEqual(b!.payload);
      expect(Object.isFrozen(a!.payload)).toBe(true);
      expect(Object.isFrozen(b!.payload)).toBe(true);
    }
  });

  it("is pure, synchronous, and side-effect free (rule 04.13)", () => {
    const res1 = escalate(1);
    const res2 = escalate(1);
    expect(res1).toEqual(res2);
    expect(res1 instanceof Promise).toBe(false);
  });
});
