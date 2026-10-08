import { processIngestJob } from "../src/ingest/pipeline";
import { performance } from "perf_hooks";

const MOCK_DIMENSIONS = 768;

async function runBenchmark() {
  const job = {
    batch_id: "perf-bench",
    source_id: "perf-test",
    source_url: "https://www.nhs.uk/perf",
    title: "Performance Test",
    category: "general",
    raw_content: Array.from({ length: 50 }, (_, i) => `Paragraph ${i}. This is a very long paragraph that should hopefully be split into its own chunk. We need multiple chunks to see the performance difference of sequential vs batched AI embedding calls. Paragraph ${i} has some more text to ensure it reaches a reasonable length. `).join("\n\n"),
    safety_relevant: false,
  };

  let numCalls = 0;

  const aiRun = async (model: string, input: { text: string[] }) => {
    numCalls++;
    await new Promise(r => setTimeout(r, 50));
    return {
      data: input.text.map(() => Array(MOCK_DIMENSIONS).fill(0.1))
    };
  };

  const vectorUpsert = async () => {};

  const db = {
    prepare: (sql: string) => ({
      bind: (...args: any[]) => ({
        all: async () => ({ results: [] }),
        run: async () => ({ success: true })
      })
    })
  };

  const env = {
    AI: { run: aiRun },
    VECTOR_INDEX: { upsert: vectorUpsert },
    DB: db,
  };

  console.log("Running baseline benchmark...");
  const start = performance.now();
  const res = await processIngestJob(env, job as any);
  const end = performance.now();

  console.log(`Chunks created: ${res.chunks_created}`);
  console.log(`AI Calls made: ${numCalls}`);
  console.log(`Time taken: ${(end - start).toFixed(2)} ms`);
}

runBenchmark().catch(console.error);
