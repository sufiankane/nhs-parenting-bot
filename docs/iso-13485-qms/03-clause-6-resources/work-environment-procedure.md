# Work Environment Procedure

| Attribute | Details |
| :--- | :--- |
| **Document ID** | QMS-6.4-01 |
| **Title** | Work Environment Procedure |
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
This procedure defines the requirements for managing the work environment at «[INSERT: Organisation Name]» to achieve conformity to product requirements for the Naomi software medical device, in accordance with ISO 13485 (Clause 6.4.1).

## 2. Justification of Applicability
As Naomi is a software-only medical device (SaMD) developed in an office and remote working setting, traditional manufacturing environmental controls (e.g., particulate controls, bioburden, temperature/humidity for product preservation) are **Not Applicable** (Clause 6.4.2). The work environment factors that affect product quality are limited to IT security, confidentiality, ergonomics, and staff wellbeing.

## 3. Remote Working and Office Controls
To ensure the work environment does not adversely affect the quality of the software code or compromise patient data:
- **Endpoint Security & Antivirus**: All IT equipment and developer workstations must have active antivirus and anti-malware protection (Microsoft Defender or approved equivalent) with regular virus scans to ensure no malware or Remote Access Trojans (RATs) are present.
- **Secure Connections & TLS**: All network connections must be routed through an authorised Virtual Private Network (VPN). All communication to GitHub and external development services must use encrypted TLS connections.
- **Repository Authentication & SSH Keys**: Dedicated SSH keys must be onboarded to GitHub to enforce secure, authenticated communication between local development computers and the code repository.
- **Disk Encryption**: Storage disks must be fully encrypted with BitLocker, enforcing hardware-enabled BitLocker (TPM-based encryption) where supported by the hardware.
- **Personal Data Isolation in Development**: Development environments must never contain, store, or have access to live personal or patient data. All development, debugging, and testing are conducted strictly using synthetic, mock, or de-identified data.
- **Environment Keys & Cloud Secrets Management**: Application environment keys and sensitive credentials are kept strictly off local endpoints and source repositories; all secrets are securely encrypted and managed in the cloud, preventing unauthorized interception during development usage.
- **Device Management**: Work must be conducted on company-approved devices complying with mobile device management (MDM) policy, including automatic screen locks and security update compliance.
- **Screen Privacy**: Personnel working in public spaces or shared remote environments must ensure screens are not visible to unauthorised individuals, particularly when handling source code, NHS-grounded clinical data, or personal data.


## 4. Psychosocial Factors and Wellbeing
Given the clinical nature of the Naomi application (providing guidance for parents/carers of children aged 0–5), personnel may occasionally interact with sensitive and distressing health topics. 
- «[INSERT: Organisation Name]» is committed to fostering a supportive work environment that mitigates emotional strain, stress, and fatigue, which are recognised as contributing factors to software defects.
- **Sensitive and Traumatic Content Handling**: When engineering prompts, datasets, or logic around highly sensitive or traumatic events (in particular suicide, depression, child loss, or maternal/infant crises), the Founder will proactively engage and consult any team members involved and take on this work directly where necessary to safeguard personnel wellbeing.
- **Current Staffing Context**: Currently, the organisation is operated solely by the Founder with no additional employees. This safeguard sets an explicit baseline protocol that will be enforced as personnel are hired.
- Management actively promotes open communication regarding mental health, manageable workloads, and mandatory breaks during intensive development cycles.


## 5. Human Factors, Usability, and Accessibility
The work environment where the product is developed is distinct from the end-user environment. Human factors and usability engineering (in accordance with IEC 62366-1) are embedded into the lifecycle to ensure Naomi is safe and effective for end users:
- **Development Phase and Platform Scope**: Naomi is currently in its initial development phases and may initially be deployed as a desktop application. 
- **Recurring Risk Review for Accessibility**: Although accessibility considerations are factored across design, the QMS enforces systematic usability reviews by maintaining a recurring risk entry in the Risk Management Log specifically focused on accessibility and human factors.
- **Accessibility Test Packs**: Dedicated accessibility test packs are executed to verify that target supported devices, display configurations, and interfaces can reliably access and interact with the application.
- **Device Change Control**: Any change to supported device specifications, hardware requirements, or target operating environments is formally evaluated and executed through the Design and Development Plan Change Control (QMS-7.3.1-01).

## 6. Records and Auditing
- **Record Retention**: Records related to work environment controls, workstation IT security verifications, accessibility test pack results, and ergonomic assessments shall be retained and controlled in accordance with the Record Control Procedure (QMS-4.2.5-01).
- **Annual Audit Frequency**: Audits and reviews of work environment controls, remote development security compliance, and associated human factors records shall be conducted at least annually (or upon significant infrastructure/organisational changes).

## 7. Scope and Applicability
This procedure applies to all home offices, co-working spaces, and corporate facilities where personnel develop, test, or support the Naomi SaMD.

## 8. Terms and Definitions
*   **Work Environment:** Conditions under which work is performed, including physical, environmental, psychological, ergonomic, and IT security factors.
*   **Device Management Policy:** Mandated technical security rules applied to mobile workstations (disk encryption, firewall, password policy).
*   **Accessibility Test Pack:** Structured verification test suites designed to confirm accessibility and interface suitability across designated hardware and display environments.

## 9. Responsibilities
*   **Top Management:** Ensures provision of ergonomic equipment, mental health support, secure remote working allowances, and annual audit oversight.
*   **Lead Developer / Founder:** Audits compliance with workstation security policies, executes accessibility test packs, manages cloud secrets, and reviews human factors risks.
*   **All Personnel:** Maintain secure and ergonomic remote working setups, adhere to personal data isolation in development, and report security or health hazards promptly.

## 10. Inputs and Outputs
*   **Inputs:** 
    *   ISO 13485:2016 (Clause 6.4 – Work Environment).
    *   IEC 62366-1 (Usability engineering for medical devices).
    *   Health and safety / DSE ergonomic guidelines.
    *   UK GDPR & Data Protection Act remote processing / development security requirements.
    *   Accessibility testing criteria and device compatibility profiles.
    *   Risk Management File (recurring accessibility risk log entries).
*   **Outputs:** 
    *   Hardened, secure, and compliant development environments free of live patient data.
    *   Ergonomic and supportive working conditions mitigating fatigue, stress, and coding defects.
    *   Documented annual work environment and IT security audit records.
    *   Accessibility test pack verification records and device compatibility baselines under change control.
    *   Regularly reviewed human factors and accessibility risk entries in the risk register.

## 11. Records Generated
*   Remote Workstation Security Self-Assessment / IT Security Audit Reports (Annual).
*   Ergonomic and Display Screen Equipment (DSE) Assessments.
*   Accessibility and Device Compatibility Test Pack Records.
*   Change Control Records for Device/Platform Scope Modifications.


