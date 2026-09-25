# Design History File (DHF) Index

| Document ID | Title | Version | Status | Effective Date | Author | Approved By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| QMS-7.3.10-01 | Design History File Index | 0.2 | DRAFT | «[INSERT: TBD]» | «[INSERT: Name]» | «[INSERT: TBD]» |

## Revision History

| Version | Date | Description of Changes | Author |
| :--- | :--- | :--- | :--- |
| 0.1 | «[INSERT: Date]» | Initial Draft creation. | «[INSERT: Name]» |
| 0.2 | «[INSERT: Date]» | Comprehensively linked DHF to engineering change logs (`CHANGELOG.md`), Architectural Decision Records (`docs/decisions/`), Technical Architecture and Action Plan (`docs/architecture-and-action-plan.md`), Safety Architecture (`docs/safety-architecture-and-triage-flow.md`), clinical safety review records (`SafetyBatch.md`), URL verification records, automated verification test reports, and formal Stage Gate design review records in compliance with ISO 13485:2016 (Clause 7.3.10) and IEC 62304:2015. | «[INSERT: Name]» |

## 1. Purpose of the DHF
The purpose of this Design History File (DHF) Index is to provide an audit-ready, centralised reference demonstrating that the Naomi Software as a Medical Device (SaMD) was developed in accordance with the approved Design and Development Plan ([`design-development-plan.md`](./design-development-plan.md) / QMS-7.3.1-01), the requirements of ISO 13485:2016 (Clause 7.3.10), IEC 62304:2015 (Clauses 5 and 8), ISO 14971:2019, and the UK Medical Devices Regulations (UK MDR 2002).

This document serves as the master navigational index linking all design and development plans, user requirements, design inputs, software architecture designs, risk management records, design verification protocols, clinical validation evidence, engineering change logs, and formal stage-gate review sign-offs across the software lifecycle.

## 2. Instructions for Maintaining the DHF
- **Maintenance Authority:** The Quality Manager (in coordination with the Lead Developer and Clinical Safety Officer) is responsible for maintaining and updating this DHF Index throughout all product development phases and post-market release cycles.
- **Controlled Repositories:** All design records, specifications, architecture documents, test suites, and change logs referenced herein are maintained in the organisation's version-controlled Git repository under strict branch protection rules (requiring peer code review, quality gate sign-off, and passing automated regression suites before merge).
- **Dual-Layer Documentation Traceability:**
  1. **Formal QMS Procedural Records:** High-level policies, procedures, and regulatory plans reside in `iso-13485-qms/` governed by the Document Control Procedure ([`document-control-procedure.md`](../01-clause-4-qms/document-control-procedure.md) / QMS-4.2.4-01).
  2. **Technical Engineering History & Change Logs:** Granular software architecture plans, module specifications, Architectural Decision Records (ADRs), clinical safety review batches, red-team test logs, and task-by-task change records reside in `nhs-parenting-bot/` (and its `docs/` and `CHANGELOG.md` files) linked directly to Git commits and pull requests.
- **Traceability Baseline:** Every software release baseline must be accompanied by an updated DHF Index verifying that all stage-gate reviews are completed and signed off per the Design Review Record Template ([`design-review-records-template.md`](./design-review-records-template.md) / QMS-7.3.5-01).

## 3. DHF Master Index Table

The design history of the Naomi SaMD is documented across the following lifecycle phases and records:

| Phase / Category | Document / Record Title | Document ID / Reference | Version / Baseline | Status | Location / Relative Link |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Planning** | Design and Development Plan | QMS-7.3.1-01 | 0.2 | DRAFT | [`design-development-plan.md`](./design-development-plan.md) |
| **Planning** | Software Lifecycle Plan (IEC 62304 Class B) | QMS-62304-01 | 0.2 | DRAFT | [`software-lifecycle-plan.md`](./software-lifecycle-plan.md) |
| **Planning** | Software Safety Classification Record (IEC 62304 Clause 4.3) | QMS-62304-03 | 0.1 | DRAFT | [`software-safety-classification-record.md`](./software-safety-classification-record.md) |
| **Planning** | Risk Management Plan | QMS-14971-01 | 0.2 | DRAFT | [`risk-management-plan.md`](./risk-management-plan.md) |
| **Inputs** | Design Inputs (User Needs & Functional Requirements) | QMS-7.3.3-01 | 0.1 | DRAFT | [`design-inputs.md`](./design-inputs.md) |
| **Inputs (Regulatory)** | UKCA MDR 2002 Classification Assessment | QMS-REG-01 | 0.1 | DRAFT | [`ukca-mdr-classification.md`](../06-uk-nhs-overlay/ukca-mdr-classification.md) |
| **Inputs (Regulatory)** | NHS DTAC Assessment Mapping | QMS-REG-02 | 0.1 | DRAFT | [`dtac-assessment-mapping.md`](../06-uk-nhs-overlay/dtac-assessment-mapping.md) |
| **Inputs (Regulatory)** | Data Protection Impact Assessment (DPIA) | QMS-REG-03 | 0.1 | DRAFT | [`dpia-data-protection.md`](../06-uk-nhs-overlay/dpia-data-protection.md) |
| **Architecture & Design** | Technical Architecture & Implementation Plan | Authoritative Spec v1.0 | v1.0 | Active | [`docs/architecture-and-action-plan.md`](../../nhs-parenting-bot/docs/architecture-and-action-plan.md) |
| **Architecture & Design** | Safety Architecture & Clinical Triage Flow Specification | Tech Spec | v1.0 | Active | [`docs/safety-architecture-and-triage-flow.md`](../../nhs-parenting-bot/docs/safety-architecture-and-triage-flow.md) |
| **Architecture & Design** | Design Outputs Document | QMS-7.3.4-01 | 0.2 | DRAFT | [`design-outputs.md`](./design-outputs.md) |
| **Design Decisions** | ADR 0001: Generation Model Selection (`llama-3.1-8b-instruct-fp8-fast`) | ADR-0001 | 1.0 | Approved | [`docs/decisions/0001-generation-model-llama-3.1-8b-fp8-fast.md`](../../nhs-parenting-bot/docs/decisions/0001-generation-model-llama-3.1-8b-fp8-fast.md) |
| **Design Decisions** | Citation Relevance Margin Filtering Design Note | Task Note P2-CIT | 1.0 | Complete | [`docs/phase-2-citation-relevance-task-note.md`](../../nhs-parenting-bot/docs/phase-2-citation-relevance-task-note.md) |
| **Purchasing & SOUP** | Supplier and Purchasing Procedure (Cloudflare, Models, NHS Feeds) | QMS-7.4-01 | 0.1 | DRAFT | [`supplier-purchasing-procedure.md`](./supplier-purchasing-procedure.md) |
| **Purchasing & SOUP** | SOUP Inventory and Evaluation Log (IEC 62304 Clauses 5.3.3, 5.3.4, 7.1.2) | QMS-62304-02 | 0.1 | DRAFT | [`soup-log.md`](./soup-log.md) |
| **Stage Gate Reviews** | Design Review Record Template (Stage Gates 1 to 4) | QMS-7.3.5-01 | 0.1 | DRAFT | [`design-review-records-template.md`](./design-review-records-template.md) |
| **Stage Gate 1 Record** | Stage Gate 1: Design Inputs & CSO Safety Criteria Review | DR-SG1-01 | «[TBD]» | Pending | QMS / Clause 7 Records |
| **Stage Gate 2 Record** | Stage Gate 2: Architecture & Detailed Design Review | DR-SG2-01 | «[TBD]» | Pending | QMS / Clause 7 Records |
| **Stage Gate 3 Record** | Stage Gate 3: Verification & Test Strategy Review | DR-SG3-01 | «[TBD]» | Pending | QMS / Clause 7 Records |
| **Stage Gate 4 Record** | Stage Gate 4: Release & 100% Safety Remediation Review | DR-SG4-01 | «[TBD]» | Pending | QMS / Clause 7 Records |
| **Risk Management** | Risk Management File & DCB0129 Clinical Hazard Log | QMS-14971-02 | 0.1 | DRAFT | [`risk-management-file.md`](./risk-management-file.md) |
| **Clinical Safety Review** | Safety Review Batch S1–S20 & A1–A4 (Clinical Corrections) | Batch Record | v1.0 | Verified | [`SafetyBatch.md`](../../nhs-parenting-bot/SafetyBatch.md) |
| **Knowledge Provenance** | NHS Source Allow-List Remediation & Verification Log | Verification Map | 2026-08-21 | Approved | [`docs/url-verification-2026-08-21.md`](../../nhs-parenting-bot/docs/url-verification-2026-08-21.md) |
| **Verification** | Design Verification Plan (Unit, Integration, Red-Team) | QMS-7.3.6-01 | 0.1 | DRAFT | [`design-verification-plan.md`](./design-verification-plan.md) |
| **Verification Evidence** | Automated Vitest Test Suites (422 unit/contract tests) | CI Pipeline | Continuous | Pass | `nhs-parenting-bot/tests/` |
| **Verification Evidence** | Adversarial Red-Team Safety Suite (42/42 scenarios, 0 T1 FN) | CI Redteam Gate | Continuous | Pass | `nhs-parenting-bot/tests/redteam/` |
| **Verification Evidence** | 1,000-Scenario Adversarial Runner & Golden Report (99.5% Pass) | M3 Suite | Continuous | Pass | `nhs-parenting-bot/scripts/test-scenarios-runner.ts` |
| **Verification Evidence** | Production Deployment Smoke & Readiness Verification | Gate Report | v1.0 | Ready | [`DEPLOY-READINESS.md`](../../nhs-parenting-bot/DEPLOY-READINESS.md), [`OVERNIGHT-REPORT.md`](../../nhs-parenting-bot/OVERNIGHT-REPORT.md) |
| **Validation** | Design Validation Plan (Clinical Evaluation & UAT) | QMS-7.3.7-01 | 0.1 | DRAFT | [`design-validation-plan.md`](./design-validation-plan.md) |
| **Traceability** | Traceability Procedure & Bidirectional Traceability Matrix | QMS-7.5.9-01 | 0.1 | DRAFT | [`traceability-procedure.md`](./traceability-procedure.md) |
| **Device File Index** | Medical Device File (MDF Index) | QMS-4.2.3-01 | 0.1 | DRAFT | [`medical-device-file.md`](../01-clause-4-qms/medical-device-file.md) |
| **Change Control** | Master Engineering Change Log (Keep a Changelog format) | Master Log | Continuous | Active | [`CHANGELOG.md`](../../nhs-parenting-bot/CHANGELOG.md) |
| **Configuration History** | Git Repository Commit History, Pull Requests & Tags | Git VCS | Main Branch | Immutable | `nhs-parenting-bot/.git` |

## 4. Software Configuration Items List
The Naomi SaMD consists of the following managed configuration items (CIs) tracked and versioned in the corporate GitHub repository under branch protection controls:

1. **Edge Application Source Code (CI-01):**
   - Main Worker gateway and routing pipeline (`src/index.ts`)
   - M1 Frontend client interface and accessible chat widget (`public/index.html`, `public/widget.js`)
   - M2 Edge gateway, CORS policy, rate limiting, and frozen error envelopes (`src/gateway/`)
   - M3 Safety & triage module, deterministic keyword lexicons, normalisation, and classifier (`src/triage/`)
   - M4 RAG retrieval pipeline, Vectorize query, D1 chunk lookup, and similarity thresholding (`src/retrieval/`)
   - M5 Grounded generation module, system prompt templates, safety prohibitions, and SSE token streaming (`src/generation/`)
   - M6 Immutable escalation router, safeguarding contact constants, and signpost templates (`src/escalation/`)
   - KV session storage and TTL expiration management (`src/sessions/`)
   - M7 Asynchronous ingestion pipeline, allow-list validator, and queue consumers (`src/ingest/`)
   - M8 Anonymised triage audit logging pipeline (`src/audit/`)
2. **Infrastructure as Code & Platform Configuration (CI-02):**
   - Cloudflare Workers configuration and resource bindings (`wrangler.toml`)
   - TypeScript compilation parameters (`tsconfig.json`)
   - Node and package dependencies (`package.json`, `package-lock.json`)
   - Test framework configuration (`vitest.config.ts`)
3. **Curated NHS Clinical Knowledge Corpus (CI-03):**
   - Authoritative NHS source URL allow-list registry (`content/sources.json`)
   - Curated, SHA-256 hashed NHS guidance chunk seed dataset (`content/nhs_faq_seed.json`)
   - Ingestion builder scripts and category definitions (`scripts/ingest/`)
   - Cloudflare D1 SQLite relational schema definitions for chunks and triage audit logs
4. **Verification, Adversarial & Regression Test Artifacts (CI-04):**
   - Automated unit, contract, and golden retrieval test suites (`tests/`)
   - Adversarial red-team test suite and injection bypass tests (`tests/redteam/`)
   - 1,000-scenario adversarial stress suite runner and report generators (`scripts/test-scenarios-runner.ts`)
   - Remote post-deployment smoke verification scripts (`scripts/smoke/remote-golden-check.ts`)
5. **Controlled Technical Documentation & Architectural Specifications (CI-05):**
   - Master Technical Architecture & Implementation Plan (`docs/architecture-and-action-plan.md`)
   - Safety Architecture & Clinical Triage Flow Specification (`docs/safety-architecture-and-triage-flow.md`)
   - Architectural Decision Records (`docs/decisions/`)
   - Master Engineering Change Log (`CHANGELOG.md`)
   - Clinical Safety Review Batch Records (`SafetyBatch.md`)
   - Deployment Readiness and Operational Verification Reports (`DEPLOY-READINESS.md`, `OVERNIGHT-REPORT.md`)
6. **Controlled QMS Procedures and Quality Records (CI-06):**
   - Full ISO 13485:2016 and IEC 62304 documentation set (`iso-13485-qms/`)

## 5. Change History and Engineering Evolution Summary

In accordance with ISO 13485:2016 (Clause 7.3.9 Control of Design and Development Changes) and IEC 62304:2015 (Clause 8 Software Configuration Management), all architectural modifications, bug fixes, model migrations, and clinical safety enhancements are recorded systematically. 

The granular, day-to-day engineering change record is maintained in the project's master change log:  
👉 **[`CHANGELOG.md`](../../nhs-parenting-bot/CHANGELOG.md)** (adhering to [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and Semantic Versioning).

The table below provides a formal Design History summary of major design milestones, Engineering Change Orders (ECOs), and architectural progressions linking the engineering change log, specifications, and clinical reviews to this DHF:

| ECO / Milestone Ref | Task / Commit Ref | Effective Date | Affected Modules & CIs | Description of Architectural & Design Changes | Clinical / Safety Impact Assessment | Verification & Approval Reference |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ECO-001** | `[P0-T1]` | 2026-08-20 | Architecture Plan, CI-05 | **Specification & Architectural Baseline:** Authoritative Technical Architecture & Implementation Plan baselined into `docs/architecture-and-action-plan.md`. Established core safety non-negotiables (deterministic code executes before generative LLM; LLM never gates escalation; frozen SSE response envelope). | High — Establishes fundamental system safety invariants protecting against ungrounded AI hallucination and bypassed triage. | Formal review in Spec v1.0; documented in [`CHANGELOG.md`](../../nhs-parenting-bot/CHANGELOG.md#changed). |
| **ECO-002** | `[P1-T1]` – `[P1-T4]` | 2026-08-20 | M2 Gateway, M3 Triage, M6 Escalation (CI-01) | **Safety Foundation & Gateway Pipeline:** Scaffolded Cloudflare Worker runtime; implemented frozen `{type:"error", payload:{code,message}}` error envelope. Built deterministic M3 keyword triage lexicon across 3 tiers with NFKD Unicode normalisation, homoglyph stripping, and deep runtime immutability. Built M6 Escalation router with frozen UK safeguarding contacts (999, 111, NSPCC, Childline, Young Minds, National DA Helpline). | Critical — Guaranteed deterministic detection of acute medical emergencies and safeguarding risks without LLM dependency. | 91 unit tests (`tests/triage.test.ts`), 25 redteam tests (`tests/redteam/triage-redteam.test.ts`), 10 M6 tests (`tests/escalation.test.ts`). |
| **ECO-003** | `[P1-T5]` | 2026-08-21 | Ingestion, Knowledge Base (CI-03) | **Curated NHS Knowledge Corpus Regeneration:** Built deterministic seed generation pipeline (`scripts/ingest/build-seed.ts`). Regenerated 74 verified chunks across 7 clinical domains (newborn care, feeding, weaning, sleep, teething, minor ailments, emotional wellbeing). Enforced SHA-256 content hashing (`id === content_hash`) and canonical URL matching. | High — Eliminates arbitrary web scraping; guarantees that clinical guidance originates solely from verified NHS sources. | 102 passing golden provenance tests in `tests/retrieval-golden.test.ts`. |
| **ECO-004** | `[P1-T5/P1-T6]` | 2026-08-21 | Clinical Content, CI-03 | **Clinical Safety Review Batch S1–S20 & A1–A4:** Applied clinical safety review findings: updated emergency red-flag chunks (non-blanching rash, unresponsiveness, respiratory distress, choking, anaphylaxis, perinatal crisis) to mandate 999/A&E routing; corrected fever chunk to lead with under-3-months escalation rule; removed cradle-cap olive oil advice; corrected teething advice to pharmacist/GP. | Critical — Remediated clinical defects in knowledge corpus to prevent delayed emergency care. | Detailed batch review record in [`SafetyBatch.md`](../../nhs-parenting-bot/SafetyBatch.md); verified in commit `cc89e43`. |
| **ECO-005** | `[P1-T5]` | 2026-08-21 | Allow-list, CI-03 | **NHS Allow-List URL Remediation:** Executed dual-crawler verification across all allow-listed NHS URLs. Remediated 26 dead URLs (caused by NHS Start for Life to Best Start in Life information architecture migration) across 60 occurrences in `content/sources.json` and `scripts/ingest/data/*.ts`. Disabled retired sticky-eyes page. | Medium — Ensures user-facing source citations resolve to live NHS digital pages. | Full verification map documented in [`docs/url-verification-2026-08-21.md`](../../nhs-parenting-bot/docs/url-verification-2026-08-21.md); human operator approved. |
| **ECO-006** | `[P1-T6]` | 2026-08-21 | M4 Retrieval, M5 Generation, `/chat` (CI-01) | **RAG Pipeline & End-to-End Chat Wiring:** Implemented Vectorize similarity threshold search (0.5) with safe-empty fallback. Implemented M5 generation with strict system prompt prohibitions (no diagnosing, no prescribing, no contradicting escalation, no system prompt leakage). Connected `/chat` request pipeline: CORS → Rate Limit → Mandatory M3 Triage → M6 Escalation (T1–T3) OR M4 Retrieval + M5 Generation (T4). | Critical — Complete enforcement of clinical safety pipeline: zero AI/Vectorize calls permitted for escalated tiers. | Contract suites in `tests/retrieval.test.ts` (11), `tests/generation.test.ts` (11), and `tests/chat-flow.test.ts` (7). |
| **ECO-007** | `[P1-T7]` – `[P1-T8]` | 2026-08-21 | M1 Frontend, Sessions, Gateway (CI-01) | **Accessible Client & KV Session Architecture:** Implemented single-box accessible UI in `public/` parsing frozen SSE streaming envelopes. Implemented KV-backed session store with mandatory 24-hour TTL on every put. Implemented fixed-window rate limiter keyed on client IP hash failing open on KV error. | Medium — Protects user privacy via automatic 24-hour data disposal; prevents DDoS. | Contract suites in `tests/frontend.test.ts` (29), `tests/sessions.test.ts` (8), and `tests/rateLimit.test.ts` (6). |
| **ECO-008** | `[P1-T9]` / ADR-0001 | 2026-08-21 | M5 Generation, M4 Retrieval (CI-01, CI-02) | **Generation Model Update & Fail-Closed Embedding Gate:** Following Cloudflare deprecation of initial model (Error 5028), migrated pinned generation model to `@cf/meta/llama-3.1-8b-instruct-fp8-fast` under formal Human Gate sign-off (ADR 0001). Implemented fail-closed embedding model identity gate (`@cf/baai/bge-base-en-v1.5`, 768 dimensions). Enforced baby formula discard rules (2 hours room temperature, 24 hours fridge) in generation prompts. Lowered temperature to 0.1 and raised max tokens to 1024. | Critical — Prevents silent model substitution; prevents ungrounded generation; eliminates omission of safety-critical feeding instructions. | Documented in [`docs/decisions/0001-generation-model-llama-3.1-8b-fp8-fast.md`](../../nhs-parenting-bot/docs/decisions/0001-generation-model-llama-3.1-8b-fp8-fast.md); verified via golden smoke assertions. |
| **ECO-009** | `[P2-T0]` – `[P2-T4]`, `[P2-CIT]` | 2026-08-22 | M4, M7 Ingest, M8 Audit, Sessions (CI-01) | **Advanced Ingestion, Citation Margin & Audit Log:** Implemented relative citation margin filtering (`DEFAULT_RELEVANCE_MARGIN = 0.08`) and `[SAFETY WARNING]` context prefixing. Implemented M7 async ingestion pipeline using R2 and Cloudflare Queues with allow-list gates and SHA-256 chunk provenance. Implemented M8 D1-backed anonymised audit logger (zero user text, zero PII, coarse categories and pseudonymous session IDs only). Enabled 6-turn KV conversation history in generation prompts. | High — Prevents tangential citations; guarantees tamper-evident knowledge ingestion; ensures GDPR compliance for audit logs. | Documented in [`docs/phase-2-citation-relevance-task-note.md`](../../nhs-parenting-bot/docs/phase-2-citation-relevance-task-note.md); test suites in `tests/ingest-pipeline.test.ts` (11) and `tests/audit.test.ts` (7). |
| **ECO-010** | `[M3-LEXICON]`, `[M3-NLP]` | 2026-08-23 | M3 Triage Classifier & Lexicon (CI-01) | **Triage Lexicon Expansion & Semantic Catch-All:** Expanded deterministic lexicon with ~200 phrase variants across all tiers to resolve clinical phrasing permutations. Upgraded classifier to `@cf/meta/llama-3.1-8b-instruct-fp8-fast` and integrated as semantic catch-all in live `/chat` path. Tier 1 lexicon matches bypass classifier immediately; AI failures degrade safely to lexicon result. | Critical — Remediated all 20 Critical Tier 1 false negatives. Validated across 1,000-scenario adversarial suite (`brain/test-scenarios.md`), achieving 99.5% pass rate (up from 75.1% baseline). | Documented in [`CHANGELOG.md`](../../nhs-parenting-bot/CHANGELOG.md#unreleased); automated test runner `scripts/test-scenarios-runner.ts`; 422 unit tests and 42 redteam tests passing. |
| **ECO-011** | `[P3-T1]` | 2026-08-23 | M1 Frontend (CI-01) | **Accessible Chat UI Polish:** Upgraded frontend widget to full conversational UI with user/assistant speech bubbles, animated streaming typing indicators, WCAG AA compliant contrast, accessible `role="alert"` signpost rendering, and keyboard focus management. | Medium — Ensures accessible user experience for anxious parents and carers under stress. | 31 frontend contract tests in `tests/frontend.test.ts`. |

## 6. Scope and Applicability
This Design History File applies to all software releases, algorithmic updates, clinical content revisions, model configurations, and infrastructure deployments of the Naomi SaMD application. It encompasses all historical and active development records from project inception through post-market maintenance.

## 7. Terms and Definitions
*   **Design History File (DHF):** A compilation of records that describes the design history of a finished medical device (ISO 13485:2016 Clause 7.3.10).
*   **Configuration Item (CI):** An aggregation of hardware, software, or both, that is designated for configuration management and treated as a single entity in the configuration management process (IEC 62304:2015).
*   **Architectural Decision Record (ADR):** A captured software architecture decision detailing context, evaluated alternatives, clinical safety rationale, and sign-off.
*   **Engineering Change Order (ECO):** A formal record specifying an approved modification to design inputs, software code, system prompts, or configuration items.
*   **Software of Unknown Provenance (SOUP):** Software that is already developed and generally available and that has not been developed for the purpose of being incorporated into the medical device (e.g. Cloudflare Workers runtime, foundational LLMs).

## 8. Responsibilities
*   **Quality Manager:** Exercises oversight over the DHF Index; verifies that all design outputs and stage-gate records are complete, reviewed, and approved prior to each software release.
*   **Lead Developer:** Submits design outputs, code snapshots, pull requests, automated test run reports, and architectural decision records for inclusion in the DHF; ensures strict synchronisation between `CHANGELOG.md` and this DHF Index.
*   **Clinical Safety Officer (CSO):** Evaluates clinical safety implications of all design outputs, change orders, model migrations, and clinical review batches in accordance with DCB0129 and ISO 14971:2019.

## 9. Inputs and Outputs
*   **Inputs:** Design and Development Plan ([`design-development-plan.md`](./design-development-plan.md) / QMS-7.3.1-01), Design Inputs ([`design-inputs.md`](./design-inputs.md) / QMS-7.3.3-01), Design Outputs ([`design-outputs.md`](./design-outputs.md) / QMS-7.3.4-01), Risk Management File ([`risk-management-file.md`](./risk-management-file.md) / QMS-14971-02), Design Review Records ([`design-review-records-template.md`](./design-review-records-template.md) / QMS-7.3.5-01), Master Change Log ([`CHANGELOG.md`](../../nhs-parenting-bot/CHANGELOG.md)), and Git commit records.
*   **Outputs:** Audit-ready Design History File demonstrating compliance with ISO 13485:2016 (Clause 7.3.10), IEC 62304:2015 (Clause 5 & Clause 8), and UK MDR 2002.

## 10. Records Generated
*   DHF Index Master Record ([`design-history-file.md`](./design-history-file.md) / QMS-7.3.10-01).
*   Completed and signed Design Review Records for Stage Gates 1 through 4 ([`design-review-records-template.md`](./design-review-records-template.md) / QMS-7.3.5-01).
*   Release Baselines, Tagged Git Commits, and Engineering Change Order records documented in [`CHANGELOG.md`](../../nhs-parenting-bot/CHANGELOG.md).
