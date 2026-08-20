# Rules 05 — Workflow, Delegation and Definition of Done

> Placement: `.kilo/rules/05-workflow-and-definition-of-done.md`.
> Governs how agents start, delegate, execute, integrate, and close work.

## Starting work

1. Read `AGENTS.md`, the Spec (`docs/architecture-and-action-plan.md`), and applicable rules before editing.
2. Work against a Spec task ID. If none exists, propose an ID, dependencies, and acceptance criteria; obtain human approval before implementation.
3. Check dependencies and `CHANGELOG.md`. Report blockers rather than guessing.
4. State a 3–6 bullet plan. For safety-path work, name the applicable rules from `02-safety-non-negotiables.md`.

## Mandatory delegation

For non-trivial work, the lead integrator must publish this ledger before editing production code:

| Subagent | Exact scope | Allowed paths | Expected deliverable | Status |
|---|---|---|---|---|

The normal execution path is:

1. `architect`: file-level plan, contracts, risks, dependencies, acceptance criteria; no implementation edits.
2. `repo-scout`: read-only map of current implementation, conventions, call paths, and tests.
3. `test-engineer`: test plan or test-file edits only.
4. `worker-dev`: one bounded production-code slice only.
5. `lead-integrator`: integrates outputs, resolves conflicts, makes necessary glue edits, and validates.
6. `safety-reviewer` and/or `independent-reviewer`: review as required by risk.

Rules:

- Delegate reconnaissance, testing, and independent implementation before integration.
- Assign exclusive file ownership. Concurrent agents must not modify the same production file.
- The lead is an integrator, not the default implementer.
- If a delegate fails, refuses, or is unsuitable, record the reason in the ledger before the lead takes over.
- Do not duplicate delegated work or discard a subagent's failing result without documenting the decision.
- Small mechanical changes may omit stages only when the lead explains why the full path is disproportionate.

## Execution

1. Make the smallest change that satisfies the acceptance criteria. Scope-expanding refactors need their own task ID.
2. Run the narrowest relevant test first, then required broader tests before closing.
3. `test-engineer` may modify tests but not production implementation. `worker-dev` may modify its assigned production files but not tests owned by the test engineer.
4. `safety-reviewer` is read-only and cannot be bypassed for M3/M5/M6, prompts, lexicon, content, privacy, auth, sensitive-data, or production-impacting work.
5. Any clinical, safeguarding, contact-detail, new-source, schema, binding, or deploy ambiguity stops work pending human approval.

## Definition of done

All applicable items must be true:

- [ ] Every acceptance criterion is demonstrably met.
- [ ] Unit tests pass; integration tests pass where module boundaries are crossed.
- [ ] `npm run test:redteam` passes for M3/M5/M6, prompts, lexicon, or content changes.
- [ ] Required safety and independent review findings are resolved or explicitly accepted by a human.
- [ ] No PII, secrets, or unvetted content was introduced.
- [ ] `CHANGELOG.md` records task ID, changes, deviations, and rationale.
- [ ] Commit format is `type(scope): message [TASK-ID]`.
- [ ] Final handoff includes the completed delegation ledger, files changed, tests/checks and results, review verdicts, open questions, and residual risks.

## Blockers and handoff

A clearly reported blocker is a successful handoff. Never claim completion with failing tests, skipped safety checks, unresolved review findings, or TODO placeholders in the safety path.
