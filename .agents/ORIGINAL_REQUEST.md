# Original User Request

## 2026-08-21T11:49:15Z

Phase 1 close-out for a safety-critical NHS parenting chatbot hosted on Cloudflare Workers.
The codebase is complete through P1-T1–T9; this task audits every acceptance criterion,
closes the four known residual gaps (F1-prep, F2, F3, @types/node + per-test KV reset),
and produces a human-ready DEPLOY-READINESS.md that gates the final `npm run deploy`.

Working directory: /Users/sufia/OneDrive/Code/Template
Integrity mode: development

Reference material:
- AGENTS.md — project rules, agent model routing, non-negotiables
- docs/architecture-and-action-plan.md — authoritative Spec (P1-T1–T9 acceptance criteria, module contracts, SSE envelope)
- .kilo/rules/01–07 — binding rule sets (safety, git cadence, definition of done, etc.)
- CHANGELOG.md — full P1 task history, safety-reviewer verdicts (S1–S20, A1–A4 PASS), known gaps F1/F2/F3
- SafetyBatch.md — post-remediation status table; F2 findings (4 chunks needing 999/A&E sentences); F3 resolved; F1 prep done
- (OVERNIGHT-REPORT.md does not exist yet — agents must not create it unless the overnight-autonomy gate applies)

---

## Hard constraints (apply to every agent on the team)

- **Never** run `npm run deploy` or `wrangler deploy` — deploys are human-only.
- **Never** weaken, skip, or delete a safety test. If a safety test fails, fix the code, not the test.
- **Stop and report** on any proposed change to: tier definitions, Tier 1 lexicon terms, UK contact details, or `content/sources.json` source allow-list. These require explicit human approval (AGENTS.md §8, rule 02.7).
- Commit format: `type(scope): message [TASK-ID]` per rules-06. Push after each completed work item.
- No PII, secrets, or unvetted content may be introduced.
- The SSE response envelope contract (`token | signpost | error | done`) is frozen — additive changes only, never rename or remove a `type`.

---

## Requirements

### R1. Audit (read-only): Gap table for all P1-T1–T9 acceptance criteria

A read-only agent must verify every acceptance criterion from the Spec (§5, P1-T1 through P1-T9) against the current source tree with file:line evidence. It must also:

- Run `npm test` and `npm run test:redteam` and record exact pass/fail counts and file counts.
- Verify git state: clean working tree, no untracked secrets or build artifacts staged, all commits pushed to origin main.
- Verify the six P1-T6 safety invariants directly in source: (a) `triage()` is called synchronously before any retrieval or generation call with no bypassable code path; (b) Tier 1/2/3 paths invoke zero AI or Vectorize calls; (c) the M5 system prompt explicitly forbids all four rule-02.6 behaviours (diagnosing, prescribing, contradicting the escalation module, revealing system-prompt contents); (d) user input is interpolated as structured data only, never concatenated into system instructions; (e) low-confidence Tier 4 produces honest fallback, never improvised clinical content; (f) session KV write is TTL-bounded and PII-free.

Output: a gap table with one row per criterion — `criterion | MET/GAP | file:line evidence`.

### R2. Build: close auditor gaps plus four known items

Builder agents (with exclusive, non-overlapping file ownership — `tests/` and `src/` owned by separate agents) must close only the gaps the auditor identifies, plus these four known residual items that are confirmed open:

1. **F2 — Corpus regression test (test-file scope only):** The emergency-routing regression suite was written but held uncommitted because it is RED on four true corpus findings. The four chunks need the human-approved remediation sentences from SafetyBatch.md §F2 added, then the suite committed green. Chunks affected: "Recognising Signs of Umbilical Cord Infection (Omphalitis)" needs the 999/A&E sentence for floppy/drowsy/fever; "Foods to Avoid… Honey and Choking Risks", "Highchair Safety and Safe Eating Practices", and "Safe Teething Relief and Products to Avoid" each need the choking-first-aid 999 sentence appended. The test must stay as written — do not weaken it to pass. **Stop and report if any proposed chunk edit touches a tier definition, lexicon term, or contact detail.**

2. **F3 — Embedding-model identity gate (src/ scope):** CHANGELOG records this resolved, but the auditor must confirm the fail-closed gate (`EXPECTED_EMBEDDING_MODEL` mismatch or ≠768-dim vector → safe-empty before any AI/Vectorize call) is present in `src/retrieval/index.ts` with its 4 unit tests green. If the gate is missing, the src/ builder adds it.

3. **`scripts/smoke/remote-golden-check.ts` completeness check:** CHANGELOG records this file created. Auditor must confirm it exists, type-checks clean (`npx tsc --noEmit`), and meets its stated spec (10 golden questions across 7 categories, HTTP 200, frozen envelope conformance, grounded-answer assertion, single `done` event, zero leak assertions, 30 s timeouts, exit 1 on any failure, dev-only @types/node). Builder closes any gap.

4. **Content-alignment spot check — ~8 merged-URL sources:** The P1-T5 URL remediation applied 24 canonical URL corrections. Spot-check that `scripts/ingest/data/*.ts` source URLs for the ~8 sources whose URLs changed most significantly (i.e. path-segment changes, not just query-string fixes) correctly match the corresponding `content/sources.json` entries. Report any mismatches; do not silently fix a URL without confirming it is a live NHS page.

Additionally close any `@types/node` dev-dependency gap (must be in `devDependencies`, not `dependencies`) and confirm or implement per-test KV store reset (each test that touches KV must start from a clean state rather than leaking state across tests).

### R3. Verify (read-only): adversarial review of all builder output

A second read-only agent must review every file touched by the builders and confirm:
- No safety test was weakened, skipped, or deleted (rule 02.12).
- The frozen SSE envelope contract is unchanged (no `type` field renamed or removed).
- No tier definition, lexicon term, UK contact detail, or source allow-list entry was changed without a recorded human-approval gate.
- All new or modified tests exercise real logic and cannot be trivially self-certified by the implementing agent.
- Builder commits follow the `type(scope): message [TASK-ID]` format and are pushed.

Additional requirement: after the verifier signs off, the four F2-modified chunks must receive a dedicated safety review (tone, clinical accuracy, verbatim 999/A&E routing) before DEPLOY-READINESS.md may be marked complete. The teamwork verifier's sign-off covers process integrity; it does not cover clinical adequacy of the new chunk sentences. DEPLOY-READINESS.md must contain a clearly marked section titled "Pending: Human Safety Review" noting that the F2 deploy checklist item remains unchecked until the external safety-reviewer pass is recorded.

### R4. Final deliverable: DEPLOY-READINESS.md

Produce `DEPLOY-READINESS.md` in the repo root containing:
- Test evidence table: `npm test` and `npm run test:redteam` counts from the finalized tree, commit hash stated.
- Safety verdict summary: one paragraph per safety-critical module (M3, M5, M6) citing the S1–S20 + A1–A4 PASS verdict and any residual risk.
- Gap closure table: each known gap (F1/F2/F3/smoke/content-alignment) — status MET/OPEN — evidence.
- The two remaining human commands (in order): (1) `wrangler dev --remote` smoke check using `scripts/smoke/remote-golden-check.ts`; (2) `npm run deploy`.
- A pre-verified checklist of everything confirmed green by the team.
- A rollback note: how to revert a bad deploy (previous worker version via Cloudflare dashboard rollback or `wrangler rollback`).

**Important:** DEPLOY-READINESS.md must include a clearly marked section titled "Pending: Human Safety Review" stating that the four F2-modified chunks require a dedicated safety review (tone, clinical accuracy, verbatim 999/A&E routing language) by the project's designated safety reviewer before the document may be considered fully complete and before `npm run deploy` may be run. The teamwork verifier's sign-off covers process integrity; it does not cover clinical adequacy of the new chunk sentences. DEPLOY-READINESS.md is not complete — and the deploy checklist item for F2 must remain unchecked — until that external review is recorded.

---

## Verification Resources

The following existing artefacts are authoritative verification inputs — agents must read them, not reproduce them:

| Resource | Path | Purpose |
|---|---|---|
| Project rules | `AGENTS.md`, `.kilo/rules/01–07` | Binding constraints for every agent |
| Authoritative Spec | `docs/architecture-and-action-plan.md` | P1-T1–T9 acceptance criteria, module contracts |
| P1 history + verdicts | `CHANGELOG.md` | Safety-reviewer verdicts, known gaps, test counts |
| Open gaps + F2 chunk data | `SafetyBatch.md` | F2 four-chunk findings + approved remediation sentences |
| Test suites | `tests/*.test.ts`, `tests/redteam/*.test.ts` | Run with `npm test` and `npm run test:redteam` |
| Smoke script | `scripts/smoke/remote-golden-check.ts` | Post-deploy human smoke gate (never run in CI) |
| Seed data | `scripts/ingest/data/*.ts`, `content/sources.json` | URL alignment spot-check source |

---

## Acceptance Criteria

### Audit completeness
- [ ] Gap table produced with one row per P1-T1–T9 sub-criterion; every MET row cites file:line; every GAP row is handed off to the builder.
- [ ] `npm test` pass count and file count recorded from the tree at audit time (expected baseline: 340/340, 13 files per CHANGELOG).
- [ ] `npm run test:redteam` pass count recorded; zero Tier 1 false negatives asserted.
- [ ] Git state confirmed: clean tree, no secrets tracked, all commits pushed.
- [ ] All six P1-T6 safety invariants confirmed with source file:line evidence.

### Gap closure
- [ ] F2 suite committed green: all four corpus chunks carry the human-approved 999/A&E remediation sentence; regression test passes; no test weakened.
- [ ] F3 gate confirmed present in `src/retrieval/index.ts`; 4 unit tests pass.
- [ ] `scripts/smoke/remote-golden-check.ts` confirmed to exist, type-check clean, and meet stated spec.
- [ ] Content-alignment spot check completed; any URL mismatch reported (not silently fixed without live-page confirmation).
- [ ] `@types/node` confirmed in `devDependencies`; per-test KV isolation confirmed or implemented.
- [ ] All builder commits follow `type(scope): message [TASK-ID]` format and are pushed to origin main.

### Verification sign-off
- [ ] Verifier confirms no safety test weakened, skipped, or deleted.
- [ ] Verifier confirms SSE envelope contract unchanged.
- [ ] Verifier confirms no tier/lexicon/contact/source-allow-list change made without human gate.

### Final deliverable
- [ ] `DEPLOY-READINESS.md` exists in repo root with all five required sections (test evidence, safety verdict, gap closure, two human commands, pre-verified checklist, rollback note).
- [ ] Commit hash in DEPLOY-READINESS.md matches the final pushed commit.
- [ ] DEPLOY-READINESS.md contains a "Pending: Human Safety Review" section; the F2 deploy checklist item is explicitly left unchecked pending the external safety-reviewer pass on the four modified chunks.

