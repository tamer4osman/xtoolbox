import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { copyToClipboard } from '../../utils/clipboard.js';
import { downloadBlob } from '../../utils/file.js';
import { recognizeText, OCR_LANGUAGES } from './ocr-utils.js';

export const toolConfig = {
  id: 'image-to-text',
  name: 'Image to Text (OCR)',
  category: 'ocr',
  description: 'Extract text from images using OCR. Supports 100+ languages.',
  icon: '📝',
  accept: 'image/*',
  maxSizeMB: 20,
  keywords: ['image to text', 'ocr', 'extract text from image'],
  steps: ['Upload an image', 'Select language', 'Click "Extract Text"', 'Copy or download the text'],
  faqs: [
    { question: 'What image formats work?', answer: 'JPG, PNG, WebP, BMP, GIF — any image your browser can display.' },
    { question: 'How accurate is OCR?', answer: 'Accuracy depends on image quality. Clear, well-lit text gives the best results.' }
  ]
};

export function render(container) {
  let currentFile = null;

  const upload = createFileUpload({
    accept: 'image/*',
    multiple: false,
    maxSizeMB: 20,
    onFilesSelected: (files) => {
      currentFile = files[0] || null;
      if (currentFile) {
        previewArea.innerHTML = `<img src="${URL.createObjectURL(currentFile)}" style="max-width:100%;max-height:300px;border-radius:var(--radius-md);border:1px solid var(--color-border);margin:var(--space-4) 0;">`;
        optionsArea.style.display = 'block';
      }
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div id="preview-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div class="form-group">
          <label>Language</label>
          <select id="lang-select" class="select-input">
            ${OCR_LANGUAGES.map(l => `<option value="${l.code}" ${l.code === 'eng' ? 'selected' : ''}>${l.name}</option>`).join('')}
          </select>
        </div>
        <button class="btn btn-primary btn-lg" id="extract-btn" style="width:100%;">Extract Text</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p>Recognizing text... <span id="progress-pct">0</span>%</p>
      </div>
      <div id="results-area" style="display:none;margin-top:var(--space-6);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4);">
          <h3 style="font-size:var(--text-lg);font-weight:600;">Extracted Text</h3>
          <div style="display:flex;gap:var(--space-2);">
            <button class="btn btn-sm btn-secondary" id="copy-btn">📋 Copy</button>
            <button class="btn btn-sm btn-secondary" id="download-btn">⬇️ Download .txt</button>
          </div>
        </div>
        <pre id="text-output" style="background:var(--color-surface);padding:var(--space-4);border-radius:var(--radius-md);white-space:pre-wrap;word-break:break-word;font-size:var(--text-sm);line-height:1.6;max-height:400px;overflow-y:auto;border:1px solid var(--color-border);"></pre>
      </div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const previewArea = container.querySelector('#preview-area');
  const extractBtn = container.querySelector('#extract-btn');
  const processing = container.querySelector('#processing');
  const progressPct = container.querySelector('#progress-pct');
  const resultsArea = container.querySelector('#results-area');
  const textOutput = container.querySelector('#text-output');
  const copyBtn = container.querySelector('#copy-btn');
  const downloadBtn = container.querySelector('#download-btn');
  let extractedText = '';

  extractBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    const lang = container.querySelector('#lang-select').value;

    processing.style.display = 'block';
    extractBtn.style.display = 'none';
    resultsArea.style.display = 'none';

    try {
      extractedText = await recognizeText(currentFile, lang, (pct) => {
        progressPct.textContent = pct;
      });

      textOutput.textContent = extractedText || '(No text found)';
      resultsArea.style.display = 'block';
      showToast({ message: 'Text extracted!', type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      extractBtn.style.display = 'inline-flex';
    }
  });

  copyBtn.addEventListener('click', async () => {
    await copyToClipboard(extractedText);
    showToast({ message: 'Copied!', type: 'success' });
  });

  downloadBtn.addEventListener('click', () => {
    downloadBlob(new Blob([extractedText], { type: 'text/plain' }), 'extracted-text.txt');
  });
}

export function destroy() {}
