# Corrective and Preventive Action (CAPA) Procedure
| Document ID | Title | Version | Status | Effective Date | Author | Approved By |
|---|---|---|---|---|---|---|
| QMS-8.5-01 | Corrective and Preventive Action (CAPA) Procedure | 0.2 | DRAFT | 2026-09-25 | «[INSERT: Name]» | «[INSERT: TBD]» |

### Revision History
| Version | Date | Author | Description of Changes |
|---|---|---|---|
| 0.1 | «[INSERT: Date]» | «[INSERT: Name]» | Initial Draft |
| 0.2 | 2026-09-25 | «[INSERT: Name]» | Added CAPA initiation by MHRA, CSO, and Founder; detailed CSO involvement throughout; defined software/architectural change lifecycles; expanded likely triggers; integrated investigation tools (5 Whys, fishbone, FMEA, external forensic analysis); and incorporated long-term pre-release testing. |

## 1. Purpose and Scope
In accordance with ISO 13485:2016 Clauses 8.5.2 and 8.5.3, this procedure defines the framework for identifying, investigating, resolving, and eliminating the root causes of existing nonconformities (Corrective Action) and potential nonconformities (Preventive Action) within the Naomi Software as a Medical Device (SaMD) and its Quality Management System.

A CAPA may be undertaken at the formal request of the Medicines and Healthcare products Regulatory Agency (MHRA), the Chief Scientific Officer (CSO), or the Founder, as well as initiated through automated or operational quality triggers. The Chief Scientific Officer (CSO) remains actively involved throughout the entire CAPA lifecycle.

## 2. Distinction: Corrective vs. Preventive Action
*   **Corrective Action (Reactive):** Action taken to eliminate the root cause of a detected nonconformity or other undesirable situation (e.g., fixing an architectural flaw that caused a chatbot hallucination).
*   **Preventive Action (Proactive):** Action taken to eliminate the root cause of a potential nonconformity before it occurs (e.g., updating AI prompt constraints based on a new academic study, before any user experiences an issue).

## 3. CAPA Initiation and Triggers
A CAPA can be formally initiated at the request of:
*   The **Medicines and Healthcare products Regulatory Agency (MHRA)** (or relevant regulatory authority).
*   The **Chief Scientific Officer (CSO)**.
*   The **Founder**.

Likely triggers that mandate or prompt CAPA initiation include:
*   **Serious complaints:** Any user or clinical complaint involving safety concerns, diagnostic errors, or severe performance deviations.
*   **Recurring software bugs:** Identifiable trends or repeated software defects of a similar nature (e.g., persistent hallucination patterns, edge-case routing failures, or prompt leakage).
*   **Awareness of regulatory changes affecting underlying models used:** New regulatory requirements, updated guidance from the MHRA/notified bodies, or vendor deprecations/modifications impacting foundational AI/LLM models and APIs.
*   **Near misses:** Intercepted critical errors, hazardous prompt/response anomalies, or data validation failures that had the potential to cause patient harm or regulatory non-compliance had they reached production.
*   **Audit findings & PMS signals:** Major internal or external audit findings and significant adverse signals detected via Post-Market Surveillance.

## 4. CAPA Investigation and Root Cause Analysis
Every CAPA requires a formal investigation to determine the root cause rather than merely addressing surface symptoms. The scope of the investigation must be proportional to the magnitude of the problem and commensurate with the clinical and technical risks encountered.

### 4.1 Investigative Tools
The investigation team will utilise a variety of investigative tools appropriate to the nature of the issue, including:
*   **The "5 Whys":** For direct, linear procedural, code logic, or configuration failures.
*   **Fishbone (Ishikawa) Diagrams:** For multifactorial problems mapping variables across algorithms, training/prompt data, infrastructure (e.g., Cloudflare AI, external model APIs), user input, and operational environment.
*   **Failure Mode and Effects Analysis (FMEA):** For systematically evaluating potential failure modes, assessing risk severity, detectability, and identifying systemic vulnerabilities across the system architecture.

### 4.2 Forensic Analysis with External Specialists
In extreme circumstances—such as unexplained foundation model drift, anomalous AI safety failures with potential clinical impact, suspected data integrity breaches, or complex multi-system failures—further forensic analysis may be undertaken with an external specialist in these issues. The engagement of external forensic specialists shall be authorized in coordination with the Founder and the CSO.

### 4.3 CSO Involvement in the Investigation
The Chief Scientific Officer (CSO) is actively involved throughout the investigation phase:
*   Directing technical inquiry into model behavior, prompt safety, and clinical alignment.
*   Reviewing findings from root cause tools (5 Whys, Fishbone, FMEA).
*   Evaluating external specialist and forensic reports to ensure complete scientific clarity before corrective plans are formulated.

## 5. CAPA Plan Development and Change Lifecycle Governance
Following root cause identification, a comprehensive CAPA Plan is formulated detailing:
*   The specific corrective and preventive actions to be undertaken.
*   Assigned action owners and target completion dates based on risk severity (e.g., safety-critical remediations prioritized).

### 5.1 Adherence to Development and Architectural Lifecycles
All changes resulting from a CAPA must follow the relevant development and governance lifecycle:
*   **Software Changes:** If the remediation involves code modifications, model prompt templates, algorithmic tweaks, or pipeline configurations, it must strictly adhere to the Software Development Lifecycle (SDLC) per IEC 62304 and Software Change Management procedures (QMS-7.3.10-01). This includes peer code reviews, automated unit and integration tests, and regression testing prior to deployment.
*   **Architectural Changes:** If the remediation entails systemic architectural changes (e.g., transitioning foundation model providers, redesigning RAG/retrieval architecture, re-engineering database boundaries, or updating AI orchestration logic), the change must undergo formal architectural review, design controls, risk re-assessment under ISO 14971, and technical and clinical validation prior to release.

### 5.2 Identification of Long-Term Tests
To prevent recurrence, the CAPA plan must explicitly identify and implement longer-term tests to ensure failure modes are systematically caught prior to release in subsequent development cycles:
*   Automated regression test suites and end-to-end integration assertions simulating the identified failure mode.
*   Evaluation benchmarks and "golden datasets" testing model outputs against clinically verified responses.
*   Automated pre-release CI/CD gates to verify guardrail integrity before any future deployment.

### 5.3 CSO Involvement in Planning
The Chief Scientific Officer (CSO) must review and approve all proposed software and architectural change plans, ensuring that proposed fixes address root causes and that the identified long-term testing adequately shields the system from recurrence.

## 6. Implementation and Effectiveness Verification
After the CAPA plan is implemented through the appropriate software or architectural lifecycle, its effectiveness must be objectively verified:
*   **Implementation Verification:** Confirming that all code changes, architectural adjustments, and long-term test suites have been successfully executed, reviewed, and deployed.
*   **Effectiveness Review Over Time:** Reviewing subsequent post-release data (e.g., telemetry, PMS feedback, automated test outputs, incident rates) over a predefined observation period to prove that the root cause has been eliminated and the nonconformity has not recurred.
*   **CSO and Quality Sign-Off:** The CSO is actively involved in evaluating verification metrics and must provide scientific and safety sign-off on the effectiveness verification before the CAPA can be formally closed.
*   **Failure of Verification:** If verification fails or evidence of recurrence emerges, the CAPA must be escalated to Management Review, and a new investigation cycle initiated.

## 7. Link to Risk Management
Any changes to the software or procedures resulting from a CAPA must be evaluated to ensure they do not introduce new risks. The Risk Management File (ISO 14971) must be reviewed and updated accordingly.

## 8. Records
All CAPA activities shall be documented using the CAPA Form Template (QMS-7-01). Records of investigations, root cause analyses, external forensic reports, software lifecycle/architectural change records, long-term test definitions and results, and effectiveness verifications are securely maintained per QMS-4.2.5-01.

## 9. Terms and Definitions
*   **Corrective Action:** Action taken to eliminate the root cause of a detected nonconformity or other undesirable situation to prevent recurrence.
*   **Preventive Action:** Action taken to eliminate the root cause of a potential nonconformity or other potential undesirable situation to prevent occurrence.
*   **Effectiveness Verification:** Formal evaluation proving that the action resolved the root cause and prevented recurrence without introducing unacceptable side effects or new risks.
*   **Near Miss:** An event or situation that could have resulted in an adverse incident, incorrect medical output, or regulatory non-compliance, but did not develop into a serious event due to interception or fortunate circumstances.

## 10. Responsibilities
*   **Chief Scientific Officer (CSO):**
    *   Empowered to initiate CAPAs.
    *   Actively involved throughout the entirety of the CAPA process from initiation to closure.
    *   Provides technical and scientific direction during root cause investigations, particularly for algorithmic, foundation model, and clinical safety issues.
    *   Directs and assesses external forensic specialist analyses where extreme circumstances arise.
    *   Reviews and approves software and architectural remediation plans.
    *   Oversees the design and implementation of long-term pre-release testing suites.
    *   Performs technical and safety evaluation and signs off on effectiveness verification prior to CAPA closure.
*   **Founder / Top Management:**
    *   Empowered to initiate CAPAs directly or upon receipt of formal notification/requests from the MHRA.
    *   Authorizes resources for external specialist forensic investigations when warranted.
    *   Reviews CAPA metrics, open actions, and systemic trends during Management Reviews (QMS-5.6-01).
*   **Quality Manager:**
    *   Maintains the CAPA register and ensures strict procedural compliance with ISO 13485 Clauses 8.5.2 and 8.5.3.
    *   Assigns CAPA owners, tracks milestones, and coordinates verification activities.
    *   Ensures that all software and architectural change records, external reports, and verification documents are archived per QMS-4.2.5-01.
*   **CAPA Owner (Assigned Lead):**
    *   Executes root cause investigations using formal tools (5 Whys, Fishbone, FMEA).
    *   Coordinates remediation through the appropriate SDLC (IEC 62304) or architectural change governance lifecycle.
    *   Establishes long-term automated test suites and compiles objective evidence for effectiveness verification.

## 11. Inputs and Outputs
*   **Inputs:** Requests from MHRA, CSO, or Founder; serious complaints (QMS-8.2.2-01); recurring software bugs; awareness of regulatory changes affecting underlying models; near misses; internal/external audit nonconformities (QMS-8.2.4-01); adverse incident signals (QMS-8.2.3-01).
*   **Outputs:** Executed CAPA Forms (QMS-7-01), verified software patches adhering to SDLC/IEC 62304, architectural review records, long-term automated test suites, external forensic reports (where applicable), updated Risk Management File entries (QMS-14971-02).

