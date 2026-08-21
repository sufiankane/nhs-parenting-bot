# Rules 03 — Cost, Model Routing and Efficiency

> Placement: `.kilo/rules/03-cost-and-model-efficiency.md`.
> Goal: use the least-cost model and smallest sufficient context while preserving safety and correctness.

## Routing table

| Work | Default model | Escalate only when |
|---|---|---|
| Lead integration, tool use, validation | `Claude Sonnet 4.6 (thinking)` | The work needs full whole-repo context (`Gemini 3.1 Pro`) |
| Architecture, contracts, dependency and risk analysis | `Gemini 3.1 Pro` | Human approval is required for a safety or clinical decision |
| Read-only reconnaissance | `Gemini 3.5 Flash` | Analysis needs architecture-level synthesis |
| Routine isolated code or tests | `Gemini 3.7 Flash` | One bounded attempt fails or the problem is non-local |
| Complex algorithms, concurrency, difficult debugging, large refactors | `Gemini 3.1 Pro` | Not applicable; use only after explicit escalation |
| Safety, privacy, auth, sensitive-data and production-impact review | `Claude Opus 4.6 (thinking)` | Never downgrade this review for a high-risk change |
| Independent adversarial review | `Gemini 3.1 Pro` | Not applicable |
| Documentation and changelog work | `Gemini 3.5 Flash` | The work needs design clarification |
| Low-stakes exploration only | `GPT-OSS-120b` | Never escalate their output directly into a decision |

## Mandatory execution order

For non-trivial work: architect → repo scout → test engineer and worker-dev → lead integrator → required reviewer.

The lead agent must delegate rather than defaulting to self-execution. It may integrate, resolve conflicts, and make small glue changes. It must record any exception in the delegation ledger before doing delegated work itself.

## Escalation rules

1. Use `Gemini 3.1 Pro` (hard-problem-solver) only after a bounded Flash attempt fails, or when the task explicitly involves concurrency, algorithmic reasoning, non-local behaviour, or a substantial refactor / whole-repo context.
2. Use `Claude Opus 4.6 (thinking)` (safety-reviewer) for all changes involving M3/M5/M6, prompts, lexicon, content, audit data, privacy, authentication, permissions, secrets, production configuration, or deploy decisions. Reserve Opus quota strictly for this gate.
3. Use `Gemini 3.1 Pro` (independent-reviewer) as an independent challenge to a completed plan or diff; it does not own the implementation.
4. `GPT-OSS-120b` (explorer) output is disposable hypotheses that require validation by a designated agent; it may not edit, approve, or close tasks.
5. Pin the assigned model in agent frontmatter. Do not use an expensive model for boilerplate, formatting, or a mechanical change.

## Token and context discipline

1. Read surgically: locate first, then read only the smallest useful range.
2. Do not re-read unchanged files in the same session.
3. Give subagents a concise brief: goal, relevant paths, constraints, output contract, and file ownership. Do not pass raw transcripts.
4. Batch independent investigations.
5. Make targeted edits; do not regenerate an entire file to make a small change.
6. Respect each agent's `steps` limit. Stop and hand off if the limit is reached.
7. Use deterministic code, lookups, regexes, and tests instead of LLM calls when they can solve the task.

## Product cost discipline

1. Embeddings are computed at ingestion, never repeatedly for stored content.
2. Keep AI Gateway caching enabled for identical prompts where compatible with safety and privacy requirements.
3. Keep retrieval top-k small (3–5); improve chunking and provenance before increasing context volume.
4. Treat repeated full-suite runs, repeated file reads, and model-written mechanical boilerplate as waste signals; correct the workflow before continuing.
