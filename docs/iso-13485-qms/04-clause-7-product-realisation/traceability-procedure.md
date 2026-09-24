# Traceability Procedure
| Document ID | Title | Version | Status | Effective Date | Author | Approved By |
|---|---|---|---|---|---|---|
| QMS-7.5.9-01 | Traceability Procedure | 0.1 | DRAFT | «[INSERT: TBD]» | «[INSERT: Name]» | «[INSERT: TBD]» |

### Revision History
| Version | Date | Author | Description of Changes |
|---|---|---|---|
| 0.1 | «[INSERT: Date]» | «[INSERT: Name]» | Initial Draft |

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
This identification is visible to the user within the application settings/about screen.

## 4. User Session Traceability
To ensure traceability of clinical advice provided to users without violating UK GDPR principles, interactions are tracked securely:
*   **Session IDs:** Each interaction generates a unique Session ID.
*   **Audit Logging:** Chat transcripts and system responses are securely logged in the Cloudflare D1 database against the Session ID.
*   **Anonymisation:** All stored logs are stripped of direct personal identifiers, maintaining clinical and technical traceability without exposing user identities, in compliance with UK GDPR and NHS DTAC standards.

## 5. Incident Traceability
In the event of an adverse event, user complaint, or anomaly, the Session ID and timestamp are used to trace the event back to the exact Software Version and Cloudflare Deployment ID active at that specific time. This ensures accurate root cause analysis and impact assessment.

## 6. Post-Market Traceability and Corrections
If a post-market safety issue or software defect is identified:
*   The organisation will query the D1 audit logs to identify the scale and potential scope of affected sessions.
*   **Recall / Field Safety Corrective Action (FSCA):** For SaMD, a "recall" constitutes the deployment of a patched software version or the temporary cessation of the service. Corrected code will be immediately deployed via the Cloudflare Wrangler CLI, ensuring all subsequent user sessions instantly utilise the safe, updated version.
*   Users can be notified via in-app Field Safety Notices (FSNs) if required by the MHRA.

## 7. Records
The following traceability records shall be maintained (ISO 13485 Clause 4.2.5 and QMS-4.2.5-01):
*   GitHub commit histories and release tags.
*   Cloudflare deployment logs.
*   D1 audit logs mapping Session IDs to software versions.
*   Design History File traceability matrix (QMS-7.3.10-01).

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

