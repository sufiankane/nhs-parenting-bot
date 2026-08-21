import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";

// 1. Read credentials from .env without printing or hardcoding secrets
const envPath = path.resolve(".env");
const envContent = fs.readFileSync(envPath, "utf-8");
const env: Record<string, string> = {};
for (const line of envContent.split(/\r?\n/)) {
  const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    env[match[1]] = val;
  }
}

const apiToken = env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
const accountId = env.CLOUDFLARE_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;

if (!apiToken || !accountId) {
  throw new Error("Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID in environment.");
}

async function runDiagnosis() {
  const query = "How do I safely make up a bottle of powdered baby formula?";
  console.log("=== STEP 1: Generate query embedding via Workers AI REST API ===");
  console.log(`Query: "${query}"`);

  // Shape 1: { text: [query] } - exactly as used in ingestion
  const resArray = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/baai/bge-base-en-v1.5`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: [query] }),
    }
  );

  const jsonArray: any = await resArray.json();
  console.log("REST response status (with { text: [query] }):", resArray.status, "success:", jsonArray.success);
  console.log("REST response keys:", Object.keys(jsonArray.result || {}));
  console.log("REST data shape:", Array.isArray(jsonArray.result?.data), "data length:", jsonArray.result?.data?.length);
  const vector: number[] = jsonArray.result?.data?.[0];
  console.log("Extracted vector dimension:", vector?.length, "first 3 elements:", vector?.slice(0, 3));

  // Also test Shape 2: { text: query } (string) as called inside Worker by env.AI.run
  const resString = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/baai/bge-base-en-v1.5`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: query }),
    }
  );
  const jsonString: any = await resString.json();
  console.log("\nREST response status (with { text: query } string):", resString.status, "success:", jsonString.success);
  console.log("REST string data shape:", Array.isArray(jsonString.result?.data), "data length:", jsonString.result?.data?.length);
  const vectorFromString: number[] = jsonString.result?.data?.[0];
  console.log("Extracted vector from string dimension:", vectorFromString?.length, "first 3 elements:", vectorFromString?.slice(0, 3));

  // Compute cosine similarity between vector from { text: [query] } and vector from { text: query }
  if (vector && vectorFromString) {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vector.length; i++) {
      dot += vector[i] * vectorFromString[i];
      normA += vector[i] * vector[i];
      normB += vectorFromString[i] * vectorFromString[i];
    }
    const cosSim = dot / (Math.sqrt(normA) * Math.sqrt(normB));
    console.log("Cosine similarity between {text: [q]} and {text: q}:", cosSim);
  }

  console.log("\n=== STEP 2: Query Vectorize index directly via REST API ===");
  const vectorizeQueryRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/vectorize/v2/indexes/nhs-guidance/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vector,
        topK: 5,
        returnValues: false,
        returnMetadata: "all",
      }),
    }
  );

  const vectorizeJson: any = await vectorizeQueryRes.json();
  console.log("Vectorize query status:", vectorizeQueryRes.status, "success:", vectorizeJson.success);
  const matches = vectorizeJson.result?.matches || [];
  console.log(`Found ${matches.length} matches:`);
  for (const m of matches) {
    console.log(`- ID: ${m.id} | Score: ${m.score} | Title: "${m.metadata?.title || m.metadata?.title}"`);
  }

  console.log("\n=== STEP 3: Check whether match IDs exist in remote D1 ===");
  if (matches.length > 0) {
    const matchIds = matches.map((m: any) => `'${m.id}'`).join(", ");
    const sql = `SELECT id, title, category FROM guidance_chunks WHERE id IN (${matchIds})`;
    console.log(`Executing D1 query: ${sql}`);
    const d1Out = execSync(
      `npx wrangler d1 execute nhs-parenting --remote --command="${sql}" --json`,
      { encoding: "utf-8" }
    );
    try {
      const parsedD1 = JSON.parse(d1Out);
      console.log("D1 matched rows count:", parsedD1[0]?.results?.length);
      console.log("D1 matched rows:", JSON.stringify(parsedD1[0]?.results, null, 2));
    } catch {
      console.log("D1 raw output:", d1Out);
    }
  }

  console.log("\n=== STEP 4: Sample IDs from D1 guidance_chunks vs Vectorize Index ===");
  const sampleSql = "SELECT id, title FROM guidance_chunks LIMIT 3";
  const sampleD1Out = execSync(
    `npx wrangler d1 execute nhs-parenting --remote --command="${sampleSql}" --json`,
    { encoding: "utf-8" }
  );
  try {
    const parsedSampleD1 = JSON.parse(sampleD1Out);
    console.log("Sample D1 rows (first 3):", JSON.stringify(parsedSampleD1[0]?.results, null, 2));
  } catch {
    console.log("Sample D1 raw output:", sampleD1Out);
  }

  const countSql = "SELECT count(*) as total_count FROM guidance_chunks";
  const countD1Out = execSync(
    `npx wrangler d1 execute nhs-parenting --remote --command="${countSql}" --json`,
    { encoding: "utf-8" }
  );
  try {
    const parsedCountD1 = JSON.parse(countD1Out);
    console.log("Total D1 guidance_chunks count:", parsedCountD1[0]?.results?.[0]?.total_count);
  } catch {
    console.log("Count D1 raw output:", countD1Out);
  }

  console.log("\nVectorize index info:");
  const vectorizeInfo = execSync(`npx wrangler vectorize info nhs-guidance`, { encoding: "utf-8" });
  console.log(vectorizeInfo);
}

runDiagnosis().catch((err) => {
  console.error("Diagnosis failed with error:", err);
});

