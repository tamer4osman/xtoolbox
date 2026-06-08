import { PDFDocument } from 'pdf-lib';
import { showToast } from '../../components/toast.js';
import { loadPdf, savePdf, copyPages } from './pdf-utils.js';
import { createPdfPreview } from './pdf-preview.js';
import { createPdfPreviewTool } from './pdf-preview-tool-factory.js';

export const toolConfig = {
  id: 'rotate-pdf',
  name: 'Rotate PDF',
  category: 'pdf',
  description: 'Rotate pages in a PDF document.',
  icon: '🔄',
  accept: '.pdf',
  maxSizeMB: 100,
  keywords: ['rotate pdf', 'pdf rotation', 'turn pdf page'],
  steps: ['Upload a PDF file', 'Click pages to rotate them', 'Click "Save"'],
  faqs: [
    { question: 'Can I rotate all pages at once?', answer: 'Click "Rotate All 90°" to rotate every page.' }
  ]
};

export function render(container) {
  const { getFile, optionsArea, previewContainer, processing } = createPdfPreviewTool({
    container,
    async onFileLoaded(file) {
      preview = await createPdfPreview({
        file,
        reorderable: true,
        onReorder: () => {}
      });
      previewContainer.innerHTML = '';
      previewContainer.appendChild(preview.element);
    }
  });

  let preview = null;

  optionsArea.innerHTML = `
    <div id="preview-container"></div>
    <div style="display:flex;gap:var(--space-3);margin-top:var(--space-4);">
      <button class="btn btn-secondary" id="rotate-all-btn" style="flex:1;">Rotate All 90°</button>
      <button class="btn btn-primary" id="save-btn" style="flex:1;">Download Rotated PDF</button>
    </div>
  `;

  optionsArea.querySelector('#preview-container').replaceWith(previewContainer);
  const rotateAllBtn = optionsArea.querySelector('#rotate-all-btn');
  const saveBtn = optionsArea.querySelector('#save-btn');

  rotateAllBtn.addEventListener('click', () => {
    if (!preview) return;
    const imgs = previewContainer.querySelectorAll('img');
    imgs.forEach(img => {
      const current = parseInt(img.dataset.rotation || '0');
      const next = (current + 90) % 360;
      img.dataset.rotation = next;
      img.style.transform = `rotate(${next}deg)`;
      const label = img.parentElement.querySelector('div:last-child');
      if (label) label.textContent = `Page ${parseInt(img.dataset.page)} (${next}°)`;
    });
  });

  saveBtn.addEventListener('click', async () => {
    const file = getFile();
    if (!file) return;
    processing.style.display = 'block';
    try {
      const srcDoc = await loadPdf(file);
      const newDoc = await PDFDocument.create();
      const pageOrder = preview.getPageOrder();
      await copyPages(srcDoc, newDoc, pageOrder);
      await savePdf(newDoc, 'rotated.pdf');
      showToast({ message: 'PDF rotated!', type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
    }
  });
}

export function destroy() {}
