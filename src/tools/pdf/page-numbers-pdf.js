import { rgb, StandardFonts } from 'pdf-lib';
import { showToast } from '../../components/toast.js';
import { createPdfOverlayTool } from './pdf-overlay-tool-factory.js';

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
  const { applyBtn, process } = createPdfOverlayTool({
    container,
    optionsHtml: `
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
    `
  });

  applyBtn.textContent = 'Add Page Numbers';

  applyBtn.addEventListener('click', () => {
    process('numbered.pdf', async (pdfDoc) => {
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const position = container.querySelector('#pn-position').value;
      const startNum = parseInt(container.querySelector('#pn-start').value) || 1;
      const fontSize = parseInt(container.querySelector('#pn-size').value) || 12;

      pdfDoc.getPages().forEach((page, i) => {
        const { width, height } = page.getSize();
        const text = String(startNum + i);
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        let x = position.includes('right') ? width - textWidth - 40 : (width - textWidth) / 2;
        let y = position.includes('top') ? height - 30 : 20;
        page.drawText(text, { x, y, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
      });
      showToast({ message: 'Page numbers added!', type: 'success' });
    }).catch(err => showToast({ message: 'Error: ' + err.message, type: 'error' }));
  });
}

export function destroy() {}
