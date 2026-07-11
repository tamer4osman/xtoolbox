export const toolConfig = {
  id: "text-similarity",
  name: "Text Similarity",
  category: "text",
  description: "Compare text similarity.",
  icon: "🔗",
  status: "done"
};

export function render(container) {
  container.innerHTML = `
    <div class="plag-container">
      <h2>Text Similarity Checker</h2>
      <div class="plag-panels">
        <textarea id="text1" placeholder="Paste first text...">The quick brown fox jumps over the lazy dog.</textarea>
        <textarea id="text2" placeholder="Paste second text...">A quick brown fox jumped over a lazy dog in the park.</textarea>
      </div>
      <button id="check-btn" class="check-btn">Compare Texts</button>
      <div id="result" class="plag-result">
        <div class="similarity-score">
          <div class="score-circle" id="score-circle">
            <span id="score">0%</span>
          </div>
          <div class="score-label">Similarity</div>
        </div>
        <div class="diff-stats">
          <div class="diff-item">
            <span>Matching Words</span>
            <span id="matching">0</span>
          </div>
          <div class="diff-item">
            <span>Unique to Text 1</span>
            <span id="unique1">0</span>
          </div>
          <div class="diff-item">
            <span>Unique to Text 2</span>
            <span id="unique2">0</span>
          </div>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .plag-container { max-width: 700px; margin: 0 auto; }
    .plag-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .plag-panels { display: flex; flex-direction: column; gap: var(--space-3); margin-bottom: var(--space-4); }
    .plag-panels textarea { width: 100%; height: 100px; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-surface); resize: vertical; }
    .check-btn { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; margin-bottom: var(--space-4); }
    .plag-result { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-6); display: none; }
    .plag-result.show { display: block; }
    .similarity-score { text-align: center; margin-bottom: var(--space-6); }
    .score-circle { width: 120px; height: 120px; border-radius: 50%; background: conic-gradient(var(--color-primary) 0%, var(--color-bg) 0); display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-3); }
    .score-circle span { font-size: 2rem; font-weight: 700; }
    .score-label { font-size: var(--text-sm); color: var(--color-text-secondary); }
    .diff-stats { display: flex; flex-direction: column; gap: var(--space-2); }
    .diff-item { display: flex; justify-content: space-between; padding: var(--space-2) var(--space-3); background: var(--color-bg); border-radius: var(--radius-md); font-size: var(--text-sm); }
  `;
  container.appendChild(style);

  container.querySelector("#check-btn").addEventListener("click", () => {
    const t1 = container
      .querySelector("#text1")
      .value.toLowerCase()
      .split(/\\s+/)
      .filter(w => w);
    const t2 = container
      .querySelector("#text2")
      .value.toLowerCase()
      .split(/\\s+/)
      .filter(w => w);
    const set1 = new Set(t1),
      set2 = new Set(t2);
    const intersection = [...set1].filter(x => set2.has(x));
    const jaccard =
      set1.size + set2.size - intersection.length > 0
        ? (intersection.length / (set1.size + set2.size - intersection.length)) * 100
        : 0;

    container.querySelector("#score").textContent = Math.round(jaccard) + "%";
    container.querySelector("#score-circle").style.background =
      "conic-gradient(" +
      (jaccard > 50 ? "#10b981" : jaccard > 25 ? "#f59e0b" : "#ef4444") +
      " " +
      jaccard +
      "%, var(--color-bg) 0)";
    container.querySelector("#matching").textContent = intersection.length;
    container.querySelector("#unique1").textContent = set1.size - intersection.length;
    container.querySelector("#unique2").textContent = set2.size - intersection.length;
    container.querySelector(".plag-result").classList.add("show");
  });

  return container;
}
