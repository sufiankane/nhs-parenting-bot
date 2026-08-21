# Project: NHS Parenting Companion Chatbot — Phase 1 Close-out

## Architecture
Cloudflare Workers-based parenting advice chatbot with deterministic multi-tier safety triage, RAG retrieval (Vectorize/D1), and grounded generation.
- M1: Frontend widget & SSE client (`public/`)
- M2: API Gateway Worker (`src/index.ts`, `src/gateway/`)
- M3: Safety & Triage (`src/triage/`) — deterministic lexicon + classifier (Tiers 1-4)
- M4: Retrieval (`src/retrieval/`) — BGE-base embeddings + Vectorize + D1
- M5: Grounded Generation (`src/generation/`) — Llama 3.1-8b-instruct
- M6: Escalation & Signposting (`src/escalation/`) — deterministic UK service contacts
- M7: Ingestion Pipeline (`src/ingest/`, `scripts/ingest/`)
- M8: Audit Log (`src/audit/`) — anonymised, PII-free triage metrics

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | P1-T1–T9 Acceptance Criteria Audit | Full audit with file:line evidence against spec | R1 | ORIGINAL_REQUEST.md §R1 |
| 2 | Baseline Test & Safety Verification | npm test, npm run test:redteam, git state, 6 safety invariants | R1 | ORIGINAL_REQUEST.md §R1 |
| 3 | F2 Corpus Chunks Remediation | Add approved 999/A&E sentences to 4 corpus chunks, pass emergency regression suite | R2 | ORIGINAL_REQUEST.md §R2.1 |
| 4 | F3 Embedding-Model Identity Gate | Confirm fail-closed gate in src/retrieval/index.ts with 4 passing unit tests | R2 | ORIGINAL_REQUEST.md §R2.2 |
| 5 | Smoke Script Check | Confirm scripts/smoke/remote-golden-check.ts type-checks clean and meets spec | R2 | ORIGINAL_REQUEST.md §R2.3 |
| 6 | Content-Alignment Spot Check | Spot check ~8 merged-URL sources in scripts/ingest/data/*.ts vs content/sources.json | R2 | ORIGINAL_REQUEST.md §R2.4 |
| 7 | KV Isolation & @types/node | Verify/implement per-test KV isolation and devDependencies placement | R2 | ORIGINAL_REQUEST.md §R2 |
| 8 | Adversarial Verification | Read-only verification of no weakened tests, frozen SSE envelope, git format | R3 | ORIGINAL_REQUEST.md §R3 |
| 9 | Final Deliverable | DEPLOY-READINESS.md generation with pending external safety review section | R4 | ORIGINAL_REQUEST.md §R4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| R1 | Comprehensive Audit | Read-only audit of all P1 criteria, test counts, git state, 6 safety invariants | none | DONE |
| R2 | Build & Gap Closure | Close auditor gaps, F2 corpus edits, F3 gate check, smoke script, content check, KV isolation | R1 | DONE |
| R3 | Adversarial Verification | Read-only verification of builder outputs against safety non-negotiables | R2 | DONE |
| R4 | Final Deliverable | DEPLOY-READINESS.md with commit hash, checklist, rollback note, pending review gate | R3 | DONE |

## Code Layout
- Production source: `src/` (owned by worker devs during R2)
- Test files: `tests/` (owned by test engineers during R2)
- Data/Ingest files: `scripts/ingest/data/`, `content/`
- Documentation/Metadata: `.agents/`, `PROJECT.md`, `DEPLOY-READINESS.md`

## Interface Contracts
- SSE Envelope: Frozen to `token | signpost | error | done`.
- Safety Triage: `triage(msg)` returns Tier 1-4 synchronously before retrieval/generation.
- Fail-Closed Embedding Gate: Mismatched embedding model or vector dimension != 768 aborts retrieval cleanly.
