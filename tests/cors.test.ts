import { describe, it, expect } from "vitest";
import { getCorsHeaders, handleCorsPreflight } from "../src/gateway/cors";
import { Env } from "../src/gateway/types";

describe("CORS utilities", () => {
  describe("getCorsHeaders", () => {
    it("should return empty object if Origin header is missing", () => {
      const request = new Request("http://localhost/api", { method: "GET" });
      const env: Env = { ALLOWED_ORIGINS: "http://localhost:3000" };
      const result = getCorsHeaders(request, env);
      expect(result).toEqual({});
    });

    it("should return empty object if ALLOWED_ORIGINS is not set", () => {
      const request = new Request("http://localhost/api", {
        method: "GET",
        headers: { Origin: "http://localhost:3000" },
      });
      const env: Env = {};
      const result = getCorsHeaders(request, env);
      expect(result).toEqual({});
    });

    it("should return empty object if Origin is not in ALLOWED_ORIGINS", () => {
      const request = new Request("http://localhost/api", {
        method: "GET",
        headers: { Origin: "http://malicious.com" },
      });
      const env: Env = { ALLOWED_ORIGINS: "http://localhost:3000,https://trusted.com" };
      const result = getCorsHeaders(request, env);
      expect(result).toEqual({});
    });

    it("should return Access-Control-Allow-Origin if Origin matches a single ALLOWED_ORIGINS entry", () => {
      const request = new Request("http://localhost/api", {
        method: "GET",
        headers: { Origin: "http://localhost:3000" },
      });
      const env: Env = { ALLOWED_ORIGINS: "http://localhost:3000" };
      const result = getCorsHeaders(request, env);
      expect(result).toEqual({ "Access-Control-Allow-Origin": "http://localhost:3000" });
    });

    it("should return Access-Control-Allow-Origin if Origin matches one of multiple ALLOWED_ORIGINS", () => {
      const request = new Request("http://localhost/api", {
        method: "GET",
        headers: { Origin: "https://trusted.com" },
      });
      const env: Env = { ALLOWED_ORIGINS: "http://localhost:3000, https://trusted.com , http://other.com" };
      const result = getCorsHeaders(request, env);
      expect(result).toEqual({ "Access-Control-Allow-Origin": "https://trusted.com" });
    });

    it("should handle empty or whitespace-only ALLOWED_ORIGINS string gracefully", () => {
      const request = new Request("http://localhost/api", {
        method: "GET",
        headers: { Origin: "http://localhost:3000" },
      });
      const env: Env = { ALLOWED_ORIGINS: "   , ,  " };
      const result = getCorsHeaders(request, env);
      expect(result).toEqual({});
    });
  });

  describe("handleCorsPreflight", () => {
    it("should return a 204 response with base CORS headers when origin is not allowed", () => {
      const request = new Request("http://localhost/api", {
        method: "OPTIONS",
        headers: { Origin: "http://untrusted.com" },
      });
      const env: Env = { ALLOWED_ORIGINS: "http://localhost:3000" };

      const response = handleCorsPreflight(request, env);

      expect(response.status).toBe(204);
      expect(response.headers.get("Access-Control-Allow-Methods")).toBe("POST, OPTIONS");
      expect(response.headers.get("Access-Control-Allow-Headers")).toBe("Content-Type, Authorization");
      expect(response.headers.get("Access-Control-Max-Age")).toBe("86400");
      expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
    });

    it("should return a 204 response with merged CORS headers when origin is allowed", () => {
      const request = new Request("http://localhost/api", {
        method: "OPTIONS",
        headers: { Origin: "https://trusted.com" },
      });
      const env: Env = { ALLOWED_ORIGINS: "http://localhost:3000,https://trusted.com" };

      const response = handleCorsPreflight(request, env);

      expect(response.status).toBe(204);
      expect(response.headers.get("Access-Control-Allow-Methods")).toBe("POST, OPTIONS");
      expect(response.headers.get("Access-Control-Allow-Headers")).toBe("Content-Type, Authorization");
      expect(response.headers.get("Access-Control-Max-Age")).toBe("86400");
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://trusted.com");
    });
  });
});
