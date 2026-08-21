# ADR 0001: Generation Model Selection — @cf/meta/llama-3.1-8b-instruct-fp8-fast

- **Status:** Approved (Human Gate Decision)
- **Date:** 2026-08-21
- **Deciders:** Human Operator / Safety Lead, Lead Integrator
- **Scope:** M5 Grounded Generation (`src/generation/prompt.ts`, `src/generation/index.ts`)
- **Rules Protected:** rule 04.12 (pinned model governance), rule 02.6 (grounded safety prohibitions), Spec §4 M5

---

## Context

The initial specification (Spec §4 M5) pinned the grounded generation model to `@cf/meta/llama-3.1-8b-instruct`. 

During production deployment verification on Cloudflare Workers AI, invocations of `@cf/meta/llama-3.1-8b-instruct` via the `env.AI` binding produced error:
```
5028: @cf/meta/infire-llama-3.1-8b-instruct was deprecated on 2026-05-30. See the model catalog for alternatives: https://developers.cloudflare.com/workers-ai/models/
```

Per rule 04.12 and AGENTS.md §8, changing any model identifier is a safety and specification decision that strictly requires human approval.

## Decision

Update the pinned generation model identifier from `@cf/meta/llama-3.1-8b-instruct` to `@cf/meta/llama-3.1-8b-instruct-fp8-fast`.

## Rationale

1. **Family Compatibility:** Belongs to the identical Llama 3.1 8B Instruct model family, preserving instruction-following behaviour, safety alignment, and prompt adherence.
2. **Cost & Performance Efficiency:** The FP8-quantized fast variant offers the lowest neuron execution cost and lowest time-to-first-token on Cloudflare Workers AI.
3. **Availability:** Actively supported on Cloudflare Workers AI production edge.
4. **Safety Verification:** All rule-02.6 system prompt prohibitions, user input interpolation formatting (rule 02.5), and SSE stream contracts remain identical and enforced by automated tests and redteam validation suites.

## Human Sign-Off

Approved by Human Operator on 2026-08-21 per rule 04.12 human gate.
