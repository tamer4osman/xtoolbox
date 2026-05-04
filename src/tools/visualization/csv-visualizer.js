export const toolConfig = {
  id: 'csv-visualizer',
  name: 'CSV Visualizer',
  category: 'visualization',
  description: 'Upload a CSV file and instantly generate charts.',
  icon: '📈',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="csv-container">
      <h2>CSV Visualizer</h2>
      <textarea id="csvInput" placeholder="Name, Age, City&#10;John, 30, NYC&#10;Jane, 25, LA&#10;Bob, 35, Chicago">Name, Age, City
John, 30, NYC
Jane, 25, LA
Bob, 35, Chicago</textarea>
      <button id="visualizeBtn" class="visualize-btn">Visualize</button>
      <div class="csv-stats" id="stats"></div>
      <div class="csv-table-wrap"><table id="csvTable"></table></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .csv-container { max-width: 900px; margin: 0 auto; }
    .csv-container h2 { text-align: center; margin-bottom: var(--space-4); }
    #csvInput { width: 100%; height: 150px; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-xl); background: var(--color-surface); margin-bottom: var(--space-3); resize: vertical; font-family: monospace; font-size: var(--text-xs); }
    .visualize-btn { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; margin-bottom: var(--space-4); }
    .csv-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); margin-bottom: var(--space-4); }
    .stat-card { background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-lg); text-align: center; }
    .stat-value { font-size: var(--text-2xl); font-weight: 700; color: var(--color-primary); }
    .stat-label { font-size: var(--text-xs); color: var(--color-text-secondary); }
    .csv-table-wrap { overflow-x: auto; background: var(--color-surface); border-radius: var(--radius-xl); }
    #csvTable { width: 100%; border-collapse: collapse; font-size: var(--text-sm); }
    #csvTable th, #csvTable td { padding: var(--space-2) var(--space-3); text-align: left; border-bottom: 1px solid var(--color-border); }
    #csvTable th { background: var(--color-bg); font-weight: 600; }
    #csvTable tr:hover { background: var(--color-bg); }
  `;
  container.appendChild(style);

  function parseCSV(text) {
    const lines = text.trim().split('\n').filter(l => l.trim());
    if (!lines.length) return { headers: [], rows: [] };
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));
    return { headers, rows };
  }

  function visualize() {
    const csv = container.querySelector('#csvInput').value;
    const { headers, rows } = parseCSV(csv);
    container.querySelector('#stats').innerHTML = `
      <div class="stat-card"><div class="stat-value">${rows.length}</div><div class="stat-label">Rows</div></div>
      <div class="stat-card"><div class="stat-value">${headers.length}</div><div class="stat-label">Columns</div></div>
      <div class="stat-card"><div class="stat-value">${rows.length * headers.length}</div><div class="stat-label">Cells</div></div>
    `;
    let html = '<thead><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>';
    html += rows.map(row => '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>').join('');
    html += '</tbody>';
    container.querySelector('#csvTable').innerHTML = html;
  }

  container.querySelector('#visualizeBtn').addEventListener('click', visualize);
  container.querySelector('#csvInput').addEventListener('input', visualize);
  visualize();
}
