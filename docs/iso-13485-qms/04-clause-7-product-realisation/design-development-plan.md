# Design and Development Plan

| Document ID | Title | Version | Status | Effective Date | Author | Approved By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| QMS-7.3.1-01 | Design and Development Plan | 0.1 | DRAFT | «[INSERT: TBD]» | «[INSERT: Name]» | «[INSERT: TBD]» |

## Revision History

| Version | Date | Author | Description of Change |
| :--- | :--- | :--- | :--- |
| 0.1 | «[INSERT: Date]» | «[INSERT: Name]» | Initial draft creation. |

## 1. Purpose
This document defines the Design and Development Plan for the Naomi AI-powered chatbot, in accordance with ISO 13485:2016 (clauses 7.3.1 and 7.3.2) and IEC 62304:2015. It outlines the stages, responsibilities, review processes, and configuration management strategy for the software lifecycle of the Naomi application.

## 2. Design and Development Stages
The software lifecycle for Naomi follows a structured agile approach, mapped to IEC 62304 lifecycle processes. The stages are:

*   **Concept and Planning:** Defining the initial scope, intended use, and project plan.
*   **Requirements Analysis (Design Inputs):** Deriving user needs, functional, safety, performance, and regulatory requirements (UK MDR 2002, NHS DTAC).
*   **Architecture and Detailed Design:** Designing the software architecture, including Cloudflare Workers, RAG pipeline, LLM integration, Vectorize, KV, and D1 SQLite audit database.
*   **Implementation:** Coding the software using TypeScript according to defined design outputs.
*   **Verification:** Confirming through testing (Vitest, CI/CD) that design outputs meet design inputs.
*   **Validation:** Confirming through clinical and user testing that the software meets user needs and intended use.
*   **Release and Maintenance:** Releasing the software to production and managing post-market activities.

## 3. Mapping to Git Workflow
The implementation and testing stages are closely integrated with our Git-based version control system:
*   **Feature Branches:** All new development and bug fixes are performed on isolated feature branches.
*   **Pull Requests (PRs):** Merging to the main branch requires a PR, which acts as a micro-design review.
*   **Code Review:** At least one independent review is required on every PR prior to merging.
*   **Main Branch Protection:** The `main` branch is protected against direct commits. Automated tests (GitHub Actions) must pass before merging.
*   **Tagged Releases:** Production releases are marked with immutable Git tags representing semantic versions.

## 4. Design Reviews
Design reviews (ISO 13485 clause 7.3.5) are formally planned and conducted at specific stage gates to evaluate the adequacy of design and development results:
*   **Stage Gate 1: Requirements Review:** Upon completion of Design Inputs.
*   **Stage Gate 2: Architecture Review:** Upon completion of Software Architecture and Detailed Design.
*   **Stage Gate 3: Verification Review:** Prior to commencing formal Design Validation.
*   **Stage Gate 4: Release Review:** Final sign-off before deploying to production.

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
*   **Environments:** The Wrangler CLI defines three distinct environments: `dev`, `staging`, and `production`. Code progresses sequentially through these environments.
*   **Traceability:** Git commits are linked to issue tickets, establishing traceability from implementation back to requirements.

## 8. Interface with Risk Management
Risk management activities (per ISO 14971 and IEC 62304) interface continuously with design and development. Design inputs include safety requirements derived from risk analysis. Risk control measures are implemented during detailed design and verified during the verification stage. The Clinical Safety Case Report informs and is informed by the design process.

## 9. Deliverables at Each Stage
*   **Concept:** Project Charter, Intended Use Statement (QMS-4.2.3-01).
*   **Requirements:** Design Inputs Document (QMS-7.3.3-01).
*   **Design:** Software Architecture Document, Design Outputs Document (QMS-7.3.4-01).
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

