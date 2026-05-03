import { PDFDocument } from 'pdf-lib';
import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { loadPdf, copyPages, getPdfPageCount } from './pdf-utils.js';
import { createPdfPreview } from './pdf-preview.js';

export const toolConfig = {
  id: 'split-pdf',
  name: 'Split PDF',
  category: 'pdf',
  description: 'Extract specific pages or split a PDF into multiple files.',
  icon: '✂️',
  accept: '.pdf',
  maxSizeMB: 100,
  keywords: ['split pdf', 'extract pages', 'separate pdf'],
  steps: ['Upload a PDF file', 'Select the pages you want to extract', 'Click "Extract Selected Pages"', 'Download the new PDF'],
  faqs: [
    { question: 'Can I extract non-consecutive pages?', answer: 'Yes. Select any combination of pages using the checkboxes.' },
    { question: 'Does splitting reduce quality?', answer: 'No. The extracted pages maintain the exact same quality as the original.' }
  ]
};

export function render(container) {
  let currentFile = null;
  let preview = null;

  const upload = createFileUpload({
    accept: '.pdf',
    multiple: false,
    maxSizeMB: 100,
    onFilesSelected: async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      optionsArea.style.display = 'block';
      previewContainer.innerHTML = '<div style="text-align:center;padding:var(--space-8);"><div class="spinner"></div><p>Rendering pages...</p></div>';

      preview = await createPdfPreview({
        file: currentFile,
        selectable: true,
        onSelectionChange: (selected) => {
          extractBtn.textContent = `Extract ${selected.length} Page${selected.length !== 1 ? 's' : ''}`;
          extractBtn.disabled = selected.length === 0;
        }
      });
      previewContainer.innerHTML = '';
      previewContainer.appendChild(preview.element);
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div id="preview-container"></div>
        <button class="btn btn-primary btn-lg" id="extract-btn" style="width:100%;" disabled>Extract 0 Pages</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Splitting PDF...</p></div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const previewContainer = container.querySelector('#preview-container');
  const extractBtn = container.querySelector('#extract-btn');
  const processing = container.querySelector('#processing');

  extractBtn.addEventListener('click', async () => {
    if (!currentFile || !preview) return;
    const selected = preview.getSelectedPages();
    if (selected.length === 0) return;

    processing.style.display = 'block';
    extractBtn.style.display = 'none';

    try {
      const srcDoc = await loadPdf(currentFile);
      const newDoc = await PDFDocument.create();
      await copyPages(srcDoc, newDoc, selected);
      const bytes = await newDoc.save();
      downloadBlob(new Blob([bytes], { type: 'application/pdf' }), 'extracted-pages.pdf');
      showToast({ message: `${selected.length} page(s) extracted!`, type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      extractBtn.style.display = 'inline-flex';
    }
  });
}

export function destroy() {}
