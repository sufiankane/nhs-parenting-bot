# SOUP Inventory and Evaluation Log

| Document ID | Title | Version | Status | Effective Date | Author | Approved By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| QMS-62304-02 | SOUP Inventory and Evaluation Log | 0.1 | DRAFT | 2026-08-27 | Senior Technical & Solution Architect | Clinical Safety Officer / Quality Manager |

## Revision History

| Version | Date | Author | Description of Changes |
| :--- | :--- | :--- | :--- |
| 0.1 | 2026-08-27 | Solution Architect | Initial baseline creation. Complete inventory, qualification, risk evaluation, anomaly analysis, and architectural mitigation mapping for all Software of Unknown Provenance (SOUP) and third-party dependencies supporting Naomi Software as a Medical Device (SaMD) in compliance with IEC 62304:2015 (Clauses 5.3.3, 5.3.4, 7.1.2, 7.1.3) and ISO 13485:2016 (Clause 7.4). |

---

## 1. Purpose and Statutory Basis

### 1.1 Purpose
This document establishes the comprehensive **Software of Unknown Provenance (SOUP) Inventory and Evaluation Log** for the Naomi NHS Parenting Chatbot. 

In medical device software engineering, third-party software components, cloud execution environments, commercial off-the-shelf (COTS) libraries, and open-source packages that are not developed under a certified ISO 13485 / IEC 62304 Quality Management System are designated as **SOUP**. 

The purpose of this log is to:
1.  Formally identify, inventory, and version-pin every SOUP item utilized in Naomi.
2.  Define specified functional and performance requirements for each SOUP item (IEC 62304 Clause 5.3.3).
3.  Specify hardware, platform, and runtime execution prerequisites (IEC 62304 Clause 5.3.4).
4.  Analyze known anomalies, failure modes, cybersecurity vulnerabilities, and potential clinical risks introduced by each SOUP component (IEC 62304 Clause 7.1.2 & 7.1.3).
5.  Document the deterministic architectural risk controls and defensive boundaries that eliminate or mitigate SOUP-induced hazards.
6.  Record verification evidence demonstrating that each SOUP item satisfies its requirements and operates safely within the medical device system.

### 1.2 Statutory and Regulatory Framework
This inventory and evaluation log complies with:
*   **IEC 62304:2015+AMD1:2015** (Clause 5.3.3 Functional/performance requirements of SOUP; Clause 5.3.4 Hardware/software infrastructure requirements of SOUP; Clause 7.1.2 Identification of hazards related to SOUP; Clause 7.1.3 Evaluation of published SOUP anomalies; Clause 8.1.2 Configuration identification).
*   **ISO 13485:2016** (Clause 7.4 Purchasing and Supplier Evaluation; Clause 7.3.4 Design Outputs).
*   **ISO 14971:2019** (Clause 5.4 Hazard Identification; Clause 7 Risk Control).
*   **UK Medical Devices Regulations 2002 (SI 2002 No 618)** for Class I Software as a Medical Device (SaMD).
*   **NHS Digital Technology Assessment Criteria (DTAC v2.0)** (Section C1 Clinical Safety & Section C2 Technical Security).
*   **NHS DCB0129** (Clinical Risk Management).

---

## 2. SOUP Taxonomy and Management Methodology

### 2.1 SOUP Categorisation
To apply appropriate levels of regulatory scrutiny and testing rigor, SOUP components in Naomi are classified into four distinct operational categories:

1.  **Category 1: Cloud Serverless Edge Runtime & Infrastructure** (e.g. Cloudflare Workers runtime `workerd`, global edge network). Deploys and executes the application code.
2.  **Category 2: Foundation AI Models & Inference Engines** (e.g. Meta LLaMA 3.1 8B Instruct FP8 Fast, BAAI BGE-Base English v1.5, Cloudflare Workers AI platform). Provides non-deterministic linguistic generation and vector embedding extraction.
3.  **Category 3: Cloud Edge Persistence & Vector Services** (e.g. Cloudflare Vectorize, Cloudflare D1 SQLite, Cloudflare Workers KV, Cloudflare Queues, Cloudflare R2). Manages semantic retrieval, relational chunk data, session caching, rate limiting, and administrative ingestion.
4.  **Category 4: Development, Build, and Verification Tooling** (e.g. TypeScript compiler, Vitest test runner, Wrangler CLI, patch-package). Used to compile, verify, and package the software before deployment.

### 2.2 Risk Control Principle: Deterministic Isolation
A fundamental architectural tenet of Naomi is that **no non-deterministic or externally controlled SOUP component is ever permitted to be the sole decision-maker for clinical safety triage or crisis escalation**. 
*   Generative LLMs are isolated behind deterministic, immutable regular-expression and lexicon filters (M3 Layer 1), strict mathematical precedence resolution (M3 Layer 3 `resolveTier`), and frozen escalation routing (M6).
*   Vector embeddings are protected by fail-closed model identity gates asserting exact model string matching and 768-dimensional output validation prior to vector database queries.
*   Cloud service downtime or network latency spikes are intercepted by fail-safe error handling and honest clinical fallback responses.

---

## 3. Master SOUP Inventory Summary

The following table summarizes all SOUP items incorporated into or directly supporting the Naomi SaMD:

| SOUP ID | Component Name | Vendor / Maintainer | Pinned Version / Identifier | Operational Category | Target Module(s) | IEC 62304 Impact | Qualification Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SOUP-01** | Cloudflare Workers Runtime (`workerd`) | Cloudflare, Inc. | `compatibility_date: 2026-08-01`<br>`^1.20260820.1` | Cat 1: Edge Runtime | M1, M2, M3, M4, M5, M6, M8 | Class B | **Qualified & Approved** |
| **SOUP-02** | Cloudflare Workers AI Platform | Cloudflare, Inc. | Workers AI API Binding (`env.AI`) | Cat 2: AI Platform | M3, M4, M5, M7 | Class B | **Qualified & Approved** |
| **SOUP-03** | Meta Llama 3.1 8B Instruct FP8 Fast | Meta AI / Cloudflare | `@cf/meta/llama-3.1-8b-instruct-fp8-fast` | Cat 2: Foundation Model | M3 (Layer 2), M5 | Class B | **Qualified & Approved** (ADR 0001) |
| **SOUP-04** | BAAI BGE-Base English v1.5 | BAAI / Cloudflare | `@cf/baai/bge-base-en-v1.5` (768-dim) | Cat 2: Embedding Model | M4, M7 | Class B | **Qualified & Approved** |
| **SOUP-05** | Cloudflare Vectorize | Cloudflare, Inc. | Index: `nhs-guidance` (v2, cosine) | Cat 3: Vector DB | M4, M7 | Class B | **Qualified & Approved** |
| **SOUP-06** | Cloudflare D1 (Serverless SQLite) | Cloudflare, Inc. | DB: `nhs-parenting` (`f41a2de8-...`) | Cat 3: Relational DB | M4, M8 | Class B | **Qualified & Approved** |
| **SOUP-07** | Cloudflare Workers KV | Cloudflare, Inc. | Namespace: `SESSIONS` (`c4c23432...`) | Cat 3: Key-Value Store | M2 (RateLimit), M5 (History) | Class B | **Qualified & Approved** |
| **SOUP-08** | Cloudflare Queues & R2 Storage | Cloudflare, Inc. | Queue: `nhs-ingest-queue`<br>Bucket: `nhs-raw-sources` | Cat 3: Async Ingestion | M7 | Class A | **Qualified & Approved** |
| **SOUP-09** | TypeScript Compiler & Runtime Engine | Microsoft / Open Source | `typescript` ^5.7.2<br>`tsx` ^4.19.2 | Cat 4: Build Tooling | All (Build & Scripts) | Class A | **Qualified & Approved** |
| **SOUP-10** | Vitest Test Framework | Vitest Team / Open Source | `vitest` ^2.1.8 | Cat 4: Test Tooling | Verification Harness | Class A | **Qualified & Approved** |
| **SOUP-11** | Cloudflare Wrangler CLI & Worker Types | Cloudflare, Inc. | `wrangler` ^4.125.0<br>`@cloudflare/workers-types` ^5.20260822.1 | Cat 4: Deploy & Types | All (Deployment) | Class A | **Qualified & Approved** |
| **SOUP-12** | Patch-Package Utility | David Herse / Open Source | `patch-package` ^8.0.1 | Cat 4: Build Utility | Dependency Patches | Class A | **Qualified & Approved** |
| **SOUP-13** | Node.js Ambient Type Definitions | DefinitelyTyped | `@types/node` ^26.2.0 | Cat 4: Dev Types | Scripts & Tooling | Class A | **Qualified & Approved** |

---

## 4. Detailed SOUP Evaluation Profiles (Data Sheets)

### SOUP-01: Cloudflare Workers Runtime (`workerd`)
*   **Supplier / Maintainer:** Cloudflare, Inc., San Francisco, CA, USA.
*   **Component Identifier:** Cloudflare Workers Serverless V8 Isolate Runtime; `@cloudflare/workerd-windows-64` (`^1.20260820.1`), `compatibility_date = "2026-08-01"`.
*   **Operational Category:** Category 1 (Serverless Edge Runtime).
*   **Associated Naomi Modules:** M1 (Static Assets), M2 (API Gateway), M3 (Triage), M4 (Retrieval), M5 (Generation), M6 (Escalation), M8 (Audit).
*   **IEC 62304 Safety Impact:** **Class B**. Host environment for all safety-critical services.
*   **Specified Functional Requirements:**
    1.  Execute standard ECMAScript / V8 JavaScript isolate code without cold-start latency.
    2.  Process incoming HTTPS requests over TLS 1.3 and stream Server-Sent Events (`text/event-stream; charset=utf-8`) conforming to the frozen response envelope contract.
    3.  Support asynchronous non-blocking background tasks via `ctx.waitUntil()` for safeguarding audit logging and session persistence.
    4.  Bind seamlessly to Cloudflare edge storage (Vectorize, D1, KV, Workers AI).
*   **Specified Performance Requirements:**
    *   Sub-50ms compute execution time for deterministic triage (M3 Layer 1).
    *   Support $\ge 100$ concurrent user requests.
    *   System availability $\ge 99.5\%$.
    *   Memory footprint $\le 128\text{MB}$ per worker isolate.
*   **Hardware and Platform Requirements:** Cloudflare Global Edge Network. Local development requires Windows 64-bit / macOS / Linux with Node.js LTS $\ge 20.0.0$.
*   **Known Anomalies, Limitations, and Failure Modes:**
    *   *Failure Mode 1:* Global or regional Cloudflare edge outage resulting in service unavailability.
    *   *Failure Mode 2:* Worker execution timeout if synchronous computation exceeds 50ms or upstream inference hangs.
    *   *Failure Mode 3:* Unhandled runtime exception crashing the worker isolate.
*   **Risk Analysis & Clinical Impact:** Outage or unhandled crash denies access to parenting guidance. While inconvenience occurs, parents in acute emergencies are redirected by the static front-end banner (M1) or standard healthcare pathways (999/111).
*   **Architectural Risk Controls:**
    1.  Multi-zone global edge failover managed natively by Cloudflare.
    2.  Comprehensive global error boundary (`src/gateway/error.ts`) wrapping request execution; intercepts all unhandled exceptions and deterministically returns sanitized HTTP 500 error responses without stack trace or internal data leakage (*Rule 04.14*).
    3.  Static clinical disclaimer banner hard-coded in client HTML (`public/index.html`) instructing parents to call 999 or 111 immediately if experiencing acute distress or emergencies.
*   **Verification & Acceptance Evidence:**
    *   Local integration tests executing in Miniflare worker harness (`tests/chat.test.ts`, `tests/chat-flow.test.ts`).
    *   Remote production golden smoke check (`scripts/smoke/remote-golden-check.ts`) passing 10/10 live requests.
*   **Monitoring & Surveillance:** Cloudflare status dashboard monitoring; Dependabot updates for runtime packages; annual supplier evaluation under [Supplier Purchasing Procedure (QMS-7.4-01)](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/iso-13485-qms/04-clause-7-product-realisation/supplier-purchasing-procedure.md).

---

### SOUP-02: Cloudflare Workers AI Platform
*   **Supplier / Maintainer:** Cloudflare, Inc., San Francisco, CA, USA.
*   **Component Identifier:** Cloudflare Workers AI Binding (`env.AI`).
*   **Operational Category:** Category 2 (AI Inference Platform).
*   **Associated Naomi Modules:** M3 (Triage Classifier Layer 2), M4 (Retrieval Embeddings), M5 (Grounded Response Generation), M7 (Ingestion Embeddings).
*   **IEC 62304 Safety Impact:** **Class B**.
*   **Specified Functional Requirements:**
    1.  Provide programmatic inference execution (`env.AI.run(model, options)`) for text generation and vector embeddings.
    2.  Support streaming output tokens via standard Web ReadableStream for real-time SSE delivery.
    3.  Support discrete batch and single-string embedding generation.
*   **Specified Performance Requirements:**
    *   P95 time-to-first-token (TTFT) $\le 3.0\text{ seconds}$ on text generation.
    *   Embedding inference latency $\le 300\text{ms}$ per query.
*   **Hardware and Platform Requirements:** Cloudflare serverless GPU cluster running TensorRT-LLM / vLLM execution backends.
*   **Known Anomalies, Limitations, and Failure Modes:**
    *   *Failure Mode 1:* Upstream GPU resource starvation causing 504 gateway timeouts.
    *   *Failure Mode 2:* Model endpoint deprecation (e.g. historical deprecation of `@cf/meta/infire-llama-3.1-8b-instruct`).
    *   *Failure Mode 3:* Response truncation or malformed chunk streaming.
*   **Risk Analysis & Clinical Impact:** If Workers AI hangs or throws during generation or triage classification, user query could fail. If triage depended solely on AI, acute hazards could be missed.
*   **Architectural Risk Controls:**
    1.  **Deterministic Degradation Mode (*Rule 02.3*):** M3 Layer 1 deterministic lexicon executes *before* Workers AI is called. If Workers AI classifier is unavailable, times out, or throws, `resolveTier` degrades instantly and deterministically to the lexicon result, guaranteeing zero compromise to emergency detection.
    2.  **Honest Clinical Fallback:** If Workers AI fails during M5 response generation, the system catches the error and streams an honest clinical fallback advising the user to contact NHS 111 or their health visitor (*Rule 02.6*).
    3.  **ADR Governance:** Model migrations are strictly governed by Architectural Decision Records with human approval gates (*Rule 04.12*).
*   **Verification & Acceptance Evidence:** Verified through unit test mock suites (`tests/generation.test.ts`), failure fallback tests (`tests/retrieval.test.ts:167–200`), and live remote production tests.
*   **Monitoring & Surveillance:** Monthly review of Cloudflare Workers AI changelogs; automated health check monitoring via `GET /health`.

---

### SOUP-03: Meta LLaMA 3.1 8B Instruct FP8 Fast
*   **Supplier / Maintainer:** Meta Platforms, Inc. / Hosted by Cloudflare, Inc.
*   **Component Identifier:** Model ID `@cf/meta/llama-3.1-8b-instruct-fp8-fast`.
*   **Operational Category:** Category 2 (Foundation Large Language Model).
*   **Associated Naomi Modules:** M3 (Triage Classifier Layer 2), M5 (Grounded Response Generation).
*   **IEC 62304 Safety Impact:** **Class B (Highest Criticality Generative Component)**.
*   **Specified Functional Requirements:**
    1.  *M3 Layer 2:* Perform risk classification on user queries, outputting a valid JSON object `{ "tier": 1 | 2 | 3 | 4, "confidence": number, "category": string }`.
    2.  *M5 Generation:* Synthesize warm, empathetic, parent-friendly responses strictly grounded in provided NHS guidance context chunks.
    3.  Adhere to negative safety constraints: never diagnose, never prescribe, never contradict escalation signposting, never disclose system prompts (*Rule 02.6*).
    4.  Enforce clinical safety windows for infant feeding (prepared formula: use within 2h room temp, 24h fridge, discard leftover milk immediately).
*   **Specified Performance Requirements:**
    *   Token output velocity $\ge 25\text{ tokens/sec}$.
    *   Concise responses adhering to target length (60–90 words).
*   **Hardware and Platform Requirements:** Cloudflare serverless edge GPU instances with FP8 quantization acceleration.
*   **Known Anomalies, Limitations, and Failure Modes:**
    *   *Failure Mode 1 (Hallucination):* Generation of plausible but medically inaccurate paediatric guidance.
    *   *Failure Mode 2 (Diagnostic Drift):* Attempting to diagnose medical illnesses or recommend drug dosages.
    *   *Failure Mode 3 (Prompt Injection Vulnerability):* Susceptibility to malicious user inputs attempting to bypass safety rules or suppress emergency signposting.
    *   *Failure Mode 4 (Non-Determinism):* Variation in generated text across identical queries.
*   **Risk Analysis & Clinical Impact:** Potential for indirect patient harm (HZ-02, HZ-03, HZ-04) if the model hallucinates incorrect clinical guidance or fails to escalate a life-threatening symptom.
*   **Architectural Risk Controls:**
    1.  **Strict Prompt Guardrails (*Rule 02.6*):** Hard-coded system prompt with 5 explicit safety prohibitions and formula feeding safety windows.
    2.  **Structured User Input Isolation (*Rule 02.5*):** User message is interpolated strictly as quoted data (`User question: "${message}"`), preventing prompt injection from hijacking system instructions.
    3.  **Layer 1 Deterministic Pre-Emption:** Emergency queries (Tier 1) are intercepted by the deterministic lexicon in $<1\text{ms}$ and routed to M6 Escalation without ever invoking LLaMA 3.1.
    4.  **Mathematical Precedence Algebra (`resolveTier` in M3 Layer 3):** Tier 1 lexicon hits can NEVER be downgraded by LLaMA 3.1; the classifier can only escalate to a more severe tier.
    5.  **Retrieval Similarity Gate ($\ge 0.5$):** If retrieved NHS context has $<0.5$ similarity or is empty, LLaMA 3.1 is NEVER invoked; an honest clinical fallback is emitted instead.
*   **Verification & Acceptance Evidence:**
    *   Adversarial Red-Team deploy gate (`npm run test:redteam`) passing 38/38 hostile injection and jailbreak tests with **0 Tier 1 false negatives** (*Rule 02.11*).
    *   11 unit tests in `tests/generation.test.ts` validating all prompt rules and prohibition keywords.
    *   Approved via formal human gate decision in [ADR 0001](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/nhs-parenting-bot/docs/decisions/0001-generation-model-llama-3.1-8b-fp8-fast.md).
*   **Monitoring & Surveillance:** Continuous post-market audit review; version pinning in `src/generation/prompt.ts` and `src/triage/classifier.ts`.

---

### SOUP-04: BAAI BGE-Base English v1.5
*   **Supplier / Maintainer:** Beijing Academy of Artificial Intelligence (BAAI) / Hosted by Cloudflare, Inc.
*   **Component Identifier:** Model ID `@cf/baai/bge-base-en-v1.5`; 768 embedding dimensions.
*   **Operational Category:** Category 2 (Vector Embedding Model).
*   **Associated Naomi Modules:** M4 (Semantic Retrieval), M7 (Knowledge Base Ingestion).
*   **IEC 62304 Safety Impact:** **Class B**.
*   **Specified Functional Requirements:**
    1.  Convert English text strings into normalized 768-dimensional dense vector embeddings.
    2.  Produce consistent semantic vector representations such that user parenting queries exhibit high cosine similarity ($\ge 0.5$) with relevant NHS guidance chunks.
*   **Specified Performance Requirements:**
    *   Inference execution $\le 300\text{ms}$ per query.
    *   Strict output dimension invariance ($N = 768$).
*   **Hardware and Platform Requirements:** Cloudflare Workers AI edge inference engine.
*   **Known Anomalies, Limitations, and Failure Modes:**
    *   *Failure Mode 1:* Semantic drift or vector output distortion leading to retrieval of irrelevant guidance.
    *   *Failure Mode 2:* Model version mismatch between ingestion pipeline and runtime retrieval pipeline.
    *   *Failure Mode 3:* Embedding output shape variation across runtime updates (e.g. nested array vs object wrapper).
*   **Risk Analysis & Clinical Impact:** Ingestion/retrieval model mismatch could cause zero relevant chunks to be retrieved (triggering unnecessary fallbacks) or retrieve incorrect clinical information.
*   **Architectural Risk Controls:**
    1.  **Fail-Closed Model Identity Gate (*Rule 04.12*):** `src/retrieval/index.ts:76–83` validates `EXPECTED_EMBEDDING_MODEL` and checks `EMBEDDING_DIMENSIONS === 768`. Any mismatch aborts retrieval immediately and returns safe-empty without invoking Vectorize.
    2.  **Polymorphic Embedding Parser (`extractEmbedding`):** Robust parser in `src/retrieval/index.ts` handling all legacy, array, and nested object return shapes from Workers AI, validating exactly 768 numeric elements.
    3.  **Similarity Gate & Margin Filter:** Cosine similarity threshold ($\ge 0.5$) and 0.08 relevance margin filter discard low-confidence matches.
    4.  **Seed Model Verification:** `scripts/ingest/build-seed.ts` enforces identical model identifier (`@cf/baai/bge-base-en-v1.5`) between ingestion and runtime.
*   **Verification & Acceptance Evidence:**
    *   4 dedicated unit tests in `tests/retrieval.test.ts:281–333` asserting fail-closed behavior on model/dimension mismatch.
    *   105 golden retrieval tests passing in `tests/retrieval-golden.test.ts`.
*   **Monitoring & Surveillance:** Pinned constant in `src/retrieval/index.ts`; dependency re-verification during release gate checks.

---

### SOUP-05: Cloudflare Vectorize
*   **Supplier / Maintainer:** Cloudflare, Inc., San Francisco, CA, USA.
*   **Component Identifier:** Cloudflare Vectorize v2; Vector Index binding `VECTOR_INDEX` (`index_name = "nhs-guidance"`, metric: cosine, dimensions: 768).
*   **Operational Category:** Category 3 (Cloud Vector Database).
*   **Associated Naomi Modules:** M4 (Semantic Retrieval), M7 (Ingestion Pipeline).
*   **IEC 62304 Safety Impact:** **Class B**.
*   **Specified Functional Requirements:**
    1.  Store 768-dimensional dense vector embeddings indexed with unique SHA-256 chunk identifiers.
    2.  Execute top-$k$ nearest neighbor cosine similarity queries ($k = 3\text{--}5$) against user query vectors within $<50\text{ms}$.
    3.  Return match IDs and cosine similarity scores.
*   **Specified Performance Requirements:**
    *   Query latency $\le 50\text{ms}$ at 95th percentile.
    *   Consistent cosine metric scoring between $-1.0$ and $+1.0$.
*   **Hardware and Platform Requirements:** Cloudflare distributed vector database infrastructure.
*   **Known Anomalies, Limitations, and Failure Modes:**
    *   *Failure Mode 1:* Vectorize index corruption, partition drop, or timeout.
    *   *Failure Mode 2:* Index stale relative to updated guidance in D1.
*   **Risk Analysis & Clinical Impact:** Query failure could prevent retrieval of grounded NHS guidance.
*   **Architectural Risk Controls:**
    1.  **Fail-Safe Exception Handling (*Rule 04.14*):** `src/retrieval/index.ts` encapsulates Vectorize queries in try/catch blocks; any error returns `SAFE_EMPTY` (`{ context: "", sources: [], confidence: 0 }`), cleanly triggering honest clinical fallback without unhandled worker crashes.
    2.  **Idempotent SHA-256 Identification:** Chunk IDs in Vectorize are strictly equal to `sha256(chunk_text)`, ensuring deterministic 1:1 synchronization with relational chunks in D1.
*   **Verification & Acceptance Evidence:** Verified in `tests/retrieval.test.ts` (15 tests) and `tests/retrieval-golden.test.ts` (105 tests).
*   **Monitoring & Surveillance:** Cloudflare dashboard metrics; automated smoke check assertion.

---

### SOUP-06: Cloudflare D1 (Serverless SQLite)
*   **Supplier / Maintainer:** Cloudflare, Inc., San Francisco, CA, USA.
*   **Component Identifier:** Cloudflare D1 Database Binding `DB` (`database_name = "nhs-parenting"`, `database_id = "f41a2de8-be77-4061-80a7-c55789843e70"`).
*   **Operational Category:** Category 3 (Relational Edge Database).
*   **Associated Naomi Modules:** M4 (Retrieval Chunk Hydration), M7 (Ingestion Data Storage), M8 (Safeguarding Audit Log).
*   **IEC 62304 Safety Impact:** **Class B**.
*   **Specified Functional Requirements:**
    1.  Store and query full text of NHS guidance chunks in `guidance_chunks` keyed by SHA-256 ID.
    2.  Persist anonymized triage audit records in `triage_audit_log` via parameterized SQL insertions.
    3.  Execute queries with zero relational locks blocking worker event loops.
*   **Specified Performance Requirements:**
    *   Read query latency $\le 20\text{ms}$.
    *   Write transaction latency $\le 100\text{ms}$.
*   **Hardware and Platform Requirements:** Cloudflare distributed SQLite edge engine.
*   **Known Anomalies, Limitations, and Failure Modes:**
    *   *Failure Mode 1:* SQLite write lock contention during high concurrency.
    *   *Failure Mode 2:* Missing chunk ID causing hydration failure.
*   **Risk Analysis & Clinical Impact:** Audit logging write failure could compromise clinical surveillance records. Chunk hydration failure could cause retrieval to return empty context.
*   **Architectural Risk Controls:**
    1.  **Asynchronous Non-Blocking Logging (`ctx.waitUntil`):** Audit writes in M8 execute inside `ctx.waitUntil()`. An audit write error is trapped and logged without affecting the user's chat response or delaying triage.
    2.  **Zero-PII Schema Design (*Rule 02.8*):** `triage_audit_log` schema stores strictly coarse tier, signal category arrays, and salted session pseudonyms. No user message text or IP addresses are persisted, eliminating data breach risk.
*   **Verification & Acceptance Evidence:** Unit tested in `tests/retrieval.test.ts`; schema verified in `tests/retrieval-golden.test.ts`.
*   **Monitoring & Surveillance:** Database query metrics on Cloudflare dashboard; periodic backup verification.

---

### SOUP-07: Cloudflare Workers KV
*   **Supplier / Maintainer:** Cloudflare, Inc., San Francisco, CA, USA.
*   **Component Identifier:** Cloudflare Workers KV Binding `SESSIONS` (`id = "c4c23432ce1a4dd2b6f987d7c4b0c8b2"`).
*   **Operational Category:** Category 3 (Key-Value Edge Store).
*   **Associated Naomi Modules:** M2 (Sliding Window IP Rate Limiting), M5 (Conversational Session History).
*   **IEC 62304 Safety Impact:** **Class B**.
*   **Specified Functional Requirements:**
    1.  Store sliding window request timestamps per IP address for rate limit enforcement (20 req/min).
    2.  Store rolling conversation history (capped at 6 turns) with strict 24-hour expiration (`expirationTtl: 86400`).
*   **Specified Performance Requirements:**
    *   Edge read latency $\le 15\text{ms}$.
    *   Automatic key expiration precisely adhering to TTL.
*   **Hardware and Platform Requirements:** Cloudflare global KV distributed cache.
*   **Known Anomalies, Limitations, and Failure Modes:**
    *   *Failure Mode 1:* Eventual consistency replication delay between edge nodes (up to 60s).
    *   *Failure Mode 2:* KV read/write outage.
*   **Risk Analysis & Clinical Impact:** If KV fails, rate limiting could fail open (DoS risk) or session history could be lost (mild user frustration, no clinical harm).
*   **Architectural Risk Controls:**
    1.  **Stateless Triage Invariance:** Triage (M3) evaluates each incoming query independently and statelessly. Loss of session history never suppresses or downgrades clinical emergency triage.
    2.  **Fail-Safe Rate Limiter:** `src/gateway/kvRateLimit.ts` handles KV errors gracefully; logs warning and fails safe.
    3.  **Strict 24h TTL (*Rule 02.8*):** All session keys enforce 86,400-second TTL, preventing stale session accumulation.
*   **Verification & Acceptance Evidence:** Verified in `tests/rateLimit.test.ts` (6 tests) and `tests/sessions.test.ts` (8 tests).
*   **Monitoring & Surveillance:** KV telemetry via Cloudflare dashboard.

---

### SOUP-08: Cloudflare Queues & R2 Object Storage
*   **Supplier / Maintainer:** Cloudflare, Inc., San Francisco, CA, USA.
*   **Component Identifier:** Cloudflare Queues (`nhs-ingest-queue`), Cloudflare R2 Bucket (`nhs-raw-sources`).
*   **Operational Category:** Category 3 (Asynchronous Batch Infrastructure).
*   **Associated Naomi Modules:** M7 (Knowledge Base Ingestion & Archival).
*   **IEC 62304 Safety Impact:** **Class A**.
*   **Specified Functional Requirements:**
    1.  Buffer and batch ingestion jobs for large-scale NHS crawling.
    2.  Store immutable raw HTML/Markdown source files in R2 for audit and provenance tracking.
*   **Hardware and Platform Requirements:** Cloudflare global storage network.
*   **Risk Analysis & Architectural Controls:** Used solely in offline administrative ingestion pipeline under admin key authentication. Operates asynchronously outside the clinical request-response path. Failure impacts only corpus refresh operations, which are retried via dead-letter queues.
*   **Verification & Acceptance Evidence:** Ingestion pipeline tests in `src/ingest/pipeline.ts`.

---

### SOUP-09: TypeScript Compiler & Language Engine
*   **Supplier / Maintainer:** Microsoft Corporation / Open Source Community.
*   **Component Identifier:** `typescript` (`^5.7.2`), `tsx` (`^4.19.2`).
*   **Operational Category:** Category 4 (Build & Tooling Dependency).
*   **Associated Naomi Modules:** All modules and offline scripts.
*   **IEC 62304 Safety Impact:** **Class A (Tooling)**.
*   **Specified Functional Requirements:**
    1.  Perform static type checking across all 19 source and test files.
    2.  Compile modern TypeScript to standard ECMAScript modules compatible with Cloudflare Workers.
*   **Risk Analysis & Architectural Controls:** Compiler bugs could emit malformed JavaScript. Mitigated by strict compiler configuration (`tsconfig.json`), zero tolerated compilation errors (`npx tsc --noEmit`), and comprehensive automated unit testing of compiled bundles.
*   **Verification & Acceptance Evidence:** `npx tsc --noEmit` compiles with 0 errors and 0 warnings across all codebase files.

---

### SOUP-10: Vitest Automated Test Framework
*   **Supplier / Maintainer:** Vitest Core Team / Open Source.
*   **Component Identifier:** `vitest` (`^2.1.8`).
*   **Operational Category:** Category 4 (Verification Tooling).
*   **Associated Naomi Modules:** Verification Harness (`tests/**/*.ts`).
*   **IEC 62304 Safety Impact:** **Class A (Verification Tooling)**.
*   **Specified Functional Requirements:**
    1.  Execute 356 unit/integration tests and 38 adversarial red-team tests rapidly and deterministically.
    2.  Provide isolated execution sandboxes with custom mock support.
*   **Risk Analysis & Architectural Controls:** False positive test passes could mask regressions. Mitigated by testing tool validation: red-team tests are verified by asserting known failures; production remote smoke checks independently verify live behavior without Vitest.
*   **Verification & Acceptance Evidence:** Clean execution of standard test suite (356 tests passed, 0 failed, 0 skipped in 1.55s) and redteam suite (38 passed, 0 failed).

---

### SOUP-11: Cloudflare Wrangler CLI & Worker Types
*   **Supplier / Maintainer:** Cloudflare, Inc., San Francisco, CA, USA.
*   **Component Identifier:** `wrangler` (`^4.125.0`), `@cloudflare/workers-types` (`^5.20260822.1`), `@cloudflare/workerd-windows-64` (`^1.20260820.1`).
*   **Operational Category:** Category 4 (Packaging & Deployment Tooling).
*   **Associated Naomi Modules:** Deployment pipeline, local dev proxy.
*   **IEC 62304 Safety Impact:** **Class A (Deployment Tooling)**.
*   **Specified Functional Requirements:**
    1.  Bundle code assets, minify JavaScript, and execute deployments to Cloudflare edge networks (`wrangler deploy`).
    2.  Provide accurate TypeScript definitions for Cloudflare runtime globals.
*   **Risk Analysis & Architectural Controls:** Deployment script error could misconfigure environment bindings. Mitigated by version-controlled `wrangler.toml` and mandatory post-deployment golden smoke check.
*   **Verification & Acceptance Evidence:** Successful deployment to `https://nhs-parenting-bot.sufiankane.workers.dev` and verification of bindings.

---

### SOUP-12: Patch-Package Utility
*   **Supplier / Maintainer:** David Herse / Open Source.
*   **Component Identifier:** `patch-package` (`^8.0.1`).
*   **Operational Category:** Category 4 (Build Utility).
*   **Associated Naomi Modules:** Post-install dependency patching.
*   **IEC 62304 Safety Impact:** **Class A**.
*   **Specified Functional Requirements:** Apply persistent, version-controlled diffs to npm packages in `node_modules` during `npm postinstall`.
*   **Risk Analysis & Architectural Controls:** Failure to apply patch could leave known upstream bugs. Mitigated by `postinstall` hook asserting clean patch application; checked into Git in `patches/`.
*   **Verification & Acceptance Evidence:** Clean `npm install` execution and verification of patched modules.

---

### SOUP-13: Node.js Ambient Type Definitions
*   **Supplier / Maintainer:** DefinitelyTyped / Open Source.
*   **Component Identifier:** `@types/node` (`^26.2.0`).
*   **Operational Category:** Category 4 (Development Types).
*   **Associated Naomi Modules:** Offline scripts (`scripts/ingest/*`, `scripts/smoke/*`).
*   **IEC 62304 Safety Impact:** **Class A**.
*   **Specified Functional Requirements:** Provide type declarations for Node.js standard libraries (`node:crypto`, `node:fs`, `node:path`) used in offline maintenance and smoke testing scripts.
*   **Risk Analysis & Architectural Controls:**
    *   *Known Anomaly:* Ambient type definitions can collide with `@cloudflare/workers-types` in worker execution scope.
    *   *Mitigation (*Rule 04.4*):* Strictly placed in `devDependencies`. Production worker code in `src/` does not import Node.js built-ins, relying strictly on standard Web APIs (`crypto.subtle`, `Response`, `Request`).
*   **Verification & Acceptance Evidence:** Clean compilation under `npx tsc --noEmit` without type collisions.

---

## 5. SOUP Anomaly & Known Defect Log

In compliance with IEC 62304 Clause 7.1.3, the following historical and active anomalies related to SOUP components have been investigated, evaluated for clinical safety impact, and resolved:

| Anomaly ID | Date Recorded | Affected SOUP | Anomaly Description | Clinical Safety Impact | Remediation & Risk Control | Resolution Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ANO-01** | 2026-08-21 | SOUP-03 (Meta LLaMA 3.1) | Cloudflare deprecated `@cf/meta/llama-3.1-8b-instruct` (infire backend) on 2026-05-30, causing HTTP 5028 runtime errors during AI invocation. | Inability to generate grounded responses; fallback triggered. | Escalated to Human Gate per Rule 04.12. Executed [ADR 0001](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/nhs-parenting-bot/docs/decisions/0001-generation-model-llama-3.1-8b-fp8-fast.md) migrating pinned model to `@cf/meta/llama-3.1-8b-instruct-fp8-fast`. Re-verified via 38 red-team tests and 10 golden smoke checks. | **CLOSED** |
| **ANO-02** | 2026-08-21 | SOUP-13 (`@types/node`) | Ambient type definition collisions between `@types/node` and `@cloudflare/workers-types` causing TypeScript compilation warnings. | Nil (development build time only). | Verified `@types/node` is confined strictly to `devDependencies` (*Rule 04.4*). Removed ambient type leaks in test runners. Achieved 0 compilation errors. | **CLOSED** |
| **ANO-03** | 2026-08-21 | SOUP-04 (BAAI BGE-Base) | Workers AI response format polymorphism: output format varies across runtime updates between direct nested arrays (`[[...]]`) and object arrays (`{ data: [...] }`). | Vector extraction failure would result in empty embeddings. | Implemented polymorphic extraction logic in `src/retrieval/index.ts:extractEmbedding()`. Strictly validates 768 numeric dimensions before returning. 4 unit tests pass. | **CLOSED** |
| **ANO-04** | 2026-08-21 | SOUP-07 (Workers KV) | Cross-test state leakage during automated Vitest execution due to shared mock KV instances. | Test flakiness; false test confidence. | Enforced per-test KV isolation (*Rule 04.14*) using `mockKvStore.clear()` in `beforeEach` hooks across all test suites. | **CLOSED** |

---

## 6. SOUP Monitoring, Patching, and Upgrade Strategy

### 6.1 Vulnerability and Anomaly Monitoring
1.  **Automated Dependency Scanning:** GitHub Dependabot is enabled on the repository. It performs weekly automated scans of `package-lock.json` against the GitHub Advisory Database (CVE/NVD).
2.  **Cloudflare Platform Surveillance:** Engineering subscribes to the Cloudflare Status portal (`status.cloudflare.com`) and Workers Changelog RSS feeds to monitor breaking API changes or planned deprecations.
3.  **Model Provider Tracking:** Meta AI and BAAI research publications and safety advisories are monitored for known prompt injection vectors or safety regressions.

### 6.2 SOUP Upgrade & Change Control Protocol
Any upgrade or patch to a SOUP component (including minor npm package bumps or foundation model migrations) is governed by the following mandatory protocol:
1.  **Impact Analysis:** The Lead Architect and Clinical Safety Officer evaluate whether the upgrade modifies:
    *   Clinical safety boundaries (M3 Triage, M5 Generation, M6 Escalation).
    *   Embedding dimensions or semantic retrieval performance (M4 Retrieval).
    *   Data storage schemas or privacy boundaries (M8 Audit, KV Sessions).
2.  **Human Gate Decision / ADR:** Any change to an AI model identifier requires a formal Architectural Decision Record and human sign-off (*Rule 04.12*).
3.  **Mandatory Re-Verification:**
    *   Run `npx tsc --noEmit` (assert 0 errors).
    *   Run `npm test` (assert 100% pass across all unit and contract suites).
    *   Run `npm run test:redteam` (assert **0 Tier 1 false negatives**).
    *   Run remote golden smoke check (`remote-golden-check.ts`) against staging environment.
4.  **Log Update:** The update, rationale, and test evidence are recorded in Section 3 and Section 5 of this log.

---

## 7. Terms and Definitions

*   **COTS (Commercial Off-The-Shelf):** Commercially available software not specifically developed for the medical device.
*   **Fail-Closed Gate:** An architectural mechanism that halts processing and safely terminates or degrades an operation if prerequisite conditions (e.g. model identity or dimension) are not satisfied.
*   **FP8 Quantization:** 8-bit floating point precision quantization for neural network weights, optimizing inference speed and memory footprint.
*   **Homoglyph:** A character from a different script (e.g. Cyrillic) sharing visual appearance with a target script character, often used in adversarial prompt injection attacks.
*   **NFKD (Normalization Form Compatibility Decomposition):** Unicode normalization separating formatting characters and accents to canonicalize text inputs.
*   **SOUP (Software of Unknown Provenance):** Software item that is already developed and generally available and that has not been developed for the purpose of being incorporated into the medical device, or software previously developed for which adequate records of development processes are not available (IEC 62304:2015 Clause 3.29).
*   **V8 Isolate:** Lightweight execution sandbox provided by the Google V8 engine, offering memory isolation and security without the overhead of a full virtual machine.

---

## 8. Inputs, Outputs, and Records Generated

### 8.1 Inputs
*   [Software Lifecycle Plan (QMS-62304-01)](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/iso-13485-qms/04-clause-7-product-realisation/software-lifecycle-plan.md).
*   [Supplier Purchasing Procedure (QMS-7.4-01)](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/iso-13485-qms/04-clause-7-product-realisation/supplier-purchasing-procedure.md).
*   [Risk Management File (QMS-14971-02)](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/iso-13485-qms/04-clause-7-product-realisation/risk-management-file.md).
*   Repository configuration files (`package.json`, `package-lock.json`, `wrangler.toml`).

### 8.2 Outputs and Controlled Records
*   Approved revisions of this document ([`QMS-62304-02`](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/iso-13485-qms/04-clause-7-product-realisation/soup-log.md)).
*   Dependabot security audit logs and vulnerability remediation tickets.
*   Architectural Decision Records for SOUP migrations ([`ADR 0001`](file:///c:/Users/sufia/OneDrive/Documents/02_Code/naomi/nhs-parenting-bot/docs/decisions/0001-generation-model-llama-3.1-8b-fp8-fast.md)).
*   Automated verification reports proving SOUP isolation and fail-safe operation.
