export const toolConfig = {
  id: "slug-generator",
  name: "URL Slug Generator",
  category: "seo",
  description: "Convert titles into search-friendly URL slugs.",
  icon: "🔗",
  status: "done"
};

export function render(container) {
  container.innerHTML = `
    <div class="slug-container">
      <h2>URL Slug Generator</h2>
      <input type="text" id="input" placeholder="Enter title or text" value="How to Optimize Your Website for Search Engines">
      <div class="options">
        <label><input type="checkbox" id="lowercase" checked> Lowercase</label>
        <label><input type="checkbox" id="hyphens" checked> Use hyphens</label>
        <label><input type="checkbox" id="stops" checked> Remove stop words</label>
      </div>
      <div class="output">
        <code id="slug"></code>
        <button id="copyBtn">Copy</button>
      </div>
      <div class="history" id="history"></div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .slug-container { max-width: 600px; margin: 0 auto; }
    .slug-container h2 { text-align: center; margin-bottom: var(--space-4); }
    #input { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-lg); margin-bottom: var(--space-3); }
    .options { display: flex; gap: var(--space-4); margin-bottom: var(--space-4); }
    .options label { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; font-size: var(--text-sm); }
    .output { display: flex; gap: var(--space-2); background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-xl); }
    #slug { flex: 1; font-family: monospace; font-size: var(--text-lg); }
    #copyBtn { padding: var(--space-2) var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; }
    .history { margin-top: var(--space-4); }
    .history-item { padding: var(--space-2); background: var(--color-surface); border-radius: var(--radius-md); margin-bottom: var(--space-2); font-size: var(--text-sm); cursor: pointer; }
    .history-item:hover { background: var(--color-bg); }
  `;
  container.appendChild(style);

  const stops = [
    "a",
    "an",
    "the",
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
    "can",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "my",
    "your",
    "his",
    "her",
    "its",
    "our",
    "their"
  ];

  function generate() {
    let text = container.querySelector("#input").value;
    if (container.querySelector("#stops").checked) {
      stops.forEach(s => {
        text = text.replace(new RegExp("\\\\b" + s + "\\\\b", "gi"), "");
      });
    }
    text = text.replace(/[^a-zA-Z0-9\\s]/g, "");
    text = text.trim();
    if (container.querySelector("#hyphens").checked) text = text.replace(/\\s+/g, "-");
    else text = text.replace(/\\s+/g, "_");
    if (container.querySelector("#lowercase").checked) text = text.toLowerCase();
    container.querySelector("#slug").textContent = text;
  }

  container.querySelectorAll("input").forEach(i => i.addEventListener("input", generate));
  container.querySelector("#copyBtn").addEventListener("click", () => {
    navigator.clipboard.writeText(container.querySelector("#slug").textContent);
    container.querySelector("#copyBtn").textContent = "Copied!";
    setTimeout(() => (container.querySelector("#copyBtn").textContent = "Copy"), 1500);
  });
  generate();
}
