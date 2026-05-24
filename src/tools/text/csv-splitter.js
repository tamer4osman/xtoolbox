import Papa from 'papaparse';
import JSZip from 'jszip';
import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob, formatFileSize } from '../../utils/file.js';

export function splitCsvData(data, rowsPerFile) {
  const files = [];
  for (let i = 0; i < data.length; i += rowsPerFile) {
    files.push(data.slice(i, i + rowsPerFile));
  }
  return files;
}

export function generateCsvText(headers, rows) {
  const esc = v => {
    const s = v == null ? '' : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const headerLine = headers.map(esc).join(',');
  const bodyLines = rows.map(r => headers.map(h => esc(r[h])).join(','));
  return headerLine + '\n' + bodyLines.join('\n');
}

export const toolConfig = {
  id: 'csv-splitter',
  name: 'CSV Splitter',
  category: 'text',
  description: 'Split large CSV files into smaller files by row count. All files are packaged in a ZIP.',
  icon: '✂️',
  accept: '.csv',
  maxSizeMB: 50,
  keywords: ['csv splitter', 'split csv', 'divide csv', 'csv chunks'],
  steps: ['Upload a large CSV', 'Choose rows per file', 'Click "Split"', 'Download ZIP'],
  faqs: [
    { question: 'What happens to the headers?', answer: 'Headers are included in every split file so each file is self-contained.' },
    { question: 'What if rows don\'t divide evenly?', answer: 'The last file will have fewer rows — that\'s normal.' }
  ]
};

export function render(container) {
  let currentFile = null;
  let parsedHeaders = [];
  let parsedData = [];

  const upload = createFileUpload({
    accept: '.csv',
    multiple: false,
    maxSizeMB: 50,
    onFilesSelected: async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      fileInfo.textContent = `${currentFile.name} — ${formatFileSize(currentFile.size)}`;

      const text = await currentFile.text();
      const result = Papa.parse(text, { header: true, skipEmptyLines: true });

      if (result.data.length === 0) {
        showToast({ message: 'No data rows found in CSV', type: 'error' });
        return;
      }

      parsedHeaders = result.meta.fields || [];
      parsedData = result.data;
      rowCount.textContent = `${parsedData.length} data rows, ${parsedHeaders.length} columns`;
      optionsArea.style.display = 'block';
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div id="file-info" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">-</div>
        <div id="row-count" style="font-size:var(--text-sm);color:var(--color-text-muted);margin-bottom:var(--space-4);"></div>
        <div class="form-group">
          <label>Rows per file</label>
          <select id="rows-select" class="select-input">
            <option value="100">100 rows</option>
            <option value="500" selected>500 rows</option>
            <option value="1000">1,000 rows</option>
            <option value="5000">5,000 rows</option>
            <option value="10000">10,000 rows</option>
            <option value="custom">Custom...</option>
          </select>
        </div>
        <div class="form-group" id="custom-rows-group" style="display:none;">
          <label>Custom row count</label>
          <input type="number" id="custom-rows-input" class="text-input" value="250" min="1" max="100000">
        </div>
        <div id="split-preview" style="font-size:var(--text-xs);color:var(--color-text-muted);margin-bottom:var(--space-4);"></div>
        <button class="btn btn-primary btn-lg" id="convert-btn" style="width:100%;">Split CSV</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p>Splitting and zipping...</p>
      </div>
      <div class="tool-results" id="results" style="display:none;text-align:center;">
        <div id="result-info" style="margin:var(--space-4) 0;font-size:var(--text-sm);color:var(--color-text-secondary);"></div>
        <button class="btn btn-primary btn-lg" id="download-btn">Download ZIP</button>
      </div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const fileInfo = container.querySelector('#file-info');
  const rowCount = container.querySelector('#row-count');
  const rowsSelect = container.querySelector('#rows-select');
  const customRowsGroup = container.querySelector('#custom-rows-group');
  const customRowsInput = container.querySelector('#custom-rows-input');
  const splitPreview = container.querySelector('#split-preview');
  const convertBtn = container.querySelector('#convert-btn');
  const processing = container.querySelector('#processing');
  const results = container.querySelector('#results');
  const resultInfo = container.querySelector('#result-info');
  const downloadBtn = container.querySelector('#download-btn');
  let zipBlob = null;

  rowsSelect.addEventListener('change', () => {
    customRowsGroup.style.display = rowsSelect.value === 'custom' ? 'block' : 'none';
    updatePreview();
  });

  function updatePreview() {
    if (parsedData.length === 0) return;
    const rpf = rowsSelect.value === 'custom' ? parseInt(customRowsInput.value, 10) || 500 : parseInt(rowsSelect.value, 10);
    const count = Math.ceil(parsedData.length / rpf);
    splitPreview.textContent = `→ Will create ${count} file(s)`;
  }

  convertBtn.addEventListener('click', async () => {
    if (parsedData.length === 0) return;
    const rpf = rowsSelect.value === 'custom' ? parseInt(customRowsInput.value, 10) : parseInt(rowsSelect.value, 10);
    if (!rpf || rpf < 1) {
      showToast({ message: 'Enter a valid row count', type: 'error' });
      return;
    }

    processing.style.display = 'block';
    convertBtn.style.display = 'none';
    results.style.display = 'none';

    await new Promise(r => setTimeout(r, 50));

    try {
      const chunks = splitCsvData(parsedData, rpf);
      const zip = new JSZip();
      const baseName = currentFile.name.replace(/\.csv$/i, '');

      for (let i = 0; i < chunks.length; i++) {
        const csvText = generateCsvText(parsedHeaders, chunks[i]);
        zip.file(`${baseName}_part_${i + 1}.csv`, csvText);
      }

      const zipData = await zip.generateAsync({ type: 'blob' });
      zipBlob = zipData;
      resultInfo.textContent = `Split into ${chunks.length} files (${formatFileSize(zipData.size)} zip)`;
      results.style.display = 'block';
      showToast({ message: 'CSV split into ' + chunks.length + ' files!', type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      convertBtn.style.display = 'inline-flex';
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (zipBlob) downloadBlob(zipBlob, currentFile.name.replace(/\.csv$/i, '_split.zip'));
  });
}

export function destroy() {}
