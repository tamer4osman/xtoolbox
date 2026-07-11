export const toolConfig = {
  id: "text-summarizer",
  name: "Text Summarizer",
  category: "text",
  description: "Summarize long text using extractive method.",
  icon: "📝",
  steps: ["Paste or enter text", "Select summary length", "Click Summarize"]
};

export function render(container) {
  container.innerHTML = `
    <div class="summarizer-container">
      <div class="summarizer-input">
        <textarea id="input" placeholder="Paste your long text here to summarize...">Artificial intelligence (AI) is intelligence demonstrated by machines, in contrast to the natural intelligence displayed by humans and other animals. In computer science AI research defines as the study of "intelligent agents": any device that perceives its environment and takes actions that maximize its chance of successfully achieving its goals. Colloquially, the term "artificial intelligence" is used to describe computers that mimic "cognitive" functions that humans associate with the human mind, such as "learning" and "problem solving".</textarea>
      </div>
      <div class="summarizer-options">
        <div class="option-group">
          <label>Summary Length</label>
          <select id="length">
            <option value="short">Short (30%)</option>
            <option value="medium" selected>Medium (50%)</option>
            <option value="long">Long (70%)</option>
          </select>
        </div>
      </div>
      <button id="summarize-btn" class="summarize-btn">Summarize Text</button>
      <div id="result" class="summarizer-result">
        <div class="result-header">
          <span>Summary</span>
          <span id="stats"></span>
        </div>
        <div id="summary"></div>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .summarizer-container { max-width: 800px; margin: 0 auto; }
    .summarizer-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .summarizer-input { margin-bottom: var(--space-4); }
    .summarizer-input textarea { width: 100%; height: 200px; padding: var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius-xl); font-size: var(--text-base); background: var(--color-surface); resize: vertical; }
    .summarizer-options { display: flex; gap: var(--space-4); margin-bottom: var(--space-4); }
    .option-group { flex: 1; }
    .option-group label { display: block; font-weight: 500; margin-bottom: var(--space-2); font-size: var(--text-sm); }
    .option-group select { width: 100%; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); }
    .summarize-btn { width: 100%; padding: var(--space-3) var(--space-6); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; margin-bottom: var(--space-4); font-size: 16px; }
    .summarize-btn:hover { opacity: 0.9; }
    .summarizer-result { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-4); display: none; }
    .summarizer-result.show { display: block; }
    .result-header { display: flex; justify-content: space-between; margin-bottom: var(--space-3); font-size: var(--text-sm); color: var(--color-text-secondary); }
    #summary { line-height: 1.8; }
  `;
  container.appendChild(style);

  function summarize() {
    const text = container.querySelector("#input").value;
    const length = container.querySelector("#length").value;

    if (!text.trim()) {
      container.querySelector("#summary").textContent = "Please enter some text to summarize.";
      container.querySelector("#result").classList.add("show");
      return;
    }

    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const wordFreq = {};
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const stopWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
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
      "to",
      "of",
      "in",
      "for",
      "on",
      "with",
      "at",
      "by",
      "from",
      "as",
      "into",
      "through",
      "during",
      "before",
      "after",
      "above",
      "below",
      "between",
      "under",
      "again",
      "further",
      "then",
      "once",
      "here",
      "there",
      "when",
      "where",
      "why",
      "how",
      "all",
      "each",
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

    words.forEach(w => {
      if (!stopWords.has(w) && w.length > 2) wordFreq[w] = (wordFreq[w] || 0) + 1;
    });

    const scored = sentences.map((s, i) => {
      const sWords = s.toLowerCase().match(/\b\w+\b/g) || [];
      let score = sWords.reduce((sum, w) => sum + (wordFreq[w] || 0), 0);
      if (i === 0) score *= 1.5;
      if (sWords.length < 5) score *= 0.5;
      if (sWords.length > 30) score *= 0.8;
      return { sentence: s.trim(), score };
    });

    scored.sort((a, b) => b.score - a.score);

    let keep;
    switch (length) {
      case "short":
        keep = Math.ceil(sentences.length * 0.3);
        break;
      case "long":
        keep = Math.ceil(sentences.length * 0.7);
        break;
      default:
        keep = Math.ceil(sentences.length * 0.5);
    }

    const summary = scored
      .slice(0, keep)
      .sort((a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence))
      .map(s => s.sentence)
      .join(" ");

    container.querySelector("#stats").textContent = `${summary.split(" ").length} words`;
    container.querySelector("#summary").textContent = summary;
    container.querySelector("#result").classList.add("show");
  }

  const btn = container.querySelector("#summarize-btn");
  btn.addEventListener("click", () => {
    console.log("Button clicked!");
    summarize();
  });
  return container;
}
