/**
 * M1 Frontend Widget contract tests [P1-T7].
 *
 * These tests read `public/index.html` and `public/widget.js` from disk and
 * assert the structural + behavioural contract that worker-dev must satisfy.
 * They are intentionally DOM-free: they inspect the source and exercise the
 * pure helpers (`buildRequest`, `handleSseEvent`) where the file exists.
 *
 * RED-STATE CONTRACT: `public/` is empty until worker-dev implements M1, so
 * every test here is expected to FAIL on first run. A green run is only valid
 * once worker-dev has landed `index.html` + `widget.js`.
 *
 * Safety framing (rules-02): the widget is the client half of the safety path.
 * It must never invent a session_id, must render signpost contacts verbatim
 * (rule 02.4), must never eval or inject unescaped user text (rule 02.5), and
 * must never surface stack traces or response internals (rule 04.14).
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const PUBLIC_DIR = resolve(process.cwd(), "public");
const HTML_PATH = resolve(PUBLIC_DIR, "index.html");
const JS_PATH = resolve(PUBLIC_DIR, "widget.js");

let html = "";
let js = "";
let htmlExists = false;
let jsExists = false;

beforeAll(() => {
  htmlExists = existsSync(HTML_PATH);
  jsExists = existsSync(JS_PATH);
  if (htmlExists) html = readFileSync(HTML_PATH, "utf8");
  if (jsExists) js = readFileSync(JS_PATH, "utf8");
});

/** Strip comments so regex contract checks don't match inside comments. */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const CODE = () => stripComments(js);

describe("M1 index.html structure [P1-T7, Spec §4 M1]", () => {
  it("exists on disk (worker-dev must land public/index.html)", () => {
    expect(htmlExists, "public/index.html is missing").toBe(true);
  });

  it("has a <label> associated with the input via for/id pair (WCAG 3.3.2)", () => {
    expect(html).toMatch(/<label\b[^>]*\bfor\s*=\s*["'][^"']+["']/i);
    const forMatch = html.match(/<label\b[^>]*\bfor\s*=\s*["']([^"']+)["']/i);
    expect(forMatch).not.toBeNull();
    const forId = forMatch![1];
    // The referenced id must exist on an <input>.
    expect(html).toMatch(new RegExp(`<input\\b[^>]*\\bid\\s*=\\s*["']${forId}["']`, "i"));
  });

  it("has a real <button> element (not a div/span acting as a button)", () => {
    expect(html).toMatch(/<button\b/i);
  });

  it("exposes the response area with aria-live=\"polite\" (WCAG 4.1.3)", () => {
    expect(html).toMatch(/aria-live\s*=\s*["']polite["']/i);
  });

  it("loads the widget via <script src=\"./widget.js\">", () => {
    expect(html).toMatch(/<script\b[^>]*\bsrc\s*=\s*["']\.\/widget\.js["']/i);
  });

  it("has no inline onclick= handlers (uses addEventListener — rule 04.13)", () => {
    expect(html).not.toMatch(/\bonclick\s*=/i);
  });

  it("has no inline on* event handlers at all (keyboard operable, CSP-friendly)", () => {
    expect(html).not.toMatch(/\son[a-z]+\s*=/i);
  });
});

describe("M1 widget.js request contract [P1-T7, Spec §4 M1]", () => {
  it("exists on disk (worker-dev must land public/widget.js)", () => {
    expect(jsExists, "public/widget.js is missing").toBe(true);
  });

  it("POSTs to /chat", () => {
    expect(CODE()).toMatch(/["'`]\/chat["'`]/);
    expect(CODE()).toMatch(/method\s*:\s*["']POST["']/i);
  });

  it("sends Content-Type: application/json", () => {
    expect(CODE()).toMatch(/Content-Type/i);
    expect(CODE()).toMatch(/application\/json/i);
  });

  it("includes `message` in the request body", () => {
    expect(CODE()).toMatch(/message/);
  });

  it("NEVER sends a client-invented session_id on the first message (Spec §4 M1)", () => {
    // protects Spec §4 M1 — session_id is server-issued via crypto.randomUUID();
    // the widget must only attach a session_id it stored from a prior `done` event.
    const code = CODE();
    expect(code).toMatch(/session_id/);
    const hasConditionalGate =
      /session_id\s*:\s*[^,}]*\?/.test(code) ||
      /\.\.\.\s*\([^)]*session[^)]*\)/.test(code) ||
      /if\s*\(\s*[^)]*session[^)]*\)/.test(code) ||
      /session_id\s*:\s*[^,}]*\|\|/.test(code);
    expect(
      hasConditionalGate,
      "session_id must only be sent when a stored session exists (never invented client-side)"
    ).toBe(true);
  });

  it("buildRequest(message, undefined) omits session_id entirely", async () => {
    // protects Spec §4 M1 — first message has no session_id in the body.
    if (!jsExists) {
      expect(jsExists, "public/widget.js is missing").toBe(true);
      return;
    }
    const mod = await import(/* @vite-ignore */ JS_PATH);
    const buildRequest = mod?.NHSWidget?.buildRequest ?? mod?.buildRequest;
    expect(typeof buildRequest).toBe("function");
    const body = buildRequest("hello", undefined);
    expect(body).toHaveProperty("message", "hello");
    expect(body).not.toHaveProperty("session_id");
  });

  it("buildRequest(message, storedId) includes the stored session_id", async () => {
    // protects Spec §4 M1 — subsequent turns echo the server-issued id.
    if (!jsExists) {
      expect(jsExists, "public/widget.js is missing").toBe(true);
      return;
    }
    const mod = await import(/* @vite-ignore */ JS_PATH);
    const buildRequest = mod?.NHSWidget?.buildRequest ?? mod?.buildRequest;
    expect(typeof buildRequest).toBe("function");
    const body = buildRequest("hello", "ses_test_123");
    expect(body).toHaveProperty("message", "hello");
    expect(body).toHaveProperty("session_id", "ses_test_123");
  });
});

describe("M1 widget.js SSE envelope handling [P1-T7, Spec §4.0]", () => {
  it("parses all four frozen envelope types: token, signpost, error, done", () => {
    const code = CODE();
    for (const t of ["token", "signpost", "error", "done"]) {
      expect(code, `missing handling for envelope type "${t}"`).toMatch(
        new RegExp(`["'\`]${t}["'\`]`)
      );
    }
  });

  it("handles unknown envelope types gracefully (ignores, never throws)", () => {
    // protects rule 04.6 — additive-only envelope; unknown types must be ignored.
    const code = CODE();
    const hasDefault =
      /\bdefault\s*:/.test(code) || /\belse\b/.test(code) || /unknown|unrecognized|unsupported/i.test(code);
    expect(hasDefault, "unknown envelope types must be handled without throwing").toBe(true);
  });

  it("stores session_id from the done event for the next request", () => {
    // protects Spec §4 M1 — done.payload.session_id is persisted client-side.
    const code = CODE();
    expect(code).toMatch(/done/);
    expect(code).toMatch(/session_id/);
    expect(code).toMatch(/payload\s*\.\s*session_id|\.session_id/);
  });
});

describe("M1 widget.js signpost rendering — verbatim contacts [P1-T7, rule 02.4]", () => {
  it("inserts service.contact and service.name into the DOM without transformation", () => {
    // protects rule 02.4 — contacts are constants rendered verbatim; never
    // reformatted, autocompleted, or "corrected" by the client.
    const code = CODE();
    expect(code).toMatch(/\.contact/);
    expect(code).toMatch(/\.name/);
    expect(code).toMatch(/textContent|createTextNode/);
  });

  it("never calls .replace() or reformats a contact string", () => {
    // protects rule 02.4 — a phone number like "0808 800 5000" must not be
    // stripped, spaced, or otherwise transformed before display.
    const code = CODE();
    expect(code).not.toMatch(/contact\s*\.\s*replace\s*\(/);
    expect(code).not.toMatch(/contact\s*\.\s*(trim|toUpperCase|toLowerCase|split|match)\s*\(/);
  });

  it("renders signpost services in a distinct card (not mixed with token text)", () => {
    // protects Spec §4 M1 — signpost events render distinctly.
    const code = CODE();
    expect(code).toMatch(/signpost/);
    expect(code).toMatch(/card|signpost|service/i);
  });
});

describe("M1 widget.js injection safety [P1-T7, rule 02.5, rule 04.14]", () => {
  it("never uses eval()", () => {
    expect(CODE()).not.toMatch(/\beval\s*\(/);
  });

  it("never injects unescaped user/assistant message text via innerHTML", () => {
    // protects rule 02.5 — user text is data, never markup. Message text must
    // be written via textContent/createTextNode, never interpolated into innerHTML.
    const code = CODE();
    expect(code).toMatch(/textContent|createTextNode/);
    expect(code).not.toMatch(/innerHTML\s*=\s*[^;]*\$\{/);
    expect(code).not.toMatch(/innerHTML\s*\+=\s*[^;]*\$\{/);
    expect(code).not.toMatch(/innerHTML\s*=\s*(message|msg|text|payload\.text)\b/);
  });

  it("does not concatenate user input into executable code (no Function constructor)", () => {
    expect(CODE()).not.toMatch(/\bnew\s+Function\s*\(/);
  });
});

describe("M1 widget.js accessibility & interaction [P1-T7, Spec §4 M1]", () => {
  it("uses addEventListener, not inline onclick handlers", () => {
    const code = CODE();
    expect(code).toMatch(/addEventListener/);
    expect(code).not.toMatch(/\bonclick\s*=/);
  });

  it("manages input focus after submit", () => {
    // protects Spec §4 M1 accessibility — focus returns to the input so a
    // keyboard user can continue without re-tabbing.
    expect(CODE()).toMatch(/\.focus\s*\(/);
  });

  it("exposes a window.NHSWidget.init entry point", () => {
    expect(CODE()).toMatch(/NHSWidget/);
    expect(CODE()).toMatch(/init\s*\(/);
  });
});

describe("M1 widget.js error path [P1-T7, rule 04.14, Spec §4 M2]", () => {
  it("shows a safe generic message on network failure or non-OK response", () => {
    const code = CODE();
    expect(code).toMatch(/sorry|try again|unavailable|went wrong|NHS 111/i);
  });

  it("never surfaces stack traces or response internals to the user", () => {
    // protects rule 04.14 — no err.stack, no response body internals, no
    // binding names, no status codes dumped into the UI.
    const code = CODE();
    expect(code).not.toMatch(/\.stack\b/);
    expect(code).not.toMatch(/err\.message|error\.message/);
    expect(code).not.toMatch(/res\.(text|json|body)\s*\(\s*\)\s*\.then\s*\([^)]*\)\s*=>\s*[^)]*innerHTML/);
  });

  it("handles non-OK HTTP status explicitly (does not treat it as success)", () => {
    const code = CODE();
    expect(code).toMatch(/!res\.ok|res\.status|status\s*[!<>=]/);
  });
});
