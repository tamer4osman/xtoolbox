import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { loadPdf, savePdf, renderAllPages } from './pdf-utils.js';
import { rgb } from 'pdf-lib';

export const toolConfig = {
  id: 'pdf-secure-redact',
  name: 'PDF Secure Destructive Redactor',
  category: 'pdf',
  description: 'Perform true destructive redaction by drawing black rectangles over sensitive text in PDF pages.',
  icon: '🔒',
  accept: '.pdf',
  maxSizeMB: 100,
  keywords: ['pdf redact', 'redact pdf', 'destroy text', 'remove text pdf', 'black out pdf', 'secure pdf'],
  steps: [
    'Upload a PDF file',
    'For each page, click and drag to draw black rectangles over sensitive content',
    'Click a rectangle to select it, then press Delete to remove it',
    'Click "Apply Redactions" to permanently black out all selected areas',
    'Download your redacted PDF'
  ],
  faqs: [
    {
      question: 'Is this truly destructive redaction?',
      answer: 'This tool draws opaque black rectangles over selected areas. The underlying text is visually removed but technically still present in the PDF. For truly destructive redaction that removes text from the content stream, use dedicated desktop software.'
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

let _style = null;
let pageCanvases = [];
let redactionRects = [];

export function render(container) {
  let currentFile = null;
  let selectedRectIndex = -1;
  let isDrawing = false;
  let drawStart = null;
  let currentPageIndex = 0;

  const upload = createFileUpload({
    accept: '.pdf',
    multiple: false,
    maxSizeMB: 100,
    onFilesSelected: (files) => {
      currentFile = files[0] || null;
      if (currentFile) {
        optionsArea.style.display = 'block';
        uploadArea.style.display = 'none';
        loadAndRenderPages();
      }
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
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
          <button class="btn btn-secondary" id="change-file-btn" style="margin-top:var(--space-2);">Change File</button>
        </div>
      </div>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p id="processing-text">Processing PDF...</p>
      </div>
    </div>
  `;

  const uploadArea = container.querySelector('#upload-area');
  uploadArea.appendChild(upload.element);

  const changeFileBtn = container.querySelector('#change-file-btn');

  function resetToUpload() {
    upload.clear();
    currentFile = null;
    pageCanvases = [];
    redactionRects = [];
    selectedRectIndex = -1;
    currentPageIndex = 0;
    optionsArea.style.display = 'none';
    uploadArea.style.display = '';
    canvasContainer.innerHTML = '';
  }

  changeFileBtn.addEventListener('click', resetToUpload);

  const optionsArea = container.querySelector('#options-area');
  const canvasContainer = container.querySelector('#canvas-container');
  const pageIndicator = container.querySelector('#page-indicator');
  const prevBtn = container.querySelector('#prev-page');
  const nextBtn = container.querySelector('#next-page');
  const applyBtn = container.querySelector('#apply-redact-btn');
  const processing = container.querySelector('#processing');
  const processingText = container.querySelector('#processing-text');

  _style = document.createElement('style');
  _style.textContent = `
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
  container.appendChild(_style);

  async function loadAndRenderPages() {
    try {
      const canvases = await renderAllPages(currentFile, 0.75);
      pageCanvases = canvases.filter(c => c instanceof HTMLCanvasElement);
      redactionRects = new Array(pageCanvases.length).fill(null).map(() => []);
      currentPageIndex = 0;
      selectedRectIndex = -1;
      renderPage(0);
      updateNavigation();
    } catch (err) {
      showToast({ message: 'Failed to load PDF: ' + err.message, type: 'error' });
    }
  }

  function renderPage(index) {
    if (!pageCanvases.length || index < 0 || index >= pageCanvases.length) return;
    currentPageIndex = index;
    canvasContainer.innerHTML = '';
    pageIndicator.textContent = `Page ${index + 1} of ${pageCanvases.length}`;

    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';

    const canvas = document.createElement('canvas');
    canvas.width = pageCanvases[index].width;
    canvas.height = pageCanvases[index].height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(pageCanvases[index], 0, 0);
    canvas.style.maxWidth = '100%';
    wrapper.appendChild(canvas);

    const rects = redactionRects[index] || [];
    rects.forEach((rect, i) => {
      const div = document.createElement('div');
      div.className = 'redact-overlay' + (i === selectedRectIndex ? ' selected' : '');
      div.style.left = rect.x + 'px';
      div.style.top = rect.y + 'px';
      div.style.width = rect.w + 'px';
      div.style.height = rect.h + 'px';
      div.dataset.index = i;
      div.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedRectIndex = parseInt(e.currentTarget.dataset.index);
        wrapper.querySelectorAll('.redact-overlay').forEach(el => el.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
      });
      wrapper.appendChild(div);
    });

    canvasContainer.appendChild(wrapper);

    canvasContainer.onmousedown = (e) => {
      if (e.target !== canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      drawStart = { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
      isDrawing = true;
      selectedRectIndex = -1;
      wrapper.querySelectorAll('.redact-overlay').forEach(el => el.classList.remove('selected'));
    };

    canvasContainer.onmousemove = (e) => {
      if (!isDrawing || !drawStart) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const curX = (e.clientX - rect.left) * scaleX;
      const curY = (e.clientY - rect.top) * scaleY;
      overlayPreview.style.display = 'block';
      overlayPreview.style.left = Math.min(drawStart.x, curX) + 'px';
      overlayPreview.style.top = Math.min(drawStart.y, curY) + 'px';
      overlayPreview.style.width = Math.abs(curX - drawStart.x) + 'px';
      overlayPreview.style.height = Math.abs(curY - drawStart.y) + 'px';
    };

    canvasContainer.onmouseup = (e) => {
      if (!isDrawing || !drawStart) return;
      isDrawing = false;
      overlayPreview.style.display = 'none';
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const endX = (e.clientX - rect.left) * scaleX;
      const endY = (e.clientY - rect.top) * scaleY;
      const w = Math.abs(endX - drawStart.x);
      const h = Math.abs(endY - drawStart.y);
      if (w > 5 && h > 5) {
        redactionRects[index].push({
          x: Math.min(drawStart.x, endX),
          y: Math.min(drawStart.y, endY),
          w, h
        });
        renderPage(index);
      }
      drawStart = null;
    };

    const overlayPreview = document.createElement('div');
    overlayPreview.style.cssText = 'position:absolute;background:rgba(0,0,0,0.5);border:1px dashed #ff0000;display:none;pointer-events:none;z-index:20;';
    wrapper.appendChild(overlayPreview);

    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedRectIndex >= 0) {
        const rects = redactionRects[currentPageIndex];
        if (rects && rects.length > selectedRectIndex) {
          rects.splice(selectedRectIndex, 1);
          selectedRectIndex = -1;
          renderPage(currentPageIndex);
        }
      }
    });
  }

  function updateNavigation() {
    prevBtn.disabled = currentPageIndex <= 0;
    nextBtn.disabled = currentPageIndex >= pageCanvases.length - 1;
  }

  prevBtn.addEventListener('click', () => {
    if (currentPageIndex > 0) renderPage(currentPageIndex - 1);
    updateNavigation();
  });

  nextBtn.addEventListener('click', () => {
    if (currentPageIndex < pageCanvases.length - 1) renderPage(currentPageIndex + 1);
    updateNavigation();
  });

  applyBtn.addEventListener('click', async () => {
    if (!currentFile) return;

    const totalRects = redactionRects.reduce((sum, r) => sum + r.length, 0);
    if (totalRects === 0) {
      showToast({ message: 'No redaction rectangles drawn. Drag on the page to create one.', type: 'warning' });
      return;
    }

    processing.style.display = 'block';
    processingText.textContent = 'Applying redactions to PDF...';
    applyBtn.style.display = 'none';

    try {
      const renderScale = 0.75;
      const invScale = 1 / renderScale;
      const pdfDoc = await loadPdf(currentFile);
      const pages = pdfDoc.getPages();

      for (let i = 0; i < pages.length && i < redactionRects.length; i++) {
        const rects = redactionRects[i];
        const page = pages[i];
        const { width, height } = page.getSize();

        for (const rect of rects) {
          page.drawRectangle({
            x: rect.x * invScale,
            y: height - (rect.y + rect.h) * invScale,
            width: rect.w * invScale,
            height: rect.h * invScale,
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
      processing.style.display = 'none';
      applyBtn.style.display = 'inline-flex';
    }
  });
}

export function destroy() {
  if (_style) _style.remove();
  pageCanvases = [];
  redactionRects = [];
}
