import { rgb, StandardFonts } from 'pdf-lib';
import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { loadPdf, savePdf } from './pdf-utils.js';

export const toolConfig = {
  id: 'page-numbers-pdf',
  name: 'Add Page Numbers to PDF',
  category: 'pdf',
  description: 'Add page numbers to every page of a PDF.',
  icon: '🔢',
  accept: '.pdf',
  maxSizeMB: 100,
  keywords: ['page numbers pdf', 'number pdf pages', 'pdf pagination'],
  steps: ['Upload a PDF file', 'Choose position and start number', 'Click "Add Page Numbers"', 'Download the PDF'],
  faqs: [
    { question: 'Can I start from a custom number?', answer: 'Yes. You can set any starting number.' },
    { question: 'Where can I place the page numbers?', answer: 'Bottom-center, bottom-right, top-center, or top-right.' }
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
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
          <div class="form-group">
            <label>Position</label>
            <select id="pn-position" class="select-input">
              <option value="bottom-center" selected>Bottom Center</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="top-center">Top Center</option>
              <option value="top-right">Top Right</option>
            </select>
          </div>
          <div class="form-group">
            <label>Start Number</label>
            <input type="number" id="pn-start" class="text-input" value="1" min="1">
          </div>
        </div>
        <div class="form-group">
          <label>Font Size</label>
          <select id="pn-size" class="select-input">
            <option value="10">Small (10)</option>
            <option value="12" selected>Medium (12)</option>
            <option value="16">Large (16)</option>
          </select>
        </div>
        <button class="btn btn-primary btn-lg" id="apply-btn" style="width:100%;">Add Page Numbers</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Adding page numbers...</p></div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const applyBtn = container.querySelector('#apply-btn');
  const processing = container.querySelector('#processing');

  applyBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    processing.style.display = 'block';
    applyBtn.style.display = 'none';

    try {
      const pdfDoc = await loadPdf(currentFile);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const position = container.querySelector('#pn-position').value;
      const startNum = parseInt(container.querySelector('#pn-start').value) || 1;
      const fontSize = parseInt(container.querySelector('#pn-size').value) || 12;

      const pages = pdfDoc.getPages();
      pages.forEach((page, i) => {
        const { width, height } = page.getSize();
        const text = String(startNum + i);
        const textWidth = font.widthOfTextAtSize(text, fontSize);

        let x, y;
        if (position.includes('right')) {
          x = width - textWidth - 40;
        } else {
          x = (width - textWidth) / 2;
        }
        if (position.includes('top')) {
          y = height - 30;
        } else {
          y = 20;
        }

        page.drawText(text, { x, y, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
      });

      await savePdf(pdfDoc, 'numbered.pdf');
      showToast({ message: 'Page numbers added!', type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      applyBtn.style.display = 'inline-flex';
    }
  });
}

export function destroy() {}
