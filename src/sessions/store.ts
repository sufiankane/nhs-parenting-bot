import type { MessageEntry, SessionRecord } from "./types";

/**
 * Minimal structural KV interface (Cloudflare Workers KV subset). No
 * cloudflare import needed — any object matching this shape is accepted.
 */
interface KVLike {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number }
  ): Promise<void>;
}

/** 24h session lifetime (rule 02.9 — KV session history must have a TTL). */
export const SESSION_TTL_SECONDS = 86400;
/** Maximum retained message entries per session. */
export const MAX_HISTORY = 50;

export function sessionKey(sessionId: string): string {
  return `session:${sessionId}`;
}

export function createSessionId(): string {
  return crypto.randomUUID();
}

/**
 * Read and validate a session record. Returns null on miss, corruption, or
 * expiry (rule 04.14 — corrupted KV JSON must fail safe, never throw).
 */
export async function getSession(
  kv: KVLike,
  sessionId: string
): Promise<SessionRecord | null> {
  const raw = await kv.get(sessionKey(sessionId));
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as SessionRecord).session_id === "string" &&
      Array.isArray((parsed as SessionRecord).messages)
    ) {
      const record = parsed as SessionRecord;
      const expires = Date.parse(record.expires_at);
      // Expired sessions are treated as absent (rule 02.9).
      if (Number.isNaN(expires) || expires <= Date.now()) return null;
      return record;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Append a message to a session's history, capping at MAX_HISTORY (drop
 * oldest) and refreshing the 24h TTL on every write (rule 02.9).
 */
export async function appendMessage(
  kv: KVLike,
  sessionId: string,
  entry: MessageEntry
): Promise<SessionRecord> {
  const existing = await getSession(kv, sessionId);
  const now = Date.now();

  const record: SessionRecord = existing ?? {
    session_id: sessionId,
    created_at: new Date(now).toISOString(),
    expires_at: new Date(now + 86_400_000).toISOString(),
    messages: [],
  };

  record.messages.push(entry);
  if (record.messages.length > MAX_HISTORY) {
    record.messages = record.messages.slice(record.messages.length - MAX_HISTORY);
  }
  record.expires_at = new Date(now + 86_400_000).toISOString();

  await kv.put(sessionKey(sessionId), JSON.stringify(record), {
    expirationTtl: SESSION_TTL_SECONDS,
  });
  return record;
}
