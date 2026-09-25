# Infrastructure Management Procedure

| Attribute | Details |
| :--- | :--- |
| **Document ID** | QMS-6.3-01 |
| **Title** | Infrastructure Management Procedure |
| **Version** | 0.1 |
| **Status** | DRAFT |
| **Effective Date** | «[INSERT: TBD]» |
| **Author** | «[INSERT: Name]» |
| **Approved By** | «[INSERT: TBD]» |


## Revision History

| Version | Date | Description of Changes | Author |
|---|---|---|---|
| 0.1 | «[INSERT: Date]» | Initial Draft | «[INSERT: Name]» |

---

## 1. Purpose
This procedure defines the requirements for providing and maintaining the infrastructure needed to achieve conformity to product requirements for the Naomi application, in accordance with ISO 13485 (Clause 6.3). 

## 2. Scope
The scope of this procedure encompasses both the production infrastructure hosting the Naomi SaMD and the development infrastructure used to design, build, and deploy the software. As «[INSERT: Organisation Name]» produces a software-only medical device (SaMD), traditional manufacturing infrastructure is not applicable.

## 3. Production Infrastructure
The live production environment for Naomi is hosted on cloud architecture provided by Cloudflare.
- **Components**: Cloudflare Workers (compute), KV (key-value store), D1 (relational database), Vectorize (vector database for RAG), and R2 (object storage).
- **Maintenance and Maintenance Activities**: Maintenance of the underlying hardware and network is the responsibility of the cloud provider. We monitor service level agreements (SLAs) and uptime (Clause 6.3).
- **Data Residency**: Infrastructure is configured to prioritise UK/EEA geographic regions to comply with UK GDPR and NHS data security requirements.

## 4. Development Infrastructure and Staging Environments
The infrastructure required to build, test, and maintain the product includes:
- **Developer Workstations:** Development is performed on a personal workstation equipped with a dedicated modern development stack using Visual Studio Code (VS Code), local TypeScript tooling, runtime emulators, and local test runners.
- **Source Control and CI/CD:** GitHub repositories, automated GitHub Actions pipelines, and Cloudflare Wrangler CLI for continuous integration and deployment.
- **Staging Environment:** 
  - A dedicated staging environment will be deployed when the application is required to integrate closer into NHS systems.
  - The staging environment will **not** be externally connected to live NHS operational infrastructure or external networks; it is designed to strictly mimic the production system architecture, runtime configuration, and edge bindings.
  - All releases to staging progress through automated CI/CD pipelines.
  - Promotion from staging to production is strictly gated: software will **ONLY** be deployed to production if the pre-agreed embedded test packs and golden regression tests pass completely with zero critical failures. This safeguard prevents bugs, regressions, or unintended behaviours from unexpectedly slipping into production.
  - All test packs are under formal change control and comprehensively cover triage classification logic, clinical safety factors, guardrails, and authoritative data source integrity.

## 5. IT Security Controls, Data Isolation, and Access Management
Information systems are a critical part of our infrastructure (Clause 6.3(c)). Controls include:
- **Development Environment Data Isolation:** 
  - Development environments have **no access to personal information** (identifiable user data).
  - Development environments currently do **not** run any APIs or integrations to live databases hosted by the NHS.
  - Any future integrations with NHS systems will strictly operate with dummy APIs, mocked endpoints, or synthetic test data environments only.
  - **Open Activity:** A planned and open quality activity is to proactively engage with the NHS (e.g., NHS England / commissioning bodies) to establish approved, secure mechanisms and environments for testing integrations prior to clinical or production deployment.
- **Source Control Security & Authentication:** 
  - Two-Factor Authentication (2FA) is strictly enforced for all access and operations on source control via GitHub.
  - GitHub is utilised as an enterprise-grade code repository and version control platform trusted globally by commercial and healthcare software organisations, ensuring rigorous physical and logical security, branch protections, and complete commit history.
- **Access Management & RBAC:** Role-based access control (RBAC) is enforced across all platforms (Cloudflare, GitHub).
- **Prompt Database Integrity & Security Controls:**
  - The database storing clinical system prompts and safety instructions employs SHA-256 cryptographic hashing to detect and prevent any unauthorised alterations, tampering, or malicious prompt injection payloads.
  - Future engineering work will ensure that the prompt and configuration databases remain encrypted at rest with private encryption keys stored and managed outside the database runtime in a dedicated key management facility.
  - The prompt database will enforce separate, strict RBAC controls to ensure it cannot be modified accidentally, arbitrarily, or without explicit Clinical Safety Officer (CSO) sign-off and the complete passing of all automated regression test packs. *(Note: This formal prompt change authorisation and verification process needs to be documented and defined in a dedicated operational procedure).*
- **Secrets Management:** Cryptographic keys, API tokens, and operational passwords are managed exclusively via secure environment variables and secret stores (e.g., Cloudflare secrets management), and are strictly prohibited from being committed to version control.

## 6. Monitoring and Alerting
Infrastructure performance and availability are continuously monitored using Cloudflare Analytics and integrated error logging tools. Alerts are configured to notify the development team of downtime, performance degradation, or unusual traffic patterns affecting the application's intended use.

## 7. Infrastructure Change Control
Changes to the production infrastructure configuration (e.g., modifying worker routes, changing database schemas) are treated as software changes and are managed through the Document Control Procedure (QMS-4.2.4-01) and Software Configuration Management in the Software Lifecycle Plan (QMS-62304-01).

## 8. Business Continuity and Disaster Recovery
As a cloud-native serverless application, high availability is inherently provided by Cloudflare's distributed edge network. Business continuity measures include:
- **Watchdogs & Health Monitoring:** Cloudflare employs automated watchdogs and synthetic health checks in place to continuously monitor service availability, detecting regional outages or edge node degradations in real time.
- **Dynamic Endpoint Redirection:** Application endpoints and routing can be dynamically updated, shifted, or redirected to newly provisioned worker stacks or alternative regions in the event of persistent infrastructure failure or platform degradation.
- **Automated Backups & Redeployment:** Disaster recovery plans include automated database backups (D1, KV) and the ability to redeploy the entire application stack from GitHub repositories using CI/CD pipelines to mitigate catastrophic infrastructure disruption.

## 9. Supplier Infrastructure Management
Cloudflare is classified as a critical supplier. Their infrastructure and security certifications (e.g., ISO 27001) are evaluated and monitored per the Supplier and Purchasing Procedure (QMS-7.4-01) to ensure they meet the rigorous demands of a medical device host.

## 10. Terms and Definitions
*   **Production Infrastructure:** The hardware, operating systems, cloud runtimes, databases, and networks required to host and deliver the SaMD to users.
*   **Serverless Runtime:** An edge compute execution model where the cloud provider dynamically manages resource allocation and infrastructure maintenance.
*   **Disaster Recovery (DR):** Strategies and procedures to restore software systems and data in the event of major infrastructure interruption.

## 11. Responsibilities
*   **Lead Developer:** Administers cloud infrastructure configurations (Cloudflare, GitHub), monitors system metrics, and enforces secrets management.
*   **Quality Manager:** Assesses infrastructure compliance against ISO 13485 (Clause 6.3) and reviews supplier audit certifications.
*   **Top Management:** Ensures financial resources are available for redundant cloud infrastructure and backup facilities.

## 12. Inputs and Outputs
*   **Inputs:** SaMD deployment architecture (QMS-7.3.4-01), uptime requirements, data residency mandates (UK GDPR / NHS DTAC), supplier SLAs.
*   **Outputs:** Highly available, monitored, and resilient cloud production environment compliant with medical device standards.

## 13. Records Generated
*   Infrastructure Uptime and Incident Telemetry Logs.
*   Quarterly Cloudflare / GitHub Access Review Records.
*   Annual Disaster Recovery Test Records.

