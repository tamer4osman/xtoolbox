import { PDFDocument } from 'pdf-lib';
import { showToast } from '../../components/toast.js';
import { loadPdf, savePdf, copyPages } from './pdf-utils.js';
import { createPdfPreview } from './pdf-preview.js';
import { createPdfPreviewTool } from './pdf-preview-tool-factory.js';

export const toolConfig = {
  id: 'delete-pdf-pages',
  name: 'Delete PDF Pages',
  category: 'pdf',
  description: 'Remove unwanted pages from a PDF document.',
  icon: '🗑️',
  accept: '.pdf',
  maxSizeMB: 100,
  keywords: ['delete pdf pages', 'remove pdf page', 'erase pdf page'],
  steps: ['Upload a PDF file', 'Select pages to delete', 'Click "Delete Selected Pages"'],
  faqs: [
    { question: 'Can I undo page deletion?', answer: 'No. Please review your selection before deleting.' }
  ]
};

export function render(container) {
  const { getFile, optionsArea, previewContainer, processing } = createPdfPreviewTool({
    container,
    async onFileLoaded(file) {
      preview = await createPdfPreview({
        file,
        selectable: true,
        onSelectionChange: (selected) => {
          deleteBtn.textContent = `Delete ${selected.length} Page${selected.length !== 1 ? 's' : ''}`;
          deleteBtn.disabled = selected.length === 0;
          deleteCount.textContent = `${selected.length} selected`;
        }
      });
      previewContainer.innerHTML = '';
      previewContainer.appendChild(preview.element);
    }
  });

  let preview = null;

  optionsArea.innerHTML = `
    <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-4);">
      <button class="btn btn-secondary btn-sm" id="select-all-btn">Select All</button>
      <button class="btn btn-secondary btn-sm" id="select-none-btn">Select None</button>
      <span id="delete-count" style="margin-left:var(--space-3);color:var(--color-text-secondary);"></span>
    </div>
    <div id="preview-container"></div>
    <button class="btn btn-danger btn-lg" id="delete-btn" style="width:100%;margin-top:var(--space-4);" disabled>Delete 0 Pages</button>
  `;

  optionsArea.querySelector('#preview-container').replaceWith(previewContainer);
  const selectAllBtn = optionsArea.querySelector('#select-all-btn');
  const selectNoneBtn = optionsArea.querySelector('#select-none-btn');
  const deleteCount = optionsArea.querySelector('#delete-count');
  const deleteBtn = optionsArea.querySelector('#delete-btn');

  selectAllBtn.addEventListener('click', () => preview?.selectAll?.());
  selectNoneBtn.addEventListener('click', () => preview?.selectNone?.());

  deleteBtn.addEventListener('click', async () => {
    const file = getFile();
    if (!file || !preview) return;
    const selected = preview.getSelectedPages();
    if (selected.length === 0) return;

    processing.style.display = 'block';
    deleteBtn.style.display = 'none';
    try {
      const srcDoc = await loadPdf(file);
      const newDoc = await PDFDocument.create();
      const allPages = Array.from({ length: srcDoc.getPageCount() }, (_, i) => i);
      const keepPages = allPages.filter(i => !selected.includes(i));
      await copyPages(srcDoc, newDoc, keepPages);
      await savePdf(newDoc, 'deleted-pages.pdf');
      showToast({ message: `${selected.length} page(s) deleted!`, type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      deleteBtn.style.display = 'inline-flex';
    }
  });
}

export function destroy() {}
