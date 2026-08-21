# Dispatch to Forensic Auditor R3-1

Read `C:/Users/sufia/OneDrive/Code/Template/.agents/ORIGINAL_REQUEST.md`, `C:/Users/sufia/OneDrive/Code/Template/AGENTS.md`, and `.kilo/rules/`.
Your working directory is: `C:/Users/sufia/OneDrive/Code/Template/.agents/teamwork_preview_auditor_r3_1/`

Tasks (Post-Build Forensic Integrity Verification):
1. Run `npm test` and `npm run test:redteam`. Assert 100% green with zero test skips, dummy assertions, or mocked bypasses.
2. Verify git state: HEAD commit `84ffa1d` matches origin/main, clean status, zero tracked secrets or artifacts.
3. Perform source code diff audit (`git diff 9823668 HEAD`):
   - Confirm only the 4 human-approved sentences were added.
   - Confirm no tier definitions, lexicon terms, or contacts were changed.
   - Confirm SSE contract integrity.
4. Issue final binary VERDICT (CLEAN / INTEGRITY VIOLATION) in your handoff report at `C:/Users/sufia/OneDrive/Code/Template/.agents/teamwork_preview_auditor_r3_1/handoff.md` and send a completion message with summary.

