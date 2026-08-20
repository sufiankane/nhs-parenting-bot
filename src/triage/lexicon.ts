import { LexiconRule } from "./types";

/**
 * Recursively freezes an array and any nested objects/arrays so the lexicon
 * cannot be mutated at runtime. Safety: the lexicon is the Tier 1 precedence
 * source (rule 02.3); a runtime mutation could silently weaken a Tier 1 hit.
 */
function deepFreeze<T>(value: T): T {
  if (Array.isArray(value)) {
    Object.freeze(value);
    for (const item of value) {
      deepFreeze(item);
    }
  } else if (value !== null && typeof value === "object") {
    Object.freeze(value);
    for (const key of Object.keys(value)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}

export const TIER_1_RULES: readonly LexiconRule[] = deepFreeze([
  {
    category: "respiratory_arrest",
    phrases: [
      "not breathing",
      "stopped breathing",
      "stops breathing",
      "stop breathing",
      "isnt breathing",
      "isn t breathing",
      "arent breathing",
      "aren t breathing",
      "cant breathe",
      "can t breathe",
      "cannot breathe",
      "not able to breathe",
      "struggling to breathe",
      "struggling for breath",
      "stopped inhaling",
      "blue lips",
      "turning blue",
      "turned blue",
      "suffocating",
      "gasping for air",
      "gasping for breath",
    ],
  },
  {
    category: "cardiac_arrest",
    phrases: [
      "no pulse",
      "cant feel pulse",
      "can t feel pulse",
      "cannot feel pulse",
      "no heartbeat",
      "heart stopped",
      "heart not beating",
      "cardiac arrest",
      "cpr",
    ],
  },
  {
    category: "choking_obstruction",
    phrases: [
      "choking",
      "choking on",
      "something stuck in throat",
      "airway blocked",
      "inhaled object",
      "cant swallow saliva",
      "can t swallow saliva",
    ],
  },
  {
    category: "unresponsiveness",
    phrases: [
      "unconscious",
      "wont wake up",
      "won t wake up",
      "isnt waking up",
      "isn t waking up",
      "cant wake him",
      "can t wake him",
      "cant wake her",
      "can t wake her",
      "cant wake up",
      "can t wake up",
      "cant wake",
      "can t wake",
      "wont respond",
      "won t respond",
      "unresponsive",
      "passed out and wont wake",
      "passed out and won t wake",
      "floppy and unresponsive",
      "in a coma",
      "coma",
    ],
  },
  {
    category: "severe_trauma_hemorrhage",
    phrases: [
      "severe bleeding",
      "blood spurting",
      "deep wound",
      "open fracture",
      "major head trauma",
      "deep cut",
      "crushed",
      "severed",
    ],
  },
  {
    category: "anaphylaxis",
    phrases: [
      "anaphylaxis",
      "throat closing",
      "throat is closing",
      "swollen tongue and throat",
      "swollen tongue",
      "tongue is swollen",
      "allergic reaction cant breathe",
      "allergic reaction can t breathe",
      "epipen",
    ],
  },
  {
    category: "poisoning_toxic_ingestion",
    phrases: [
      "poisoned",
      "swallowed bleach",
      "drank bleach",
      "bleach",
      "cleaning product",
      "drank cleaning product",
      "ate a battery",
      "swallowed battery",
      "button battery",
      "swallowed button battery",
      "swallowed magnet",
      "medicine overdose",
      "swallowed poison",
    ],
  },
  {
    category: "seizure_status",
    phrases: [
      "seizure wont stop",
      "seizure won t stop",
      "continuous fitting",
      "having seizures",
      "having a seizure",
      "seizures",
      "seizure lasting",
      "seizure",
    ],
  },
  {
    category: "suicide_active",
    phrases: [
      "want to die",
      "going to kill myself",
      "want to kill myself",
      "wanna die",
      "suicide",
      "suicidal",
      "end my life",
      "ending my life",
      "going to end my life",
      "take my own life",
      "taking my own life",
      "took my own life",
      "take my life",
      "kill myself",
      "end it all",
      "dont want to live anymore",
      "don t want to live anymore",
      "goodbye letter",
    ],
  },
  {
    category: "self_harm_active",
    phrases: [
      "self harm",
      "self harming",
      "selfharm",
      "cutting myself",
      "slashing myself",
      "hurting myself right now",
      "bleeding from self harm",
      "took all my pills",
    ],
  },
  {
    category: "meningitis_sepsis_emergency",
    phrases: [
      "purple rash",
      "meningitis rash",
      "stiff neck with high fever",
      "grunting with blue skin",
      "glass test",
    ],
  },
  {
    category: "severe_burns",
    phrases: [
      "severe burn",
      "badly burned",
      "badly scalded",
      "chemical burn",
      "large scald",
      "skin peeling off from burn",
      "skin peeling off",
      "burned with boiling water",
    ],
  },
]);

export const TIER_2_RULES: readonly LexiconRule[] = deepFreeze([
  {
    category: "infant_fever_under_3m",
    phrases: [
      "fever under 3 months",
      "newborn with temperature",
      "baby fever 38",
      "6 week old baby fever",
      "6 week old fever",
      "4 week old temperature",
    ],
  },
  {
    category: "dehydration_vomiting",
    phrases: [
      "cant keep fluids down",
      "can t keep fluids down",
      "no wet nappies for 12 hours",
      "no wet nappies",
      "dry nappies all day",
      "sunken fontanelle",
      "no tears when crying",
    ],
  },
  {
    category: "non_emergency_rash",
    phrases: [
      "rash with temperature",
      "spreading red rash",
      "blistering rash",
      "slapped cheek with fever",
    ],
  },
  {
    category: "breathing_stridor_wheeze",
    phrases: [
      "wheezing",
      "stridor",
      "barking cough",
      "fast breathing",
      "ribs pulling in",
      "grunting breath",
    ],
  },
  {
    category: "head_injury_observed",
    phrases: [
      "bumped head vomiting",
      "drowsy after falling",
      "swelling on baby head",
      "fell off changing table",
    ],
  },
  {
    category: "severe_ear_infection",
    phrases: [
      "pus coming from ear",
      "severe earache fever",
      "swelling behind ear",
      "crying pulling ear fever",
      "severe earache",
    ],
  },
  {
    category: "acute_abdominal_pain",
    phrases: [
      "severe tummy pain",
      "drawing legs up in pain",
      "blood in stool",
      "jelly stool",
      "green vomit",
    ],
  },
  {
    category: "suspected_fracture",
    phrases: [
      "wont put weight on leg",
      "won t put weight on leg",
      "arm swollen after fall",
      "unable to move arm",
      "limping fever",
    ],
  },
  {
    category: "febrile_seizure_resolved",
    phrases: [
      "febrile fit",
      "short febrile fit",
      "short seizure with fever",
    ],
  },
  {
    category: "eye_infection_injury",
    phrases: [
      "eye swollen shut",
      "yellow discharge from baby eye",
      "yellow discharge",
      "scratched eye",
    ],
  },
]);

export const TIER_3_RULES: readonly LexiconRule[] = deepFreeze([
  {
    category: "physical_abuse",
    phrases: [
      "hit the baby",
      "shook the baby",
      "partner hits child",
      "bruises on baby",
      "slapped child",
      "belted child",
      "hits child with a belt",
    ],
  },
  {
    category: "neglect",
    phrases: [
      "left baby alone at home",
      "left baby alone",
      "no food in house for kids",
      "hungry no food for days",
      "kids have had no food",
      "living in filth",
      "unattended child",
    ],
  },
  {
    category: "domestic_abuse",
    phrases: [
      "partner hurts me",
      "scared of my husband",
      "domestic violence with children",
      "partner threatening me",
      "hit me in front of kids",
    ],
  },
  {
    category: "child_sexual_abuse_grooming",
    phrases: [
      "inappropriate touching",
      "child touched private parts",
      "online grooming",
      "older adult asking for pictures",
    ],
  },
  {
    category: "parental_substance_incapacitation",
    phrases: [
      "too drunk to look after baby",
      "passed out drugs with baby alone",
      "passed out and cant look after baby",
      "too drunk to look after",
    ],
  },
  {
    category: "parental_mental_health_crisis",
    phrases: [
      "scared i might hurt baby",
      "intrusive thoughts about harming child",
      "postpartum psychosis thoughts",
      "thoughts about harming child",
    ],
  },
  {
    category: "fgm_forced_marriage",
    phrases: [
      "female genital mutilation",
      "fgm",
      "cutting girls",
      "forced marriage",
    ],
  },
  {
    category: "childline_direct_disclosure",
    phrases: [
      "my parents hate me",
      "i am scared of my dad",
      "i want to run away from home",
      "i want to run away",
    ],
  },
]);
