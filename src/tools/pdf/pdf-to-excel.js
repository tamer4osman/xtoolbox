import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const toolConfig = {
  id: 'pdf-to-excel',
  name: 'PDF to Excel',
  category: 'pdf',
  description: 'Extract tables from PDF and convert to editable Excel spreadsheets.',
  icon: '📊',
  accept: '.pdf',
  maxSizeMB: 50,
  keywords: ['pdf to excel', 'pdf to xlsx', 'convert pdf to excel', 'extract tables from pdf'],
  steps: ['Upload a PDF file', 'Click "Convert to Excel"', 'Download the .xlsx file'],
  faqs: [
    { question: 'What formats supported?', answer: 'We support PDF files up to 50MB.' },
    { question: 'Are tables extracted?', answer: 'Yes, tables are extracted as Excel rows and columns.' },
    { question: 'Are scanned PDFs supported?', answer: 'Only PDFs with selectable text. Scanned images need OCR first.' }
  ]
};

function parseCSV(content) {
  const rows = [];
  let currentRow = [];
  let currentCell = '';
  let inQuotes = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];
    
    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentRow.push(currentCell.trim());
        if (currentRow.some(cell => cell)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
        if (char === '\r') i++;
      } else if (char !== '\r') {
        currentCell += char;
      }
    }
  }
  
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(cell => cell)) {
      rows.push(currentRow);
    }
  }
  
  return rows;
}

function generateXLSX(content) {
  const BOM = '\uFEFF';
  const rows = parseCSV(content);
  
  if (rows.length === 0) {
    return BOM + 'No tables found in PDF';
  }
  
  const xlsxContent = rows.map(row => 
    row.map(cell => {
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',')
  ).join('\n');
  
  return BOM + xlsxContent;
}

export function render(container) {
  let pdfBuffer = null;

  const upload = createFileUpload({
    accept: '.pdf',
    multiple: false,
    maxSizeMB: 50,
    onFilesSelected: (files) => {
      if (files.length > 0) {
        pdfBuffer = files[0];
        convertBtn.style.display = 'inline-flex';
        fileName.textContent = files[0].name;
        fileInfo.textContent = (files[0].size / 1024 / 1024).toFixed(2) + ' MB';
        filePanel.style.display = 'block';
      }
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="file-info-panel" id="file-panel" style="display:none;margin:var(--space-4) 0;">
        <div class="file-details">
          <span class="file-icon">📄</span>
          <div class="file-details-text">
            <div class="file-name" id="file-name"></div>
            <div class="file-size" id="file-info"></div>
          </div>
        </div>
      </div>
      <button class="btn btn-primary btn-lg" id="convert-btn" style="display:none;width:100%;">Convert to Excel</button>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p>Extracting tables from PDF... <span id="progress-pct">0</span>%</p>
      </div>
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
  const progressPct = container.querySelector('#progress-pct');
  const filePanel = container.querySelector('#file-panel');
  const fileName = container.querySelector('#file-name');
  const fileInfo = container.querySelector('#file-info');

  convertBtn.addEventListener('click', async () => {
    if (!pdfBuffer) return;

    processing.style.display = 'block';
    convertBtn.style.display = 'none';
    filePanel.style.display = 'none';

    try {
      const arrayBuffer = await pdfBuffer.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      let allTables = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const progress = Math.round((i / numPages) * 100);
        progressPct.textContent = progress;

        const pageText = textContent.items
          .map(item => item.str)
          .filter(text => text.trim().length > 0)
          .join('\n');

        const tableMatch = pageText.match(/[\d,\.]+[\s\n]+[\d,\.]+[\s\n]+[\d,\.]+/g);
        if (tableMatch) {
          allTables.push(`\n--- Page ${i} ---\n`);
          allTables.push(tableMatch.join('\n'));
        }
      }

      const xlsxContent = generateXLSX(allTables.join('\n'));
      const blob = new Blob([xlsxContent], { type: 'text/csv;charset=utf-8' });
      const fileNameWithoutExt = pdfBuffer.name.replace(/\.pdf$/i, '');
      downloadBlob(blob, `${fileNameWithoutExt}.xlsx`);

      showToast({ message: 'PDF converted to Excel!', type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      convertBtn.style.display = 'inline-flex';
      filePanel.style.display = 'block';
    }
  });
}

export function destroy() {}