import { readSheet } from 'read-excel-file/browser';
import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob, formatFileSize } from '../../utils/file.js';

export function convertSheetToXml(rows) {
  if (rows.length === 0) return '<root/>';
  const headers = rows[0].map(h => h != null ? String(h) : '');
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    xml += '  <row>\n';
    for (let j = 0; j < headers.length; j++) {
      const val = row[j] != null ? String(row[j]).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;') : '';
      const key = headers[j].replace(/[^a-zA-Z0-9_-]/g, '_');
      xml += `    <${key}>${val}</${key}>\n`;
    }
    xml += '  </row>\n';
  }
  xml += '</root>';
  return xml;
}

export const toolConfig = {
  id: 'excel-to-xml',
  name: 'Excel to XML',
  category: 'text',
  description: 'Convert Excel spreadsheets (.xlsx) to XML format. Each row becomes an XML element.',
  icon: '📊',
  accept: '.xlsx,.xls',
  maxSizeMB: 10,
  keywords: ['excel to xml', 'xlsx to xml', 'spreadsheet to xml', 'convert excel'],
  steps: ['Upload an Excel file', 'Select sheet', 'Click "Convert"', 'Download XML'],
  faqs: [
    { question: 'How are rows converted?', answer: 'Each row becomes a <row> element with columns as child elements. Column names are used as tag names.' },
    { question: 'What about special characters?', answer: 'All special characters are properly XML-escaped.' }
  ]
};

export function render(container) {
  let sheets = null;
  let currentFile = null;

  const upload = createFileUpload({
    accept: '.xlsx,.xls',
    multiple: false,
    maxSizeMB: 10,
    onFilesSelected: async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      fileInfo.textContent = `${currentFile.name} — ${formatFileSize(currentFile.size)}`;

      const data = await currentFile.arrayBuffer();
      sheets = await readSheet(data);

      const sheetSelect = container.querySelector('#sheet-select');
      sheetSelect.innerHTML = sheets.map((s, i) => `<option value="${i}">${s.sheet}</option>`).join('');
      sheetSelect.style.display = sheets.length > 1 ? 'block' : 'none';
      sheetLabel.style.display = sheets.length > 1 ? 'block' : 'none';

      sheetInfo.textContent = `${sheets.length} sheet(s) found`;
      optionsArea.style.display = 'block';
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div id="file-info" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">-</div>
        <div id="sheet-info" style="font-size:var(--text-sm);color:var(--color-text-muted);margin-bottom:var(--space-4);"></div>
        <div class="form-group" id="sheet-label" style="display:none;">
          <label>Sheet</label>
          <select id="sheet-select" class="select-input"></select>
        </div>
        <button class="btn btn-primary btn-lg" id="convert-btn" style="width:100%;">Convert to XML</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p>Converting...</p>
      </div>
      <div class="tool-results" id="results" style="display:none;">
        <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-bottom:var(--space-2);">Preview (first 50 lines):</div>
        <pre id="xml-preview" style="max-height:300px;overflow:auto;background:var(--color-bg-secondary);padding:var(--space-3);border-radius:var(--radius-md);border:1px solid var(--color-border);font-size:var(--text-xs);white-space:pre-wrap;"></pre>
        <div style="display:flex;gap:var(--space-2);margin-top:var(--space-4);justify-content:center;">
          <button class="btn btn-secondary" id="copy-btn">Copy XML</button>
          <button class="btn btn-primary btn-lg" id="download-btn">Download XML</button>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const fileInfo = container.querySelector('#file-info');
  const sheetInfo = container.querySelector('#sheet-info');
  const sheetLabel = container.querySelector('#sheet-label');
  const convertBtn = container.querySelector('#convert-btn');
  const processing = container.querySelector('#processing');
  const results = container.querySelector('#results');
  const xmlPreview = container.querySelector('#xml-preview');
  const copyBtn = container.querySelector('#copy-btn');
  const downloadBtn = container.querySelector('#download-btn');
  let xmlOutput = '';

  convertBtn.addEventListener('click', () => {
    if (!sheets) return;
    const sheetIdx = parseInt(container.querySelector('#sheet-select')?.value || '0');
    const rows = sheets[sheetIdx].data;

    processing.style.display = 'block';
    convertBtn.style.display = 'none';
    results.style.display = 'none';

    setTimeout(() => {
      try {
        xmlOutput = convertSheetToXml(rows);
        const lines = xmlOutput.split('\n');
        xmlPreview.textContent = lines.slice(0, 50).join('\n') + (lines.length > 50 ? '\n...' : '');
        results.style.display = 'block';
        showToast({ message: 'Converted to XML!', type: 'success' });
      } catch (err) {
        showToast({ message: 'Error: ' + err.message, type: 'error' });
      } finally {
        processing.style.display = 'none';
        convertBtn.style.display = 'inline-flex';
      }
    }, 50);
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(xmlOutput).then(() => {
      showToast({ message: 'XML copied!', type: 'success' });
    });
  });

  downloadBtn.addEventListener('click', () => {
    if (xmlOutput) downloadBlob(new Blob([xmlOutput], { type: 'application/xml' }), currentFile.name.replace(/\.\w+$/, '.xml'));
  });
}

export function destroy() {}
