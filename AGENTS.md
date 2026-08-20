# AGENTS.md — NHS Parenting Companion Chatbot

> Read this file in full before making any change.
> Binding rule sets live in `.kilo/rules/`. Agent role definitions live in `.kilo/agents/`.
> The authoritative design document is `docs/architecture-and-action-plan.md` (the Spec). If this file conflicts with the Spec, the Spec wins.

## 1. Project

A UK parenting-advice chatbot hosted on Cloudflare Workers. It gives non-judgmental, NHS-grounded parenting guidance through RAG. A deterministic safety-triage layer intercepts life-threatening or safeguarding-related messages and routes users to the appropriate UK service.

This is safety-critical. Correct safety behaviour outweighs feature delivery, speed, and cost.

## 2. Architecture

| Module | Name | Path | Criticality |
|---|---|---|---|
| M1 | Frontend widget and SSE client | `public/` | Standard |
| M2 | API Gateway Worker (`/chat`, `/health`, `/admin/ingest`) | `src/index.ts` | High |
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
npm run deploy
npm run ingest
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

| Agent | Primary model | Role |
|---|---|---|
| `lead-integrator` | `google/gemini-3.7-flash` | Delegates, integrates, validates and reports |
| `architect` | `z-ai/glm-5.2` | Plans, contracts, risk and dependency analysis |
| `repo-scout` | `upstage/solar-pro4` | Read-only codebase reconnaissance |
| `worker-dev` | `deepseek/deepseek-v4-flash-0731` | Isolated production-code slices |
| `test-engineer` | `deepseek/deepseek-v4-flash-0731` | Test design and test-file ownership |
| `hard-problem-solver` | `deepseek/deepseek-v4-pro` | Escalation-only hard implementation and debugging |
| `safety-reviewer` | `openai/gpt-5.6-sol-pro` | Read-only safety, privacy and high-risk review |
| `independent-reviewer` | `inclusionai/ring-2.6-1t` | Independent adversarial design and diff review |
| `content-pipeline` | `google/gemini-3.7-flash` | Scoped ingestion and provenance work |
| `docs-writer` | `inclusionai/ling-2.6-1t` | Documentation and changelog work |
| `explorer` | `nvidia/nemotron-3-ultra-550b-a55b:free` or `google/gemma-4-31b-it:free` | Read-only exploration and hypotheses |

Free models may not approve designs, change production code, set safety policy, or provide final review.

## 6. Mandatory primary execution path

For non-trivial feature work, bug fixes across module boundaries, or safety-path changes, execute this sequence:

1. **Architect (`z-ai/glm-5.2`)**: create a file-level plan, acceptance criteria, dependencies, risks, and explicit ownership boundaries. Do not edit implementation files.
2. **Repo scout (`upstage/solar-pro4`)**: map the relevant implementation, contracts, conventions, call paths, and test locations. Read-only.
3. **Test engineer (`deepseek/deepseek-v4-flash-0731`)**: design or implement tests within its exclusive test-file scope. It does not modify production code.
4. **Worker dev (`deepseek/deepseek-v4-flash-0731`)**: implement one isolated production-code slice. It does not modify test files owned by the test engineer.
5. **Lead integrator (`google/gemini-3.7-flash`)**: integrate delegated outputs, resolve conflicts, make only necessary glue edits, and run full validation. It must not duplicate delegated work without recording why.
6. **Review**: invoke `safety-reviewer` for M3/M5/M6, prompts, lexicon, content, data handling, auth, or deployment-impacting work. Use `independent-reviewer` for non-safety adversarial review when justified.

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

## 8. Escalation policy

- Escalate to `hard-problem-solver` only after a bounded Flash attempt fails, or for clearly non-local, concurrency, algorithmic, or complex refactor work.
- Require `safety-reviewer` for changes involving triage, escalation, prompt construction, content ingestion, audit logging, privacy, authentication, permissions, secrets, production configuration, or deployment.
- Stop and ask a human before changing tier definitions, Tier 1 lexicon terms, contact details, curated source allow-lists, data retention, deployment configuration, database schemas, or production bindings.

## 9. Definition of done

A task is complete only when all applicable criteria are met:

- Acceptance criteria are demonstrably met.
- Tests pass; cross-module changes include integration tests.
- `npm run test:redteam` passes for changes affecting M3, M5, M6, prompts, lexicon, or content.
- No PII, secrets, or unvetted external content was introduced.
- Delegation ledger, tests run, outcomes, review findings, and remaining risks are reported.
- Deviations from the Spec are recorded in `CHANGELOG.md` with rationale.
