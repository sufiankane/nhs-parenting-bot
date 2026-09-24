# Quality Management System Scope and Processes

| Attribute | Details |
| :--- | :--- |
| Document ID | QMS-4.1-01 |
| Title | Quality Management System Scope and Processes |
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
This document outlines the scope and core processes of the Quality Management System (QMS) established by «[INSERT: Organisation Name]» for the Naomi application, in accordance with ISO 13485:2016 (Clause 4.1). The QMS is specifically scoped to the design, development, deployment, and post-market surveillance of the Naomi Software as a Medical Device (SaMD). Naomi is an AI-powered chatbot designed to provide NHS-grounded guidance for parents and carers of children aged 0–5 in the UK. 

This document defines the process interactions, criteria for effective operation, resource availability, and monitoring mechanisms required to ensure regulatory compliance under the UK Medical Devices Regulations 2002 (UK MDR 2002) and NHS Digital Technology Assessment Criteria (DTAC).

# 2. Process Map Description
The QMS comprises a network of interacting processes, scaled appropriately for a small software organisation (<20 employees) utilising a cloud-based serverless architecture (Cloudflare Workers). The core processes are categorised as follows:

## 2.1 Management Responsibility (Clause 5)
Management processes provide the overarching governance structure. This includes establishing quality policy, quality objectives, management reviews, and ensuring the availability of necessary resources.

## 2.2 Resource Management (Clause 6)
Ensures the provision of competent personnel, adequate infrastructure (including development environments, cloud infrastructure, and CI/CD pipelines), and an appropriate work environment to achieve conformity to product requirements.

## 2.3 Product Realisation (Clause 7)
This is the core software lifecycle, encompassing:
- **Design and Development:** Iterative development using TypeScript, LLM integration (LLaMA 3.1), and RAG pipeline construction. Governed by IEC 62304 and Agile methodologies.
- **Production (Deployment):** Automated build and deployment processes using Wrangler CLI, GitHub Actions, and Vitest testing frameworks.

## 2.4 Measurement, Analysis, and Improvement (Clause 8)
Mechanisms to ensure continuous compliance and product safety, including:
- **Post-Market Surveillance (PMS):** Active and passive data collection, user feedback, and adverse event reporting.
- **Internal Audits and CAPA:** Identifying nonconformities and driving corrective and preventive actions.

# 3. Process Interactions and Sequence
The processes interact continuously in an iterative lifecycle. Management responsibility sets the strategic direction, informing resource allocation. Resource management feeds into product realisation, providing the infrastructure and personnel to develop the Naomi application. The outputs of product realisation are monitored through measurement and analysis, feeding data back into management review and CAPA processes for continuous improvement.

# 4. Criteria and Methods for Effective Operation
Effectiveness is determined through specific criteria and methods:
- **Design & Development:** Passing automated test suites (Vitest), successful peer reviews via GitHub Pull Requests, and signed-off design reviews.
- **Deployment:** Successful execution of CI/CD pipelines without critical warnings, and validated post-deployment health checks.
- **PMS:** Timely review of user feedback logs and system performance metrics (e.g., latency, LLM response relevance) within defined SLAs.

# 5. Availability of Resources and Information
«[INSERT: Organisation Name]» ensures resources are available to support the operation and monitoring of these processes. This includes:
- Access to Cloudflare infrastructure and monitoring dashboards.
- Subscriptions to third-party NHS content APIs.
- Continuous training for personnel on ISO 13485, IEC 62304, and UK MDR requirements.

# 6. Monitoring, Measurement, and Analysis Plan
Processes are monitored using a combination of automated and manual methods:
- **Automated Monitoring:** System uptime, API error rates, and automated test coverage metrics.
- **Manual Measurement:** Periodic QMS audits, management reviews (at least annually), and routine evaluation of clinical performance and safety metrics.

# 7. Actions to Achieve Planned Results
If process monitoring reveals that planned results are not being achieved, actions will be initiated through the Corrective and Preventive Action (CAPA) process per QMS-8.5-01. This may include retraining staff, updating infrastructure, or revising QMS procedures to prevent recurrence and ensure ongoing compliance and safety of the Naomi SaMD.

# 8. Terms and Definitions
*   **QMS Process:** An interrelated set of activities transforming inputs into outputs under controlled conditions.
*   **Process Owner:** Person assigned operational responsibility and authority for managing a designated QMS process.
*   **Effectiveness:** The extent to which planned activities are realised and planned results are achieved.

# 9. Responsibilities
*   **Top Management:** Allocates resources and reviews overall QMS performance (QMS-5.6-01).
*   **Quality Manager:** Oversees process performance measurement, internal audits (QMS-8.2.4-01), and CAPA tracking (QMS-8.5-01).
*   **Lead Developer:** Owns Design and Realisation processes (QMS-7.3.1-01) and infrastructure maintenance (QMS-6.3-01).
*   **Clinical Safety Officer:** Oversees clinical safety monitoring and hazard review (QMS-14971-01, QMS-14971-02).

# 10. Inputs and Outputs
*   **Inputs:** Regulatory standards (ISO 13485:2016, UK MDR 2002, NHS DTAC), parent user needs, cloud platform capabilities (Cloudflare), clinical guidelines.
*   **Outputs:** Verified SaMD software releases, process metrics, audit findings, customer satisfaction feedback, CAPA implementations.

# 11. Records Generated
*   Process Monitoring Reports and CI/CD Build Logs.
*   Internal Audit Reports (QMS-7-04).
*   Management Review Minutes (QMS-7-05).

