export const toolConfig = {
  id: "readability-score",
  name: "Readability Score",
  category: "text",
  description: "Check text readability with Flesch-Kincaid grade level and reading ease.",
  icon: "📊",
  status: "done"
};

export function render(container) {
  container.innerHTML = `
    <div class="readability-container">
      <div class="readability-input">
        <textarea id="text-input" placeholder="Paste your text here to analyze readability...">The quick brown fox jumps over the lazy dog. This is a sample sentence for testing readability. Reading should be easy and enjoyable for everyone.</textarea>
      </div>
      <button id="analyze-btn" class="analyze-btn">Analyze</button>
      <div id="result" class="readability-result">
        <div class="score-card main">
          <div class="score-label">Reading Level</div>
          <div class="score-value" id="level">Grade 5</div>
          <div class="score-desc" id="desc">Easy to read</div>
        </div>
        <div class="score-grid">
          <div class="score-item">
            <div class="score-num" id="flesch">86.4</div>
            <div class="score-name">Flesch Reading Ease</div>
          </div>
          <div class="score-item">
            <div class="score-num" id="coleman">4.2</div>
            <div class="score-name">Coleman-Liau</div>
          </div>
          <div class="score-item">
            <div class="score-num" id="auto">4.8</div>
            <div class="score-name">Automated RI</div>
          </div>
          <div class="score-item">
            <div class="score-num" id="gunning">7.2</div>
            <div class="score-name">Gunning Fog</div>
          </div>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .readability-container { max-width: 700px; margin: 0 auto; }
    .readability-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .readability-input { margin-bottom: var(--space-4); }
    .readability-input textarea { width: 100%; height: 150px; padding: var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius-xl); font-size: var(--text-base); background: var(--color-surface); resize: vertical; }
    .analyze-btn { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; margin-bottom: var(--space-6); }
    .readability-result { display: none; }
    .readability-result.show { display: block; }
    .score-card.main { background: linear-gradient(135deg, var(--color-primary), #7c3aed); color: white; padding: var(--space-6); border-radius: var(--radius-xl); text-align: center; margin-bottom: var(--space-4); }
    .score-label { font-size: var(--text-sm); opacity: 0.9; }
    .score-value { font-size: 2.5rem; font-weight: 700; }
    .score-desc { font-size: var(--text-sm); opacity: 0.9; }
    .score-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-3); }
    .score-item { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-lg); text-align: center; }
    .score-num { font-size: 1.5rem; font-weight: 700; color: var(--color-primary); }
    .score-name { font-size: var(--text-xs); color: var(--color-text-secondary); }
  `;
  container.appendChild(style);

  function countSyllables(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, "");
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]+es|ed|[^laeiouy]e)$/, "");
    word = word.replace(/^y/, "");
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  function analyze() {
    const text = container.querySelector("#text-input").value;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length || 1;
    const words = text.split(/\\s+/).filter(w => w.match(/[a-zA-Z]/)).length || 1;
    const syllables = text.split(/\\s+/).reduce((sum, w) => sum + countSyllables(w), 0);
    const characters = text.replace(/\\s/g, "").length;

    const flesch = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
    const coleman =
      0.0588 * ((characters / words) * 100) - 0.296 * ((sentences / words) * 100) - 15.8;
    const autoRI = 4.71 * (characters / words) + 0.5 * (words / sentences) - 21.43;
    const gunning =
      0.4 *
      (words / sentences +
        100 * (text.split(/[a-zA-Z]+/).filter(w => w.length > 6).length / words));

    let level, desc, color;
    if (flesch >= 90) {
      level = "Grade 5";
      desc = "Very Easy";
      color = "#10b981";
    } else if (flesch >= 80) {
      level = "Grade 6";
      desc = "Easy";
      color = "#10b981";
    } else if (flesch >= 70) {
      level = "Grade 7";
      desc = "Fairly Easy";
      color = "#3b82f6";
    } else if (flesch >= 60) {
      level = "Grade 8-9";
      desc = "Standard";
      color = "#f59e0b";
    } else if (flesch >= 50) {
      level = "Grade 10-12";
      desc = "Fairly Difficult";
      color = "#f97316";
    } else if (flesch >= 30) {
      level = "College";
      desc = "Difficult";
      color = "#ef4444";
    } else {
      level = "Graduate";
      desc = "Very Difficult";
      color = "#dc2626";
    }

    container.querySelector("#level").textContent = level;
    container.querySelector("#level").style.color = color;
    container.querySelector("#desc").textContent = desc;
    container.querySelector("#flesch").textContent = flesch.toFixed(1);
    container.querySelector("#coleman").textContent = coleman.toFixed(1);
    container.querySelector("#auto").textContent = autoRI.toFixed(1);
    container.querySelector("#gunning").textContent = gunning.toFixed(1);
    container.querySelector("#result").classList.add("show");
  }

  container.querySelector("#analyze-btn").addEventListener("click", analyze);
  analyze();
  return container;
}
