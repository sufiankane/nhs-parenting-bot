# Software Lifecycle Plan

| Document ID | Title | Version | Status | Effective Date | Author | Approved By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| QMS-62304-01 | Software Lifecycle Plan | 0.1 | DRAFT | «[INSERT: TBD]» | «[INSERT: Name]» | «[INSERT: TBD]» |

## Revision History
| Version | Date | Description of Changes | Author |
| :--- | :--- | :--- | :--- |
| 0.1 | «[INSERT: Date]» | Initial Draft | «[INSERT: Name]» |

## 1. Purpose and Scope
This document outlines the software development lifecycle, safety classification, and configuration management processes for the Naomi NHS Parenting Chatbot. It is developed in compliance with IEC 62304:2015+AMD1:2015 and ISO 13485:2016 (Clause 7.3). 

## 2. Software Safety Classification
In accordance with IEC 62304, the software safety classification determines the rigorousness of the lifecycle processes required.

**Classification Determination: Class B**
- **Justification:** The Naomi SaMD does not directly diagnose or treat critical conditions, nor does it control life-sustaining equipment. However, as identified in the Risk Management File (QMS-14971-02, Hazards HZ-02, HZ-03, HZ-04), a failure of the software to provide accurate information or appropriately escalate severe symptoms could lead to a delay in seeking necessary medical care. This delay represents a potential for indirect, non-serious injury (Class B). It is not expected to result in death or serious deterioration of health (Class C) provided risk controls are functioning.

## 3. Software Development Lifecycle Activities
The Naomi development process follows a tailored Agile methodology that maps to the IEC 62304 lifecycle requirements:

1. **Software Development Planning:** Defined by this document.
2. **Software Requirements Analysis:** Captured in the Software Requirements Specification (SRS). Includes functional, safety, and regulatory requirements (NHS DTAC, DCB0129).
3. **Software Architectural Design:** Documentation of the system components (Cloudflare Workers, D1, Vectorize, LLaMA 3.1) and their interfaces.
4. **Software Detailed Design:** Required for Class B. Documented via codebase architecture documentation and detailed PR reviews.
5. **Software Unit Implementation and Verification:** Developers write unit tests (e.g., using Jest/Vitest). Peer review of all code via GitHub Pull Requests.
6. **Software Integration and Integration Testing:** CI/CD pipelines run automated integration tests to ensure modules (e.g., Classifier -> RAG -> Generation) interact correctly.
7. **Software System Testing:** Formal verification testing against the SRS in a staging environment prior to release.
8. **Software Release:** Approval by QA and Management. Automated deployment via GitHub Actions to production.

## 4. Software Maintenance Process
Post-release maintenance will follow the same rigor as initial development. User feedback, system logs, and clinical surveillance will be monitored. All software updates, including bug fixes and minor features, require a documented assessment of their impact on risk and the necessity of re-testing.

## 5. Software Problem Resolution Process
Defects, anomalies, and user-reported issues will be tracked in the issue tracking system (e.g., Jira/GitHub Issues). Critical issues impacting patient safety will immediately trigger the Corrective and Preventive Action (CAPA) process defined in the overarching QMS. 

## 6. Configuration Management
- **Version Control:** All software code and configuration files are stored in a Git repository hosted on GitHub.
- **Branching Strategy:** Main branch is protected and represents production. Development occurs on feature branches merged via Pull Requests.
- **Versioning:** Semantic versioning (MAJOR.MINOR.PATCH) shall be used.
- **Environments:** Development, Staging, and Production environments are managed distinctly via Cloudflare `wrangler.toml` environment configurations.

## 7. Change Control for Software Modifications
Any change to the software post-release must be documented through a Change Request. The change must be evaluated for:
- Impact on intended use.
- Impact on existing risk controls.
- Need for regression testing.
- Updates to existing documentation (DHF).

## 8. SOUP (Software of Unknown Provenance) Management
The Naomi system relies on external software components that are not developed under our QMS. These are identified as SOUP and must be managed:
- **Cloudflare Workers Platform & Infrastructure:** Reliable serverless execution environment.
- **LLaMA 3.1 Model (via Cloudflare AI):** Core generation engine. System prompts and classifier layers act as risk controls against its non-deterministic outputs.
- **Third-Party NPM Packages:** Open-source libraries used in the TypeScript application.

**Management Strategy:** All SOUP items are documented in a SOUP inventory list. Updates to npm packages are monitored using dependency scanning tools (e.g., Dependabot). The LLaMA model version is explicitly pinned in the configuration to prevent unexpected behavioural changes from upstream model updates.

## 9. Terms and Definitions
*   **SOUP (Software of Unknown Provenance):** Software item that is already developed and generally available and that has not been developed for the purpose of being incorporated into the medical device, or software previously developed for which adequate records of development processes are not available.
*   **Software Safety Class:** Categorisation (Class A, B, or C) based on the severity of harm that could result from a software system failure.
*   **Software Unit:** Smallest entity of software that can be compiled and executed independently.
*   **Regression Testing:** Re-testing of unchanged software to verify that recent code changes have not adversely affected existing features.

## 10. Responsibilities
*   **Lead Developer:** Executes software development lifecycle activities, maintains SOUP registry, and manages GitHub CI/CD configurations.
*   **Clinical Safety Officer:** Assesses software classification and evaluates clinical risk implications of software changes.
*   **Quality Manager:** Audits lifecycle deliverables for IEC 62304 compliance and approves release gates.

## 11. Inputs and Outputs
*   **Inputs:** Design Inputs (QMS-7.3.3-01), Risk Management File (QMS-14971-02), IEC 62304 standards.
*   **Outputs:** Verified and validated software release builds, SOUP inventory, software problem reports, and configuration baselines.

## 12. Records Generated
*   SOUP Evaluation and Monitoring Records.
*   Software Problem and Bug Reports (GitHub Issues).
*   Software Release Notes and Configuration Baselines (QMS-7.3.1-01).

