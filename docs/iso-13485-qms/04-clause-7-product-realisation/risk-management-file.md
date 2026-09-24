# Risk Management File

| Document ID | Title | Version | Status | Effective Date | Author | Approved By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| QMS-14971-02 | Risk Management File | 0.1 | DRAFT | «[INSERT: TBD]» | «[INSERT: Name]» | «[INSERT: TBD]» |

## Revision History
| Version | Date | Description of Changes | Author |
| :--- | :--- | :--- | :--- |
| 0.1 | «[INSERT: Date]» | Initial Draft | «[INSERT: Name]» |

## 1. Purpose
This document serves as the Risk Management File (RMF) for the Naomi NHS Parenting Chatbot, in compliance with ISO 14971:2019 and ISO 13485:2016 (Clause 7.1). It contains the hazard log, risk analysis, risk evaluation, and the defined risk control measures.

## 2. Risk Management File Index
The complete RMF consists of:
1. Risk Management Plan (QMS-14971-01)
2. Risk Management File / Hazard Table (This Document, QMS-14971-02)
3. Overall Residual Risk Evaluation Report (To be created pre-release)
4. Post-Market Surveillance Plan (QMS-PMS-01)

## 3. Hazard Table
The following table identifies known and foreseeable hazards associated with the Naomi SaMD. Severity (S) and Probability (P) scales are defined in the Risk Management Plan (QMS-14971-01).

| ID | Hazard Description | Hazardous Situation | Harm | S | P | Initial Risk | Risk Controls | Res. S | Res. P | Res. Risk | Acceptable? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| HZ-01 | AI generates medically inaccurate advice. | Chatbot provides incorrect infant formula preparation guidance. | Infant malnutrition, gastrointestinal illness, dehydration. | 3 | 4 | High | **Ctrl-01:** System prompt explicitly grounds LLM to NHS guidelines only. <br> **Ctrl-02:** RAG pipeline retrieval verification. | 3 | 2 | Low | Yes |
| HZ-02 | Failure to escalate a safety-critical query. | Parent inputs symptoms of meningitis; AI provides general fever advice instead of urgent escalation. | Delayed critical medical intervention, potentially fatal consequences. | 5 | 3 | Unacceptable | **Ctrl-03:** Classifier module runs before LLM generation to detect critical keywords ("meningitis", "floppy", "unresponsive") and forces immediate 999/111 escalation response. | 5 | 1 | Medium | Yes (Benefit outweighs risk) |
| HZ-03 | AI diagnoses a medical condition. | User asks "does my baby have measles?", AI responds with a definitive diagnosis. | Incorrect diagnosis leading to inappropriate treatment or delayed care. | 3 | 4 | High | **Ctrl-04:** Safety rules injected into the prompt prohibiting diagnosis. Standard NHS disclaimer appended to all health-related queries. | 3 | 2 | Low | Yes |
| HZ-04 | AI prescribes medication dosage. | User asks for paracetamol dosage, AI calculates incorrectly. | Medication overdose or underdose, organ damage. | 4 | 3 | High | **Ctrl-05:** Explicit rule in system prompt to never provide medication dosages; system routes query to NHS standard dosage web link. | 4 | 1 | Low | Yes |
| HZ-05 | Prompt injection attack causes unsafe output. | Malicious user injects prompt forcing the AI to provide dangerous home remedies. | Potential injury due to application of dangerous remedies. | 3 | 3 | Medium | **Ctrl-06:** Input sanitisation and query filtering using a secondary safety-check LLM call before processing user prompt. | 3 | 1 | Acceptable | Yes |
| HZ-06 | System unavailable when parent needs urgent guidance. | Cloudflare infrastructure experiences downtime during a midnight medical query. | Panic, delayed triage or advice for a sick child. | 2 | 3 | Low | **Ctrl-07:** Distributed Cloudflare Workers architecture ensures high availability. Clear offline fallback UI instructing users to call 111 if urgent. | 2 | 1 | Acceptable | Yes |
| HZ-07 | Personal health data breach. | Chat transcripts containing sensitive child health data are exposed due to insecure storage. | Privacy violation, psychological distress, regulatory fines. | 2 | 3 | Low | **Ctrl-08:** Data minimisation policy; no PII requested. D1 database encrypted at rest. Auto-deletion of chat history after 30 days. | 2 | 1 | Acceptable | Yes |
| HZ-08 | AI provides advice appropriate for wrong age group. | Parent of a 4-year-old receives advice intended for a newborn. | Inappropriate feeding or developmental intervention, choking hazard. | 3 | 3 | Medium | **Ctrl-09:** UI mandates age selection at session start; context is injected into RAG pipeline to filter age-appropriate NHS guidance. | 3 | 1 | Low | Yes |
| HZ-09 | Retrieval fails silently. | RAG vector search returns no results, AI hallucinates a response instead of degrading gracefully. | Medically inaccurate or hallucinatory advice given. | 3 | 4 | High | **Ctrl-10:** System architecture requires vector match confidence > 0.8; if threshold not met, system returns standard "I am unable to advise on this, please contact NHS 111" fallback. | 3 | 1 | Low | Yes |
| HZ-10 | User misunderstands AI limitations. | User believes Naomi is a qualified doctor and delays seeking real medical care. | Exacerbation of medical conditions due to delayed care. | 3 | 3 | Medium | **Ctrl-11:** Prominent, unmissable UI banner stating "Naomi is an AI assistant, not a doctor. In emergencies, call 999." Must be acknowledged before use. | 3 | 1 | Low | Yes |

## 4. Overall Assessment of Residual Risk
(This section to be updated upon completion of system verification testing. Currently, all initial risks are mitigated to Acceptable, Low, or Medium levels. For HZ-02, the residual risk is Medium, but the benefit of immediate triage access is determined to outweigh the residual risk of failure.)

## 5. Scope and Applicability
This Risk Management File applies to all software modules, prompts, third-party APIs, and deployment configurations of the Naomi application throughout its lifecycle.

## 6. Terms and Definitions
*   **Risk Management File (RMF):** Set of records and other documents produced by risk management.
*   **Hazard Log:** Ongoing registry tracking all identified hazards, hazardous situations, and risk control measures.
*   **Safety Guardrail:** Hardcoded software logic preventing unsafe AI-generated outputs.

## 7. Responsibilities
*   **Clinical Safety Officer:** Evaluates clinical severity, clinical harms, and signs off on clinical risk acceptability per DCB0129.
*   **Lead Developer:** Implements risk control mitigations (Ctrl-01 through Ctrl-11) and provides verification test evidence (QMS-7.3.6-01).
*   **Quality Manager:** Audits the RMF for compliance with ISO 14971:2019 and ISO 13485:2016.

## 8. Inputs and Outputs
*   **Inputs:** Risk Management Plan (QMS-14971-01), product design outputs (QMS-7.3.4-01), clinical guidelines, post-market surveillance data (QMS-PMS-01).
*   **Outputs:** Complete Hazard Log, verified risk control measures, Benefit-Risk Analysis, Residual Risk Assessment.

## 9. Records Generated
*   Risk Management File and Hazard Log (QMS-14971-02).
*   Clinical Risk Management Report / Clinical Safety Case Report.

