import { showToast } from "../../components/toast.js";

export const toolConfig = {
  id: "legal-clause-simplifier",
  name: "Legal Clause Simplifier",
  category: "text",
  description: "Simplify legal text into plain English using DistilBART summarization.",
  icon: "⚖️",
  accept: ".txt",
  maxSizeMB: 1,
  keywords: ["legal", "simplify", "clause", "text", "summarize", "plain english"],
  steps: ["Paste legal text", "Click Simplify", "Read plain English version"],
  faqs: [
    {
      question: "Is this legal advice?",
      answer:
        "No. This tool helps simplify language but does not provide legal interpretation or advice.",
    },
    {
      question: "What types of legal text work best?",
      answer: "Contract clauses, terms of service, privacy policies, and legal notices work best.",
    },
  ],
};

export function estimateReadingTime(text) {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function simplifyLegalText(text) {
  const simplifications = {
    hereinafter: "from now on",
    herein: "in this document",
    thereof: "of that",
    therein: "in that",
    whereas: "since",
    notwithstanding: "despite",
    aforementioned: "mentioned above",
    heretofore: "until now",
    "pursuant to": "according to",
    "in lieu of": "instead of",
    "ipso facto": "by that fact",
    "force majeure": "unforeseeable circumstances",
    indemnify: "protect from loss",
    liability: "legal responsibility",
    arbitration: "dispute resolution outside court",
    jurisdiction: "authority to judge",
    severability: "validity if part is invalid",
    waiver: "giving up a right",
  };

  let simplified = text;
  for (const [legal, plain] of Object.entries(simplifications)) {
    simplified = simplified.replace(new RegExp(legal, "gi"), plain);
  }

  const sentences = simplified.split(/(?<=[.!?])\s+/);
  const shortSentences = sentences.map((s) => {
    if (s.length > 80) {
      const parts = s.split(/,\s*/);
      return parts.join(",\n");
    }
    return s;
  });

  return shortSentences.join(" ");
}

export function render(container) {
  container.innerHTML = `
    <div class="tool-layout">
      <div class="form-group">
        <label for="legal-text">Legal Text</label>
        <textarea id="legal-text" class="text-input" rows="10" placeholder="Paste legal text here (contract clauses, terms of service, etc.)..."></textarea>
      </div>
      <button class="btn btn-primary btn-lg" id="simplify-btn" style="width:100%;">Simplify</button>
      <div class="form-group" style="margin-top:var(--space-3);">
        <label for="plain-text">Plain English Version</label>
        <textarea id="plain-text" class="text-input" rows="10" readonly placeholder="Simplified text will appear here..."></textarea>
        <div id="reading-time" style="font-size:var(--text-sm);color:var(--color-text-muted);margin-top:var(--space-1);"></div>
      </div>
    </div>
  `;

  const legalText = container.querySelector("#legal-text");
  const plainText = container.querySelector("#plain-text");
  const simplifyBtn = container.querySelector("#simplify-btn");
  const readingTime = container.querySelector("#reading-time");

  simplifyBtn.addEventListener("click", async () => {
    const text = legalText.value.trim();
    if (!text) {
      showToast({ message: "Enter legal text to simplify.", type: "error" });
      return;
    }

    simplifyBtn.disabled = true;
    simplifyBtn.textContent = "Loading model...";

    try {
      const { pipeline } =
        await import("https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.js");
      simplifyBtn.textContent = "Simplifying...";

      const summarizer = await pipeline("summarization", "Xenova/distilbart-cnn-6-6");
      const result = await summarizer(text, { max_length: 200, min_length: 30 });
      const summary = result[0]?.summary_text || text;

      const simplified = simplifyLegalText(summary);
      plainText.value = simplified;

      const origTime = estimateReadingTime(text);
      const simpTime = estimateReadingTime(simplified);
      readingTime.textContent = `Original: ${origTime} min read → Simplified: ${simpTime} min read`;

      showToast({ message: "Text simplified successfully.", type: "success" });
    } catch {
      plainText.value = simplifyLegalText(text);
      readingTime.textContent = "Rule-based simplification applied (model unavailable).";
      showToast({ message: "Using rule-based simplification.", type: "warning" });
    } finally {
      simplifyBtn.disabled = false;
      simplifyBtn.textContent = "Simplify";
    }
  });
}

export function destroy() {}
