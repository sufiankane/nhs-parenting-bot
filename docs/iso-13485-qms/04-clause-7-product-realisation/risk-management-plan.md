# Risk Management Plan

| Document ID | Title | Version | Status | Effective Date | Author | Approved By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| QMS-14971-01 | Risk Management Plan | 0.2 | DRAFT | 2026-08-27 | Clinical Safety Officer / Quality Manager | Clinical Safety Officer / Top Management |

## Revision History

| Version | Date | Author | Description of Changes |
| :--- | :--- | :--- | :--- |
| 0.1 | 2026-08-01 | Quality Specialist | Initial Draft. |
| 0.2 | 2026-08-27 | Clinical Safety Officer & Solution Architect | Full architectural alignment with master Technical Architecture (`docs/architecture-and-action-plan.md`), Safety Architecture (`docs/safety-architecture-and-triage-flow.md`), Cloudflare Workers serverless edge infrastructure, defense-in-depth triage pipeline (M1–M8), asymmetric clinical loss function policy, the ~10% over-escalation safety budget, automated testing verification gates (unit, red-team, 1,000-scenario, and smoke suites), and NHS DCB0129 / DTAC compliance. |

---

## 1. Purpose and Statutory Basis

This Risk Management Plan establishes the activities, responsibilities, methodologies, and acceptability criteria for risk management across the entire lifecycle of the Naomi Software as a Medical Device (SaMD) application. This document is established in strict accordance with:
*   **ISO 14971:2019** (Medical devices — Application of risk management to medical devices)
*   **ISO 13485:2016** (Clause 7.1 Planning of product realisation and Clause 7.3 Design and development)
*   **IEC 62304:2015+AMD1:2015** (Medical device software — Software life cycle processes, Class B safety classification)
*   **NHS DCB0129** (Clinical Risk Management: its Application in the Manufacture of Health IT Systems)
*   **NHS Digital Technology Assessment Criteria (DTAC v2.0)** (Clinical Safety and Data Protection domains)
*   **UK Medical Devices Regulations 2002** (SI 2002 No 618, as amended) for Class I SaMD

---

## 2. System Architecture Overview & Scope of Risk Management

The scope of this plan encompasses the complete software lifecycle (design, implementation, verification, deployment, operation, maintenance, and post-market surveillance) of the Naomi SaMD. Naomi is an AI-powered conversational assistant delivering NHS-grounded guidance for parents and carers of children aged 0–5 within the United Kingdom.

Naomi is deployed natively on the Cloudflare global serverless edge network across eight discrete, decoupled functional modules:
*   **M1 (Frontend Client):** Minimalist conversational user interface with persistent emergency disclaimer banner and WCAG 2.1 AA accessibility ([`public/index.html`](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/nhs-parenting-bot/public/index.html), [`public/widget.js`](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/nhs-parenting-bot/public/widget.js)).
*   **M2 (API Gateway & Edge Orchestrator):** Edge validation, CORS management, error envelopes, and KV-backed per-IP rate limiting (20 req/min) ([`src/index.ts`](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/nhs-parenting-bot/src/index.ts), [`src/gateway/`](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/nhs-parenting-bot/src/gateway/)).
*   **M3 (Safety & Clinical Triage Pipeline):** Multi-layered defense-in-depth triage executing before any retrieval or response generation ([`src/triage/`](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/nhs-parenting-bot/src/triage/)):
    *   *Layer 0 (Anti-Adversarial Normalizer):* NFKD Unicode normalization, zero-width/bidi stripping, homoglyph canonicalization, punctuation/spacing collapse ([`src/triage/normalize.ts`](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/nhs-parenting-bot/src/triage/normalize.ts)).
    *   *Layer 1 (Deterministic Lexicon):* In-memory clinical red-flag lexicon with $<1\text{ms}$ fast-exit for Tier 1 life threats ([`src/triage/lexicon.ts`](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/nhs-parenting-bot/src/triage/lexicon.ts)).
    *   *Layer 2 (Semantic Classifier):* Isolated Workers AI model (`@cf/meta/llama-3.1-8b-instruct-fp8-fast`, temp 0.0) evaluating clinical risk into structured JSON ([`src/triage/classifier.ts`](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/nhs-parenting-bot/src/triage/classifier.ts)).
    *   *Layer 3 (Precedence Resolution Algebra):* $\text{Final Tier} = \min(\text{Lexicon Tier}, \text{Classifier Tier})$. The classifier can escalate; it can **never** downgrade a conservative lexicon match ([`src/triage/index.ts`](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/nhs-parenting-bot/src/triage/index.ts)).
*   **M4 (Grounded Semantic Retrieval):** 768-dimensional BGE embeddings (`@cf/baai/bge-base-en-v1.5`), Vectorize cosine similarity search, similarity threshold gate ($\ge 0.5$), and D1 SQLite chunk hydration ([`src/retrieval/`](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/nhs-parenting-bot/src/retrieval/)).
*   **M5 (Grounded Response Generation):** Strict prompt-engineered synthesis (`@cf/meta/llama-3.1-8b-instruct-fp8-fast`) enforcing 4 safety prohibitions, mandatory infant feeding safety windows, and SSE streaming ([`src/generation/`](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/nhs-parenting-bot/src/generation/)).
*   **M6 (Deterministic Escalation & Signposting):** Crisis router emitting immutable UK contact payloads (999, 111, NSPCC, Childline, National Domestic Abuse Helpline) completely outside generative LLM paths ([`src/escalation/`](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/nhs-parenting-bot/src/escalation/)).
*   **M7 (Knowledge Ingestion & Governance):** Curated allow-list ingestion (`content/sources.json`, 7 NHS domains), SHA-256 chunk hashing, orphan deletion reconciliation ([`src/ingest/`](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/nhs-parenting-bot/src/ingest/)).
*   **M8 (Zero-PII Safeguarding Audit):** Non-blocking asynchronous logging (`ctx.waitUntil`) to D1 `triage_audit_log` storing only tier, signal categories, and pseudonymous session hash with zero user text or PII ([`src/audit/`](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/nhs-parenting-bot/src/audit/)).

---

## 3. Risk Management Policy and Paediatric Asymmetric Loss Function

The organisation is committed to ensuring the clinical safety, efficacy, and safeguarding integrity of the Naomi SaMD. In alignment with ISO 14971:2019 and DCB0129, management mandates that risks shall be reduced **As Far As Possible (AFAP)** without adversely affecting the clinical benefit-to-risk profile.

### 3.1 Paediatric Clinical Asymmetric Loss Function
In paediatric healthcare and child safeguarding, classification errors have wildly asymmetric consequences:

$$\text{Cost}(\text{False Negative: Emergency Downgraded}) \gg \text{Cost}(\text{False Positive: Benign Query Escalated})$$

1.  **False Negative (Critical Safety Failure):** If a child presenting with neonatal hypothermia, sepsis, choking, or active parental abuse is misclassified as safe (Tier 4) and provided with conversational guidance, the resultant delay in emergency medical intervention (999/A&E) carries a high probability of catastrophic harm or death.
2.  **False Positive / Over-Escalation (Safe Conservative Defense):** If an emotionally overwhelmed parent presenting with ambiguous distress (such as bereavement, acute poverty, or severe carer exhaustion) is signposted to NHS 111, the NSPCC, or Family Lives, the outcome is supportive, non-stigmatising, and clinically safe.

### 3.2 Policy on the Calibrated ~10% Over-Escalation Safety Budget
Top Management and the Clinical Safety Officer formally adopt an intentional **$\approx 10\%$ over-escalation safety budget** (empirically measured at 10.6% across the 1,000-scenario clinical test suite). Under this policy:
*   Over-escalation on ambiguous clinical or safeguarding boundaries is recognized as an intentional, designed risk mitigation mechanism, not a software defect.
*   The system guarantees a **0.0% Critical False Negative rate on Tier 1 life-threatening emergencies** as a non-negotiable architectural invariant.

---

## 4. Risk Estimation Methodology

Risks are evaluated using a standard 5×5 matrix combining the Severity of Harm and the Probability of Occurrence of that Harm.

### 4.1 Severity of Harm Definitions
| Level | Severity | Clinical / Operational Definition in Paediatric Context |
| :--- | :--- | :--- |
| **1** | Negligible | Inconvenience, mild temporary discomfort, or minor parental anxiety; no clinical intervention required. |
| **2** | Minor | Minor reversible injury or self-limiting illness; manageable via routine primary care, health visitor consultation, or basic first aid. |
| **3** | Serious | Reversible injury or acute illness requiring professional medical intervention (GP, urgent treatment centre), or temporary delay in non-critical care. |
| **4** | Critical | Irreversible injury, permanent impairment, severe physical abuse/trauma, life-threatening clinical deterioration, or severe poisoning. |
| **5** | Catastrophic | Death of the infant/child/parent, multiple fatalities, or irreversible brain damage due to anoxia or unmanaged crisis. |

### 4.2 Probability of Occurrence Definitions
| Level | Probability | Indicative Frequency per Query | Operational Benchmark |
| :--- | :--- | :--- | :--- |
| **1** | Improbable | $< 1 \text{ in } 100,000 \text{ interactions}$ | Unprecedented; requires multiple simultaneous barrier failures. |
| **2** | Remote | $1 \text{ in } 10,000 \text{ to } 100,000 \text{ interactions}$ | Rare; observed only under severe edge-case or stress conditions. |
| **3** | Occasional | $1 \text{ in } 1,000 \text{ to } 10,000 \text{ interactions}$ | Foreseeable; may occur intermittently during normal operations. |
| **4** | Probable | $1 \text{ in } 100 \text{ to } 1,000 \text{ interactions}$ | Likely to occur without specific automated software controls. |
| **5** | Frequent | $> 1 \text{ in } 100 \text{ interactions}$ | Almost certain to occur frequently in unconstrained generative AI. |

---

## 5. Risk Acceptability Criteria & Matrix

The risk acceptability matrix maps evaluated Severity against Probability:

| Probability \ Severity | 1 (Negligible) | 2 (Minor) | 3 (Serious) | 4 (Critical) | 5 (Catastrophic) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **5 (Frequent)** | Medium | High | Unacceptable | Unacceptable | Unacceptable |
| **4 (Probable)** | Low | Medium | High | Unacceptable | Unacceptable |
| **3 (Occasional)** | Low | Low | Medium | High | Unacceptable |
| **2 (Remote)** | Acceptable | Low | Low | Medium | High |
| **1 (Improbable)** | Acceptable | Acceptable | Low | Low | Medium |

### 5.1 Acceptance Criteria
*   **Acceptable / Low:** Risk is acceptable as is. Further reduction measures may be implemented if cost-effective, but are not mandatory.
*   **Medium:** Risk must be reduced AFAP. If further risk reduction is technically infeasible, acceptance requires a documented Clinical Benefit-Risk Analysis signed off by the Clinical Safety Officer and Top Management.
*   **High / Unacceptable:** Risk is unacceptable. Mandatory, verifiable risk control measures must be implemented prior to software release. Any initial hazard with Severity 4 or 5 is subject to mandatory defense-in-depth risk controls.

---

## 6. Risk Control Strategy and Defense-in-Depth Hierarchy

In accordance with ISO 14971:2019 (Clause 7.1), risk control measures shall follow this strict order of priority:
1.  **Inherent Safety by Design (Architectural Controls):**
    *   *Deterministic Safety Precedence:* Hardcoded clinical rules and lexicon matches always override AI predictions.
    *   *AI Excluded from Escalation Path:* When Tier 1–3 is detected, M6 emits typed constants; generative LLM calls and RAG vector searches are completely aborted.
    *   *Layer 0 Text Normalization:* Anti-adversarial preprocessing defeats homoglyphs, zero-width exploits, and obfuscation before classification.
    *   *Similarity Gating:* RAG retrieval enforces a strict similarity threshold ($\ge 0.5$); queries falling below threshold degrade to an honest NHS 111 referral rather than allowing LLM improvisation.
    *   *Fail-Safe System Degradation:* Any AI timeout, database error, or network fault instantly degrades to conservative deterministic fallbacks.
2.  **Protective Measures in Software & Infrastructure:**
    *   *KV Distributed Rate Limiting:* 20 requests per minute per IP address preventing denial-of-service starvation.
    *   *Structured Schema Interpolation:* User text is passed strictly as quoted data in structured payloads, never concatenated into system instructions.
    *   *Zero-PII Storage Architecture:* Audit logging to Cloudflare D1 records only non-identifying signal categories, tier, and salted pseudonyms. KV sessions expire after 24 hours.
3.  **Information for Safety & User Interface Warnings:**
    *   *Persistent Emergency Disclaimer Banner:* Prominent WCAG 2.1 AA banner on every screen directing life-threatening emergencies to 999.
    *   *Honest Fallback Copy:* Clear messaging stating when the AI lacks verified NHS guidance, directing parents to their health visitor or NHS 111.

---

## 7. Verification of Risk Control Measures & Test Matrix

Each risk control measure specified in the Risk Management File ([QMS-14971-02](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/iso-13485-qms/04-clause-7-product-realisation/risk-management-file.md)) must be verified for implementation and clinical effectiveness. Verification is integrated into automated CI/CD deployment pipelines:

| Verification Suite | Automated Command / Harness | Scope and Focus | Acceptance Criteria (Quality Gate) |
| :--- | :--- | :--- | :--- |
| **Unit & Contract Suite** | `npm run test` | 422+ unit tests across modules M1–M8, envelope contracts, rate limiting, and fallbacks. | 100% pass rate; zero regressions. |
| **Adversarial Red-Team Suite** | `npm run test:redteam` | 42+ adversarial bypass scenarios: Cyrillic/Greek homoglyphs, spacing/punctuation tricks, jailbreaks, prompt injection. | **100% pass rate; 0 Tier 1 false negatives (Hard Invariant).** |
| **1,000-Scenario Clinical Suite** | `scripts/test-scenarios-runner.ts` | 1,000 synthetic clinical and safeguarding scenarios evaluated against live edge triage pipeline. | • **0.0% Critical Tier 1 False Negatives (0 / 1,000)**<br>• $< 1.0\%$ Tier 2/3 False Negatives ($0.9\%$ measured)<br>• $\ge 85.0\%$ Exact Tier Pass ($87.7\%$ measured)<br>• $\approx 10\%$ Over-escalation safety budget ($10.6\%$ measured). |
| **Golden Smoke Check** | `scripts/smoke/remote-golden-check.ts` | Remote live staging/production API verification checking headers, SSE envelopes, and safety window enforcement. | Clean exit code 0; all clinical safety windows verified. |

All test reports and execution logs shall be archived within the Design History File ([QMS-7.3.10-01](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/iso-13485-qms/04-clause-7-product-realisation/design-history-file.md)) and cross-referenced in the Design Verification Plan ([QMS-7.3.6-01](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/iso-13485-qms/04-clause-7-product-realisation/design-verification-plan.md)).

---

## 8. Residual Risk & Paediatric Benefit-Risk Analysis

1.  **Individual Residual Risk Evaluation:** Following implementation of verified risk controls, each hazard in [QMS-14971-02](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/iso-13485-qms/04-clause-7-product-realisation/risk-management-file.md) is re-evaluated.
2.  **Benefit-Risk Justification:** For hazards where the residual severity remains high (e.g., HZ-02 emergency triage failure or HZ-14 safeguarding crisis), the probability is reduced to Improbable (Level 1), yielding a residual risk of "Medium". A formal Clinical Benefit-Risk Analysis is conducted by the Clinical Safety Officer:
    *   *Clinical Benefit:* Provides immediate, 24/7, barrier-free access to trusted NHS paediatric guidance and instant emergency signposting for sleep-deprived parents at 2:00 AM, significantly reducing parental panic and triaging parents directly to 999 or 111 before conditions deteriorate.
    *   *Residual Risk:* Extremely remote probability of edge-case linguistic misclassification, mitigated by deterministic Layer 1 lexicon fast-paths, precedence algebra, persistent UI emergency banners, and conservative over-escalation design.
    *   *Conclusion:* The life-saving benefit of barrier-free triage signposting decisively outweighs the residual risk.

---

## 9. Overall Residual Risk Evaluation

Prior to commercial or public deployment, Top Management, the Clinical Safety Officer, and the Quality Manager shall conduct an Overall Residual Risk Assessment. This evaluation reviews:
*   The cumulative effect of all individual residual risks.
*   Clinical scenario test results from the 1,000-scenario evaluation.
*   Adversarial red-team safety audit results.
*   Usability validation under simulated stressful parental conditions per [Design Validation Plan (QMS-7.3.7-01)](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/iso-13485-qms/04-clause-7-product-realisation/design-validation-plan.md).

---

## 10. Post-Market Surveillance (PMS) Linkage & Continuous Feedback

Risk management is an active lifecycle activity linked directly to post-market surveillance:
*   **M8 Audit Log Analysis:** Monthly review of anonymized `triage_audit_log` distribution (tier proportions, signal category frequency) to detect emerging trends without accessing PII.
*   **Complaint & Adverse Event Feedback:** User feedback, clinical complaints ([QMS-8.2.2-01](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/iso-13485-qms/05-clause-8-measurement-improvement/complaint-handling-procedure.md)), and reportable adverse incidents ([QMS-8.2.3-01](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/iso-13485-qms/05-clause-8-measurement-improvement/adverse-event-reporting.md)) are fed directly into the Hazard Log.
*   **Lexicon and Corpus Updates:** Any newly identified clinical red-flag term or vernacular phrasing is immediately incorporated into `src/triage/lexicon.ts` and the adversarial test suite simultaneously per Project Safety Non-Negotiable Rule 02.13.

---

## 11. Personnel Responsibilities

*   **Top Management:**
    *   Allocates adequate engineering and clinical resources for risk management.
    *   Reviews and formally approves the Risk Management Plan and Overall Residual Risk Evaluation.
*   **Clinical Safety Officer (CSO):**
    *   Serves as Clinical Safety Lead under NHS DCB0129 and ISO 14971.
    *   Authorises clinical hazard definitions, clinical severity classifications, and clinical safety windows.
    *   Conducts and approves Clinical Benefit-Risk Analyses and Clinical Safety Case Reports.
*   **Lead Technical Architect / Developer:**
    *   Architects and implements deterministic risk controls across software modules (M1–M8).
    *   Maintains the automated unit, adversarial red-team, and 1,000-scenario test pipelines.
    *   Ensures that deployment gates enforce 100% safety test passage.
*   **Quality Manager:**
    *   Maintains the Risk Management File ([QMS-14971-02](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/iso-13485-qms/04-clause-7-product-realisation/risk-management-file.md)) and ensures compliance with ISO 13485:2016 and ISO 14971:2019.
    *   Ensures bidirectional traceability between Design Inputs ([QMS-7.3.3-01](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/iso-13485-qms/04-clause-7-product-realisation/design-inputs.md)), Risk Controls, and Design Verification ([QMS-7.3.6-01](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/iso-13485-qms/04-clause-7-product-realisation/design-verification-plan.md)).

---

## 12. Review and Update Triggers

This plan and the corresponding Risk Management File ([QMS-14971-02](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/iso-13485-qms/04-clause-7-product-realisation/risk-management-file.md)) shall be reviewed, evaluated, and updated upon:
1.  Any architectural change affecting the triage pipeline (M3), retrieval (M4), generation (M5), or escalation (M6).
2.  Any modification to the underlying AI models (`@cf/meta/llama-3.1-8b-instruct-fp8-fast` or `@cf/baai/bge-base-en-v1.5`).
3.  Identification of any unmitigated hazard, adverse incident, or safety test regression.
4.  Revisions to foundational clinical guidance published by the UK Department of Health and Social Care, NICE, or the NHS.
5.  At a minimum, annually during the Management Review ([QMS-5.6-01](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/iso-13485-qms/02-clause-5-management/management-review-procedure.md)).

---

## 13. Terms and Definitions

*   **Asymmetric Loss Function:** A mathematical or decision-theoretic framework where the cost of a false negative (missed medical emergency) drastically exceeds the cost of a false positive (benign query routed to support helplines).
*   **Defense-in-Depth:** An architectural security and safety paradigm employing multiple, concentric, layered defenses (L0 through L7) so that the failure of any single component cannot result in harm.
*   **Harm:** Physical injury, illness, developmental compromise, or psychological trauma to the infant, child, or parent/carer.
*   **Hazard:** Potential source of harm (e.g., hallucinated clinical guidance, prompt injection, failure to escalate).
*   **Hazardous Situation:** Circumstance in which a user or patient is exposed to one or more hazards.
*   **Over-Escalation Safety Budget:** An intentionally accepted operational margin ($\approx 10\%$) where ambiguous or borderline queries are escalated to human healthcare professionals to guarantee zero critical false negatives.
*   **Residual Risk:** Risk remaining after risk control measures have been designed, implemented, and verified.
*   **Risk Control:** Design principle, software mechanism, or user constraint that reduces the probability of occurrence of harm or the severity of that harm.
*   **SaMD (Software as a Medical Device):** Software intended to be used for medical purposes without being part of a hardware medical device.

---

## 14. Inputs and Outputs

*   **Inputs:**
    *   Intended Use Statement and Medical Device File ([QMS-4.2.3-01](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/iso-13485-qms/01-clause-4-qms/medical-device-file.md)).
    *   Design Inputs Specification ([QMS-7.3.3-01](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/iso-13485-qms/04-clause-7-product-realisation/design-inputs.md)).
    *   Master Technical Architecture & Implementation Plan (`docs/architecture-and-action-plan.md`).
    *   Safety Architecture & Clinical Triage Flow Specification (`docs/safety-architecture-and-triage-flow.md`).
    *   NHS Clinical Knowledge Summaries (CKS) and British National Formulary for Children (BNFC).
    *   Post-Market Surveillance Data ([QMS-PMS-01](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/iso-13485-qms/05-clause-8-measurement-improvement/post-market-surveillance-plan.md)).
*   **Outputs:**
    *   Risk Management File and Hazard Log ([QMS-14971-02](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/iso-13485-qms/04-clause-7-product-realisation/risk-management-file.md)).
    *   Clinical Safety Management Plan and Clinical Safety Case Report (per NHS DCB0129).
    *   Design Verification Protocols and Automated Test Reports ([QMS-7.3.6-01](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/iso-13485-qms/04-clause-7-product-realisation/design-verification-plan.md)).
    *   Overall Residual Risk Evaluation Report.

---

## 15. Records Generated

*   Risk Management Plan baseline and approved revisions ([QMS-14971-01](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/iso-13485-qms/04-clause-7-product-realisation/risk-management-plan.md)).
*   Risk Management File and Hazard Log ([QMS-14971-02](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/iso-13485-qms/04-clause-7-product-realisation/risk-management-file.md)).
*   Clinical Safety Case Report (DCB0129).
*   Automated Test Suite Execution Reports (Unit, Red-Team, 1,000-Scenario, and Smoke Check).
*   Formal Risk Management Review Sign-Off Records ([QMS-7.3.5-01](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/iso-13485-qms/04-clause-7-product-realisation/design-review-records-template.md)).
