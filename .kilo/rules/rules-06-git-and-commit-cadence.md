# Rules 06 — Git & Commit Cadence

> Placement: `.kilo/rules/06-git-and-commit-cadence.md`.
> Governs when agents commit and push. Works with `.kilo/kilo.jsonc`, which governs
> WHICH commands may run unattended. Both layers must agree before a command executes.

## Commit checkpoints

1. **Subagent checkpoint commit.** After each delegated deliverable is integrated and its focused tests pass, commit immediately:
   `test(triage): add M3 unit suite [P1-T3]` / `feat(triage): implement M3 lexicon [P1-T3]`
2. **Task-close commit (mandatory).** When a task's Definition of Done is fully met — full suite green, `npm run test:redteam` green where required, review verdicts PASS — commit all remaining work:
   `feat(escalation): M6 signpost module with frozen contacts [P1-T4]`
3. **Push after every task-close commit.** Checkpoint commits may batch locally; the task-close commit must be pushed to `origin main` before the task is reported complete.
4. **Never leave a session with uncommitted green work.** If you stop mid-task, commit what passes as a checkpoint and state what is uncommitted and why in the handoff.

## Preconditions for every commit

5. Focused tests for the changed scope pass. Task-close commits additionally require the full suite green.
6. `git status` reviewed first: no `.env`, `.dev.vars`, `node_modules`, or build artifacts staged. `.gitignore` is the enforcement layer — never bypass it.
7. Commit format: `type(scope): message [TASK-ID]` (rule 04.16). Types: `feat`, `fix`, `test`, `docs`, `chore`, `refactor`.

## Hard prohibitions (enforced in kilo.jsonc, restated here)

8. Never force-push, `reset --hard`, `clean`, amend a pushed commit, or `git add -f` an ignored file.
9. Never run `npm run deploy` or `wrangler deploy` — deploys are human-only (AGENTS.md §8).
10. Never commit with failing tests, skipped safety checks, or TODO placeholders in the safety path (rule 05).

## Failure handling

11. If a push fails (auth, network, rejected remote), do not retry more than once and do not attempt credential changes. Commit locally, report the failure in the handoff, and continue the task — local commits still satisfy the cadence until the human restores the remote.
12. If `git status` shows unexpected files (especially anything resembling secrets), stop, do not commit, and ask the human.

## Autonomy note

With `.kilo/kilo.jsonc` in place, the commands above run without per-invocation prompts.
The agent is expected to use that autonomy to maintain this cadence proactively —
committing is not optional bookkeeping, it is part of the Definition of Done.
