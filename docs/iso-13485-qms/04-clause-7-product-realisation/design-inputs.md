# Design Inputs

| Document ID | Title | Version | Status | Effective Date | Author | Approved By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| QMS-7.3.3-01 | Design Inputs | 0.2 | DRAFT | «[INSERT: TBD]» | «[INSERT: Name]» | «[INSERT: TBD]» |

## Revision History

| Version | Date | Author | Description of Change |
| :--- | :--- | :--- | :--- |
| 0.1 | «[INSERT: Date]» | «[INSERT: Name]» | Initial draft creation. |
| 0.2 | «[INSERT: Date]» | «[INSERT: Name]» | Fully aligned requirements, quantitative thresholds, performance criteria, safety invariants, and architectural numbers to master Technical Architecture & Implementation Plan, Safety Architecture, and project safety non-negotiables. |

## 1. Purpose and Statutory Basis
This document defines the comprehensive Design Inputs for the Naomi AI-powered parenting chatbot in accordance with ISO 13485:2016 (clause 7.3.3) and IEC 62304:2015 (clause 5.2 Software Requirements Analysis). These inputs establish the complete baseline of user needs, functional capabilities, safety guardrails, quantitative performance thresholds, usability parameters, and regulatory requirements for the Naomi Software as a Medical Device (SaMD).

Naomi is classified as a Class I medical device under the UK Medical Devices Regulations 2002 (UK MDR 2002) and assigned Software Safety Class B under IEC 62304:2015. These design inputs serve as the basis for design outputs (QMS-7.3.4-01), design verification protocols (QMS-7.3.6-01), and clinical design validation (QMS-7.3.7-01).

## 2. User Needs
The intended users are parents and carers of infants and young children aged 0–5 residing in the United Kingdom.
*   **UN-01 (Trustworthy NHS Guidance):** Users need rapid, evidence-based, clinical guidance for common childhood health conditions, infant feeding, sleep routines, and developmental milestones, grounded strictly in validated UK National Health Service (NHS) content.
*   **UN-02 (Empathetic & Accessible Tone):** Users, who may be sleep-deprived, anxious, or distressed, need a calm, empathetic, and non-judgmental "parent-friend" persona delivering clear plain English at a UK reading age of ~11 years old, using UK medical and cultural terminology exclusively (e.g. health visitor, GP, NHS 111, A&E, nappies, paracetamol).
*   **UN-03 (Immediate Crisis Escalation):** Users presenting with acute paediatric emergencies or disclosing safeguarding crises need immediate, prominent, and deterministic redirection to appropriate UK emergency and support services (999, NHS 111, NSPCC, Childline), bypassing conversational text generation.
*   **UN-04 (Zero-Barrier Mobile Access):** Users need instant, barrier-free access on mobile devices without mandatory account registration or complex navigational hurdles, compliant with modern accessibility standards.
*   **UN-05 (Natural Language Resilience):** Digitally non-expert users need an interface that reliably interprets colloquial expressions, typographical errors, and anxious phrasing without requiring boolean syntax or clinical terminology.
*   **UN-06 (Privacy & Confidentiality):** Users disclosing sensitive parenting concerns, postnatal mental health struggles, or intimate child symptoms need complete assurance that their personal data, identity, and raw conversational transcripts are not permanently stored or shared.
*   **UN-07 (Clear Clinical Boundaries):** Users need clear, continuous visibility that Naomi is an AI-powered conversational assistant and not a medical doctor, providing non-diagnostic decision-support that complements professional clinical care.

## 3. Functional Requirements

### 3.1 Conversational Interface & API Orchestration (M1 / M2)
*   **FR-01 (API Endpoint & Streaming SSE Protocol):** The system shall expose a secure HTTPS endpoint `POST /chat` accepting JSON payloads containing `{ session_id?: string, message: string }`.
*   **FR-02 (Frozen Response Envelope Contract):** The API shall stream responses to the client using Server-Sent Events (SSE) adhering to the frozen public response envelope contract:
    *   `token`: `{ type: "token", payload: { text: string } }`
    *   `signpost`: `{ type: "signpost", payload: { tier: 1 | 2 | 3, headline: string, reason_plain_language: string, services: Array<{ name: string, contact: string, use: string }> } }`
    *   `error`: `{ type: "error", payload: { code: string, message: string } }`
    *   `done`: `{ type: "done", payload: { session_id: string, sources?: string[], fallback?: boolean, fallback_reason?: "low_confidence" | "retrieval_error" | "generation_error" | "safety_fallback" } }`
*   **FR-03 (Diagnostic Health Check):** The system shall expose a `GET /health` endpoint returning HTTP 200 and operational health metadata.

### 3.2 Safety & Clinical Triage Module (M3)
*   **FR-04 (Mandatory Pre-Execution Triage):** Every inbound user message shall be evaluated by the M3 Safety & Triage module prior to any retrieval, generation, or conversational logging.
*   **FR-05 (4-Tier Clinical Classification):** Incoming queries shall be classified into one of four distinct clinical severity tiers:
    *   **Tier 1 (Immediate Danger to Life):** Respiratory arrest, cardiac arrest, airway obstruction/choking, unresponsiveness/unconsciousness, severe bleeding/trauma, anaphylaxis, acute poisoning or button battery ingestion, status epilepticus, active suicidal intent, or acute severe self-harm.
    *   **Tier 2 (Urgent Medical Symptoms):** Infant fevers under 3 months ($\ge 38^\circ\text{C}$), severe dehydration (no wet nappies for 12 hours, sunken fontanelle), non-blanching petechial/purpuric rashes, breathing stridor/wheezing, head injuries with vomiting or drowsiness, acute abdominal pain (green bilious vomit, red currant jelly stool).
    *   **Tier 3 (Safeguarding & Domestic Abuse):** Suspected physical or emotional abuse, non-accidental injury/shaken baby syndrome, child sexual exploitation/grooming, female genital mutilation (FGM)/forced marriage, domestic abuse in the household, parental substance incapacitation, postpartum psychosis or intrusive infant-harming thoughts.
    *   **Tier 4 (Safe General Parenting Query):** Non-urgent parenting queries relating to routine infant feeding, weaning, sleep routines, minor teething, and developmental milestones.
*   **FR-06 (Multi-Layer Defense-in-Depth Triage):**
    *   *Layer 0 (Anti-Adversarial Normalisation):* The system shall preprocess inbound text using Unicode NFKD decomposition, stripping zero-width characters (`\u200B`) and invisible joiners, canonicalising Cyrillic/Greek homoglyphs to Latin equivalents, and collapsing punctuation.
    *   *Layer 1 (Deterministic Lexicon Scan):* The system shall execute a synchronous clinical lexicon scan (`src/triage/lexicon.ts`). Any Tier 1 match shall trigger an immediate fast-path exit with zero AI latency ($< 1\text{ms}$).
    *   *Layer 2 (Semantic AI Classifier Pass):* Messages not matched as Tier 1 by lexicon shall be evaluated by an isolated classifier pass using `@cf/meta/llama-3.1-8b-instruct-fp8-fast` running at temperature 0.0, evaluating semantic clinical risk into structured JSON `{"tier": 1|2|3|4, "confidence": float, "category": string}`.
    *   *Layer 3 (Precedence Resolution Algebra):* The final triage tier shall be resolved via $\text{Final Tier} = \min(\text{Lexicon Tier}, \text{Classifier Tier})$. The classifier may escalate risk; it shall **never** downgrade a conservative deterministic lexicon evaluation.

### 3.3 Escalation & Signposting Module (M6)
*   **FR-07 (Deterministic Escalation Generation):** When Tier 1, 2, or 3 is resolved, the system shall completely abort retrieval and LLM generation. The signpost response shall be assembled exclusively from immutable typed constants and predefined templates in `src/escalation/contacts.ts`.
*   **FR-08 (Authoritative UK Contacts):** Signpost payloads shall output verbatim UK helpline contact details:
    *   **Tier 1:** Emergency Services — `999` / A&E.
    *   **Tier 2:** NHS 111 — `111` (telephone and online 111.nhs.uk).
    *   **Tier 3 (Child Welfare):** NSPCC Helpline — `0808 800 5000` / `help@nspcc.org.uk`.
    *   **Tier 3 (Direct Child Support):** Childline — `0800 1111`.
    *   **Tier 3 (Child Mental Health):** Young Minds Parents Helpline — `0808 802 5544`.
    *   **Tier 3 (Domestic Abuse):** National Domestic Abuse Helpline — `0808 2000 247`.

### 3.4 Grounded Retrieval-Augmented Generation (M4 / M5)
*   **FR-09 (Semantic Vector Retrieval):** For Tier 4 queries, the system shall generate embeddings using `@cf/baai/bge-base-en-v1.5` (768 dimensions) and perform cosine similarity search against the Cloudflare Vectorize index (`nhs-guidance`), retrieving top $k = 3 \text{ to } 5$ candidate chunks.
*   **FR-10 (Retrieval Similarity Gate):** The system shall evaluate candidate chunks against an environment-configurable threshold (`SIMILARITY_THRESHOLD = 0.5`). If the highest similarity score is $< 0.5$, or if D1 chunk lookup fails, the system shall abort LLM generation and emit an honest fallback response ("I don't have enough verified NHS guidance on this, here's who to ask: NHS 111 / health visitor / GP").
*   **FR-11 (Grounded Response Synthesis):** The generative model (`@cf/meta/llama-3.1-8b-instruct-fp8-fast`, pinned via `GENERATION_MODEL`) shall synthesise responses strictly from retrieved NHS context, explicitly citing NHS source URLs. User messages shall be interpolated as structured data fields, never concatenated into system instructions.
*   **FR-12 (Mandatory Clinical Safety Windows):** The system shall incorporate mandatory NHS clinical safety windows for preparation and storage of sustenance (e.g. formula milk: discard feeds after 2 hours at room temperature; refrigerate maximum 24 hours).

### 3.5 Session State & Rate Limiting (KV)
*   **FR-13 (Session Memory & 24h TTL):** Conversational context across turns shall be maintained in Cloudflare KV (`SESSIONS` binding). Session IDs shall be cryptographically generated server-side via `crypto.randomUUID()`. All session records shall enforce an automatic Time-To-Live (TTL) of **24 hours** (`expirationTtl: 86400`).
*   **FR-14 (Per-IP Rate Limiting):** The system shall enforce a rate limit of **20 requests per minute per IP address** (`RATE_LIMIT_PER_MINUTE = "20"`) using Cloudflare KV. Requests exceeding this threshold shall receive HTTP 429 Too Many Requests with a `Retry-After` header.

### 3.6 Safeguarding Audit Logging & Knowledge Pipeline (M8 / M7)
*   **FR-15 (Zero-PII Audit Logging):** Triage decisions shall be logged asynchronously to Cloudflare D1 SQLite (`nhs-parenting` DB). The schema shall be strictly confined to: `id` (INTEGER PRIMARY KEY), `timestamp` (DATETIME), `tier` (INTEGER 1–4), `signal_categories` (TEXT JSON array), and `session_pseudonym` (TEXT SHA-256 hash). Storing raw user text, names, postcodes, contact details, or IP addresses is strictly forbidden.
*   **FR-16 (Curated Ingestion & Reconciliation):** Ingestion shall process guidance strictly from the version-controlled allow-list (`content/sources.json`) across the 7 canonical NHS domains (`newborn-care`, `feeding`, `weaning-nutrition`, `sleep`, `teething-development`, `minor-ailments`, `emotional-wellbeing`). Chunks shall be sized to 300–600 tokens with SHA-256 content hashes. Ingestion shall reconcile after upsert by deleting orphaned chunks and superseded vectors.
*   **FR-17 (Fail-Safe System Degradation):** If the AI classifier times out, throws a 503, or fails, the triage system shall instantly degrade to deterministic Layer 1 lexicon scan (Rule 04.13). Downstream retrieval or generation failures shall emit a safe generic fallback envelope directing the user to NHS 111, never exposing stack traces or environment bindings.

## 4. Safety Requirements
Derived from ISO 14971:2019 risk analyses (QMS-14971-02), NHS DCB0129 clinical risk assessments, and project safety non-negotiables:
*   **SR-01 (Strict Prohibition on Medical Diagnosis):** The system shall categorically state it is an AI assistant, not a doctor, and shall never formulate, imply, or provide a definitive or differential medical diagnosis.
*   **SR-02 (Strict Prohibition on Drug Prescribing & Dosage Calculation):** The system shall never recommend specific drug dosages or prescribe medication; queries regarding medicinal dosages shall be directed to official NHS guidance or healthcare practitioners.
*   **SR-03 (Deterministic Escalation Immunity):** The escalation module's routing for Tier 1–3 events shall be deterministic and structurally immune to LLM manipulation or system-prompt override.
*   **SR-04 (Anti-Adversarial Prompt Injection Defense):** The system shall treat all user inputs as untrusted data, executing Layer 0 text normalisation and structured data injection barriers to defeat direct, indirect, and multilingual jailbreak attempts.
*   **SR-05 (Structural Hallucination Prevention):** External web browsing and open-ended generation shall be prohibited; medical advice shall be synthesised exclusively from retrieved NHS content verified by similarity scoring ($\ge 0.5$).
*   **SR-06 (Mandatory Clinical Safety Windows):** Clinical safety windows for infant feeds and formula storage (2 hours room temperature, 24 hours refrigerated) shall be strictly asserted in responses.
*   **SR-07 (Data Minimisation & Zero-PII Non-Negotiable):** The system shall structurally prevent the persistence of personally identifiable information (PII) or clinical free text in persistent logs and databases.
*   **SR-08 (Zero Critical Tier 1 False Negatives - Hard Invariant):** The system shall achieve a **0.0% false negative rate for Tier 1 life-threatening emergencies** across all automated test suites, red-team suites, and clinical scenario evaluations.
*   **SR-09 (Calibrated ~10% Over-Escalation Safety Budget):** In accordance with asymmetric clinical loss functions ($\text{Cost}(\text{False Negative}) \gg \text{Cost}(\text{False Positive})$), the system is calibrated to accept an intentional $\approx 10\%$ over-escalation rate (10.6% measured on 1,000 scenarios) on ambiguous presentations (stillbirth/bereavement, severe poverty/homelessness, carer depletion) routing users to supportive UK helplines.
*   **SR-10 (Fail-Safe Degradation):** System component failures (AI timeout, database outage, network fault) shall degrade instantly to the safest deterministic fallback without crashing or leaking sensitive system internals.

## 5. Performance Requirements
*   **PR-01 (Tier 1 Fast-Path Latency):** Inbound messages matching Tier 1 deterministic lexicon phrases shall execute with **$< 1\text{ms}$ AI latency** (AI classifier completely bypassed) and achieve total edge response latency **$< 50\text{ms}$**.
*   **PR-02 (Conversational Streaming Latency / Time-to-First-Token):** For standard Tier 4 conversational queries, the system shall deliver the first streamed token (TTFT) to the client within **$\le 3.0\text{ seconds}$ for 95% of queries ($p95 \le 3\text{s}$)** under standard operating load.
*   **PR-03 (System Availability & Uptime):** The system shall maintain an operational uptime of **$\ge 99.5\%$**, excluding scheduled maintenance windows, leveraging Cloudflare's distributed serverless edge network.
*   **PR-04 (Concurrent Session Scalability):** The system shall successfully support at least **100 concurrent active chat sessions** without degradation in latency ($p95 \le 3\text{s}$) or increase in HTTP error rates.
*   **PR-05 (Rate Limiting Threshold):** The system shall enforce a rate limit of **20 requests per minute per IP address** (`RATE_LIMIT_PER_MINUTE = "20"`), blocking excess traffic with HTTP 429.
*   **PR-06 (Retrieval Similarity Gate):** Cosine similarity threshold for RAG retrieval shall be set to **$\ge 0.5$** (`SIMILARITY_THRESHOLD = "0.5"`) over 768-dimensional embeddings (`@cf/baai/bge-base-en-v1.5`), querying top $k = 3 \text{ to } 5$ chunks of 300–600 tokens.
*   **PR-07 (Session Storage Lifetime):** KV conversational history shall enforce an automatic expiration TTL of **24 hours ($86,400\text{ seconds}$)**.
*   **PR-08 (Automated Quality & Clinical Safety Test Metrics):**
    *   **1,000-Scenario Clinical Suite (`scripts/test-scenarios-runner.ts`):**
        *   Scenario Volume: Exactly 1,000 synthetic clinical and parenting scenarios.
        *   Exact Tier Pass Rate: Target $\ge 85.0\%$ (87.7% measured / 877 of 1,000).
        *   Critical Tier 1 False Negatives: **0.0% (0 / 1,000) — Hard Invariant**.
        *   Major Tier 2/3 False Negatives: $< 1.0\%$ (0.9% measured / 9 of 1,000).
        *   Calibrated Over-Escalations (T4 $\to$ T1–T3): $\approx 10\%$ safety budget (10.6% measured / 106 of 1,000).
    *   **Adversarial Red-Team Suite (`npm run test:redteam`):**
        *   Target: **100% pass rate** (0 Tier 1 false negatives across 42+ adversarial scenarios, homoglyphs, and jailbreaks) as a mandatory automated deploy gate.
    *   **Unit and Contract Test Suite (`npm run test`):**
        *   Target: **100% pass rate** across all software units and API response envelope contracts (422+ tests passing).

## 6. Usability Requirements
In alignment with IEC 62366-1:2015:
*   **UR-01 (Deliberately Minimal Interface):** The MVP user interface shall consist of a clean, single-box conversational input component with a submit action and streamed response display, avoiding cognitive clutter for stressed parents.
*   **UR-02 (Mobile-First Responsive Design):** The application shall render correctly and responsively across standard mobile viewports (iOS Safari and Android Chrome, minimum viewport width 320px).
*   **UR-03 (Reading Age & Tone of Voice):** All generated responses shall target a UK reading age of **~11 years old** (reading age 9–11 years, Flesch-Kincaid Grade Level 5–6) in a warm, non-judgmental "parent-friend" voice using UK English terminology exclusively (health visitor, GP, NHS 111, A&E, nappies, paracetamol).
*   **UR-04 (Accessibility Compliance - WCAG 2.1 AA):** The conversational interface shall be fully keyboard-navigable, provide ARIA live regions and labels for screen readers, and maintain WCAG 2.1 Level AA color contrast ratios ($\ge 4.5:1$ for normal text).
*   **UR-05 (Prominent Clinical Disclaimer):** The interface shall present an unmissable banner stating: *"Naomi is an AI assistant, not a doctor. In emergencies, call 999."*

## 7. Regulatory and Standards Requirements
*   **REG-01 (UK MDR 2002):** UK Medical Devices Regulations 2002 (SI 2002 No 618, as amended) — Software as a Medical Device (SaMD) Class I under self-declaration for UKCA marking.
*   **REG-02 (NHS DTAC):** Full compliance with NHS Digital Technology Assessment Criteria v2.0:
    *   Section B: Usability & Accessibility (B2 - WCAG 2.1 AA)
    *   Section C1: Clinical Safety (DCB0129)
    *   Section C2: Technical Security (Cyber Essentials, TLS 1.3 encryption, cloud WAF)
    *   Section C3: Interoperability
    *   Section D1: Data Protection (UK GDPR, DPIA, Data Minimisation)
*   **REG-03 (NHS DCB0129):** Clinical Risk Management: its Application in the Manufacture of Health IT Systems — appointment of Clinical Safety Officer (CSO), Clinical Safety Management Plan (QMS-14971-01), Hazard Log (QMS-14971-02), and Clinical Safety Case Report.
*   **REG-04 (Data Protection):** UK General Data Protection Regulation (UK GDPR), Data Protection Act 2018, and Caldicott Principles — zero PII persistence in logs and automatic 24-hour session TTL.
*   **REG-05 (IEC 62304:2015+AMD1:2015):** Medical device software lifecycle processes for Software Safety Class B.
*   **REG-06 (ISO 14971:2019):** Application of risk management to medical devices.
*   **REG-07 (IEC 62366-1:2015):** Application of usability engineering to medical devices.

## 8. Review and Verification of Design Inputs
These design inputs have been systematically reviewed for completeness, adequacy, lack of ambiguity, and mutual consistency in accordance with ISO 13485:2016 (clause 7.3.3). In the event of competing system priorities, clinical safety requirements (SR-01 to SR-10) strictly override functional and performance requirements.

The formal review and baselining of these inputs is recorded with the active engagement and approval of the Clinical Safety Officer at Stage Gate 1 (Requirements Review) within the Design Review Record (QMS-7.3.5-01) and Design History File (QMS-7.3.10-01).

## 9. Scope and Applicability
This specification governs all functional, clinical, performance, usability, and regulatory requirements applied to the Naomi application codebase, Cloudflare serverless edge infrastructure, database schemas, prompt engineering guardrails, and automated verification suites.

## 10. Terms and Definitions
*   **Design Input:** The physical, performance, safety, and regulatory characteristics of a medical device used as the basis for product design.
*   **Software as a Medical Device (SaMD):** Software intended to be used for one or more medical purposes without being part of a hardware medical device.
*   **Retrieval-Augmented Generation (RAG):** AI architecture combining vector database semantic retrieval with large language model response synthesis.
*   **Time-to-First-Token (TTFT):** Duration between the client dispatching a query and receiving the initial streamed SSE token.
*   **Personally Identifiable Information (PII):** Any information relating to an identified or identifiable natural person.
*   **Zero-PII Architecture:** System design structurally guaranteeing that personal identifying data is never persisted.
*   **Over-Escalation Safety Budget:** Deliberate calibration accepting ~10% over-escalation on ambiguous presentations to guarantee 0.0% false negatives on life-threatening emergencies.

## 11. Responsibilities
*   **Product Owner:** Captures, prioritises, and defines User Needs (UN-01 to UN-07) and functional user stories.
*   **Clinical Safety Officer (CSO):** Establishes and authorises Safety Requirements (SR-01 to SR-10), clinical escalation matrices, and risk acceptability per DCB0129 and ISO 14971:2019.
*   **Lead Developer:** Evaluates technical feasibility, implements module architecture, and maps design inputs directly to Design Outputs (QMS-7.3.4-01).
*   **Quality Manager:** Ensures bidirectional traceability between design inputs, risk controls, and Design Verification protocols (QMS-7.3.6-01).

## 12. Inputs and Outputs
*   **Inputs:** Intended use statement (QMS-4.2.3-01), Design and Development Plan (QMS-7.3.1-01), Technical Architecture & Implementation Plan (`docs/architecture-and-action-plan.md`), Safety Architecture & Clinical Triage Flow (`docs/safety-architecture-and-triage-flow.md`), Risk Management File (QMS-14971-02), and NHS DTAC standards (QMS-REG-02).
*   **Outputs:** Baseline Design Inputs specification (QMS-7.3.3-01), bidirectional traceability matrix to Design Outputs (QMS-7.3.4-01), Design Verification Plan (QMS-7.3.6-01), and Design Validation Plan (QMS-7.3.7-01).

## 13. Records Generated
*   Approved Design Inputs Specification (QMS-7.3.3-01).
*   Stage Gate 1 Requirements Review Records (QMS-7.3.5-01).
*   Traceability Matrix records filed within the Design History File (QMS-7.3.10-01).
