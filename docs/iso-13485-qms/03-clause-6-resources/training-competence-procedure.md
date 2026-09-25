# Training and Competence Procedure

| Attribute | Details |
| :--- | :--- |
| **Document ID** | QMS-6.2-01 |
| **Title** | Training and Competence Procedure |
| **Version** | 0.1 |
| **Status** | DRAFT |
| **Effective Date** | «[INSERT: TBD]» |
| **Author** | «[INSERT: Name]» |
| **Approved By** | «[INSERT: TBD]» |


## Revision History

| Version | Date | Description of Changes | Author |
|---|---|---|---|
| 0.1 | «[INSERT: Date]» | Initial Draft | «[INSERT: Name]» |

---

## 1. Purpose
The purpose of this procedure is to define the process for identifying training needs, providing training, evaluating the effectiveness of training, and maintaining records of competence for all personnel whose work affects product quality, in accordance with ISO 13485 (Clause 6.2).

## 2. Scope
This procedure applies to all permanent employees, contractors, and consultants working at «[INSERT: Organisation Name]» who perform activities that influence the quality, safety, and regulatory compliance of the Naomi application.

## 3. Competence Requirements
In accordance with ISO 13485 (Clause 6.2(a)), «[INSERT: Organisation Name]» determines the necessary competence for personnel based on appropriate education, training, skills, and experience. Specific competence profiles are defined by role:
- **Software Developers**: Competence in IEC 62304, TypeScript, secure coding practices, Cloudflare architecture, and version control (GitHub).
- **Quality Assurance (QA) Personnel**: Knowledge of ISO 13485, ISO 14971 (risk management), IEC 62366-1, and software verification/validation principles.
- **Clinical Safety Officer (CSO)**: Active clinician registration, specific training in DCB0129 and DCB0160 clinical risk management standards, and understanding of NHS DTAC requirements.
- **Data Protection Officer (DPO)**: Expertise in UK GDPR, Data Protection Act 2018, and NHS data security standards.

## 4. Identification of Training Needs and Training Needs Analysis (TNA)
Training needs are identified (Clause 6.2(b)) through a formal **Training Needs Analysis (TNA)** process:
- A TNA is carried out against all primary job roles and profiles across the organisation.
- The TNA is reviewed and updated **at least annually**, or more frequently upon specific operational triggers.
- **Triggers to update the TNA include:**
  - Major changes in healthcare, medical device, or data protection legislation and guidance (e.g., UK MDR 2002 amendments, NHS DTAC revisions, DCB0129 updates, UK GDPR statutory guidance).
  - Identified competency gaps arising during internal or external audits (QMS-8.2.4-01).
  - Non-conformances or Corrective and Preventive Actions (CAPA per QMS-8.5-01 / QMS-8.3-01) where human factors, procedural error, or training deficits are identified as contributing root causes.
  - Deployment of major new technologies, architecture shifts, or safety guardrail revisions.
- Following any trigger or annual review, the TNA shall be formally amended and the **Training Compliance Matrix** updated accordingly to establish revised mandatory training baselines.

## 5. Training Delivery
«[INSERT: Organisation Name]» operates as a lean medical software organisation and is not structured or resourced to design and deliver proprietary internal training curricula. Therefore:
- The organisation aims to source training externally from accredited, industry-recognised training providers, professional bodies, and authoritative platforms.
- Sourced external programmes include accredited courses in UK Medical Device Regulation, NHS DTAC / DCB0129 clinical risk management, UK GDPR / Data Security and Protection Toolkit (DSPT), and cloud infrastructure security.
- Self-study modules covering internal QMS policies and procedures (reading and comprehension of controlled procedures) are tracked with documented acknowledgements.

## 6. Evaluation of Effectiveness
The effectiveness of the training provided (Clause 6.2(d)) must be verified:
- **Assessment of Effectiveness:** Effectiveness will be evaluated by confirming completion of the relevant training module through external training providers where formal assessment, quizzes, practical evaluations, or certifications are administered at the end of the module.
- For internal procedural reviews, comprehension checks and confirmation of adherence during operational delivery (e.g., code review, verification logs) serve as effectiveness evidence.
- **Clinical Safety & Hazard Escalation:** Any training-related issues, persistent procedural errors, or major non-compliances that could compromise product quality or patient safety shall be recorded in the **Hazard Log (QMS-14971-02)** and immediately flagged to the **Clinical Safety Officer (CSO)** for formal clinical risk evaluation and mitigation.

## 7. Quality Awareness
All personnel shall be made aware of the relevance and importance of their activities and how they contribute to achieving quality and clinical safety objectives (Clause 6.2(e)):
- Personnel are formally read-in to the QMS and must understand how their specific role and daily deliverables integrate into the wider Naomi programme and patient safety framework.
- **Current Organisational Context:** Currently, there are no employees, as the owner is operating as the sole developer. However, this procedure establishes the binding framework and the QMS and training matrix will be amended as the product scales and personnel or contractors are recruited.

## 8. Onboarding Process
New personnel joining the organisation must complete a structured onboarding programme within their first 30 days of appointment. The onboarding process explicitly covers:
- **QMS Induction:** Review of Quality Policy (QMS-5.3-01), Quality Objectives (QMS-5.4.1-01), Document Control (QMS-4.2.4-01), and CAPA/Non-conformance escalation pathways.
- **Mandatory Workspace Training:** Physical and remote workspace security, device management, and workstation hygiene.
- **Codebase and Product Engineering:** Architecture walk-through, secure coding guidelines, Cloudflare runtime constraints, and local development stack standards.
- **Data Protection and UK GDPR:** Safe handling of user interactions, NHS data confidentiality, session pseudonymisation, and reporting data breaches.
- **Security Training & Data Use:** Multi-factor authentication (2FA) enforcement, secret/key management protocols, prohibiting personal data ingestion in development environments, and adherence to cyber hygiene policies.

## 9. Records Management
Appropriate records of education, training, skills, and experience shall be maintained (Clause 6.2(f)):
- **Management of Records:** In the current lean structure and in lieu of a dedicated HR manager, the **Owner** directly manages and maintains all personnel training and competence documentation.
- **Records Utilised:** The **Training Compliance Matrix** and individual **Training Record Form (QMS-7-03)** are systematically utilised to record, track, and verify all completed training and certifications.
- All training records are retained in a secure, access-controlled repository in accordance with Record Control Procedure (QMS-4.2.5-01).

## 10. Terms and Definitions
*   **Competence:** Demonstrated ability to apply knowledge and skills to achieve intended results.
*   **Training Needs Analysis (TNA):** Systematic assessment identifying skill, clinical safety, or regulatory knowledge gaps relative to job role demands.
*   **Training Compliance Matrix:** A tracking register mapping personnel and roles against required training modules, renewal intervals, and completion status.
*   **Effectiveness Evaluation:** Formal appraisal confirming the trainee successfully passed end-of-module assessments and integrates acquired competencies.

## 11. Responsibilities
*   **Owner / Top Management:** In lieu of a dedicated HR manager, administers the training programme, maintains the Training Compliance Matrix, schedules TNA reviews, and verifies training records.
*   **Clinical Safety Officer (CSO):** Evaluates clinical safety competence requirements under DCB0129 and reviews any training non-compliances flagged in the Hazard Log.
*   **All Personnel / Contractors:** Complete assigned external training modules, pass requisite assessments, and submit completion certificates.

## 12. Inputs and Outputs
*   **Inputs:** Role profiles and job descriptions (QMS-5.5.1-01), legislative/regulatory amendments (UK MDR, NHS DTAC, DCB0129), audit findings and non-conformance reports (QMS-8.2.4-01 / QMS-8.3-01), CAPA training actions (QMS-8.5-01), user and clinical incident trends.
*   **Outputs:** Up-to-date Training Needs Analysis (TNA), active Training Compliance Matrix, competent workforce, verified Training Record Forms (QMS-7-03), and entries into Hazard Log (QMS-14971-02) where training-related risks are detected.

## 13. Records Generated
*   Training Needs Analysis (TNA) Document.
*   Organisational Training Compliance Matrix.
*   Completed Training Record Forms (QMS-7-03) and external certificates.
*   Hazard Log training entries (QMS-14971-02).

