# QMS-REG-02: NHS DTAC Assessment Mapping

| Document ID | QMS-REG-02 |
|-------------|------------|
| Title | NHS DTAC Assessment Mapping |
| Version | 0.1 |
| Status | DRAFT |
| Effective Date | «[INSERT: TBD]» |
| Author | «[INSERT: Name]» |
| Approved By | «[INSERT: TBD]» |

## Revision History
| Version | Date | Author | Description of Changes |
|---------|------|--------|------------------------|
| 0.1 | «[INSERT: Date]» | «[INSERT: Name]» | Initial draft |

## 1. Introduction to NHS DTAC
The Digital Technology Assessment Criteria (DTAC) is published by NHS England and provides the national baseline criteria for digital health technologies entering into the NHS and social care. It ensures that systems are clinically safe, secure, and usable. This document maps the Naomi NHS Parenting Chatbot against the five core DTAC domains.

## 2. DTAC Domains & Naomi Alignment

### 2.1 Clinical Safety
Compliance with DCB0129 is mandatory for manufacturers of health IT systems.
- **Clinical Safety Officer (CSO):** Naomi requires a registered clinician (CSO) to oversee safety.
- **Clinical Risk Management System:** Integrated with ISO 14971 processes.
- **Clinical Safety Case Report (CSCR) & Hazard Log:** To be produced outlining specific AI-related hazards, mitigations, and the residual risk of providing incorrect NHS guidance.

### 2.2 Data and Privacy
Ensuring compliance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act (DPA) 2018.
- **Data Security & Protection Toolkit (DSPT):** Registration and submission required to demonstrate data security compliance to the NHS standard.
- **DPIA:** A Data Protection Impact Assessment is required (see QMS-REG-03) given the AI processing and health-adjacent data.
- Naomi anonymises session data and minimises personal data collection by design.

### 2.3 Technical Security
Ensuring systems are protected against cyber threats.
- **Cyber Essentials:** «[INSERT: Organisation Name]» must hold a valid Cyber Essentials or Cyber Essentials Plus certificate.
- **Penetration Testing:** Annual external IT Health Check (ITHC) / Penetration test covering the Cloudflare Workers and web interface.
- **OWASP Alignment:** Development processes follow OWASP Top 10 guidelines for secure application development.

### 2.4 Interoperability
Ensuring the system communicates effectively with other systems.
- **Current Status:** Naomi currently functions as a stand-alone advisory system.
- **Roadmap:** Future integration with NHS login and standard FHIR APIs for patient record integration if escalation to clinical services is developed.

### 2.5 Usability and Accessibility
Ensuring the system is accessible to all intended users.
- **WCAG 2.1 AA:** Naomi's web interface is designed to meet Web Content Accessibility Guidelines version 2.1, level AA.
- **User Research Evidence:** Usability testing in line with IEC 62366-1 has been conducted with parents/carers of children aged 0-5.

## 3. Mapping Table

| DTAC Section | Criterion | Naomi Evidence | Gap / Status |
|--------------|-----------|----------------|--------------|
| **Clinical Safety** | DCB0129 Compliance | QMS-REG-02; Risk Mgmt Plan | Awaiting CSO appointment and final CSCR |
| **Clinical Safety** | Hazard Log | QMS-14971-02 Risk Management File (Hazard Log) | Draft completed, pending CSO review |
| **Data Protection** | DSPT Published | DSPT Portal submission | DSPT needs submission |
| **Data Protection** | DPIA Completed | QMS-REG-03 DPIA | Draft initiated |
| **Tech Security** | Cyber Essentials | Certificate | Needs renewal/acquisition |
| **Tech Security** | Penetration Test | Pen Test Report | To be scheduled prior to launch |
| **Interoperability**| APIs and Standards | Architecture Doc | N/A - Currently stand-alone |
| **Usability** | WCAG 2.1 AA | Accessibility Audit Report | Audit to be scheduled |

## 4. DCB0129 and DCB0160 Specific Requirements
- **DCB0129:** As the manufacturer, «[INSERT: Organisation Name]» is responsible for executing the DCB0129 clinical risk management process, producing the CSCR, and maintaining the Hazard Log throughout Naomi's lifecycle.
- **DCB0160:** If Naomi is deployed by an NHS trust or ICS, that deploying organisation will be responsible for DCB0160 compliance. We will provide our DCB0129 documentation to support their DCB0160 assessment.

## 5. Next Steps for Full DTAC Compliance
1. Appoint a Clinical Safety Officer (CSO).
2. Complete and sign off the Clinical Safety Case Report and Hazard Log.
3. Conduct independent penetration testing.
4. Complete and publish the NHS DSPT submission.
5. Finalise the DPIA and obtain DPO sign-off.
