import { createErrorResponse } from "./gateway/error";
import { getCorsHeaders, handleCorsPreflight } from "./gateway/cors";
import { checkKvRateLimit } from "./gateway/kvRateLimit";
import { validateChatRequest } from "./gateway/validate";
import { Env } from "./gateway/types";
import { triage } from "./triage/index";
import { escalate } from "./escalation/index";
import { retrieve } from "./retrieval/index";
import { generateAnswer } from "./generation/index";
import { createSessionId, appendMessage } from "./sessions/store";

export type { Env };

/* -------------------------------------------------------------------------- */
/* SSE helpers                                                                */
/* -------------------------------------------------------------------------- */

/** Serialise an event as an SSE `data:` line. */
function sseEvent(event: unknown): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

/** Honest fallback text when retrieval confidence is too low (Spec §4 M4). */
const LOW_CONFIDENCE_FALLBACK =
  "I don't have enough information to answer that confidently. " +
  "Please contact NHS 111 on 111 or speak to your health visitor for guidance.";

/** Default similarity threshold when env.SIMILARITY_THRESHOLD is unset or NaN. */
const DEFAULT_THRESHOLD = 0.5;

/* -------------------------------------------------------------------------- */
/* Worker entrypoint                                                          */
/* -------------------------------------------------------------------------- */

export default {
  async fetch(request: Request, env: Env, ctx: unknown): Promise<Response> {
    let corsHeaders: Record<string, string> = {};
    try {
      corsHeaders = getCorsHeaders(request, env);
      const url = new URL(request.url);

      // GET /health
      if (url.pathname === "/health") {
        if (request.method === "GET") {
          return new Response(
            JSON.stringify({
              status: "ok",
              timestamp: new Date().toISOString(),
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
        }
        return createErrorResponse(
          405,
          "METHOD_NOT_ALLOWED",
          "Method not allowed on /health",
          corsHeaders
        );
      }

      // /chat endpoint
      if (url.pathname === "/chat") {
        if (request.method === "OPTIONS") {
          return handleCorsPreflight(request, env);
        }

        if (request.method === "POST") {
          // Rate limiting check (KV-backed, fails open — rule 02.1)
          const rateLimit = await checkKvRateLimit(request, env);
          if (!rateLimit.allowed) {
            return createErrorResponse(
              429,
              "RATE_LIMITED",
              "Rate limit exceeded. Please try again later.",
              {
                ...corsHeaders,
                "Retry-After": rateLimit.retryAfter || "60",
              }
            );
          }

          // Validation check
          const validation = await validateChatRequest(request, corsHeaders);
          if (!validation.valid) {
            return validation.response;
          }

          const { message, sessionId } = validation.data;

          // ── Rule 02.1: M3 triage — mandatory, synchronous, before ANY
          //    retrieval, generation, or content logging ──
          const triageResult = triage(message);

          // ── Tier 1 / 2 / 3: escalate via M6 signposts ──
          //    Rule 02.2: deterministic escalation, never the LLM.
          //    Rule 02.1: zero AI / Vectorize calls for Tier 1-3.
          if (triageResult.tier !== 4) {
            const signpost = escalate(triageResult.tier);
            const session_id = sessionId || createSessionId();

            const encoder = new TextEncoder();
            const stream = new ReadableStream({
              start(controller) {
                if (signpost) {
                  controller.enqueue(encoder.encode(sseEvent(signpost)));
                }
                controller.enqueue(
                  encoder.encode(
                    sseEvent({
                      type: "done",
                      payload: { session_id, fallback: false },
                    })
                  )
                );
                controller.close();
              },
            });

            return new Response(stream, {
              status: 200,
              headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
                ...corsHeaders,
              },
            });
          }

          // ── Tier 4: safe everyday parenting query ──
          const session_id = sessionId || createSessionId();

          // M4: Retrieve relevant NHS context
          const retrievalResult = await retrieve(env, message);

          // Resolve similarity threshold for the decision boundary
          const thresholdRaw = env.SIMILARITY_THRESHOLD;
          let threshold = DEFAULT_THRESHOLD;
          if (typeof thresholdRaw === "string") {
            const parsed = parseFloat(thresholdRaw);
            if (!isNaN(parsed)) threshold = parsed;
          }

          // Spec §4 M4 decision boundary: low confidence or empty context →
          // honest fallback, no generation call
          if (
            retrievalResult.confidence < threshold ||
            !retrievalResult.context
          ) {
            const encoder = new TextEncoder();
            const stream = new ReadableStream({
              start(controller) {
                controller.enqueue(
                  encoder.encode(
                    sseEvent({
                      type: "token",
                      payload: { text: LOW_CONFIDENCE_FALLBACK },
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
                        fallback_reason: "low_confidence",
                      },
                    })
                  )
                );
                controller.close();
              },
            });

            return new Response(stream, {
              status: 200,
              headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
                ...corsHeaders,
              },
            });
          }

          // Good confidence: persist session to KV via waitUntil (rule 02.9)
          const ctxObj = ctx as {
            waitUntil(p: Promise<unknown>): void;
          };
          ctxObj.waitUntil(
            appendMessage(env.SESSIONS as Parameters<typeof appendMessage>[0], session_id, {
              role: "user",
              content: message,
              at: new Date().toISOString(),
            })
          );

          // M5: Generate grounded answer as SSE stream
          const answerStream = await generateAnswer(env, {
            message,
            context: retrievalResult.context,
            sources: retrievalResult.sources,
            session_id,
          });

          return new Response(answerStream, {
            status: 200,
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
              ...corsHeaders,
            },
          });
        }

        return createErrorResponse(
          405,
          "METHOD_NOT_ALLOWED",
          "Method not allowed on /chat",
          corsHeaders
        );
      }

      // Catch-all unhandled routes
      return createErrorResponse(
        404,
        "NOT_FOUND",
        "Resource not found",
        corsHeaders
      );
    } catch (error) {
      // Rule 02-04 / 04.14: never leak internal detail, bindings, or stack traces
      // Safely propagate corsHeaders if available
      return createErrorResponse(
        500,
        "SERVER_ERROR",
        "Sorry, we're having trouble right now. Please try again or contact NHS 111.",
        corsHeaders
      );
    }
  },
};