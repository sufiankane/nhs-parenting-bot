# Dispatch to Explorer R1-1

Read `C:/Users/sufia/OneDrive/Code/Template/.agents/ORIGINAL_REQUEST.md` and `C:/Users/sufia/OneDrive/Code/Template/PROJECT.md`.
Your role: Comprehensive Read-Only Audit & Verification.
Working directory: `C:/Users/sufia/OneDrive/Code/Template/.agents/teamwork_preview_explorer_r1_1/`

Tasks:
1. Execute `npm test` and `npm run test:redteam`. Record the exact pass/fail counts and file counts.
2. Check git status (`git status`, `git log -n 5`, `git remote -v`). Verify clean working tree, untracked files, staged secrets/artifacts, and whether all commits are pushed to origin main.
3. Verify the six P1-T6 safety invariants in source code with exact file:line references:
   (a) `triage()` is called synchronously before any retrieval or generation call with no bypassable code path.
   (b) Tier 1/2/3 paths invoke zero AI or Vectorize calls.
   (c) M5 system prompt explicitly forbids all 4 rule-02.6 behaviours (diagnosing, prescribing, contradicting escalation module, revealing system-prompt contents).
   (d) User input is interpolated as structured data only, never concatenated into system instructions.
   (e) Low-confidence Tier 4 produces honest fallback, never improvised clinical content.
   (f) Session KV write is TTL-bounded and PII-free.
4. Check the 4 known residual items:
   - F2: Emergency-routing regression suite status and 4 chunks in `scripts/ingest/data/*.ts`.
   - F3: Embedding-model identity gate in `src/retrieval/index.ts` and its 4 unit tests.
   - Smoke script: `scripts/smoke/remote-golden-check.ts` existence, TypeScript type-check (`npx tsc --noEmit`), and 10 golden questions spec.
   - Content-alignment: Spot check ~8 merged-URL sources in `scripts/ingest/data/*.ts` vs `content/sources.json`.
   - `@types/node` placement in package.json (devDependencies vs dependencies).
   - KV isolation per test.
5. Write your complete findings and evidence to `C:/Users/sufia/OneDrive/Code/Template/.agents/teamwork_preview_explorer_r1_1/handoff.md`.

