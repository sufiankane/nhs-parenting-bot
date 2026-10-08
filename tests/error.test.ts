import { describe, it, expect } from "vitest";
import { createErrorResponse } from "../src/gateway/error";

describe("createErrorResponse", () => {
  it("creates a standard error response", async () => {
    const status = 400;
    const code = "INVALID_JSON";
    const message = "Invalid JSON payload";

    const response = createErrorResponse(status, code, message);

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(status);

    const body = await response.json();
    expect(body).toEqual({
      type: "error",
      payload: {
        code,
        message,
      },
    });

    expect(response.headers.get("Content-Type")).toBe("application/json");
  });

  it("merges additional headers correctly", () => {
    const status = 429;
    const code = "RATE_LIMITED";
    const message = "Too many requests";
    const headers = {
      "Retry-After": "60",
      "X-Custom-Header": "value",
    };

    const response = createErrorResponse(status, code, message, headers);

    expect(response.status).toBe(status);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    expect(response.headers.get("Retry-After")).toBe("60");
    expect(response.headers.get("X-Custom-Header")).toBe("value");
  });

  it("can override the default Content-Type header if needed", () => {
    const status = 500;
    const code = "SERVER_ERROR";
    const message = "Internal error";
    const headers = {
      "Content-Type": "application/problem+json",
    };

    const response = createErrorResponse(status, code, message, headers);

    expect(response.headers.get("Content-Type")).toBe("application/problem+json");
  });
});
