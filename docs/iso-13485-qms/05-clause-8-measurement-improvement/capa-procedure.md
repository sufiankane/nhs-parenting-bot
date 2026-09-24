# Corrective and Preventive Action (CAPA) Procedure
| Document ID | Title | Version | Status | Effective Date | Author | Approved By |
|---|---|---|---|---|---|---|
| QMS-8.5-01 | Corrective and Preventive Action (CAPA) Procedure | 0.1 | DRAFT | «[INSERT: TBD]» | «[INSERT: Name]» | «[INSERT: TBD]» |

### Revision History
| Version | Date | Author | Description of Changes |
|---|---|---|---|
| 0.1 | «[INSERT: Date]» | «[INSERT: Name]» | Initial Draft |

## 1. Purpose and Scope
In accordance with ISO 13485:2016 Clauses 8.5.2 and 8.5.3, this procedure defines the framework for identifying and eliminating the root causes of existing nonconformities (Corrective Action) and potential nonconformities (Preventive Action) within the Naomi SaMD and its Quality Management System.

## 2. Distinction: Corrective vs. Preventive Action
*   **Corrective Action (Reactive):** Action taken to eliminate the root cause of a detected nonconformity or other undesirable situation (e.g., fixing an architectural flaw that caused a chatbot hallucination).
*   **Preventive Action (Proactive):** Action taken to eliminate the root cause of a potential nonconformity before it occurs (e.g., updating AI prompt constraints based on a new academic study, before any user experiences an issue).

## 3. CAPA Initiation Triggers
A CAPA shall be initiated based on data indicating systemic or severe issues, including:
*   Major internal or external audit findings.
*   Severe complaints or reportable adverse events.
*   Trends in nonconforming product data (e.g., recurring software bugs of a similar nature).
*   Post-Market Surveillance (PMS) signals.
*   Significant near misses.

## 4. CAPA Investigation and Root Cause Analysis
Every CAPA requires a formal investigation to determine the underlying root cause. The team must utilise established root cause analysis methods, such as:
*   **The "5 Whys":** For straightforward procedural or code logic failures.
*   **Fishbone (Ishikawa) Diagram:** For complex issues involving multiple variables (e.g., interaction between Cloudflare AI infrastructure, user input, and internal logic).
The scope of the investigation must be proportional to the magnitude of the problem and commensurate with the risks encountered.

## 5. CAPA Plan Development
Following root cause identification, a CAPA Plan is formulated. The plan must detail:
*   The specific actions to be taken (e.g., rewriting code, retraining staff, updating prompt libraries).
*   The individuals responsible for implementation.
*   Target completion dates based on the severity of the issue (e.g., Safety-critical: within 14 days; Process-related: within 60 days).

## 6. Implementation and Effectiveness Verification
After the CAPA plan is implemented, its effectiveness must be objectively verified. This involves:
*   Confirming the actions were completed as planned.
*   Reviewing subsequent data (e.g., metrics, test results, logs) to prove the root cause has been successfully eliminated and the nonconformity has not recurred.
If verification fails, the CAPA must be escalated to Management Review, and a new investigation cycle initiated.

## 7. Link to Risk Management
Any changes to the software or procedures resulting from a CAPA must be evaluated to ensure they do not introduce new risks. The Risk Management File (ISO 14971) must be reviewed and updated accordingly.

## 8. Records
All CAPA activities shall be documented using the CAPA Form Template (QMS-7-01). Records of investigations, root cause analyses, implementation steps, and effectiveness verifications are securely maintained per QMS-4.2.5-01.

## 9. Terms and Definitions
*   **Corrective Action:** Action to eliminate the cause of a nonconformity and to prevent recurrence.
*   **Preventive Action:** Action to eliminate the cause of a potential nonconformity or other potential undesirable situation.
*   **Effectiveness Verification:** Formal evaluation proving that the corrective action successfully resolved the root cause without negative side effects.

## 10. Responsibilities
*   **Quality Manager:** Administers the CAPA register, assigns CAPA owners, monitors milestones, and conducts effectiveness verifications.
*   **CAPA Owner (Assigned Lead):** Conducts root cause analysis, develops action plans, and implements fixes.
*   **Top Management:** Reviews CAPA metrics and overdue actions during Management Reviews (QMS-5.6-01).

## 11. Inputs and Outputs
*   **Inputs:** Nonconformities (QMS-8.3-01), complaints (QMS-8.2.2-01), internal audit findings (QMS-8.2.4-01), adverse incidents (QMS-8.2.3-01).
*   **Outputs:** Executed CAPA Forms (QMS-7-01), verified software patches, updated Risk Management File entries (QMS-14971-02).

