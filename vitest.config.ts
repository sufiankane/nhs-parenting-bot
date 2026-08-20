/// <reference types="vitest/globals" />

import { defineConfig } from "vitest/config";

/**
 * Vitest configuration for the NHS Parenting Companion chatbot Worker.
 *
 * Scope: these tests (tests/health.test.ts) invoke the Worker `fetch` handler
 * directly with a mock `env`, so they do NOT require real Cloudflare bindings
 * or Miniflare. `environment: "node"` supplies the Web-standard globals
 * (Request / Response / Headers / URL / crypto) the handler uses.
 *
 * Migration note (rule 04.9): integration tests that need real bindings
 * (AI, Vectorize, D1, KV, Queues) should later adopt
 * `@cloudflare/vitest-pool-workers`. That plugin requires wrangler.toml,
 * which is scaffolded in P1-T1; it is therefore intentionally NOT configured
 * here so the basic config remains runnable ahead of P1-T1.
 *
 * Rule 04.8: .env and .dev.vars are git-ignored and are NOT loaded into the
 * test process — no real secrets are exposed to test runs.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    // Fail fast on leaked globals / unhandled rejections during the test run.
    globals: false,
    retry: 0,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
    },
  },
});
