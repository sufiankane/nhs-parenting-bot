# AGENTS.md — NHS Parenting Companion Chatbot

> Read this file in full before making any change.
> Binding rule sets live in `.kilo/rules/` — read all that apply before starting:
> `01-project-context`, `02-safety-non-negotiables`, `03-cost-and-model-efficiency`,
> `04-engineering-standards`, `05-workflow-and-definition-of-done`,
> `06-git-and-commit-cadence`, `07-overnight-autonomy`.
> Agent role definitions live in `.kilo/agents/`.
> The authoritative design document is `docs/architecture-and-action-plan.md` (the Spec). If this file conflicts with the Spec, the Spec wins.

## 1. Project

A UK parenting-advice chatbot hosted on Cloudflare Workers. It gives non-judgmental, NHS-grounded parenting guidance through RAG. A deterministic safety-triage layer intercepts life-threatening or safeguarding-related messages and routes users to the appropriate UK service.

This is safety-critical. Correct safety behaviour outweighs feature delivery, speed, and cost.

## 2. Architecture

| Module | Name | Path | Criticality |
|---|---|---|---|
| M1 | Frontend widget and SSE client | `public/` | Standard |
| M2 | API Gateway Worker (`/chat`, `/health`, `/admin/ingest`) | `src/index.ts`, `src/gateway/` | High |
| M3 | Safety and triage (lexicon plus classifier, tiers 1–4) | `src/triage/` | Safety-critical |
| M4 | Retrieval (embed, Vectorize, D1 context) | `src/retrieval/` | High |
| M5 | Grounded generation | `src/generation/` | High |
| M6 | Escalation and signposting (hard-coded UK contacts) | `src/escalation/` | Safety-critical |
| M7 | Ingestion pipeline | `src/ingest/`, `scripts/ingest/` | Standard |
| M8 | Anonymised triage audit log | `src/audit/` | High |

Platform services: Workers, Workers AI, AI Gateway, Vectorize, D1, KV, R2, and Queues. Embeddings use `@cf/baai/bge-base-en-v1.5`; generation uses `@cf/meta/llama-3.1-8b-instruct` unless the configured environment changes.

## 3. Commands

```bash
npm run dev
npm run test
npm run test:redteam
npm run deploy      # human-only — never run autonomously
npm run ingest      # requires approved content allow-list
```

`npm run test:redteam` is mandatory before any deploy affecting M3, M5, M6, prompts, lexicon, or curated content.

## 4. Non-negotiables

1. Every inbound message passes M3 before retrieval, generation, or content logging.
2. M6 produces Tier 1–3 escalation responses deterministically; an LLM never chooses or rewrites an escalation response.
3. Tier 1 lexicon matches override classifier output. A classifier may escalate, never downgrade.
4. Generation is grounded only in retrieved NHS context. Low confidence produces an honest fallback; never diagnose.
5. Do not persist PII or free-text messages in audit logs. Sessions in KV require a TTL.
6. Never weaken, skip, or delete a safety test to obtain a passing build.
7. Any uncertainty involving clinical accuracy, safeguarding, tier definitions, contact details, or a new content source requires human approval.

See `.kilo/rules/02-safety-non-negotiables.md` for binding detail.

## 5. Agent model routing

Use the least-cost model that meets the work's quality and risk threshold. Models are pinned in agent frontmatter; do not substitute models casually.

| Agent | Primary model | Role | Rationale |
|---|---|---|---|
| `lead-integrator` | `Claude Sonnet 4.6 (thinking)` | Delegates, integrates, validates, commits, reports | Strongest agentic-coding capability; thinking mode suits plan→delegate→integrate loops |
| `architect` | `Gemini 3.1 Pro` | Plans, contracts, risk and dependency analysis | 1M context for whole-repo audits; deep reasoning for architectural trade-offs |
| `repo-scout` | `Gemini 3.5 Flash` | Read-only codebase reconnaissance | Cheapest adequate tier for fast structural mapping |
| `worker-dev` | `Gemini 3.7 Flash` | Isolated production-code slices | Fast code generation, separate quota pool from Claude |
| `test-engineer` | `Gemini 3.7 Flash` | Test design and test-file ownership | Fast test scaffolding and deterministic transforms |
| `hard-problem-solver` | `Gemini 3.1 Pro` | Escalation-only hard implementation and debugging | 1M context, high reasoning capability for non-local debugging |
| `safety-reviewer` | `Claude Opus 4.6 (thinking)` | Read-only safety, privacy and high-risk review | Highest-scrutiny gate; reserved quota for safety sign-off |
| `independent-reviewer` | `Gemini 3.1 Pro` | Independent adversarial design and diff review | Deep reasoning for challenging assumptions and edge cases |
| `content-pipeline` | `Gemini 3.7 Flash` | Scoped ingestion and provenance work | Fast bulk processing and ingestion transformations |
| `docs-writer` | `Gemini 3.5 Flash` | Documentation and changelog work | Cheapest adequate tier for prose and changelogs |
| `explorer` | `GPT-OSS-120b` | Read-only exploration and hypotheses | Disposable hypotheses on a third quota family |

Disposable exploratory models (`GPT-OSS-120b`) may not approve designs, change production code, set safety policy, or provide final review.

## 6. Mandatory primary execution path

For non-trivial feature work, bug fixes across module boundaries, or safety-path changes, execute this sequence:

1. **Architect (`Gemini 3.1 Pro`)**: create a file-level plan, acceptance criteria, dependencies, risks, and explicit ownership boundaries. Do not edit implementation files.
2. **Repo scout (`Gemini 3.5 Flash`)**: map the relevant implementation, contracts, conventions, call paths, and test locations. Read-only.
3. **Test engineer (`Gemini 3.7 Flash`)**: design or implement tests within its exclusive test-file scope. It does not modify production code.
4. **Worker dev (`Gemini 3.7 Flash`)**: implement one isolated production-code slice. It does not modify test files owned by the test engineer.
5. **Lead integrator (`Claude Sonnet 4.6 (thinking)`)**: integrate delegated outputs, resolve conflicts, make only necessary glue edits, and run full validation. It must not duplicate delegated work without recording why.
6. **Review**: invoke `safety-reviewer` (`Claude Opus 4.6 (thinking)`) for M3/M5/M6, prompts, lexicon, content, data handling, auth, or deployment-impacting work. Use `independent-reviewer` (`Gemini 3.1 Pro`) for non-safety adversarial review when justified.

For a small, self-contained mechanical change, the lead may use only a worker-dev task, but must state why the full path is disproportionate.

## 7. Delegation contract

Before any production edit, `lead-integrator` must publish a delegation ledger:

| Subagent | Exact scope | Allowed paths | Expected output | Status |
|---|---|---|---|---|

Rules:

- Delegate reconnaissance, test work, and each independent implementation slice before integration.
- Assign exclusive file ownership. Do not assign overlapping production files to concurrent agents.
- The lead owns integration, conflict resolution, validation, and final reporting; it is not the default implementer.
- A failed, refused, or unsuitable delegation must be reported before the lead performs the work itself.
- Preserve subagent findings in the final handoff; do not silently discard a failing test or review finding.
- Subagents cannot approve their own work. Safety approval always comes from `safety-reviewer` plus the required automated tests.

## 8. Escalation and human gates

- Escalate to `hard-problem-solver` only after a bounded Flash attempt fails, or for clearly non-local, concurrency, algorithmic, or complex refactor work.
- Require `safety-reviewer` for changes involving triage, escalation, prompt construction, content ingestion, audit logging, privacy, authentication, permissions, secrets, production configuration, or deployment.
- Stop and ask a human before changing tier definitions, Tier 1 lexicon terms, contact details, curated source allow-lists, data retention, deployment configuration, database schemas, or production bindings.
- During unsupervised runs (rules-07), every gate in this section is a hard stop: record the question in `OVERNIGHT-REPORT.md` and end the run cleanly. Never improvise past a gate.

## 9. Definition of done

A task is complete only when all applicable criteria are met:

- Acceptance criteria are demonstrably met.
- Tests pass; cross-module changes include integration tests.
- `npm run test:redteam` passes for changes affecting M3, M5, M6, prompts, lexicon, or content.
- Required safety and independent review findings are resolved or explicitly accepted by a human.
- No PII, secrets, or unvetted external content was introduced.
- Delegation ledger, tests run, outcomes, review findings, and remaining risks are reported.
- Deviations from the Spec are recorded in `CHANGELOG.md` with rationale.
- Checkpoint commits were made per rules-06, and the task-close commit is pushed to `origin main`. A task is not complete until pushed (or a push failure is documented per rules-06.11).
- During unsupervised runs, `OVERNIGHT-REPORT.md` is updated and committed with the task-close commit (rules-07.10–11).