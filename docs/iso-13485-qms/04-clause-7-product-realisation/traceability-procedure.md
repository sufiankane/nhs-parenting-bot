# Traceability Procedure
| Document ID | Title | Version | Status | Effective Date | Author | Approved By |
|---|---|---|---|---|---|---|
| QMS-7.5.9-01 | Traceability Procedure | 0.2 | DRAFT | «[INSERT: TBD]» | «[INSERT: Name]» | «[INSERT: TBD]» |

### Revision History
| Version | Date | Author | Description of Changes |
|---|---|---|---|
| 0.1 | «[INSERT: Date]» | «[INSERT: Name]» | Initial Draft |
| 0.2 | «[INSERT: Date]» | «[INSERT: Name]» | Updated user session traceability: disabled server-side logging, local client storage architecture, and complaint investigation considerations |

## 1. Purpose and Scope
In accordance with ISO 13485:2016 Clause 7.5.9 and UK MDR 2002 requirements, this procedure defines the mechanisms for ensuring full traceability of the Naomi software application. As a Software as a Medical Device (SaMD), traceability applies exclusively to the software versions deployed to end-users in the production environment, the tracking of user interactions, and the ability to correlate software versions with specific post-market events.

## 2. Traceability Approach
The organisation ensures traceability from software requirements through source code changes to the final deployed artefact. This is achieved via:
*   **Git Commit Hashes:** Every change to the source code is tracked via a unique Git commit hash in the GitHub repository.
*   **Semantic Versioning:** Releases are tagged using strict semantic versioning (e.g., v1.2.0) tied to a specific commit.
*   **Deployment IDs:** The Cloudflare Workers deployment process generates a unique Deployment ID that maps exactly to a GitHub release tag.

## 3. Device Identification
The Naomi SaMD is identified in the field and in regulatory submissions using the following configuration parameters:
*   **Application Name:** Naomi
*   **Software Version:** The semantic version number (e.g., v1.2.0).
*   **Deployment Environment:** Production (vs. Staging or Development).
*   **Release Date:** The timestamp of the deployment to the Cloudflare environment.
*   This identification is visible to the user within the application settings/about screen.

## 4. User Session Traceability
To ensure complete protection of user privacy and compliance with UK GDPR and NHS DTAC principles, current session traceability operates under a strict zero-harvesting privacy architecture:
*   **Server-Side Logging Disabled:** All server-side logging of user chat transcripts, prompts, and generated responses is currently disabled to ensure no personal information (PII) or sensitive health data is harvested, retained, or processed centrally.
*   **Local Client Storage:** Any chat conversations and interaction history are stored strictly locally on the user's client device (e.g., browser local storage / client session memory). The organisation and central server infrastructure have **no access** to user chat logs.
*   **Session Identifiers:** Session IDs generated during runtime are ephemeral and used client-side or transiently to manage conversation state during an active session.
*   **Future Architecture Evolution (Complaints & Investigations):** This zero-log design introduces constraints when investigating user complaints, anomalies, or clinical safety issues. The organisation recognises that this architecture may evolve as post-market surveillance processes mature. Future architectural iterations may incorporate privacy-preserving mechanisms—such as user-consented diagnostic log exports, opt-in troubleshooting reports, or audited incident submission channels—to allow root cause analysis of complaints without compromising baseline privacy.

## 5. Incident Traceability & Complaint Determination
In the event of an adverse event, user complaint, or reported software anomaly:
*   **Investigation with Zero Central Logs:** Because central chat logs are not accessible, investigations rely on user-reported information (e.g., incident timestamp, user-provided screenshots, or user-consented export of local chat history) alongside the visible Software Version and Deployment ID.
*   **Deployment Correlation:** The reported timestamp and Software Version are mapped to the exact Cloudflare Deployment ID and Git commit hash active at that time.
*   **Reproduction & Root Cause Analysis:** Clinical and engineering teams reconstruct the reported issue in a validated test environment using the corresponding code release and knowledge-base version to determine root cause and safety impact.

## 6. Post-Market Traceability and Corrections
If a post-market safety issue or software defect is identified:
*   **Scope Assessment:** The organisation assesses the deployment window and active duration of the affected Software Version and Cloudflare Deployment ID to determine potential population exposure.
*   **Recall / Field Safety Corrective Action (FSCA):** For SaMD, a "recall" constitutes the deployment of a patched software version or the temporary cessation of the service. Corrected code is immediately deployed via the Cloudflare Wrangler CLI / CI/CD pipeline, ensuring all subsequent user sessions instantly utilise the safe, updated version.
*   **User Notification:** Users can be notified via in-app Field Safety Notices (FSNs) or banners if required by the MHRA.

## 7. Records
The following traceability records shall be maintained (ISO 13485 Clause 4.2.5 and QMS-4.2.5-01):
*   GitHub commit histories and release tags.
*   Cloudflare deployment logs and environment configuration records.
*   Software version release records mapped to Deployment IDs.
*   Design History File traceability matrix (QMS-7.3.10-01).
*   Complaint and incident investigation files (QMS-8.2.2-01 / QMS-7-02), including any user-consented diagnostics or local transcripts provided.

## 8. Terms and Definitions
*   **Traceability:** Ability to trace the history, application, or location of an object (in software: linking requirements to code, tests, and deployment releases).
*   **Field Safety Corrective Action (FSCA):** Action taken by a manufacturer to reduce a risk of death or serious deterioration in the state of health associated with the use of a medical device that is already placed on the market.
*   **Deployment ID:** An immutable identifier assigned to a specific runtime execution bundle deployed to Cloudflare Workers.

## 9. Responsibilities
*   **Lead Developer:** Enforces commit tagging, maintains semantic versioning, and validates deployment ID logging.
*   **Quality Manager:** Audits end-to-end traceability from Design Inputs to production releases (QMS-7.3.10-01).
*   **Clinical Safety Officer:** Evaluates incident traceability data during adverse event investigations (QMS-8.2.3-01).

## 10. Inputs and Outputs
*   **Inputs:** Design Inputs (QMS-7.3.3-01), Git commits, CI/CD pipeline triggers, user incident reports.
*   **Outputs:** Verifiable traceability links connecting user interaction logs to exact source code releases and test evidence.

