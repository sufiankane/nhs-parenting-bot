# Phase 2 Task Note: Retrieval Relevance & Safety Metadata Propagation

**Scope:** M4 Retrieval & M5 Citations / Prompting  
**Status:** Queued for Phase 2 (Spec Change Required)  
**Date:** 2026-08-21  

---

## 1. Problem Statement

1. **Citation Noise:** Smoke tests and safety audits observed tangential sources appearing in the final `sources` payload for Tier 4 grounded answers (e.g. `safe-sleep-advice-for-babies` on formula queries, `sterilising-baby-bottles` on cord care).
2. **Safety Metadata Not Propagated:** The knowledge base schema contains a `safety_relevant: boolean` column in D1 and the FAQ seed, but M4 retrieval currently selects only `SELECT chunk_text, source_url` and does not propagate safety metadata into the LLM context envelope.

## 2. Proposed Phase 2 Enhancements

1. **Relative Citation Relevance Margin:**
   - Filter sources using a margin relative to the top-1 match score:
     $$\text{display\_threshold} = \max(\text{SIMILARITY\_THRESHOLD}, \text{top\_score} - \text{RELEVANCE\_MARGIN})$$
   - E.g., if top match is 0.84 and `RELEVANCE_MARGIN = 0.08`, only sources from chunks scoring $\ge 0.76$ are displayed.

2. **Category / Domain Re-Ranking:**
   - Filter out chunks belonging to unrelated categories unless cross-category relevance is exceptionally high.

3. **Safety-Relevant Context Flagging ([SAFETY]):**
   - Update D1 query in M4 to `SELECT chunk_text, source_url, safety_relevant FROM guidance_chunks`.
   - Prefix safety-critical chunks with `[SAFETY WARNING]` or pass as structured context to ensure warnings are always included verbatim in substance.

4. **Context vs Citation Separation:**
   - Distinguish between background context provided to the LLM and displayed public citations.

## 3. Prerequisite

Requires an update to `docs/architecture-and-action-plan.md` (Spec §4 M4/M5) defining the citation filtering rubric, safety prefixing convention, and configuration vars before implementation in Phase 2.

