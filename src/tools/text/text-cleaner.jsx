export function render(container) {
  container.innerHTML = `
    <div class="cleaner-container">
      <h2>Text Cleaner</h2>
      <div class="cleaner-options">
        <label><input type="checkbox" id="trim" checked> Trim whitespace</label>
        <label><input type="checkbox" id="dedupe" checked> Remove duplicate lines</label>
        <label><input type="checkbox" id="emptylines"> Remove empty lines</label>
        <label><input type="checkbox" id="sort"> Sort lines alphabetically</label>
        <label><input type="checkbox" id="unique"> Keep unique only</label>
      </div>
      <div class="cleaner-panels">
        <div class="cleaner-pane">
          <div class="pane-header">Input</div>
          <textarea id="input" placeholder="Paste text to clean..."></textarea>
        </div>
        <button id="clean-btn" class="clean-btn">Clean →</button>
        <div class="cleaner-pane">
          <div class="pane-header">Output <button id="copy-btn">Copy</button></div>
          <pre id="output"></pre>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .cleaner-container { height: calc(100vh - 200px); display: flex; flex-direction: column; }
    .cleaner-container h2 { margin-bottom: var(--space-4); }
    .cleaner-options { display: flex; flex-wrap: wrap; gap: var(--space-4); margin-bottom: var(--space-4); }
    .cleaner-options label { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); cursor: pointer; }
    .cleaner-panels { flex: 1; display: flex; flex-direction: column; gap: var(--space-3); min-height: 0; }
    .cleaner-pane { flex: 1; display: flex; flex-direction: column; background: var(--color-surface); border-radius: var(--radius-xl); overflow: hidden; min-height: 0; }
    .pane-header { padding: var(--space-2) var(--space-3); background: var(--color-bg); font-weight: 600; font-size: var(--text-sm); display: flex; justify-content: space-between; }
    #copy-btn { padding: 2px 8px; background: var(--color-primary); color: white; border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: var(--text-xs); }
    textarea { flex: 1; padding: var(--space-3); border: none; resize: none; font-family: monospace; font-size: var(--text-sm); background: var(--color-surface); }
    pre { flex: 1; padding: var(--space-3); margin: 0; overflow: auto; font-family: monospace; font-size: var(--text-sm); background: var(--color-surface); }
    .clean-btn { padding: var(--space-2) var(--space-4); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
  `;
  container.appendChild(style);

  container.querySelector('#clean-btn').addEventListener('click', () => {
    let lines = container.querySelector('#input').value.split('\\n');
    
    if (container.querySelector('#trim').checked) lines = lines.map(l => l.trim());
    if (container.querySelector('#emptylines').checked) lines = lines.filter(l => l.trim());
    if (container.querySelector('#dedupe').checked) {
      const seen = new Set();
      lines = lines.filter(l => seen.has(l) ? false : seen.add(l));
    }
    if (container.querySelector('#unique').checked) lines = [...new Set(lines)];
    if (container.querySelector('#sort').checked) lines.sort();
    
    container.querySelector('#output').textContent = lines.join('\\n');
  });

  container.querySelector('#copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(container.querySelector('#output').textContent);
    container.querySelector('#copy-btn').textContent = 'Copied!';
    setTimeout(() => container.querySelector('#copy-btn').textContent = 'Copy', 2000);
  });

  return container;
}
