import { SignpostEvent, SignpostPayload, SignpostService } from "./types";
import {
  EMERGENCY_SERVICES,
  NHS_111,
  TIER_3_CONTACTS,
  deepFreeze,
} from "./contacts";
import {
  TIER_1_TEMPLATE,
  TIER_2_TEMPLATE,
  TIER_3_TEMPLATE,
} from "./templates";

export * from "./types";
export * from "./contacts";
export * from "./templates";

/**
 * Pure synchronous escalation router.
 * Accepts ONLY the pre-classified tier number (rule 02.7).
 *
 * Rule 02.2: Deterministic escalation — Tier 1-3 come strictly from hard-coded templates.
 * Rule 02.4: Contacts are constants.
 * Rule 02.7: Zero user text in signposts.
 * Rule 04.13: Pure synchronous functions.
 */
export function escalate(tier: 1 | 2 | 3 | 4): SignpostEvent | null {
  if (tier === 4) {
    return null;
  }

  let services: readonly SignpostService[];
  let template: Readonly<Omit<SignpostPayload, "services">>;

  switch (tier) {
    case 1:
      services = [EMERGENCY_SERVICES];
      template = TIER_1_TEMPLATE;
      break;
    case 2:
      services = [NHS_111];
      template = TIER_2_TEMPLATE;
      break;
    case 3:
      services = TIER_3_CONTACTS;
      template = TIER_3_TEMPLATE;
      break;
    default:
      return null;
  }

  const payload: SignpostPayload = deepFreeze({
    tier: template.tier,
    headline: template.headline,
    reason_plain_language: template.reason_plain_language,
    services,
  });

  return deepFreeze({
    type: "signpost",
    payload,
  });
}