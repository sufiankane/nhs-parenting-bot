# Software Validation Procedure (QMS Tools)

| Attribute | Details |
| :--- | :--- |
| Document ID | QMS-4.1.6-01 |
| Title | Software Validation Procedure (QMS Tools) |
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
This procedure defines the requirements for the validation of computer software used in the Quality Management System (QMS) at «[INSERT: Organisation Name]», ensuring compliance with ISO 13485:2016 (Clause 4.1.6). 

This procedure applies **only** to software tools used to implement, support, or manage the QMS (e.g., document control, record management, issue tracking, CAPA tracking). It does **not** apply to the Naomi Software as a Medical Device (SaMD) itself, which is validated according to IEC 62304 and the product realisation processes.

**In-Scope Tools typically include:**
- GitHub (Version Control, Document Management, Issue Tracking)
- CI/CD Runners (GitHub Actions)
- Electronic Spreadsheets used for critical QMS calculations or tracking (e.g., Risk Registers)
- Cloudflare deployment management tools (Wrangler CLI)

# 2. Risk-Based Approach to Validation Effort
The extent of validation is proportionate to the risk associated with the use of the software. A software tool risk assessment is conducted prior to validation to determine the required effort.
- **Low Risk:** Tools that have no direct impact on product quality or patient safety, or where errors are easily detected by subsequent manual checks (e.g., standard word processors). Validation requires only documentation of the intended use and a brief functional check.
- **Medium/High Risk:** Tools that automate critical QMS processes, maintain electronic signatures, or compile source code without secondary independent checks (e.g., CI/CD pipelines, automated testing frameworks). Requires formal validation following IQ/OQ principles.

Commercial Off-The-Shelf (COTS) software widely used in the industry (e.g., standard GitHub) leverages vendor validation, reducing the internal burden, but still requires validation of the specific configuration used by the organisation.

# 3. Validation Protocol Template Reference
For tools requiring formal validation, a Validation Protocol must be developed and approved prior to execution. The protocol outlines:
- Software description and version.
- Intended use and configuration settings.
- Required validation activities (IQ/OQ).
- Acceptance criteria.

# 4. Installation and Operational Qualification (IQ/OQ) Concepts
Because the organisation primarily utilises SaaS/Cloud infrastructure, traditional physical installation is rarely applicable.
- **Installation Qualification (IQ):** For cloud tools, IQ verifies that the correct version is accessible, necessary user accounts and permissions are established, and specific configurations (e.g., branch protection rules in GitHub) are properly applied as documented.
- **Operational Qualification (OQ):** OQ demonstrates that the software functions according to its intended use in the organisation's environment. This involves executing test cases that challenge the software's capabilities, including failure handling (e.g., verifying that a GitHub PR cannot be merged without required approvals).

# 5. Change Control for Validated Tools
Changes to validated software (e.g., major vendor updates, configuration changes, or workflow modifications) must be assessed for their impact on the validated state. 
- The QA Manager monitors vendor release notes for critical tools.
- If a change is deemed to impact the intended use or introduces new risks, a re-validation assessment is performed and documented, which may trigger partial or full re-execution of the validation protocol.

# 6. Records Required
The following records must be maintained in the QMS:
- Master List of QMS Software Tools (including risk classifications).
- Software Validation Protocols and Reports.
- Evidence of IQ/OQ execution (e.g., screenshots, configuration printouts, test logs).
- Change assessments for validated tools.

# 7. Terms and Definitions
*   **QMS Software:** Software applications, cloud services, scripts, or spreadsheets used to automate, control, or execute quality processes.
*   **Software Tool Validation:** Confirmation by examination and provision of objective evidence that the software consistently fulfills its specified requirements for intended use.
*   **Installation Qualification (IQ):** Documented verification that the tool is installed or configured in accordance with approved specifications.
*   **Operational Qualification (OQ):** Documented verification that the tool operates according to its operational specifications in the target environment.

# 8. Responsibilities
*   **Quality Manager:** Owns this validation procedure, approves validation protocols/reports, and maintains the Master List of QMS Software Tools.
*   **Lead Developer / DevOps:** Drafts protocols, configures QMS software environments, and executes IQ/OQ test scripts.

# 9. Inputs and Outputs
*   **Inputs:** Software tool vendor release notes, tool risk evaluations, QMS process requirements (e.g., PR branch protection rules).
*   **Outputs:** Validated QMS tool configurations, executed Validation Protocols and Reports per QMS-4.2.5-01.

