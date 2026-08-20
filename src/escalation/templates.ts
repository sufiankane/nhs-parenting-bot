import { SignpostPayload } from "./types";
import { deepFreeze } from "./contacts";

export const TIER_1_TEMPLATE: Readonly<Omit<SignpostPayload, "services">> = deepFreeze({
  tier: 1,
  headline: "Your child needs help right now",
  reason_plain_language:
    "Based on what you've described, your child — or someone around them — may be in immediate danger. Don't wait. Call 999 or go to your nearest A&E right away.",
});

export const TIER_2_TEMPLATE: Readonly<Omit<SignpostPayload, "services">> = deepFreeze({
  tier: 2,
  headline: "Your child needs urgent medical advice",
  reason_plain_language:
    "This sounds like it needs medical attention today, but it's not a 999 emergency. Call NHS 111 or contact your GP or health visitor for advice.",
});

export const TIER_3_TEMPLATE: Readonly<Omit<SignpostPayload, "services">> = deepFreeze({
  tier: 3,
  headline: "You're not alone — there are people who can help",
  reason_plain_language:
    "What you're going through matters, and there are free, confidential services ready to listen and help you and your child. You don't need to handle this on your own.",
});