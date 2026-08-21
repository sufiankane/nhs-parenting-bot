/**
 * M1 Frontend Widget [P1-T7].
 *
 * Client half of the safety path (rules-02). Renders the frozen SSE envelope
 * contract ({ type: "token" | "signpost" | "error" | "done", payload }) from
 * the /chat gateway.
 *
 * Safety obligations implemented here:
 *  - rule 02.4: signpost contacts are rendered verbatim, never reformatted.
 *  - rule 02.5: user/assistant text is data, never markup (text nodes only).
 *  - rule 04.6: unknown envelope types are ignored, never thrown.
 *  - rule 04.14: errors show a safe generic message; internals never leak.
 *  - Spec §4 M1: session_id is server-issued; the widget only echoes a stored
 *    id from a prior `done` event and never invents one on the first message.
 */

const CHAT_ENDPOINT = "/chat";

const SAFE_ERROR_MESSAGE =
  "Sorry, something went wrong. Please try again, or call NHS 111 on 111 if you need urgent help.";

/**
 * Build the JSON request body for one chat turn.
 * session_id is included ONLY when a stored (server-issued) id exists.
 */
export function buildRequest(message, sessionId) {
  const body = { message };
  if (sessionId) {
    body.session_id = sessionId;
  }
  return body;
}

/**
 * Pure SSE envelope dispatcher (rule 04.13). Returns a render instruction;
 * unknown types resolve to { type: "ignore" } and never throw (rule 04.6).
 */
export function handleSseEvent(envelope, state) {
  switch (envelope.type) {
    case "token":
      return { state, render: { type: "token", text: envelope.payload.text } };
    case "signpost":
      return { state, render: { type: "signpost", payload: envelope.payload } };
    case "error":
      return { state, render: { type: "error" } };
    case "done":
      return {
        state: { ...state, sessionId: envelope.payload.session_id },
        render: { type: "done", sessionId: envelope.payload.session_id },
      };
    default:
      return { state, render: null };
  }
}

/**
 * Wire up the widget. Called by the browser after DOM load; safe to call
 * multiple times (listeners are attached once per element).
 */
export function init() {
  const input = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");
  const response = document.getElementById("response");

  let sessionId = undefined;
  let inFlight = false;

  function appendText(text) {
    const node = document.createTextNode(text);
    response.appendChild(node);
  }

  function renderSignpost(payload) {
    const card = document.createElement("section");
    card.className = "signpost-card";
    card.setAttribute("aria-label", "Help and support");

    const headline = document.createElement("h2");
    headline.appendChild(document.createTextNode(payload.headline));
    card.appendChild(headline);

    const reason = document.createElement("p");
    reason.appendChild(document.createTextNode(payload.reason_plain_language));
    card.appendChild(reason);

    for (const service of payload.services) {
      const serviceBlock = document.createElement("p");
      const name = document.createElement("strong");
      name.appendChild(document.createTextNode(service.name));
      serviceBlock.appendChild(name);
      serviceBlock.appendChild(document.createTextNode(": "));
      serviceBlock.appendChild(document.createTextNode(service.contact));
      card.appendChild(serviceBlock);
    }

    response.appendChild(card);
  }

  function showError() {
    const node = document.createTextNode(SAFE_ERROR_MESSAGE);
    response.appendChild(node);
  }

  async function send() {
    const message = input.value.trim();
    if (!message || inFlight) return;

    inFlight = true;
    sendButton.disabled = true;
    input.value = "";

    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildRequest(message, sessionId)),
      });

      if (!res.ok) {
        showError();
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (!data) continue;
          let envelope;
          try {
            envelope = JSON.parse(data);
          } catch (e) {
            continue;
          }
          const { render } = handleSseEvent(envelope, { sessionId });
          if (!render) continue;
          if (render.type === "token") {
            appendText(render.text);
          } else if (render.type === "signpost") {
            renderSignpost(render.payload);
          } else if (render.type === "error") {
            showError();
          } else if (render.type === "done") {
            sessionId = render.sessionId;
          }
        }
      }
    } catch (e) {
      showError();
    } finally {
      inFlight = false;
      sendButton.disabled = false;
      input.focus();
    }
  }

  sendButton.addEventListener("click", send);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      send();
    }
  });

  input.focus();
}

export const NHSWidget = { init, buildRequest, handleSseEvent };

if (typeof window !== "undefined") {
  window.NHSWidget = NHSWidget;
}
