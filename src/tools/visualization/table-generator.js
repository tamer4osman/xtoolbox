import { createGeneratorTool } from '../../utils/generator-tool.js';

export const toolConfig = {
  id: 'table-generator',
  name: 'Table Generator',
  category: 'visualization',
  description: 'Create styled tables and export as image, PDF, or CSV.',
  icon: '📋',
  status: 'done'
};

export function render(container) {
  createGeneratorTool({
    container,
    title: 'Table Generator',
    renderForm: () => `
      <div><label style="display:block;font-weight:500;margin-bottom:var(--space-2);font-size:var(--text-sm);">Columns (comma separated)</label>
      <input type="text" id="columns" value="Name, Email, Phone"></div>
      <div><label style="display:block;font-weight:500;margin-bottom:var(--space-2);font-size:var(--text-sm);">Rows</label>
      <input type="number" id="rowCount" value="5" min="1" max="50"></div>
      <button id="generateBtn" style="width:100%;padding:var(--space-3);background:var(--color-primary);color:white;border:none;border-radius:var(--radius-lg);font-weight:600;cursor:pointer;">Generate Table</button>
    `,
    styles: `
      .gen-output table { width: 100%; border-collapse: collapse; }
      .gen-output th, .gen-output td { padding: var(--space-2) var(--space-3); text-align: left; border: 1px solid var(--color-border); }
      .gen-output th { background: var(--color-bg); font-weight: 600; }
    `,
    generate(c) {
      const cols = c.querySelector('#columns').value.split(',').map(s => s.trim()).filter(s => s);
      const rows = parseInt(c.querySelector('#rowCount').value) || 5;
      let html = '<thead><tr>' + cols.map(col => `<th>${col}</th>`).join('') + '</tr></thead><tbody>';
      for (let i = 1; i <= rows; i++) {
        html += '<tr>' + cols.map(() => `<td>Data ${i}</td>`).join('') + '</tr>';
      }
      return html + '</tbody>';
    }
  });

  const resultEl = container.querySelector('#gen-result');
  const previewTable = document.createElement('table');
  resultEl.after(previewTable);
  resultEl.style.display = 'none';

  const copyHtmlBtn = document.createElement('button');
  copyHtmlBtn.textContent = 'Copy HTML';
  copyHtmlBtn.style.cssText = 'flex:1;padding:var(--space-2);background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);cursor:pointer;';

  const copyMdBtn = document.createElement('button');
  copyMdBtn.textContent = 'Copy Markdown';
  copyMdBtn.style.cssText = copyHtmlBtn.style.cssText;

  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;gap:var(--space-2);margin-top:var(--space-4);';
  actions.append(copyHtmlBtn, copyMdBtn);
  container.querySelector('.gen-output').after(actions);

  const observer = new MutationObserver(() => {
    previewTable.innerHTML = resultEl.textContent;
  });
  observer.observe(resultEl, { childList: true, characterData: true, subtree: true });
  previewTable.innerHTML = resultEl.textContent;

  copyHtmlBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(previewTable.outerHTML);
    copyHtmlBtn.textContent = 'Copied!';
    setTimeout(() => { copyHtmlBtn.textContent = 'Copy HTML'; }, 1500);
  });

  copyMdBtn.addEventListener('click', () => {
    const cols = container.querySelector('#columns').value.split(',').map(s => s.trim());
    const rows = parseInt(container.querySelector('#rowCount').value) || 5;
    let md = '| ' + cols.join(' | ') + ' |\n| ' + cols.map(() => '---').join(' | ') + ' |\n';
    for (let i = 1; i <= rows; i++) md += '| ' + cols.map(() => `Data ${i}`).join(' | ') + ' |\n';
    navigator.clipboard.writeText(md);
    copyMdBtn.textContent = 'Copied!';
    setTimeout(() => { copyMdBtn.textContent = 'Copy Markdown'; }, 1500);
  });
}
