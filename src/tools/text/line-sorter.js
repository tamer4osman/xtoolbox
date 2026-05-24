export const toolConfig = {
  id: 'line-sorter',
  name: 'Text Line Sorter',
  category: 'text',
  description: 'Sort, reverse, shuffle, deduplicate, or trim lines of text in one click.',
  icon: '↕️',
  accept: null,
  maxSizeMB: null,
  keywords: ['line sorter', 'sort lines', 'alphabetize', 'reverse order', 'shuffle lines', 'deduplicate', 'unique lines', 'text sorter'],
  steps: ['Paste or type your text (one item per line)', 'Choose a sort mode', 'Copy the result'],
  faqs: [
    { question: 'What sort modes are available?', answer: 'A→Z, Z→A, Natural, Numeric, Reverse, Shuffle, Unique, and Trim.' },
    { question: 'Does it handle large inputs?', answer: 'Yes. It sorts efficiently in the browser. Very large inputs may be slow with Shuffle mode.' }
  ]
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-layout">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
        <div class="form-group" style="margin-bottom:0;">
          <label>Input</label>
          <textarea id="ls-input" class="text-input" rows="10" placeholder="One item per line..." style="font-family:monospace;resize:vertical;">banana
apple
Cherry
date
Apple
12
2
1
20
orange</textarea>
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label>Output (<span id="ls-count">10</span> lines)</label>
          <textarea id="ls-output" class="text-input" rows="10" readonly style="font-family:monospace;resize:vertical;background:var(--color-bg);"></textarea>
        </div>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:var(--space-2);margin:var(--space-4) 0;">
        <button class="btn btn-secondary ls-mode" data-mode="alpha-asc">A → Z</button>
        <button class="btn btn-secondary ls-mode" data-mode="alpha-desc">Z → A</button>
        <button class="btn btn-secondary ls-mode" data-mode="natural">Natural</button>
        <button class="btn btn-secondary ls-mode" data-mode="numeric">Numeric</button>
        <button class="btn btn-secondary ls-mode" data-mode="reverse">Reverse</button>
        <button class="btn btn-secondary ls-mode" data-mode="shuffle">Shuffle</button>
        <button class="btn btn-secondary ls-mode" data-mode="unique">Unique</button>
        <button class="btn btn-secondary ls-mode" data-mode="trim">Trim</button>
      </div>

      <div style="display:flex;gap:var(--space-3);">
        <button class="btn btn-primary" id="ls-copy">Copy Output</button>
        <button class="btn btn-secondary" id="ls-clear">Clear Input</button>
      </div>
    </div>
  `;

  const input = container.querySelector('#ls-input');
  const output = container.querySelector('#ls-output');
  const count = container.querySelector('#ls-count');
  const copyBtn = container.querySelector('#ls-copy');
  const clearBtn = container.querySelector('#ls-clear');

  function getLines() {
    return input.value.split('\n');
  }

  function setResult(lines) {
    output.value = lines.join('\n');
    count.textContent = lines.length;
  }

  function process(mode) {
    let lines = getLines();
    switch (mode) {
      case 'alpha-asc':
        lines.sort((a, b) => a.localeCompare(b));
        break;
      case 'alpha-desc':
        lines.sort((a, b) => b.localeCompare(a));
        break;
      case 'natural':
        lines.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
        break;
      case 'numeric':
        lines.sort((a, b) => {
          const na = parseFloat(a), nb = parseFloat(b);
          if (isNaN(na) && isNaN(nb)) return a.localeCompare(b);
          if (isNaN(na)) return 1;
          if (isNaN(nb)) return -1;
          return na - nb;
        });
        break;
      case 'reverse':
        lines.reverse();
        break;
      case 'shuffle':
        for (let i = lines.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [lines[i], lines[j]] = [lines[j], lines[i]];
        }
        break;
      case 'unique':
        lines = [...new Set(lines)];
        break;
      case 'trim':
        lines = lines.map(l => l.trim());
        break;
    }
    setResult(lines);
  }

  input.addEventListener('input', () => {
    count.textContent = getLines().length;
  });

  container.querySelectorAll('.ls-mode').forEach(btn => {
    btn.addEventListener('click', () => process(btn.dataset.mode));
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(output.value).catch(() => {});
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    output.value = '';
    count.textContent = '0';
  });

  process('alpha-asc');
}

export function destroy() {}
