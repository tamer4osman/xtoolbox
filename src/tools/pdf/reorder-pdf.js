import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { loadPdf, savePdf, copyPages } from './pdf-utils.js';
import { createPdfPreview } from './pdf-preview.js';

export const toolConfig = {
  id: 'reorder-pdf',
  name: 'Reorder PDF Pages',
  category: 'pdf',
  description: 'Drag and drop to reorder pages in a PDF.',
  icon: '↕️',
  accept: '.pdf',
  maxSizeMB: 100,
  keywords: ['reorder pdf', 'arrange pdf pages', 'sort pdf pages'],
  steps: ['Upload a PDF file', 'Drag pages to reorder them', 'Click "Download Reordered PDF"'],
  faqs: [
    { question: 'Can I remove pages while reordering?', answer: 'Use the Split PDF tool to extract specific pages first.' }
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
        reorderable: true,
        onReorder: () => { showToast({ message: 'Page order updated', type: 'info', duration: 1500 }); }
      });
      previewContainer.innerHTML = '';
      previewContainer.appendChild(preview.element);
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <p style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">Drag and drop pages to reorder them.</p>
        <div id="preview-container"></div>
        <button class="btn btn-primary btn-lg" id="save-btn" style="width:100%;margin-top:var(--space-4);">Download Reordered PDF</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Saving...</p></div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const previewContainer = container.querySelector('#preview-container');
  const saveBtn = container.querySelector('#save-btn');
  const processing = container.querySelector('#processing');

  saveBtn.addEventListener('click', async () => {
    if (!currentFile || !preview) return;
    processing.style.display = 'block';

    try {
      const pageOrder = preview.getPageOrder();
      const srcDoc = await loadPdf(currentFile);
      const newDoc = await PDFDocument.create();
      await copyPages(srcDoc, newDoc, pageOrder);
      await savePdf(newDoc, 'reordered.pdf');
      showToast({ message: 'PDF reordered!', type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
    }
  });
}

export function destroy() {}
