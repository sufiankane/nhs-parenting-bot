import { SignpostService } from "./types";

export function deepFreeze<T>(obj: T): Readonly<T> {
  if (obj !== null && typeof obj === "object") {
    for (const key of Object.getOwnPropertyNames(obj)) {
      const value = (obj as Record<string, unknown>)[key];
      if (value && typeof value === "object") {
        deepFreeze(value);
      }
    }
  }
  return Object.freeze(obj) as Readonly<T>;
}

export const EMERGENCY_SERVICES: SignpostService = deepFreeze({
  name: "Emergency services",
  contact: "999",
  use: "Immediate danger to a child or parent",
});

export const NHS_111: SignpostService = deepFreeze({
  name: "NHS 111",
  contact: "111",
  use: "Urgent medical concern, non-emergency",
});

export const NSPCC_HELPLINE: SignpostService = deepFreeze({
  name: "NSPCC Helpline",
  contact: "0808 800 5000 / help@nspcc.org.uk",
  use: "Worried about a child's safety or welfare",
});

export const CHILDLINE: SignpostService = deepFreeze({
  name: "Childline",
  contact: "0800 1111",
  use: "For the child/young person directly",
});

export const YOUNG_MINDS_PARENTS_HELPLINE: SignpostService = deepFreeze({
  name: "Young Minds Parents Helpline",
  contact: "0808 802 5544",
  use: "Child mental-health concerns",
});

export const NATIONAL_DA_HELPLINE: SignpostService = deepFreeze({
  name: "National Domestic Abuse Helpline",
  contact: "0808 2000 247",
  use: "Domestic abuse",
});

export const TIER_1_CONTACTS: readonly SignpostService[] = deepFreeze([
  EMERGENCY_SERVICES,
]);

export const TIER_2_CONTACTS: readonly SignpostService[] = deepFreeze([
  NHS_111,
]);

export const TIER_3_CONTACTS: readonly SignpostService[] = deepFreeze([
  NSPCC_HELPLINE,
  CHILDLINE,
  YOUNG_MINDS_PARENTS_HELPLINE,
  NATIONAL_DA_HELPLINE,
]);
