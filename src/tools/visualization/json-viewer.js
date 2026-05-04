export const toolConfig = {
  id: 'json-viewer',
  name: 'JSON Viewer',
  category: 'visualization',
  description: 'View JSON data as a collapsible tree with syntax highlighting.',
  icon: '🌳',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="json-container">
      <h2>JSON Viewer</h2>
      <div class="json-input">
        <textarea id="jsonInput" placeholder="Paste JSON here...">{"name": "XToolBox", "version": 1.0, "tools": ["calculator", "converter", "generator"], "active": true}</textarea>
        <div class="json-actions">
          <button id="formatBtn" class="action-btn">Format</button>
          <button id="minifyBtn" class="action-btn">Minify</button>
          <button id="copyBtn" class="action-btn">Copy</button>
        </div>
      </div>
      <div class="json-output" id="output"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .json-container { max-width: 900px; margin: 0 auto; }
    .json-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .json-input { margin-bottom: var(--space-4); }
    #jsonInput { width: 100%; height: 200px; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-xl); background: var(--color-surface); font-family: monospace; font-size: var(--text-sm); resize: vertical; }
    .json-actions { display: flex; gap: var(--space-2); margin-top: var(--space-2); }
    .action-btn { flex: 1; padding: var(--space-2); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer; font-weight: 500; }
    .action-btn:hover { background: var(--color-bg); }
    .json-output { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-4); max-height: 500px; overflow: auto; }
    .json-output pre { margin: 0; font-family: monospace; font-size: var(--text-sm); white-space: pre-wrap; }
    .key { color: #881391; }
    .string { color: #0b7505; }
    .number { color: #1750eb; }
    .boolean { color: #005cc5; }
    .null { color: #6f42c1; }
  `;
  container.appendChild(style);

  function colorize(json) {
    return json.replace(/"([^"]+)":/g, '<span class="key">"$1"</span>:')
      .replace(/: "([^"]+)"/g, ': <span class="string">"$1"</span>')
      .replace(/: (\d+\.?\d*)/g, ': <span class="number">$1</span>')
      .replace(/: (true|false)/g, ': <span class="boolean">$1</span>')
      .replace(/: (null)/g, ': <span class="null">$1</span>');
  }

  function render() {
    try {
      const text = container.querySelector('#jsonInput').value;
      const parsed = JSON.parse(text);
      container.querySelector('#output').innerHTML = '<pre>' + colorize(JSON.stringify(parsed, null, 2)) + '</pre>';
    } catch (e) {
      container.querySelector('#output').innerHTML = '<pre style="color:#ef4444">Invalid JSON</pre>';
    }
  }

  container.querySelector('#formatBtn').addEventListener('click', () => {
    try {
      const parsed = JSON.parse(container.querySelector('#jsonInput').value);
      container.querySelector('#jsonInput').value = JSON.stringify(parsed, null, 2);
      render();
    } catch {}
  });

  container.querySelector('#minifyBtn').addEventListener('click', () => {
    try {
      const parsed = JSON.parse(container.querySelector('#jsonInput').value);
      container.querySelector('#jsonInput').value = JSON.stringify(parsed);
      render();
    } catch {}
  });

  container.querySelector('#copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(container.querySelector('#jsonInput').value);
    container.querySelector('#copyBtn').textContent = 'Copied!';
    setTimeout(() => container.querySelector('#copyBtn').textContent = 'Copy', 1500);
  });

  container.querySelector('#jsonInput').addEventListener('input', render);
  render();
}
