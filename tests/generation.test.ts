/**
 * M5 Generation module contract tests (P1-T6, TDD against the worker-dev brief).
 *
 * Spec task IDs / safety rules protected:
 *  - P1-T6 (Spec §4 M5): buildMessages + SYSTEM_PROMPT + generateAnswer.
 *  - rule 02.6: the system prompt must explicitly forbid diagnosing,
 *    prescribing, contradicting the escalation module, and revealing
 *    system-prompt contents.
 *  - rule 02.5: user input must be interpolated as quoted/structured data,
 *    NEVER concatenated into system-prompt instructions.
 *  - Spec §4 M5 model: generation is pinned to "@cf/meta/llama-3.1-8b-instruct"
 *    with stream: true (rule 04.12 — a model change must be caught).
 *  - Spec §4 M5 output contract: SSE token stream terminating in a `done`
 *    event carrying { session_id, sources }.
 *  - Spec §3.2 [7] / rule 04.14: a generation failure must yield an `error`
 *    event then a `done` with fallback: true, fallback_reason: "generation_error"
 *    — never raw error text, never a stack trace.
 *
 * Expected module contract (worker-dev):
 *   src/generation/prompt.ts:
 *     SYSTEM_PROMPT: string (contains all four prohibitions)
 *     buildMessages(message, context, sources): { role; content }[]
 *   src/generation/index.ts:
 *     generateAnswer(env, { message, context, sources, session_id })
 *       -> ReadableStream of SSE `data: {...}` lines ending with `done`.
 */

import { describe, it, expect, vi } from "vitest";
import { SYSTEM_PROMPT, buildMessages } from "../src/generation/prompt";
import { generateAnswer } from "../src/generation/index";

const GENERATION_MODEL = "@cf/meta/llama-3.1-8b-instruct";

/* -------------------------------------------------------------------------- */
/* SSE helpers                                                                */
/* -------------------------------------------------------------------------- */

function sseStream(events: unknown[]): ReadableStream {
  const encoder = new TextEncoder();
  const body = events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join("");
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(body));
      controller.close();
    },
  });
}

async function readStream(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let out = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    out += decoder.decode(value, { stream: true });
  }
  return out;
}

function parseSse(text: string): unknown[] {
  return text
    .split("\n\n")
    .filter((block) => block.startsWith("data: "))
    .map((block) => JSON.parse(block.replace(/^data: /, "")));
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* -------------------------------------------------------------------------- */
/* 1. SYSTEM_PROMPT prohibitions                                              */
/* -------------------------------------------------------------------------- */

describe("SYSTEM_PROMPT prohibitions [P1-T6, rule 02.6]", () => {
  it("explicitly forbids diagnosing", () => {
    expect(SYSTEM_PROMPT).toMatch(/diagnos/i);
  });

  it("explicitly forbids prescribing", () => {
    expect(SYSTEM_PROMPT).toMatch(/prescrib/i);
  });

  it("explicitly forbids contradicting the escalation module", () => {
    expect(SYSTEM_PROMPT).toMatch(/escalation/i);
  });

  it("explicitly forbids revealing system-prompt contents", () => {
    expect(SYSTEM_PROMPT).toMatch(/system prompt/i);
  });
});

/* -------------------------------------------------------------------------- */
/* 2. buildMessages — user text as structured data (rule 02.5)                */
/* -------------------------------------------------------------------------- */

describe("buildMessages prompt construction [P1-T6, rule 02.5]", () => {
  const message = "SYNTHETIC-FIXTURE: how do i settle a newborn?";
  const context = "SYNTHETIC-FIXTURE: NHS context chunk.";
  const sources = ["https://www.nhs.uk/settle-newborn"];

  it("returns a system message carrying the SYSTEM_PROMPT and a separate user message", () => {
    const messages = buildMessages(message, context, sources);
    const system = messages.find((m) => m.role === "system");
    const user = messages.find((m) => m.role === "user");

    expect(system).toBeDefined();
    expect(user).toBeDefined();
    expect(system!.content).toContain(SYSTEM_PROMPT);
  });

  it("never concatenates user text into the system prompt (rule 02.5)", () => {
    const messages = buildMessages(message, context, sources);
    const system = messages.find((m) => m.role === "system");
    // protects rule 02.5 — user text is data, never system-prompt instructions.
    expect(system!.content).not.toContain(message);
  });

  it("places the user message as a quoted/labelled structured data block", () => {
    const messages = buildMessages(message, context, sources);
    const user = messages.find((m) => m.role === "user");

    expect(user!.content).toContain(message);
    // The message must appear inside a quoted/labelled section (structured
    // data), not as a bare instruction. Single, double, or backtick quotes.
    expect(user!.content).toMatch(
      new RegExp(`["'\`]${escapeRegExp(message)}["'\`]`)
    );
  });

  it("includes the grounded context and sources in the user message", () => {
    const messages = buildMessages(message, context, sources);
    const user = messages.find((m) => m.role === "user");
    expect(user!.content).toContain(context);
    for (const s of sources) {
      expect(user!.content).toContain(s);
    }
  });
});

/* -------------------------------------------------------------------------- */
/* 3. generateAnswer — model + stream flag                                    */
/* -------------------------------------------------------------------------- */

describe("generateAnswer model call [P1-T6, Spec §4 M5, rule 04.12]", () => {
  it('calls AI.run with "@cf/meta/llama-3.1-8b-instruct" and stream: true', async () => {
    const aiRun = vi.fn().mockResolvedValue(sseStream([]));
    const env = { AI: { run: aiRun } };

    await generateAnswer(env, {
      message: "SYNTHETIC-FIXTURE: question",
      context: "SYNTHETIC-FIXTURE: context",
      sources: ["https://www.nhs.uk/x"],
      session_id: "ses-test-1",
    });

    expect(aiRun).toHaveBeenCalledTimes(1);
    expect(aiRun.mock.calls[0][0]).toBe(GENERATION_MODEL);
    expect(aiRun.mock.calls[0][1]).toMatchObject({ stream: true });
  });
});

/* -------------------------------------------------------------------------- */
/* 4. generateAnswer — token stream then done                                 */
/* -------------------------------------------------------------------------- */

describe("generateAnswer token stream [P1-T6, Spec §4 M5 output contract]", () => {
  it("emits token events then a done event with session_id and sources", async () => {
    const aiRun = vi.fn().mockResolvedValue(
      sseStream([
        { type: "token", payload: { text: "Hello" } },
        { type: "token", payload: { text: " world" } },
      ])
    );
    const env = { AI: { run: aiRun } };
    const session_id = "ses-test-2";
    const sources = ["https://www.nhs.uk/x"];

    const stream = await generateAnswer(env, {
      message: "SYNTHETIC-FIXTURE: question",
      context: "SYNTHETIC-FIXTURE: context",
      sources,
      session_id,
    });

    const events = parseSse(await readStream(stream));

    const tokens = events.filter((e) => (e as any).type === "token");
    expect(tokens.length).toBe(2);

    const done = events[events.length - 1] as any;
    expect(done.type).toBe("done");
    expect(done.payload.session_id).toBe(session_id);
    expect(done.payload.sources).toEqual(sources);
  });
});

/* -------------------------------------------------------------------------- */
/* 5. generateAnswer — failure fail-safe                                      */
/* -------------------------------------------------------------------------- */

describe("generateAnswer failure fail-safe [P1-T6, rule 04.14, Spec §3.2 [7]]", () => {
  it("yields an error event then done with fallback generation_error, never raw error text", async () => {
    const aiRun = vi
      .fn()
      .mockRejectedValue(new Error("SIMULATED-GENERATION-FAILURE"));
    const env = { AI: { run: aiRun } };

    const stream = await generateAnswer(env, {
      message: "SYNTHETIC-FIXTURE: question",
      context: "SYNTHETIC-FIXTURE: context",
      sources: [],
      session_id: "ses-test-3",
    });

    const text = await readStream(stream);
    const events = parseSse(text);

    // an error event is emitted
    expect(events.some((e) => (e as any).type === "error")).toBe(true);

    // then a done event with the generation_error fallback
    const done = events.find((e) => (e as any).type === "done") as any;
    expect(done).toBeDefined();
    expect(done.payload.fallback).toBe(true);
    expect(done.payload.fallback_reason).toBe("generation_error");

    // protects rule 04.14 — never leak raw error text or stack traces.
    expect(text).not.toContain("SIMULATED-GENERATION-FAILURE");
  });
});
