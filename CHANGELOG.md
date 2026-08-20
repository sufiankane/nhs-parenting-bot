# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to Semantic Versioning.

## [Unreleased]

### Added
- `[P1-T1]` Scaffolded root `package.json` with scripts: `dev`, `test`, `test:redteam`, `deploy`, `ingest`.
- `[P1-T1]` Created root `.gitignore` ignoring `.env`, `.dev.vars`, `node_modules`, `.wrangler`, `dist`, and `coverage`.
- `[P1-T1]` Configured `wrangler.toml` with bindings `AI`, `VECTOR_INDEX`, `DB`, `SESSIONS`, `RAW_CONTENT`, `INGEST_QUEUE` and vars `SIMILARITY_THRESHOLD = "0.5"`, `RATE_LIMIT_PER_MINUTE = "20"`.
- `[P1-T1]` Added TypeScript configuration in `tsconfig.json` and Vitest config in `vitest.config.ts`.
- `[P1-T1]` Implemented minimal Cloudflare Worker entry point in `src/index.ts` with safe `GET /health` endpoint and generic 404 fallback.
- `[P1-T1]` Authored health contract and safety leak-prevention test suite in `tests/health.test.ts` (6 passing tests).
- `[P1-T2]` Implemented M2 gateway modules in `src/gateway/` (`error.ts`, `cors.ts`, `rateLimit.ts`, `validate.ts`) with the frozen `{type:"error", payload:{code,message}}` error envelope (rule 04.6).
- `[P1-T2]` Wired `POST /chat` in `src/index.ts`: CORS allow-list → rate limit → validation → safe `SERVICE_UNAVAILABLE` stub until M3/M4/M5/M6 exist (rule 02.1: no code path bypasses triage).
- `[P1-T2]` Added `ALLOWED_ORIGINS` to `Env`; rate limit reads `RATE_LIMIT_PER_MINUTE` (default 20 req/min/IP) from env.
- `[P1-T2]` Added typed `Env` interface in `src/gateway/types.ts` and imported it in `cors.ts`, `rateLimit.ts`, and `src/index.ts`, replacing `any` (independent-reviewer finding).
- `[P1-T2]` Added `"NOT_FOUND"` to the `ErrorCode` union and routed the catch-all 404 through `createErrorResponse` so every error path emits the frozen `{type:"error", payload:{code,message}}` envelope (rule 04.6).
- `docs/architecture-and-action-plan.md`: Authoritative Spec moved from `.kilo/plans/` to `docs/` and updated under task `[P0-T1]`.
- `docs/decisions/.gitkeep`: Directory initialized for Architecture Decision Records (ADRs).
- `CHANGELOG.md`: Initialized to track task IDs, architectural changes, deviations, and rationale.

### Changed
- `[P1-T2]` Declared `corsHeaders` before the `try` block in `src/index.ts` and propagated it into the top-level 500 `catch (error)` handler so cross-origin error responses maintain valid CORS headers (rules 02.5, 04.14).
- `[P0-T1]` Corrected Spec task dependencies: P1-T6 now explicitly depends on P1-T2, P1-T3, P1-T4, and P1-T5 to enforce triage and escalation before generation is wired into `/chat`.
- `[P0-T1]` Enforced automated red-team safety gate in Phase 1 (P1-T9) and Phase 2 (P2-T5): mandatory `npm run test:redteam` with zero Tier 1 false negatives required before every deployment touching M3/M5/M6/prompts/lexicon/content (rule 02.11).
- `[P0-T1]` Clarified M3 classifier constraints: separate from generation model; classifier may escalate but never downgrade a Tier 1 lexicon hit; added explicit deterministic degradation mode to keyword-only if classifier fails.
- `[P0-T1]` Enforced M6 immutability: all signpost payload fields (`tier`, `headline`, `reason_plain_language`, `services`) assembled exclusively from typed immutable templates and `src/escalation/contacts.ts` constants (canonical UK contacts matching `.kilo/rules/01-project-context.md` §5). Zero user-derived or LLM content in signposts.
- `[P0-T1]` Added explicit M5 system prompt prohibitions (diagnosing, prescribing, contradicting escalation, revealing system prompts) and structured data interpolation requirement for user inputs.
- `[P0-T1]` Specified 24-hour KV session TTL and env-configurable rate limiting in P1-T8 and `wrangler.toml` reference.
- `[P0-T1]` Consolidated frozen SSE envelope contract (`token`, `signpost`, `error`, `done`), fallback reason mapping, and backend-generated session ID semantics in §4.0.
- `[P0-T1]` Defined D1 audit schema in M8 (no PII, no raw text; coarse categorical tags only) and updated risk register with model drift, Vectorize corruption, and classifier unavailability mitigations.
- `[P0-T1]` Expanded P1-T1 acceptance criteria to include root package.json scaffolding with required npm scripts (dev, test, test:redteam, deploy, ingest), root .gitignore configuration, and wrangler.toml bindings.
- `[P0-T1]` Specified M7 ingestion validation rules (allow-list verification in `content/sources.json`, chunk length validation, SHA-256 content hashing for transactional idempotency).
