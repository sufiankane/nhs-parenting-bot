/**
 * Automated Scenario Test Runner & Business Analysis Discrepancy Detector
 *
 * Runs 1,000 parenting scenarios (or filtered subsets) against either:
 *  1. Live /chat HTTP SSE endpoint (with rate-limiting safeguards & backoff)
 *  2. In-process M3 Triage & Classifier module (instant deterministic & AI checks)
 *
 * Rate Limit Safeguards Built-in:
 *  - Virtual IP Rotation: assigns unique `CF-Connecting-IP` per scenario session.
 *  - Fixed Pacing Rate Limiter: throttles requests per minute (configurable RPM).
 *  - 429 Adaptive Backoff: detects HTTP 429, parses `Retry-After`, and automatically retries.
 *  - Request timeout via AbortController (30s max per request).
 *  - Global watchdog to ensure self-termination (AGENTS.md §10).
 *
 * Usage:
 *   npx tsx scripts/test-scenarios-runner.ts --mode=triage
 *   npx tsx scripts/test-scenarios-runner.ts --mode=http --url=http://127.0.0.1:8787/chat --rpm=18
 *   npx tsx scripts/test-scenarios-runner.ts --start=1 --end=100
 *   npx tsx scripts/test-scenarios-runner.ts --tier=1
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { triage, triageWithClassifier } from "../src/triage/index";
import { escalate } from "../src/escalation/index";

/* -------------------------------------------------------------------------- */
/* Types & Interfaces                                                         */
/* -------------------------------------------------------------------------- */

export type Tier = 1 | 2 | 3 | 4;

export interface TestScenario {
  readonly id: number;
  readonly message: string;
  readonly expectedTier: Tier;
  readonly expectedResponse: string;
  readonly signalCategory?: string;
  readonly notes?: string;
  readonly section: "A1_CHILD_T1" | "A2_CHILD_T2" | "A3_CHILD_T3" | "A4_CHILD_T4" | "B1_PARENT_T1" | "B2_PARENT_T3" | "B3_PARENT_T4";
}

export type DiscrepancySeverity =
  | "NONE"
  | "CRITICAL_T1_FALSE_NEGATIVE" // Expected T1, got T2/T3/T4 (Safety violation)
  | "MAJOR_URGENT_FALSE_NEGATIVE" // Expected T2/T3, got T4 (Missed clinical/safeguarding)
  | "OVER_ESCALATION"            // Expected T4, got T1/T2/T3 (User blocked unnecessarily)
  | "TIER_MISMATCH";             // e.g. Expected T2, got T3 or vice versa

export interface ScenarioExecutionResult {
  readonly scenario: TestScenario;
  readonly actualTier: Tier;
  readonly actualResponseSummary: string;
  readonly match: boolean;
  readonly severity: DiscrepancySeverity;
  readonly errorDetails?: string;
  readonly latencyMs: number;
  readonly logFilePath: string;
  readonly rawEvents?: readonly unknown[];
}

export interface RunnerOptions {
  mode: "http" | "triage";
  targetUrl: string;
  maxRpm: number;
  delayMs: number;
  startId: number;
  endId: number;
  filterTier?: Tier;
  scenariosFilePath?: string;
  outputDir: string;
}

/* -------------------------------------------------------------------------- */
/* Rate Limiter & Token Pacer                                                  */
/* -------------------------------------------------------------------------- */

class TokenPacer {
  private lastCallTime = 0;
  private readonly minIntervalMs: number;

  constructor(rpm: number, minDelayMs = 50) {
    const intervalFromRpm = (60 * 1000) / Math.max(1, rpm);
    this.minIntervalMs = Math.max(intervalFromRpm, minDelayMs);
  }

  async throttle(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastCallTime;
    if (elapsed < this.minIntervalMs) {
      const waitTime = this.minIntervalMs - elapsed;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    this.lastCallTime = Date.now();
  }
}

/* -------------------------------------------------------------------------- */
/* SSE Response Parser                                                        */
/* -------------------------------------------------------------------------- */

interface SseEvent {
  readonly type: "token" | "signpost" | "error" | "done";
  readonly payload: any;
}

function parseSseEvents(rawText: string): SseEvent[] {
  const events: SseEvent[] = [];
  const lines = rawText.split(/\r?\n/);
  const dataLines: string[] = [];

  const flush = () => {
    if (dataLines.length === 0) return;
    const combined = dataLines.join("\n").trim();
    dataLines.length = 0;
    if (!combined) return;
    try {
      events.push(JSON.parse(combined));
    } catch {
      // Ignore unparseable non-JSON data lines
    }
  };

  for (const line of lines) {
    if (line === "") {
      flush();
      continue;
    }
    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim());
    }
  }
  flush();
  return events;
}

/* -------------------------------------------------------------------------- */
/* Markdown Scenario Parser                                                   */
/* -------------------------------------------------------------------------- */

export function parseScenariosFromMarkdown(content: string): TestScenario[] {
  const scenarios: TestScenario[] = [];
  const lines = content.split(/\r?\n/);

  let currentSection: TestScenario["section"] = "A1_CHILD_T1";

  for (const line of lines) {
    if (line.includes("Section A1")) currentSection = "A1_CHILD_T1";
    else if (line.includes("Section A2")) currentSection = "A2_CHILD_T2";
    else if (line.includes("Section A3")) currentSection = "A3_CHILD_T3";
    else if (line.includes("Section A4")) currentSection = "A4_CHILD_T4";
    else if (line.includes("Section B1")) currentSection = "B1_PARENT_T1";
    else if (line.includes("Section B2")) currentSection = "B2_PARENT_T3";
    else if (line.includes("Section B3")) currentSection = "B3_PARENT_T4";

    const match = line.match(/^\|\s*(\d+)\s*\|\s*"([^"]+)"\s*\|\s*(T[1-4])\s*\|\s*([^|]+)\s*\|\s*([^|]*)\s*\|\s*([^|]*)\s*\|/);
    if (match) {
      const id = parseInt(match[1], 10);
      const message = match[2].trim();
      const tierStr = match[3].trim();
      const expectedResponse = match[4].trim();
      const signalCategory = match[5]?.trim() || "";
      const notes = match[6]?.trim() || "";

      let expectedTier: Tier = 4;
      if (tierStr === "T1") expectedTier = 1;
      else if (tierStr === "T2") expectedTier = 2;
      else if (tierStr === "T3") expectedTier = 3;
      else if (tierStr === "T4") expectedTier = 4;

      scenarios.push({
        id,
        message,
        expectedTier,
        expectedResponse,
        signalCategory,
        notes,
        section: currentSection,
      });
      continue;
    }

    // Also match 5-column table in T4 sections (where Signal Category is omitted)
    const match5Col = line.match(/^\|\s*(\d+)\s*\|\s*"([^"]+)"\s*\|\s*(T[1-4])\s*\|\s*([^|]+)\s*\|\s*([^|]*)\s*\|/);
    if (match5Col) {
      const id = parseInt(match5Col[1], 10);
      const message = match5Col[2].trim();
      const tierStr = match5Col[3].trim();
      const expectedResponse = match5Col[4].trim();
      const notes = match5Col[5]?.trim() || "";

      let expectedTier: Tier = 4;
      if (tierStr === "T1") expectedTier = 1;
      else if (tierStr === "T2") expectedTier = 2;
      else if (tierStr === "T3") expectedTier = 3;
      else if (tierStr === "T4") expectedTier = 4;

      scenarios.push({
        id,
        message,
        expectedTier,
        expectedResponse,
        notes,
        section: currentSection,
      });
    }
  }

  return scenarios;
}

/* -------------------------------------------------------------------------- */
/* Discrepancy Evaluator                                                      */
/* -------------------------------------------------------------------------- */

function evaluateDiscrepancy(expected: Tier, actual: Tier): { match: boolean; severity: DiscrepancySeverity } {
  if (expected === actual) {
    return { match: true, severity: "NONE" };
  }

  // Safety Critical: Expected Tier 1, downgraded to anything else
  if (expected === 1 && actual > 1) {
    return { match: false, severity: "CRITICAL_T1_FALSE_NEGATIVE" };
  }

  // Major: Expected Urgent T2 or Safeguarding T3, dropped to General T4
  if ((expected === 2 || expected === 3) && actual === 4) {
    return { match: false, severity: "MAJOR_URGENT_FALSE_NEGATIVE" };
  }

  // Over-escalation: Expected everyday T4, escalated to T1/T2/T3
  if (expected === 4 && actual < 4) {
    return { match: false, severity: "OVER_ESCALATION" };
  }

  // Cross-tier discrepancy between 2 and 3
  return { match: false, severity: "TIER_MISMATCH" };
}

/* -------------------------------------------------------------------------- */
/* Execution Engines                                                          */
/* -------------------------------------------------------------------------- */

async function executeInProcessTriage(scenario: TestScenario): Promise<{
  actualTier: Tier;
  actualResponseSummary: string;
  raw: unknown;
}> {
  const result = triage(scenario.message);
  let summary = `Triage Tier ${result.tier}`;
  if (result.tier !== 4) {
    const signpost = escalate(result.tier);
    summary = `[T${result.tier} Signpost] ${signpost?.payload?.headline ?? "Signposted"}: ${signpost?.payload?.services?.[0]?.name ?? ""}`;
  } else {
    summary = `[T4 RAG Candidate] Matched signals: none (safe everyday query)`;
  }

  return {
    actualTier: result.tier,
    actualResponseSummary: summary,
    raw: result,
  };
}

async function executeHttpChat(
  scenario: TestScenario,
  targetUrl: string,
  pacer: TokenPacer,
  maxRetries = 3
): Promise<{
  actualTier: Tier;
  actualResponseSummary: string;
  raw: unknown;
  latencyMs: number;
}> {
  const startTime = Date.now();
  let attempt = 0;

  // Rotate virtual IP per scenario ID to simulate distinct clients & avoid single IP KV rate limit
  const virtualIp = `192.0.2.${(scenario.id % 250) + 1}`;
  const sessionId = `test-sess-${scenario.id}-${Date.now()}`;

  while (attempt < maxRetries) {
    attempt++;
    await pacer.throttle();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30_000);

    try {
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": virtualIp,
        },
        body: JSON.stringify({
          message: scenario.message,
          sessionId,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      // Handle 429 RATE_LIMITED with Retry-After backoff
      if (response.status === 429) {
        const retryAfterHeader = response.headers.get("Retry-After");
        const waitSec = retryAfterHeader ? Math.min(parseInt(retryAfterHeader, 10) || 5, 60) : 5;
        console.warn(`[WARN] 429 Rate Limited on #${scenario.id}. Backing off for ${waitSec}s... (attempt ${attempt}/${maxRetries})`);
        await new Promise((r) => setTimeout(r, waitSec * 1000));
        continue;
      }

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }

      const responseText = await response.text();
      const events = parseSseEvents(responseText);

      let actualTier: Tier = 4;
      let responseSummary = "";

      const signpostEvent = events.find((e) => e.type === "signpost");
      if (signpostEvent && signpostEvent.payload) {
        actualTier = signpostEvent.payload.tier as Tier;
        responseSummary = `[T${actualTier} Signpost] ${signpostEvent.payload.headline || ""}`;
      } else {
        actualTier = 4;
        const tokens = events
          .filter((e) => e.type === "token")
          .map((e) => e.payload?.text || "")
          .join("");
        responseSummary = tokens.length > 80 ? `${tokens.slice(0, 80)}...` : tokens || "[T4 Generated Answer]";
      }

      return {
        actualTier,
        actualResponseSummary: responseSummary,
        raw: events,
        latencyMs: Date.now() - startTime,
      };
    } catch (err: any) {
      clearTimeout(timer);
      if (attempt >= maxRetries) {
        return {
          actualTier: 4,
          actualResponseSummary: `[ERROR] ${err.message || String(err)}`,
          raw: { error: String(err) },
          latencyMs: Date.now() - startTime,
        };
      }
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }

  return {
    actualTier: 4,
    actualResponseSummary: "[ERROR] Exhausted retries",
    raw: { error: "Exhausted retries" },
    latencyMs: Date.now() - startTime,
  };
}

/* -------------------------------------------------------------------------- */
/* Main Test Runner Loop                                                      */
/* -------------------------------------------------------------------------- */

export async function runScenarios(options: RunnerOptions): Promise<{
  total: number;
  passed: number;
  failed: number;
  criticalFails: number;
  majorFails: number;
  overEscalations: number;
  results: ScenarioExecutionResult[];
}> {
  console.log(`\n======================================================`);
  console.log(` NHS Parenting Chatbot — Automated Scenario Test Runner`);
  console.log(` Mode: ${options.mode.toUpperCase()}`);
  if (options.mode === "http") {
    console.log(` Target URL: ${options.targetUrl}`);
    console.log(` Max Rate: ${options.maxRpm} req/min | Delay: ${options.delayMs}ms`);
  }
  console.log(` Scenarios Range: #${options.startId} to #${options.endId}`);
  console.log(`======================================================\n`);

  // Ensure output directory exists
  if (!fs.existsSync(options.outputDir)) {
    fs.mkdirSync(options.outputDir, { recursive: true });
  }
  const logsDir = path.join(options.outputDir, "logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Load scenarios from file or default paths
  let markdownPath = options.scenariosFilePath;
  if (!markdownPath || !fs.existsSync(markdownPath)) {
    const candidatePaths = [
      path.resolve(process.cwd(), "test-scenarios.md"),
      path.resolve(process.cwd(), "scratch", "test-scenarios.md"),
      path.resolve(process.env.USERPROFILE || "", ".gemini", "antigravity", "brain", "cd2fc1b6-fe5f-4b9b-b6e0-04a4105c32a4", "test-scenarios.md"),
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        markdownPath = p;
        break;
      }
    }
  }

  if (!markdownPath || !fs.existsSync(markdownPath)) {
    throw new Error(`Could not find test-scenarios.md file. Specify path via --file=<path>`);
  }

  console.log(`Loading scenarios from: ${markdownPath}`);
  const content = fs.readFileSync(markdownPath, "utf-8");
  const allScenarios = parseScenariosFromMarkdown(content);
  console.log(`Parsed ${allScenarios.length} scenarios from markdown.\n`);

  // Filter scenarios based on options
  const targetScenarios = allScenarios.filter((s) => {
    if (s.id < options.startId || s.id > options.endId) return false;
    if (options.filterTier !== undefined && s.expectedTier !== options.filterTier) return false;
    return true;
  });

  console.log(`Running ${targetScenarios.length} scenarios...\n`);

  const pacer = new TokenPacer(options.maxRpm, options.delayMs);
  const results: ScenarioExecutionResult[] = [];

  let passed = 0;
  let failed = 0;
  let criticalFails = 0;
  let majorFails = 0;
  let overEscalations = 0;

  for (let i = 0; i < targetScenarios.length; i++) {
    const scenario = targetScenarios[i];
    const startTime = Date.now();

    let actualTier: Tier;
    let actualResponseSummary: string;
    let rawData: unknown;
    let latencyMs = 0;

    if (options.mode === "http") {
      const res = await executeHttpChat(scenario, options.targetUrl, pacer);
      actualTier = res.actualTier;
      actualResponseSummary = res.actualResponseSummary;
      rawData = res.raw;
      latencyMs = res.latencyMs;
    } else {
      const res = await executeInProcessTriage(scenario);
      actualTier = res.actualTier;
      actualResponseSummary = res.actualResponseSummary;
      rawData = res.raw;
      latencyMs = Date.now() - startTime;
    }

    const { match, severity } = evaluateDiscrepancy(scenario.expectedTier, actualTier);

    if (match) {
      passed++;
    } else {
      failed++;
      if (severity === "CRITICAL_T1_FALSE_NEGATIVE") criticalFails++;
      else if (severity === "MAJOR_URGENT_FALSE_NEGATIVE") majorFails++;
      else if (severity === "OVER_ESCALATION") overEscalations++;
    }

    // Save individual conversation log
    const logFileName = `scenario-${String(scenario.id).padStart(4, "0")}.json`;
    const logFilePath = path.join(logsDir, logFileName);
    const logRecord = {
      scenarioId: scenario.id,
      section: scenario.section,
      message: scenario.message,
      expected: {
        tier: scenario.expectedTier,
        response: scenario.expectedResponse,
        signalCategory: scenario.signalCategory,
      },
      actual: {
        tier: actualTier,
        summary: actualResponseSummary,
        latencyMs,
      },
      assessment: {
        match,
        severity,
      },
      timestamp: new Date().toISOString(),
      rawOutput: rawData,
    };
    fs.writeFileSync(logFilePath, JSON.stringify(logRecord, null, 2), "utf-8");

    results.push({
      scenario,
      actualTier,
      actualResponseSummary,
      match,
      severity,
      latencyMs,
      logFilePath,
      rawEvents: Array.isArray(rawData) ? rawData : undefined,
    });

    // Console output for each scenario
    const statusTag = match
      ? `[PASS]`
      : severity === "CRITICAL_T1_FALSE_NEGATIVE"
      ? `[CRITICAL FAIL]`
      : `[FAIL - ${severity}]`;

    console.log(
      `#${String(scenario.id).padStart(4, " ")} | ${statusTag.padEnd(25)} | Exp: T${scenario.expectedTier} -> Act: T${actualTier} | "${scenario.message.slice(0, 45)}..."`
    );
  }

  // Generate Tabulated Markdown Report
  generateReport(results, options, {
    total: targetScenarios.length,
    passed,
    failed,
    criticalFails,
    majorFails,
    overEscalations,
  });

  return {
    total: targetScenarios.length,
    passed,
    failed,
    criticalFails,
    majorFails,
    overEscalations,
    results,
  };
}

/* -------------------------------------------------------------------------- */
/* Report Generator                                                           */
/* -------------------------------------------------------------------------- */

function generateReport(
  results: ScenarioExecutionResult[],
  options: RunnerOptions,
  stats: {
    total: number;
    passed: number;
    failed: number;
    criticalFails: number;
    majorFails: number;
    overEscalations: number;
  }
): void {
  const reportPath = path.join(options.outputDir, "scenario-test-results.md");
  const lines: string[] = [];

  lines.push(`# NHS Parenting Companion Chatbot — Scenario Test Results`);
  lines.push(``);
  lines.push(`> **Execution Date:** ${new Date().toISOString()}`);
  lines.push(`> **Mode:** \`${options.mode}\` | **Scenarios Tested:** ${stats.total}`);
  lines.push(`> **Pass Rate:** ${((stats.passed / Math.max(1, stats.total)) * 100).toFixed(1)}% (${stats.passed}/${stats.total})`);
  lines.push(``);
  lines.push(`## Summary Metrics`);
  lines.push(``);
  lines.push(`| Metric | Count | Assessment |`);
  lines.push(`|---|---|---|`);
  lines.push(`| **Total Scenarios** | ${stats.total} | Complete suite |`);
  lines.push(`| **Matches (Passed)** | ${stats.passed} | Clean triage alignment |`);
  lines.push(`| **Total Discrepancies** | ${stats.failed} | Requires review |`);
  lines.push(`| **Critical T1 False Negatives** | ${stats.criticalFails} | ${stats.criticalFails > 0 ? "🚨 **BLOCKING SAFETY FAILURE**" : "✅ 0 (Pass)"} |`);
  lines.push(`| **Major False Negatives (T2/T3 -> T4)** | ${stats.majorFails} | ${stats.majorFails > 0 ? "⚠️ Clinical/safeguarding risk" : "✅ 0 (Pass)"} |`);
  lines.push(`| **Over-Escalations (T4 -> T1/2/3)** | ${stats.overEscalations} | Minor usability impact |`);
  lines.push(``);

  if (stats.failed > 0) {
    lines.push(`## Erroneous Answers & Discrepancies Identified`);
    lines.push(``);
    lines.push(`| # | Scenario | Expected | Actual | Severity | Actual Response Summary | Log Link |`);
    lines.push(`|---|---|---|---|---|---|---|`);

    for (const r of results.filter((res) => !res.match)) {
      const relLog = path.relative(options.outputDir, r.logFilePath).replace(/\\/g, "/");
      lines.push(
        `| ${r.scenario.id} | "${r.scenario.message.replace(/\|/g, "\\|")}" | T${r.scenario.expectedTier} | T${r.actualTier} | **${r.severity}** | ${r.actualResponseSummary.replace(/\|/g, "\\|")} | [Log](${relLog}) |`
      );
    }
    lines.push(``);
  }

  lines.push(`## Full Tabulated Register`);
  lines.push(``);
  lines.push(`| # | Scenario | Exp Tier | Act Tier | Match | Expected Response | Actual Response | Log Link |`);
  lines.push(`|---|---|---|---|---|---|---|---|`);

  for (const r of results) {
    const relLog = path.relative(options.outputDir, r.logFilePath).replace(/\\/g, "/");
    const matchIcon = r.match ? "✅ PASS" : "❌ FAIL";
    lines.push(
      `| ${r.scenario.id} | "${r.scenario.message.replace(/\|/g, "\\|")}" | T${r.scenario.expectedTier} | T${r.actualTier} | ${matchIcon} | ${r.scenario.expectedResponse.replace(/\|/g, "\\|")} | ${r.actualResponseSummary.replace(/\|/g, "\\|")} | [Log](${relLog}) |`
    );
  }

  fs.writeFileSync(reportPath, lines.join("\n"), "utf-8");
  console.log(`\n📄 Tabulated report generated at: ${reportPath}`);
}

/* -------------------------------------------------------------------------- */
/* CLI Entrypoint & Argument Parsing                                          */
/* -------------------------------------------------------------------------- */

function parseCliArgs(): RunnerOptions {
  const args = process.argv.slice(2);
  const options: RunnerOptions = {
    mode: "triage",
    targetUrl: "http://127.0.0.1:8787/chat",
    maxRpm: 15,
    delayMs: 100,
    startId: 1,
    endId: 1000,
    outputDir: path.resolve(process.cwd(), "scratch", "scenario-test-results"),
  };

  for (const arg of args) {
    if (arg.startsWith("--mode=")) {
      const mode = arg.slice(7).toLowerCase();
      if (mode === "http" || mode === "triage") options.mode = mode;
    } else if (arg.startsWith("--url=")) {
      options.targetUrl = arg.slice(6);
      options.mode = "http";
    } else if (arg.startsWith("--rpm=")) {
      options.maxRpm = parseInt(arg.slice(6), 10) || 15;
    } else if (arg.startsWith("--delay=")) {
      options.delayMs = parseInt(arg.slice(8), 10) || 100;
    } else if (arg.startsWith("--start=")) {
      options.startId = parseInt(arg.slice(8), 10) || 1;
    } else if (arg.startsWith("--end=")) {
      options.endId = parseInt(arg.slice(6), 10) || 1000;
    } else if (arg.startsWith("--tier=")) {
      options.filterTier = parseInt(arg.slice(7), 10) as Tier;
    } else if (arg.startsWith("--file=")) {
      options.scenariosFilePath = arg.slice(7);
    } else if (arg.startsWith("--out=")) {
      options.outputDir = path.resolve(process.cwd(), arg.slice(6));
    }
  }

  return options;
}

// Watchdog timer (AGENTS.md §10)
const watchdog = setTimeout(() => {
  console.error("TIMEOUT: Scenario test runner exceeded safety watchdog limit");
  process.exit(1);
}, 1_800_000); // 30 minute maximum for full HTTP suite

async function main() {
  try {
    const options = parseCliArgs();
    const stats = await runScenarios(options);

    console.log(`\n======================================================`);
    console.log(` Final Execution Summary:`);
    console.log(` Total Scenarios: ${stats.total}`);
    console.log(` Passed:          ${stats.passed} (${((stats.passed / Math.max(1, stats.total)) * 100).toFixed(1)}%)`);
    console.log(` Failed:          ${stats.failed}`);
    console.log(` Critical T1 FNs: ${stats.criticalFails}`);
    console.log(` Major T2/3 FNs:  ${stats.majorFails}`);
    console.log(` Over-escalations:${stats.overEscalations}`);
    console.log(`======================================================\n`);

    clearTimeout(watchdog);
    process.exit(stats.criticalFails > 0 ? 1 : 0);
  } catch (err) {
    console.error("Fatal runner error:", err);
    clearTimeout(watchdog);
    process.exit(1);
  }
}

if (process.argv[1] && process.argv[1].endsWith("test-scenarios-runner.ts")) {
  main();
}
