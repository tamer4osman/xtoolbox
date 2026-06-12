import { showToast } from '../../components/toast.js';

export const toolConfig = {
  id: 'text-cleaner',
  name: 'Text Cleaner',
  category: 'text',
  description: 'Clean and normalize text.',
  icon: '🧹',
  status: 'done'
};

export function render() {
  return `
    <div class="tool-container">
      <header class="tool-header">
        <h1>✨ Text Cleaner</h1>
        <p class="tool-description">Clean and format your text - remove extra spaces, line breaks, and more</p>
      </header>

      <div class="tool-content">
        <div class="input-group">
          <label>Input Text</label>
          <textarea id="input" placeholder="Paste messy text here..." rows="6"></textarea>
        </div>

        <div class="action-buttons" style="flex-wrap: wrap;">
          <button id="trimBtn" class="btn btn-outline">Trim Whitespace</button>
          <button id="removeExtraBtn" class="btn btn-outline">Remove Extra Spaces</button>
          <button id="removeLinesBtn" class="btn btn-outline">Remove Empty Lines</button>
          <button id="removeAllBtn" class="btn btn-outline">Remove All Line Breaks</button>
          <button id="sortLinesBtn" class="btn btn-outline">Sort Lines A-Z</button>
          <button id="uniqueLinesBtn" class="btn btn-outline">Remove Duplicate Lines</button>
        </div>

        <div class="action-buttons">
          <button id="allBtn" class="btn btn-primary">Clean All</button>
          <button id="copyBtn" class="btn btn-outline">Copy</button>
          <button id="clearBtn" class="btn btn-outline">Clear</button>
        </div>

        <div class="input-group">
          <label>Result</label>
          <textarea id="output" readonly rows="6"></textarea>
        </div>
      </div>
    </div>
  `;
}

export function init() {
  const input = document.getElementById('input');
  const output = document.getElementById('output');

  const ops = {
    trim: t => t.trim(),
    removeExtra: t => t.replace(/\\s+/g, ' ').trim(),
    removeLines: t => t.split('\\n').filter(l => l.trim()).join('\\n'),
    removeAll: t => t.replace(/\\n/g, ' ').replace(/\\s+/g, ' ').trim(),
    sortLines: t => t.split('\\n').sort((a, b) => a.localeCompare(b)).join('\\n'),
    uniqueLines: t => [...new Set(t.split('\\n'))].join('\\n'),
    all: t => t.replace(/\\s+/g, ' ').replace(/\\n\\s*\\n/g, '\\n').trim()
  };

  document.getElementById('trimBtn').onclick = () => output.value = ops.trim(input.value);
  document.getElementById('removeExtraBtn').onclick = () => output.value = ops.removeExtra(input.value);
  document.getElementById('removeLinesBtn').onclick = () => output.value = ops.removeLines(input.value);
  document.getElementById('removeAllBtn').onclick = () => output.value = ops.removeAll(input.value);
  document.getElementById('sortLinesBtn').onclick = () => output.value = ops.sortLines(input.value);
  document.getElementById('uniqueLinesBtn').onclick = () => output.value = ops.uniqueLines(input.value);
  document.getElementById('allBtn').onclick = () => output.value = ops.all(input.value);
  document.getElementById('copyBtn').onclick = () => {
    navigator.clipboard.writeText(output.value)
      .then(() => showToast({ message: 'Copied!' }))
      .catch(() => showToast({ message: 'Failed to copy', type: 'error' }));
  };
  document.getElementById('clearBtn').onclick = () => { input.value = ''; output.value = ''; };
}

