import * as fs from "node:fs";
import * as path from "node:path";

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

async function testGenerationModel() {
  console.log("=== Testing @cf/meta/llama-3.1-8b-instruct via REST API ===");
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Say hello in five words." }],
      }),
    }
  );

  console.log("Status:", res.status, res.statusText);
  const json: any = await res.json();
  console.log("Response JSON:", JSON.stringify(json, null, 2));

  // Also test streaming response
  console.log("\n=== Testing streaming with stream: true ===");
  const streamRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Say hello in five words." }],
        stream: true,
      }),
    }
  );
  console.log("Stream Status:", streamRes.status, streamRes.statusText);
  console.log("Stream Content-Type:", streamRes.headers.get("content-type"));
  const text = await streamRes.text();
  console.log("Stream First 200 chars:\n", text.slice(0, 200));
}

testGenerationModel().catch((err) => {
  console.error("Test failed with error:", err);
});

