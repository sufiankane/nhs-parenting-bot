# Quality Manual

## Document Control

| Attribute | Detail |
| :--- | :--- |
| **Document ID** | QMS-4.2.2-01 |
| **Title** | Quality Manual |
| **Version** | 0.1 |
| **Status** | DRAFT |
| **Effective Date** | «[INSERT: TBD]» |
| **Author** | «[INSERT: Name]» |
| **Approved By** | «[INSERT: TBD]» |

### Revision History

| Version | Date | Author | Description of Changes |
| :--- | :--- | :--- | :--- |
| 0.1 | «[INSERT: Date]» | «[INSERT: Name]» | Initial Draft |

---

## 1. Introduction and Organisational Context (Clause 4.1)

«[INSERT: Organisation Name]», based in Nottingham, England, is a small software company specialising in digital health solutions. Our flagship product is the Naomi application, an AI-powered chatbot providing NHS-grounded guidance and tracking for parents and carers of children aged 0–5 in the UK. 

This Quality Manual (QM) outlines the Quality Management System (QMS) established by «[INSERT: Organisation Name]» to ensure the Naomi application consistently meets customer, regulatory, and statutory requirements, specifically those of the UK Medical Devices Regulations 2002 (UK MDR 2002) and alignment with NHS Digital Technology Assessment Criteria (DTAC). The QMS is designed in accordance with the requirements of ISO 13485:2016 (Medical devices — Quality management systems — Requirements for regulatory purposes).

## 2. Scope of the QMS (Clause 4.2.2.a)

The scope of this QMS encompasses the design, development, deployment, maintenance, and support of the Naomi Software as a Medical Device (SaMD) application. The QMS covers all activities conducted by «[INSERT: Organisation Name]» personnel related to this product, including the integration of cloud infrastructure (Cloudflare Workers), retrieval-augmented generation (RAG) pipelines, and third-party AI APIs.

### 2.1 Exclusions and Non-Applicable Clauses (Clause 1.2 & 4.2.2.a)

As a software-only company developing SaMD, several clauses of ISO 13485:2016 are not applicable to our operations. The documented justifications for these non-applications are as follows:

*   **Clause 6.4.2 (Contamination control):** Not applicable. The product is pure software; there is no physical manufacturing environment where product contamination can occur.
*   **Clause 7.5.2 (Cleanliness of product):** Not applicable. The product is software and cannot be physically cleaned.
*   **Clause 7.5.3 (Installation activities):** Not applicable. Naomi is a cloud-hosted Software as a Service (SaaS) application accessed via web or mobile interfaces; there is no physical installation of software on medical hardware or on-premises servers.
*   **Clause 7.5.4 (Servicing activities):** Not applicable. Software updates and bug fixes are handled under design and development changes (Clause 7.3.9) and problem resolution processes (IEC 62304), not physical servicing.
*   **Clause 7.5.5 (Particular requirements for sterile medical devices):** Not applicable. The product is not sterile.
*   **Clause 7.5.7 (Particular requirements for validation of processes for sterilization and sterile barrier systems):** Not applicable. The product is not sterilised.
*   **Clause 7.5.9.2 (Particular requirements for implantable medical devices):** Not applicable. The product is not implantable.
*   **Clause 7.5.11 (Preservation of product):** Not applicable. The product is software distributed electronically. Version control and backups ensure digital preservation, managed under Clause 4.2.4 (Control of records) and infrastructure processes, not physical preservation.

## 3. Interaction of QMS Processes (Clause 4.2.2.c)

The «[INSERT: Organisation Name]» QMS is built on a process approach, linking key activities to ensure continuous improvement and compliance. The core processes interact as follows:

1.  **Management Responsibility (Clause 5):** Top management provides resources, sets the Quality Policy, and reviews the QMS (Management Review) based on data from measurement and analysis.
2.  **Resource Management (Clause 6):** Ensures competent personnel, appropriate cloud infrastructure (Clause 6.3), and a suitable work environment to support product development.
3.  **Product Realisation (Clause 7):** The core lifecycle of the Naomi app. It begins with capturing customer and regulatory requirements (Clause 7.2), flows into Design and Development (Clause 7.3, governed by IEC 62304), risk management (ISO 14971), and concludes with deployment (Production and Service Provision, Clause 7.5) and management of third-party software vendors/APIs (Purchasing, Clause 7.4).
4.  **Measurement, Analysis, and Improvement (Clause 8):** Data from post-market surveillance (PMS), user feedback, audits, and software performance monitoring are analysed. Corrective and Preventive Actions (CAPA) are implemented to improve the product and the QMS, feeding back into Management Responsibility.

## 4. Quality Policy (Clause 5.3)

«[INSERT: Organisation Name]» is committed to providing safe, reliable, and evidence-based AI guidance for parents and carers through the Naomi application. We are dedicated to:
*   Complying with all applicable regulatory requirements (UK MDR 2002) and NHS standards (DTAC, DCB0129).
*   Maintaining the effectiveness of our Quality Management System through continuous monitoring and improvement.
*   Prioritising clinical safety, data privacy, and the security of our users' information.

*(Note: The full Quality Policy and its objectives are further detailed in document QMS-5.3-01).*

## 5. Reference to QMS Procedures (Clause 4.2.2.b)

This manual serves as the top-level document. The specific procedures required by ISO 13485:2016 and established by «[INSERT: Organisation Name]» are documented in separate Standard Operating Procedures (SOPs), which include, but are not limited to:

*   QMS-4.2.4-01: Document Control Procedure
*   QMS-4.2.5-01: Record Control Procedure
*   QMS-14971-01: Risk Management Plan (ISO 14971 integration)
*   QMS-7.3.1-01: Design and Development Plan (IEC 62304 integration)
*   QMS-7.4-01: Supplier Evaluation and Purchasing Procedure
*   QMS-8.2.1-01: Feedback Procedure
*   QMS-PMS-01: Post-Market Surveillance Plan
*   QMS-8.5-01: Corrective and Preventive Action (CAPA) Procedure

## 6. Terms and Definitions
*   **SaMD (Software as a Medical Device):** Software intended to be used for one or more medical purposes without being part of a hardware medical device.
*   **Top Management:** Individual or group of individuals who direct and control an organisation at the highest level (Chief Executive Officer / Managing Director).
*   **Quality Management Representative (QMR):** Member of management appointed with authority to ensure QMS processes are established and maintained.
*   **Clinical Safety Officer (CSO):** Qualified clinician responsible for clinical risk management under NHS standards DCB0129/DCB0160.
*   **UK MDR 2002:** The Medical Devices Regulations 2002 (SI 2002/618, as amended) governing medical device conformity in Great Britain.

## 7. Responsibilities and Authorities
*   **Top Management (CEO):** Ultimate accountability for the QMS, Quality Policy, and resource provision (Clause 5.1).
*   **Quality Manager / QMR:** Day-to-day oversight of QMS operations, internal audits, and reporting QMS performance to Top Management (Clause 5.5.2).
*   **Clinical Safety Officer (CSO):** Clinical risk governance, clinical hazard log maintenance, and NHS DTAC alignment.
*   **Lead Developer:** Technical implementation of software development lifecycle controls, CI/CD verification, and cloud infrastructure security.

## 8. Inputs and Outputs
*   **Inputs:** Statutory and regulatory requirements (UK MDR 2002, ISO 13485:2016, NHS DTAC), user requirements from UK parents/carers, clinical guidelines from the NHS, organizational strategy.
*   **Outputs:** Certified, compliant Quality Management System, verified and validated Naomi SaMD releases, audit records, and post-market safety assessments.

## 9. Records Generated
*   Annual Management Review Minutes (QMS-7-05).
*   Internal Audit Reports and Checklists (QMS-7-04).
*   Controlled Document Approval Records (GitHub pull requests and tag releases per QMS-4.2.4-01).

