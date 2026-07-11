import { createBasicTool } from "../shared/basic-tool-factory.js";

const stopWords = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "shall",
  "can",
  "need",
  "dare",
  "ought",
  "used",
  "it",
  "its",
  "this",
  "that",
  "these",
  "those",
  "i",
  "you",
  "he",
  "she",
  "we",
  "they",
  "what",
  "which",
  "who",
  "whom",
  "whose",
  "where",
  "when",
  "why",
  "how",
  "all",
  "each",
  "every",
  "both",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "just",
  "also"
]);

const { toolConfig, render } = createBasicTool({
  toolConfig: {
    id: "word-frequency",
    name: "Word Frequency",
    category: "text",
    description: "Analyze word frequency in text.",
    icon: "📈",
    accept: null,
    maxSizeMB: null,
    keywords: ["word frequency", "word count", "text analysis", "word stats"],
    steps: ["Enter text", "See word frequencies"]
  },
  inputHTML: `
    <textarea id="input" placeholder="Enter text to analyze..."></textarea>
    <div class="freq-options">
      <label>Top words: <input type="number" id="top-n" value="20" min="5" max="100"></label>
      <label><input type="checkbox" id="ignore-case" checked> Ignore case</label>
      <label><input type="checkbox" id="ignore-stop"> Ignore stop words</label>
    </div>
    <button id="analyze-btn" class="btn btn-primary">Analyze</button>
  `,
  outputHTML: `<div id="results" class="freq-results"></div>`,
  extraCSS: `
    .tool-container textarea { min-height: 150px; }
    .freq-options { display: flex; gap: var(--space-4); align-items: center; margin-bottom: var(--space-3); flex-wrap: wrap; }
    .freq-options label { display: flex; align-items: center; gap: var(--space-2); }
    .freq-options input[type="number"] { width: 60px; }
    .freq-results { margin-top: var(--space-4); }
    .freq-bar { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-2); }
    .freq-word { min-width: 150px; font-weight: 500; }
    .freq-count { min-width: 60px; text-align: right; color: var(--color-muted); }
    .freq-bar-inner { flex: 1; height: 24px; background: var(--color-primary); opacity: 0.7; border-radius: var(--radius-sm); min-width: 10px; }
  `,
  init(container) {
    const input = container.querySelector("#input");
    const topNInput = container.querySelector("#top-n");
    const ignoreCase = container.querySelector("#ignore-case");
    const ignoreStop = container.querySelector("#ignore-stop");
    const analyzeBtn = container.querySelector("#analyze-btn");
    const results = container.querySelector("#results");

    function analyze() {
      let text = input.value;
      if (!text.trim()) {
        results.innerHTML = "<p>Enter some text to analyze</p>";
        return;
      }

      let words = text.match(/[a-zA-Z]+/g) || [];

      if (ignoreCase.checked) {
        words = words.map(w => w.toLowerCase());
      }

      if (ignoreStop.checked) {
        words = words.filter(w => !stopWords.has(w.toLowerCase()));
      }

      const freq = {};
      words.forEach(w => (freq[w] = (freq[w] || 0) + 1));

      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
      const top = sorted.slice(0, parseInt(topNInput.value) || 20);
      const maxCount = top[0]?.[1] || 1;

      results.innerHTML = top
        .map(
          ([word, count]) => `
        <div class="freq-bar">
          <span class="freq-word">${word}</span>
          <div class="freq-bar-inner" style="width: ${(count / maxCount) * 100}%"></div>
          <span class="freq-count">${count}</span>
        </div>
      `
        )
        .join("");
    }

    analyzeBtn.addEventListener("click", analyze);
    input.addEventListener("input", analyze);
  }
});

export { toolConfig, render };
