import { Env } from "./types";

export function getCorsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get("Origin");
  const allowedOriginsStr = (env.ALLOWED_ORIGINS as string) || "";
  const allowedOrigins = allowedOriginsStr
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  if (origin && allowedOrigins.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
    };
  }

  return {};
}

export function handleCorsPreflight(request: Request, env: Env): Response {
  const corsHeaders = getCorsHeaders(request, env);
  const headers: Record<string, string> = {
    ...corsHeaders,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };

  return new Response(null, {
    status: 204,
    headers,
  });
}
