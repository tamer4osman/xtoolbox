export const toolConfig = {
  id: 'json-csv',
  name: 'JSON to CSV',
  category: 'text',
  description: 'Convert JSON array to CSV format.',
  icon: '📊',
  accept: '.json,.csv',
  maxSizeMB: 5,
  keywords: ['json to csv', 'json csv converter', 'convert json'],
  steps: ['Enter JSON', 'Get CSV']
};

export function render(container) {
  container.innerHTML = `
    <div class="convert-container">
      <div class="convert-input">
        <h3>JSON</h3>
        <textarea id="json-input" placeholder='[{"name":"Alice","age":30},{"name":"Bob","age":25}]'>[
  {"name": "Alice", "age": 30, "city": "NYC"},
  {"name": "Bob", "age": 25, "city": "LA"},
  {"name": "Charlie", "age": 35, "city": "NYC"}
]</textarea>
      </div>
      <div class="convert-output">
        <h3>CSV</h3>
        <textarea id="csv-output" readonly></textarea>
        <button id="copy-btn" class="btn btn-secondary">Copy CSV</button>
        <button id="download-btn" class="btn btn-primary">Download CSV</button>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .convert-container { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .convert-input textarea, .convert-output textarea { width: 100%; min-height: 300px; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-family: monospace; font-size: 14px; }
    .convert-output textarea { background: var(--color-surface); }
    .convert-input h3, .convert-output h3 { margin-bottom: var(--space-2); font-size: var(--text-sm); color: var(--color-muted); }
    .convert-output button { margin-right: var(--space-2); margin-top: var(--space-2); }
  `;
  container.appendChild(style);

  const jsonInput = container.querySelector('#json-input');
  const csvOutput = container.querySelector('#csv-output');
  const copyBtn = container.querySelector('#copy-btn');
  const downloadBtn = container.querySelector('#download-btn');

  function convert() {
    try {
      const json = JSON.parse(jsonInput.value);
      if (!Array.isArray(json) || json.length === 0) {
        csvOutput.value = 'Error: Input must be a JSON array';
        return;
      }
      
      const headers = Object.keys(json[0]);
      const rows = json.map(obj => headers.map(h => {
        const val = obj[h];
        if (val === null || val === undefined) return '';
        const str = String(val);
        return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
      });
      
      csvOutput.value = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    } catch (e) {
      csvOutput.value = 'Error: Invalid JSON - ' + e.message;
    }
  }

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(csvOutput.value);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = 'Copy CSV', 1500);
  });

  downloadBtn.addEventListener('click', () => {
    const blob = new Blob([csvOutput.value], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    a.click();
    URL.revokeObjectURL(url);
  });

  jsonInput.addEventListener('input', convert);
  convert();
}
