import { showToast } from '../../components/toast.js';
import { copyToClipboard } from '../../utils/clipboard.js';
import { downloadBlob } from '../../utils/file.js';
import { recognizeText, OCR_LANGUAGES } from './ocr-utils.js';

export const toolConfig = {
  id: 'screenshot-to-text',
  name: 'Screenshot to Text',
  category: 'ocr',
  description: 'Paste a screenshot or image from clipboard and extract text.',
  icon: '📋',
  accept: 'image/*',
  maxSizeMB: 20,
  keywords: ['screenshot to text', 'clipboard ocr', 'paste image text'],
  steps: ['Take a screenshot (Print Screen)', 'Paste it here (Ctrl+V)', 'Select language', 'Extract text'],
  faqs: [
    { question: 'How do I paste a screenshot?', answer: 'Take a screenshot with Print Screen or Snipping Tool, then press Ctrl+V in this page.' },
    { question: 'Can I also upload an image?', answer: 'Yes! You can paste from clipboard or upload a file.' }
  ]
};

export function render(container) {
  let imageBlob = null;

  container.innerHTML = `
    <div class="tool-layout">
      <div id="paste-area" style="border:2px dashed var(--color-border);border-radius:var(--radius-lg);padding:var(--space-10) var(--space-6);text-align:center;cursor:pointer;transition:border-color 0.2s,background 0.2s;background:var(--color-surface);">
        <div style="font-size:3rem;margin-bottom:var(--space-4);">📋</div>
        <p style="font-size:var(--text-lg);font-weight:500;margin-bottom:var(--space-2);">Paste an image here (Ctrl+V)</p>
        <p style="font-size:var(--text-sm);color:var(--color-text-muted);margin-bottom:var(--space-4);">or click to upload a file</p>
        <input type="file" id="file-input" accept="image/*" style="display:none;">
        <button class="btn btn-secondary" id="upload-btn">Browse Files</button>
      </div>
      <div id="preview-area" style="display:none;text-align:center;margin:var(--space-4) 0;"></div>
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
            <button class="btn btn-sm btn-secondary" id="download-btn">⬇️ Download</button>
          </div>
        </div>
        <pre id="text-output" style="background:var(--color-surface);padding:var(--space-4);border-radius:var(--radius-md);white-space:pre-wrap;word-break:break-word;font-size:var(--text-sm);line-height:1.6;max-height:400px;overflow-y:auto;border:1px solid var(--color-border);"></pre>
      </div>
    </div>
  `;

  const pasteArea = container.querySelector('#paste-area');
  const fileInput = container.querySelector('#file-input');
  const uploadBtn = container.querySelector('#upload-btn');
  const previewArea = container.querySelector('#preview-area');
  const optionsArea = container.querySelector('#options-area');
  const extractBtn = container.querySelector('#extract-btn');
  const processing = container.querySelector('#processing');
  const progressPct = container.querySelector('#progress-pct');
  const resultsArea = container.querySelector('#results-area');
  const textOutput = container.querySelector('#text-output');
  const copyBtn = container.querySelector('#copy-btn');
  const downloadBtn = container.querySelector('#download-btn');
  let extractedText = '';

  function handleImage(blob) {
    imageBlob = blob;
    previewArea.innerHTML = `<img src="${URL.createObjectURL(blob)}" style="max-width:100%;max-height:300px;border-radius:var(--radius-md);border:1px solid var(--color-border);">`;
    previewArea.style.display = 'block';
    optionsArea.style.display = 'block';
    pasteArea.style.display = 'none';
  }

  // Paste handler
  document.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        handleImage(item.getAsFile());
        return;
      }
    }
  });

  // Click to upload
  pasteArea.addEventListener('click', () => fileInput.click());
  uploadBtn.addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) handleImage(fileInput.files[0]);
  });

  // Drag and drop
  pasteArea.addEventListener('dragover', (e) => { e.preventDefault(); pasteArea.style.borderColor = 'var(--color-primary)'; pasteArea.style.background = 'var(--color-primary-light)'; });
  pasteArea.addEventListener('dragleave', () => { pasteArea.style.borderColor = 'var(--color-border)'; pasteArea.style.background = 'var(--color-surface)'; });
  pasteArea.addEventListener('drop', (e) => {
    e.preventDefault();
    pasteArea.style.borderColor = 'var(--color-border)';
    pasteArea.style.background = 'var(--color-surface)';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleImage(file);
  });

  extractBtn.addEventListener('click', async () => {
    if (!imageBlob) return;
    const lang = container.querySelector('#lang-select').value;

    processing.style.display = 'block';
    extractBtn.style.display = 'none';
    resultsArea.style.display = 'none';

    try {
      extractedText = await recognizeText(imageBlob, lang, (pct) => {
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
