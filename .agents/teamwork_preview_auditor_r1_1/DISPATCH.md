# Dispatch to Forensic Auditor R1-1

Read `C:/Users/sufia/OneDrive/Code/Template/.agents/ORIGINAL_REQUEST.md`, `C:/Users/sufia/OneDrive/Code/Template/AGENTS.md`, and `C:/Users/sufia/OneDrive/Code/Template/.kilo/rules/`.
Your role: Forensic Auditor for Phase 1 Integrity, Safety Invariants, and Test Execution.
Working directory: `C:/Users/sufia/OneDrive/Code/Template/.agents/teamwork_preview_auditor_r1_1/`

Tasks:
1. Run `npm test` and `npm run test:redteam`. Record the exact test counts, suite counts, and execution status. Check for any skipped, hidden, or dummy tests.
2. Forensic Integrity Audit:
   - Check if any mock/facade implementations bypass real logic.
   - Check for hardcoded test answers or fake passes.
   - Audit git state (`git status`, `git diff`, `git log -n 5`, `git remote -v`), check for untracked secrets, uncommitted files, or unpushed commits.
3. Validate the 6 P1-T6 safety invariants in source:
   (a) `triage()` synchronous execution with zero bypass paths.
   (b) Tier 1-3 zero AI/Vectorize calls.
   (c) System prompt forbid rules (diagnosing, prescribing, contradicting escalation, prompt leak).
   (d) Structured user input interpolation only.
   (e) Honest fallback on low confidence.
   (f) Session KV TTL & PII-free.
4. Verify residual items (F1/F2/F3/smoke script/content URL alignment).
5. Produce your forensic audit report with VERDICT (CLEAN or INTEGRITY VIOLATION) and file:line evidence in `C:/Users/sufia/OneDrive/Code/Template/.agents/teamwork_preview_auditor_r1_1/handoff.md`.

