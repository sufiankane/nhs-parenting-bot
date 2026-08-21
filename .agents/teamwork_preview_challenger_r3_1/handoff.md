# Handoff Report — Challenger R3-1 (Empirical Verification & Stress Testing)

## 1. Observation

Direct empirical observations from executing commands and inspection scripts against the finalized Phase 1 tree (commit `84ffa1dcbcb68d1fb8a6f6ea7162577d4bdbcf11` on branch `main`):

### 1.1 Full Test Suites Execution
- **Command:** `npm test`
  - **Output:**
    ```
    Test Files  13 passed (13)
         Tests  347 passed (347)
      Duration  855ms
    ```
  - **Files passing:** `tests/retrieval.test.ts` (15), `tests/generation.test.ts` (11), `tests/rateLimit.test.ts` (6), `tests/sessions.test.ts` (8), `tests/frontend.test.ts` (29), `tests/redteam/triage-redteam.test.ts` (25), `tests/triage.test.ts` (91), `tests/health.test.ts` (6), `tests/chat-flow.test.ts` (7), `tests/chat.test.ts` (21), `tests/retrieval-golden.test.ts` (105), `tests/redteam/escalation-redteam.test.ts` (13), `tests/escalation.test.ts` (10).

- **Command:** `npm run test:redteam`
  - **Output:**
    ```
    Test Files  2 passed (2)
         Tests  38 passed (38)
      Duration  537ms
    ```
  - Zero Tier 1 false negatives observed.

- **Command:** `npx tsc --noEmit`
  - **Output:** Clean exit 0, zero diagnostic errors across `src/` and `tests/`.

- **Command:** `npx tsc --noEmit scripts/smoke/remote-golden-check.ts`
  - **Output:** Clean exit 0, zero diagnostic errors.

### 1.2 Knowledge Base Chunks (74 Chunks) & Provenance
- Programmatic verification across all 74 chunks in `content/nhs_faq_seed.json` against `content/sources.json` and `scripts/ingest/data/*.ts`:
  - **Hash Integrity:** 74/74 chunks satisfy `id === sha256(chunk_text.trim())`. 0 hash mismatches, 0 duplicate IDs.
  - **Word Count Acceptance Band:** All 74 chunks fall strictly within [150, 400] words (observed range: 152 to 199 words).
  - **Provenance:** All 74 chunks reference valid `source_id`s in `content/sources.json` with `enabled: true`. Every `source_url` and `category` matches `content/sources.json` exactly.
  - **Seed Generator:** Running `npx tsx scripts/ingest/build-seed.ts` regenerates `content/nhs_faq_seed.json` with 0 diff.

### 1.3 F2 Modified Chunks & Emergency Routing Invariants
- Emergency routing invariant stress-tested across all 74 chunks:
  - 9 chunks trigger emergency indicators (`non-blanching|glass test`, `won't wake|unresponsive|floppy`, `chest pulling|sucking|recession|struggling to breathe`, `chok`, `anaphylax|throat closing`, `seizure|febrile fit|fitting`, `button battery|swallowed battery|bleach|poison`, `purple rash|meningitis`, `blood spurting|severe bleeding`, `severe burn|badly scalded`, `suicide|self-harm`).
  - All 9 chunks carry explicit `999` or `A&E` emergency routing language.
  - All 9 chunks have `safety_relevant === true`.
  - 0 emergency routing violations observed.
- The 4 modified F2 chunks verified in source:
  1. *Recognising Signs of Umbilical Cord Infection (Omphalitis)* (`scripts/ingest/data/newborn-care.ts`): 180 words, contains `"call 999 or go to your nearest A&E immediately — these can be signs of a serious infection needing emergency care."`
  2. *Foods to Avoid for Babies Under 12 Months: Honey and Choking Risks* (`scripts/ingest/data/weaning-nutrition.ts`): 195 words, contains `"If a baby is choking and cannot cough, cry, or breathe, call 999 immediately and start first aid."`
  3. *Highchair Safety and Safe Eating Practices* (`scripts/ingest/data/weaning-nutrition.ts`): 179 words, contains `"If a baby is choking and cannot cough, cry, or breathe, call 999 immediately and start first aid."`
  4. *Safe Teething Relief and Products to Avoid* (`scripts/ingest/data/teething-development.ts`): 196 words, contains `"If a baby is choking and cannot cough, cry, or breathe, call 999 immediately and start first aid."`
  - All 4 chunks pass the SafetyBatch S10 diagnostic / prescriptive deny-list rules (no unhedged diagnosis, no direct prescriptive voice, no dosage instructions).

### 1.4 KV Isolation & State Leakage Stress Testing
- `tests/chat.test.ts` (lines 70–73): `beforeEach(() => { mockKvStore.clear(); });` cleans state before each test.
- `tests/sessions.test.ts`, `tests/rateLimit.test.ts`, `tests/chat-flow.test.ts`: each test instantiates independent `new MockKv()` instances.
- **Stress test:** Ran vitest repeatedly with randomized execution order (`npx vitest run --sequence.shuffle`).
  - Run 1 (seed `1787313621766`): 13 files, 347/347 passed.
  - Run 2 (seed `1787313625650`): 13 files, 347/347 passed.
  - Run 3 (seed `1787313627787`): 13 files, 347/347 passed.
  - Zero cross-test state leakage or race conditions detected.

### 1.5 Safety Invariants in Source
- Invariant (a): `triage(message)` called synchronously in `src/index.ts:91` before any retrieval or generation call.
- Invariant (b): Tier 1/2/3 early return in `src/index.ts:96-127` bypasses AI/Vectorize calls completely.
- Invariant (c): M5 system prompt in `src/generation/prompt.ts:18-29` explicitly forbids diagnosing, prescribing, contradicting escalation, and leaking the system prompt.
- Invariant (d): User input structured in `src/generation/prompt.ts:47-60`, never concatenated into system prompt instructions.
- Invariant (e): Low confidence retrieval (< 0.5 threshold) produces honest fallback in `src/index.ts:140-176`.
- Invariant (f): Session KV writes bounded by 86400s TTL in `src/sessions/store.ts:17,68` with no PII fields.

### 1.6 Remote Smoke Script & Dependencies
- `scripts/smoke/remote-golden-check.ts` covers 10 golden questions across 7 categories, asserts 30s timeout, HTTP 200, frozen SSE envelope, grounded response (`fallback !== true`), single `done` event, zero leak patterns, exit code 1 on failure.
- `package.json`: `"@types/node": "^26.2.0"` is strictly in `devDependencies`.

---

## 2. Logic Chain

1. **Test Suite Integrity:** Observations in §1.1 demonstrate that 347 unit, integration, and golden tests pass, and all 38 redteam tests pass with 0 Tier 1 false negatives. No tests were deleted or weakened; total test count increased from baseline 340 to 347 (+3 emergency routing regression tests, +4 F3 identity gate tests).
2. **Knowledge Base Integrity:** Observations in §1.2 and §1.3 demonstrate that all 74 chunk hashes match sha256, all sources resolve to enabled allow-listed NHS URLs, and all 9 emergency chunks (including the 4 F2 remediated chunks) enforce 999/A&E escalation without S10 diagnostic violations.
3. **KV Isolation:** Observations in §1.4 prove that mock KV instances are isolated or reset per test, and test execution order randomization introduces no flakes or state leakage.
4. **Safety Invariants:** Observations in §1.5 confirm all 6 P1-T6 safety invariants are enforced at the code and architectural levels without bypass paths.
5. **Type and Contract Safety:** Observations in §1.1 and §1.6 confirm clean TypeScript compilation and adherence to frozen SSE contract types.

Therefore, the Phase 1 implementation and test deliverables are empirically robust and satisfy all technical acceptance criteria.

---

## 3. Caveats

1. **Clinical Adequacy Gate:** This adversarial review confirms technical correctness, invariant enforcement, hash integrity, and test passing. In accordance with the Project Rules (AGENTS.md §8, rule 02.14), clinical adequacy and exact tone sign-off of the four F2 chunk sentences remain pending external human safety reviewer sign-off, as documented in `DEPLOY-READINESS.md`.
2. **Network Sandbox:** Tests and checks were executed locally in the mocked/sandbox environment. The live smoke script (`scripts/smoke/remote-golden-check.ts`) is designed for human execution post-deploy against a live Cloudflare Worker instance.

---

## 4. Conclusion

**VERDICT: APPROVE**

All four requested empirical verification tasks have passed:
1. `npm test` (347/347), `npm run test:redteam` (38/38), and `npx tsc --noEmit` pass with zero failures.
2. All 74 chunk hashes, provenance links, and emergency routing invariants are verified.
3. The 4 F2 modified chunks satisfy the 999/A&E routing invariant and S10 hygiene rules.
4. KV isolation is verified across all test suites under shuffled execution.

---

## 5. Verification Method

To independently reproduce and verify this assessment:

```bash
# 1. Run full unit and integration test suite
npm test

# 2. Run adversarial redteam safety suite
npm run test:redteam

# 3. Verify TypeScript type safety
npx tsc --noEmit
npx tsc --noEmit scripts/smoke/remote-golden-check.ts

# 4. Verify test suite isolation under shuffled execution
npx vitest run --sequence.shuffle

# 5. Verify 74 chunk hashes and emergency routing invariants
node -e "const fs = require('fs'); const crypto = require('crypto'); const seed = JSON.parse(fs.readFileSync('content/nhs_faq_seed.json')); const indicators = [/non-blanching|glass test/i, /won'?t wake|unresponsive|floppy/i, /chest (is )?(pulling|sucking|recession)|struggling to breathe|gasping|not breathing/i, /chok/i, /anaphylax|throat closing/i, /seizure|febrile fit|\b(?:is|was|are|started|continuous)\s+fitting\b/i, /button battery|swallowed battery|bleach|poison/i, /purple rash|meningitis/i, /blood spurting|severe bleeding/i, /severe burn|badly scalded|large scald/i, /suicide|self[- ]harm|want to die|end my life/i]; const routing = /(\b999\b|A&E)/i; seed.chunks.forEach(c => { const h = crypto.createHash('sha256').update(c.chunk_text.trim()).digest('hex'); if (h !== c.id) throw new Error('Hash mismatch: ' + c.title); if (indicators.some(re => re.test(c.chunk_text)) && (!routing.test(c.chunk_text) || !c.safety_relevant)) throw new Error('Emergency routing violation: ' + c.title); }); console.log('74 chunks and emergency routing verified 100% OK');"
```
