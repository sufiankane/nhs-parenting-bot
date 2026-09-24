# Document Control Procedure

| Attribute | Details |
| :--- | :--- |
| Document ID | QMS-4.2.4-01 |
| Title | Document Control Procedure |
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
This procedure defines the requirements for the creation, review, approval, distribution, modification, and obsolescence of controlled documents within the «[INSERT: Organisation Name]» Quality Management System (QMS). This ensures compliance with ISO 13485:2016 (Clause 4.2.4) and ensures that only current, approved versions of documents are used in the development and maintenance of the Naomi SaMD. This procedure is scoped to a Git-based workflow, leveraging GitHub as the primary electronic document management system.

# 2. Document Types Controlled
This procedure applies to all documents that form part of the QMS, including but not limited to:
- Quality Manual and Policy
- Standard Operating Procedures (SOPs)
- Work Instructions
- Forms and Templates
- Design History File (DHF) documents
- Medical Device File (Technical File)
- Risk Management documents

# 3. Document ID Naming Convention
All controlled QMS documents must be assigned a unique alphanumeric identifier following the format: `QMS-[Clause]-[Sequence]`.
- `QMS`: Identifies the document as part of the Quality Management System.
- `[Clause]`: The primary ISO 13485 clause to which the document relates (e.g., 4.2.4).
- `[Sequence]`: A two-digit sequential number starting at 01 (e.g., QMS-4.2.4-01).

# 4. Approval and Issue Process (GitHub Workflow)
Given the organisation's size and software-centric nature, document control is managed electronically via GitHub.
1. **Drafting:** Documents are drafted in Markdown (`.md`) format on a dedicated feature branch in the QMS repository.
2. **Review:** A Pull Request (PR) is created. The Author assigns a Reviewer/Approver.
3. **Approval:** Approval is executed via the GitHub PR review mechanism. A formal "Approve" action on the PR constitutes electronic signature and approval for issue.
4. **Issue (Merge):** Branch protection rules mandate that at least one approval is required before a PR can be merged into the `main` branch. The merge action issues the document, rendering it effective.

# 5. Distribution and Access
The `main` branch of the dedicated QMS GitHub repository represents the single source of truth for all current, effective documents.
- **Access Controls:** Read access is granted to all relevant personnel via GitHub teams. Write/Merge access is restricted to authorised personnel (e.g., QA Manager, senior engineers).
- **Distribution:** Personnel are notified of significant document updates via internal communication channels (e.g., Slack, email).

# 6. Changes and Re-approval
Changes to existing documents follow the identical process as initial creation (Branch -> PR -> Review -> Approve -> Merge). 
- The Revision History table within the document must be updated to reflect the new version number, date, author, and a description of the change.
- Major changes increment the integer version (e.g., 1.0 to 2.0). Minor/draft changes increment the decimal (e.g., 0.1 to 0.2).

# 7. Obsolete Document Control
When a document is entirely superseded or no longer required, it is moved to an `/obsolete` directory within the repository, or clearly marked with an "OBSOLETE" watermark/header. GitHub's version control inherently preserves the history and content of all prior versions, fulfilling regulatory requirements for retaining obsolete documents to prevent unintended use.

# 8. External Documents
External documents essential to the QMS or product realisation (e.g., NHS DTAC guidance, MHRA regulatory updates, ISO standards) are tracked in an External Document Register (a controlled spreadsheet or list). The QA Manager is responsible for periodically reviewing this register to ensure the latest versions are in use and evaluating the impact of any changes on the Naomi QMS.

# 9. Responsibilities
- **Author:** Responsible for drafting accurate content and addressing review feedback.
- **Approver (e.g., QA Manager / Tech Lead):** Responsible for verifying the document's adequacy, compliance, and accuracy prior to PR approval.
- **QA Manager:** Overall responsibility for the maintenance of the document control system and GitHub repository configurations.

# 10. Records Generated
- GitHub Pull Request history (serving as electronic review and approval records per QMS-4.2.5-01).
- Document Revision History tables.
- External Document Register.

# 11. Terms and Definitions
*   **Controlled Document:** Any document specifying QMS policies, processes, procedures, or specifications subject to version tracking and formal approval.
*   **Obsolete Document:** A document version that has been superseded by a newer approved release.
*   **Electronic Signature:** A legally recognized digital approval mechanism executed via verified GitHub authentication and pull request review approval.

# 12. Inputs and Outputs
*   **Inputs:** Draft markdown documents, regulatory updates (UK MDR 2002, ISO 13485:2016), CAPA improvement requests (QMS-8.5-01).
*   **Outputs:** Approved, effective, version-controlled markdown procedures merged into the git repository main branch.

