# NHS Source URL Verification Report — 2026-08-21

> **Method:** Dual-crawler verification via search MCPs (Exa fetch + Serper scrape/search).
> Control test: Serper successfully scraped a known-live nhs.uk page, confirming its 404s are
> genuine page-404s, not scraper blocking. Exa `CRAWL_NOT_FOUND` results were treated as
> inconclusive and cross-checked via Serper before any URL was declared dead.
> **Scope:** All 48 URLs in `content/sources.json` (47 enabled + 1 disabled).
> **Trigger:** SafetyBatch finding — human action outstanding: confirm allow-listed URLs resolve.

## Headline result

**22 of 48 URLs are live as-listed. 26 are dead (HTTP 404) — NHS migrated its information
architecture (Start for Life → "Best Start in Life"; `/conditions/baby/…` → `/baby/…` and
`/best-start-in-life/baby/…`; several pages consolidated or retired).**

The corrected fever URL (`https://www.nhs.uk/symptoms/fever-in-children/`, adopted during
P1-T5 remediation) is **confirmed live** — validating the safety reviewer's correction.

## Section 1 — Live as-listed (22) — no action required

| # | Source ID | URL | Verified via |
|---|---|---|---|
| 1 | nhs-washing-and-bathing-baby | /conditions/baby/caring-for-a-newborn/washing-and-bathing-your-baby/ | Exa + Serper |
| 2 | nhs-nappy-changing-hygiene | /conditions/baby/caring-for-a-newborn/how-to-change-your-babys-nappy/ | Exa |
| 3 | nhs-breastfeeding-first-days | /conditions/baby/breastfeeding-and-bottle-feeding/breastfeeding/the-first-few-days/ | Exa |
| 4 | nhs-bottle-feeding-formula-prep | /conditions/baby/breastfeeding-and-bottle-feeding/bottle-feeding/making-up-baby-formula/ | Exa |
| 5 | nhs-sterilising-baby-bottles | /conditions/baby/breastfeeding-and-bottle-feeding/bottle-feeding/sterilising-baby-bottles/ | Exa |
| 6 | nhs-introducing-solid-foods-weaning | /conditions/baby/weaning-and-feeding/babys-first-solid-foods/ | Exa |
| 7 | nhs-foods-to-avoid-giving-babies | /conditions/baby/weaning-and-feeding/foods-to-avoid-giving-babies-and-young-children/ | Exa |
| 8 | nhs-safe-weaning (choking/gagging) | /start-for-life/baby/weaning/safe-weaning/ | Exa |
| 9 | nhs-drinks-and-cups-for-babies | /conditions/baby/weaning-and-feeding/drinks-and-cups-for-babies-and-young-children/ | Exa |
| 10 | nhs-vitamins-for-babies-and-children | /conditions/baby/weaning-and-feeding/vitamins-for-children/ | Exa |
| 11 | nhs-food-allergies-in-babies | /conditions/baby/weaning-and-feeding/food-allergies-in-babies-and-young-children/ | Exa |
| 12 | nhs-helping-baby-sleep | /conditions/baby/caring-for-a-newborn/helping-your-baby-to-sleep/ | Exa |
| 13 | nhs-baby-teething-signs-and-relief | /conditions/baby/babys-development/teething/tips-for-helping-your-teething-baby/ | Exa |
| 14 | nhs-caring-for-baby-teeth | /live-well/healthy-teeth-and-gums/taking-care-of-childrens-teeth/ | Exa |
| 15 | nhs-nappy-rash-prevention-treatment | /conditions/baby/caring-for-a-newborn/nappy-rash/ | Exa |
| 16 | nhs-cradle-cap-management | /conditions/cradle-cap/ | Exa |
| 17 | nhs-colds-coughs-and-snuffles | /conditions/baby/health/colds-coughs-and-ear-infections-in-children/ | Exa |
| 18 | nhs-managing-fever-in-babies | /symptoms/fever-in-children/ (**corrected URL confirmed live**) | Exa |
| 19 | nhs-constipation-in-babies-and-children | /conditions/baby/health/constipation-in-children/ | Exa |
| 20 | nhs-baby-blues-vs-postnatal-depression | /mental-health/conditions/post-natal-depression/overview/ | Exa |
| 21 | nhs-postnatal-depression-and-anxiety | /mental-health/conditions/post-natal-depression/symptoms/ | Exa |
| 22 | nhs-parent-support-networks-and-groups | /conditions/baby/support-and-services/services-and-support-for-parents/ | Exa |

*Note: several of the above serve on legacy `/conditions/baby/…` paths whose canonical
`og:url` is now `/baby/…` (e.g. washing-and-bathing). They resolve today; canonical
alignment is optional hygiene, not a blocker.*

## Section 2 — Dead as-listed (25 enabled) — remediation proposal (REQUIRES HUMAN APPROVAL, rule 02.7)

| # | Source ID | Old URL (404) | Proposed new canonical URL | Evidence |
|---|---|---|---|---|
| 1 | nhs-soothing-crying-baby | /conditions/baby/crying-colic-and-reflux/soothing-a-crying-baby/ | `https://www.nhs.uk/baby/caring-for-a-newborn/soothing-a-crying-baby/` | Google index + JSON-LD relatedLink |
| 2 | nhs-caring-for-a-newborn-baby | /conditions/baby/caring-for-a-newborn/caring-for-a-newborn-baby/ | `https://www.nhs.uk/baby/caring-for-a-newborn/` (hub; advice page retired) | Breadcrumb IA |
| 3 | nhs-baby-dressing-temperature | /conditions/baby/caring-for-a-newborn/keeping-your-baby-warm-or-cool/ | `https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/safe-sleep-advice-for-babies/` (temperature content merged) | Google index |
| 4 | nhs-holding-and-handling-newborn | /conditions/baby/caring-for-a-newborn/holding-your-baby/ | `https://www.nhs.uk/baby/caring-for-a-newborn/what-you-will-need-for-your-baby/` (sling/T.I.C.K.S. content lives here — **scrape-verified live**) | Serper scrape |
| 5 | nhs-breastfeeding-positioning-attachment | /conditions/baby/breastfeeding-and-bottle-feeding/breastfeeding/how-to-breastfeed/ | `https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/breastfeeding/` | Google index |
| 6 | nhs-breastfeeding-challenges-sore-nipples | /conditions/baby/breastfeeding-and-bottle-feeding/breastfeeding-challenges/sore-or-cracked-nipples/ | `https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/breastfeeding-problems/sore-nipples/` | Google index |
| 7 | nhs-responsive-feeding-cues | /start-for-life/baby/feeding-your-baby/responsive-feeding/ | `https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/bottle-feeding/bottle-feeding-your-baby/feeding-on-demand/` | Google index |
| 8 | nhs-combining-breast-and-bottle-feeding | /conditions/baby/breastfeeding-and-bottle-feeding/combining-breast-and-bottle-feeding/ | `https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/bottle-feeding/combine-breast-and-bottle/` | Google index |
| 9 | nhs-weaning-first-foods-textures | /start-for-life/baby/weaning/what-to-feed-your-baby/first-foods/ | `https://www.nhs.uk/best-start-in-life/baby/weaning/what-to-feed-your-baby/from-around-6-months/` | Google index |
| 10 | nhs-baby-bedtime-routines | /start-for-life/baby/baby-sleep/bedtime-routines/ | `https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/` (routine content merged) | Google index |
| 11 | nhs-co-sleeping-and-cot-safety | /conditions/baby/caring-for-a-newborn/co-sleeping-with-your-baby/ | `https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/safe-sleep-advice-for-babies/` | Google index |
| 12 | nhs-daytime-naps-and-wake-windows | /start-for-life/baby/baby-sleep/daytime-naps/ | `https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/your-babys-sleep-patterns/` | Google index |
| 13 | nhs-toddler-sleep-challenges | /conditions/baby/sleep-and-teething/sleep-problems-in-young-children/ | `https://www.nhs.uk/baby/health/sleep-and-young-children/` | Google index |
| 14 | nhs-baby-sleep-patterns-0-to-12-months | /conditions/baby/caring-for-a-newborn/sleep-in-the-first-few-months/ | `https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/` (content merged; already allow-listed) | Google index |
| 15 | nhs-baby-development-milestones-0-6-months | /conditions/baby/babys-development/developmental-milestones/baby-development-birth-to-6-months/ | `https://www.nhs.uk/best-start-in-life/baby/baby-moves/` (milestones consolidated) | Google index |
| 16 | nhs-baby-development-milestones-6-12-months | /conditions/baby/babys-development/developmental-milestones/baby-development-6-to-12-months/ | `https://www.nhs.uk/best-start-in-life/baby/baby-moves/` | Google index |
| 17 | nhs-speech-and-language-early-talk | /start-for-life/baby/learning-to-talk/talking-0-to-6-months/ | `https://www.nhs.uk/best-start-in-life/baby/learning-to-talk/first-sounds-0-to-6-months/` | Google index |
| 18 | nhs-crawling-and-walking-development | /conditions/baby/babys-development/developmental-milestones/walking-and-sitting/ | `https://www.nhs.uk/best-start-in-life/baby/baby-moves/` | Google index |
| 19 | nhs-baby-reflux-and-spitting-up | /conditions/baby/crying-colic-and-reflux/reflux-in-babies/ | `https://www.nhs.uk/conditions/reflux-in-babies/` | Google index |
| 20 | nhs-baby-colic-signs-and-support | /conditions/baby/crying-colic-and-reflux/colic-and-crying/ | `https://www.nhs.uk/conditions/colic/` | Google index |
| 21 | nhs-postnatal-mental-health-for-partners | /mental-health/conditions/post-natal-depression/support-for-partners/ | `https://www.nhs.uk/mental-health/conditions/postnatal-depression/` (partner content merged; note "postnatal" spelling) | Google index |
| 22 | nhs-bonding-with-your-newborn-baby | /conditions/baby/caring-for-a-newborn/bonding-with-your-baby/ | `https://www.nhs.uk/best-start-in-life/baby/baby-basics/caring-for-your-baby/skin-to-skin-contact-with-your-newborn/` (bonding content merged) | Google index |
| 23 | nhs-parental-exhaustion-and-asking-for-help | (shares bonding source URL — same remediation as #22) | as #22 | — |
| 24 | nhs-maternal-mental-health-services | /start-for-life/baby/mental-health-and-wellbeing/parent-mental-health/ | `https://www.nhs.uk/best-start-in-life/baby/your-mental-health/` | Google index |
| 25 | nhs-find-mental-health-services | /service-search/mental-health/find-an-nhs-mental-health-services/ | `https://www.nhs.uk/nhs-services/mental-health-services/where-to-get-urgent-help-for-mental-health/` | Google index |

## Section 3 — Retired / unverifiable (2)

| Source ID | Status | Finding | Recommendation |
|---|---|---|---|
| nhs-sticky-eyes-and-blocked-tear-ducts | **disabled** (already excluded from seed) | No national nhs.uk page exists — only local NHS trust pages (WY Healthier Together, CUH, Hey). URL retired. | **Keep disabled.** Re-source from an approved local trust page only with explicit human approval, or drop the topic. |
| nhs-baby-sleep-patterns-0-to-12-months | enabled, dead | Content merged into an already-allow-listed page (#14 above). | Merge: re-point or retire the source; re-home its 2 chunks. |

## Governance notes

1. **No allow-list change has been applied.** Per rule 02.7 and AGENTS.md §8, source
   allow-list amendments require explicit human approval. This report is the approval artifact.
2. **Corpus impact:** the 74-chunk seed references these source URLs in provenance fields.
   Any adopted URL change requires: `content/sources.json` update → matching `source_url`
   updates in `scripts/ingest/data/*.ts` → `npx tsx scripts/ingest/build-seed.ts` regeneration
   (fresh hashes) → golden-set re-run. The ingestion gates will refuse any mismatch, so the
   pipeline enforces consistency automatically.
3. **Consolidation caution:** where NHS merged pages (temperature, sleep, milestones,
   bonding), the new canonical page is broader than the old one. Chunk text remains valid
   NHS guidance, but provenance URLs must point at pages that actually contain the cited
   guidance. Recommend the content-pipeline agent re-verify chunk-vs-page alignment for the
   8 merged-page sources after URL adoption.
4. **Verification method limitation:** search-MCP verification confirms retrievability and
   page identity (title/JSON-LD), not full-content diffing. A full content re-baseline
   (chunk text vs live page) remains with the content-pipeline agent before any re-ingestion.
