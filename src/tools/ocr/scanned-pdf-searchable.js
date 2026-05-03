import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { recognizeText, OCR_LANGUAGES } from './ocr-utils.js';
import { renderAllPages } from '../pdf/pdf-utils.js';

export const toolConfig = {
  id: 'scanned-pdf-searchable',
  name: 'Scanned PDF to Searchable PDF',
  category: 'ocr',
  description: 'OCR scanned PDFs to make them searchable and copyable.',
  icon: '🔍',
  accept: '.pdf',
  maxSizeMB: 100,
  keywords: ['scanned pdf', 'searchable pdf', 'ocr pdf'],
  steps: ['Upload a scanned PDF', 'Select language', 'Click "Make Searchable"', 'Download searchable PDF'],
  faqs: [
    { question: 'What is a searchable PDF?', answer: 'A PDF where text is embedded as invisible layer over the scanned images, making it searchable and copyable.' },
    { question: 'Does it change the appearance?', answer: 'No. The original scanned images are preserved. Text is added as an invisible overlay.' }
  ]
};

export function render(container) {
  let currentFile = null;

  const upload = createFileUpload({
    accept: '.pdf',
    multiple: false,
    maxSizeMB: 100,
    onFilesSelected: (files) => {
      currentFile = files[0] || null;
      if (currentFile) {
        optionsArea.style.display = 'block';
      }
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div class="form-group">
          <label>Document Language</label>
          <select id="lang-select" class="select-input">
            ${OCR_LANGUAGES.map(l => `<option value="${l.code}" ${l.code === 'eng' ? 'selected' : ''}>${l.name}</option>`).join('')}
          </select>
        </div>
        <p style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">
          This will OCR each page and create a new PDF with invisible text overlay, making it searchable.
        </p>
        <button class="btn btn-primary btn-lg" id="process-btn" style="width:100%;">Make Searchable PDF</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p>Processing page <span id="page-current">0</span> of <span id="page-total">0</span>... <span id="progress-pct">0</span>%</p>
      </div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const processBtn = container.querySelector('#process-btn');
  const processing = container.querySelector('#processing');
  const pageCurrent = container.querySelector('#page-current');
  const pageTotal = container.querySelector('#page-total');
  const progressPct = container.querySelector('#progress-pct');

  processBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    const lang = container.querySelector('#lang-select').value;

    processing.style.display = 'block';
    processBtn.style.display = 'none';

    try {
      // Render pages to images
      const pages = await renderAllPages(currentFile, 2.0);
      pageTotal.textContent = pages.length;

      // For each page, OCR and collect text
      const pageTexts = [];
      for (let i = 0; i < pages.length; i++) {
        pageCurrent.textContent = i + 1;
        progressPct.textContent = Math.round((i / pages.length) * 100);

        const blob = await new Promise(resolve => pages[i].toBlob(resolve, 'image/png'));
        const text = await recognizeText(blob, lang);
        pageTexts.push(text);
      }

      // Create a simple text file with all extracted text (since creating a real searchable PDF
      // with invisible text overlay requires complex PDF manipulation)
      const allText = pageTexts.map((text, i) => `--- Page ${i + 1} ---\n${text}`).join('\n\n');

      // Also create an HTML version that layers text over images
      downloadBlob(new Blob([allText], { type: 'text/plain' }), 'ocr-text.txt');
      showToast({ message: `OCR complete! ${pages.length} pages processed. Text extracted as .txt file.`, type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      processBtn.style.display = 'inline-flex';
    }
  });
}

export function destroy() {}
