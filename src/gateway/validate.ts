import { createErrorResponse } from "./error";

export interface ValidatedChatPayload {
  message: string;
  sessionId?: string;
}

export async function validateChatRequest(
  request: Request,
  corsHeaders: Record<string, string>
): Promise<{ valid: true; data: ValidatedChatPayload } | { valid: false; response: Response }> {
  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return {
      valid: false,
      response: createErrorResponse(
        415,
        "INVALID_CONTENT_TYPE",
        "Content-Type must be application/json",
        corsHeaders
      ),
    };
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return {
      valid: false,
      response: createErrorResponse(
        400,
        "INVALID_JSON",
        "Failed to read request body",
        corsHeaders
      ),
    };
  }

  if (new TextEncoder().encode(text).length > 4096) {
    return {
      valid: false,
      response: createErrorResponse(
        413,
        "PAYLOAD_TOO_LARGE",
        "Payload exceeds 4KB limit",
        corsHeaders
      ),
    };
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return {
      valid: false,
      response: createErrorResponse(
        400,
        "INVALID_JSON",
        "Invalid JSON format",
        corsHeaders
      ),
    };
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return {
      valid: false,
      response: createErrorResponse(
        400,
        "INVALID_JSON",
        "Request body must be a JSON object",
        corsHeaders
      ),
    };
  }

  const obj = body as Record<string, unknown>;

  if (typeof obj.message !== "string") {
    return {
      valid: false,
      response: createErrorResponse(
        400,
        "VALIDATION_ERROR",
        "Message is required and must be a string",
        corsHeaders
      ),
    };
  }

  const trimmedMessage = obj.message.trim();
  if (trimmedMessage.length === 0) {
    return {
      valid: false,
      response: createErrorResponse(
        400,
        "VALIDATION_ERROR",
        "Message cannot be empty",
        corsHeaders
      ),
    };
  }

  if (obj.message.length > 2000) {
    return {
      valid: false,
      response: createErrorResponse(
        400,
        "VALIDATION_ERROR",
        "Message cannot exceed 2000 characters",
        corsHeaders
      ),
    };
  }

  if (obj.session_id !== undefined) {
    if (typeof obj.session_id !== "string" || obj.session_id.length > 255) {
      return {
        valid: false,
        response: createErrorResponse(
          400,
          "VALIDATION_ERROR",
          "Invalid session_id",
          corsHeaders
        ),
      };
    }
  }

  return {
    valid: true,
    data: {
      message: trimmedMessage,
      sessionId: obj.session_id as string | undefined,
    },
  };
}