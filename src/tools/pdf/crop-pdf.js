import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { loadPdf, savePdf, getPdfPageCount } from './pdf-utils.js';

export const toolConfig = {
  id: 'crop-pdf',
  name: 'Crop PDF Pages',
  category: 'pdf',
  description: 'Crop margins from PDF pages.',
  icon: '✂️',
  accept: '.pdf',
  maxSizeMB: 100,
  keywords: ['crop pdf', 'trim pdf margins', 'cut pdf'],
  steps: ['Upload a PDF file', 'Set crop margins (top, right, bottom, left in points)', 'Click "Crop PDF"', 'Download the cropped PDF'],
  faqs: [
    { question: 'What unit are the margins in?', answer: 'Margins are in PDF points (1 point = 1/72 inch). 72 points = 1 inch.' },
    { question: 'Can I crop individual pages?', answer: 'Currently all pages are cropped with the same margins.' }
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
      optionsArea.style.display = currentFile ? 'block' : 'none';
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <p style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">Set margins in points (72pt = 1 inch). These margins will be removed from each page.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
          <div class="form-group">
            <label>Top (pt)</label>
            <input type="number" id="crop-top" class="text-input" value="0" min="0">
          </div>
          <div class="form-group">
            <label>Right (pt)</label>
            <input type="number" id="crop-right" class="text-input" value="0" min="0">
          </div>
          <div class="form-group">
            <label>Bottom (pt)</label>
            <input type="number" id="crop-bottom" class="text-input" value="0" min="0">
          </div>
          <div class="form-group">
            <label>Left (pt)</label>
            <input type="number" id="crop-left" class="text-input" value="0" min="0">
          </div>
        </div>
        <div class="form-group">
          <label>Quick Presets</label>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
            <button class="btn btn-sm btn-secondary" data-preset="20,20,20,20">Small (20pt)</button>
            <button class="btn btn-sm btn-secondary" data-preset="50,50,50,50">Medium (50pt)</button>
            <button class="btn btn-sm btn-secondary" data-preset="72,72,72,72">Large (1in)</button>
            <button class="btn btn-sm btn-secondary" data-preset="0,0,0,0">Reset</button>
          </div>
        </div>
        <button class="btn btn-primary btn-lg" id="crop-btn" style="width:100%;">Crop PDF</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Cropping...</p></div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const cropBtn = container.querySelector('#crop-btn');
  const processing = container.querySelector('#processing');

  // Presets
  optionsArea.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [t, r, b, l] = btn.dataset.preset.split(',');
      container.querySelector('#crop-top').value = t;
      container.querySelector('#crop-right').value = r;
      container.querySelector('#crop-bottom').value = b;
      container.querySelector('#crop-left').value = l;
    });
  });

  cropBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    const top = parseFloat(container.querySelector('#crop-top').value) || 0;
    const right = parseFloat(container.querySelector('#crop-right').value) || 0;
    const bottom = parseFloat(container.querySelector('#crop-bottom').value) || 0;
    const left = parseFloat(container.querySelector('#crop-left').value) || 0;

    if (top === 0 && right === 0 && bottom === 0 && left === 0) {
      showToast({ message: 'Set at least one margin to crop', type: 'warning' });
      return;
    }

    processing.style.display = 'block';
    cropBtn.style.display = 'none';

    try {
      const pdfDoc = await loadPdf(currentFile);
      const pages = pdfDoc.getPages();

      pages.forEach(page => {
        const { width, height } = page.getSize();
        const newWidth = Math.max(1, width - left - right);
        const newHeight = Math.max(1, height - top - bottom);
        page.setCropBox(left, bottom, newWidth, newHeight);
      });

      await savePdf(pdfDoc, 'cropped.pdf');
      showToast({ message: `Cropped ${pages.length} page(s)!`, type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      cropBtn.style.display = 'inline-flex';
    }
  });
}

export function destroy() {}
