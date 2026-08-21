const watchdog = setTimeout(() => {
  console.error("TIMEOUT after 90s");
  process.exit(1);
}, 90_000);

async function main() {
  const question = "How do I safely make up a bottle of powdered baby formula?";

  for (let run = 1; run <= 3; run++) {
    const controller = new AbortController();
    const fetchTimer = setTimeout(() => controller.abort(), 30_000);
    try {
      const res = await fetch("https://nhs-parenting-bot.sufiankane.workers.dev/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
        signal: controller.signal,
      });
      const text = await res.text();
      const tokens: string[] = [];
      let sources: string[] = [];
      for (const line of text.split(/\r?\n/)) {
        if (!line.startsWith("data:")) continue;
        try {
          const data = JSON.parse(line.slice(5).trim());
          if (data.type === "token") tokens.push(data.payload.text);
          if (data.type === "done") sources = data.payload.sources ?? [];
        } catch {}
      }
      const answer = tokens.join("");
      console.log(`\n================== SAMPLE RUN ${run}/3 ==================`);
      console.log("=== QUESTION ===\n" + question);
      console.log("=== VERBATIM RESPONSE ===\n" + answer);
      console.log("=== SOURCES ===\n" + JSON.stringify(sources, null, 2));
      console.log("Has '2 hours':", answer.includes("2 hours"));
      console.log("Has '24 hours':", answer.includes("24 hours"));
    } finally {
      clearTimeout(fetchTimer);
    }
  }

  clearTimeout(watchdog);
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  clearTimeout(watchdog);
  process.exit(1);
});
