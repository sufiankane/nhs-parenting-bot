import * as fs from "node:fs";
import * as path from "node:path";
import { SourcesFile, NHSSource } from "./types.js";

const sourcesFilePath = path.resolve("content/sources.json");
const existingData: SourcesFile = JSON.parse(fs.readFileSync(sourcesFilePath, "utf-8"));

const CHARITY_SOURCES: NHSSource[] = [
  {
    id: "charity-lullaby-trust-safer-sleep",
    title: "The Lullaby Trust: Safer Sleep for Babies and SIDS Prevention",
    url: "https://www.lullabytrust.org.uk/safer-sleep-advice/",
    category: "sleep",
    description: "Evidence-based infant safer sleep advice, room temperature management (16–20°C), firm flat mattress standards, clear cot guidance, and co-sleeping risk factors.",
    authority: "The Lullaby Trust",
    last_reviewed: "2026-08-22",
    enabled: true,
    license: "UK Charity Information / Educational Guidance"
  },
  {
    id: "charity-cry-sis-coping-with-crying",
    title: "Cry-sis: Coping with an Excessively Crying Baby",
    url: "https://www.cry-sis.org.uk/coping-with-crying/",
    category: "emotional-wellbeing",
    description: "Practical strategies for parents coping with persistent infant crying, understanding colic, managing parental exhaustion, and accessing volunteer listening support.",
    authority: "Cry-sis",
    last_reviewed: "2026-08-22",
    enabled: true,
    license: "UK Charity Information / Educational Guidance"
  },
  {
    id: "charity-pandas-perinatal-mental-health",
    title: "PANDAS Foundation: Perinatal Mental Health and Postnatal Depression Support",
    url: "https://pandasfoundation.org.uk/perinatal-mental-health/",
    category: "emotional-wellbeing",
    description: "Information and non-judgmental peer support for mothers, fathers, and partners affected by perinatal anxiety, postnatal depression, and postpartum mental illness.",
    authority: "PANDAS Foundation",
    last_reviewed: "2026-08-22",
    enabled: true,
    license: "UK Charity Information / Educational Guidance"
  },
  {
    id: "charity-family-lives-parenting-support",
    title: "Coram Family Lives: Early Years Parenting and Family Wellbeing",
    url: "https://www.familylives.org.uk/advice/early-years/",
    category: "emotional-wellbeing",
    description: "Guidance on positive discipline, managing toddler tantrums, building strong parent-child attachment, coping with parenting burnout, and family transition support.",
    authority: "Coram Family Lives",
    last_reviewed: "2026-08-22",
    enabled: true,
    license: "UK Charity Information / Educational Guidance"
  },
  {
    id: "charity-home-start-family-support",
    title: "Home-Start UK: Volunteer Home-Visiting and Early Years Family Support",
    url: "https://www.home-start.org.uk/our-support/",
    category: "emotional-wellbeing",
    description: "Trained community volunteer support for families with children under five, reducing parental isolation, building confidence, and establishing healthy routines.",
    authority: "Home-Start UK",
    last_reviewed: "2026-08-22",
    enabled: true,
    license: "UK Charity Information / Educational Guidance"
  },
  {
    id: "charity-gingerbread-single-parents",
    title: "Gingerbread: Single Parent Wellbeing and Practical Guidance",
    url: "https://www.gingerbread.org.uk/information/wellbeing-and-mental-health/",
    category: "emotional-wellbeing",
    description: "Expert advice, emotional wellbeing strategies, and peer support network specifically tailored for single mothers and fathers.",
    authority: "Gingerbread",
    last_reviewed: "2026-08-22",
    enabled: true,
    license: "UK Charity Information / Educational Guidance"
  },
  {
    id: "charity-action-for-children-parent-talk",
    title: "Action for Children: Parent Talk Developmental and Emotional Guidance",
    url: "https://parents.actionforchildren.org.uk/baby/",
    category: "teething-development",
    description: "Professional coaching and practical articles on baby developmental milestones, sleep settling, emotional regulation, and positive behaviour management.",
    authority: "Action for Children",
    last_reviewed: "2026-08-22",
    enabled: true,
    license: "UK Charity Information / Educational Guidance"
  },
  {
    id: "charity-bliss-neonatal-care",
    title: "Bliss: Support for Premature and Sick Neonatal Babies",
    url: "https://www.bliss.org.uk/parents/in-hospital/",
    category: "newborn-care",
    description: "Guidance for families in neonatal intensive care (NICU/SCBU), kangaroo care, tube feeding transitions, expressing milk in hospital, and neonatal parent mental health.",
    authority: "Bliss",
    last_reviewed: "2026-08-22",
    enabled: true,
    license: "UK Charity Information / Educational Guidance"
  },
  {
    id: "charity-tommys-pregnancy-postnatal",
    title: "Tommy's: Postnatal Recovery and Maternal Wellbeing",
    url: "https://www.tommys.org/baby-care/sleep/",
    category: "newborn-care",
    description: "Clinical research and midwife-led guidance on physical birth recovery, maternal mental health, birth trauma processing, and newborn sleep understanding.",
    authority: "Tommy's",
    last_reviewed: "2026-08-22",
    enabled: true,
    license: "UK Charity Information / Educational Guidance"
  },
  {
    id: "charity-nct-infant-feeding",
    title: "National Childbirth Trust (NCT): Responsive Infant Feeding and Early Days",
    url: "https://www.nct.org.uk/baby-toddler/feeding/",
    category: "feeding",
    description: "Antenatal preparation, responsive breastfeeding and bottle feeding, formula preparation safety, combination feeding, and community peer groups.",
    authority: "NCT",
    last_reviewed: "2026-08-22",
    enabled: true,
    license: "UK Charity Information / Educational Guidance"
  },
  {
    id: "charity-ihv-parent-tips",
    title: "Institute of Health Visiting (iHV): Parent Tips for Child Health and Development",
    url: "https://ihv.org.uk/families/top-tips-for-parents/",
    category: "newborn-care",
    description: "Clinical Top Tips developed by UK health visitors covering routine developmental reviews, child health assessments, weaning readiness, and illness red flags.",
    authority: "Institute of Health Visiting",
    last_reviewed: "2026-08-22",
    enabled: true,
    license: "UK Charity Information / Educational Guidance"
  },
  {
    id: "charity-icon-infant-crying",
    title: "ICON Cope: Babies Cry, You Can Cope Programme",
    url: "https://iconcope.org/parents-advice/",
    category: "newborn-care",
    description: "Public health guidance on managing infant crying: Infant crying is normal, Comforting methods, OK to walk away, and Never shake a baby.",
    authority: "ICON Cope",
    last_reviewed: "2026-08-22",
    enabled: true,
    license: "UK Charity Information / Educational Guidance"
  },
  {
    id: "charity-fatherhood-institute",
    title: "Fatherhood Institute: Paternal Mental Health and Dad-Baby Bonding",
    url: "https://fatherhoodinstitute.org/for-fathers/",
    category: "emotional-wellbeing",
    description: "Evidence-based resources and fatherhood guidance supporting dads and non-birthing partners in bonding, active caregiving, and paternal mental health.",
    authority: "Fatherhood Institute",
    last_reviewed: "2026-08-22",
    enabled: true,
    license: "UK Charity Information / Educational Guidance"
  }
];

const sourceMap = new Map<string, NHSSource>();
for (const s of existingData.sources) {
  sourceMap.set(s.id, s);
}
for (const c of CHARITY_SOURCES) {
  sourceMap.set(c.id, c);
}

const sourcesData: SourcesFile = {
  $schema: existingData.$schema || "https://json-schema.org/draft/2020-12/schema",
  version: existingData.version || "1.0.0",
  last_updated: new Date().toISOString().slice(0, 10),
  authoritative_domain: "nhs.uk",
  categories: existingData.categories,
  sources: Array.from(sourceMap.values())
};

fs.writeFileSync(sourcesFilePath, JSON.stringify(sourcesData, null, 2) + "\n", "utf-8");
console.log(`Generated content/sources.json with ${sourcesData.sources.length} sources across ${sourcesData.categories.length} categories.`);
process.exit(0);
