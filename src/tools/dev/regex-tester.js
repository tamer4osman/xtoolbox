export const toolConfig = {
  id: 'regex-tester',
  name: 'Regex Tester',
  category: 'dev',
  description: 'Test regular expressions with live matching and capture groups.',
  icon: '🔍',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="regex-container">
      <h2>Regex Tester</h2>
      <div class="input-group">
        <input type="text" id="pattern" placeholder="Regular expression" value="\\b\\w+\\b">
        <div class="flags">
          <label><input type="checkbox" id="g" checked> global</label>
          <label><input type="checkbox" id="i" checked> case-insensitive</label>
          <label><input type="checkbox" id="m" checked> multiline</label>
        </div>
      </div>
      <textarea id="testInput" placeholder="Test string...">The quick brown fox jumps over the lazy dog</textarea>
      <div class="results">
        <div class="match-count" id="matchCount"></div>
        <div class="matches" id="matches"></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .regex-container { max-width: 700px; margin: 0 auto; }
    .regex-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .input-group { margin-bottom: var(--space-3); }
    #pattern { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-lg); font-family: monospace; font-size: var(--text-lg); margin-bottom: var(--space-2); }
    .flags { display: flex; gap: var(--space-4); margin-bottom: var(--space-3); }
    .flags label { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; font-size: var(--text-sm); }
    #testInput { width: 100%; height: 120px; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-xl); background: var(--color-surface); font-family: monospace; resize: vertical; }
    .results { margin-top: var(--space-4); }
    .match-count { font-weight: 600; margin-bottom: var(--space-2); }
    .matches { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-3); max-height: 200px; overflow: auto; }
    .match-item { padding: var(--space-2); border-bottom: 1px solid var(--color-border); font-family: monospace; font-size: var(--text-sm); }
    .match-item:last-child { border: none; }
    .highlight { background: #fef08a; padding: 0 2px; border-radius: 2px; }
  `;
  container.appendChild(style);

  function run() {
    const pattern = container.querySelector('#pattern').value;
    const flags = (container.querySelector('#g').checked ? 'g' : '') + 
                 (container.querySelector('#i').checked ? 'i' : '') + 
                 (container.querySelector('#m').checked ? 'm' : '');
    const text = container.querySelector('#testInput').value;
    try {
      const regex = new RegExp(pattern, flags);
      const matches = text.match(regex) || [];
      container.querySelector('#matchCount').textContent = matches.length + ' match' + (matches.length !== 1 ? 'es' : '');
      if (matches.length === 0) {
        container.querySelector('#matches').innerHTML = '<div class="match-item">No matches found</div>';
      } else {
        container.querySelector('#matches').innerHTML = matches.map((m, i) => 
          '<div class="match-item">' + (i + 1) + '. "' + m + '"</div>'
        ).join('');
      }
    } catch (e) {
      container.querySelector('#matchCount').textContent = 'Invalid regex';
      container.querySelector('#matches').innerHTML = '<div class="match-item" style="color:#ef4444">' + e.message + '</div>';
    }
  }

  container.querySelectorAll('input').forEach(i => i.addEventListener('input', run));
  run();
}
