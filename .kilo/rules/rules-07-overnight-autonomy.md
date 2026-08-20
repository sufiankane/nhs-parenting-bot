# Rules 07 — Overnight / Unsupervised Autonomy

> Placement: `.kilo/rules/07-overnight-autonomy.md`.
> Governs unattended multi-task runs. All other rules still apply in full —
> autonomy never suspends safety non-negotiables (rules-02) or human gates
> (AGENTS.md §8). When in doubt, stop.

## Scope of autonomy

1. An unsupervised run may execute consecutive Spec tasks in dependency order,
   each through the full mandatory execution path (rules-05), each with its own
   delegation ledger, reviews, and Definition of Done.
2. The run must be given an explicit task range (e.g. "P1-T4 through P1-T8").
   Never continue past the final authorised task.
3. Deploys (`npm run deploy`, `wrangler deploy`) are never in scope. A deploy
   task is always a stop condition, not a task.

## Hard stop conditions

Stop the entire run, commit green work, write the reason and resume
instructions to `OVERNIGHT-REPORT.md`, and end the session when any occurs:

4. The next action requires human approval under AGENTS.md §8 — tier or
   lexicon changes, contact changes, new content sources, production config,
   clinical or safeguarding ambiguity.
5. A task fails its test or review gate twice. No third attempt unattended.
6. Any safety test fails and the cause is not immediately obvious. Never
   weaken, skip, or delete a safety test (rule 02.12).
7. Git commits fail, or pushes fail twice (commit locally, note it, continue;
   if commits fail, stop).
8. Context or step limits are reached mid-task.

## Content ingestion gate

9. During unsupervised runs, build ingestion and retrieval code only. Never
   fetch, ingest, or upsert external content. Prepare `content/sources.json`
   as a proposal for human approval and proceed to the next task.

## Run journal

10. Maintain `OVERNIGHT-REPORT.md` at repo root for the duration of the run:
    one entry per completed task (ID, commits, test results, review verdicts)
    and one entry per stop event (reason, exact resume instructions).
11. Commit `OVERNIGHT-REPORT.md` with every task-close commit so the morning
    review can be done from GitHub alone.

## Failure philosophy

12. A run that stops early with a clear report is a success. A run that
    improvises past a gate is a defect — treat it as a rule-02 incident in
    the morning review.
