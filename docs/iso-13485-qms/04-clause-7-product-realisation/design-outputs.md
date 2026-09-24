# Design Outputs

| Document ID | Title | Version | Status | Effective Date | Author | Approved By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| QMS-7.3.4-01 | Design Outputs | 0.1 | DRAFT | «[INSERT: TBD]» | «[INSERT: Name]» | «[INSERT: TBD]» |

## Revision History

| Version | Date | Author | Description of Change |
| :--- | :--- | :--- | :--- |
| 0.1 | «[INSERT: Date]» | «[INSERT: Name]» | Initial draft creation. |

## 1. Purpose
This document details the design outputs for the Naomi AI-powered chatbot, in accordance with ISO 13485:2016 (clause 7.3.4). Design outputs constitute the final technical specifications, source code, and configurations that enable the provision of the software application, ensuring it meets the defined design inputs.

## 2. Design Output Categories
The design outputs for the Naomi SaMD are structured into the following key categories:

### 2.1 Software Architecture and Specifications
*   **Software Architecture Document:** Defines the high-level system boundaries, data flow between Cloudflare Workers, the external LLaMA 3.1 8B FP8 generation model, and persistent stores (KV, D1, Vectorize).
*   **API Specifications:** OpenAPI/Swagger definitions for:
    *   `/api/chat`: The primary user interaction endpoint.
    *   `/api/health`: Diagnostic endpoint for system uptime monitoring.
    *   `/api/admin/ingest`: Protected endpoint for updating the RAG knowledge base.

### 2.2 Source Code and Configuration
*   **Source Code Repository:** The definitive design output is the version-controlled TypeScript source code hosted on GitHub (Repository: `«[INSERT: GitHub Org/naomi]»`).
*   **System Prompt and Safety Rules:** Defined programmatically within `src/prompts/prompt.ts`, establishing the core constraints for the LLaMA model (e.g., tone, refusal to diagnose).
*   **Deployed Configuration:** The `wrangler.toml` file, which specifies environmental variables, rate limiting configurations, and resource bindings for Cloudflare Workers.

### 2.3 Database Schemas
*   **Audit Database (D1 SQLite):** Schema defining the structure for logging interactions, including timestamps, session IDs, triage classifications, and user queries (anonymised).
*   **Vector DB (Vectorize):** Index configuration mapping embedded NHS content chunks to vector dimensions.
*   **Session Store (KV):** Data structure for managing transient conversational history.

### 2.4 Testing Artifacts
*   **Test Suite:** The automated Vitest unit and integration test suite located in the `tests/` directory of the repository.

## 3. Acceptance Criteria for Design Outputs
Prior to release, design outputs must meet the following criteria:
*   Source code must pass all static analysis and linting checks.
*   The `wrangler.toml` must successfully validate against the Cloudflare production environment constraints.
*   Database schemas must execute without syntax errors during CI/CD migration steps.
*   The system prompt (`prompt.ts`) must pass the red-team adversarial test suite with zero critical safety violations.

## 4. Traceability to Design Inputs
Design outputs are strictly traceable to design inputs (QMS-7.3.3-01). This traceability ensures that every functional and safety requirement has a corresponding implemented output.
*   *Example Traceability:*
    *   **Input FR-03 (Escalation):** Traced to Output -> `src/modules/escalation.ts` and `/api/chat` router configuration.
    *   **Input SR-01 (No Diagnosis):** Traced to Output -> `src/prompts/prompt.ts` (System Prompt directives) and `tests/safety/diagnosis.test.ts`.
    *   **Input FR-06 (Audit Logging):** Traced to Output -> D1 SQLite schema and `src/modules/audit-logger.ts`.

A comprehensive traceability matrix is maintained as a separate living document within the QMS tracking system (referenced in QMS-7.3.10-01).

## 5. Scope and Applicability
This document covers all engineering artifacts, codebases, schema definitions, and system configurations constituting the Naomi SaMD.

## 6. Terms and Definitions
*   **Design Output:** The result of a design and development effort at each stage and for the finished device, including specifications, source code, schemas, and packaging/labelling.
*   **Wrangler Configuration:** Configuration manifest defining Cloudflare Worker routes, environment variables, and bindings.
*   **System Prompt:** Master instructions passed to the LLM defining behavioural guardrails and response rules.

## 7. Responsibilities
*   **Lead Developer:** Owns the design outputs, ensures code review compliance, and executes schema deployments.
*   **Clinical Safety Officer:** Reviews prompt engineering rules and clinical safety guardrails within `prompt.ts`.
*   **Quality Manager:** Confirms that all design outputs satisfy acceptance criteria and maintain bidirectional traceability to design inputs.

## 8. Inputs and Outputs
*   **Inputs:** Design Inputs specification (QMS-7.3.3-01), Risk Management File (QMS-14971-02), IEC 62304 architectural requirements.
*   **Outputs:** Released source code, compiled worker bundles, API endpoints, schema definitions, and verification targets for QMS-7.3.6-01.

## 9. Records Generated
*   GitHub Tagged Releases and Commit Hashes.
*   CI/CD Build Artifacts and OpenAPI Specifications.
*   Design History File Index (QMS-7.3.10-01).

