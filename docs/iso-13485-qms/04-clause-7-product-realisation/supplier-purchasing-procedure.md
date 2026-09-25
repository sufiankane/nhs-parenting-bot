# Supplier Purchasing Procedure
| Document ID | Title | Version | Status | Effective Date | Author | Approved By |
|---|---|---|---|---|---|---|
| QMS-7.4-01 | Supplier Purchasing Procedure | 0.2 | DRAFT | «[INSERT: TBD]» | «[INSERT: Name]» | «[INSERT: TBD]» |

### Revision History
| Version | Date | Author | Description of Changes |
|---|---|---|---|
| 0.1 | «[INSERT: Date]» | «[INSERT: Name]» | Initial Draft |
| 0.2 | 2026-09-25 | Quality & Technical Lead | Updated to reflect minimal hosting supplier footprint, supplier-agnostic architecture (no set supplier lists), NHS data/safety/cyber initial checklist, Cyber Essentials pre-requisite, and clarification that personal data is NOT anticipated to be stored on databases held by Naomi. |

## 1. Purpose and Scope
In accordance with ISO 13485:2016 Clause 7.4, this procedure establishes the requirements for the evaluation, selection, monitoring, and re-evaluation of suppliers for the Naomi AI chatbot. 

Current operational supplier engagements are **minimal and strictly related to hosting platforms** (e.g., edge compute runtimes, serverless hosting, and cloud networking infrastructure). Furthermore, the Naomi technology stack is intentionally designed to be **supplier-agnostic**, relying on portable runtimes and standard web APIs rather than proprietary lock-in.

Consequently, **there are no fixed or set supplier lists**. Instead, any hosting or infrastructure platform considered for the system must undergo an initial evaluation checklist prior to procurement or integration.

Crucially, **personal data is NOT anticipated to be stored on databases held by Naomi**. System architecture adheres to strict data minimisation and ephemeral processing principles; thus, purchasing controls focus on platform resilience, network security, and compliance with national health standards.

## 2. Supplier Evaluation Criteria & Prerequisites

### 2.1 Cyber Security Essentials Pre-requisite
Holding **Cyber Essentials** (or Cyber Essentials Plus / certified equivalent, such as ISO 27001 or SOC 2 Type II with UK-aligned controls) is a mandatory **pre-requisite** for any supplier providing hosting platforms or runtime services to Naomi. Suppliers unable to satisfy this baseline cyber security prerequisite shall not be onboarded.

### 2.2 Core Evaluation Criteria
Suppliers are evaluated against their ability to meet the organisation's technical and regulatory benchmarks:
*   **Cyber Security & Resilience:** Verification of Cyber Essentials pre-requisite, patch management cadence, DDoS protection, and secure configuration baselines.
*   **NHS Alignment:** Alignment with NHS Digital Technology Assessment Criteria (DTAC) and Data Security and Protection Toolkit (DSPT) principles.
*   **Infrastructure Reliability & SLAs:** Guaranteed availability (minimum 99.9% uptime target), latency benchmarks, and disaster recovery capabilities.
*   **Data Boundaries & Privacy:** Strict contractual terms confirming that ephemeral data passing through the hosting infrastructure is neither permanently stored, mined, nor utilized for external model training.
*   **Architectural Neutrality:** Adherence to open standards ensuring Naomi's workloads remain portable and supplier-agnostic.

## 3. Supplier-Agnostic Architecture & Initial Evaluation Checklist

Because the application is designed to be supplier-agnostic, the organisation avoids static vendor dependence. Rather than maintaining a rigid Approved Supplier List (ASL), **all prospective suppliers must go through an initial checklist aligning to NHS data, safety, and cyber requirements** prior to use in development or production.

### 3.1 Initial Supplier Qualification Checklist (NHS Data, Safety & Cyber)

| Checklist Item | Requirement / Standard | Verification Evidence | Status |
|---|---|---|---|
| **1. Cyber Security (Pre-requisite)** | Valid **Cyber Essentials** or Cyber Essentials Plus certification (or validated ISO 27001 / SOC 2 Type II). | Certificate number, badge, or independent audit report. | Mandatory Pre-req |
| **2. Technical Cyber Security** | Strong encryption in transit (TLS 1.2 / TLS 1.3 enforced) and at rest; automated vulnerability scanning; DDoS mitigation. | Platform architecture whitepaper, pen test summary, or technical review. | Pass / Fail |
| **3. NHS Data Protection Alignment** | Confirmation of UK/EEA data transit boundaries, UK GDPR compliance, and alignment with NHS DSPT expectations. | Data Processing Agreement (DPA) / standard terms review. | Pass / Fail |
| **4. Database & Personal Data Check** | Confirmation that **personal data is NOT anticipated to be stored on databases held by Naomi**; hosting platform only handles transient/stateless processing. | Architecture verification & configuration audit. | Pass / Fail |
| **5. NHS Clinical Safety Alignment (DCB0129)** | Documented service reliability, high availability (>= 99.9% SLA), automated incident notifications, and clear maintenance windows. | SLA terms, public incident history, status monitoring feed. | Pass / Fail |
| **6. Supplier Agnosticism & Portability** | Infrastructure utilizes standard runtimes (e.g., standard JavaScript/W3C Workers, POSIX-compliant compute, standard REST/JSON APIs) ensuring zero proprietary lock-in. | Technical Lead architecture evaluation. | Pass / Fail |

A supplier must achieve a "Pass" on all checklist items, with the Cyber Essentials pre-requisite verified, before deployment into the active environment.

## 4. Supplier Classification and Purchasing Controls
Given Naomi's lean architecture, suppliers are classified as follows:
*   **Hosting & Runtime Infrastructure (Critical):** Core hosting platforms executing application logic and handling live traffic. While suppliers are kept minimal and interchangeable, any active hosting provider is governed as critical infrastructure, requiring full completion of the Initial NHS Checklist, SLA monitoring, and verification of security credentials.
*   **Ancillary Development Tooling (Non-Critical):** Offline developer utilities, code repositories, or communication tools that do not process runtime traffic. Governed by standard commercial terms and baseline access controls.

## 5. Verification of Purchased Services
To ensure active hosting platforms continually meet specified requirements:
*   **Continuous Runtime Monitoring:** Automated monitoring of endpoint uptime, latency, and error rates via independent synthetic checks.
*   **Cyber Security Verification:** Periodic verification that the supplier's Cyber Essentials certification or equivalent security attestations remain valid and active.
*   **Configuration Audits:** Regular reviews confirming that no persistent personal data storage has been accidentally introduced or enabled on hosting databases.
*   **Penetration Testing:** Annual independent IT Health Check (ITHC) / Penetration test covering the hosted environment in accordance with NHS DTAC guidelines.

## 6. Data Protection and Personal Data Boundaries
By architectural design, **personal data is NOT anticipated to be stored on databases held by Naomi**. Naomi functions statelessly with conversational prompts processed in-memory for the duration of the request.

However, to guarantee complete data sovereignty and satisfy UK GDPR / NHS data requirements:
*   Standard Data Processing Agreements (DPAs) or contractual data protection terms are executed with hosting providers.
*   These agreements must strictly prohibit the vendor from logging, caching, storing, or using user prompts or system responses for any purpose beyond transient transmission and immediate compute execution.

## 7. Re-evaluation Schedule
Active hosting platforms shall be re-evaluated annually or upon significant infrastructure change. Re-evaluation includes:
*   Confirmation of renewed Cyber Essentials / security certifications.
*   Annual review of SLA performance and uptime statistics.
*   Confirmation of ongoing supplier-agnostic compatibility and absence of stored personal data.

## 8. Records
The following purchasing records shall be maintained under QMS-4.2.5-01 (Record Control Procedure):
*   Completed Initial Supplier Qualification Checklists (NHS Data, Safety & Cyber).
*   Cyber Essentials / ISO 27001 / SOC 2 certificates for hosting providers.
*   Executed DPAs / hosting terms of service.
*   Performance monitoring logs, SLA review records, and annual re-evaluation summaries.

## 9. Terms and Definitions
*   **Cyber Essentials:** UK Government-backed cybersecurity certification scheme demonstrating baseline protection against common cyber threats.
*   **Supplier Agnostic:** Architectural design principle ensuring software is decoupled from proprietary vendor APIs and can be deployed across alternative hosting platforms without major refactoring.
*   **Data Minimisation:** Principle under UK GDPR ensuring that only the minimum necessary data is processed, with zero persistent personal data stored on application databases.
*   **Hosting Platform:** External provider of cloud infrastructure, serverless compute, or edge network runtimes.

## 10. Responsibilities
*   **Quality Manager:** Oversees compliance with ISO 13485 Clause 7.4, verifies completion of the Initial Supplier Qualification Checklist, and maintains purchasing records.
*   **Technical Lead:** Validates supplier-agnostic architecture, assesses technical cyber controls, verifies Cyber Essentials pre-requisite, and monitors hosting performance.
*   **Clinical Safety Officer (CSO):** Evaluates hosting reliability against DCB0129 clinical risk thresholds to ensure infrastructure downtime does not introduce clinical hazard.
*   **Data Protection Officer (DPO):** Verifies data boundary terms, ensuring no persistent personal data is stored on databases and UK GDPR/NHS data requirements are satisfied.

## 11. Inputs and Outputs
*   **Inputs:** Technical hosting requirements, Cyber Essentials certificates, NHS DTAC/DSPT criteria, DCB0129 clinical safety requirements.
*   **Outputs:** Completed and signed Initial Supplier Checklists, verified DPAs, hosting monitoring logs, and annual re-evaluation records.

