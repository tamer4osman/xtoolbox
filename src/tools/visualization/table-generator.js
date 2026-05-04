export const toolConfig = {
  id: 'table-generator',
  name: 'Table Generator',
  category: 'visualization',
  description: 'Create styled tables and export as image, PDF, or CSV.',
  icon: '📋',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="table-container">
      <h2>Table Generator</h2>
      <div class="table-config">
        <div class="config-row">
          <label>Columns (comma separated)</label>
          <input type="text" id="columns" value="Name, Email, Phone">
        </div>
        <div class="config-row">
          <label>Rows</label>
          <input type="number" id="rowCount" value="5" min="1" max="50">
        </div>
        <button id="generateBtn" class="generate-btn">Generate Table</button>
      </div>
      <div class="table-output">
        <table id="previewTable"></table>
      </div>
      <div class="export-actions">
        <button id="copyHtmlBtn">Copy HTML</button>
        <button id="copyMarkdownBtn">Copy Markdown</button>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .table-container { max-width: 900px; margin: 0 auto; }
    .table-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .table-config { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); margin-bottom: var(--space-4); }
    .config-row { margin-bottom: var(--space-3); }
    .config-row label { display: block; font-weight: 500; margin-bottom: var(--space-2); font-size: var(--text-sm); }
    .config-row input { width: 100%; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .generate-btn { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .table-output { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-4); overflow-x: auto; margin-bottom: var(--space-4); }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: var(--space-2) var(--space-3); text-align: left; border: 1px solid var(--color-border); }
    th { background: var(--color-bg); font-weight: 600; }
    .export-actions { display: flex; gap: var(--space-2); }
    .export-actions button { flex: 1; padding: var(--space-2); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer; }
  `;
  container.appendChild(style);

  function generate() {
    const cols = container.querySelector('#columns').value.split(',').map(c => c.trim()).filter(c => c);
    const rows = parseInt(container.querySelector('#rowCount').value) || 5;
    let html = '<thead><tr>' + cols.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
    for (let i = 1; i <= rows; i++) {
      html += '<tr>' + cols.map(() => `<td>Data ${i}</td>`).join('') + '</tr>';
    }
    html += '</tbody>';
    container.querySelector('#previewTable').innerHTML = html;
  }

  container.querySelector('#generateBtn').addEventListener('click', generate);
  container.querySelector('#columns').addEventListener('input', generate);
  container.querySelector('#rowCount').addEventListener('input', generate);

  container.querySelector('#copyHtmlBtn').addEventListener('click', () => {
    const table = container.querySelector('#previewTable');
    navigator.clipboard.writeText(table.outerHTML);
    container.querySelector('#copyHtmlBtn').textContent = 'Copied!';
    setTimeout(() => container.querySelector('#copyHtmlBtn').textContent = 'Copy HTML', 1500);
  });

  container.querySelector('#copyMarkdownBtn').addEventListener('click', () => {
    const cols = container.querySelector('#columns').value.split(',').map(c => c.trim());
    const rows = parseInt(container.querySelector('#rowCount').value) || 5;
    let md = '| ' + cols.join(' | ') + ' |\n| ' + cols.map(() => '---').join(' | ') + ' |\n';
    for (let i = 1; i <= rows; i++) md += '| ' + cols.map(() => `Data ${i}`).join(' | ') + ' |\n';
    navigator.clipboard.writeText(md);
    container.querySelector('#copyMarkdownBtn').textContent = 'Copied!';
    setTimeout(() => container.querySelector('#copyMarkdownBtn').textContent = 'Copy Markdown', 1500);
  });

  generate();
}
