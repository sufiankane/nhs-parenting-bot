# Dispatch Log

## 2026-08-21T11:49:44Z

You are the Project Orchestrator for the Phase 1 close-out of the safety-critical NHS parenting chatbot hosted on Cloudflare Workers.

Your working directory is: C:/Users/sufia/OneDrive/Code/Template/.agents/teamwork_preview_orchestrator_1/
Workspace root: C:/Users/sufia/OneDrive/Code/Template

Authoritative request:
Read and follow C:/Users/sufia/OneDrive/Code/Template/.agents/ORIGINAL_REQUEST.md

Key Reference Material:
- AGENTS.md — project rules, agent model routing, non-negotiables
- docs/architecture-and-action-plan.md — authoritative Spec (P1-T1–T9 acceptance criteria, module contracts, SSE envelope)
- .kilo/rules/01–07 — binding rule sets (safety, git cadence, definition of done, etc.)
- CHANGELOG.md — full P1 task history, safety-reviewer verdicts (S1–S20, A1–A4 PASS), known gaps F1/F2/F3
- SafetyBatch.md — post-remediation status table; F2 findings (4 chunks needing 999/A&E sentences); F3 resolved; F1 prep done

Requirements to execute in order:
R1. Audit (read-only): Gap table for all P1-T1–T9 acceptance criteria against current source tree with file:line evidence. Run npm test and npm run test:redteam, verify git state, verify six P1-T6 safety invariants.
R2. Build: Close gaps identified by auditor plus four known residual items:
    1. F2 — Corpus regression test: add human-approved remediation sentences from SafetyBatch.md §F2 to the 4 corpus chunks in data files; ensure emergency-routing regression test passes green; do not weaken tests.
    2. F3 — Embedding-model identity gate in src/retrieval/index.ts (confirm fail-closed gate present and 4 unit tests green).
    3. scripts/smoke/remote-golden-check.ts completeness check (type-checks clean, meets 10 golden questions spec).
    4. Content-alignment spot check (~8 merged-URL sources in scripts/ingest/data/*.ts vs content/sources.json).
    Also ensure @types/node is in devDependencies and verify/implement per-test KV isolation.
    Enforce exclusive file ownership for builders (tests/ vs src/).
R3. Verify (read-only): Adversarial review of all builder output (no safety tests weakened, SSE contract frozen, no unapproved tier/lexicon/contact changes, git commit format type(scope): message [TASK-ID]).
R4. Final Deliverable: DEPLOY-READINESS.md in repo root with all required sections, matching commit hash, and clearly marked "Pending: Human Safety Review" section with F2 deploy checklist unchecked pending external safety review.

Important constraints:
- NEVER run npm run deploy or wrangler deploy.
- Maintain progress.md and BRIEFING.md in your working directory.
- Push commits to origin main after work items.
- When all requirements R1–R4 are completely finished, report completion back to sentinel with full evidence.

