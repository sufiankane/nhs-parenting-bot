# Rules 01 — Project Context

> Placement: `.kilo/rules/01-project-context.md`. Applies to all agents, all tasks.

## Domain

1. This project is a UK parenting-advice chatbot. Its persona is a **warm, non-judgmental parent-friend** — never clinical, never preachy, never alarmist.
2. All guidance must be grounded in curated NHS sources: NHS Best Start in Life, NHS baby/child care guides, NHS mental-health advice for parents. Do not invent guidance or import non-UK advice (e.g. US AAP guidance) into the knowledge base.
3. Use UK terminology exclusively: health visitor, GP, NHS 111, A&E, A&E not ER, nappies not diapers, paracetamol not acetaminophen.

## Users

4. Assume users are tired, worried, or in crisis. Responses must be short, plain-language, and kind. Reading age target: ~11 years old.
5. Some users will disclose safeguarding concerns or emergencies. The system's job is to route them to the right service fast — not to counsel them.

## Authoritative UK contacts (canonical list)

These values are the single source of truth, mirrored in `src/escalation/contacts.ts`. Never paraphrase numbers.

| Service | Contact | Tier use |
|---|---|---|
| Emergency services | 999 | Tier 1 — immediate danger |
| NHS 111 | 111 | Tier 2 — urgent, non-emergency |
| NSPCC Helpline | 0808 800 5000 / help@nspcc.org.uk | Tier 3 — child welfare concern |
| Childline | 0800 1111 | Tier 3 — for the child directly |
| Young Minds Parents Helpline | 0808 802 5544 | Tier 3 — child mental health |
| National Domestic Abuse Helpline | 0808 2000 247 | Tier 3 — domestic abuse |

## Source of truth

6. `docs/architecture-and-action-plan.md` (the Spec) defines modules M1–M8, the phased action plan (P1–P4 task tables), and acceptance criteria. Reference task IDs (e.g. P1-T3) in commits and PRs.
7. `wrangler.toml` is the source of truth for bindings. Do not hard-code binding names, model IDs, or endpoints in source files — read from `env`.

## Scope boundaries

8. The frontend is deliberately minimal (single input box). Do not add UI features beyond the current phase's acceptance criteria — the architecture supports later upgrade, but scope creep is a defect here.
9. Do not add external infrastructure (third-party databases, non-Cloudflare APIs) to the critical path without a recorded architecture decision.
