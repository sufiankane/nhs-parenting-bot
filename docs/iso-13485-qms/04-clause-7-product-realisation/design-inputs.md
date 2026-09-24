# Design Inputs

| Document ID | Title | Version | Status | Effective Date | Author | Approved By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| QMS-7.3.3-01 | Design Inputs | 0.1 | DRAFT | «[INSERT: TBD]» | «[INSERT: Name]» | «[INSERT: TBD]» |

## Revision History

| Version | Date | Author | Description of Change |
| :--- | :--- | :--- | :--- |
| 0.1 | «[INSERT: Date]» | «[INSERT: Name]» | Initial draft creation. |

## 1. Purpose
This document defines the design inputs for the Naomi AI-powered chatbot, in accordance with ISO 13485:2016 (clause 7.3.3). These inputs form the basis for the design and development of the Software as a Medical Device (SaMD) and are derived from user needs, intended use, and regulatory requirements.

## 2. User Needs
The intended users are parents and carers of children aged 0–5 in the United Kingdom.
*   **UN-01:** Users need rapid, trustworthy, NHS-grounded advice for common childhood ailments and parenting queries.
*   **UN-02:** Users need clear instructions on when to seek urgent medical attention (escalation).
*   **UN-03:** Users, who may be anxious or highly distressed, need a calm, empathetic, and easily understandable conversational interface.
*   **UN-04:** Users need the service to be accessible on mobile devices without complex registration.
*   **UN-05:** Digitally non-expert users need an intuitive system that correctly interprets natural language questions.

## 3. Functional Requirements
*   **FR-01 (Chatbot Q&A):** The system shall process natural language queries and generate responses based on a Retrieval-Augmented Generation (RAG) pipeline.
*   **FR-02 (Triage Classification):** The system shall classify incoming queries by severity and topic before generation.
*   **FR-03 (Escalation):** The system shall immediately escalate critical or out-of-scope queries by directing the user to NHS 111, 999, or a GP, bypassing the standard generation pipeline.
*   **FR-04 (RAG Retrieval):** The system shall retrieve relevant context strictly from an ingested database of NHS-approved content via a Vectorize database.
*   **FR-05 (Session History):** The system shall maintain conversational context during a single session using Cloudflare KV.
*   **FR-06 (Audit Logging):** The system shall securely log all interactions, triage decisions, and system errors in a D1 SQLite database for clinical audit purposes.
*   **FR-07 (Rate Limiting):** The system shall implement rate limiting per IP/session to prevent abuse and manage API costs.

## 4. Safety Requirements
Derived from initial ISO 14971 risk assessments and clinical safety constraints:
*   **SR-01 (No Diagnosis):** The system shall categorically state it is not a doctor and shall never offer a definitive medical diagnosis.
*   **SR-02 (No Prescribing):** The system shall never recommend specific dosages or prescribe medication.
*   **SR-03 (Escalation Override Protection):** The escalation module's decision to route to emergency services shall not be overrideable by the LLM generation module.
*   **SR-04 (Prompt Injection Protection):** The system shall employ input validation and sanitisation to reject adversarial prompt injection attempts.
*   **SR-05 (Source Restriction):** The system shall only generate medical advice based on retrieved NHS-sourced content; external internet hallucination must be structurally prevented by the system prompt.

## 5. Performance Requirements
*   **PR-01 (Latency):** The system shall provide a first-token response to the user within 3 seconds for 95% of queries.
*   **PR-02 (Availability):** The system shall maintain an uptime of >99.5% excluding scheduled maintenance.
*   **PR-03 (Scalability):** The system shall successfully handle up to 100 concurrent chat sessions without degradation of latency.

## 6. Usability Requirements
In alignment with IEC 62366-1:
*   **UR-01:** The conversational UI shall be simple, requiring no complex navigation.
*   **UR-02:** The system shall be mobile-first, rendering correctly on standard iOS and Android screen sizes.
*   **UR-03:** The language generated shall target a reading age of 9-11 years to ensure comprehension by the majority of the UK population.

## 7. Regulatory and Standards Requirements
*   **REG-01:** UK Medical Device Regulations 2002 (UK MDR 2002) - compliance for UKCA marking (Class I SaMD).
*   **REG-02:** NHS Digital Technology Assessment Criteria (DTAC) - modules D1 (Data Protection), C1 (Clinical Safety), C2 (Technical Security), C3 (Interoperability).
*   **REG-03:** DCB0129 Clinical Risk Management: its Application in the Manufacture of Health IT Systems.
*   **REG-04:** UK General Data Protection Regulation (UK GDPR).

## 8. Review of Design Inputs
These design inputs have been reviewed for adequacy, completeness, and lack of ambiguity. Conflicting requirements have been resolved by prioritising clinical safety requirements (SR) above all other functional or performance requirements. The formal review is recorded in the corresponding Design Review Record (QMS-7.3.5-01).

## 9. Scope and Applicability
This specification governs all functional, clinical, performance, and regulatory requirements applied to the Naomi application codebase and cloud deployment.

## 10. Terms and Definitions
*   **Design Input:** The physical and performance characteristics of a device that are used as a basis for device design.
*   **User Need:** High-level requirement expressing what the intended user expects the system to accomplish in its operational environment.
*   **RAG (Retrieval-Augmented Generation):** An AI framework combining external knowledge retrieval with large language model response synthesis.

## 11. Responsibilities
*   **Product Owner:** Captures and defines User Needs and functional user stories.
*   **Clinical Safety Officer:** Formulates and approves Clinical Safety Requirements (SR-01 to SR-05) per DCB0129 and ISO 14971.
*   **Lead Developer:** Evaluates technical feasibility and translates inputs into architecture specifications (QMS-7.3.4-01).
*   **Quality Manager:** Ensures full traceability between design inputs, risk controls, and verification protocols.

## 12. Inputs and Outputs
*   **Inputs:** Intended use statement (QMS-4.2.3-01), Design and Development Plan (QMS-7.3.1-01), Risk Management File (QMS-14971-02), NHS DTAC standards.
*   **Outputs:** Baseline Design Inputs specification, traceability matrix to Design Outputs (QMS-7.3.4-01) and Verification Plans (QMS-7.3.6-01).

## 13. Records Generated
*   Approved Design Inputs Specification (QMS-7.3.3-01).
*   Design Requirements Review Minutes (QMS-7.3.5-01).

