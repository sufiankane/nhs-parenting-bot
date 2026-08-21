# Dispatch to Challenger R3-1

Read `C:/Users/sufia/OneDrive/Code/Template/.agents/ORIGINAL_REQUEST.md` and `C:/Users/sufia/OneDrive/Code/Template/PROJECT.md`.
Your working directory is: `C:/Users/sufia/OneDrive/Code/Template/.agents/teamwork_preview_challenger_r3_1/`

Tasks (Empirical Verification & Stress Testing):
1. Execute stress tests and verification of:
   - Full test suite `npm test` (all 347 tests).
   - Adversarial suite `npm run test:redteam` (all 38 tests).
   - Provenance and hash verification of all 74 knowledge base chunks.
   - Remote smoke test script compilation and syntax verification (`scripts/smoke/remote-golden-check.ts`).
2. Verify that the 4 modified F2 chunks now satisfy the emergency routing invariant without false negatives or edge-case breaks.
3. Validate KV isolation and ensure no cross-test state leakage exists in any test file.
4. Write your challenge report with explicit VERDICT (APPROVE / REJECT) to `C:/Users/sufia/OneDrive/Code/Template/.agents/teamwork_preview_challenger_r3_1/handoff.md` and send a completion message with summary.

