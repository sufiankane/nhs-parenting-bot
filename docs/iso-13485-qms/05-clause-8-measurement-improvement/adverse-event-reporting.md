# Adverse Event Reporting Procedure
| Document ID | Title | Version | Status | Effective Date | Author | Approved By |
|---|---|---|---|---|---|---|
| QMS-8.2.3-01 | Adverse Event Reporting Procedure | 0.1 | DRAFT | «[INSERT: TBD]» | «[INSERT: Name]» | «[INSERT: TBD]» |

### Revision History
| Version | Date | Author | Description of Changes |
|---|---|---|---|
| 0.1 | «[INSERT: Date]» | «[INSERT: Name]» | Initial Draft |

## 1. Purpose and Scope
In accordance with ISO 13485:2016 Clause 8.2.3, the UK Medical Devices Regulations (UK MDR 2002), and MHRA Vigilance Guidance, this procedure outlines the requirements for identifying, evaluating, and reporting adverse events and near misses associated with the Naomi AI chatbot to the Medicines and Healthcare products Regulatory Agency (MHRA).

## 2. Definitions
*   **Serious Adverse Event:** An incident that directly or indirectly led, might have led, or might lead to the death of a patient/user, or a serious deterioration in their state of health.
*   **Near Miss:** An event that could have caused a serious adverse event, but did not, either due to chance or timely intervention. In the context of Naomi, this could be the AI suggesting a dangerous course of action that a parent fortunately ignored.
*   **Field Safety Corrective Action (FSCA):** An action taken by the manufacturer to reduce a risk of death or serious deterioration in health associated with the use of the medical device.
*   **Field Safety Notice (FSN):** A communication sent out to users regarding an FSCA.

## 3. Criteria for Reporting to MHRA
An incident is reportable to the MHRA if all of the following criteria are met:
1.  An event has occurred.
2.  The manufacturer's medical device (Naomi) is suspected to be a contributory cause of the incident.
3.  The event led, or might have led, to death or serious deterioration in health (including significant near misses).

## 4. Reporting Timeframes
Strict regulatory timeframes apply from the moment the organisation becomes aware of a potentially reportable event:
*   **Public Health Threat:** Immediately (without delay, not later than 2 days).
*   **Death or Unanticipated Serious Deterioration:** Immediately (without delay, not later than 10 elapsed days).
*   **All Other Reportable Incidents (including near misses):** Within 30 elapsed days.

## 5. MHRA Reporting Portal and Process
Reports are submitted electronically using the MHRA MORE (Manufacturer's On-line Reporting Environment) portal. The Quality Management Representative (QMR) is responsible for drafting the Manufacturer's Incident Report (MIR) and submitting it.

## 6. Internal Investigation
Parallel to regulatory reporting, an urgent internal investigation is launched. This relies heavily on system logs (Cloudflare D1), user session traceability (QMS-7.5.9-01), and root cause analysis via the CAPA procedure (QMS-8.5-01). The investigation must not delay initial MHRA reporting.

## 7. Field Safety Corrective Action (FSCA) Process
If the investigation reveals a systemic risk requiring urgent mitigation, the organisation will implement an FSCA. For Naomi, this typically involves:
*   Immediate emergency deployment of software patches or prompt engineering updates via Cloudflare Wrangler to eliminate the hazard.
*   Temporary suspension of the AI service or specific clinical pathways.
*   Notifying users via an in-app Field Safety Notice (FSN) detailing the issue and actions taken.
The MHRA must be notified of any FSCA prior to its execution, unless immediate action is required to prevent imminent harm.

## 8. Linkage to QMS
Adverse event reporting interfaces closely with Complaint Handling (QMS-8.2.2-01) for initial intake, and CAPA (QMS-8.5-01) for resolution. Outcomes are fed into the Risk Management File (ISO 14971) and PMS Plan (QMS-PMS-01).

## 9. Records
Copies of all MHRA submissions (MIRs), correspondence, investigation files, and FSNs shall be securely maintained as QMS records per QMS-4.2.5-01.

## 10. Responsibilities
*   **Quality Manager / QMR:** Authorizes and submits Manufacturer Incident Reports (MIRs) to the MHRA via the MORE portal within statutory timeframes.
*   **Clinical Safety Officer:** Evaluates incident severity, determines whether clinical criteria for reportability are met, and oversees clinical containment.
*   **Top Management:** Authorizes Field Safety Corrective Actions (FSCAs) and service suspension decisions.
*   **Lead Developer:** Extracts session logs (D1) and executes emergency patch releases via Cloudflare Wrangler.

## 11. Inputs and Outputs
*   **Inputs:** High-severity complaints (QMS-8.2.2-01), clinical safety alerts, post-market surveillance signals (QMS-PMS-01).
*   **Outputs:** MHRA MORE incident reports, Field Safety Corrective Action notices, expedited CAPA files (QMS-8.5-01).

