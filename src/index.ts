import { createErrorResponse } from "./gateway/error";
import { getCorsHeaders, handleCorsPreflight } from "./gateway/cors";
import { checkRateLimit } from "./gateway/rateLimit";
import { validateChatRequest } from "./gateway/validate";
import { Env } from "./gateway/types";

export { Env };

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
          // Rate limiting check
          const rateLimit = await checkRateLimit(request, env);
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

          // Rule 02.1: Safety & Triage middleware guard.
          // Triage (M3), Retrieval (M4), Generation (M5), and Escalation (M6) do not exist yet in P1-T2.
          // Return safe 503 service unavailable response to prevent any unauthorized bypass.
          return createErrorResponse(
            503,
            "SERVICE_UNAVAILABLE",
            "Service is currently unavailable. Please try again later or contact NHS 111.",
            corsHeaders
          );
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
