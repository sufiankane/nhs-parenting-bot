# QMS-7-04: Internal Audit Checklist

| Document ID | QMS-7-04 |
|-------------|------------|
| Title | Internal Audit Checklist (ISO 13485 & UK Overlays) |
| Version | 0.1 |
| Status | DRAFT |
| Effective Date | «[INSERT: TBD]» |
| Author | «[INSERT: Name]» |
| Approved By | «[INSERT: TBD]» |

## Revision History
| Version | Date | Author | Description of Changes |
|---------|------|--------|------------------------|
| 0.1 | «[INSERT: Date]» | «[INSERT: Name]» | Initial draft |

---
**Audit Date:** ___________  **Auditor(s):** ___________ **Auditee(s):** ___________

*Finding Codes: C = Conformant, OBS = Observation, MIN = Minor Nonconformance, MAJ = Major Nonconformance*

| # | Clause / Req | Audit Question | Evidence Required / Checked | Finding | Notes / CAPA Ref |
|---|--------------|----------------|-----------------------------|---------|------------------|
| **Clause 4: Quality Management System** |
| 1 | 4.1.1 | Are QMS processes defined, implemented, and maintained? | Quality Manual, Process maps | | |
| 2 | 4.1.2 | Is a risk-based approach applied to control QMS processes? | Risk Management Plan/SOP | | |
| 3 | 4.1.6 | Has software used in the QMS been validated? (e.g. Jira, GitHub) | Software Validation Records | | |
| 4 | 4.2.1 | Does the QMS documentation include a quality policy and objectives? | Quality Manual | | |
| 5 | 4.2.3 | Is there a documented Medical Device File for Naomi? | Technical File Index | | |
| 6 | 4.2.4 | Are documents properly controlled, reviewed, and approved? | Document Control SOP, Samples | | |
| 7 | 4.2.5 | Are records legible, readily identifiable, and retrievable? | Record Retention SOP, Samples | | |
| **Clause 5: Management Responsibility** |
| 8 | 5.1 | Is there evidence of management commitment to the QMS? | Mgmt Review Minutes | | |
| 9 | 5.3 | Is the Quality Policy communicated and understood? | Employee interviews | | |
| 10 | 5.4.1 | Are measurable quality objectives established? | Quality Objectives log | | |
| 11 | 5.5.1 | Are roles, responsibilities, and authorities defined? | Org Chart, Job Descriptions | | |
| 12 | 5.5.2 | Has a Management Representative been appointed? | Appointment letter/Manual | | |
| 13 | 5.6.2 | Do management reviews occur at planned intervals with all required inputs? | MR Minutes Template/Records | | |
| 14 | 5.6.3 | Are outputs from management reviews recorded (actions/decisions)? | MR Minutes Records | | |
| **Clause 6: Resource Management** |
| 15 | 6.2 | Are personnel performing work affecting product quality competent? | Competency Matrix | | |
| 16 | 6.2 | Are training records maintained for all staff? | Training Records | | |
| 17 | 6.3 | Is infrastructure (hardware/software/cloud) adequately documented/maintained?| Infrastructure map, Cloudflare logs| | |
| 18 | 6.4.1 | Is the work environment suitable to achieve conformity? | Remote work policies | | |
| **Clause 7: Product Realisation (incl. IEC 62304)** |
| 19 | 7.1 | Is risk management documented throughout product realisation? | ISO 14971 Risk File | | |
| 20 | 7.2.1 | Are customer and regulatory requirements determined? | Requirements Spec | | |
| 21 | 7.3.2 | Is design and development planning documented? (IEC 62304 5.1) | Software Dev Plan | | |
| 22 | 7.3.3 | Are design inputs clearly defined, unambiguous, and verifiable? | Software Req Spec (SRS) | | |
| 23 | 7.3.4 | Are design outputs verified against inputs? | Traceability Matrix | | |
| 24 | 7.3.5 | Are design reviews conducted systematically? | Design Review Minutes | | |
| 25 | 7.3.6 | Is design verification performed and recorded? (Testing) | Test Reports, CI/CD logs | | |
| 26 | 7.3.7 | Is design validation performed? (Clinical Evaluation/Usability) | Clin Eval Report, IEC 62366 | | |
| 27 | 7.3.9 | Are design changes controlled, verified, and validated? | Change Control Log | | |
| 28 | 7.4.1 | Are suppliers evaluated and selected based on criteria? (e.g. LLM provider)| Approved Supplier List | | |
| 29 | 7.4.2 | Is purchasing information accurate and complete? | Vendor Agreements | | |
| 30 | 7.5.1 | Is production (deployment) controlled? | Deployment SOP | | |
| 31 | 7.5.6 | Are processes for production validated if output cannot be fully verified? | Cloudflare deployment scripts | | |
| 32 | 7.5.8 | Is product (code/versions) uniquely identified and traceable? | Git commit history, tags | | |
| **Clause 8: Measurement, Analysis and Improvement** |
| 33 | 8.2.1 | Is feedback gathered from users post-market? | PMS Plan, App Analytics | | |
| 34 | 8.2.2 | Is there a documented procedure for complaint handling? | Complaint Handling SOP | | |
| 35 | 8.2.3 | Is there a procedure for regulatory reporting (Adverse Events)? | Vigilance SOP | | |
| 36 | 8.2.4 | Are internal audits planned and conducted effectively? | Audit Schedule/Reports | | |
| 37 | 8.3.1 | Is nonconforming product (bugs/incidents) identified and controlled? | Issue Tracker (Jira/GitHub) | | |
| 38 | 8.4 | Is data analysed to demonstrate QMS suitability and effectiveness? | Data Analysis Report | | |
| 39 | 8.5.2 | Are corrective actions taken to eliminate causes of nonconformities? | CAPA Log | | |
| 40 | 8.5.3 | Are preventive actions taken to eliminate causes of potential nonconformities?| CAPA Log | | |
| **UK / NHS Specific (UKCA, DTAC, DPIA)** |
| 41 | UK MDR | Is the device properly classified and registered with MHRA? | QMS-REG-01, MHRA portal | | |
| 42 | DCB0129| Is a Clinical Safety Officer appointed and Hazard Log maintained? | CSO credentials, Hazard Log | | |
| 43 | DTAC | Is the DTAC criteria mapped and met? | QMS-REG-02 | | |
| 44 | UK GDPR| Is the DPIA completed and reviewed by the DPO? | QMS-REG-03 | | |
