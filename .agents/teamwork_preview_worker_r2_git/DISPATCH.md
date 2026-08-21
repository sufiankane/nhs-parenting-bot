# Dispatch to Git Worker R2

Read `C:/Users/sufia/OneDrive/Code/Template/.agents/ORIGINAL_REQUEST.md`, `C:/Users/sufia/OneDrive/Code/Template/PROJECT.md`, and `.kilo/rules/rules-06-git-and-commit-cadence.md`.
Your working directory is: `C:/Users/sufia/OneDrive/Code/Template/.agents/teamwork_preview_worker_r2_git/`

Tasks:
1. Verify `git status`. Check that no untracked secrets or unintended build artifacts are present.
2. Stage the modified files:
   - `scripts/ingest/data/*.ts`
   - `content/nhs_faq_seed.json`
   - `src/index.ts`
   - `tests/retrieval-golden.test.ts`
   - `tests/chat.test.ts`
   - `.kilo/` and `AGENTS.md`
   - `PROJECT.md`
   (Do NOT stage temporary `.agents/` metadata).
3. Commit the staged changes using standard commit message:
   `fix(corpus): apply F2 emergency routing sentences, per-test KV reset, and TS fixes [P1-T9, SafetyBatch F2]`
4. Push the commit to `origin main` using `git push origin main`.
5. Verify `git status` and `git log -n 1` (record the commit SHA).
6. Write your handoff report to `C:/Users/sufia/OneDrive/Code/Template/.agents/teamwork_preview_worker_r2_git/handoff.md` and send a completion message with summary including the commit hash.

