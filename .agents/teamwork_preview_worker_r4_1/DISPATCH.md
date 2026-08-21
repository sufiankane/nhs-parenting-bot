# Dispatch to Documentation Worker R4

Read `C:/Users/sufia/OneDrive/Code/Template/.agents/ORIGINAL_REQUEST.md`, `C:/Users/sufia/OneDrive/Code/Template/CHANGELOG.md`, `C:/Users/sufia/OneDrive/Code/Template/SafetyBatch.md`, and `C:/Users/sufia/OneDrive/Code/Template/PROJECT.md`.
Your working directory is: `C:/Users/sufia/OneDrive/Code/Template/.agents/teamwork_preview_worker_r4_1/`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Tasks:
1. Create `DEPLOY-READINESS.md` in the repository root (`C:/Users/sufia/OneDrive/Code/Template/DEPLOY-READINESS.md`).
2. Include all required sections:
   - **Title & Executive Summary**: Phase 1 Close-Out deployment readiness status, commit hash `84ffa1dcbcb68d1fb8a6f6ea7162577d4bdbcf11` (or latest HEAD).
   - **Test Evidence Table**:
     - `npm test`: 13 files, 347 tests PASS (0 fail, 0 skip).
     - `npm run test:redteam`: 2 files, 38 tests PASS (0 fail, 0 Tier 1 false negatives).
     - `npx tsc --noEmit`: 0 errors.
   - **Safety Verdict Summary**: One paragraph per safety-critical module (M3 Safety Triage, M5 Grounded Generation, M6 Escalation & Signposting), explicitly citing historical safety-reviewer verdicts (S1–S20, A1–A4 PASS) and evaluating residual risk.
   - **Gap Closure Table**: Rows for F1 (smoke script prep), F2 (corpus emergency routing sentences & regression tests), F3 (embedding model identity gate & unit tests), Smoke script completeness, Content-alignment spot-check (74 chunks), `@types/node` in `devDependencies`, and per-test KV isolation.
   - **Two Remaining Human Commands** (in order):
     1. `wrangler dev --remote` smoke check using `scripts/smoke/remote-golden-check.ts`
     2. `npm run deploy`
   - **Pre-Verified Checklist**: Checklist of everything confirmed green by the team.
   - **Pending: Human Safety Review**: Clearly marked section stating that the 4 F2-modified chunks ("Recognising Signs of Umbilical Cord Infection (Omphalitis)", "Foods to Avoid for Babies Under 12 Months: Honey and Choking Risks", "Highchair Safety and Safe Eating Practices", "Safe Teething Relief and Products to Avoid") require dedicated human safety review for tone, clinical accuracy, and verbatim 999/A&E routing language before `npm run deploy` is executed. Note that the F2 deploy checklist item is explicitly left unchecked `[ ]` pending this external safety pass.
   - **Rollback Procedure**: Clear instructions on how to rollback a deployment via Cloudflare Dashboard or `wrangler rollback`.
3. Verify formatting and completeness of `DEPLOY-READINESS.md`.
4. Stage `DEPLOY-READINESS.md`, commit using standard format:
   `docs(deploy): add DEPLOY-READINESS report with pending safety review gate [P1-T9]`
   and push to `origin main`.
5. Write your handoff report to `C:/Users/sufia/OneDrive/Code/Template/.agents/teamwork_preview_worker_r4_1/handoff.md` and send a completion message with summary.

