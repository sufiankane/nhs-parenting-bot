# Design History File (DHF) Index

| Document ID | Title | Version | Status | Effective Date | Author | Approved By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| QMS-7.3.10-01 | Design History File Index | 0.1 | DRAFT | «[INSERT: TBD]» | «[INSERT: Name]» | «[INSERT: TBD]» |

## Revision History
| Version | Date | Description of Changes | Author |
| :--- | :--- | :--- | :--- |
| 0.1 | «[INSERT: Date]» | Initial Draft | «[INSERT: Name]» |

## 1. Purpose of the DHF
The purpose of the Design History File (DHF) is to demonstrate that the design of the Naomi SaMD was developed in accordance with the approved design plan and the requirements of ISO 13485:2016 (Clause 7.3.10) and IEC 62304:2015. This index provides a centralised reference to all documents, records, and artifacts that constitute the design history of the Naomi application.

## 2. Instructions for Maintaining the DHF
- The Quality Assurance Specialist is responsible for maintaining and updating this DHF Index.
- As new design outputs are generated, reviewed, and approved, they must be added to this index.
- All documents referenced herein must be stored securely in the organisation's controlled document repository (e.g., GitHub with strict access controls).
- Code artifacts and configurations are maintained in the corporate GitHub repository under branch protection rules.

## 3. DHF Index Table

| Phase / Category | Document/Record Name | Document ID | Version | Status | Date | Location |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Planning** | Software Lifecycle Plan | QMS-62304-01 | 0.1 | DRAFT | «[INSERT: Date]» | QMS / Clause 7 |
| **Planning** | Risk Management Plan | QMS-14971-01 | 0.1 | DRAFT | «[INSERT: Date]» | QMS / Clause 7 |
| **Inputs** | Software Requirements Specification | QMS-7.3.3-01 | «[TBD]» | «[TBD]» | «[TBD]» | QMS / Clause 7 |
| **Design** | Software Architectural Design | QMS-7.3.4-01 | «[TBD]» | «[TBD]» | «[TBD]» | QMS / Clause 7 |
| **Risk** | Risk Management File | QMS-14971-02 | 0.1 | DRAFT | «[INSERT: Date]» | QMS / Clause 7 |
| **Verification**| Software Verification Protocol | QMS-7.3.6-01 | «[TBD]» | «[TBD]» | «[TBD]» | QMS / Clause 7 |
| **Verification**| Software Verification Report | QMS-7.3.6-01 | «[TBD]» | «[TBD]» | «[TBD]» | QMS / Clause 7 |
| **Validation** | Clinical Evaluation Report (Validation) | QMS-7.3.7-01 | «[TBD]» | «[TBD]» | «[TBD]» | QMS / Clause 7 |
| **Release** | Software Release Note | QMS-7.3.1-01 | «[TBD]» | «[TBD]» | «[TBD]» | QMS / Clause 7 |

## 4. Software Configuration Items List
The Naomi SaMD consists of the following managed configuration items (maintained in GitHub):
- Cloudflare Worker Scripts (TypeScript)
- Vectorize index generation scripts
- D1 Database schema definitions
- Cloudflare KV bindings and configuration (`wrangler.toml`)
- RAG pipeline processing modules
- LLaMA 3.1 LLM prompt templates and safety wrappers
- Automated test suites (Jest/Vitest)
- Infrastructure as Code (IaC) deployment workflows (GitHub Actions)

## 5. Change History Summary
(This section will summarise major design changes occurring post-initial release. Changes will be recorded via Engineering Change Orders (ECOs) as per ISO 13485 Clause 7.3.9.)

| ECO Number | Date | Description of Change | Impact Assessment Ref |
| :--- | :--- | :--- | :--- |
| N/A | N/A | Initial Development - No changes yet. | N/A |

## 6. Scope and Applicability
This DHF applies to all versions and releases of the Naomi application software, maintaining the complete chronological design record.

## 7. Terms and Definitions
*   **Design History File (DHF):** Compilation of records describing the design history of a finished medical device.
*   **Configuration Item (CI):** An aggregation of hardware, software, or both, that is designated for configuration management.

## 8. Responsibilities
*   **Quality Manager:** Maintains the DHF index and verifies completeness of records before each software release.
*   **Lead Developer:** Submits design outputs, code snapshots, build logs, and test results for inclusion in the DHF.

## 9. Inputs and Outputs
*   **Inputs:** All design stage records generated under QMS-7.3.1-01 through QMS-7.3.7-01 and QMS-14971-02.
*   **Outputs:** Audit-ready Design History File demonstrating compliance with ISO 13485 (Clause 7.3.10) and IEC 62304.

## 10. Records Generated
*   DHF Index Master Record (QMS-7.3.10-01).
*   Release Baselines and Engineering Change Orders.

