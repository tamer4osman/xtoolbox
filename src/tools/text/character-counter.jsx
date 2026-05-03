export function render(container) {
  container.innerHTML = `
    <div class="char-container">
      <h2>Character Counter</h2>
      <div class="char-input">
        <textarea id="input" placeholder="Enter text to count characters..."></textarea>
      </div>
      <div class="char-stats">
        <div class="char-stat">
          <span class="stat-num" id="total">0</span>
          <span class="stat-label">Total Characters</span>
        </div>
        <div class="char-stat">
          <span class="stat-num" id="letters">0</span>
          <span class="stat-label">Letters</span>
        </div>
        <div class="char-stat">
          <span class="stat-num" id="numbers">0</span>
          <span class="stat-label">Numbers</span>
        </div>
        <div class="char-stat">
          <span class="stat-num" id="spaces">0</span>
          <span class="stat-label">Spaces</span>
        </div>
        <div class="char-stat">
          <span class="stat-num" id="special">0</span>
          <span class="stat-label">Special</span>
        </div>
        <div class="char-stat">
          <span class="stat-num" id="lines">0</span>
          <span class="stat-label">Lines</span>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .char-container { max-width: 700px; margin: 0 auto; }
    .char-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .char-input { margin-bottom: var(--space-6); }
    .char-input textarea { width: 100%; height: 150px; padding: var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius-xl); background: var(--color-surface); resize: vertical; font-family: monospace; }
    .char-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); }
    .char-stat { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); text-align: center; }
    .stat-num { display: block; font-size: 2rem; font-weight: 700; color: var(--color-primary); }
    .stat-label { font-size: var(--text-xs); color: var(--color-text-secondary); }
    @media (max-width: 500px) { .char-stats { grid-template-columns: repeat(2, 1fr); } }
  `;
  container.appendChild(style);

  function count() {
    const text = container.querySelector('#input').value;
    container.querySelector('#total').textContent = text.length;
    container.querySelector('#letters').textContent = (text.match(/[a-zA-Z]/g) || []).length;
    container.querySelector('#numbers').textContent = (text.match(/[0-9]/g) || []).length;
    container.querySelector('#spaces').textContent = (text.match(/ /g) || []).length;
    container.querySelector('#special').textContent = (text.match(/[^a-zA-Z0-9 \\n]/g) || []).length;
    container.querySelector('#lines').textContent = text ? text.split('\\n').length : 0;
  }

  container.querySelector('#input').addEventListener('input', count);
}
