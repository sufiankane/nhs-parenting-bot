async function getSampleAnswers() {
  const targetUrl = "https://nhs-parenting-bot.sufiankane.workers.dev/chat";
  const questions = [
    "How do I safely make up a bottle of powdered baby formula?",
    "What is the safest room temperature for my baby to sleep in?",
    "How should I care for my newborn's umbilical cord stump?"
  ];

  for (const q of questions) {
    console.log(`\n======================================================`);
    console.log(`QUESTION: ${q}`);
    console.log(`======================================================`);
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: q })
    });

    const raw = await res.text();
    const lines = raw.split(/\r?\n/);
    let fullText = "";
    let doneEvent: any = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("data:")) {
        try {
          const ev = JSON.parse(trimmed.slice(5).trim());
          if (ev.type === "token" && ev.payload?.text) {
            fullText += ev.payload.text;
          } else if (ev.type === "done") {
            doneEvent = ev;
          }
        } catch {}
      }
    }

    console.log(`RESPONSE TEXT:\n${fullText.trim()}`);
    console.log(`\nSOURCES:`, JSON.stringify(doneEvent?.payload?.sources || []));
    console.log(`SESSION ID:`, doneEvent?.payload?.session_id);
  }
}

getSampleAnswers().catch(console.error);

