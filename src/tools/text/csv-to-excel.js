import * as XLSX from 'xlsx';
import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';

export const toolConfig = {
  id: 'csv-to-excel',
  name: 'CSV to Excel Converter',
  category: 'text',
  description: 'Convert CSV files to Excel format with proper formatting.',
  icon: '🔄',
  accept: '.csv',
  maxSizeMB: 20,
  keywords: ['csv to excel', 'convert csv to xlsx', 'csv converter', 'spreadsheet converter'],
  steps: ['Upload a CSV file', 'Click Convert', 'Download Excel file'],
  faqs: [
    { question: 'What formats supported?', answer: 'We support .csv files up to 20MB.' },
    { question: 'Can I convert Excel back to CSV?', answer: 'Yes, use our Excel Viewer tool to export as CSV.' }
  ]
};

export function render(container) {
  let csvFile = null;

  const upload = createFileUpload({
    accept: '.csv',
    multiple: false,
    maxSizeMB: 20,
    onFilesSelected: (files) => {
      if (files.length > 0) {
        csvFile = files[0];
        convertBtn.style.display = 'inline-flex';
        fileName.textContent = files[0].name;
        fileInfo.textContent = (files[0].size / 1024 / 1024).toFixed(2) + ' MB';
        fileInfoPanel.style.display = 'flex';
      }
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="file-info-panel" style="display:none;margin:var(--space-4) 0;">
        <div class="file-details">
          <span class="file-icon">📄</span>
          <div class="file-details-text">
            <div class="file-name" id="file-name"></div>
            <div class="file-size" id="file-info"></div>
          </div>
        </div>
      </div>
      <button class="btn btn-primary btn-lg" id="convert-btn" style="display:none;width:100%;">Convert to Excel</button>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Converting CSV to Excel...</p></div>
    </div>
    <style>
      .file-info-panel { background:var(--color-surface);padding:var(--space-4);border-radius:var(--radius-lg); }
      .file-details { display:flex;align-items:center;gap:var(--space-4); }
      .file-icon { font-size:32px; }
      .file-name { font-weight:600; }
      .file-size { font-size:var(--text-sm);color:var(--color-text-secondary); }
    </style>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const convertBtn = container.querySelector('#convert-btn');
  const processing = container.querySelector('#processing');
  const fileName = container.querySelector('#file-name');
  const fileInfo = container.querySelector('#file-info');
  const fileInfoPanel = container.querySelector('.file-info-panel');

  convertBtn.addEventListener('click', async () => {
    if (!csvFile) return;
    
    convertBtn.style.display = 'none';
    processing.style.display = 'flex';
    
    try {
      const text = await csvFile.text();
      const wb = XLSX.read(text, { type: 'string' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      const newWb = XLSX.utils.book_new();
      const newWs = XLSX.utils.aoa_to_sheet(json);
      XLSX.utils.book_append_sheet(newWb, newWs, 'Data');
      
      const wbout = XLSX.write(newWb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const filename = csvFile.name.replace(/\.csv$/i, '.xlsx');
      downloadBlob(blob, filename);
      showToast({ message: 'CSV converted to Excel!', type: 'success' });
    } catch (err) {
      console.error('Conversion error:', err);
      showToast({ message: 'Conversion failed: ' + err.message, type: 'error' });
    } finally {
      convertBtn.style.display = 'inline-flex';
      processing.style.display = 'none';
    }
  });
}

export function destroy() {}
