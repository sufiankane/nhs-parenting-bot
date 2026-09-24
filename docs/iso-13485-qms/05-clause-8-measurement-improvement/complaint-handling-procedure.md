# Complaint Handling Procedure
| Document ID | Title | Version | Status | Effective Date | Author | Approved By |
|---|---|---|---|---|---|---|
| QMS-8.2.2-01 | Complaint Handling Procedure | 0.1 | DRAFT | «[INSERT: TBD]» | «[INSERT: Name]» | «[INSERT: TBD]» |

### Revision History
| Version | Date | Author | Description of Changes |
|---|---|---|---|
| 0.1 | «[INSERT: Date]» | «[INSERT: Name]» | Initial Draft |

## 1. Purpose and Scope
In accordance with ISO 13485:2016 Clause 8.2.2 and UK MDR 2002 requirements, this procedure defines the process for receiving, evaluating, investigating, and resolving complaints related to the Naomi AI chatbot. This ensures that any deficiencies related to the identity, quality, durability, reliability, safety, or performance of the SaMD are systematically addressed.

## 2. Definition of a Complaint
For the Naomi SaMD, a complaint is any written, electronic, or oral expression of dissatisfaction regarding the application's safety, quality, or performance. This explicitly includes:
*   Reports of the chatbot generating incorrect, dangerous, or clinically unverified health advice.
*   Failure of the app to appropriately signpost urgent medical conditions.
*   Repeated application crashes affecting access to clinical guidance.
*   Suspected breaches of data privacy or UK GDPR non-compliance.

## 3. Complaint Sources and Intake
Complaints may originate from app store reviews, support emails, in-app feedback escalations, NHS procurement/clinicians, or social media. Upon receipt, all complaints are immediately logged into the Complaint Database using the Complaint Form Template (QMS-7-02) within 2 business days.

## 4. Complaint Investigation Process
Every logged complaint undergoes a structured investigation:
*   **Triage:** Assessing the severity and potential clinical impact.
*   **Root Cause Analysis (RCA):** The engineering and clinical teams evaluate the specific user session (via D1 audit logs) to recreate the scenario. This may involve assessing the prompt given to the Cloudflare AI LLaMA 3.1 model, reviewing the vector database retrievals, or analysing the software execution path.
*   **Documentation:** All investigation steps, findings, and rationales are documented in the complaint record.

## 5. Adverse Event Determination and 30-Day Window
During triage, the Quality Management Representative (QMR) must assess whether the complaint constitutes a reportable adverse event. 
*   If the complaint involves a death, serious deterioration in health, or a significant near miss, it triggers the Adverse Event Reporting Procedure (QMS-8.2.3-01).
*   **Critical Timing:** The organisation maintains strict awareness of the UK MDR reporting windows (immediate/2 days for severe events, 30 days for others). The evaluation for reportability must occur immediately upon complaint receipt.

## 6. Corrective and Preventive Action (CAPA)
If the root cause analysis identifies a systemic software defect, an AI hallucination vulnerability, or a gap in NHS content retrieval, a formal CAPA (QMS-8.5-01) shall be initiated. Immediate containment actions (e.g., deploying a hotfix via Cloudflare Wrangler, updating system prompts) may be applied prior to full CAPA closure.

## 7. Response to Complainant
Where feasible, a formal response is provided to the complainant detailing the receipt of the complaint, the outcome of the investigation, and any corrective actions taken to ensure ongoing safety.

## 8. Records
Records of complaint investigations, rationales for non-investigation (if applicable), and resultant actions shall be maintained per ISO 13485 Clause 4.2.5 and QMS-4.2.5-01. The standard record template is QMS-7-02 (Complaint Record).

## 9. Terms and Definitions
*   **Complaint:** Written, electronic, or oral communication that alleges deficiencies related to the identity, quality, durability, reliability, usability, safety, or performance of a medical device.
*   **Adverse Event:** Any incident that led or might have led to serious deterioration in health of a patient, user, or other person.
*   **Root Cause Analysis (RCA):** Structured investigation method identifying the fundamental underlying reason for a failure.

## 10. Responsibilities
*   **Quality Manager:** Receives, logs, triages complaints, coordinates investigations, and ensures regulatory reporting timelines are met.
*   **Clinical Safety Officer:** Assesses clinical risk and severity of health-related complaints, advising on reportability.
*   **Lead Developer:** Analyzes session telemetry (D1/KV logs), identifies technical/prompt root causes, and deploys hotfixes.

## 11. Inputs and Outputs
*   **Inputs:** User complaints, feedback escalations (QMS-8.2.1-01), app store reviews, clinical alerts.
*   **Outputs:** Logged and investigated Complaint Records (QMS-7-02), adverse event reports (QMS-8.2.3-01), CAPA records (QMS-8.5-01).

