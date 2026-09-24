# Risk Management Plan

| Document ID | Title | Version | Status | Effective Date | Author | Approved By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| QMS-14971-01 | Risk Management Plan | 0.1 | DRAFT | «[INSERT: TBD]» | «[INSERT: Name]» | «[INSERT: TBD]» |

## Revision History
| Version | Date | Description of Changes | Author |
| :--- | :--- | :--- | :--- |
| 0.1 | «[INSERT: Date]» | Initial Draft | «[INSERT: Name]» |

## 1. Purpose and Scope
This Risk Management Plan defines the activities, responsibilities, and methodologies for risk management across the entire lifecycle of the Naomi SaMD application. This document is established in accordance with ISO 14971:2019 and ISO 13485:2016 (Clause 7.1). The scope covers the software development, deployment, maintenance, and post-market phases of Naomi, an AI-powered chatbot providing NHS-grounded guidance for parents/carers of children aged 0–5 in the UK.

## 2. Risk Management Policy and Acceptability Criteria
The organisation is committed to ensuring the safety and effectiveness of the Naomi chatbot. Management shall ensure that adequate resources are provided to perform risk management activities effectively. 

Risk acceptability is determined based on the severity and probability of the potential harm. The organisation's policy for determining acceptable risk relies on reducing risks as far as possible (AFAP) without adversely affecting the benefit-risk ratio. The acceptability criteria are defined quantitatively using a 5×5 risk matrix.

## 3. Risk Estimation Methodology
Risks are estimated based on a combination of the probability of occurrence of harm and the severity of that harm. The method employs a 5×5 matrix, evaluating severity against probability to determine an initial risk level. 

### 3.1 Severity of Harm Definitions
| Level | Severity | Description |
| :--- | :--- | :--- |
| 1 | Negligible | Inconvenience or temporary discomfort; no medical intervention required. |
| 2 | Minor | Minor injury or impairment; requires basic first aid or minor medical intervention. |
| 3 | Serious | Reversible injury or impairment requiring professional medical intervention or resulting in delayed critical care. |
| 4 | Critical | Irreversible injury or permanent impairment; life-threatening situation. |
| 5 | Catastrophic | Results in death or multiple severe injuries. |

### 3.2 Probability of Occurrence Definitions
| Level | Probability | Description | Indicative Frequency |
| :--- | :--- | :--- | :--- |
| 1 | Improbable | Extremely unlikely to occur. | < 1 in 100,000 uses |
| 2 | Remote | Unlikely to occur, but possible. | 1 in 10,000 to 100,000 uses |
| 3 | Occasional | May occur occasionally. | 1 in 1,000 to 10,000 uses |
| 4 | Probable | Likely to occur frequently. | 1 in 100 to 1,000 uses |
| 5 | Frequent | Almost certain to occur. | > 1 in 100 uses |

## 4. Risk Acceptability Matrix
| Probability \ Severity | 1 (Negligible) | 2 (Minor) | 3 (Serious) | 4 (Critical) | 5 (Catastrophic) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **5 (Frequent)** | Medium | High | Unacceptable | Unacceptable | Unacceptable |
| **4 (Probable)** | Low | Medium | High | Unacceptable | Unacceptable |
| **3 (Occasional)** | Low | Low | Medium | High | Unacceptable |
| **2 (Remote)** | Acceptable | Low | Low | Medium | High |
| **1 (Improbable)** | Acceptable | Acceptable | Low | Low | Medium |

**Criteria:**
- **Acceptable/Low:** Acceptable as is; further risk reduction is encouraged if practical but not mandatory.
- **Medium:** Risk reduction measures are required to reduce the risk AFAP. If further reduction is not possible, a benefit-risk analysis is mandatory.
- **High/Unacceptable:** Unacceptable. Mandatory risk control measures must be implemented to reduce the risk to an acceptable level.

## 5. Verification of Risk Control Measures
Each identified risk control measure shall be verified for both implementation and effectiveness. Verification shall be documented in the software verification test reports (per IEC 62304) and referenced in the Risk Management File. 

## 6. Residual Risk Evaluation
Following the implementation and verification of risk controls, the residual risk shall be evaluated using the same 5×5 matrix. If the residual risk remains unacceptable, further risk controls shall be applied or a documented benefit-risk analysis shall be conducted to justify the acceptance of the risk.

## 7. Overall Residual Risk Evaluation
After all individual residual risks have been evaluated and determined to be acceptable, the overall residual risk of the Naomi application shall be assessed. This assessment considers the cumulative effect of all individual residual risks against the intended benefits of the chatbot. The Top Management must review and approve this evaluation.

## 8. Post-Market Surveillance (PMS) Linkage
Information gathered during the post-market phase, including user feedback, clinical data, and incident reports (per QMS-PMS-01 and QMS-8.2.3-01), shall be continuously fed back into the risk management process. This ensures that the estimated probabilities and severities remain accurate, and that no new, unmitigated hazards have emerged.

## 9. Personnel Responsibilities
- **Top Management:** Ensuring resources and approving the overall residual risk evaluation.
- **Quality Manager:** Managing the risk management process and maintaining the Risk Management File (QMS-14971-02).
- **Lead Developer/Architect:** Implementing and verifying technical risk controls in code and CI/CD pipelines.
- **Clinical Safety Officer (CSO):** Leading clinical hazard analysis, approving clinical risk assessments, and ensuring DCB0129 alignment.

## 10. Review and Update Triggers
This plan and the corresponding Risk Management File (QMS-14971-02) shall be reviewed and updated upon:
- Significant software architectural changes.
- Identification of new hazards via post-market surveillance.
- Changes in intended use or regulatory requirements.
- At a minimum, annually during the Management Review (QMS-5.6-01).

## 11. Terms and Definitions
*   **Harm:** Physical injury or damage to the health of people, or damage to property or the environment.
*   **Hazard:** Potential source of harm.
*   **Hazardous Situation:** Circumstance in which people, property, or the environment are exposed to one or more hazards.
*   **Risk Control:** Measure that reduces the probability of occurrence of harm or the severity of that harm.
*   **Residual Risk:** Risk remaining after risk control measures have been implemented.

## 12. Inputs and Outputs
*   **Inputs:** Intended use statement (QMS-4.2.3-01), user requirements, known clinical hazards in pediatric guidance, NHS clinical guidelines, post-market surveillance data.
*   **Outputs:** Risk Management File (QMS-14971-02), verified technical risk controls (QMS-7.3.6-01), Residual Risk Evaluation Report.

## 13. Records Generated
*   Risk Management Plan baseline and revisions (QMS-14971-01).
*   Risk Management File and Hazard Log (QMS-14971-02).
*   Risk Management Review and Sign-Off Records.

