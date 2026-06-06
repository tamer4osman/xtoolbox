import { showToast } from '../../components/toast.js';
import { loadPdf, savePdf } from './pdf-utils.js';
import { rgb } from 'pdf-lib';
import { createPdfPageBrowser } from './pdf-page-browser.js';

export const toolConfig = {
  id: 'pdf-secure-redact',
  name: 'PDF Visual Redactor',
  category: 'pdf',
  description: 'Cover sensitive text in PDF pages with black rectangles. Note: this is visual redaction only — the underlying text is hidden but not permanently removed from the file.',
  icon: '🔒',
  accept: '.pdf',
  maxSizeMB: 100,
  keywords: ['pdf redact', 'redact pdf', 'black out pdf', 'cover text pdf', 'visual redaction'],
  steps: [
    'Upload a PDF file',
    'For each page, click and drag to draw black rectangles over sensitive content',
    'Click a rectangle to select it, then press Delete to remove it',
    'Click "Apply Redactions" to permanently black out all selected areas',
    'Download your redacted PDF'
  ],
  faqs: [
    {
      question: 'Is this destructive redaction?',
      answer: 'No. This is visual redaction only — it draws opaque black rectangles over selected areas. The underlying text is hidden but still technically present in the PDF file. For truly destructive redaction that strips text from the content stream, use dedicated desktop software like Adobe Acrobat Pro.'
    },
    {
      question: 'Can I undo a redaction rectangle?',
      answer: 'Yes. Click on any red rectangle to select it, then press the Delete or Backspace key to remove it before applying redactions.'
    },
    {
      question: 'Are my files uploaded to a server?',
      answer: 'No. All PDF processing happens entirely in your browser using pdf-lib and PDF.js. Your files never leave your device.'
    }
  ]
};

const STYLE_CSS = `
  .page-navigation { display: flex; align-items: center; justify-content: center; gap: var(--space-4); margin-bottom: var(--space-4); }
  .page-navigation span { font-weight: 600; min-width: 120px; text-align: center; }
  .redact-canvas-container { position: relative; overflow: auto; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: #f5f5f5; padding: var(--space-2); max-height: 600px; }
  .redact-canvas-container canvas { display: block; margin: 0 auto; box-shadow: var(--shadow-md); }
  .redact-hint { text-align: center; color: var(--color-text-muted); font-size: var(--text-sm); margin-bottom: var(--space-2); }
  .redact-actions { margin-top: var(--space-4); text-align: center; }
  .redact-overlay { position: absolute; background: rgba(0,0,0,0.8); border: 2px solid #ff0000; cursor: pointer; z-index: 10; }
  .redact-overlay.selected { border-color: #00ff00; }
  .redact-overlay:hover { opacity: 0.9; }
`;

const OPTIONS_HTML = `
  <div class="page-navigation">
    <button class="btn btn-secondary" id="prev-page" disabled>Previous</button>
    <span id="page-indicator">Page 1 of 1</span>
    <button class="btn btn-secondary" id="next-page" disabled>Next</button>
  </div>
  <div class="redact-canvas-container" id="canvas-container">
    <div class="redact-hint">Click and drag to draw a redaction rectangle on the page</div>
  </div>
  <div class="redact-actions">
    <button class="btn btn-primary btn-lg" id="apply-redact-btn">Apply Redactions</button>
  </div>
`;

const RENDER_SCALE = 0.75;
const INV_SCALE = 1 / RENDER_SCALE;

let _browser = null;
let _redactionRects = [];
let _selectedRectIndex = -1;
let _isDrawing = false;
let _drawStart = null;
let _currentPageIndex = 0;
let _pageCanvasesRef = [];

export function render(container) {
  _redactionRects = [];
  _selectedRectIndex = -1;
  _isDrawing = false;
  _drawStart = null;
  _currentPageIndex = 0;
  _pageCanvasesRef = [];

  _browser = createPdfPageBrowser({
    container,
    optionsHTML: OPTIONS_HTML,
    styleCSS: STYLE_CSS,
    actionButtonSelector: '#apply-redact-btn',
    renderScale: RENDER_SCALE,
    initialProcessingMessage: 'Processing PDF...',

    onPagesLoaded: (canvases) => {
      _pageCanvasesRef = canvases;
      _redactionRects = new Array(canvases.length).fill(null).map(() => []);
      _currentPageIndex = 0;
      _selectedRectIndex = -1;
      renderPage(0);
      updateNavigation();
    },

    onReset: () => {
      _redactionRects = [];
      _selectedRectIndex = -1;
      _currentPageIndex = 0;
      _pageCanvasesRef = [];
      container.querySelector('#canvas-container').innerHTML = '';
    },

    onAction: async (api) => {
      const totalRects = _redactionRects.reduce((sum, r) => sum + r.length, 0);
      if (totalRects === 0) {
        showToast({ message: 'No redaction rectangles drawn. Drag on the page to create one.', type: 'warning' });
        return;
      }

      api.showProcessing('Applying redactions to PDF...');
      try {
        const pdfDoc = await loadPdf(api.file);
        const pages = pdfDoc.getPages();

        for (let i = 0; i < pages.length && i < _redactionRects.length; i++) {
          const rects = _redactionRects[i];
          const page = pages[i];
          const { height } = page.getSize();

          for (const rect of rects) {
            page.drawRectangle({
              x: rect.x * INV_SCALE,
              y: height - (rect.y + rect.h) * INV_SCALE,
              width: rect.w * INV_SCALE,
              height: rect.h * INV_SCALE,
              color: rgb(0, 0, 0),
              opacity: 1
            });
          }
        }

        await savePdf(pdfDoc, 'redacted.pdf');
        showToast({ message: `Redacted ${totalRects} area(s) successfully!`, type: 'success' });
      } catch (err) {
        showToast({ message: 'Error: ' + err.message, type: 'error' });
      } finally {
        api.hideProcessing();
      }
    }
  });

  const canvasContainer = container.querySelector('#canvas-container');
  const pageIndicator = container.querySelector('#page-indicator');
  const prevBtn = container.querySelector('#prev-page');
  const nextBtn = container.querySelector('#next-page');

  function createOverlayDiv(rect, i, wrapper) {
    const div = document.createElement('div');
    div.className = 'redact-overlay' + (i === _selectedRectIndex ? ' selected' : '');
    div.style.left = rect.x + 'px';
    div.style.top = rect.y + 'px';
    div.style.width = rect.w + 'px';
    div.style.height = rect.h + 'px';
    div.dataset.index = i;
    div.addEventListener('click', (e) => {
      e.stopPropagation();
      _selectedRectIndex = Number.parseInt(e.currentTarget.dataset.index);
      wrapper.querySelectorAll('.redact-overlay').forEach(el => el.classList.remove('selected'));
      e.currentTarget.classList.add('selected');
    });
    return div;
  }

  function handleMouseDown(e, canvas, wrapper) {
    if (e.target !== canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    _drawStart = { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
    _isDrawing = true;
    _selectedRectIndex = -1;
    wrapper.querySelectorAll('.redact-overlay').forEach(el => el.classList.remove('selected'));
  }

  function handleMouseMove(e, canvas, overlayPreview) {
    if (!_isDrawing || !_drawStart) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const curX = (e.clientX - rect.left) * scaleX;
    const curY = (e.clientY - rect.top) * scaleY;
    overlayPreview.style.display = 'block';
    overlayPreview.style.left = Math.min(_drawStart.x, curX) + 'px';
    overlayPreview.style.top = Math.min(_drawStart.y, curY) + 'px';
    overlayPreview.style.width = Math.abs(curX - _drawStart.x) + 'px';
    overlayPreview.style.height = Math.abs(curY - _drawStart.y) + 'px';
  }

  function handleMouseUp(e, canvas, overlayPreview, index) {
    if (!_isDrawing || !_drawStart) return;
    _isDrawing = false;
    overlayPreview.style.display = 'none';
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const endX = (e.clientX - rect.left) * scaleX;
    const endY = (e.clientY - rect.top) * scaleY;
    const w = Math.abs(endX - _drawStart.x);
    const h = Math.abs(endY - _drawStart.y);
    if (w > 5 && h > 5) {
      _redactionRects[index].push({
        x: Math.min(_drawStart.x, endX),
        y: Math.min(_drawStart.y, endY),
        w, h
      });
      renderPage(index);
    }
    _drawStart = null;
  }

  function handleKeyDown(e) {
    if ((e.key === 'Delete' || e.key === 'Backspace') && _selectedRectIndex >= 0) {
      const rects = _redactionRects[_currentPageIndex];
      if (rects && rects.length > _selectedRectIndex) {
        rects.splice(_selectedRectIndex, 1);
        _selectedRectIndex = -1;
        renderPage(_currentPageIndex);
      }
    }
  }

  function renderPage(index) {
    if (!_pageCanvasesRef.length || index < 0 || index >= _pageCanvasesRef.length) return;
    _currentPageIndex = index;
    canvasContainerEl.innerHTML = '';
    pageIndicator.textContent = `Page ${index + 1} of ${_pageCanvasesRef.length}`;

    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';

    const canvas = document.createElement('canvas');
    canvas.width = _pageCanvasesRef[index].width;
    canvas.height = _pageCanvasesRef[index].height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(_pageCanvasesRef[index], 0, 0);
    canvas.style.maxWidth = '100%';
    wrapper.appendChild(canvas);

    const rects = _redactionRects[index] || [];
    rects.forEach((rect, i) => {
      wrapper.appendChild(createOverlayDiv(rect, i, wrapper));
    });

    canvasContainerEl.appendChild(wrapper);

    const overlayPreview = document.createElement('div');
    overlayPreview.style.cssText = 'position:absolute;background:rgba(0,0,0,0.5);border:1px dashed #ff0000;display:none;pointer-events:none;z-index:20;';
    wrapper.appendChild(overlayPreview);

    canvasContainerEl.onmousedown = (e) => handleMouseDown(e, canvas, wrapper);
    canvasContainerEl.onmousemove = (e) => handleMouseMove(e, canvas, overlayPreview);
    canvasContainerEl.onmouseup = (e) => handleMouseUp(e, canvas, overlayPreview, index);
    document.addEventListener('keydown', handleKeyDown);
  }

  function updateNavigation() {
    prevBtn.disabled = _currentPageIndex <= 0;
    nextBtn.disabled = _currentPageIndex >= _pageCanvasesRef.length - 1;
  }

  prevBtn.addEventListener('click', () => {
    if (_currentPageIndex > 0) renderPage(_currentPageIndex - 1);
    updateNavigation();
  });

  nextBtn.addEventListener('click', () => {
    if (_currentPageIndex < _pageCanvasesRef.length - 1) renderPage(_currentPageIndex + 1);
    updateNavigation();
  });
}

export function destroy() {
  _redactionRects = [];
  _selectedRectIndex = -1;
  _isDrawing = false;
  _drawStart = null;
  _currentPageIndex = 0;
  _pageCanvasesRef = [];
  if (_browser) {
    _browser.destroy();
    _browser = null;
  }
}
