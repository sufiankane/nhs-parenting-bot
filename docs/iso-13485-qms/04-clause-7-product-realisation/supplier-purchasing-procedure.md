# Supplier Purchasing Procedure
| Document ID | Title | Version | Status | Effective Date | Author | Approved By |
|---|---|---|---|---|---|---|
| QMS-7.4-01 | Supplier Purchasing Procedure | 0.1 | DRAFT | «[INSERT: TBD]» | «[INSERT: Name]» | «[INSERT: TBD]» |

### Revision History
| Version | Date | Author | Description of Changes |
|---|---|---|---|
| 0.1 | «[INSERT: Date]» | «[INSERT: Name]» | Initial Draft |

## 1. Purpose and Scope
In accordance with ISO 13485:2016 Clause 7.4, this procedure establishes the requirements for the evaluation, selection, monitoring, and re-evaluation of suppliers for the Naomi AI chatbot. The scope encompasses the purchasing of cloud services, Artificial Intelligence (AI) Application Programming Interfaces (APIs), software tools, and NHS medical content licences that affect the quality, safety, or performance of the Naomi Software as a Medical Device (SaMD).

## 2. Supplier Evaluation Criteria
Suppliers shall be evaluated based on their ability to supply products and services in accordance with the organisation's requirements. Evaluation criteria include:
*   **Quality Management System (QMS):** Compliance with ISO 13485, ISO 9001, or equivalent quality standards.
*   **Information Security & Privacy:** Certifications such as ISO 27001 or SOC 2 Type II, ensuring robust data protection practices.
*   **Data Processing Agreements (DPAs):** Willingness and capability to execute DPAs compliant with UK GDPR.
*   **Service Level Agreements (SLAs):** Guaranteed uptime, latency, and support responsiveness suitable for a medical device.
*   **Technical Capability:** Demonstrated reliability, scalability, and performance of cloud infrastructure or AI models (e.g., LLaMA 3.1).

## 3. Approved Supplier List (ASL)
The organisation maintains an Approved Supplier List. Currently approved critical suppliers include:

| Supplier | Provided Product/Service | Criticality | Justification / Qualification |
|---|---|---|---|
| Cloudflare Inc. | Production hosting (Workers), AI API (Cloudflare AI), Storage (Vectorize, D1, KV) | Critical | ISO 27001 certified, SOC 2 compliant, DPAs executed, high-availability SLAs. |
| GitHub (Microsoft) | Version control, CI/CD pipelines, source code hosting | Critical | SOC 2 Type II, industry-standard source control, secure enterprise features. |
| «[INSERT: NHS Digital or content supplier]» | Authoritative medical and clinical content | Critical | Mandated NHS standard, required for DTAC compliance and clinical validity. |

## 4. Supplier Classification and Purchasing Controls
Suppliers are categorised by their impact on product quality and safety:
*   **Critical Suppliers:** Suppliers providing services that directly impact the safety, clinical functionality, or data integrity of Naomi (e.g., Cloudflare, GitHub, NHS content). These require documented evaluations, formal SLAs, executed DPAs, and continuous performance monitoring.
*   **Non-Critical Suppliers:** Suppliers providing ancillary tools (e.g., internal communication software) that do not directly affect the SaMD. These require baseline business checks and general service agreements.

Purchasing information provided to critical suppliers must clearly define the specifications, requirements for qualification, and relevant QMS prerequisites.

## 5. Verification of Purchased Services
To ensure purchased services meet specified purchasing requirements, the organisation conducts continuous and periodic verification activities:
*   **Automated Monitoring:** Continuous monitoring of Cloudflare uptime, API latency, and error rates via automated observability tools.
*   **SLA Tracking:** Monthly review of critical supplier SLA reports to ensure adherence to uptime commitments.
*   **Penetration Testing:** Annual independent penetration testing to verify the security of the hosting environment provided by the supplier.
*   **Content Verification:** Ongoing validation checks to ensure NHS content updates are accurately ingested and reflected in the system.

## 6. Data Processing Agreements (DPA)
As Naomi processes personal and potentially special category health data, a UK GDPR-compliant Data Processing Agreement (DPA) is a mandatory purchasing prerequisite for any supplier acting as a data processor. No critical data processing service shall be engaged without a fully executed DPA.

## 7. Re-evaluation Schedule
Critical suppliers shall be re-evaluated annually. This re-evaluation assesses SLA adherence, security audit reports (e.g., updated SOC 2 reports), incident history, and continuing compliance with UK GDPR and ISO 13485 requirements. Non-conformities identified during supplier monitoring may trigger an immediate, unscheduled re-evaluation.

## 8. Records
The following records shall be maintained (ISO 13485 Clause 4.2.5 and QMS-4.2.5-01):
*   Supplier Evaluation and Selection forms.
*   The Approved Supplier List (ASL).
*   Executed DPAs and SLAs.
*   Supplier re-evaluation reports and performance monitoring logs.

## 9. Terms and Definitions
*   **Critical Supplier:** A supplier whose product or service directly affects medical device performance, clinical safety, data integrity, or regulatory compliance.
*   **Data Processing Agreement (DPA):** Legally binding contract required under UK GDPR defining the rights and obligations of the data controller and data processor.
*   **Service Level Agreement (SLA):** Contractual commitment defining service performance benchmarks, uptime targets, and remedy procedures.

## 10. Responsibilities
*   **Quality Manager:** Owns the supplier qualification process, conducts annual re-evaluations, and maintains the Approved Supplier List.
*   **Lead Developer:** Evaluates supplier technical capabilities and monitors ongoing API performance and latency.
*   **Data Protection Officer:** Reviews and negotiates Data Processing Agreements to ensure UK GDPR compliance (QMS-REG-03).

## 11. Inputs and Outputs
*   **Inputs:** Technical specifications for hosting/AI/content, supplier security audit reports (SOC 2, ISO 27001), regulatory mandates.
*   **Outputs:** Qualified Approved Supplier List, executed DPAs and contracts, verified supplier service delivery logs.

