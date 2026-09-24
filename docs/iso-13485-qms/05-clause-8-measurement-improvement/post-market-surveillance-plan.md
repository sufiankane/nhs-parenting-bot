# Post-Market Surveillance (PMS) Plan
| Document ID | Title | Version | Status | Effective Date | Author | Approved By |
|---|---|---|---|---|---|---|
| QMS-PMS-01 | Post-Market Surveillance (PMS) Plan | 0.1 | DRAFT | «[INSERT: TBD]» | «[INSERT: Name]» | «[INSERT: TBD]» |

### Revision History
| Version | Date | Author | Description of Changes |
|---|---|---|---|
| 0.1 | «[INSERT: Date]» | «[INSERT: Name]» | Initial Draft |

## 1. Purpose and Scope
In compliance with ISO 13485:2016 Clause 8.2.1 and the UK Medical Devices Regulations (UK MDR 2002), this Post-Market Surveillance (PMS) Plan defines the methodology for proactively and reactively collecting, reviewing, and acting upon real-world data concerning the safety, performance, and usability of the Naomi AI chatbot SaMD.

## 2. PMS Objectives
The objectives of this PMS Plan are to:
*   Ensure Naomi continues to meet its intended purpose and clinical benefits.
*   Detect any previously unknown side-effects, risks, or safety concerns (such as AI hallucinations or unsafe clinical signposting).
*   Continuously monitor the benefit-risk profile established in the ISO 14971 Risk Management File.
*   Provide actionable feedback to the software design and development processes.

## 3. PMS Data Sources
To ensure a comprehensive understanding of device performance in the field, data will be systematically gathered from the following sources:
*   **Internal Data:**
    *   In-app audit logs and usage metrics (anonymised per UK GDPR, stored in Cloudflare D1).
    *   Complaint database and adverse event records.
    *   In-app feedback form submissions.
    *   Software nonconformity and bug tracking logs (GitHub).
*   **External Data:**
    *   App store reviews and ratings.
    *   Feedback from NHS partners and clinical sponsors.
    *   Academic literature and state-of-the-art updates regarding Generative AI (LLMs) in healthcare.
    *   Regulatory databases (e.g., MHRA alerts) for similar chatbot or SaMD technologies.

## 4. Activities and Schedule
PMS activities are conducted iteratively:
*   **Monthly Data Review:** The Quality Management Representative (QMR) and clinical lead conduct a high-level review of recent feedback, app crashes, and usage metrics to identify immediate anomalies.
*   **Quarterly Trend Analysis:** A deep-dive analysis of all aggregated PMS data to identify statistical trends (e.g., increasing user confusion in a specific conversational pathway).
*   **Periodic Safety Update Report (PSUR):** As a higher-risk/Class IIa+ equivalent device, an annual PSUR is compiled, summarising all PMS data, CAPAs, adverse events, and a re-evaluation of the overall benefit-risk profile.

## 5. Signal Detection and Escalation
A "signal" is defined as a pattern or single severe instance in the PMS data that suggests a potential safety or performance issue. Criteria for triggering an immediate safety investigation include:
*   Any report of patient harm or significant near miss.
*   A statistical spike in a specific category of complaint (e.g., >5% of monthly feedback citing inaccurate AI advice).
*   Changes in regulatory requirements or clinical best practices (e.g., updated NHS pediatric guidelines).

## 6. Linkage to QMS Processes
The outputs of the PMS Plan directly inform and trigger updates to other QMS areas:
*   **Risk Management:** The Risk Management Report is updated annually based on PMS findings to ensure risk mitigations remain effective.
*   **CAPA:** Systemic issues identified via PMS trending trigger the CAPA process (QMS-8.5-01).
*   **Design Changes:** User feedback and clinical literature reviews drive iterative software design changes (e.g., refining the LLaMA 3.1 system prompt).

## 7. Records
PMS Plans, quarterly trend analyses, annual PSURs, and records of any actions taken as a result of PMS activities shall be retained in accordance with QMS-4.2.5-01.

## 8. Terms and Definitions
*   **Post-Market Surveillance (PMS):** Systematic procedure implemented by manufacturers to proactively collect and review experience gained from medical devices placed on the market.
*   **Periodic Safety Update Report (PSUR):** Comprehensive report presenting the results and conclusions of the analyses of post-market surveillance data gathered as a result of the PMS plan.
*   **Safety Signal:** Reported information on a possible causal relationship between an adverse event and a device, the relationship being unknown or incompletely documented previously.

## 9. Responsibilities
*   **Quality Manager:** Coordinates ongoing PMS data collection, prepares quarterly trending reports, and compiles the annual PSUR.
*   **Clinical Safety Officer:** Evaluates clinical safety signals, assesses benefit-risk impacts, and updates the Risk Management File (QMS-14971-02).
*   **Lead Developer:** Queries and analyzes telemetry data from Cloudflare D1/KV.

## 10. Inputs and Outputs
*   **Inputs:** In-app telemetry (Cloudflare D1), complaint logs (QMS-7-02), adverse event reports (QMS-8.2.3-01), user feedback (QMS-8.2.1-01), clinical literature.
*   **Outputs:** Quarterly PMS Trend Reports, Annual Periodic Safety Update Report (PSUR), Risk Management File updates (QMS-14971-02).

