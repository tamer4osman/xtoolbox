export function render() {
  return `
    <div class="tool-container">
      <header class="tool-header">
        <h1>🔢 Character & Word Counter</h1>
        <p class="tool-description">Count characters, words, lines, and more in your text</p>
      </header>

      <div class="tool-content">
        <div class="input-group">
          <label>Enter your text</label>
          <textarea id="input" placeholder="Type or paste text here..." rows="8"></textarea>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value" id="chars">0</div>
            <div class="stat-label">Characters</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="words">0</div>
            <div class="stat-label">Words</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="lines">0</div>
            <div class="stat-label">Lines</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="charsNoSpaces">0</div>
            <div class="stat-label">Chars (no spaces)</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="paragraphs">0</div>
            <div class="stat-label">Paragraphs</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="readingTime">0</div>
            <div class="stat-label">Reading time (min)</div>
          </div>
        </div>
      </div>

      <style>
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        .stat-card {
          background: var(--bg-secondary);
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
        }
        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--primary);
        }
        .stat-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
      </style>
    </div>
  `;
}

export function init() {
  const input = document.getElementById('input');
  const chars = document.getElementById('chars');
  const words = document.getElementById('words');
  const lines = document.getElementById('lines');
  const charsNoSpaces = document.getElementById('charsNoSpaces');
  const paragraphs = document.getElementById('paragraphs');
  const readingTime = document.getElementById('readingTime');

  const count = () => {
    const text = input.value;
    chars.textContent = text.length;
    charsNoSpaces.textContent = text.replace(/\\s/g, '').length;
    words.textContent = text.trim() ? text.trim().split(/\\s+/).length : 0;
    lines.textContent = text.split('\\n').length;
    paragraphs.textContent = text.split(/\\n\\s*\\n/).filter(p => p.trim()).length || (text.trim() ? 1 : 0);
    readingTime.textContent = Math.ceil(text.split(/\\s+/).filter(w => w).length / 200);
  };

  input.addEventListener('input', count);
}