import * as XLSX from 'xlsx';
import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';

export const toolConfig = {
  id: 'excel-viewer',
  name: 'Excel Viewer & Editor',
  category: 'text',
  description: 'View and edit Excel spreadsheets (.xlsx, .xls, .csv) in the browser. Export as CSV or new XLSX.',
  icon: '📊',
  accept: '.xlsx,.xls,.csv',
  maxSizeMB: 20,
  keywords: ['excel viewer', 'xlsx viewer', 'spreadsheet viewer', 'open excel online', 'edit excel'],
  steps: ['Upload an Excel or CSV file', 'View and edit the data', 'Export as CSV or XLSX'],
  faqs: [
    { question: 'What formats supported?', answer: 'We support .xlsx, .xls, and .csv files up to 20MB.' },
    { question: 'Can I edit the data?', answer: 'Yes! Double-click any cell to edit. Changes are saved when you export.' },
    { question: 'Can I export my changes?', answer: 'Yes, export as CSV or XLSX format.' }
  ]
};

export function render(container) {
  let workbook = null;
  let currentFile = null;
  let editedData = {};

  const upload = createFileUpload({
    accept: '.xlsx,.xls,.csv',
    multiple: false,
    maxSizeMB: 20,
    onFilesSelected: (files) => {
      if (files.length > 0) {
        currentFile = files[0];
        loadWorkbook(files[0]);
      }
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="excel-toolbar" id="toolbar" style="display:none;gap:var(--space-2);margin:var(--space-4) 0;">
        <button class="btn btn-secondary" id="export-csv">Export CSV</button>
        <button class="btn btn-primary" id="export-xlsx">Export XLSX</button>
        <button class="btn btn-ghost" id="clear-data">Clear</button>
      </div>
      <div class="excel-container" id="excel-container" style="overflow:auto;max-height:500px;border:var(--border);border-radius:var(--radius-lg);display:none;"></div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Loading spreadsheet...</p></div>
    </div>
    <style>
      .excel-toolbar { display:flex;flex-wrap:wrap; }
      .excel-table { border-collapse:collapse;width:100%;font-size:14px; }
      .excel-table th,.excel-table td { border:1px solid var(--color-border);padding:8px;text-align:left; }
      .excel-table th { background:var(--color-surface);font-weight:600; }
      .excel-table td:hover { background:var(--color-surface);cursor:pointer; }
      .excel-table td:focus { outline:2px solid var(--color-primary);outline-offset:-2px; }
      .sheet-tabs { display:flex;gap:var(--space-2);margin-bottom:var(--space-3);flex-wrap:wrap; }
      .sheet-tab { padding:var(--space-2) var(--space-3);background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius);cursor:pointer; }
      .sheet-tab.active { background:var(--color-primary);color:white;border-color:var(--color-primary); }
    </style>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const toolbar = container.querySelector('#toolbar');
  const excelContainer = container.querySelector('#excel-container');
  const processing = container.querySelector('#processing');
  const exportCsv = container.querySelector('#export-csv');
  const exportXlsx = container.querySelector('#export-xlsx');
  const clearData = container.querySelector('#clear-data');

  async function loadWorkbook(file) {
    processing.style.display = 'flex';
    excelContainer.style.display = 'none';
    toolbar.style.display = 'none';
    
    try {
      const data = await file.arrayBuffer();
      workbook = XLSX.read(data, { type: 'array' });
      renderSheet(workbook.SheetNames[0]);
      toolbar.style.display = 'flex';
      showToast({ message: 'Spreadsheet loaded!', type: 'success' });
    } catch (err) {
      console.error('Load error:', err);
      showToast({ message: 'Failed to load file: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
    }
  }

  function renderSheet(sheetName) {
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    if (json.length === 0) {
      excelContainer.innerHTML = '<p style="padding:var(--space-4);color:var(--color-text-secondary);">Empty spreadsheet</p>';
      excelContainer.style.display = 'block';
      return;
    }

    const maxCols = Math.max(...json.map(row => row.length));
    const headers = json[0] || [];
    const rows = json.slice(1);
    
    let html = '<div class="sheet-tabs">';
    workbook.SheetNames.forEach(name => {
      html += `<button class="sheet-tab ${name === sheetName ? 'active' : ''}" data-sheet="${name}">${name}</button>`;
    });
    html += '</div>';
    
    html += '<table class="excel-table" contenteditable>';
    html += '<thead><tr>';
    headers.forEach((header, i) => {
      html += `<th contenteditable="true" data-row="-1" data-col="${i}">${header ?? ''}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    rows.forEach((row, rowIdx) => {
      html += '<tr>';
      for (let i = 0; i < maxCols; i++) {
        html += `<td contenteditable="true" data-row="${rowIdx}" data-col="${i}">${row[i] ?? ''}</td>`;
      }
      html += '</tr>';
    });
    html += '</tbody></table>';
    
    excelContainer.innerHTML = html;
    excelContainer.style.display = 'block';
    
    excelContainer.querySelectorAll('.sheet-tab').forEach(tab => {
      tab.addEventListener('click', () => renderSheet(tab.dataset.sheet));
    });
    
    excelContainer.querySelectorAll('td, th').forEach(cell => {
      cell.addEventListener('blur', () => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        if (!editedData[row]) editedData[row] = {};
        editedData[row][col] = cell.textContent;
      });
    });
  }

  exportCsv.addEventListener('click', () => {
    if (!workbook) return;
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    const blob = new Blob([csv], { type: 'text/csv' });
    const filename = currentFile.name.replace(/\.[^.]+$/, '.csv');
    downloadBlob(blob, filename);
    showToast({ message: 'Exported as CSV!', type: 'success' });
  });

  exportXlsx.addEventListener('click', () => {
    if (!workbook) return;
    const newWb = XLSX.utils.book_new();
    const sheetName = workbook.SheetNames[0];
    let sheet = workbook.Sheets[sheetName];
    
    if (Object.keys(editedData).length > 0) {
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      Object.entries(editedData).forEach(([rowIdx, cells]) => {
        const r = parseInt(rowIdx) + 1;
        Object.entries(cells).forEach(([colIdx, value]) => {
          const c = parseInt(colIdx);
          if (json[r] === undefined) json[r] = [];
          json[r][c] = value;
        });
      });
      sheet = XLSX.utils.aoa_to_sheet(json);
    }
    
    XLSX.utils.book_append_sheet(newWb, sheet, sheetName);
    const wbout = XLSX.write(newWb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const filename = currentFile.name.replace(/\.[^.]+$/, '_edited.xlsx');
    downloadBlob(blob, filename);
    showToast({ message: 'Exported as XLSX!', type: 'success' });
  });

  clearData.addEventListener('click', () => {
    if (currentFile) loadWorkbook(currentFile);
    editedData = {};
  });
}

export function destroy() {}
