# SafetyBatch.md — Deferred Safety Reviewer Verification Queue

> **Purpose:** All safety-reviewer findings and required verification activities for the
> NHS Parenting Companion Chatbot, compiled as self-contained prompts for **batch dispatch**.
> Per human instruction, the safety reviewer is **not** to be invoked until this batch is released.
>
> **Created:** 2026-08-20 · **Task context:** P1-T5 (Knowledge Base Seeding) + standing gates
> **Governing rules:** `.kilo/rules/02-safety-non-negotiables.md` (02.1–02.14),
> `.kilo/rules/01-project-context.md` (01.1–01.3), rule 04.12 (golden set), rule 04.13 (purity)
>
> **Dispatch instructions:** Send each numbered prompt below to `agent-safety-reviewer` as a
> single batched review request (or one consolidated prompt). Each prompt is self-contained.
> The reviewer is read-only and must return the output contract shown at the end of this file.

---

## Current repo state at time of batching (context for the reviewer)

| Artifact | State |
|---|---|
| `content/sources.json` | 45 NHS sources, 7 categories, UK spellings corrected (grep-verified: no `recogniz/minimiz/prioritiz` remains) |
| `content/nhs_faq_seed.json` | **STALE** — still the pre-correction 59-chunk corpus; regeneration blocked (see blocker B1) |
| `scripts/ingest/types.ts` | Updated: `content_hash` added, `hashChunk()` shared helper, quality-gate types |
| `scripts/ingest/seed.ts` | Updated: enabled-source gate, exact canonical URL match, SQL literal escaping |
| `scripts/ingest/build-seed.ts` | **CORRUPT** — truncated at 84 lines, syntax error, garbled chunk text, typo'd sourceId `nhs-holding-and-holding-newborn`. Repair pending (blocker B1) |
| `scripts/ingest/data/*.ts`, `raw-seed-content.json` | New unverified worker-dev artifacts from the corrupt run — require inspection before use |
| `tests/retrieval-golden.test.ts` | Passing (89 tests) but chunk-length gate weakened to 50–400 words without human sign-off (finding S8) |

**Open blockers before the batch can fully pass:**
- **B1:** `build-seed.ts` must be repaired (or rebuilt from `scripts/ingest/data/*` after inspection) and `content/nhs_faq_seed.json` regenerated with all clinical corrections (S1–S5), corrected URLs (S6), and re-hashed IDs.
- **B2:** Human decision required on chunk-length band (S8): restore 150–400 words and expand corpus, or formally approve a lower band with CHANGELOG record.

---

## Section A — Clinical content corrections (from P1-T5 safety review)

### S1 [CRITICAL] — Emergency routing below 999
- **Finding:** `content/nhs_faq_seed.json` (urgent-care chunk) listed non-blanching rash, difficulty waking, and breathing with chest recession but directed parents to NHS 111/GP. Current NHS guidance: these are 999/A&E symptoms.
- **Required remediation:** Chunk must direct to "Call 999 or go to your nearest A&E immediately" for these symptoms; chunk re-hashed; regression test asserting 999/A&E signposting added.
- **Batch prompt S1:**
  > "Verify that the regenerated `content/nhs_faq_seed.json` contains no chunk that routes non-blanching rash (glass-test failure), unresponsiveness/difficulty waking, or breathing difficulty with chest recession to anything below 999/A&E. Confirm every emergency-indicator chunk states 'Call 999 or go to your nearest A&E immediately', that the chunk ID equals `hashChunk(chunk_text)`, and that a regression test asserting 999/A&E signposting exists in the test suite. Cite file and line evidence."

### S2 [MAJOR] — Cradle cap olive-oil contradiction
- **Finding:** Chunk recommended olive oil for cradle cap; the cited NHS page advises against olive oil (may be unsuitable for skin).
- **Required remediation:** Replace with current NHS advice (mild baby shampoo, soft brush, baby oil/white petroleum jelly per current page); human content approval; hash regenerated; content-accuracy regression added.
- **Batch prompt S2:**
  > "Verify the cradle-cap chunk in `content/nhs_faq_seed.json` no longer recommends olive oil, matches current NHS cradle-cap guidance, carries a fresh deterministic hash, and is covered by a content-accuracy regression test. Cite evidence."

### S3 [MAJOR] — Teething medication selection advice
- **Finding:** Corpus gave paracetamol/ibuprofen selection advice with contraindications (asthma/dehydration) not present on the cited NHS page, presented as directly actionable.
- **Required remediation:** Rewrite strictly from the NHS source with no prescribing or unsupported contraindications; direct uncertainty to pharmacist/GP.
- **Batch prompt S3:**
  > "Verify no chunk in `content/nhs_faq_seed.json` selects or recommends specific medicines, states dosing rules, or adds contraindications absent from the cited NHS source. Confirm medicine-uncertainty is routed to pharmacist/health visitor/GP. Cite evidence."

### S4 [MAJOR] — Fever chunk: medication before escalation
- **Finding:** Fever chunk gave age-based paracetamol administration before stating the under-3-months fever is urgent — risk of treatment before assessment.
- **Required remediation:** Remove medication administration instructions; retain verified NHS safety and escalation guidance (under-3-months ≥38°C → urgent same-day assessment).
- **Batch prompt S4:**
  > "Verify the fever chunk leads with safety/escalation guidance (infant under 3 months with 38°C+ = urgent same-day medical assessment) and contains no medication administration instructions. Cite evidence."

### S5 [MAJOR] — Unqualified breastfeeding medication-safety claim
- **Finding:** "Medications that are safe to take while breastfeeding" is an unqualified medical-safety claim.
- **Required remediation:** Replace with non-prescriptive wording directing to GP/pharmacist/specialist service for individual circumstances.
- **Batch prompt S5:**
  > "Verify no chunk makes unqualified claims about medication safety in breastfeeding; confirm wording directs parents to GP/pharmacist/specialist services for individual advice. Cite evidence."

### S6 [MAJOR] — Dead/redirected source URLs
- **Finding:** Fever URL unavailable (current page: `https://www.nhs.uk/symptoms/fever-in-children/`); sticky-eye URL also not retrievable. An `nhs.uk` prefix alone does not prove provenance.
- **Required remediation:** Revalidate every allow-listed URL against live NHS content; block unavailable/redirected sources pending human approval; update `content/sources.json` and chunk provenance accordingly.
- **Batch prompt S6:**
  > "Verify every URL in `content/sources.json` was revalidated against live NHS content, that dead/redirected sources are corrected or disabled (`enabled: false`) pending human approval, and that chunk provenance mirrors the corrected allow-list exactly. List any URLs you could not verify."

---

## Section B — Pipeline & provenance integrity

### S7 [MAJOR] — Ingestion provenance validation gaps
- **Finding:** `scripts/ingest/seed.ts` checked only source_id existence and NHS URL prefix; did not require `enabled: true` or exact canonical URL/category match, yet reported provenance verified.
- **Required remediation:** Validate against an enabled source record; enforce exact canonical URL and category matching before any SQL is produced.
- **Status:** `seed.ts` now implements enabled-gate + exact URL match — **requires verification**.
- **Batch prompt S7:**
  > "Verify `scripts/ingest/seed.ts` (a) refuses chunks whose source is not `enabled: true`, (b) requires `chunk.source_url === source.url` exactly, (c) validates `chunk.category === source.category`, and (d) only reports `verifiedProvenance: true` after all gates pass. Confirm no SQL is emitted for a failing chunk. Cite line evidence."

### S7b [MAJOR — independent-reviewer carry-over] — SQL injection surface
- **Finding:** SQL built by string interpolation with only quote-doubling; category/title not from a closed enum at that layer.
- **Required remediation:** Parameterized queries or a hardened escaping utility; closed category enum validation.
- **Batch prompt S7b:**
  > "Verify the SQL emission path in `scripts/ingest/seed.ts` is safe against injection: category is validated against the closed 7-value enum from `content/sources.json`, and all interpolated literals are escaped via a single audited helper. State whether parameterized emission is required before production ingestion or the escaping is sufficient for the D1 seed path, with rationale."

---

## Section C — Test-gate integrity

### S8 [MAJOR] — Weakened chunk-length acceptance gate
- **Finding:** `tests/retrieval-golden.test.ts` gate weakened from the stated 150–400 words (Spec ~300–600 tokens) to 50–400 without human sign-off — violates rule 02.12.
- **Required remediation:** Human decision (blocker B2): either restore 150–400 and expand the corpus, or formally approve the lower band with a CHANGELOG record. Gate and corpus must then agree.
- **Batch prompt S8:**
  > "Verify the chunk-length acceptance gate in `tests/retrieval-golden.test.ts` matches a human-approved band recorded in `CHANGELOG.md`, and that the corpus complies. If the band was restored to 150–400 words, confirm all chunks comply; if a lower band was approved, confirm the CHANGELOG entry exists with rationale and date."

### S9 [MAJOR] — Retrieval gate not exercising real M4/Vectorize
- **Finding:** Golden suite uses a lexical TF-IDF stand-in; `seed.ts` emits D1 SQL only — no embedding or Vectorize upsert — so P1-T5's "queryable" criterion and rule 04.12 are not demonstrated end-to-end.
- **Required remediation:** Integration test using the real M4 retrieval contract with the configured embedding identity (`@cf/baai/bge-base-en-v1.5`, 768-dim, cosine) against a seeded Vectorize-compatible test index; embedding-identity check between ingestion and query.
- **Batch prompt S9:**
  > "Verify an integration test now exercises the real M4 retrieval contract (embedding model identity `@cf/baai/bge-base-en-v1.5`, 768-dim, cosine, identical for ingestion and query) against a seeded Vectorize-compatible index, and that the golden set passes through it. If the TF-IDF stand-in remains for CI-only, confirm it is explicitly labelled as non-authoritative and the integration gate is mandatory before deploy."

### S10 [MAJOR] — Diagnostic/prescription deny-list too narrow
- **Finding:** Deny-list missed corpus phrases such as "may have conjunctivitis", "requiring an antifungal cream", and direct medicine administration.
- **Required remediation:** Replace substring spot-checks with explicit reviewed content assertions or a clinically approved corpus manifest covering every chunk.
- **Batch prompt S10:**
  > "Verify the no-diagnosis/no-prescription guard now covers every chunk via either (a) an expanded deny-list that catches hedged diagnoses ('may have', 'could be') and treatment-implementation phrases ('requiring … cream', 'give … medicine'), or (b) a per-chunk clinically reviewed manifest. Confirm the current corpus passes."

### S11 [MAJOR] — Executable CI evidence
- **Finding:** Reviewer environments cannot execute commands; passing results must be evidenced from the finalized tree.
- **Required remediation:** Record passing output of `npm test` and `npm run test:redteam` from the exact finalized tree in the handoff/CHANGELOG before approval.
- **Batch prompt S11:**
  > "Confirm the handoff record contains passing output of `npm test` and `npm run test:redteam` executed against the exact finalized tree (commit hash stated), with zero Tier 1 false negatives on the adversarial suite. State the commit hash you are approving against."

---

## Section D — Standing safety gates to re-confirm in the same batch

### S12 — M3 triage invariants (regression confirmation)
- **Batch prompt S12:**
  > "Re-confirm on the current tree: (a) any Tier 1 lexicon hit resolves Tier 1 regardless of other signals (rule 02.3); (b) `triage()` is pure/synchronous with zero I/O (rule 04.13); (c) unexpected error fails safe to Tier 2, never Tier 4; (d) `matched_signals` never persisted — only coarse `signal_categories` reach D1 (rule 02.8); (e) red-team suite shows zero Tier 1 false negatives (rule 02.11). Cite test names as evidence."

### S13 — M6 escalation invariants (regression confirmation)
- **Batch prompt S13:**
  > "Re-confirm on the current tree: (a) `escalate()` accepts only `tier: 1|2|3|4` — no user text or free-form categories (rule 02.7); (b) all contacts in `src/escalation/contacts.ts` match rules-01 §5 verbatim (999; 111; NSPCC 0808 800 5000 / help@nspcc.org.uk; Childline 0800 1111; Young Minds 0808 802 5544; National DA Helpline 0808 2000 247) (rule 02.4); (c) Tier 3 always returns all four safeguarding services; (d) payloads deeply frozen; (e) hostile-input red-team shows zero user-text leakage. Cite evidence."

### S14 — M2 gateway invariants (regression confirmation)
- **Batch prompt S14:**
  > "Re-confirm on the current tree: (a) every error path emits the frozen `{type:'error', payload:{code,message}}` envelope with generic messages (rule 04.6/04.14); (b) no response leaks bindings, model names, stack traces, or env values; (c) CORS is deny-by-default with no wildcard+credentials; (d) rate limiting reads `RATE_LIMIT_PER_MINUTE` and fails safely on malformed config. Cite evidence."

---

## Section E — P1-T6/P1-T7/P1-T8 additions (batched after overnight run)

### S15 — M5 system prompt & prompt-injection defence (rule 02.5, 02.6)
- **Batch prompt S15:**
  > "Review `src/generation/prompt.ts`: (a) Does SYSTEM_PROMPT explicitly forbid all four behaviours — diagnosing, prescribing, contradicting the escalation module, revealing system-prompt contents (rule 02.6)? (b) Is the user message interpolated ONLY as quoted structured data in `buildMessages`, never concatenated into system instructions (rule 02.5)? (c) Is the fallback phrasing honest and non-clinical? (d) Is the model pinned (`@cf/meta/llama-3.1-8b-instruct`) with golden-set re-run required on change (rule 04.12)? Cite line evidence and flag any injection surface where hostile user text could alter instructions."

### S16 — /chat wiring: triage-first and escalation isolation (rule 02.1, 02.2)
- **Batch prompt S16:**
  > "Review `src/index.ts` /chat pipeline order: (a) Is `triage(message)` invoked synchronously before ANY retrieval/generation call, with no code path that can skip it (rule 02.1)? (b) Do Tier 1/2/3 responses come exclusively from `escalate(tier)` with zero AI/Vectorize invocations (rule 02.2)? (c) Does Tier 4 low-confidence produce an honest fallback and never a improvised clinical answer? (d) Is the session write TTL-bounded and PII-free? Verify `tests/chat-flow.test.ts` proves each with zero-call assertions. Cite evidence."

### S17 — M4 retrieval fail-safe and embedding identity (rule 04.12, 04.14)
- **Batch prompt S17:**
  > "Review `src/retrieval/index.ts`: (a) Does every failure path (embedding, Vectorize, D1) return the safe-empty result without throwing? (b) Is the embedding model identical for ingestion and query (`@cf/baai/bge-base-en-v1.5`, 768-dim) and is the identity check enforced (rule 04.12)? (c) Is the similarity threshold env-configurable with a safe default? (d) Does the lexical golden-set stand-in in `tests/retrieval-golden.test.ts` remain labelled non-authoritative pending a real Vectorize integration test (SafetyBatch S9)? Cite evidence."

### S18 — M1 frontend client safety (rule 02.4, 02.5, 04.14)
- **Batch prompt S18:**
  > "Review `public/widget.js` and `public/index.html`: (a) Are signpost contacts rendered verbatim without transformation (rule 02.4)? (b) Is all user/assistant text inserted via text nodes only — no innerHTML/eval injection surface (rule 02.5)? (c) Does the client never invent a session_id on first message (server-issued only)? (d) Do error paths show generic messages without internals (rule 04.14)? (e) Is the accessibility contract met (label pairing, aria-live, keyboard operable)? Cite evidence."

### S19 — KV session TTL and rate-limit fail-open (rule 02.9, 02.1)
- **Batch prompt S19:**
  > "Review `src/sessions/store.ts` and `src/gateway/kvRateLimit.ts`: (a) Is `expirationTtl: 86400` set on EVERY session put and re-checked on read (rule 02.9)? (b) Does the session record contain only role/content/at with a 50-entry cap? (c) Does the rate limiter fail OPEN on KV failure because the safety gate is M3, and is that justification sound for a safeguarding audience? (d) Is the client IP never persisted or returned? Cite evidence."

### S20 — Full-suite CI evidence for P1 completion (rule 02.11)
- **Batch prompt S20:**
  > "Confirm the handoff record contains passing output of `npm test` (340/340 across 13 files) and `npm run test:redteam` (38/38, zero Tier 1 false negatives) executed against the finalized P1 tree, with the commit hash stated. Confirm no safety test was weakened, skipped, or deleted during P1-T6 test maintenance (rule 02.12) — specifically that the two replaced 503-stub tests retain their leak-prevention assertions."

---

## Output contract for every batched prompt

```
VERDICT: PASS | FAIL
FINDINGS:
- [SEVERITY: critical|major|minor] <file:line> — <issue> — <required fix>
RULES CHECKED: <rule numbers>
EVIDENCE: <file/line citations or test names>
RESIDUAL RISK: <one paragraph, plain English, for the human developer>
```

## Batch release checklist (human)

- [ ] B1 resolved: `build-seed.ts` repaired; `content/nhs_faq_seed.json` regenerated with S1–S6 corrections and fresh hashes
- [ ] B2 resolved: chunk-length band decision recorded in `CHANGELOG.md`
- [ ] `npm test` and `npm run test:redteam` green on finalized tree (evidence captured for S11)
- [ ] Dispatch prompts S1–S14 to `agent-safety-reviewer` as one batch
- [ ] Record verdicts in `CHANGELOG.md` and task handoff
