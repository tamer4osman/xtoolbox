export const toolConfig = {
  id: 'json-validator',
  name: 'JSON Validator',
  category: 'dev',
  description: 'Validate and format JSON data with syntax checking.',
  icon: '📋',
  steps: ['Paste JSON', 'Validate']
};

export function render(container) {
  container.innerHTML = `
    <div class="json-container">
      <textarea id="json-input" placeholder="Paste your JSON here..."></textarea>
      <div class="json-actions">
        <button id="validate-btn">Validate</button>
        <button id="format-btn">Format</button>
        <button id="minify-btn">Minify</button>
      </div>
      <div id="json-result" class="json-result"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .json-container { max-width: 800px; margin: 0 auto; }
    .json-container textarea { width: 100%; height: 300px; padding: var(--space-4); font-family: monospace; border: 1px solid #ddd; border-radius: var(--radius-lg); font-size: var(--text-sm); resize: vertical; }
    .json-actions { display: flex; gap: var(--space-2); margin: var(--space-3) 0; }
    .json-actions button { padding: var(--space-2) var(--space-4); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; }
    .json-result { padding: var(--space-4); border-radius: var(--radius-lg); font-family: monospace; font-size: var(--text-sm); white-space: pre-wrap; overflow: auto; max-height: 400px; }
    .json-result.valid { background: #d4edda; color: #155724; }
    .json-result.invalid { background: #f8d7da; color: #721c24; }
  `;
  container.appendChild(style);

  const input = container.querySelector('#json-input');
  const result = container.querySelector('#json-result');

  container.querySelector('#validate-btn').addEventListener('click', () => {
    try {
      JSON.parse(input.value);
      result.className = 'json-result valid';
      result.textContent = '✓ Valid JSON';
    } catch (e) {
      result.className = 'json-result invalid';
      result.textContent = '✗ Invalid JSON: ' + e.message;
    }
  });

  container.querySelector('#format-btn').addEventListener('click', () => {
    try {
      const parsed = JSON.parse(input.value);
      input.value = JSON.stringify(parsed, null, 2);
      result.className = 'json-result valid';
      result.textContent = '✓ Formatted';
    } catch (e) {
      result.className = 'json-result invalid';
      result.textContent = '✗ Invalid JSON: ' + e.message;
    }
  });

  container.querySelector('#minify-btn').addEventListener('click', () => {
    try {
      const parsed = JSON.parse(input.value);
      input.value = JSON.stringify(parsed);
      result.className = 'json-result valid';
      result.textContent = '✓ Minified';
    } catch (e) {
      result.className = 'json-result invalid';
      result.textContent = '✗ Invalid JSON: ' + e.message;
    }
  });

  return container;
}
