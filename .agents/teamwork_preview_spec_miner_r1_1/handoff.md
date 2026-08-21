# Handoff Report — Specification Miner (Phase 1 Acceptance Criteria & Gap Table)

**Agent**: `teamwork_preview_spec_miner_r1_1` (Specification Miner)  
**Parent**: `bf0847bd-c742-4f62-8640-658d76550b8a`  
**Timestamp**: 2026-08-21T11:55:00Z  
**Commit Inspected**: `9823668` (`test(smoke): remote golden-check script for post-deploy verification [P1-T9, SafetyBatch F1]`)

---

## 1. Observation

### 1.1 Test Suite Execution Evidence

1. **`npm test`**:
   - **Command**: `vitest run`
   - **Result**: **1 failed | 12 passed (13 total test files)**; **1 failed | 346 passed (347 total tests)**.
   - **Failing test**: `tests/retrieval-golden.test.ts > Emergency routing regression [SafetyBatch F2, rule 02.14] > every chunk that flags an emergency indicator also carries 999/A&E routing` (line 928).
   - **Failure detail**: 4 chunks match an emergency indicator but omit 999/A&E routing:
     1. `"Recognising Signs of Umbilical Cord Infection (Omphalitis)"` (`8a1411361896c96bffb5a400a7e9e84153d7e92c504571649f0f76ce71f86beb`)
     2. `"Foods to Avoid for Babies Under 12 Months: Honey and Choking Risks"` (`f81e810401d247f43ba5dbba054dbff4150edc4b311490cd26ec7db9e4cda95a`)
     3. `"Highchair Safety and Safe Eating Practices"` (`2f96cf55e8e55ed581287849c957dcc6ee966e2a84a52bc4fc635ee0dac4190e`)
     4. `"Safe Teething Relief and Products to Avoid"` (`9bfd820d32c3548796a671306a1c63587a55b9953e2bb18d637fcbe2d87d9257`)
   - **Passing test files**:
     - `tests/retrieval.test.ts`: 15/15 passed (including 4 F3 identity gate tests)
     - `tests/frontend.test.ts`: 29/29 passed
     - `tests/rateLimit.test.ts`: 6/6 passed
     - `tests/sessions.test.ts`: 8/8 passed
     - `tests/redteam/triage-redteam.test.ts`: 25/25 passed
     - `tests/triage.test.ts`: 91/91 passed
     - `tests/generation.test.ts`: 11/11 passed
     - `tests/health.test.ts`: 6/6 passed
     - `tests/chat-flow.test.ts`: 7/7 passed
     - `tests/chat.test.ts`: 21/21 passed
     - `tests/escalation.test.ts`: 10/10 passed
     - `tests/redteam/escalation-redteam.test.ts`: 13/13 passed
     - `tests/retrieval-golden.test.ts`: 104/105 passed

2. **`npm run test:redteam`**:
   - **Command**: `vitest run tests/redteam`
   - **Result**: **2 passed (2 test files)**; **38 passed (38 total tests)**.
   - **Adversarial coverage**: Zero Tier 1 false negatives across prompt injections, escalation suppression, homoglyph attacks, and hostile signpost leakage tests.

3. **`npx tsc --noEmit` on Smoke Check Script**:
   - `scripts/smoke/remote-golden-check.ts` type-checks cleanly (`0 errors`).
   - Project-wide `npx tsc --noEmit` flagged 2 minor type-level issues:
     - `src/index.ts:199`: `env.SESSIONS as unknown as Record<string, unknown>` type cast mismatch with `KVLike`
     - `tests/retrieval-golden.test.ts:38`: `DatabaseSync` duplicate identifier conflict with `@types/node`

4. **Git Repository State**:
   - Working tree contains uncommitted changes in:
     - `.kilo/agents/` (11 files)
     - `.kilo/rules/rules-03-cost-and-model-efficiency.md`
     - `AGENTS.md`
     - `scripts/ingest/data/newborn-care.ts`
     - `scripts/ingest/data/weaning-nutrition.ts`
     - `tests/retrieval-golden.test.ts`
   - Untracked directories: `.agents/`, `PROJECT.md`.
   - Branch `main` is up to date with `origin/main` at commit `9823668`.

---

## 2. P1-T1 through P1-T9 Comprehensive Gap Table

| Task | Criterion Description | Status | File:Line Evidence / Notes |
|---|---|---|---|
| **P1-T1** | Root `package.json` scaffolded with required scripts (`dev`, `test`, `test:redteam`, `deploy`, `ingest`) | **MET** | `package.json:6-12` defines all 5 mandatory scripts. |
| **P1-T1** | Root `.gitignore` configured ignoring `.env`, `.dev.vars`, `node_modules`, `.wrangler`, `dist`, `coverage` | **MET** | `.gitignore:1-8` contains `.env`, `.dev.vars`, `node_modules`, `.wrangler`, `dist`, `coverage`. |
| **P1-T1** | `wrangler.toml` configured with bindings (`AI`, `VECTOR_INDEX`, `DB`, `SESSIONS`, `RAW_CONTENT`, `INGEST_QUEUE`) and vars (`SIMILARITY_THRESHOLD="0.5"`, `RATE_LIMIT_PER_MINUTE="20"`) | **MET** | `wrangler.toml:5-34` defines all bindings and variables as single source of truth. |
| **P1-T1** | `GET /health` endpoint returns HTTP 200 with `{ status: "ok", timestamp }` locally and deployed | **MET** | `src/index.ts:43-57` implements `GET /health` returning 200 with JSON payload; verified by `tests/health.test.ts:34-45`. |
| **P1-T1** | `GET /health` safety leak prevention (no bindings, model names, stack traces) | **MET** | Verified by `tests/health.test.ts:47-60` with `assertNoEnvLeak` and `assertNoInternalDetails`. |
| **P1-T1** | Non-GET methods on `/health` return 405 `METHOD_NOT_ALLOWED` in frozen error envelope | **MET** | `src/index.ts:59-64` returns `createErrorResponse(405, "METHOD_NOT_ALLOWED", ...)`; tested in `tests/health.test.ts:62-72`. |
| **P1-T2** | `POST /chat` endpoint defined with CORS, rate limiting, validation, and safe error handling | **MET** | `src/index.ts:68-249` orchestrates `/chat` lifecycle. |
| **P1-T2** | Content-Type header validation (`application/json` required, returns 415 `INVALID_CONTENT_TYPE`) | **MET** | `src/gateway/validate.ts:12-23`; tested in `tests/chat.test.ts:193-208`. |
| **P1-T2** | Request body size limit (4KB maximum, returns 413 `PAYLOAD_TOO_LARGE`) | **MET** | `src/gateway/validate.ts:40-50`; tested in `tests/chat.test.ts:210-225`. |
| **P1-T2** | Request JSON syntax & object validation (returns 400 `INVALID_JSON`) | **MET** | `src/gateway/validate.ts:52-77`; tested in `tests/chat.test.ts:227-257`. |
| **P1-T2** | Message field validation (required, string, non-empty, max 2000 chars, returns 400 `VALIDATION_ERROR`) | **MET** | `src/gateway/validate.ts:81-116`; tested in `tests/chat.test.ts:259-306`. |
| **P1-T2** | Optional `session_id` validation (string <= 255 chars, returns 400 `VALIDATION_ERROR` on failure) | **MET** | `src/gateway/validate.ts:118-130`; tested in `tests/chat.test.ts:308-323`. |
| **P1-T2** | Non-POST/OPTIONS methods on `/chat` return 405 `METHOD_NOT_ALLOWED` | **MET** | `src/index.ts:225-230`; tested in `tests/chat.test.ts:326-337`. |
| **P1-T2** | CORS preflight `OPTIONS` handled with 204, allow-origin, methods, headers, max-age 86400, no credentials | **MET** | `src/gateway/cors.ts:20-33`; tested in `tests/chat.test.ts:92-137`. |
| **P1-T2** | CORS headers preserved on error responses for allowed origins | **MET** | `src/index.ts:37-39, 240-248`; `src/gateway/validate.ts:10`; tested in `tests/chat.test.ts:140-189`. |
| **P1-T2** | Frozen error envelope contract `{ type: "error", payload: { code, message } }` enforced | **MET** | `src/gateway/error.ts:1-34`; tested in `tests/chat.test.ts:204-207`. |
| **P1-T2** | Catch-all unhandled route handler returns 404 `NOT_FOUND` in frozen error envelope | **MET** | `src/index.ts:234-239`; tested in `tests/chat.test.ts:425-437`. |
| **P1-T2** | Top-level 500 handler returns generic safe 500 `SERVER_ERROR` with zero internal detail leakage | **MET** | `src/index.ts:240-249`; tested in `tests/chat.test.ts:478-514`. |
| **P1-T3** | Pure synchronous `triage(message)` function with zero I/O | **MET** | `src/triage/index.ts:37-102` (pure function, no console logging or fetch). |
| **P1-T3** | Robust text normalization (NFKD, strip `\p{Cf}`/`\p{M}`, homoglyphs, apostrophes, whitespace) | **MET** | `src/triage/normalize.ts:1-45`; tested in `tests/triage.test.ts:15-68`. |
| **P1-T3** | Deterministic keyword lexicon (12 Tier 1, 10 Tier 2, 8 Tier 3 categories) deeply frozen at runtime | **MET** | `src/triage/lexicon.ts:23-404` with recursive `deepFreeze`. |
| **P1-T3** | Word-boundary phrase matching preventing false substring matches inside longer words | **MET** | `src/triage/index.ts:22-35` (`padded.includes(' ${phrase} ')`); tested in `tests/triage.test.ts:110-145`. |
| **P1-T3** | Strict Tier 1 lexicon precedence: any Tier 1 hit immediately resolves Tier 1, overriding other tiers | **MET** | `src/triage/index.ts:76-78`; tested in `tests/triage.test.ts:150-180`. |
| **P1-T3** | Output contract: `{ tier, matched_signals, signal_categories, confidence }` | **MET** | `src/triage/types.ts:3-8`; `matched_signals` in-memory only; `signal_categories` coarse categories. |
| **P1-T3** | Degradation failsafe: unexpected triage error falls back to Tier 2 with `confidence: 0.0` (never Tier 4) | **MET** | `src/triage/index.ts:90-101`; tested in `tests/triage.test.ts:250-270`. |
| **P1-T3** | Automated red-team adversarial suite passes with zero Tier 1 false negatives | **MET** | `tests/redteam/triage-redteam.test.ts`: 25/25 passed. |
| **P1-T4** | Pure synchronous escalation router `escalate(tier: 1\|2\|3\|4)` sitting outside LLM path | **MET** | `src/escalation/index.ts:27-63` accepts only pre-classified tier number. |
| **P1-T4** | Canonical UK contact constants matching rules-01 §5 verbatim (999, 111, NSPCC, Childline, Young Minds, National DA) | **MET** | `src/escalation/contacts.ts:15-65` deeply frozen constants; tested in `tests/escalation.test.ts:15-55`. |
| **P1-T4** | Immutable signpost templates for Tiers 1–3 in warm UK English copy | **MET** | `src/escalation/templates.ts:4-23` deeply frozen templates. |
| **P1-T4** | Tier 3 signpost always returns all four canonical safeguarding services without omission | **MET** | `src/escalation/index.ts:44-47`, `src/escalation/contacts.ts:59-64`; tested in `tests/escalation.test.ts:60-78`. |
| **P1-T4** | Deep immutability: contacts, templates, and payloads frozen at runtime | **MET** | `src/escalation/contacts.ts:3-13`, `src/escalation/index.ts:52-62`. |
| **P1-T4** | Zero user-text or LLM leakage into signpost payloads | **MET** | Verified by `tests/redteam/escalation-redteam.test.ts`: 13/13 passed. |
| **P1-T5** | Curated source allow-list in `content/sources.json` (48 sources across 7 canonical categories, UK spellings, `nhs.uk`) | **MET** | `content/sources.json:1-546`; all 7 categories present. |
| **P1-T5** | Seed corpus contains ≥ 50 NHS-sourced chunks (actual: 74 chunks with deterministic SHA-256 IDs) | **MET** | `content/nhs_faq_seed.json:1-1200` contains 74 validated chunks. |
| **P1-T5** | Chunk length within approved 150–400 word acceptance band | **MET** | Checked across all 74 chunks (152–199 words); tested in `tests/retrieval-golden.test.ts:820-850`. |
| **P1-T5** | Deterministic SHA-256 identity: `chunk.id === chunk.content_hash === sha256(chunk.chunk_text.trim())` | **MET** | `scripts/ingest/types.ts:94-96`; `scripts/ingest/seed.ts:61-71`; verified for all 74 chunks. |
| **P1-T5** | Strict ingestion & seeding provenance gates (enabled source, exact canonical URL match, exact category match) | **MET** | `scripts/ingest/seed.ts:36-85`; `scripts/ingest/build-seed.ts:36-50`. |
| **P1-T5** | Safe SQL emission with single audited literal escaping helper (`quoteSql`) and closed category enum | **MET** | `scripts/ingest/seed.ts:34, 73-84, 96-100`. |
| **P1-T5** | D1 schema in `src/db/schema.sql` (`guidance_chunks`, `ingestion_log`, `triage_audit_log`) | **MET** | `src/db/schema.sql:7-56`. |
| **P1-T5** | Golden retrieval test suite with 24 golden scenarios across all 7 categories | **MET** | `tests/retrieval-golden.test.ts`: 24 scenarios passing. |
| **P1-T5** | SafetyBatch F2 Emergency routing regression (every emergency-indicator chunk carries 999/A&E routing) | **GAP** | **Failing on 4 chunks** in `tests/retrieval-golden.test.ts:928`. Requires applying human-approved remediation sentences to the 4 chunks, regenerating seed, and committing green. |
| **P1-T6** | M4 Retrieval embeds query via pinned `@cf/baai/bge-base-en-v1.5`, Vectorize top-k, D1 fetch, threshold filter | **MET** | `src/retrieval/index.ts:12-159`; tested in `tests/retrieval.test.ts:82-121`. |
| **P1-T6** | M4 Retrieval fail-safe: any failure returns `{ context: "", sources: [], confidence: 0 }` and never throws | **MET** | `src/retrieval/index.ts:25-29, 160-163`; tested in `tests/retrieval.test.ts:220-259`. |
| **P1-T6** | M4 Embedding identity gate (SafetyBatch F3): fail-closed on model mismatch or ≠768 dims | **MET** | `src/retrieval/index.ts:76-84, 96-97`; tested in `tests/retrieval.test.ts:281-333` (4 unit tests). |
| **P1-T6** | M5 Generation model pinned to `@cf/meta/llama-3.1-8b-instruct` | **MET** | `src/generation/prompt.ts:12`; `src/generation/index.ts:55-58`; tested in `tests/generation.test.ts:147-150`. |
| **P1-T6** | M5 System prompt explicitly forbids diagnosing, prescribing, contradicting escalation, revealing system prompt | **MET** | `src/generation/prompt.ts:23-31`; tested in `tests/generation.test.ts:76-92`. |
| **P1-T6** | User input interpolated strictly as quoted structured data, never concatenated into system instructions | **MET** | `src/generation/prompt.ts:44-62`; tested in `tests/generation.test.ts:98-140`. |
| **P1-T6** | M5 Output contract: SSE token stream terminating in `done` with `{ session_id, sources }`, or safe error fallback | **MET** | `src/generation/index.ts:64-130`; tested in `tests/generation.test.ts:170-220`. |
| **P1-T6** | Invariant (a): `triage()` invoked synchronously before any retrieval or generation call | **MET** | `src/index.ts:98` (triage at line 98, retrieve at line 140, generate at line 207); tested in `tests/chat-flow.test.ts:167-248`. |
| **P1-T6** | Invariant (b): Tier 1/2/3 paths invoke zero AI or Vectorize calls | **MET** | `src/index.ts:103-134`; tested in `tests/chat-flow.test.ts:167-248`. |
| **P1-T6** | Invariant (c): M5 system prompt explicitly forbids all 4 rule-02.6 behaviours | **MET** | `src/generation/prompt.ts:25-29`; tested in `tests/generation.test.ts:76-92`. |
| **P1-T6** | Invariant (d): User input interpolated as structured data only | **MET** | `src/generation/prompt.ts:49-62`; tested in `tests/generation.test.ts:98-140`. |
| **P1-T6** | Invariant (e): Low-confidence Tier 4 produces honest fallback, never improvised clinical content | **MET** | `src/index.ts:152-192`; tested in `tests/chat-flow.test.ts:271-300`. |
| **P1-T6** | Invariant (f): Session KV write is TTL-bounded (24h) and PII-free | **MET** | `src/sessions/store.ts:17, 84-86`; `src/sessions/types.ts:1-5`; tested in `tests/sessions.test.ts:102-124, 210-238`. |
| **P1-T7** | Accessible single-box frontend UI (`public/index.html`) with label, input, button, `aria-live` polite response region | **MET** | `public/index.html:126-134`; tested in `tests/frontend.test.ts:15-80`. |
| **P1-T7** | Keyboard accessibility (Enter submits, auto-focus, disabled during in-flight request) | **MET** | `public/widget.js:108-111, 162-177`; tested in `tests/frontend.test.ts:90-140`. |
| **P1-T7** | Safe frontend rendering: text nodes only (no `innerHTML`/`eval` injection surface) | **MET** | `public/widget.js:68-97, 100-102`; tested in `tests/frontend.test.ts:150-190`. |
| **P1-T7** | Verbatim signpost contact rendering without transformation or omission | **MET** | `public/widget.js:73-97`; tested in `tests/frontend.test.ts:200-240`. |
| **P1-T7** | Server-issued session ID management (client only echoes server ID, never invents one on first message) | **MET** | `public/widget.js:26-32, 65`; tested in `tests/frontend.test.ts:250-280`. |
| **P1-T8** | KV-backed fixed-window rate limiter in `src/gateway/kvRateLimit.ts` (60s window, `ratelimit:` prefix, IP-keyed) | **MET** | `src/gateway/kvRateLimit.ts:28-124`; tested in `tests/rateLimit.test.ts:71-180`. |
| **P1-T8** | Configurable limit via `RATE_LIMIT_PER_MINUTE` (default 20; invalid/<=0 falls back to 20) | **MET** | `src/gateway/kvRateLimit.ts:35-44`; tested in `tests/rateLimit.test.ts:90-110`. |
| **P1-T8** | Rate limiter fails OPEN on KV failure/missing binding (abuse control only; safety gate is M3) | **MET** | `src/gateway/kvRateLimit.ts:62-63, 120-123`; tested in `tests/rateLimit.test.ts:129-152`. |
| **P1-T8** | Rate limiter never persists, logs, or returns client IP | **MET** | `src/gateway/kvRateLimit.ts:8-9, 104-119`; tested in `tests/rateLimit.test.ts:181-208`. |
| **P1-T8** | Session store in `src/sessions/store.ts` with UUID v4 session IDs, `session:` prefix | **MET** | `src/sessions/store.ts:21-27`; tested in `tests/sessions.test.ts:65-76`. |
| **P1-T8** | 24-hour TTL (`expirationTtl: 86400`) enforced on every KV put and re-checked on get | **MET** | `src/sessions/store.ts:17, 50-51, 84-86`; tested in `tests/sessions.test.ts:102-160, 184-206`. |
| **P1-T8** | Session history capped at 50 messages (oldest dropped) | **MET** | `src/sessions/store.ts:19, 79-81`; tested in `tests/sessions.test.ts:162-180`. |
| **P1-T8** | Session records contain no PII beyond role/content/at | **MET** | `src/sessions/types.ts:1-12`; tested in `tests/sessions.test.ts:210-238`. |
| **P1-T8** | Corrupted KV JSON fails safe (null on get, fresh record on append, never throws) | **MET** | `src/sessions/store.ts:39-56, 71-76`; tested in `tests/sessions.test.ts:240-258`. |
| **P1-T8 / Dev-Dep** | `@types/node` placed in `devDependencies`, not `dependencies` | **MET** | `package.json:15` contains `"@types/node": "^26.2.0"` in `devDependencies`. |
| **P1-T8 / Tests** | Per-test KV store isolation / reset in test files | **GAP** | `tests/rateLimit.test.ts`, `tests/sessions.test.ts`, and `tests/chat-flow.test.ts` instantiate fresh `MockKv` per test. However, `tests/chat.test.ts:70` shares a module-scoped `mockKvStore` without a `beforeEach(() => mockKvStore.clear())`. |
| **P1-T9** | Full test pass across all 13 test files | **GAP** | 12/13 files pass; 1 file has 1 failing test (`tests/retrieval-golden.test.ts` line 928 due to F2 corpus findings). |
| **P1-T9** | Automated `npm run test:redteam` executed with zero Tier 1 false negatives | **MET** | 2/2 files pass; 38/38 tests pass with 0 Tier 1 false negatives. |
| **P1-T9** | Manual post-deploy smoke script `scripts/smoke/remote-golden-check.ts` created and type-checks cleanly (F1 prep) | **MET** | `scripts/smoke/remote-golden-check.ts:1-299` covers 10 questions across 7 categories, frozen envelope, leak checks, 30s timeouts, exit 1; type-checks with 0 errors. |
| **P1-T9** | Fail-closed embedding identity gate in `src/retrieval/index.ts` + 4 unit tests (F3 resolved) | **MET** | `src/retrieval/index.ts:76-84, 96-97`; `tests/retrieval.test.ts:281-333` (4 passing tests). |
| **P1-T9** | Content-alignment spot-check for merged URLs against `content/sources.json` | **MET** | All 74 chunks in `content/nhs_faq_seed.json` validated against `content/sources.json` via `generateSeedingPayload()`. |
| **P1-T9** | Git repository clean and all commits pushed to `origin/main` | **GAP** | Working tree has unstaged edits in `.kilo/`, `AGENTS.md`, `scripts/ingest/data/`, `tests/retrieval-golden.test.ts` and untracked `.agents/`, `PROJECT.md`. |
| **P1-T9** | Live deployment to `*.workers.dev` | **GAP** | Deployment is human-only (non-negotiable rule). Codebase is pre-verified and gated for human deploy. |

---

## 3. Features Discovered & Probed

```
## Features Discovered
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|---|---|---|---|---|---|---|
| 1 | Health Check | GET /health | Liveness & health probe | GET request to /health | 200 JSON `{ status: "ok", timestamp }` | 405 for non-GET | `src/index.ts:43-65` |
| 2 | Gateway | POST /chat Validation | Request body and header validation | Request with headers & JSON body | Validated `{ message, sessionId }` | 415 (Content-Type), 413 (>4KB), 400 (malformed/empty/length) | `src/gateway/validate.ts:8-139` |
| 3 | Gateway | CORS Preflight & Headers | Allow-list based CORS negotiation | Origin header, OPTIONS request | 204 No Content + Access-Control headers | Null origin when disallowed | `src/gateway/cors.ts:3-33` |
| 4 | Rate Limiter | Fixed-Window Rate Limiting | KV-backed 60s per-IP rate limiter | Client IP, `RATE_LIMIT_PER_MINUTE` | `{ allowed: boolean, retryAfter?: string }` | Fails OPEN on KV error or missing binding | `src/gateway/kvRateLimit.ts:28-124` |
| 5 | Triage (M3) | Unicode Normalization & Homoglyph Mapping | Canonicalizes Unicode, format chars, homoglyphs, apostrophes | Raw user string | Normalized ASCII/Latin lowercased string | Returns empty string on non-string | `src/triage/normalize.ts:1-45` |
| 6 | Triage (M3) | Deterministic Keyword Lexicon & Precedence | Tier 1-3 phrase matching with word boundaries | Normalized message string | `{ tier, matched_signals, signal_categories, confidence }` | Fails safe to Tier 2 `confidence: 0.0` on exception | `src/triage/index.ts:37-102` |
| 7 | Escalation (M6) | Verbatim Signposting Router | Pure synchronous signpost assembly from constants/templates | `tier: 1\|2\|3\|4` | Frozen `SignpostEvent` or `null` | Returns `null` for Tier 4 | `src/escalation/index.ts:27-63` |
| 8 | Escalation (M6) | Canonical UK Helpline Constants | Hard-coded immutable contact details (999, 111, NSPCC, Childline, Young Minds, National DA) | None | Frozen `SignpostService[]` | Deeply frozen at runtime | `src/escalation/contacts.ts:15-65` |
| 9 | Retrieval (M4) | Semantic Search & Threshold Filtering | Embeds query, queries Vectorize, filters by similarity threshold, fetches D1 chunks | Query string, env (`AI`, `VECTOR_INDEX`, `DB`) | `{ context, sources, confidence }` | Fails safe to `{ context: "", sources: [], confidence: 0 }` | `src/retrieval/index.ts:12-164` |
| 10 | Retrieval (M4) | Embedding Identity & Dimension Gate | Validates expected model name and 768-dim vector before querying Vectorize | `env.EXPECTED_EMBEDDING_MODEL`, vector | Pass-through or safe-empty | Returns safe-empty before AI/Vectorize call | `src/retrieval/index.ts:76-97` |
| 11 | Generation (M5) | Structured Prompt Construction | Enforces 4 critical prohibitions, interpolates user text as structured data | Message, context, sources | `Message[]` (`system`, `user`) | Pure function | `src/generation/prompt.ts:23-62` |
| 12 | Generation (M5) | SSE Grounded Answer Streaming | Streams LLM tokens and terminates with `done` event | Env (`AI`), `GenerateInput` | `ReadableStream` of SSE events | Emits `error` then `done` with `fallback: true` | `src/generation/index.ts:42-130` |
| 13 | Session Store | KV Session Store with TTL | UUID v4 sessions, 50-message cap, 24-hour TTL refreshed on put | `kv`, `sessionId`, `MessageEntry` | `SessionRecord` | Returns null on expired/corrupt record | `src/sessions/store.ts:17-88` |
| 14 | Ingestion (M7) | Knowledge Base Seed & Hash Integrity | Validates allow-list sources, canonical URLs, categories, SHA-256 hashes | `content/sources.json`, data modules | `content/nhs_faq_seed.json`, D1 SQL | Throws with chunk title on any gate failure | `scripts/ingest/seed.ts:13-121` |
| 15 | Frontend (M1) | Single-Box Accessible Widget | Accessible input, text-node rendering, verbatim signposts, SSE parsing | User DOM events, SSE stream | Rendered DOM elements | Generic safe error on network/stream failure | `public/widget.js:19-184` |
| 16 | Smoke Test | Remote Golden-Check Script | Post-deploy remote verification of 10 golden questions across 7 categories | `SMOKE_TARGET_URL` | Pass/Fail report, exit code 0/1 | Exits with 1 on any failure | `scripts/smoke/remote-golden-check.ts:1-299` |
```

---

## 4. Edge Cases Observed

```
## Edge Cases
| # | Feature | Input | Observed Behavior |
|---|---|---|---|
| 1 | M3 Triage Normalization | Cyrillic homoglyph lookalikes (e.g. `nоt brеаthing`) | Canonicalized to Latin ASCII and correctly matched as Tier 1 (`respiratory_arrest`). |
| 2 | M3 Triage Normalization | Invisible Unicode format chars (`\u200B`, `\uFEFF`, soft hyphens) | Format chars stripped before phrase matching; successfully matches Tier 1 terms. |
| 3 | M3 Triage Word Boundaries | Words containing lexicon substrings (e.g. "comatose", "seizures") | Padded space matching ensures "coma" does not false-positive on "comatose". |
| 4 | M3 Triage Precedence | Compound input with Tier 1 and Tier 3 phrases (e.g. "partner hits child and baby is not breathing") | Resolves strictly to Tier 1 while capturing all categories in `signal_categories`. |
| 5 | M3 Triage Degradation | Simulated exception thrown inside `triage()` | Fails safe to `{ tier: 2, matched_signals: ["DEGRADATION_FAILSAFE"], confidence: 0.0 }`. |
| 6 | M4 Retrieval Gate | `EXPECTED_EMBEDDING_MODEL` set to a mismatched string | Returns `{ context: "", sources: [], confidence: 0 }` with ZERO AI or Vectorize calls. |
| 7 | M4 Retrieval Gate | Embedding vector returned with length 767 (≠768) | Returns `{ context: "", sources: [], confidence: 0 }` with ZERO Vectorize calls. |
| 8 | M4 Retrieval Threshold | Query matches with similarity score 0.3 (< 0.5 threshold) | Match dropped; returns `{ context: "", sources: [], confidence: 0 }`, triggering honest fallback in M5. |
| 9 | M2 Rate Limiter Fail-Open | Missing `SESSIONS` binding or throwing KV get/put | Returns `{ allowed: true }` so abuse limiter outage never blocks a user in crisis. |
| 10 | KV Session Store TTL | Session record read 25 hours after creation | `Date.parse(record.expires_at) <= Date.now()` triggers; `getSession` returns `null`. |
| 11 | KV Session Store Corrupt JSON | Corrupted non-JSON string in KV session key | `getSession` returns `null`; `appendMessage` initializes a fresh record without throwing. |
| 12 | Corpus Emergency Routing (F2) | 4 corpus chunks with emergency indicators but no 999/A&E | Caught by `tests/retrieval-golden.test.ts:928` emergency routing regression test. |
```

---

## 5. Logic Chain

1. **Safety Architecture Logic**:
   - Every inbound request hits `src/index.ts:98` and must pass synchronous `triage(message)`.
   - If `tier !== 4`, lines 103–134 immediately construct and return an M6 signpost stream from immutable constants in `src/escalation/contacts.ts` and `src/escalation/templates.ts`. Zero calls to `env.AI` or `env.VECTOR_INDEX` are made.
   - If `tier === 4`, line 140 calls `retrieve(env, message)`. If retrieval similarity is below `SIMILARITY_THRESHOLD` (default 0.5) or context is empty, lines 152–192 immediately return the honest fallback without calling generation.
   - Only above-threshold Tier 4 queries invoke `generateAnswer` (line 207). User input is passed as structured data inside `userContent` in `src/generation/prompt.ts:49-62`, where `SYSTEM_PROMPT` forbids diagnosing, prescribing, contradicting escalation, and prompt leaking.
   - Therefore, all six P1-T6 safety invariants are mathematically enforced by the code path.

2. **Residual Gap Logic**:
   - **F2**: The 4 chunks in the corpus ("Recognising Signs of Umbilical Cord Infection (Omphalitis)", "Foods to Avoid for Babies Under 12 Months: Honey and Choking Risks", "Highchair Safety and Safe Eating Practices", "Safe Teething Relief and Products to Avoid") trigger the emergency regression test in `tests/retrieval-golden.test.ts:928`. Applying the human-approved 999/A&E sentences from `SafetyBatch.md` §F2 and regenerating `content/nhs_faq_seed.json` will make `npm test` 347/347 green.
   - **F3**: Verified resolved in `src/retrieval/index.ts:76-97` and covered by 4 green unit tests in `tests/retrieval.test.ts:281-333`.
   - **F1 (Smoke script)**: Verified present in `scripts/smoke/remote-golden-check.ts`, type-checks cleanly, and fully conforms to the stated 10-question smoke specification.
   - **Content Alignment**: Verified via `generateSeedingPayload()`, proving exact URL, category, and SHA-256 hash alignment across all 74 chunks.
   - **Per-Test KV Reset**: Adding `beforeEach(() => { mockKvStore.clear(); })` to `tests/chat.test.ts` eliminates cross-test state leakage risk.

---

## 6. Caveats

1. **Read-Only Scope**: In strict accordance with the Specification Miner role, no files were modified in `src/`, `tests/`, `scripts/`, or `content/`.
2. **Deploy Gate**: Live deployment to `*.workers.dev` and running remote smoke checks are human-only commands and cannot be executed by autonomous agents.
3. **Clinical Safety Sign-Off**: The 4 chunk text amendments for F2 must receive the dedicated external safety reviewer pass documented in `DEPLOY-READINESS.md`.

---

## 7. Conclusion

The Phase 1 codebase is structurally and architecturally complete. All module contracts (M1 through M8, frozen SSE envelopes, error codes, rate limiting, session TTL, and safety invariants) are fully verified with exact `file:line` evidence. 

There are four specific, actionable items for builder handoff:
1. **F2 (Corpus update)**: Apply the 4 human-approved 999/A&E remediation sentences to `scripts/ingest/data/newborn-care.ts` and `scripts/ingest/data/weaning-nutrition.ts`, regenerate `content/nhs_faq_seed.json` via `npx tsx scripts/ingest/build-seed.ts`, and confirm `tests/retrieval-golden.test.ts` passes 105/105.
2. **Type Check Hygiene**: Fix the `KVLike` cast in `src/index.ts:199` and `DatabaseSync` duplicate identifier in `tests/retrieval-golden.test.ts:38`.
3. **KV Test Reset**: Add `beforeEach(() => mockKvStore.clear())` to `tests/chat.test.ts`.
4. **Git Commit & Push**: Commit all changes using `type(scope): message [TASK-ID]` format and push to `origin/main`.

Following builder gap closure and verifier audit, `DEPLOY-READINESS.md` can be finalized for the human deployer.

---

## 8. Verification Method

To independently reproduce and verify this audit:
```bash
# 1. Run unit & contract test suite (shows 346 passing, 1 failing on F2)
npm test

# 2. Run red-team adversarial suite (shows 38/38 passing, 0 Tier 1 false negatives)
npm run test:redteam

# 3. Type-check smoke check script
npx tsc --noEmit --target ES2022 --module ESNext --moduleResolution Bundler --skipLibCheck scripts/smoke/remote-golden-check.ts

# 4. Verify ingestion provenance gates and SHA-256 hashes across all 74 chunks
npx tsx -e "import { generateSeedingPayload } from './scripts/ingest/seed'; const res = generateSeedingPayload(); console.log(JSON.stringify({ totalSources: res.totalSources, totalChunks: res.totalChunks, verified: res.verifiedProvenance }, null, 2));"
```
