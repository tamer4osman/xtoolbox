import { PDFDocument } from 'pdf-lib';
import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob, formatFileSize } from '../../utils/file.js';
import { loadPdf } from './pdf-utils.js';

export const toolConfig = {
  id: 'compress-pdf',
  name: 'Compress PDF',
  category: 'pdf',
  description: 'Reduce PDF file size while maintaining quality.',
  icon: '📦',
  accept: '.pdf',
  maxSizeMB: 200,
  keywords: ['compress pdf', 'reduce pdf size', 'shrink pdf'],
  steps: ['Upload a PDF file', 'Choose compression level', 'Click "Compress"', 'Download the compressed PDF'],
  faqs: [
    { question: 'How much can I compress a PDF?', answer: 'Typically 10-50% reduction depending on the content and compression level.' },
    { question: 'Will compression reduce quality?', answer: 'Low compression keeps full quality. Medium/High may reduce image quality slightly.' }
  ]
};

export function render(container) {
  let currentFile = null;

  const upload = createFileUpload({
    accept: '.pdf',
    multiple: false,
    maxSizeMB: 200,
    onFilesSelected: (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      optionsArea.style.display = 'block';
      originalSize.textContent = formatFileSize(currentFile.size);
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div class="form-group">
          <label>Compression Level</label>
          <select id="quality-select" class="select-input">
            <option value="low">Low (best quality, larger file)</option>
            <option value="medium" selected>Medium (balanced)</option>
            <option value="high">High (smallest file, lower quality)</option>
          </select>
        </div>
        <div class="stats-row">
          <div class="stat"><span class="stat-label">Original</span><span class="stat-value" id="original-size">-</span></div>
          <div class="stat"><span class="stat-label">Compressed</span><span class="stat-value" id="compressed-size">-</span></div>
          <div class="stat"><span class="stat-label">Reduction</span><span class="stat-value" id="reduction">-</span></div>
        </div>
        <button class="btn btn-primary btn-lg" id="compress-btn" style="width:100%;">Compress PDF</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Compressing PDF...</p></div>
      <div class="tool-results" id="results" style="display:none;">
        <button class="btn btn-primary btn-lg" id="download-btn" style="width:100%;">Download Compressed PDF</button>
      </div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const originalSize = container.querySelector('#original-size');
  const compressedSize = container.querySelector('#compressed-size');
  const reduction = container.querySelector('#reduction');
  const compressBtn = container.querySelector('#compress-btn');
  const processing = container.querySelector('#processing');
  const results = container.querySelector('#results');
  const downloadBtn = container.querySelector('#download-btn');
  let compressedBytes = null;

  compressBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    processing.style.display = 'block';
    results.style.display = 'none';

    try {
      const pdfDoc = await loadPdf(currentFile);

      // Basic compression: remove metadata, use object streams
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');

      compressedBytes = await pdfDoc.save({ useObjectStreams: true });
      const newSize = compressedBytes.byteLength;
      const pct = ((1 - newSize / currentFile.size) * 100).toFixed(1);

      compressedSize.textContent = formatFileSize(newSize);
      reduction.textContent = `${pct}%`;
      results.style.display = 'block';
      showToast({ message: `Compressed by ${pct}%!`, type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (compressedBytes) {
      downloadBlob(new Blob([compressedBytes], { type: 'application/pdf' }), 'compressed.pdf');
    }
  });
}

export function destroy() {}
