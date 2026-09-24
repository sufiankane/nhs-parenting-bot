# QMS-REG-03: Data Protection Impact Assessment (DPIA) Framework

| Document ID | QMS-REG-03 |
|-------------|------------|
| Title | Data Protection Impact Assessment Framework |
| Version | 0.1 |
| Status | DRAFT |
| Effective Date | «[INSERT: TBD]» |
| Author | «[INSERT: Name]» |
| Approved By | «[INSERT: TBD]» |

## Revision History
| Version | Date | Author | Description of Changes |
|---------|------|--------|------------------------|
| 0.1 | «[INSERT: Date]» | «[INSERT: Name]» | Initial draft |

## 1. Introduction
This document serves as the framework for the Data Protection Impact Assessment (DPIA) for the Naomi NHS Parenting Chatbot, fulfilling requirements under the UK General Data Protection Regulation (UK GDPR) and Data Protection Act 2018 (DPA 2018).

## 2. DPIA Necessity Assessment
**Is a DPIA required?** YES.
**Rationale:** Although Naomi is designed to be anonymous and does not mandate user accounts, it processes conversational inputs using new technologies (LLaMA 3.1 LLM). The conversations are likely to contain health-adjacent data concerning children aged 0-5 (vulnerable data subjects). Given the use of AI processing and potential incidental collection of special category data, a DPIA is mandatory.

## 3. Data Processing Description

### 3.1 Legal Basis for Processing
- **Article 6 (UK GDPR):** Processing is necessary for the purposes of the legitimate interests pursued by the controller (Article 6(1)(f)) — specifically, operating the application and providing the informational service requested by the user.
- **Article 9 (UK GDPR):** In the event users input health-related data in chat prompts, explicit consent (Article 9(2)(a)) must be obtained at the start of the session, or the data must be treated as manifestly made public by the data subject. Our primary approach is data minimisation and avoiding the deliberate collection of health records.

### 3.2 Data Flows and Storage
- **Collected Data:** User chat messages/prompts, session IDs, timestamps, IP addresses (transiently).
- **Storage:** Data is processed and stored using Cloudflare D1 (chat audit logs for safety monitoring) and Cloudflare KV (session state and rate-limiting). 
- **Location:** Data is stored within the UK/EEA region.
- **Retention:** Chat audit logs are retained for «[INSERT: Retention Period, e.g., 30 days]» for safety and quality assurance before being permanently deleted or fully anonymised. Session data in KV is ephemeral.
- **Access:** Restricted to authorised engineering and clinical safety personnel at «[INSERT: Organisation Name]» under strict access controls.

### 3.3 Categories of Data Subjects
- Parents and carers of children aged 0-5 in the UK.

## 4. Privacy by Design Measures
Naomi implements strict privacy by design and default principles:
- **No User Accounts:** No names, emails, or personal identifiers are required to use the service.
- **Session Anonymisation:** Sessions are tracked via random UUIDs that cannot be tied back to an individual without complex correlation.
- **Minimal Data Collection:** The LLM is instructed not to solicit PII.
- **Data Encryption:** All data is encrypted in transit (TLS) and at rest (Cloudflare infrastructure).

## 5. Rights of Data Subjects
Users maintain their rights under UK GDPR (Access, Erasure, Portability, Rectification). Because the system operates largely anonymously, facilitating these rights requires the user to provide their active Session ID to locate their specific data.

## 6. Roles and Responsibilities
- **Data Protection Officer (DPO) / Lead:** «[INSERT: DPO Name/Contact]»
- **ICO Registration:** «[INSERT: Organisation Name]» is registered with the Information Commissioner’s Office (ICO), Registration Number: «[INSERT: ICO Number]».

## 7. DPIA Process Steps & Questions to Complete
To finalise the DPIA, the following sections must be completed and reviewed by the DPO:
1. Describe the nature, scope, context and purposes of the processing.
2. Ask data subjects for their views (where appropriate).
3. Assess necessity and proportionality.
4. Identify and assess risks to individuals.
5. Identify measures to mitigate those risks.
6. Sign off and record outcomes.
