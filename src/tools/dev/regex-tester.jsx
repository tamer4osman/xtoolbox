export const toolConfig = {
  id: 'regex-tester',
  name: 'Regex Tester',
  category: 'dev',
  description: 'Test regular expressions with real-time matching.',
  icon: '🔍',
  steps: ['Enter pattern', 'Enter test string', 'View matches']
};

export function render(container) {
  container.innerHTML = `
    <div class="regex-container">
      <div class="regex-input">
        <label>Regular Expression</label>
        <input type="text" id="regex-pattern" placeholder="e.g., \\d+|[a-z]+">
        <div class="regex-flags">
          <label><input type="checkbox" id="flag-g" checked> global</label>
          <label><input type="checkbox" id="flag-i"> case insensitive</label>
          <label><input type="checkbox" id="flag-m"> multiline</label>
        </div>
      </div>
      <div class="regex-input">
        <label>Test String</label>
        <textarea id="regex-test" placeholder="Enter text to test against..."></textarea>
      </div>
      <div class="regex-results">
        <div class="regex-match-count" id="match-count"></div>
        <div class="regex-matches" id="matches"></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .regex-container { max-width: 800px; margin: 0 auto; }
    .regex-input { margin-bottom: var(--space-4); }
    .regex-input label { display: block; font-weight: 500; margin-bottom: var(--space-2); }
    .regex-input input[type="text"] { width: 100%; padding: var(--space-3); border: 1px solid #ddd; border-radius: var(--radius-md); font-family: monospace; font-size: var(--text-base); }
    .regex-input textarea { width: 100%; height: 150px; padding: var(--space-3); border: 1px solid #ddd; border-radius: var(--radius-md); font-family: monospace; font-size: var(--text-sm); resize: vertical; }
    .regex-flags { display: flex; gap: var(--space-4); margin-top: var(--space-2); }
    .regex-flags label { display: flex; align-items: center; gap: 4px; font-size: var(--text-sm); cursor: pointer; }
    .regex-match-count { padding: var(--space-3); background: #e3f2fd; border-radius: var(--radius-md); margin-bottom: var(--space-3); font-weight: 500; }
    .regex-matches { padding: var(--space-3); background: #f5f5f5; border-radius: var(--radius-md); font-family: monospace; font-size: var(--text-sm); white-space: pre-wrap; }
    .match { background: #fff3cd; padding: 2px 4px; border-radius: 2px; }
  `;
  container.appendChild(style);

  function testRegex() {
    const pattern = container.querySelector('#regex-pattern').value;
    const testStr = container.querySelector('#regex-test').value;
    const g = container.querySelector('#flag-g').checked;
    const i = container.querySelector('#flag-i').checked;
    const m = container.querySelector('#flag-m').checked;
    const flags = (g ? 'g' : '') + (i ? 'i' : '') + (m ? 'm' : '');

    const countEl = container.querySelector('#match-count');
    const matchesEl = container.querySelector('#matches');

    if (!pattern) {
      countEl.textContent = 'Enter a pattern';
      matchesEl.innerHTML = '';
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      const matches = testStr.match(regex) || [];
      
      countEl.textContent = `${matches.length} match${matches.length !== 1 ? 'es' : ''} found`;
      
      if (matches.length > 0) {
        matchesEl.innerHTML = matches.map(m => `<span class="match">${m}</span>`).join(' ');
      } else {
        matchesEl.textContent = 'No matches';
      }
    } catch (e) {
      countEl.textContent = 'Invalid regex';
      matchesEl.textContent = e.message;
    }
  }

  container.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', testRegex);
  });

  return container;
}
