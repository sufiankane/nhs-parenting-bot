# Medical Device File

| Attribute | Details |
| :--- | :--- |
| Document ID | QMS-4.2.3-01 |
| Title | Medical Device File |
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
This document constitutes the Medical Device File (or Technical File index) for the Naomi application, in accordance with ISO 13485:2016 (Clause 4.2.3) and the UK Medical Devices Regulations 2002 (UK MDR 2002) Schedule 1 requirements. It provides a centralised index pointing to the records and documents that demonstrate conformity with essential requirements, safety, and performance for the Naomi Software as a Medical Device (SaMD).

# 2. Device Description and Intended Purpose
**Device Name:** Naomi
**Intended Purpose:** Naomi is an AI-powered conversational agent (chatbot) intended to provide evidence-based, NHS-grounded guidance to parents and carers of children aged 0–5 in the United Kingdom. It is designed to interpret natural language queries regarding early childhood health, development, and well-being, and retrieve relevant, validated information from approved NHS and third-party sources via a Retrieval-Augmented Generation (RAG) pipeline. 
**Contraindications/Exclusions:** Naomi is not intended to provide definitive medical diagnoses, substitute for professional clinical judgement, or be used in emergency medical situations.

# 3. Classification Rationale
Under the UK Medical Devices Regulations 2002 (UK MDR 2002), Naomi is classified as a Class I medical device.
**Rationale:** The software provides information to aid in decision-making or monitoring non-critical health conditions. It does not provide information that drives clinical management of critical conditions, nor does it control physiological processes. Conformity is assessed via self-declaration, leading to UKCA marking.

# 4. Applicable Standards and Guidance
The following standards and regulations are applicable to the Naomi device:
- ISO 13485:2016 – Quality Management Systems
- ISO 14971:2019 – Application of Risk Management to Medical Devices
- IEC 62304:2015 – Medical Device Software – Software Life Cycle Processes
- IEC 62366-1:2015 – Application of Usability Engineering to Medical Devices
- UK Medical Devices Regulations 2002 (SI 2002 No 618, as amended)
- NHS Digital Technology Assessment Criteria (DTAC)

# 5. Design and Development Records
The Design History File (DHF per QMS-7.3.10-01) contains the complete records of the design process. The technical specification is realised via a cloud-based serverless architecture (Cloudflare Workers, LLaMA 3.1 LLM, Vectorize DB).
- **Software Requirements Specification (Design Inputs):** QMS-7.3.3-01
- **Software Architectural Design (Design Outputs):** QMS-7.3.4-01
- **Software Verification Plan & Records:** QMS-7.3.6-01
- **Software Validation Plan & Records:** QMS-7.3.7-01
- **Software Lifecycle Plan:** QMS-62304-01

# 6. Risk Management File Reference
Risk management activities are conducted continuously throughout the product lifecycle.
- **Risk Management Plan:** QMS-14971-01
- **Hazard Analysis and Risk Evaluation:** QMS-14971-02
- **Risk Management Report:** Documented within QMS-14971-02 Section 4

# 7. Clinical and Performance Evaluation Reference
Clinical evaluation is based on literature review, validation of the NHS content sources, and post-market performance data.
- **Clinical Evaluation Plan & Report:** Documented within QMS-7.3.7-01 (Design Validation Plan) and NHS DTAC Mapping (QMS-REG-02)

# 8. Labelling and Instructions for Use
As a purely software product, physical labelling is not applicable.
- **In-App Labelling (About Screen):** Includes the UKCA mark, version number, manufacturer details («[INSERT: Organisation Name]»), and Date of Manufacture.
- **Instructions for Use (eIFU):** Provided electronically within the application under the 'Help' section and via the associated public website.
- **App Store Listing Description:** Contains intended use statement and clear warnings regarding non-emergency use.

# 9. Post-Market Surveillance (PMS) Reference
PMS activities ensure the ongoing safety and performance of the LLM and RAG pipelines.
- **Post-Market Surveillance Plan:** QMS-PMS-01
- **Periodic Safety Update Report (PSUR):** Governed under QMS-PMS-01 Section 4

# 10. Terms and Definitions
*   **Medical Device File (MDF):** A compilation of records and procedures providing evidence of conformity to regulatory requirements for a specific medical device type.
*   **eIFU:** Electronic Instructions for Use delivered via digital screens.
*   **SaMD:** Software as a Medical Device.

# 11. Responsibilities
*   **Quality Manager:** Responsible for compiling, updating, and maintaining the integrity of the Medical Device File.
*   **Lead Developer:** Ensures all technical design outputs, build artifacts, and test reports are filed in the DHF and referenced in the MDF.
*   **Clinical Safety Officer:** Approves clinical evaluation summaries and clinical risk data referenced in the file.

# 12. Inputs and Outputs
*   **Inputs:** Design outputs (QMS-7.3.4-01), Risk Management File (QMS-14971-02), Verification & Validation reports (QMS-7.3.6-01, QMS-7.3.7-01), UK MDR 2002 Schedule 1 requirements.
*   **Outputs:** Complete, audit-ready Medical Device Technical File supporting UKCA marking and MHRA registration.

# 13. Records Generated
*   Approved Medical Device File baseline and revision records.
*   UK Declaration of Conformity.

