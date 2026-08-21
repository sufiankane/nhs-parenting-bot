# Dispatch to Reviewer R3-1

Read `C:/Users/sufia/OneDrive/Code/Template/.agents/ORIGINAL_REQUEST.md`, `C:/Users/sufia/OneDrive/Code/Template/AGENTS.md`, and `C:/Users/sufia/OneDrive/Code/Template/PROJECT.md`.
Your working directory is: `C:/Users/sufia/OneDrive/Code/Template/.agents/teamwork_preview_reviewer_r3_1/`

Tasks (Adversarial & Safety Review of Builder Output):
1. Review the full git diff between commit `9823668` and `84ffa1d` (`git diff 9823668 HEAD`).
2. Verify:
   - No safety test was weakened, skipped, or deleted (rule 02.12).
   - The frozen SSE envelope contract (`token | signpost | error | done`) is unchanged with zero renames/removals.
   - No tier definitions, lexicon terms, UK contact details, or source allow-list entries were modified without human approval.
   - All tests exercise real logic and pass honestly.
   - Commit format complies with `type(scope): message [TASK-ID]` and is pushed.
3. Run `npm test`, `npm run test:redteam`, and `npx tsc --noEmit` to verify all test suites and compilation.
4. Note the requirement for the "Pending: Human Safety Review" section for the 4 F2-modified chunks.
5. Write your complete review report with explicit VERDICT (APPROVE / REQUEST_CHANGES) to `C:/Users/sufia/OneDrive/Code/Template/.agents/teamwork_preview_reviewer_r3_1/handoff.md` and send a completion message with summary.

