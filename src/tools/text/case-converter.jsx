export const toolConfig = {
  id: 'case-converter',
  name: 'Case Converter',
  category: 'text',
  description: 'Convert text to different cases: UPPER, lower, Title, Sentence.',
  icon: 'Aa',
  accept: null,
  maxSizeMB: null,
  keywords: ['case converter', 'text case', 'uppercase', 'lowercase', 'title case'],
  steps: ['Enter text', 'Choose case', 'Copy result']
};

export function render(container) {
  container.innerHTML = `
    <div class="case-container">
      <textarea id="input" placeholder="Enter text to convert..."></textarea>
      <div class="case-buttons">
        <button class="btn case-btn" data-case="upper">UPPER</button>
        <button class="btn case-btn" data-case="lower">lower</button>
        <button class="btn case-btn" data-case="title">Title Case</button>
        <button class="btn case-btn" data-case="sentence">Sentence case</button>
        <button class="btn case-btn" data-case="toggle">tOgGlE</button>
      </div>
      <textarea id="output" readonly placeholder="Result will appear here..."></textarea>
      <button id="copy-btn" class="btn btn-secondary">Copy Result</button>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .case-container { max-width: 700px; margin: 0 auto; }
    .case-container textarea { width: 100%; min-height: 120px; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); margin-bottom: var(--space-3); }
    .case-buttons { display: flex; gap: var(--space-2); flex-wrap: wrap; margin-bottom: var(--space-3); }
    .case-btn { flex: 1; min-width: 100px; }
    #copy-btn { width: 100%; }
  `;
  container.appendChild(style);

  const input = container.querySelector('#input');
  const output = container.querySelector('#output');
  const copyBtn = container.querySelector('#copy-btn');
  const caseBtns = container.querySelectorAll('.case-btn');

  const converters = {
    upper: (t) => t.toUpperCase(),
    lower: (t) => t.toLowerCase(),
    title: (t) => t.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
    sentence: (t) => t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase()),
    toggle: (t) => t.split('').map((c) => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('')
  };

  caseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const caseType = btn.dataset.case;
      output.value = converters[caseType](input.value);
    });
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(output.value);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = 'Copy Result', 1500);
  });

  input.addEventListener('input', () => output.value = '');
}
