# Rules 04 — Engineering Standards

> Placement: `.kilo/rules/04-engineering-standards.md`. Applies to all code-producing agents.

## Language & runtime

1. TypeScript, strict mode. No `any` without a `// justify:` comment.
2. Cloudflare Workers runtime only — no Node.js-only APIs (`fs`, `process`, native modules). Use Web-standard APIs (`fetch`, `crypto`, `ReadableStream`) and Cloudflare bindings via `env`.
3. Keep the Worker within platform limits: favour small modules, lazy initialisation, and streaming (SSE) over buffering full responses.

## Module discipline

4. Implement the module structure from the Spec (M1–M8). One module = one directory = one clear contract. Cross-module calls go through typed interfaces, never deep imports of internals.
5. Module contracts (input/output shapes) defined in the Spec are frozen for Phase 1. Changing a contract requires updating the Spec and the frontend envelope together.
6. The SSE response envelope (`{ type: "token" | "signpost" | "done", payload }`) is a public contract. Additive changes only; never rename or remove a `type`.

## Configuration

7. `wrangler.toml` is the source of truth for bindings (AI, Vectorize, D1, KV, R2, Queues). Access via `env.*` — never hard-code binding names, model IDs, account IDs, or URLs in source.
8. Secrets via `wrangler secret put` only. `.dev.vars` is git-ignored and never committed.

## Testing

9. Framework: Vitest + `@cloudflare/vitest-pool-workers` (Miniflare) for integration.
10. Every module ships with unit tests in the same change as the implementation. Integration tests required when a change crosses a module boundary.
11. Test the safety path first: for any feature, write the "what must never happen" test before the happy-path test.
12. Golden-set tests for retrieval (question → expected NHS source chunk) must be re-run after any change to chunking, embedding, or prompts.

## Code style

13. Small pure functions; side effects at module boundaries. Triage and escalation logic must be pure and synchronously testable.
14. Errors: return safe, generic fallback messages to the client; log detail internally. Never leak stack traces, binding names, or prompt contents.
15. Comments explain *why*, not *what*. Safety-critical branches get a comment citing the rule number from `02-safety-non-negotiables.md`.

## Git

16. Conventional commits referencing Spec task IDs: `feat(triage): keyword lexicon v1 [P1-T3]`.
17. One task per branch/PR. Safety-path changes are always their own PR, never bundled with feature work.

## Live-service fidelity

18. Every external binding (Workers AI, Vectorize, D1, KV, R2, Queues) must have at least one test using a recorded fixture of the service's real response shape, captured from the live API. Fixtures live next to the test with a comment noting capture date and model/service version.
19. Mocks must validate the contract, not just satisfy it. A mock that ignores its inputs (SQL strings, query parameters, payload shapes) is a blind spot: mocks must throw on contract violations (e.g. unknown table names, wrong dimensions).
20. No deploy is complete without one assertion against the live service (the smoke gate). Mock-only green is not deployable green. Rationale: P1-T9 shipped three bugs that 347 mocked tests could not see — wrong D1 table name, wrong Workers AI response shape, unvalidated Vectorize scores.