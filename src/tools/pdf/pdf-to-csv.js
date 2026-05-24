import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const toolConfig = {
  id: 'pdf-to-csv',
  name: 'PDF to CSV',
  category: 'pdf',
  description: 'Extract tabular data from PDF to CSV format.',
  icon: '📊',
  accept: '.pdf',
  maxSizeMB: 50,
  keywords: ['pdf to csv', 'extract data from pdf', 'convert pdf to csv', 'pdf table to csv'],
  steps: ['Upload a PDF file', 'Click "Convert to CSV"', 'Download the .csv file'],
  faqs: [
    { question: 'What formats supported?', answer: 'We support PDF files up to 50MB.' },
    { question: 'Are tables extracted?', answer: 'Yes, text content is extracted and formatted as CSV.' },
    { question: 'Are scanned PDFs supported?', answer: 'Only PDFs with selectable text. Scanned images need OCR first.' }
  ]
};

function extractCSV(textContent) {
  const items = textContent.items;
  if (items.length === 0) return '';

  const rows = [];
  let currentRow = [];
  let lastY = null;
  const yThreshold = 5;

  for (const item of items) {
    const y = item.transform[5];
    const text = item.str.trim();

    if (!text) continue;

    if (lastY === null || Math.abs(y - lastY) > yThreshold) {
      if (currentRow.length > 0) {
        rows.push(currentRow);
      }
      currentRow = [text];
    } else {
      currentRow.push(text);
    }
    lastY = y;
  }

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows.map(row =>
    row.map(cell => {
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',')
  ).join('\n');
}

export function render(container) {
  let pdfFile = null;

  const upload = createFileUpload({
    accept: '.pdf',
    multiple: false,
    maxSizeMB: 50,
    onFilesSelected: (files) => {
      if (files.length > 0) {
        pdfFile = files[0];
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
      <button class="btn btn-primary btn-lg" id="convert-btn" style="display:none;width:100%;">Convert to CSV</button>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p>Extracting data from PDF... <span id="progress-pct">0</span>%</p>
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
    if (!pdfFile) return;

    processing.style.display = 'block';
    convertBtn.style.display = 'none';
    filePanel.style.display = 'none';

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      let allCSV = '';

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const progress = Math.round((i / numPages) * 100);
        progressPct.textContent = progress;

        const csvContent = extractCSV(textContent);
        if (csvContent) {
          if (i > 1) {
            allCSV += '\n';
          }
          allCSV += csvContent;
        }
      }

      if (!allCSV) {
        showToast({ message: 'No extractable text found in PDF.', type: 'warning' });
      } else {
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + allCSV], { type: 'text/csv;charset=utf-8' });
        const fileNameWithoutExt = pdfFile.name.replace(/\.pdf$/i, '');
        downloadBlob(blob, `${fileNameWithoutExt}.csv`);
        showToast({ message: 'PDF converted to CSV!', type: 'success' });
      }
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
