/**
 * Session store contract tests (P1-T8, TDD against the worker-dev brief).
 *
 * Spec task IDs / safety rules protected:
 *  - P1-T8 (Spec §4 M2): KV-backed session history for /chat.
 *  - rule 02.9 (KV session history TTL): every put must carry
 *    expirationTtl: 86400 (24h) — a session must never persist indefinitely.
 *  - rule 02.8 (no PII persistence): MessageEntry carries only role/content/at;
 *    no names, addresses, postcodes or other PII fields may be added.
 *  - rule 04.14 (errors): corrupted KV JSON must fail safe (null / fresh
 *    record), never throw into the request path.
 *
 * Expected module contract (worker-dev):
 *   src/sessions/types.ts:
 *     MessageEntry { role: "user" | "assistant"; content: string; at: string }
 *     SessionRecord { session_id; created_at; expires_at; messages: MessageEntry[] }
 *   src/sessions/store.ts:
 *     createSessionId(): string            (crypto.randomUUID)
 *     appendMessage(kv, sessionId, entry)  (24h TTL on every put, 50-entry cap)
 *     getSession(kv, sessionId)
 *     sessionKey(sessionId) = `session:${sessionId}`
 */

import { describe, it, expect, vi } from "vitest";
import {
  createSessionId,
  appendMessage,
  getSession,
  sessionKey,
} from "../src/sessions/store";
import type { MessageEntry, SessionRecord } from "../src/sessions/types";

/* -------------------------------------------------------------------------- */
/* Mock KV (in-memory Map with expirationTtl capture)                          */
/* -------------------------------------------------------------------------- */

class MockKv {
  readonly store = new Map<string, { value: string; expirationTtl?: number }>();
  readonly putCalls: Array<{
    key: string;
    value: string;
    options?: { expirationTtl?: number };
  }> = [];

  async get(key: string): Promise<string | null> {
    return this.store.get(key)?.value ?? null;
  }

  async put(
    key: string,
    value: string,
    options?: { expirationTtl?: number }
  ): Promise<void> {
    this.putCalls.push({ key, value, options });
    this.store.set(key, { value, expirationTtl: options?.expirationTtl });
  }
}

function seedRecord(kv: MockKv, record: SessionRecord): void {
  kv.store.set(sessionKey(record.session_id), {
    value: JSON.stringify(record),
  });
}

describe("createSessionId [P1-T8]", () => {
  it("returns a valid UUID v4 and unique across calls", () => {
    const uuidV4 =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const id = createSessionId();
      expect(id).toMatch(uuidV4);
      ids.add(id);
    }
    expect(ids.size).toBe(100);
  });
});

describe("appendMessage — new session [P1-T8, rule 02.9]", () => {
  it("creates a new session record with created_at/expires_at 24h apart and the message appended", async () => {
    const kv = new MockKv();
    const sessionId = createSessionId();
    const entry: MessageEntry = {
      role: "user",
      content: "SYNTHETIC-FIXTURE: how do I settle a newborn?",
      at: new Date().toISOString(),
    };

    const record = await appendMessage(kv, sessionId, entry);

    expect(record.session_id).toBe(sessionId);
    expect(record.messages).toEqual([entry]);

    const created = Date.parse(record.created_at);
    const expires = Date.parse(record.expires_at);
    expect(Number.isNaN(created)).toBe(false);
    expect(Number.isNaN(expires)).toBe(false);
    // protects rule 02.9 — 24h lifetime between created_at and expires_at.
    expect(Math.abs(expires - created - 86_400_000)).toBeLessThanOrEqual(5_000);
  });

  it("sets expirationTtl 86400 on EVERY put (rule 02.9)", async () => {
    const kv = new MockKv();
    const sessionId = createSessionId();

    await appendMessage(kv, sessionId, {
      role: "user",
      content: "SYNTHETIC-FIXTURE: msg 1",
      at: "2026-01-01T00:00:00.000Z",
    });
    await appendMessage(kv, sessionId, {
      role: "assistant",
      content: "SYNTHETIC-FIXTURE: reply 1",
      at: "2026-01-01T00:00:01.000Z",
    });

    expect(kv.putCalls.length).toBe(2);
    for (const call of kv.putCalls) {
      // protects rule 02.9 — KV session history must have a TTL (default 24h).
      expect(call.key).toBe(sessionKey(sessionId));
      expect(call.options?.expirationTtl).toBe(86400);
    }
  });

  it("appends to existing history and refreshes the TTL (expires_at moves forward)", async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
      const kv = new MockKv();
      const sessionId = createSessionId();

      const first = await appendMessage(kv, sessionId, {
        role: "user",
        content: "SYNTHETIC-FIXTURE: msg 1",
        at: "2026-01-01T00:00:00.000Z",
      });
      expect(first.messages).toHaveLength(1);

      vi.advanceTimersByTime(60_000); // 1 minute later
      const second = await appendMessage(kv, sessionId, {
        role: "assistant",
        content: "SYNTHETIC-FIXTURE: reply 1",
        at: "2026-01-01T00:01:00.000Z",
      });

      expect(second.messages).toHaveLength(2);
      expect(second.messages[0]).toEqual(first.messages[0]);
      expect(second.messages[1]).toEqual({
        role: "assistant",
        content: "SYNTHETIC-FIXTURE: reply 1",
        at: "2026-01-01T00:01:00.000Z",
      });
      // protects rule 02.9 — every put refreshes the 24h TTL.
      expect(Date.parse(second.expires_at)).toBeGreaterThan(
        Date.parse(first.expires_at)
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("caps history at 50 entries, dropping the oldest (max 50 retained)", async () => {
    const kv = new MockKv();
    const sessionId = createSessionId();

    for (let i = 1; i <= 51; i++) {
      await appendMessage(kv, sessionId, {
        role: "user",
        content: `SYNTHETIC-FIXTURE: msg ${i}`,
        at: `2026-01-01T00:00:${String(i).padStart(2, "0")}.000Z`,
      });
    }

    const record = await getSession(kv, sessionId);
    expect(record).not.toBeNull();
    expect(record!.messages).toHaveLength(50);
    // Oldest (msg 1) dropped; newest (msg 51) retained.
    expect(record!.messages[0].content).toBe("SYNTHETIC-FIXTURE: msg 2");
    expect(record!.messages[49].content).toBe("SYNTHETIC-FIXTURE: msg 51");
  });
});

describe("getSession [P1-T8, rule 02.9]", () => {
  it("returns null for unknown or expired sessions", async () => {
    const kv = new MockKv();
    const unknown = await getSession(kv, createSessionId());
    expect(unknown).toBeNull();

    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
      const sessionId = createSessionId();
      await appendMessage(kv, sessionId, {
        role: "user",
        content: "SYNTHETIC-FIXTURE: msg",
        at: "2026-01-01T00:00:00.000Z",
      });

      // 25h later the 24h TTL has elapsed.
      vi.advanceTimersByTime(25 * 3600 * 1000);
      const expired = await getSession(kv, sessionId);
      expect(expired).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("Session record shape — no PII fields [P1-T8, rule 02.8]", () => {
  it("session records contain no PII fields beyond role/content/at (rule 02.8)", async () => {
    const kv = new MockKv();
    const sessionId = createSessionId();
    const record = await appendMessage(kv, sessionId, {
      role: "user",
      content: "SYNTHETIC-FIXTURE: msg",
      at: "2026-01-01T00:00:00.000Z",
    });

    // protects rule 02.8 — exact key set; any added field (name, postcode,
    // address, ...) fails here.
    expect(Object.keys(record.messages[0]).sort()).toEqual([
      "at",
      "content",
      "role",
    ]);
    expect(Object.keys(record).sort()).toEqual([
      "created_at",
      "expires_at",
      "messages",
      "session_id",
    ]);
    for (const m of record.messages) {
      expect(["user", "assistant"]).toContain(m.role);
      expect(typeof m.content).toBe("string");
      expect(typeof m.at).toBe("string");
    }
  });
});

describe("Corrupted KV JSON fail-safe [P1-T8, rule 04.14]", () => {
  it("getSession returns null and appendMessage starts a fresh record, never throwing", async () => {
    const kv = new MockKv();
    const sessionId = createSessionId();
    kv.store.set(sessionKey(sessionId), { value: "{not valid json!!" });

    const read = await getSession(kv, sessionId);
    expect(read).toBeNull();

    const record = await appendMessage(kv, sessionId, {
      role: "user",
      content: "SYNTHETIC-FIXTURE: fresh start",
      at: "2026-01-01T00:00:00.000Z",
    });
    expect(record.session_id).toBe(sessionId);
    expect(record.messages).toHaveLength(1);
    expect(record.messages[0].content).toBe("SYNTHETIC-FIXTURE: fresh start");
  });
});
