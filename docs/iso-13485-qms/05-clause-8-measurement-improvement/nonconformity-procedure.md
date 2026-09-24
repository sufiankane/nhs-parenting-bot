# Nonconformity Procedure
| Document ID | Title | Version | Status | Effective Date | Author | Approved By |
|---|---|---|---|---|---|---|
| QMS-8.3-01 | Nonconformity Procedure | 0.1 | DRAFT | «[INSERT: TBD]» | «[INSERT: Name]» | «[INSERT: TBD]» |

### Revision History
| Version | Date | Author | Description of Changes |
|---|---|---|---|
| 0.1 | «[INSERT: Date]» | «[INSERT: Name]» | Initial Draft |

## 1. Purpose and Scope
In accordance with ISO 13485:2016 Clause 8.3, this procedure describes the process for identifying, controlling, and dispositioning nonconforming products and processes. Because Naomi is a Software as a Medical Device (SaMD), this procedure specifically governs software defects, deviations from design outputs, and procedural non-compliances.

## 2. Definition of Nonconformity in SaMD
A nonconformity in the context of Naomi includes:
*   **Software Defects (Bugs):** Code behaving in a manner contrary to documented software requirements or design specifications.
*   **Testing Failures:** Unit, integration, or system tests failing during the CI/CD pipeline (GitHub Actions).
*   **AI Anomalies:** The AI model generating responses outside acceptable clinical safety parameters.
*   **Procedural Deviations:** Employees failing to follow documented QMS procedures (e.g., deploying code without mandatory peer review).

## 3. Identification Sources
Nonconformities can be identified via:
*   Pre-release software verification and validation testing.
*   Internal or external audits.
*   Post-market feedback, complaints, or adverse event reports.
*   Automated monitoring alerts (e.g., Cloudflare Workers throwing exceptions).

## 4. Immediate Containment Actions
Upon identification of a critical nonconformity affecting the live production environment, immediate containment (correction) is required to prevent unintended use. For Naomi, containment actions may include:
*   **Rollback:** Reverting the Cloudflare deployment to the last known safe version via Wrangler.
*   **Feature Disablement:** Using feature flags to dynamically disable the affected chatbot module.
*   **User Advisory:** Issuing a notice to users if safety is compromised.

## 5. Investigation and Disposition
All documented nonconformities must be evaluated to determine the disposition. The primary software dispositions are:
*   **Rework (Fix):** Writing a code patch, testing it, and deploying the correction to resolve the defect.
*   **Use As-Is (Known Anomaly):** Accepting a minor bug (e.g., a non-critical UI alignment issue) if documented justification proves it does not impact safety, performance, or usability. 
*   **Reject:** Discarding a proposed software feature or architectural change before deployment.

## 6. Link to CAPA
If a nonconformity indicates a systemic QMS failure, a recurring software defect trend, or a significant safety issue, the matter is escalated to the Corrective and Preventive Action (CAPA) Procedure (QMS-8.5-01) to identify and eliminate the root cause.

## 7. Records
Records of the nature of nonconformities, containment actions taken, the approved disposition (with justification for 'Use As-Is'), and the identity of the person authorising the disposition shall be maintained per QMS-4.2.5-01. In practice, software defect tracking systems (e.g., GitHub Issues) serve as the record repository, provided they maintain appropriate audit trails.

## 8. Terms and Definitions
*   **Nonconformity:** Non-fulfilment of a specified requirement.
*   **Containment:** Action taken to halt or mitigate the immediate impact of an active nonconformity before root cause analysis.
*   **Disposition:** Action to be taken to deal with an existing nonconforming product (e.g., rework, scrap/reject, concession/use as-is).

## 9. Responsibilities
*   **Lead Developer:** Initiates immediate technical containment (rollback or feature flag toggle), conducts technical investigation, and executes rework.
*   **Quality Manager:** Reviews nonconformity logs, authorizes dispositions, and determines CAPA escalation triggers (QMS-8.5-01).
*   **Clinical Safety Officer:** Evaluates clinical impact of software nonconformities and approves safety-related dispositions.

## 10. Inputs and Outputs
*   **Inputs:** Failed test runs, exception alerts, complaint investigation findings (QMS-8.2.2-01), audit nonconformity reports.
*   **Outputs:** Documented Nonconformity Reports (NCR), containment action records, disposition approvals, and escalated CAPA files (QMS-8.5-01).

