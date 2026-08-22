/**
 * M1 Frontend Widget [P1-T7, P3-T1].
 *
 * Client half of the safety path (rules-02). Renders the frozen SSE envelope
 * contract ({ type: "token" | "signpost" | "error" | "done", payload }) from
 * the /chat gateway into accessible chat message bubbles and signpost cards.
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
  const form = document.getElementById("chat-form");

  let sessionId = undefined;
  let inFlight = false;
  let currentAssistantBubble = null;
  let typingIndicator = null;

  function scrollToBottom() {
    if (response) {
      response.scrollTop = response.scrollHeight;
    }
  }

  function appendUserBubble(text) {
    const turn = document.createElement("div");
    turn.className = "message-turn user";

    const label = document.createElement("span");
    label.className = "message-label sr-only";
    label.appendChild(document.createTextNode("You asked:"));
    turn.appendChild(label);

    const bubble = document.createElement("div");
    bubble.className = "bubble bubble-user";
    bubble.appendChild(document.createTextNode(text));
    turn.appendChild(bubble);

    response.appendChild(turn);
    scrollToBottom();
  }

  function showTypingIndicator() {
    if (typingIndicator) return;
    typingIndicator = document.createElement("div");
    typingIndicator.className = "typing-indicator";
    typingIndicator.id = "typing-indicator";
    typingIndicator.setAttribute("aria-label", "NHS Parenting Companion is writing a response");

    const dot1 = document.createElement("span");
    dot1.className = "dot";
    const dot2 = document.createElement("span");
    dot2.className = "dot";
    const dot3 = document.createElement("span");
    dot3.className = "dot";

    typingIndicator.appendChild(dot1);
    typingIndicator.appendChild(dot2);
    typingIndicator.appendChild(dot3);

    response.appendChild(typingIndicator);
    scrollToBottom();
  }

  function hideTypingIndicator() {
    if (typingIndicator && typingIndicator.parentNode) {
      typingIndicator.parentNode.removeChild(typingIndicator);
    }
    typingIndicator = null;
  }

  function appendAssistantToken(text) {
    hideTypingIndicator();

    if (!currentAssistantBubble) {
      const turn = document.createElement("div");
      turn.className = "message-turn assistant";

      const label = document.createElement("span");
      label.className = "message-label sr-only";
      label.appendChild(document.createTextNode("NHS Parenting Companion:"));
      turn.appendChild(label);

      currentAssistantBubble = document.createElement("div");
      currentAssistantBubble.className = "bubble bubble-assistant";
      turn.appendChild(currentAssistantBubble);

      response.appendChild(turn);
    }

    const node = document.createTextNode(text);
    currentAssistantBubble.appendChild(node);
    scrollToBottom();
  }

  function renderSignpost(payload) {
    hideTypingIndicator();

    const card = document.createElement("section");
    const isTier1 = payload.tier === 1 || String(payload.headline).toLowerCase().includes("emergency");
    card.className = isTier1 ? "signpost-card tier-1" : "signpost-card";
    card.setAttribute("role", "alert");
    card.setAttribute("aria-label", "Help and support contact");

    const headline = document.createElement("h2");
    headline.appendChild(document.createTextNode(payload.headline || "Urgent Support"));
    card.appendChild(headline);

    if (payload.reason_plain_language) {
      const reason = document.createElement("p");
      reason.appendChild(document.createTextNode(payload.reason_plain_language));
      card.appendChild(reason);
    }

    if (Array.isArray(payload.services) && payload.services.length > 0) {
      const list = document.createElement("ul");
      list.className = "services-list";

      for (const service of payload.services) {
        const item = document.createElement("li");
        item.className = "service-item";

        const name = document.createElement("strong");
        name.appendChild(document.createTextNode(service.name));
        item.appendChild(name);
        item.appendChild(document.createTextNode(": "));

        const contact = document.createElement("span");
        contact.className = "contact-detail";
        contact.appendChild(document.createTextNode(service.contact));
        item.appendChild(contact);

        list.appendChild(item);
      }
      card.appendChild(list);
    }

    response.appendChild(card);
    scrollToBottom();
  }

  function showError() {
    hideTypingIndicator();
    const errorDiv = document.createElement("div");
    errorDiv.className = "chat-error";
    errorDiv.setAttribute("role", "alert");
    errorDiv.appendChild(document.createTextNode(SAFE_ERROR_MESSAGE));
    response.appendChild(errorDiv);
    scrollToBottom();
  }

  async function send() {
    const message = input.value.trim();
    if (!message || inFlight) return;

    inFlight = true;
    sendButton.disabled = true;
    input.value = "";
    currentAssistantBubble = null;

    appendUserBubble(message);
    showTypingIndicator();

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

      if (!res.body || typeof res.body.getReader !== "function") {
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
            appendAssistantToken(render.text);
          } else if (render.type === "signpost") {
            renderSignpost(render.payload);
          } else if (render.type === "error") {
            showError();
          } else if (render.type === "done") {
            hideTypingIndicator();
            if (render.sessionId) {
              sessionId = render.sessionId;
            }
          }
        }
      }
    } catch (e) {
      showError();
    } finally {
      inFlight = false;
      sendButton.disabled = false;
      hideTypingIndicator();
      input.focus();
    }
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      send();
    });
  } else {
    sendButton.addEventListener("click", send);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        send();
      }
    });
  }

  input.focus();
}

export const NHSWidget = { init, buildRequest, handleSseEvent };

if (typeof window !== "undefined") {
  window.NHSWidget = NHSWidget;
}
