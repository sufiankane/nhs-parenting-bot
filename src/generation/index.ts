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

import { GENERATION_MODEL, buildMessages, type HistoryTurn } from "./prompt";

export interface GenerateInput {
  message: string;
  context: string;
  sources: string[];
  session_id: string;
  history?: readonly HistoryTurn[];
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
/** Helper to extract plain token text from Workers AI or mock SSE chunks. */
function extractTokenText(jsonStr: string): string | null {
  if (jsonStr.trim() === "[DONE]") return null;
  try {
    const parsed = JSON.parse(jsonStr);
    if (typeof parsed.response === "string" && parsed.response.length > 0) {
      return parsed.response;
    }
    if (
      Array.isArray(parsed.choices) &&
      parsed.choices.length > 0 &&
      typeof parsed.choices[0]?.delta?.content === "string" &&
      parsed.choices[0].delta.content.length > 0
    ) {
      return parsed.choices[0].delta.content;
    }
    if (
      parsed.type === "token" &&
      typeof parsed.payload?.text === "string" &&
      parsed.payload.text.length > 0
    ) {
      return parsed.payload.text;
    }
    return null;
  } catch {
    return null;
  }
}

export const DEFAULT_MAX_TOKENS = 1024;

export async function generateAnswer(
  env: Record<string, unknown>,
  input: GenerateInput
): Promise<ReadableStream> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const { message, context, sources, session_id, history } = input;

  try {
    const ai = env.AI as {
      run: (model: string, input: unknown) => Promise<unknown>;
    };
    const messages = buildMessages(message, context, sources, history);

    const maxTokens =
      typeof env.MAX_TOKENS === "string"
        ? parseInt(env.MAX_TOKENS, 10) || DEFAULT_MAX_TOKENS
        : typeof env.MAX_TOKENS === "number"
          ? env.MAX_TOKENS
          : DEFAULT_MAX_TOKENS;

    const aiResponse = await ai.run(GENERATION_MODEL, {
      messages,
      stream: true,
      max_tokens: maxTokens,
      temperature: 0.1,
    });

    const streamCandidate = aiResponse as { getReader?: () => ReadableStreamDefaultReader<Uint8Array> } | null | undefined;
    if (!streamCandidate || typeof streamCandidate.getReader !== "function") {
      throw new Error("Unexpected AI response type: missing getReader");
    }
    const streamReader = streamCandidate.getReader();

    return new ReadableStream({
      async start(controller) {
        const reader = streamReader;
        let buffer = "";

        try {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              buffer += typeof value === "string" ? value : decoder.decode(value, { stream: true });
              const lines = buffer.split(/\r?\n/);
              buffer = lines.pop() || "";
              for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith("data:")) {
                  const payloadStr = trimmed.slice(5).trim();
                  const tokenText = extractTokenText(payloadStr);
                  if (tokenText) {
                    controller.enqueue(
                      encoder.encode(
                        sseEvent({
                          type: "token",
                          payload: { text: tokenText },
                        })
                      )
                    );
                  }
                }
              }
            }
          }
          if (buffer.trim().startsWith("data:")) {
            const tokenText = extractTokenText(buffer.trim().slice(5).trim());
            if (tokenText) {
              controller.enqueue(
                encoder.encode(
                  sseEvent({
                    type: "token",
                    payload: { text: tokenText },
                  })
                )
              );
            }
          }
        } catch (streamErr) {
          // Stream read failure → log internally, emit error event, then fall through to done
          console.error(
            "GENERATION_STREAM_ERROR:",
            streamErr instanceof Error ? streamErr.message : String(streamErr)
          );
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
  } catch (err) {
    // Rule 04.14: safe fallback to client, error detail logged internally
    console.error(
      "GENERATION_ERROR:",
      err instanceof Error ? err.message : String(err)
    );
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