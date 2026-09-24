# Record Control Procedure

| Attribute | Details |
| :--- | :--- |
| Document ID | QMS-4.2.5-01 |
| Title | Record Control Procedure |
| Version | 0.1 |
| Status | DRAFT |
| Effective Date | «[INSERT: TBD]» |
| Author | «[INSERT: Name]» |
| Approved By | «[INSERT: TBD]» |

## Revision History

| Version | Date | Author | Description of Change |
| :--- | :--- | :--- | :--- |
| 0.1 | «[INSERT: Date]» | «[INSERT: Name]» | Initial draft |

---

# 1. Purpose and Scope
This procedure defines the controls established by «[INSERT: Organisation Name]» for the identification, storage, security, retrieval, retention time, and disposition of Quality Management System (QMS) records. This procedure ensures compliance with ISO 13485:2016 (Clause 4.2.5) and ensures that records are maintained to provide evidence of conformity to requirements and of the effective operation of the QMS for the Naomi application.

# 2. Record Types and Formats
Records provide objective evidence of activities performed or results achieved. As a software organisation, all records are maintained electronically. Key record types include:
- **Design and Development Records:** GitHub commits, pull request reviews, automated test results (Vitest logs).
- **Production/Deployment Records:** CI/CD pipeline execution logs (GitHub Actions), Cloudflare deployment logs.
- **Post-Market Data:** Server logs, LLM interaction logs (stored securely in Cloudflare D1/KV), user feedback emails.
- **QMS Operational Records:** Audit reports, Management Review minutes, CAPA records, training logs.

# 3. Retention Periods
Records must be retained for a period necessary to ensure compliance and support post-market surveillance.
- **Medical Device Records:** In accordance with the UK MDR 2002, all records relating to the Naomi SaMD (including the DHF, Technical File, and PMS data) must be retained for a minimum of **5 years** after the last device has been placed on the market (or in the case of software, the final version is deprecated/removed from service).
- **Personnel and Training Records:** Retained for the duration of employment plus 5 years.
- **System Audit Logs:** Retained for a minimum of 1 year, unless specified otherwise by specific security requirements.

# 4. Storage and Protection
Electronic records are stored securely utilising robust cloud infrastructure to prevent loss, damage, or deterioration.
- **Infrastructure:** Source code, configuration, and document records are stored in GitHub. Application runtime data, vectors, and logs are stored in Cloudflare infrastructure (D1 SQLite, KV store, Vectorize).
- **Protection:** All data is encrypted at rest and in transit (TLS). Access is protected by strict Identity and Access Management (IAM) policies, requiring Multi-Factor Authentication (MFA) for all personnel.
- **Backup Policy:** Cloudflare D1 databases are automatically backed up according to Cloudflare's managed retention policies. GitHub repositories are resilient due to distributed version control and automated GitHub internal backups.

# 5. Retrieval Procedure
Records must remain readily retrievable throughout their retention period.
- GitHub's search functionality is used to retrieve code commits, PRs, and QMS documentation history.
- Cloudflare dashboards and querying tools are used to retrieve application logs and telemetry data.
- If proprietary formats are used, the software required to read the records must also be maintained or the records must be exported to standard formats (e.g., PDF, CSV, JSON) prior to system deprecation.

# 6. Legibility and Integrity Controls
Electronic records must remain legible and their integrity must be verifiable.
- **Integrity:** GitHub utilises cryptographic SHA-1 hashes to ensure the integrity of the commit history, preventing unauthorized retroactive alteration of records.
- **Audit Trails:** CI/CD and deployment environments maintain immutable audit trails of who initiated actions and when.

# 7. Disposal Procedure
Once the retention period has expired, records may be disposed of.
- Electronic records are permanently deleted from databases and storage buckets.
- Disposal of records must be authorized by the QA Manager to ensure that data subject to legal hold or ongoing PMS investigation is not destroyed prematurely.

# 8. GDPR / UK GDPR Considerations
Certain records (e.g., user feedback logs, error reports) may contain Personally Identifiable Information (PII) or special category health data.
- Retention of records containing personal data must comply strictly with the UK GDPR and the Data Protection Act 2018.
- Where possible, LLM interaction logs and telemetry used for QMS records must be anonymised or pseudonymised to remove direct patient/user identifiers.
- If a user exercises their "Right to Erasure" under GDPR, personal data will be purged, but anonymised safety/performance aggregated data may be retained to fulfil medical device regulatory obligations per QMS-REG-03.

# 9. Terms and Definitions
*   **Quality Record:** A special type of document providing objective evidence of conformity to requirements or the effective operation of the QMS.
*   **Retention Period:** The defined time span during which a record must be preserved and retrievable before authorized disposal.
*   **Data Integrity:** The completeness, accuracy, consistency, and immutability of data throughout its lifecycle.

# 10. Responsibilities
*   **Quality Manager:** Establishes record retention schedules and authorizes the disposal of obsolete records.
*   **Lead Developer:** Implements encryption, backup, access controls, and retention configurations across GitHub, Cloudflare D1, and KV.
*   **All Personnel:** Responsible for creating legible, accurate, and prompt records of work performed in accordance with QMS procedures.

# 11. Inputs and Outputs
*   **Inputs:** Completed forms, automated test reports (Vitest), deployment logs, audit findings, customer communications.
*   **Outputs:** Securely archived, searchable, and tamper-evident electronic quality records fulfilling regulatory compliance.

# 12. Records Generated
*   Record Retention and Disposal Log.
*   Electronic access and modification audit logs.

