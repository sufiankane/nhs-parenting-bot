import { type RawChunk, newbornCareChunks } from "./newborn-care.js";
import { feedingChunks } from "./feeding.js";
import { weaningNutritionChunks } from "./weaning-nutrition.js";
import { sleepChunks } from "./sleep.js";
import { teethingDevelopmentChunks } from "./teething-development.js";
import { minorAilmentsChunks } from "./minor-ailments.js";
import { emotionalWellbeingChunks } from "./emotional-wellbeing.js";

export type { RawChunk };

export const ALL_RAW_CHUNKS: RawChunk[] = [
  ...newbornCareChunks,
  ...feedingChunks,
  ...weaningNutritionChunks,
  ...sleepChunks,
  ...teethingDevelopmentChunks,
  ...minorAilmentsChunks,
  ...emotionalWellbeingChunks
];
