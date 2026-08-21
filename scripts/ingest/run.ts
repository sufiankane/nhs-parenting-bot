import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";
import { generateSeedingPayload } from "./seed.js";

// Step 1: Run build-seed.ts to validate raw chunks and generate content/nhs_faq_seed.json
console.log("Building FAQ seed from raw chunks...");
execSync("npx tsx scripts/ingest/build-seed.ts", { stdio: "inherit" });

// Step 2: Read sources and seed file to verify
const seedPath = path.resolve("content/nhs_faq_seed.json");
const seedData = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
console.log(`Successfully verified FAQ seed with ${seedData.total_chunks} chunks.`);

// Step 3: Parse .env file for Cloudflare credentials
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
  throw new Error("Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID in env.");
}

// Step 4: Generate SQL statements and run D1 seeding
console.log("Generating D1 SQL statements...");
const seedPayload = generateSeedingPayload();
const sqlFile = path.resolve("content/seed.sql");
fs.writeFileSync(sqlFile, seedPayload.sqlStatements.join("\n"), "utf-8");

console.log("Executing remote D1 seed...");
execSync(`npx wrangler d1 execute nhs-parenting --file="${sqlFile}" --remote`, { stdio: "inherit" });
fs.unlinkSync(sqlFile);

// Step 5: Generate embeddings and upsert into Vectorize
console.log("Generating embeddings and preparing Vectorize ndjson...");
const ndjsonFile = path.resolve("content/vectorize.ndjson");
const ndjsonLines: string[] = [];

// Ingest in batches of 10 to be gentle to API limits
const BATCH_SIZE = 10;
for (let i = 0; i < seedData.chunks.length; i += BATCH_SIZE) {
  const batch = seedData.chunks.slice(i, i + BATCH_SIZE);
  console.log(`Processing embedding batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(seedData.chunks.length / BATCH_SIZE)}...`);
  
  const texts = batch.map((c: any) => c.chunk_text);
  
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/baai/bge-base-en-v1.5`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text: texts })
    }
  );
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudflare AI API error: ${response.status} - ${errorText}`);
  }
  
  const resBody: any = await response.json();
  if (!resBody.success) {
    throw new Error(`Cloudflare AI API returned success=false: ${JSON.stringify(resBody.errors)}`);
  }
  
  const vectors = resBody.result.data;
  if (!vectors || vectors.length !== batch.length) {
    throw new Error(`Embedding counts mismatch: expected ${batch.length}, got ${vectors?.length}`);
  }
  
  for (let k = 0; k < batch.length; k++) {
    const chunk = batch[k];
    const vector = vectors[k];
    
    const record = {
      id: chunk.id,
      values: vector,
      metadata: {
        title: chunk.title,
        source_url: chunk.source_url,
        category: chunk.category
      }
    };
    ndjsonLines.push(JSON.stringify(record));
  }
}

fs.writeFileSync(ndjsonFile, ndjsonLines.join("\n") + "\n", "utf-8");

console.log("Inserting vectors into remote Vectorize index 'nhs-guidance'...");
execSync(`npx wrangler vectorize insert nhs-guidance --file="${ndjsonFile}"`, { stdio: "inherit" });
fs.unlinkSync(ndjsonFile);

console.log("=== NHS Knowledge Base Ingestion Complete ===");
console.log(`Successfully ingested ${seedData.total_chunks} chunks.`);
console.log("D1 seeding complete.");
console.log("Vectorize indexing complete.");

