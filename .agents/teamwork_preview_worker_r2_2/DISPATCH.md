# Dispatch to Test Engineer Worker R2-2

Read `C:/Users/sufia/OneDrive/Code/Template/.agents/ORIGINAL_REQUEST.md`, `C:/Users/sufia/OneDrive/Code/Template/SafetyBatch.md`, and `C:/Users/sufia/OneDrive/Code/Template/PROJECT.md`.
Your working directory is: `C:/Users/sufia/OneDrive/Code/Template/.agents/teamwork_preview_worker_r2_2/`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Exclusive Allowed Paths:
- `tests/retrieval-golden.test.ts`
- `tests/chat.test.ts`

Tasks:
1. In `tests/retrieval-golden.test.ts:27-45`, remove the legacy ambient module declarations (`declare module "node:fs"`, `declare module "node:crypto"`, `declare module "node:sqlite"`) that conflict with `@types/node` causing TS2300 duplicate identifier errors. Do NOT weaken or modify any test assertions.
2. In `tests/chat.test.ts`, ensure strict per-test KV isolation by adding `beforeEach(() => { mockKvStore.clear(); })` so that `mockKvStore` state does not leak across test cases.
3. Run `npm test` to verify all 13 test files and all 347 tests pass 100% green.
4. Run `npm run test:redteam` to verify 38/38 adversarial tests pass with 0 Tier 1 false negatives.
5. Write your handoff report to `C:/Users/sufia/OneDrive/Code/Template/.agents/teamwork_preview_worker_r2_2/handoff.md` and send a completion message with summary.

