/**
 * M5 Grounded generation (P1-T6, Spec §4 M5).
 *
 * Safety rules protected:
 *  - rule 04.12: generation model pinned to "@cf/meta/llama-3.1-8b-instruct"
 *    with stream: true.
 *  - Spec §4 M5 output contract: SSE token stream terminating in a `done`
 *    event carrying { session_id, sources }.
 *  - Spec §3.2 [7] / rule 04.14: a generation failure must yield an `error`
 *    event then a `done` with fallback: true, fallback_reason: "generation_error"
 *    — never raw error text, never a stack trace.
 */

import { GENERATION_MODEL, buildMessages } from "./prompt";

export interface GenerateInput {
  message: string;
  context: string;
  sources: string[];
  session_id: string;
}

const FALLBACK_MESSAGE =
  "Sorry, we're having trouble right now. Please try again or contact NHS 111.";

/** Serialise an event as an SSE data line. */
function sseEvent(event: unknown): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

/**
 * Generate a grounded answer as an SSE ReadableStream.
 *
 * Calls the LLM with stream: true, pipes through token chunks, and appends a
 * final `done` event with session_id and sources.
 *
 * On any failure (AI.run throws, stream read fails, unexpected response shape):
 * emits an `error` event with a safe user-facing message, then a `done` event
 * with fallback: true and fallback_reason: "generation_error". Never leaks raw
 * error text or stack traces (rule 04.14).
 */
export async function generateAnswer(
  env: Record<string, unknown>,
  input: GenerateInput
): Promise<ReadableStream> {
  const encoder = new TextEncoder();
  const { message, context, sources, session_id } = input;

  try {
    const ai = env.AI as {
      run: (model: string, input: unknown) => Promise<unknown>;
    };
    const messages = buildMessages(message, context, sources);

    const aiResponse = await ai.run(GENERATION_MODEL, {
      messages,
      stream: true,
    });

    if (!(aiResponse instanceof ReadableStream)) {
      throw new Error("Unexpected AI response type");
    }

    return new ReadableStream({
      async start(controller) {
        const reader = aiResponse.getReader();

        try {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch {
          // Stream read failure → emit error event, then fall through to done
          controller.enqueue(
            encoder.encode(
              sseEvent({
                type: "error",
                payload: {
                  code: "GENERATION_ERROR",
                  message: FALLBACK_MESSAGE,
                },
              })
            )
          );
        }

        controller.enqueue(
          encoder.encode(
            sseEvent({
              type: "done",
              payload: { session_id, sources },
            })
          )
        );
        controller.close();
      },
    });
  } catch {
    // AI.run threw or returned non-stream → error + done fallback
    return new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            sseEvent({
              type: "error",
              payload: {
                code: "GENERATION_ERROR",
                message: FALLBACK_MESSAGE,
              },
            })
          )
        );
        controller.enqueue(
          encoder.encode(
            sseEvent({
              type: "done",
              payload: {
                session_id,
                fallback: true,
                fallback_reason: "generation_error",
              },
            })
          )
        );
        controller.close();
      },
    });
  }
}