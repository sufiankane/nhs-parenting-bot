/**
 * Remote golden smoke check — SafetyBatch F1 prep.
 *
 * Post-deploy verification that a deployed /chat endpoint honours the frozen
 * SSE safety contract end-to-end:
 *   - every event matches the envelope { type: "token" | "signpost" | "error" | "done", payload }
 *   - the stream terminates with exactly one `done` event
 *   - known-good everyday questions yield grounded (non-fallback) answers
 *   - no internal binding / model / stack-trace leakage in the raw response
 *
 * NOT part of CI. Manual post-deploy verification only. Deploy remains
 * human-only (AGENTS.md §8, rules-06.09) — this script never deploys.
 *
 * // run: SMOKE_TARGET_URL=... npx tsx scripts/smoke/remote-golden-check.ts
 */

interface GoldenQuestion {
  readonly category: string;
  readonly question: string;
}

/** Exactly 10 golden questions spanning all 7 corpus categories. */
const GOLDEN_QUESTIONS: readonly GoldenQuestion[] = [
  { category: "feeding", question: "How do I safely make up a bottle of powdered baby formula?" },
  { category: "weaning-nutrition", question: "When should I start giving my baby solid foods?" },
  { category: "sleep", question: "What is the safest room temperature for my baby to sleep in?" },
  { category: "teething-development", question: "How can I soothe my baby's sore gums while teething?" },
  { category: "minor-ailments", question: "How do I treat nappy rash on my baby?" },
  { category: "emotional-wellbeing", question: "What is the difference between baby blues and postnatal depression?" },
  { category: "newborn-care", question: "How should I care for my newborn's umbilical cord stump?" },
  { category: "feeding", question: "How do I sterilise baby bottles before use?" },
  { category: "sleep", question: "How can I help my baby settle for a daytime nap?" },
  { category: "newborn-care", question: "How should I bathe my newborn baby safely?" },
];

const TIMEOUT_MS = 30_000;

/** Frozen SSE contract (Spec §4 M5 / rules-04.05). Additive changes only. */
type EventType = "token" | "signpost" | "error" | "done";

interface SseEvent {
  readonly type: EventType;
  readonly payload: unknown;
}

interface ParseResult {
  readonly events: readonly SseEvent[];
  readonly parseErrors: readonly string[];
}

interface RowResult {
  readonly index: number;
  readonly question: string;
  readonly status: "PASS" | "FAIL";
  readonly events: number;
  readonly grounded: boolean;
  readonly leaks: boolean;
  readonly problems: readonly string[];
}

/**
 * Parse SSE `data:` lines into events. Each event is a single JSON object on
 * one `data:` line; blank lines delimit events. Non-data SSE fields are ignored.
 */
function parseSse(raw: string): ParseResult {
  const events: SseEvent[] = [];
  const parseErrors: string[] = [];
  const dataLines: string[] = [];

  const flush = (): void => {
    if (dataLines.length === 0) return;
    const data = dataLines.join("\n");
    const json = data.startsWith("data:") ? data.slice(5).trimStart() : data;
    dataLines.length = 0;
    try {
      events.push(JSON.parse(json) as SseEvent);
    } catch {
      parseErrors.push("unparseable SSE data line");
    }
  };

  for (const line of raw.split(/\r?\n/)) {
    if (line === "") {
      flush();
      continue;
    }
    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart());
    }
  }
  flush();

  return { events, parseErrors };
}

/** Validate one event against the frozen envelope and payload shapes. */
function validateEvent(ev: SseEvent): readonly string[] {
  const problems: string[] = [];
  const type = ev.type;

  if (type !== "token" && type !== "signpost" && type !== "error" && type !== "done") {
    problems.push(`unknown event type "${String(type)}"`);
    return problems;
  }

  const payload = ev.payload;
  if (typeof payload !== "object" || payload === null) {
    problems.push(`event "${type}" payload is not an object`);
    return problems;
  }
  const p = payload as Record<string, unknown>;

  switch (type) {
    case "token":
      if (typeof p.text !== "string") problems.push("token.payload.text is not a string");
      break;
    case "done":
      if (typeof p.session_id !== "string") problems.push("done.payload.session_id is not a string");
      break;
    case "signpost": {
      if (typeof p.tier !== "number" || (p.tier !== 1 && p.tier !== 2 && p.tier !== 3)) {
        problems.push("signpost.payload.tier is not 1|2|3");
      }
      if (typeof p.headline !== "string") problems.push("signpost.payload.headline is not a string");
      if (typeof p.reason_plain_language !== "string") {
        problems.push("signpost.payload.reason_plain_language is not a string");
      }
      if (!Array.isArray(p.services)) {
        problems.push("signpost.payload.services is not an array");
      } else {
        for (const s of p.services) {
          if (typeof s !== "object" || s === null) {
            problems.push("signpost service entry is not an object");
            continue;
          }
          const svc = s as Record<string, unknown>;
          if (typeof svc.name !== "string") problems.push("signpost service.name is not a string");
          if (typeof svc.contact !== "string") problems.push("signpost service.contact is not a string");
          if (typeof svc.use !== "string") problems.push("signpost service.use is not a string");
        }
      }
      break;
    }
    case "error":
      if (typeof p.code !== "string") problems.push("error.payload.code is not a string");
      if (typeof p.message !== "string") problems.push("error.payload.message is not a string");
      break;
  }

  return problems;
}

/** Internal binding / model / stack-trace names that must never reach the client (rule 04.14). */
const RAW_LEAK_PATTERNS: readonly RegExp[] = [
  /\b(AI|VECTOR_INDEX|DB|SESSIONS|RAW_CONTENT|INGEST_QUEUE)\b/,
  /llama/i,
  /bge/i,
  /\bat\s+\w+\s+\(/,
];

/** Leak check: raw text must not expose internals; error events carry generic codes only. */
function findLeaks(raw: string, events: readonly SseEvent[]): readonly string[] {
  const leaks: string[] = [];

  for (const re of RAW_LEAK_PATTERNS) {
    if (re.test(raw)) leaks.push(`raw response matched ${re.source}`);
  }

  // Error events must carry generic codes only — never "Error:" text (rule 04.14).
  for (const ev of events) {
    if (ev.type !== "error") continue;
    const payload = ev.payload;
    if (typeof payload !== "object" || payload === null) continue;
    const message = (payload as Record<string, unknown>).message;
    if (typeof message === "string" && /Error:/i.test(message)) {
      leaks.push("error event message contains 'Error:'");
    }
  }

  return leaks;
}

/** POST one golden question and assert the full safety contract. */
async function runCheck(
  baseUrl: string,
  q: GoldenQuestion,
  index: number
): Promise<RowResult> {
  const problems: string[] = [];
  let events: readonly SseEvent[] = [];
  let raw = "";
  let grounded = false;
  let leaks = true;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(`${baseUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q.question }),
        signal: controller.signal,
      });

      if (res.status !== 200) {
        problems.push(`HTTP ${res.status} (expected 200)`);
      }
      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("text/event-stream")) {
        problems.push(`Content-Type "${contentType}" is not text/event-stream`);
      }
      raw = await res.text();
    } finally {
      clearTimeout(timer);
    }

    const parsed = parseSse(raw);
    events = parsed.events;
    for (const err of parsed.parseErrors) {
      problems.push(`SSE parse error: ${err}`);
    }
    for (const ev of events) {
      problems.push(...validateEvent(ev));
    }

    const doneEvents = events.filter((ev) => ev.type === "done");
    if (doneEvents.length !== 1) {
      problems.push(`expected exactly 1 done event, found ${doneEvents.length}`);
    } else {
      const donePayload = doneEvents[0].payload as Record<string, unknown>;
      grounded = donePayload.fallback !== true;
      if (!grounded) {
        problems.push("answer fell back (done.payload.fallback === true)");
      }
    }

    const leakProblems = findLeaks(raw, events);
    leaks = leakProblems.length === 0;
    problems.push(...leakProblems);
  } catch (err) {
    // Network / timeout errors are FAIL rows, never unhandled rejections.
    problems.push(
      `network/timeout error: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  const status = problems.length === 0 ? "PASS" : "FAIL";
  return {
    index,
    question: q.question,
    status,
    events: events.length,
    grounded,
    leaks,
    problems,
  };
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 3)}...`;
}

async function main(): Promise<void> {
  const targetUrl = process.env.SMOKE_TARGET_URL;
  if (!targetUrl) {
    console.error(
      "SMOKE_TARGET_URL is not set. Set it to the deployed /chat base URL, " +
        "e.g. https://nhs-parenting-bot.<account>.workers.dev"
    );
    process.exitCode = 1;
    return;
  }
  const baseUrl = targetUrl.replace(/\/+$/, "");

  const results: RowResult[] = [];
  for (let i = 0; i < GOLDEN_QUESTIONS.length; i++) {
    results.push(await runCheck(baseUrl, GOLDEN_QUESTIONS[i], i + 1));
  }

  console.log("# | question | status | events | grounded | leaks");
  for (const r of results) {
    console.log(
      `${r.index} | ${truncate(r.question, 40)} | ${r.status} | ${r.events} | ` +
        `${r.grounded ? "PASS" : "FAIL"} | ${r.leaks ? "PASS" : "FAIL"}`
    );
    for (const p of r.problems) {
      console.log(`    - ${p}`);
    }
  }

  const failures = results.filter((r) => r.status === "FAIL").length;
  console.log(`${results.length - failures}/${results.length} PASS`);
  process.exitCode = failures > 0 ? 1 : 0;
}

void main();
