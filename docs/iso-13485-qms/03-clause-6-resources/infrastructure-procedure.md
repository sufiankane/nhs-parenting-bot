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

## 4. Development Infrastructure
The infrastructure required to build and maintain the product includes:
- **Source Control and CI/CD**: GitHub repositories, GitHub Actions, and Cloudflare Wrangler for continuous integration and deployment.
- **Developer Workstations**: Company-issued or approved devices running authorised development environments. 

## 5. IT Security Controls and Access Management
Information systems are a critical part of our infrastructure (Clause 6.3(c)). Controls include:
- **Access Management**: Role-based access control (RBAC) is enforced across all platforms (Cloudflare, GitHub).
- **Authentication**: Multi-factor authentication (MFA) is mandatory for access to production and development infrastructure.
- **Secrets Management**: Cryptographic keys, API tokens, and passwords are managed via secure environment variables and secret stores, and are strictly prohibited from being committed to version control.

## 6. Monitoring and Alerting
Infrastructure performance and availability are continuously monitored using Cloudflare Analytics and integrated error logging tools. Alerts are configured to notify the development team of downtime, performance degradation, or unusual traffic patterns affecting the application's intended use.

## 7. Infrastructure Change Control
Changes to the production infrastructure configuration (e.g., modifying worker routes, changing database schemas) are treated as software changes and are managed through the Document Control Procedure (QMS-4.2.4-01) and Software Configuration Management in the Software Lifecycle Plan (QMS-62304-01).

## 8. Business Continuity and Disaster Recovery
As a cloud-native serverless application, high availability is inherently provided. However, disaster recovery plans include automated database backups (D1, KV) and the ability to redeploy the entire application stack from GitHub repositories using CI/CD pipelines to mitigate catastrophic infrastructure failure.

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

