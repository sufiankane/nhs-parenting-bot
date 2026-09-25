# Design and Development Plan

| Document ID | Title | Version | Status | Effective Date | Author | Approved By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| QMS-7.3.1-01 | Design and Development Plan | 0.2 | DRAFT | «[INSERT: TBD]» | «[INSERT: Name]» | «[INSERT: TBD]» |

## Revision History

| Version | Date | Author | Description of Change |
| :--- | :--- | :--- | :--- |
| 0.1 | «[INSERT: Date]» | «[INSERT: Name]» | Initial draft creation. |
| 0.2 | «[INSERT: Date]» | «[INSERT: Name]» | Mapped Section 2 development stages to relevant sections of the overall Technical Architecture & Implementation Plan; documented architecture document control and change tracking mechanisms; detailed Section 4 design review stage gates including CSO safety criteria engagement at Gate 1, embedded test criteria at Gate 3, and mandatory 100% safety test root-cause resolution for Gate 4. |

## 1. Purpose
This document defines the Design and Development Plan for the Naomi AI-powered chatbot, in accordance with ISO 13485:2016 (clauses 7.3.1 and 7.3.2) and IEC 62304:2015. It outlines the stages, responsibilities, review processes, and configuration management strategy for the software lifecycle of the Naomi application.

## 2. Design and Development Stages
The software lifecycle for Naomi follows a structured agile approach, mapped to IEC 62304:2015 lifecycle processes and coordinated directly with the project's master architecture document, the **Technical Architecture & Implementation Plan** (`docs/architecture-and-action-plan.md`). 

The development stages and their direct mapping to relevant sections of the overall architecture plan are structured as follows:

| Stage (IEC 62304 / ISO 13485) | Lifecycle Activities & Scope | Relevant Sections in Architecture Plan (`docs/architecture-and-action-plan.md`) |
| :--- | :--- | :--- |
| **1. Concept and Planning** | Defining intended use (non-judgmental parent-friend delivering NHS-grounded guidance for UK parents/carers of children aged 0–5), clinical scope, risk profile, edge-native technical boundaries, and project milestones. | • **Section 1 (Executive Summary):** Vision, clinical role, and core architectural premise (safety logic is deterministic code; LLM never gates escalation).<br>• **Section 2 (Guiding Principles & Non-Negotiables):** Core constraints (safety before generation, deterministic escalation, grounded answers only, UK voice, privacy by default).<br>• **Section 5 (Implementation Action Plan):** Multi-phase delivery roadmap (Phases 1–4). |
| **2. Requirements Analysis (Design Inputs)** | Deriving and capturing user needs, functional requirements, clinical risk controls, and regulatory constraints (ISO 13485, IEC 62304 Class B, UK MDR 2002, NHS DTAC, DCB0129) into the Design Inputs Document (QMS-7.3.3-01). | • **Section 2 (Guiding Principles & Non-Negotiables):** System safety rules and clinical non-negotiables.<br>• **Section 4.0 (Response Envelope Contract):** Frozen public API specifications for streaming SSE.<br>• **Section 7 (Configuration Reference):** Cloudflare platform bindings and environment variables.<br>• **Section 8 (Risk Register):** Clinical hazards, failure modes, and technical mitigations feeding safety inputs. |
| **3. Architecture and Detailed Design** | Defining system structure, software decomposition, module interfaces, data flows, database schemas, and AI inference pipelines across Cloudflare Workers, Vectorize, D1 SQLite, KV, Queues, and R2. | • **Section 3 (System Architecture):** §3.1 Component Map, §3.2 Request Flow (query path), and §3.3 Ingestion Flow (knowledge pipeline).<br>• **Section 4 (Module Specifications):** Detailed contracts for Modules M1–M8 (Gateway, Triage, Retrieval, Generation, Escalation, Ingestion, Auditing).<br>• **Section 7 (Configuration Reference):** `wrangler.toml` bindings and model configurations.<br>• **Supporting Documents:** [Safety Architecture & Clinical Triage Flow](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/nhs-parenting-bot/docs/safety-architecture-and-triage-flow.md) and Architectural Decision Records (e.g. ADR 0001 in `docs/decisions/`). |
| **4. Implementation** | Translating detailed designs into verified, modular TypeScript source code, system prompts, ingestion routines, and configuration files under strict version control. | • **Section 4 (Module Specifications):** Concrete contracts, fallback schemas, and component interfaces.<br>• **Section 5 (Implementation Action Plan):** Granular task sequences (Phase 1 MVP P1-T1–P1-T9; Phase 2 Ingestion & Multi-Turn P2-T0–P2-T5; Phase 3 Polish P3-T1–P3-T3; Phase 4 Production Readiness P4-T1–P4-T4).<br>• **Section 7 (Configuration Reference):** Pinned models (`@cf/meta/llama-3.1-8b-instruct-fp8-fast`, `@cf/baai/bge-base-en-v1.5`) and infrastructure bindings. |
| **5. Verification** | Confirming through automated testing that design outputs satisfy all design inputs (Design Verification Plan QMS-7.3.6-01), ensuring safety, algorithmic integrity, and functional correctness. | • **Section 6 (Testing & Quality Strategy):** Automated Vitest unit test suites, integration tests via Miniflare/Wrangler, golden retrieval precision/recall tests, embedding-model identity gates, and data governance verification.<br>• **Section 6 (Mandatory Red-Team Deploy Gate):** Automated adversarial suite (`npm run test:redteam`) asserting 0% Tier 1 false negatives across prompt injections, self-harm, and escalation bypasses.<br>• **Section 4 (Module Specifications):** Module-specific acceptance criteria and boundary conditions. |
| **6. Validation** | Confirming through clinical review and simulated user interaction that the finished software satisfies intended use and clinical safety objectives (Design Validation Plan QMS-7.3.7-01). | • **Section 6 (Testing & Quality Strategy):** Content & tone reviews scored against UK clinical/safeguarding rubrics; User Acceptance Testing (UAT) with real anonymised parenting scenarios reviewed by clinicians / NHS-informed advisors.<br>• **Section 6 (Production Smoke Gate):** Post-deployment remote smoke checks asserting SSE contract adherence, grounding, and absence of information leakage. |
| **7. Release and Maintenance** | Authorising production release, conducting post-market surveillance, maintaining NHS knowledge freshness, and managing software updates under rigorous change control. | • **Section 5 (Implementation Action Plan):** Phase 4 Continuous Improvement & Operational Monitoring (P4-T1–P4-T4).<br>• **Section 6 (Testing & Quality Strategy):** Production smoke verification following every deploy.<br>• **Section 8 (Risk Register):** Proactive mitigations for NHS content staleness, Vectorize drift, model drift, and SOUP monitoring.<br>• **Section 9 (Handoff Notes):** Implementation handoff criteria, operational constraints, and deploy sign-offs. |

### 2.1 Architecture Document Control and Change Tracking
The Technical Architecture & Implementation Plan (`docs/architecture-and-action-plan.md`) is a formal, change-controlled technical document governed by ISO 13485:2016 (Clause 4.2.4 Document Control and Clause 7.3.9 Control of Design and Development Changes), IEC 62304:2015 (Clause 5.2/5.3 and Clause 8 Software Configuration Management), and the Document Control Procedure (QMS-4.2.4-01).

To maintain strict design integrity and regulatory traceability, changes to the system architecture are managed under the following controls:

1. **Document Ownership and Version Metadata:** The architecture plan maintains formal document control metadata within its document header (Document Type, Version, Effective Date, Author Role, and Review Status). The document is maintained within the version-controlled repository as the definitive source of architectural truth.
2. **Change Control and Impact Assessment:** Architectural changes cannot be introduced ad-hoc or informally. Any modification to system boundaries, module contracts (e.g. M3 Triage, M4 Retrieval, M5 Generation, M6 Escalation), data flows, external services (SOUP), or Cloudflare resource bindings requires a formal change assessment. This assessment evaluates the change's impact on:
   - Intended use and clinical risk profile (per ISO 14971:2019 and DCB0129 Hazard Log QMS-14971-02).
   - Software safety classification rigor (IEC 62304 Class B).
   - User privacy and data protection (UK GDPR and NHS Caldicott Principles).
   - Need for regression testing or re-baselining of verification suites.
3. **Tracking via Project Change Log (`CHANGELOG.md`):** All architectural modifications, design progressions, and task implementations are systematically tracked and recorded in the repository's root change log (`CHANGELOG.md`), adhering to the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format and Semantic Versioning. Each change log entry explicitly documents:
   - **Task Identifier:** Formal Spec task reference (e.g. `[P1-T9]`, `[P2-T1]`, `[M3-NLP]`).
   - **Scope and Nature of Change:** Description of modified modules, interfaces, or configurations (e.g. M3 classifier activation, async ingestion pipeline, citation relevance margin filtering).
   - **Architectural Rationale:** Justification for the change and explanation of deviations from previous baselines.
   - **Verification Evidence:** Quantitative test results and safety verification evidence (e.g. unit test pass counts, red-team pass rates, 0 Critical Tier 1 false negative validations).
   - **Rule and Safety Citations:** Explicit mapping to governing safety non-negotiables (e.g. Rule 02.2 deterministic triage precedence, Rule 04.12 embedding model identity gate).
   - **Approval & Review Verdicts:** Records of independent peer review, Clinical Safety Officer / safety reviewer gates, and human authorisation.
4. **Architectural Decision Records (ADRs):** Significant architectural decisions and evaluations of technical alternatives (e.g. selection of `@cf/meta/llama-3.1-8b-instruct-fp8-fast` for generation in ADR 0001) are documented as dedicated Architectural Decision Records in `docs/decisions/` and cross-referenced in both the architecture plan and `CHANGELOG.md`.
5. **Git Workflow and Review Gates:** All architectural updates and associated code changes must be developed on isolated feature branches and merged into the protected `main` branch exclusively via Pull Requests. Each PR requires peer review, Quality Assurance sign-off, and passing automated CI checks (including `npm run test:redteam`) before merging.

## 3. Mapping to Git Workflow
The implementation and testing stages are closely integrated with our Git-based version control system:
*   **Feature Branches:** All new development and bug fixes are performed on isolated feature branches.
*   **Pull Requests (PRs):** Merging to the main branch requires a PR, which acts as a micro-design review.
*   **Code Review:** At least one independent review is required on every PR prior to merging.
*   **Main Branch Protection:** The `main` branch is protected against direct commits. Automated tests (GitHub Actions) must pass before merging.
*   **Tagged Releases:** Production releases are marked with immutable Git tags representing semantic versions.

## 4. Design Reviews
Design reviews (ISO 13485:2016 clause 7.3.5 and IEC 62304:2015) are formally planned, conducted, and documented (using the Design Review Record template QMS-7.3.5-01) at predefined stage gates to evaluate the capability of design and development results to satisfy requirements, identify deficiencies, and authorise progression:

*   **Stage Gate 1: Requirements Review (Design Inputs Gate):**
    *   **Focus:** Evaluation of Design Inputs (QMS-7.3.3-01) against user needs, clinical intent, intended use, and statutory/regulatory requirements.
    *   **Safety & CSO Engagement:** Requirements are formally checked against clinical and technical safety criteria with the **Clinical Safety Officer (CSO) actively engaged**. The CSO evaluates clinical risk boundaries, ensures compliance with NHS DCB0129 and ISO 14971:2019, and verifies clinical escalation thresholds (such as Tier 1 emergency red flags and Tier 3 safeguarding pathways) before design inputs are baselined.
*   **Stage Gate 2: Architecture Review (Design Outputs Gate):**
    *   **Focus:** Evaluation of the Technical Architecture & Implementation Plan (`docs/architecture-and-action-plan.md`), module specifications (M1–M8), and interface contracts against design inputs.
    *   **Safety Rigor:** Evaluates the structural isolation of deterministic clinical safety logic (triage and escalation) from generative AI models, verifies fail-safe degradation mechanisms, reviews Architectural Decision Records (ADRs), and verifies risk control implementations.
*   **Stage Gate 3: Verification Review (Testing Gate):**
    *   **Focus:** Conducted prior to commencing formal Design Validation to evaluate design verification results against the Design Verification Plan (QMS-7.3.6-01).
    *   **Embedded Test Strategy:** Appropriate, comprehensive test suites are formally embedded and verified in the automated CI/CD pipeline. These include:
        *   Automated unit and contract test suites covering all software units and API envelopes.
        *   Miniflare/Wrangler integration suites testing end-to-end request pipelines.
        *   Embedding-model identity and dimension verification gates (`@cf/baai/bge-base-en-v1.5`, 768-dim, cosine) preventing ungrounded generation.
        *   Retrieval precision and golden question set regression suites ensuring accurate, verified NHS content citation.
        *   Adversarial red-team test suites (`npm run test:redteam`) evaluating vulnerability to prompt injection, jailbreaking, escalation suppression, and syntactic edge-case permutations.
*   **Stage Gate 4: Release Review (Deployment Gate):**
    *   **Focus:** Final formal sign-off by the cross-functional review team (Engineering Lead, QA/Regulatory Affairs, Product Owner, and CSO) prior to authorising production deployment.
    *   **100% Safety Pass Rate & Root-Cause Remediation Prerequisite:** Stage Gate 4 approval **only occurs if the root cause of all safety test failures, clinical anomalies, and red-team findings has been fully investigated, remediated, and verified with a 100% pass rate**. Under no circumstances may a release proceed with unresolved safety defects, accepted critical false negatives, unaddressed escalation bypasses, or temporary workarounds in the clinical safety path. Full objective evidence of root-cause resolution, complete regression testing, and post-deploy smoke verification readiness must be documented in the Design Review Record (QMS-7.3.5-01) and Design History File (QMS-7.3.10-01).

## 5. Responsibilities and Authorities
*   **Product Owner:** Responsible for defining User Needs and authorising final Validation.
*   **Technical Lead:** Responsible for Architecture, Detailed Design, and Configuration Management.
*   **Quality Assurance / Regulatory Affairs:** Ensures compliance with ISO 13485, IEC 62304, and NHS DTAC. Chairs formal Design Reviews.
*   **Clinical Safety Officer (CSO):** Responsible for clinical risk management per DCB0129.

## 6. Communication
Internal communication regarding the design and development process is facilitated through daily stand-up meetings, issue tracking boards (e.g., GitHub Issues), and formal design review meetings. Cross-functional representation (Engineering, QA, Clinical) is mandatory for formal reviews.

## 7. Configuration Management
Configuration management is handled via Git and Wrangler deployments:
*   **Source Code:** Managed in GitHub with semantic versioning (e.g., v1.0.0).
*   **Architecture & Technical Documentation:** Controlled engineering documents—including the Technical Architecture & Implementation Plan (`docs/architecture-and-action-plan.md`) and QMS procedures—are tracked under Git version control with all changes logged in `CHANGELOG.md`.
*   **Environments:** The Wrangler CLI defines three distinct environments: `dev`, `staging`, and `production`. Code progresses sequentially through these environments.
*   **Traceability:** Git commits and PRs are linked to issue tickets and Spec task IDs, establishing end-to-end traceability from implementation back to design inputs.

## 8. Interface with Risk Management
Risk management activities (per ISO 14971 and IEC 62304) interface continuously with design and development. Design inputs include safety requirements derived from risk analysis. Risk control measures are implemented during detailed design and verified during the verification stage. The Clinical Safety Case Report informs and is informed by the design process.

## 9. Deliverables at Each Stage
*   **Concept:** Project Charter, Intended Use Statement (QMS-4.2.3-01).
*   **Requirements:** Design Inputs Document (QMS-7.3.3-01).
*   **Design:** Technical Architecture & Implementation Plan (`docs/architecture-and-action-plan.md`), Design Outputs Document (QMS-7.3.4-01).
*   **Implementation:** Source Code in GitHub, PR Review Records (QMS-4.2.4-01).
*   **Verification:** Design Verification Plan (QMS-7.3.6-01), Automated Test Reports.
*   **Validation:** Design Validation Plan (QMS-7.3.7-01), Clinical Safety Case Report.
*   **Release:** Release Notes, Final Design Review Record (QMS-7.3.5-01), DHF Index (QMS-7.3.10-01).

## 10. Scope and Applicability
This plan applies to all phases of design, software engineering, testing, and deployment of the Naomi SaMD.

## 11. Terms and Definitions
*   **Design and Development Stage Gate:** Formal milestone at which project deliverables are evaluated against predefined acceptance criteria before proceeding.
*   **Verification:** Confirmation through objective evidence that specified design output requirements have been fulfilled by the design inputs.
*   **Validation:** Confirmation through objective evidence that the requirements for a specific intended use or application have been fulfilled.

## 12. Inputs and Outputs
*   **Inputs:** User requirements, clinical guidelines, regulatory standards (ISO 13485, IEC 62304, ISO 14971, UK MDR 2002, NHS DTAC).
*   **Outputs:** Verified and validated Naomi software build, complete Design History File (QMS-7.3.10-01), design review records.

## 13. Records Generated
*   Design Review Records (QMS-7.3.5-01).
*   Stage Gate Approval Sign-Offs.
*   Design History File Index (QMS-7.3.10-01).

