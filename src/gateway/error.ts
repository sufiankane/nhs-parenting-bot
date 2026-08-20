export type ErrorCode =
  | "INVALID_CONTENT_TYPE"
  | "PAYLOAD_TOO_LARGE"
  | "INVALID_JSON"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "METHOD_NOT_ALLOWED"
  | "NOT_FOUND"
  | "SERVICE_UNAVAILABLE"
  | "SERVER_ERROR";

export function createErrorResponse(
  status: number,
  code: ErrorCode,
  message: string,
  headers: Record<string, string> = {}
): Response {
  return new Response(
    JSON.stringify({
      type: "error",
      payload: {
        code,
        message,
      },
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    }
  );
}
