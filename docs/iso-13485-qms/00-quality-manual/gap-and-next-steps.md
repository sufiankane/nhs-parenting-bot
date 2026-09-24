# QMS Implementation Gap Analysis and Next Steps

## Document Control

| Attribute | Detail |
| :--- | :--- |
| **Document ID** | QMS-GAP-01 |
| **Title** | QMS Implementation Gap Analysis and Next Steps |
| **Version** | 0.1 |
| **Status** | DRAFT |
| **Effective Date** | «[INSERT: TBD]» |
| **Author** | «[INSERT: Name]» |
| **Approved By** | «[INSERT: TBD]» |

### Revision History

| Version | Date | Author | Description of Changes |
| :--- | :--- | :--- | :--- |
| 0.1 | «[INSERT: Date]» | «[INSERT: Name]» | Initial Draft |

---

> **DISCLAIMER:** The documentation provided in this repository constitutes a *template set* and foundational draft for an ISO 13485:2016 compliant Quality Management System. **It is NOT certified documentation.** A human must review, adapt, approve, and operationalise these procedures before they can be used for regulatory compliance, CE/UKCA marking, or NHS DTAC submission.

## 1. Introduction

This document outlines the essential steps required by «[INSERT: Organisation Name]» to transition the drafted QMS documentation for the Naomi application from a draft state to a fully operational, compliant, and audit-ready system. 

## 2. Action Checklist for Audit Readiness

The following actions must be completed by the organisation:

- [ ] **Document Review and Finalisation:** 
  - Review all drafted QMS documents.
  - Replace all `«[INSERT: ...]»` placeholders with factual, organisation-specific information.
  - Formally approve and sign off all documents according to the Document Control Procedure (QMS-4.2.4-01).
- [ ] **Legal and Regulatory Review:** Engage external legal/regulatory counsel to review the intended use statement and regulatory pathway to confirm the precise classification of Naomi under UK MDR 2002.
- [ ] **Clinical Safety Standards (NHS Specific):**
  - **DCB0129 / DCB0160:** Appoint a Clinical Safety Officer (CSO). Create a Clinical Risk Management Plan, Hazard Log, and Clinical Safety Case Report as required by NHS England. These must run in parallel with ISO 14971 risk management.
- [ ] **Clinical Evaluation:** Complete a formal Clinical Evaluation Report (CER) demonstrating the clinical validity and safety of the RAG pipeline and LLM outputs using real-world or validated test data.
- [ ] **Supplier Management:** 
  - Formally assess and document the qualification of critical suppliers (Cloudflare, OpenAI/LLM provider, etc.).
  - Establish formal Quality/Data Processing Agreements where applicable.
- [ ] **Staff Training:** 
  - Conduct training on all new QMS procedures for all relevant staff (development, clinical, management).
  - Create and file formal training records.
- [ ] **Operationalisation (Generating Records):**
  - Execute a full software release cycle under the new QMS (IEC 62304 compliant).
  - Generate design history file (DHF) records, code review logs, testing evidence, and risk management logs. An auditor will need to see *evidence* of the QMS in use, not just the manuals.
- [ ] **Internal Audit & Management Review:** Conduct a complete internal audit of the QMS and hold a formal Management Review meeting prior to external certification.
- [ ] **Notified Body / Approved Body Engagement:** Select and contract a UK Approved Body (e.g., BSI, TÜV SÜD) to conduct the Stage 1 and Stage 2 certification audits for ISO 13485.

## 3. Important Regulatory Notes

### MHRA Registration
Before placing the Naomi SaMD on the UK market, the product and «[INSERT: Organisation Name]» must be formally registered with the Medicines and Healthcare products Regulatory Agency (MHRA). If the company is based outside the UK, a UK Responsible Person (UKRP) must be appointed.

### Estimated Effort
*Note:* Achieving full ISO 13485 certification from a baseline draft typically requires **6 to 12 months** of concerted effort for a small software team, depending on resource allocation and the maturity of existing engineering practices.

## 4. Scope and Application
This document applies across all departments and personnel at «[INSERT: Organisation Name]» responsible for developing, maintaining, validating, and marketing the Naomi SaMD.

## 5. Terms and Definitions
*   **Gap Analysis:** The formal comparison between current operational practices and ISO 13485:2016 / UK MDR statutory requirements.
*   **Approved Body:** A conformity assessment body designated by the MHRA to assess medical device compliance for UKCA marking.
*   **DCB0129:** The clinical risk management standard published by NHS England mandatory for health IT manufacturers.

## 6. Responsibilities
*   **Top Management:** Allocates financial and human resources to execute the remediation and readiness checklist.
*   **Quality Management Representative:** Coordinates action item closure, audit scheduling, and Approved Body communications.
*   **Clinical Safety Officer:** Owns clinical risk assessment milestones (DCB0129) and Clinical Safety Case Report.

## 7. Inputs and Outputs
*   **Inputs:** Baseline QMS document set (Version 0.1), ISO 13485 audit report, MHRA regulatory guidance, NHS DTAC specifications.
*   **Outputs:** Fully approved and signed controlled documents, objective evidence of procedure execution, Approved Body certification audit application.

## 8. Records Generated
*   Completed Remediation Action Log.
*   Approved Body Audit Application and Agreement.
*   Clinical Safety Case Report (CSCR) and Hazard Log (QMS-14971-02).

