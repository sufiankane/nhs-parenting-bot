/**
 * M1 Frontend Widget contract & Component tests [P1-T7, P3-T1].
 *
 * Safety framing (rules-02): the widget is the client half of the safety path.
 * It must never invent a session_id, must render signpost contacts verbatim
 * (rule 02.4), must never eval or inject unescaped user text (rule 02.5), and
 * must never surface stack traces or response internals (rule 04.14).
 *
 * P3-T1 scope:
 *  - Message bubbles (user/assistant).
 *  - Typing indicator during streaming.
 *  - Signpost cards rendered distinctly for Tier 1-3.
 *  - Session history via server-issued session_id.
 *  - Accessibility from day one (WCAG AA, aria-live, labelled input, focus management).
 */

import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
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

describe("M1 index.html structure [P1-T7, P3-T1, Spec §4 M1]", () => {
  it("exists on disk (public/index.html)", () => {
    expect(htmlExists, "public/index.html is missing").toBe(true);
  });

  it("has a <label> associated with the input via for/id pair (WCAG 3.3.2)", () => {
    expect(html).toMatch(/<label\b[^>]*\bfor\s*=\s*["'][^"']+["']/i);
    const forMatch = html.match(/<label\b[^>]*\bfor\s*=\s*["']([^"']+)["']/i);
    expect(forMatch).not.toBeNull();
    const forId = forMatch![1];
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
  it("exists on disk (public/widget.js)", () => {
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
    const mod = await import(/* @vite-ignore */ JS_PATH);
    const buildRequest = mod?.NHSWidget?.buildRequest ?? mod?.buildRequest;
    expect(typeof buildRequest).toBe("function");
    const body = buildRequest("hello", undefined);
    expect(body).toHaveProperty("message", "hello");
    expect(body).not.toHaveProperty("session_id");
  });

  it("buildRequest(message, storedId) includes the stored session_id", async () => {
    const mod = await import(/* @vite-ignore */ JS_PATH);
    const buildRequest = mod?.NHSWidget?.buildRequest ?? mod?.buildRequest;
    expect(typeof buildRequest).toBe("function");
    const body = buildRequest("hello", "ses_test_123");
    expect(body).toHaveProperty("message", "hello");
    expect(body).toHaveProperty("session_id", "ses_test_123");
  });
});

describe("M1 widget.js SSE envelope handling [P1-T7, P3-T1, Spec §4.0]", () => {
  it("parses all four frozen envelope types: token, signpost, error, done", () => {
    const code = CODE();
    for (const t of ["token", "signpost", "error", "done"]) {
      expect(code, `missing handling for envelope type "${t}"`).toMatch(
        new RegExp(`["'\`]${t}["'\`]`)
      );
    }
  });

  it("handles unknown envelope types gracefully (ignores, never throws, rule 04.6)", async () => {
    const mod = await import(/* @vite-ignore */ JS_PATH);
    const handleSseEvent = mod?.NHSWidget?.handleSseEvent ?? mod?.handleSseEvent;
    const result = handleSseEvent({ type: "unknown_future_event", payload: {} }, { sessionId: "s1" });
    expect(result.render).toBeNull();
    expect(result.state.sessionId).toBe("s1");
  });

  it("stores session_id from the done event for the next request", () => {
    const code = CODE();
    expect(code).toMatch(/done/);
    expect(code).toMatch(/session_id/);
    expect(code).toMatch(/payload\s*\.\s*session_id|\.session_id/);
  });
});

describe("M1 widget.js signpost rendering — verbatim contacts [P1-T7, rule 02.4]", () => {
  it("inserts service.contact and service.name into the DOM without transformation", () => {
    const code = CODE();
    expect(code).toMatch(/\.contact/);
    expect(code).toMatch(/\.name/);
    expect(code).toMatch(/textContent|createTextNode/);
  });

  it("never calls .replace() or reformats a contact string", () => {
    const code = CODE();
    expect(code).not.toMatch(/contact\s*\.\s*replace\s*\(/);
    expect(code).not.toMatch(/contact\s*\.\s*(trim|toUpperCase|toLowerCase|split|match)\s*\(/);
  });

  it("renders signpost services in a distinct card (not mixed with token text)", () => {
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

describe("M1 widget.js error path [P1-T7, rule 04.14, Spec §4 M2]", () => {
  it("shows a safe generic message on network failure or non-OK response", () => {
    const code = CODE();
    expect(code).toMatch(/sorry|try again|unavailable|went wrong|NHS 111/i);
  });

  it("never surfaces stack traces or response internals to the user", () => {
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

/* -------------------------------------------------------------------------- */
/* P3-T1 DOM Component & Interactive Streaming Flow Tests                     */
/* -------------------------------------------------------------------------- */

class MockDOMNode {
  nodeType = 1;
  textContent = "";
  childNodes: MockDOMNode[] = [];
  parentNode: MockDOMNode | null = null;

  appendChild(child: MockDOMNode): MockDOMNode {
    child.parentNode = this;
    this.childNodes.push(child);
    return child;
  }

  removeChild(child: MockDOMNode): MockDOMNode {
    const index = this.childNodes.indexOf(child);
    if (index !== -1) {
      this.childNodes.splice(index, 1);
      child.parentNode = null;
    }
    return child;
  }

  get text(): string {
    if (this.nodeType === 3) return this.textContent;
    return this.childNodes.map((c) => c.text).join("");
  }
}

class MockDOMTextNode extends MockDOMNode {
  constructor(text: string) {
    super();
    this.nodeType = 3;
    this.textContent = text;
  }
}

class MockDOMElement extends MockDOMNode {
  tagName: string;
  id = "";
  className = "";
  value = "";
  disabled = false;
  scrollTop = 0;
  scrollHeight = 100;
  attributes: Record<string, string> = {};
  listeners: Record<string, Array<(event: any) => void>> = {};

  constructor(tagName: string) {
    super();
    this.tagName = tagName.toUpperCase();
  }

  setAttribute(name: string, val: string): void {
    this.attributes[name] = String(val);
  }

  getAttribute(name: string): string | null {
    return this.attributes[name] ?? null;
  }

  addEventListener(event: string, fn: (event: any) => void): void {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(fn);
  }

  dispatchEvent(event: { type: string; preventDefault?: () => void }): boolean {
    const list = this.listeners[event.type] || [];
    for (const fn of list) {
      fn(event);
    }
    return true;
  }

  focus(): void {}

  querySelector(selector: string): MockDOMElement | null {
    const all = this.querySelectorAll(selector);
    return all.length > 0 ? all[0] : null;
  }

  querySelectorAll(selector: string): MockDOMElement[] {
    const matches: MockDOMElement[] = [];

    function search(node: MockDOMNode) {
      if (node instanceof MockDOMElement) {
        if (selector.startsWith(".") && node.className.split(" ").includes(selector.slice(1))) {
          matches.push(node);
        } else if (selector.startsWith("#") && node.id === selector.slice(1)) {
          matches.push(node);
        } else if (node.tagName.toLowerCase() === selector.toLowerCase()) {
          matches.push(node);
        }
      }
      for (const child of node.childNodes) {
        search(child);
      }
    }

    search(this);
    return matches;
  }
}

describe("P3-T1 DOM Component & Interactive Streaming Flow Tests", () => {
  let docElements: Record<string, MockDOMElement>;
  let mockDoc: any;

  beforeEach(() => {
    docElements = {
      "message-input": new MockDOMElement("input"),
      "send-button": new MockDOMElement("button"),
      "response": new MockDOMElement("div"),
      "chat-form": new MockDOMElement("form"),
    };

    docElements["message-input"].id = "message-input";
    docElements["send-button"].id = "send-button";
    docElements["response"].id = "response";
    docElements["chat-form"].id = "chat-form";

    mockDoc = {
      getElementById: (id: string) => docElements[id] || null,
      createElement: (tag: string) => new MockDOMElement(tag),
      createTextNode: (text: string) => new MockDOMTextNode(text),
    };

    (global as any).document = mockDoc;
    (global as any).window = { NHSWidget: undefined };
    (global as any).TextDecoder = class {
      decode(buf: any) {
        return typeof buf === "string" ? buf : Buffer.from(buf).toString("utf8");
      }
    };
    (global as any).TextEncoder = class {
      encode(str: string) {
        return Buffer.from(str, "utf8");
      }
    };
  });

  it("init() manages initial focus on message input", async () => {
    const mod = await import(/* @vite-ignore */ JS_PATH);
    const init = mod?.NHSWidget?.init ?? mod?.init;

    const input = docElements["message-input"];
    const focusSpy = vi.spyOn(input, "focus");

    init();
    expect(focusSpy).toHaveBeenCalled();
  });

  it("submitting a message renders user bubble and typing indicator", async () => {
    const mod = await import(/* @vite-ignore */ JS_PATH);
    const init = mod?.NHSWidget?.init ?? mod?.init;

    let resolveFetch: (res: any) => void;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });

    (global as any).fetch = vi.fn().mockReturnValue(fetchPromise);

    init();

    const input = docElements["message-input"];
    const form = docElements["chat-form"];
    const sendButton = docElements["send-button"];
    const response = docElements["response"];

    input.value = "How do I sterilise baby bottles?";
    form.dispatchEvent({ type: "submit", preventDefault: () => {} });

    // User bubble rendered
    expect(response.text).toContain("How do I sterilise baby bottles?");
    const userBubble = response.querySelector(".bubble-user");
    expect(userBubble).not.toBeNull();
    expect(userBubble?.text).toBe("How do I sterilise baby bottles?");

    // Typing indicator visible
    const indicator = response.querySelector(".typing-indicator");
    expect(indicator).not.toBeNull();
    expect(sendButton.disabled).toBe(true);
  });

  it("token streaming appends to active assistant bubble and removes typing indicator", async () => {
    const mod = await import(/* @vite-ignore */ JS_PATH);
    const init = mod?.NHSWidget?.init ?? mod?.init;

    const sseLines = [
      'data: {"type":"token","payload":{"text":"Wash bottles in "}}\n\n',
      'data: {"type":"token","payload":{"text":"hot soapy water."}}\n\n',
      'data: {"type":"done","payload":{"session_id":"ses-abc-123","sources":[]}}\n\n',
    ];

    let index = 0;
    const stream = {
      getReader: () => ({
        read: async () => {
          if (index < sseLines.length) {
            const line = sseLines[index++];
            return { done: false, value: line };
          }
          return { done: true, value: undefined };
        },
      }),
    };

    (global as any).fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: stream,
    });

    init();

    const input = docElements["message-input"];
    const form = docElements["chat-form"];
    const response = docElements["response"];

    input.value = "How do I wash bottles?";
    form.dispatchEvent({ type: "submit", preventDefault: () => {} });

    await new Promise((r) => setTimeout(r, 20));

    // Typing indicator removed
    expect(response.querySelector(".typing-indicator")).toBeNull();

    // Assistant bubble contains full streamed text
    const assistantBubble = response.querySelector(".bubble-assistant");
    expect(assistantBubble).not.toBeNull();
    expect(assistantBubble?.text).toBe("Wash bottles in hot soapy water.");
  });

  it("signpost envelope renders distinct card with verbatim contacts (rule 02.4)", async () => {
    const mod = await import(/* @vite-ignore */ JS_PATH);
    const init = mod?.NHSWidget?.init ?? mod?.init;

    const signpostEvent = {
      type: "signpost",
      payload: {
        tier: 1,
        headline: "Call 999 immediately",
        reason_plain_language: "Your child may need emergency medical care.",
        services: [
          { name: "Emergency Services", contact: "999" },
          { name: "NHS 111", contact: "111" },
        ],
      },
    };

    let delivered = false;
    const stream = {
      getReader: () => ({
        read: async () => {
          if (!delivered) {
            delivered = true;
            return { done: false, value: `data: ${JSON.stringify(signpostEvent)}\n\n` };
          }
          return { done: true, value: undefined };
        },
      }),
    };

    (global as any).fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: stream,
    });

    init();

    const input = docElements["message-input"];
    const form = docElements["chat-form"];
    const response = docElements["response"];

    input.value = "Baby stopped breathing";
    form.dispatchEvent({ type: "submit", preventDefault: () => {} });

    await new Promise((r) => setTimeout(r, 20));

    const card = response.querySelector(".signpost-card");
    expect(card).not.toBeNull();
    expect(card?.getAttribute("role")).toBe("alert");
    expect(card?.text).toContain("Call 999 immediately");
    expect(card?.text).toContain("Your child may need emergency medical care.");
    expect(card?.text).toContain("Emergency Services: 999");
    expect(card?.text).toContain("NHS 111: 111");
  });

  it("error event renders safe generic fallback message", async () => {
    const mod = await import(/* @vite-ignore */ JS_PATH);
    const init = mod?.NHSWidget?.init ?? mod?.init;

    (global as any).fetch = vi.fn().mockRejectedValue(new Error("Network drop"));

    init();

    const input = docElements["message-input"];
    const form = docElements["chat-form"];
    const response = docElements["response"];

    input.value = "Test network error";
    form.dispatchEvent({ type: "submit", preventDefault: () => {} });

    await new Promise((r) => setTimeout(r, 20));

    expect(response.text).toContain("Sorry, something went wrong.");
    expect(response.text).toContain("NHS 111");
  });

  it("worker fetch handler delegates GET / to env.ASSETS", async () => {
    const workerModule = await import("../src/index");
    const worker = workerModule.default;

    const mockAssetResponse = new Response("<html>NHS Parenting Companion</html>", {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });

    const envWithAssets = {
      ASSETS: {
        fetch: vi.fn().mockResolvedValue(mockAssetResponse),
      },
    };

    const res = await worker.fetch(
      new Request("http://localhost/"),
      envWithAssets as any,
      {}
    );

    expect(res.status).toBe(200);
    expect(await res.text()).toContain("NHS Parenting Companion");
    expect(envWithAssets.ASSETS.fetch).toHaveBeenCalled();
  });
});
