# Design Validation Plan

| Document ID | Title | Version | Status | Effective Date | Author | Approved By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| QMS-7.3.7-01 | Design Validation Plan | 0.1 | DRAFT | «[INSERT: TBD]» | «[INSERT: Name]» | «[INSERT: TBD]» |

## Revision History

| Version | Date | Author | Description of Change |
| :--- | :--- | :--- | :--- |
| 0.1 | «[INSERT: Date]» | «[INSERT: Name]» | Initial draft creation. |

## 1. Purpose
This document establishes the Design Validation Plan for the Naomi AI-powered chatbot, in accordance with ISO 13485:2016 (clause 7.3.7). The purpose of design validation is to provide objective evidence that the software meets the user needs and its intended use under simulated or actual conditions of use.

## 2. Validation Approach
Validation differs from verification; while verification asks "did we build the system right?", validation asks "did we build the right system?". The approach encompasses:
*   **Clinical Safety Review:** Formal clinical evaluation and hazard logging overseen by a Clinical Safety Officer (CSO) per DCB0129.
*   **Scenario-Based Testing (Simulated Use):** Execution of the `test-scenarios-runner.ts` using realistic, complex parent queries to evaluate the clinical appropriateness of responses.
*   **Red-Team Adversarial Testing:** Utilisation of the existing red-team test suite to simulate malicious users attempting to break safety guardrails.
*   **User Acceptance Testing (UAT):** Interaction with the application by representative intended users in a staging environment.

## 3. Validation Population
The intended user group for Naomi is broad. The UAT population must be representative of this demographic, explicitly including:
*   Parents/carers of children aged 0-5 in the UK.
*   A mixture of first-time parents and experienced parents.
*   Users from diverse socioeconomic backgrounds.
*   Non-native English speakers to assess comprehension of the conversational UI.
*   Digitally non-expert users.

## 4. Acceptance Criteria
Design validation is considered successful when the following criteria are met:
*   **Safety Constraints:** Zero safety rule violations (diagnosis, prescribing) occur during the execution of the entire scenario-based test suite and UAT.
*   **Escalation Efficacy:** Escalation pathways (NHS 111/999) are triggered correctly and clearly for all predefined clinical safety scenarios.
*   **Clinical Endorsement:** The Clinical Safety Case Report is signed off by the CSO, confirming residual clinical risks are acceptable.
*   **User Satisfaction:** UAT feedback indicates that the system is intuitive, the language is understandable, and users feel the advice provided is helpful and trustworthy.

## 5. Clinical Validation vs. Usability Validation
*   **Clinical Validation** focuses on the medical safety, accuracy, and appropriateness of the LLM-generated content and the RAG retrieval relevance. This is heavily reliant on the scenario runner and CSO review.
*   **Usability Validation** (aligning with IEC 62366-1) focuses on the user interface, interaction design, and cognitive load. This ensures the intended users, particularly those who are anxious, can effectively navigate the chatbot and comprehend the guidance without user error.

## 6. Records
The following documents will be generated as records of design validation per QMS-4.2.5-01:
*   Design Validation Report (summarising UAT and scenario testing).
*   Red-Team Test Results Report.
*   Clinical Safety Case Report and Hazard Log (DCB0129 deliverables per QMS-14971-02 and QMS-REG-02).
*   Signed Stage Gate Review (Validation Review per QMS-7.3.5-01).

## 7. Scope and Applicability
This plan governs simulated-use clinical scenarios, user acceptance testing (UAT), red-team testing, and clinical safety reviews of the Naomi SaMD prior to commercial release.

## 8. Terms and Definitions
*   **Validation:** Confirmation, through the provision of objective evidence, that the requirements for a specific intended use or application have been fulfilled.
*   **User Acceptance Testing (UAT):** Formal testing by representative end-users to evaluate system usability and fitness for purpose.
*   **Clinical Safety Case Report (CSCR):** Comprehensive report presenting the clinical safety justification for deployment under DCB0129.

## 9. Responsibilities
*   **Clinical Safety Officer:** Leads clinical validation, executes scenario reviews, and authors the CSCR.
*   **Product Owner:** Recruits representative user cohorts and coordinates UAT testing sessions.
*   **Quality Manager:** Audits validation evidence against User Needs (QMS-7.3.3-01) and ISO 13485 (Clause 7.3.7).
*   **Lead Developer:** Provisions staging environments and configures scenario runner automation.

## 10. Inputs and Outputs
*   **Inputs:** User Needs (QMS-7.3.3-01), verified software build (QMS-7.3.6-01), Hazard Log (QMS-14971-02), NHS DTAC requirements (QMS-REG-02).
*   **Outputs:** Executed Design Validation Report, Clinical Safety Case Report, signed release authorization.

