/**
 * M7 Admin Ingestion Gateway Endpoint (Spec §4 M2 & M7, P2-T2).
 *
 * Safety rules protected:
 *  - rule 02.7: Strict allow-list validation before ingestion.
 *  - rule 04.14: Safe error responses without internal binding leakage.
 */

import { validateSourceUrl, validateCategory } from "./allowlist";
import { processIngestJob } from "./pipeline";
import type { AdminIngestRequest, IngestJobPayload } from "./types";

/**
 * Handle POST /admin/ingest requests.
 */
export async function handleAdminIngest(
  request: Request,
  env: Record<string, unknown>,
  corsHeaders: Record<string, string> = {}
): Promise<Response> {
  const headers = {
    "Content-Type": "application/json",
    ...corsHeaders,
  };

  // 1. Authenticate admin request
  const adminSecret = (env.ADMIN_SECRET || env.ADMIN_KEY) as string | undefined;
  const authHeader =
    request.headers.get("x-admin-key") ||
    request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");

  if (!adminSecret || !authHeader || authHeader !== adminSecret) {
    return new Response(
      JSON.stringify({
        type: "error",
        payload: {
          code: "UNAUTHORIZED",
          message: "Invalid or missing admin credentials.",
        },
      }),
      { status: 401, headers }
    );
  }

  // 2. Parse and validate JSON payload
  let body: AdminIngestRequest;
  try {
    body = (await request.json()) as AdminIngestRequest;
  } catch {
    return new Response(
      JSON.stringify({
        type: "error",
        payload: {
          code: "INVALID_JSON",
          message: "Malformed JSON payload in request body.",
        },
      }),
      { status: 400, headers }
    );
  }

  if (!body.source_id || typeof body.source_id !== "string") {
    return new Response(
      JSON.stringify({
        type: "error",
        payload: {
          code: "VALIDATION_ERROR",
          message: "Field 'source_id' is required.",
        },
      }),
      { status: 400, headers }
    );
  }

  if (!body.content || typeof body.content !== "string" || body.content.trim().length === 0) {
    return new Response(
      JSON.stringify({
        type: "error",
        payload: {
          code: "VALIDATION_ERROR",
          message: "Field 'content' must be non-empty guidance text.",
        },
      }),
      { status: 400, headers }
    );
  }

  // 3. Validate source URL against NHS allow-list (rule 02.7)
  const sourceUrl = body.source_url || "https://www.nhs.uk/conditions/baby/";
  const urlCheck = validateSourceUrl(sourceUrl);
  if (!urlCheck.valid) {
    return new Response(
      JSON.stringify({
        type: "error",
        payload: {
          code: "ALLOWLIST_VIOLATION",
          message: urlCheck.reason || "Source URL failed NHS allow-list validation (rule 02.7).",
        },
      }),
      { status: 403, headers }
    );
  }

  const category = body.category || "newborn-care";
  if (!validateCategory(category)) {
    return new Response(
      JSON.stringify({
        type: "error",
        payload: {
          code: "INVALID_CATEGORY",
          message: `Category '${category}' is not one of the 7 canonical NHS parenting categories.`,
        },
      }),
      { status: 400, headers }
    );
  }

  const batchId = crypto.randomUUID();
  const title = body.title || body.source_id;
  const safetyRelevant = Boolean(body.safety_relevant);

  // 4. Async R2 + Queue dispatch if infrastructure is bound
  const r2 = env.RAW_SOURCES as {
    put: (key: string, value: string) => Promise<unknown>;
  } | undefined;

  const queue = env.INGEST_QUEUE as {
    send: (msg: IngestJobPayload) => Promise<unknown>;
  } | undefined;

  let r2Key: string | undefined;

  if (r2 && typeof r2.put === "function") {
    r2Key = `raw/${body.source_id}/${Date.now()}.txt`;
    try {
      await r2.put(r2Key, body.content);
    } catch (err) {
      console.error("R2_PUT_ERROR:", err instanceof Error ? err.message : String(err));
    }
  }

  const jobPayload: IngestJobPayload = {
    batch_id: batchId,
    source_id: body.source_id,
    source_url: sourceUrl,
    title,
    category,
    raw_r2_key: r2Key,
    raw_content: body.content,
    safety_relevant: safetyRelevant,
  };

  if (queue && typeof queue.send === "function") {
    try {
      await queue.send(jobPayload);
      return new Response(
        JSON.stringify({
          status: "queued",
          batch_id: batchId,
          source_id: body.source_id,
          queue: "nhs-ingest-queue",
        }),
        { status: 202, headers }
      );
    } catch (err) {
      console.error("QUEUE_SEND_ERROR:", err instanceof Error ? err.message : String(err));
      // Fall through to synchronous processing if queue.send fails
    }
  }

  // 5. Direct / synchronous processing (fallback when Queue is not bound)
  const result = await processIngestJob(env, jobPayload);

  return new Response(
    JSON.stringify({
      status: result.success ? "success" : "failed",
      ...result,
    }),
    { status: result.success ? 200 : 500, headers }
  );
}

