/**
 * M8 Anonymised Triage Audit Log — Unit & Integration Test Suite (P2-T3, Spec §4 M8).
 *
 * Safety rules protected:
 *  - rule 02.8: NEVER store raw user message text, user names, postcodes, or PII.
 *  - rule 04.14: Fail-safe logging — audit write failures NEVER crash or block the user response.
 *  - Spec §4 M8: Schema columns (id, timestamp, tier, signal_categories, session_pseudonym).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { logTriageAudit, pseudonymizeSessionId } from "../src/audit/index";
import type { AuditLogEntry } from "../src/audit/types";
import worker, { Env } from "../src/index";

describe("M8 Anonymised Triage Audit Log [P2-T3, Spec §4 M8, rule 02.8]", () => {
  let mockDb: any;
  let executedSql: string[] = [];
  let boundParams: any[] = [];

  beforeEach(() => {
    executedSql = [];
    boundParams = [];
    mockDb = {
      prepare: vi.fn((sql: string) => {
        executedSql.push(sql);
        return {
          bind: vi.fn((...args: any[]) => {
            boundParams.push(args);
            return {
              run: vi.fn().mockResolvedValue({ success: true }),
            };
          }),
        };
      }),
    };
  });

  it("inserts an anonymised audit row with tier, categories, and pseudonym", async () => {
    const entry: AuditLogEntry = {
      tier: 1,
      signal_categories: ["emergency_respiratory", "emergency_cardiac"],
      session_id: "test-uuid-1234",
    };

    const success = await logTriageAudit(mockDb, entry);

    expect(success).toBe(true);
    expect(executedSql).toHaveLength(1);
    expect(executedSql[0]).toContain("INSERT INTO triage_audit_log");
    expect(boundParams).toHaveLength(1);

    const [tier, categoriesJson, pseudonym] = boundParams[0];
    expect(tier).toBe(1);
    expect(JSON.parse(categoriesJson)).toEqual([
      "emergency_respiratory",
      "emergency_cardiac",
    ]);
    expect(typeof pseudonym).toBe("string");
    expect(pseudonym).toHaveLength(32);
    expect(pseudonym).not.toContain("test-uuid-1234");
  });

  it("pseudonymizeSessionId generates a deterministic, irreversible hex pseudonym", async () => {
    const p1 = await pseudonymizeSessionId("session-abc");
    const p2 = await pseudonymizeSessionId("session-abc");
    const p3 = await pseudonymizeSessionId("session-def");

    expect(p1).toBe(p2);
    expect(p1).not.toBe(p3);
    expect(p1).toMatch(/^[a-f0-9]{32}$/);
  });

  it("enforces rule 02.8: zero PII or raw user text in audit SQL and bindings", async () => {
    const entry: AuditLogEntry = {
      tier: 3,
      signal_categories: ["safeguarding_welfare"],
      session_id: "sensitive-user-session-id",
    };

    await logTriageAudit(mockDb, entry);

    const fullSql = executedSql.join(" ");
    const fullParamsStr = JSON.stringify(boundParams);

    // Verify no raw message content or sensitive identifiers in SQL/bindings
    expect(fullSql).not.toContain("sensitive-user-session-id");
    expect(fullParamsStr).not.toContain("sensitive-user-session-id");
    expect(fullSql).toContain("triage_audit_log (tier, signal_categories, session_pseudonym)");
  });

  it("handles missing or empty signal_categories safely", async () => {
    const entry: AuditLogEntry = {
      tier: 4,
      signal_categories: [],
      session_id: "safe-session",
    };

    const success = await logTriageAudit(mockDb, entry);
    expect(success).toBe(true);
    expect(boundParams[0][0]).toBe(4);
    expect(boundParams[0][1]).toBe("[]");
  });

  it("fails safe when database binding is missing or throws (rule 04.14)", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // Missing DB
    const noDbSuccess = await logTriageAudit(null, {
      tier: 2,
      signal_categories: ["urgent_medical"],
      session_id: "s1",
    });
    expect(noDbSuccess).toBe(false);

    // Throwing DB
    const throwingDb = {
      prepare: vi.fn(() => {
        throw new Error("D1 connection lost");
      }),
    };
    const throwSuccess = await logTriageAudit(throwingDb, {
      tier: 2,
      signal_categories: ["urgent_medical"],
      session_id: "s1",
    });
    expect(throwSuccess).toBe(false);

    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it("rejects invalid triage tiers gracefully", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const invalidEntry = {
      tier: 5 as any,
      signal_categories: [],
      session_id: "s1",
    };

    const success = await logTriageAudit(mockDb, invalidEntry);
    expect(success).toBe(false);
    expect(executedSql).toHaveLength(0);
    errorSpy.mockRestore();
  });
});

describe("M8 Audit Integration in /chat [P2-T3, Spec §4 M2/M8]", () => {
  let boundParams: any[] = [];
  let mockDb: any;
  let waitUntilPromises: Promise<any>[] = [];

  const baseEnv: Env = {
    ALLOWED_ORIGINS: "https://example.com",
    RATE_LIMIT_PER_MINUTE: "20",
    SIMILARITY_THRESHOLD: "0.5",
    SESSIONS: {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
    } as any,
    DB: undefined,
  };

  beforeEach(() => {
    boundParams = [];
    waitUntilPromises = [];
    mockDb = {
      prepare: vi.fn((sql: string) => ({
        bind: vi.fn((...args: any[]) => {
          boundParams.push(args);
          return {
            run: vi.fn().mockResolvedValue({ success: true }),
          };
        }),
      })),
    };
  });

  it("logs audit event via ctx.waitUntil on Tier 1 emergency escalation", async () => {
    const ctx = {
      waitUntil: vi.fn((p: Promise<any>) => {
        waitUntilPromises.push(p);
      }),
    };

    const env: Env = {
      ...baseEnv,
      DB: mockDb,
    };

    const req = new Request("https://worker.local/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://example.com",
      },
      body: JSON.stringify({
        message: "my baby is not breathing and turning blue",
      }),
    });

    const res = await worker.fetch(req, env, ctx);
    expect(res.status).toBe(200);
    expect(ctx.waitUntil).toHaveBeenCalled();

    // Await the background audit task
    await Promise.all(waitUntilPromises);

    expect(boundParams).toHaveLength(1);
    const [tier, categoriesJson] = boundParams[0];
    expect(tier).toBe(1);
    expect(JSON.parse(categoriesJson)).toContain("respiratory_arrest");
  });
});
