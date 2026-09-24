# Quality Objectives

| Attribute | Details |
| :--- | :--- |
| **Document ID** | QMS-5.4.1-01 |
| **Title** | Quality Objectives |
| **Version** | 0.1 |
| **Status** | DRAFT |
| **Effective Date** | «[INSERT: TBD]» |
| **Author** | «[INSERT: Name]» |
| **Approved By** | «[INSERT: TBD]» |

## Revision History

| Version | Date | Author | Description of Changes |
| :--- | :--- | :--- | :--- |
| 0.1 | «[INSERT: Date]» | «[INSERT: Name]» | Initial draft for implementation |

---

# 1. Purpose
The purpose of this document is to define the measurable quality objectives for «[INSERT: Organisation Name]» in accordance with ISO 13485:2016 (Clause 5.4.1). These objectives are established by Top Management to ensure the effective implementation of the Quality Policy (QMS-5.3-01) and to drive continuous improvement in the Naomi application.

# 2. Linkage to Quality Policy
These objectives directly support our core commitments to patient safety, regulatory compliance (UK MDR, NHS DTAC, DCB0129), and continuous improvement, ensuring that Naomi functions reliably as an AI-powered SaMD.

# 3. Quality Objectives

| Objective No. | Description | Target | Measurement Method | Frequency of Review | Responsible Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **QO-01** | **Response Accuracy (Clinical Alignment)**<br>Ensure Naomi's guidance strictly aligns with published NHS guidelines and clinical protocols without hallucination. | ≥ 99% accuracy rate for audited responses | Routine sampling and evaluation of LLM outputs by Clinical Safety Officer/QA. | Monthly | Clinical Safety Officer |
| **QO-02** | **Escalation Reliability**<br>Ensure the system successfully identifies clinical red flags and escalates appropriately. | 100% of simulated and identified red flags trigger correct escalation pathways | Automated regression testing and manual audits of safety guardrails. | Per Release | Lead Developer |
| **QO-03** | **System Availability (Uptime)**<br>Maintain high availability of the SaMD infrastructure to ensure access to guidance. | ≥ 99.9% uptime (excluding planned maintenance) | Cloudflare Analytics and monitoring tools reporting. | Monthly | Lead Developer |
| **QO-04** | **Complaint Closure Time**<br>Resolve user and stakeholder complaints in a timely manner to maintain safety and trust. | 95% of non-critical complaints closed within 14 days; Critical safety complaints acknowledged within 24 hours. | Customer feedback and complaint log tracking. | Quarterly | QA Manager |
| **QO-05** | **CAPA Closure Rate**<br>Ensure corrective and preventive actions are resolved efficiently to prevent recurrence of issues. | 100% of CAPAs closed within agreed target dates | QMS CAPA register monitoring. | Quarterly | QA Manager |
| **QO-06** | **Training Compliance**<br>Maintain a highly trained workforce competent in QMS procedures and regulatory requirements. | ≥ 95% completion of mandatory QMS and role-specific training within 30 days of assignment | Training matrix and records tracking. | Bi-Annually | QA Manager |
| **QO-07** | **Audit Finding Resolution**<br>Effectively address findings from internal and external audits to ensure ongoing compliance. | Zero major non-conformities unresolved past 30 days | Audit log and non-conformance reports. | Annually | Top Management / QA Manager |

# 4. Review Cycle
Quality objectives are monitored at the frequencies specified above. Top Management formally reviews performance against these objectives during the Management Review (per Clause 5.6 and QMS-5.6-01). If targets are not met, appropriate Corrective and Preventive Actions (CAPA per QMS-8.5-01) shall be initiated. Top Management may revise these objectives periodically to ensure ongoing suitability and alignment with organisational goals.

# 5. Scope and Applicability
This procedure applies to all functions and processes within the Naomi SaMD lifecycle, establishing performance targets for engineering, clinical safety, quality assurance, and operations.

# 6. Terms and Definitions
*   **Quality Objective:** Something sought, or aimed for, related to quality, consistent with the Quality Policy and measurable.
*   **SMART Criteria:** Objectives that are Specific, Measurable, Achievable, Relevant, and Time-bound.
*   **KPI (Key Performance Indicator):** A quantifiable measure used to evaluate the success of an operational activity.

# 7. Responsibilities
*   **Top Management:** Establishes and approves annual quality objectives, reviewing them during Management Reviews.
*   **Quality Manager:** Aggregates KPI performance data and maintains the QMS metrics dashboard.
*   **Clinical Safety Officer:** Evaluates clinical accuracy and escalation reliability metrics.
*   **Lead Developer:** Tracks uptime, test pass rates, and security patch latency.

# 8. Inputs and Outputs
*   **Inputs:** Quality Policy (QMS-5.3-01), customer feedback, post-market surveillance data, audit results, business strategy.
*   **Outputs:** Monitored KPI metrics, Quality Objective progress reports presented at Management Review (QMS-5.6-01).

# 9. Records Generated
*   Quarterly Quality Objective Performance Dashboards.
*   Management Review Minutes (QMS-7-05).

