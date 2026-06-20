import { rgb } from 'pdf-lib';
import { showToast } from '../../components/toast.js';
import { loadPdf, savePdf } from './pdf-utils.js';
import { createPdfPageBrowser } from './pdf-page-browser.js';

export const toolConfig = {
  id: 'pdf-annotator',
  name: 'PDF Annotator',
  category: 'pdf',
  description: 'Annotate PDFs with highlights, underlines, freehand drawing, shapes, text notes, and stamps. Download the annotated PDF.',
  icon: '✏️',
  accept: '.pdf',
  maxSizeMB: 100,
  keywords: ['pdf annotate', 'annotate pdf', 'pdf highlight', 'pdf markup', 'pdf editor'],
  steps: [
    'Upload a PDF file',
    'Select an annotation tool from the toolbar',
    'Draw, write, or stamp on the page',
    'Navigate between pages to annotate more',
    'Download the annotated PDF'
  ],
  faqs: [
    {
      question: 'Are my annotations saved automatically?',
      answer: 'Annotations are stored in your browser while you work. Click "Download PDF" to save them permanently into the PDF file.'
    },
    {
      question: 'Can I remove an annotation?',
      answer: 'Yes. Switch to the Select tool (arrow icon) and click an annotation to select it, then press Delete or Backspace to remove it.'
    },
    {
      question: 'Are my files uploaded to a server?',
      answer: 'No. All processing happens entirely in your browser using PDF.js and pdf-lib. Your files never leave your device.'
    }
  ]
};

const TOOLS = {
  select: { icon: '🖱️', label: 'Select', cursor: 'default' },
  highlight: { icon: '🟡', label: 'Highlight', cursor: 'crosshair' },
  underline: { icon: 'ᵤ', label: 'Underline', cursor: 'crosshair' },
  freehand: { icon: '✏️', label: 'Draw', cursor: 'crosshair' },
  rectangle: { icon: '▭', label: 'Rectangle', cursor: 'crosshair' },
  arrow: { icon: '↗', label: 'Arrow', cursor: 'crosshair' },
  text: { icon: 'T', label: 'Text Note', cursor: 'text' },
  stamp: { icon: '🔖', label: 'Stamp', cursor: 'pointer' }
};

const STAMPS = ['APPROVED', 'CONFIDENTIAL', 'DRAFT', 'REVIEWED', 'VOID', 'PAID', 'URGENT', 'FINAL'];

const STAMP_COLORS = {
  APPROVED: '#16a34a',
  CONFIDENTIAL: '#dc2626',
  DRAFT: '#ca8a04',
  REVIEWED: '#2563eb',
  VOID: '#dc2626',
  PAID: '#16a34a',
  URGENT: '#dc2626',
  FINAL: '#7c3aed'
};

const STYLE_CSS = `
  .anno-toolbar { display: flex; flex-wrap: wrap; gap: var(--space-1); margin-bottom: var(--space-3); padding: var(--space-2); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); align-items: center; }
  .anno-toolbar-group { display: flex; gap: var(--space-1); padding: 0 var(--space-2); border-right: 1px solid var(--color-border); }
  .anno-toolbar-group:last-child { border-right: none; }
  .anno-tool-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); border: 2px solid transparent; background: none; cursor: pointer; font-size: 16px; transition: all 0.15s; position: relative; }
  .anno-tool-btn:hover { background: var(--color-primary-light); }
  .anno-tool-btn.active { border-color: var(--color-primary); background: var(--color-primary-light); }
  .anno-tool-btn[title]:hover::after { content: attr(title); position: absolute; bottom: -28px; left: 50%; transform: translateX(-50%); background: #1f2937; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 11px; white-space: nowrap; z-index: 100; pointer-events: none; }
  .anno-color-input { width: 32px; height: 32px; border: 2px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer; padding: 0; }
  .anno-stroke-select { padding: 4px 8px; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); background: #fff; }
  .anno-stamp-select { padding: 4px 8px; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); background: #fff; }
  .page-nav { display: flex; align-items: center; justify-content: center; gap: var(--space-4); margin-bottom: var(--space-3); }
  .page-nav span { font-weight: 600; min-width: 120px; text-align: center; }
  .anno-canvas-wrapper { position: relative; display: inline-block; margin: 0 auto; }
  .anno-canvas-container { border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: #e5e7eb; padding: var(--space-2); max-height: 650px; overflow: auto; display: flex; justify-content: center; }
  .anno-canvas-wrapper canvas { display: block; box-shadow: var(--shadow-md); }
  .anno-overlay-canvas { position: absolute; top: 0; left: 0; z-index: 10; }
  .anno-text-input-overlay { position: absolute; z-index: 20; border: 2px solid var(--color-primary); border-radius: 4px; padding: 4px 8px; font: inherit; font-size: 14px; min-width: 120px; min-height: 30px; resize: both; background: rgba(255,255,255,0.95); outline: none; }
  .anno-hint { text-align: center; color: var(--color-text-muted); font-size: var(--text-sm); margin-bottom: var(--space-2); }
  .anno-actions { margin-top: var(--space-4); display: flex; gap: var(--space-3); justify-content: center; flex-wrap: wrap; }
  .anno-stamp-preview { position: absolute; z-index: 25; pointer-events: none; font-weight: 800; font-size: 20px; padding: 4px 12px; border: 3px solid; border-radius: 6px; transform: rotate(-12deg); opacity: 0.85; }
`;

const OPTIONS_HTML = `
  <div class="anno-toolbar" id="anno-toolbar"></div>
  <div class="page-nav">
    <button class="btn btn-secondary" id="prev-page" disabled>Previous</button>
    <span id="page-indicator">Page 1 of 1</span>
    <button class="btn btn-secondary" id="next-page" disabled>Next</button>
  </div>
  <div class="anno-hint" id="anno-hint">Select a tool and draw on the page</div>
  <div class="anno-canvas-container" id="anno-canvas-container"></div>
  <div class="anno-actions">
    <button class="btn btn-primary btn-lg" id="download-anno-btn">Download Annotated PDF</button>
  </div>
`;

const RENDER_SCALE = 0.75;
const INV_SCALE = 1 / RENDER_SCALE;

let _browser = null;
let _annotations = [];
let _currentPageIndex = 0;
let _pageCanvasesRef = [];
let _activeTool = 'select';
let _strokeColor = '#FF0000';
let _strokeWidth = 3;
let _selectedStamp = 'APPROVED';
let _isDrawing = false;
let _drawStart = null;
let _freehandPoints = [];
let _textInputActive = false;
let _selectedAnnotationIndex = -1;
let _keydownHandler = null;

export function render(container) {
  _annotations = [];
  _currentPageIndex = 0;
  _pageCanvasesRef = [];
  _activeTool = 'select';
  _isDrawing = false;
  _drawStart = null;
  _freehandPoints = [];
  _textInputActive = false;
  _selectedAnnotationIndex = -1;

  _browser = createPdfPageBrowser({
    container,
    optionsHTML: OPTIONS_HTML,
    styleCSS: STYLE_CSS,
    actionButtonSelector: '#download-anno-btn',
    renderScale: RENDER_SCALE,
    initialProcessingMessage: 'Loading PDF...',

    onPagesLoaded: (canvases) => {
      _pageCanvasesRef = canvases;
      _annotations = canvases.map(() => []);
      _currentPageIndex = 0;
      buildToolbar();
      renderPage(0);
      updateNavigation();
    },

    onReset: () => {
      _annotations = [];
      _currentPageIndex = 0;
      _pageCanvasesRef = [];
      _activeTool = 'select';
      _isDrawing = false;
      _drawStart = null;
      _freehandPoints = [];
      _selectedAnnotationIndex = -1;
    },

    onAction: async (api) => {
      const totalAnnotations = _annotations.reduce((sum, a) => sum + a.length, 0);
      if (totalAnnotations === 0) {
        showToast({ message: 'No annotations to save. Use the toolbar to annotate the PDF first.', type: 'warning' });
        return;
      }
      api.showProcessing('Saving annotated PDF...');
      try {
        const pdfDoc = await loadPdf(api.file);
        const pages = pdfDoc.getPages();
        for (let i = 0; i < pages.length && i < _annotations.length; i++) {
          await embedAnnotations(pdfDoc, pages[i], _annotations[i]);
        }
        await savePdf(pdfDoc, 'annotated.pdf');
        showToast({ message: `Saved ${totalAnnotations} annotation(s)!`, type: 'success' });
      } catch (err) {
        showToast({ message: 'Error: ' + err.message, type: 'error' });
      } finally {
        api.hideProcessing();
      }
    }
  });

  function buildToolbar() {
    const toolbar = container.querySelector('#anno-toolbar');
    if (!toolbar) return;

    const toolGroup = document.createElement('div');
    toolGroup.className = 'anno-toolbar-group';
    for (const [id, tool] of Object.entries(TOOLS)) {
      const btn = document.createElement('button');
      btn.className = 'anno-tool-btn' + (id === _activeTool ? ' active' : '');
      btn.title = tool.label;
      btn.textContent = tool.icon;
      btn.dataset.tool = id;
      btn.addEventListener('click', () => selectTool(id));
      toolGroup.appendChild(btn);
    }
    toolbar.appendChild(toolGroup);

    const colorGroup = document.createElement('div');
    colorGroup.className = 'anno-toolbar-group';
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.className = 'anno-color-input';
    colorInput.value = _strokeColor;
    colorInput.title = 'Color';
    colorInput.addEventListener('input', (e) => { _strokeColor = e.target.value; });
    colorGroup.appendChild(colorInput);

    const strokeSelect = document.createElement('select');
    strokeSelect.className = 'anno-stroke-select';
    strokeSelect.title = 'Stroke width';
    [2, 3, 5, 8].forEach(w => {
      const opt = document.createElement('option');
      opt.value = w;
      opt.textContent = w + 'px';
      if (w === _strokeWidth) opt.selected = true;
      strokeSelect.appendChild(opt);
    });
    strokeSelect.addEventListener('change', (e) => { _strokeWidth = parseInt(e.target.value); });
    colorGroup.appendChild(strokeSelect);
    toolbar.appendChild(colorGroup);

    const stampGroup = document.createElement('div');
    stampGroup.className = 'anno-toolbar-group';
    stampGroup.id = 'stamp-group';
    stampGroup.style.display = 'none';
    const stampSelect = document.createElement('select');
    stampSelect.className = 'anno-stamp-select';
    stampSelect.title = 'Stamp text';
    STAMPS.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      if (s === _selectedStamp) opt.selected = true;
      stampSelect.appendChild(opt);
    });
    stampSelect.addEventListener('change', (e) => { _selectedStamp = e.target.value; });
    stampGroup.appendChild(stampSelect);
    toolbar.appendChild(stampGroup);
  }

  function selectTool(toolId) {
    _activeTool = toolId;
    _isDrawing = false;
    _drawStart = null;
    _freehandPoints = [];
    container.querySelectorAll('.anno-tool-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === toolId);
    });
    const stampGroup = container.querySelector('#stamp-group');
    if (stampGroup) stampGroup.style.display = toolId === 'stamp' ? 'flex' : 'none';
    const hint = container.querySelector('#anno-hint');
    const hints = {
      select: 'Click an annotation to select it, then press Delete to remove',
      highlight: 'Click and drag to highlight an area',
      underline: 'Click and drag to underline an area',
      freehand: 'Click and drag to draw freely',
      rectangle: 'Click and drag to draw a rectangle',
      arrow: 'Click and drag to draw an arrow',
      text: 'Click to place a text note',
      stamp: 'Click to place a stamp'
    };
    if (hint) hint.textContent = hints[toolId] || '';
    renderPage(_currentPageIndex);
  }

  function renderPage(index) {
    if (!_pageCanvasesRef.length || index < 0 || index >= _pageCanvasesRef.length) return;
    _currentPageIndex = index;

    // Bug fix: reset stuck flag — DOM removal via innerHTML='' may not fire blur
    _textInputActive = false;

    const canvasContainer = container.querySelector('#anno-canvas-container');
    const pageIndicator = container.querySelector('#page-indicator');
    if (!canvasContainer || !pageIndicator) return;

    canvasContainer.innerHTML = '';
    pageIndicator.textContent = `Page ${index + 1} of ${_pageCanvasesRef.length}`;

    const wrapper = document.createElement('div');
    wrapper.className = 'anno-canvas-wrapper';

    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = _pageCanvasesRef[index].width;
    pageCanvas.height = _pageCanvasesRef[index].height;
    const ctx = pageCanvas.getContext('2d');
    ctx.drawImage(_pageCanvasesRef[index], 0, 0);
    pageCanvas.style.maxWidth = '100%';
    pageCanvas.style.pointerEvents = 'none';
    wrapper.appendChild(pageCanvas);

    const overlayCanvas = document.createElement('canvas');
    overlayCanvas.width = pageCanvas.width;
    overlayCanvas.height = pageCanvas.height;
    overlayCanvas.className = 'anno-overlay-canvas';
    overlayCanvas.style.width = pageCanvas.style.width || '100%';
    overlayCanvas.style.height = pageCanvas.style.height || '100%';
    overlayCanvas.style.pointerEvents = 'auto';
    wrapper.appendChild(overlayCanvas);

    canvasContainer.appendChild(wrapper);

    drawAnnotations(overlayCanvas, _annotations[index] || []);

    const toolInfo = TOOLS[_activeTool];
    overlayCanvas.style.cursor = toolInfo ? toolInfo.cursor : 'default';
    wrapper.style.cursor = toolInfo ? toolInfo.cursor : 'default';

    wrapper.addEventListener('mousedown', (e) => handleMouseDown(e, overlayCanvas));
    wrapper.addEventListener('mousemove', (e) => handleMouseMove(e, overlayCanvas));
    wrapper.addEventListener('mouseup', (e) => handleMouseUp(e, overlayCanvas));
    wrapper.addEventListener('mouseleave', () => {
      if (_isDrawing) {
        if (_activeTool === 'freehand') {
          finishFreehand(overlayCanvas);
        } else {
          _isDrawing = false;
          _drawStart = null;
          renderPage(_currentPageIndex);
        }
      }
    });
  }

  function handleMouseDown(e, canvas) {
    if (_activeTool === 'select') {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      const pageAnnotations = _annotations[_currentPageIndex] || [];
      _selectedAnnotationIndex = -1;
      for (let i = pageAnnotations.length - 1; i >= 0; i--) {
        if (hitTestAnnotation(pageAnnotations[i], x, y)) {
          _selectedAnnotationIndex = i;
          break;
        }
      }
      drawAnnotations(canvas, pageAnnotations);
      if (_selectedAnnotationIndex >= 0) {
        drawSelectionHighlight(canvas, pageAnnotations[_selectedAnnotationIndex]);
      }
      return;
    }
    if (_activeTool === 'text') { placeTextInput(e, canvas); return; }
    if (_activeTool === 'stamp') { placeStamp(e, canvas); return; }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    _drawStart = { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
    _isDrawing = true;

    if (_activeTool === 'freehand') {
      _freehandPoints = [{ x: _drawStart.x, y: _drawStart.y }];
    }
  }

  function handleMouseMove(e, canvas) {
    if (!_isDrawing || !_drawStart) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const curX = (e.clientX - rect.left) * scaleX;
    const curY = (e.clientY - rect.top) * scaleY;

    if (_activeTool === 'freehand') {
      _freehandPoints.push({ x: curX, y: curY });
      drawFreehandPreview(canvas, _freehandPoints, _strokeColor, _strokeWidth);
    } else {
      drawShapePreview(canvas, _drawStart, { x: curX, y: curY }, _activeTool, _strokeColor, _strokeWidth);
    }
  }

  function handleMouseUp(e, canvas) {
    if (!_isDrawing || !_drawStart) return;
    _isDrawing = false;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const endX = (e.clientX - rect.left) * scaleX;
    const endY = (e.clientY - rect.top) * scaleY;
    const w = Math.abs(endX - _drawStart.x);
    const h = Math.abs(endY - _drawStart.y);

    if (_activeTool === 'freehand') {
      finishFreehand(canvas);
      return;
    }

    if (w < 5 && h < 5) {
      _drawStart = null;
      renderPage(_currentPageIndex);
      return;
    }

    const color = _strokeColor;
    const width = _strokeWidth;

    if (_activeTool === 'highlight') {
      _annotations[_currentPageIndex].push({
        type: 'highlight',
        x: Math.min(_drawStart.x, endX),
        y: Math.min(_drawStart.y, endY),
        w, h, color
      });
    } else if (_activeTool === 'underline') {
      _annotations[_currentPageIndex].push({
        type: 'underline',
        x: Math.min(_drawStart.x, endX),
        y: Math.max(_drawStart.y, endY),
        w, color, width
      });
    } else if (_activeTool === 'rectangle') {
      _annotations[_currentPageIndex].push({
        type: 'rectangle',
        x: Math.min(_drawStart.x, endX),
        y: Math.min(_drawStart.y, endY),
        w, h, color, width
      });
    } else if (_activeTool === 'arrow') {
      _annotations[_currentPageIndex].push({
        type: 'arrow',
        x1: _drawStart.x, y1: _drawStart.y,
        x2: endX, y2: endY,
        color, width
      });
    }

    _drawStart = null;
    renderPage(_currentPageIndex);
  }

  function finishFreehand(canvas) {
    _isDrawing = false;
    if (_freehandPoints.length > 1) {
      const color = _strokeColor;
      const width = _strokeWidth;
      _annotations[_currentPageIndex].push({
        type: 'freehand',
        points: [..._freehandPoints],
        color, width
      });
    }
    _freehandPoints = [];
    _drawStart = null;
    renderPage(_currentPageIndex);
  }

  function placeTextInput(e, canvas) {
    if (_textInputActive) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const wrapper = canvas.parentElement;
    const input = document.createElement('textarea');
    input.className = 'anno-text-input-overlay';
    input.style.left = (e.clientX - rect.left + canvas.offsetLeft) + 'px';
    input.style.top = (e.clientY - rect.top + canvas.offsetTop) + 'px';
    input.placeholder = 'Type here...';
    // Bug fix: stop the wrapper's mousedown from treating clicks inside
    // the textarea as a new text-placement attempt.
    input.addEventListener('mousedown', (ev) => ev.stopPropagation());
    wrapper.appendChild(input);
    input.focus();
    _textInputActive = true;

    let committed = false;
    const commit = () => {
      if (committed) return;
      committed = true;
      const text = input.value.trim();
      if (text) {
        _annotations[_currentPageIndex].push({
          type: 'text',
          x, y, text,
          color: _strokeColor,
          fontSize: 16
        });
      }
      input.removeEventListener('blur', commit);
      input.remove();
      _textInputActive = false;
      renderPage(_currentPageIndex);
    };

    input.addEventListener('blur', commit);
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); input.blur(); }
      if (ev.key === 'Escape') { input.value = ''; input.blur(); }
    });
  }

  function placeStamp(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    _annotations[_currentPageIndex].push({
      type: 'stamp',
      x, y,
      text: _selectedStamp,
      color: STAMP_COLORS[_selectedStamp] || '#dc2626'
    });
    renderPage(_currentPageIndex);
  }

  _keydownHandler = (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && _activeTool === 'select' && !_textInputActive) {
      const pageAnnotations = _annotations[_currentPageIndex];
      if (pageAnnotations && _selectedAnnotationIndex >= 0 && _selectedAnnotationIndex < pageAnnotations.length) {
        pageAnnotations.splice(_selectedAnnotationIndex, 1);
        _selectedAnnotationIndex = -1;
        renderPage(_currentPageIndex);
      }
    }
  };
  document.addEventListener('keydown', _keydownHandler);

  function updateNavigation() {
    const prevBtn = container.querySelector('#prev-page');
    const nextBtn = container.querySelector('#next-page');
    if (prevBtn) prevBtn.disabled = _currentPageIndex <= 0;
    if (nextBtn) nextBtn.disabled = _currentPageIndex >= _pageCanvasesRef.length - 1;
  }

  const prevBtn = container.querySelector('#prev-page');
  const nextBtn = container.querySelector('#next-page');
  if (prevBtn) prevBtn.addEventListener('click', () => { renderPage(_currentPageIndex - 1); updateNavigation(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { renderPage(_currentPageIndex + 1); updateNavigation(); });
}

function drawAnnotations(canvas, annotations) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const ann of annotations) {
    drawAnnotation(ctx, ann);
  }
}

function drawAnnotation(ctx, ann) {
  ctx.save();
  switch (ann.type) {
    case 'highlight':
      ctx.fillStyle = ann.color || '#FFEB3B';
      ctx.globalAlpha = 0.35;
      ctx.fillRect(ann.x, ann.y, ann.w, ann.h);
      break;
    case 'underline':
      ctx.strokeStyle = ann.color || '#FF0000';
      ctx.lineWidth = ann.width || 3;
      ctx.beginPath();
      ctx.moveTo(ann.x, ann.y);
      ctx.lineTo(ann.x + ann.w, ann.y);
      ctx.stroke();
      break;
    case 'freehand':
      if (ann.points && ann.points.length > 1) {
        ctx.strokeStyle = ann.color || '#FF0000';
        ctx.lineWidth = ann.width || 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(ann.points[0].x, ann.points[0].y);
        for (let i = 1; i < ann.points.length; i++) {
          ctx.lineTo(ann.points[i].x, ann.points[i].y);
        }
        ctx.stroke();
      }
      break;
    case 'rectangle':
      ctx.strokeStyle = ann.color || '#FF0000';
      ctx.lineWidth = ann.width || 3;
      ctx.strokeRect(ann.x, ann.y, ann.w, ann.h);
      break;
    case 'arrow':
      drawArrow(ctx, ann.x1, ann.y1, ann.x2, ann.y2, ann.color || '#FF0000', ann.width || 3);
      break;
    case 'text':
      ctx.fillStyle = ann.color || '#FF0000';
      ctx.font = `bold ${ann.fontSize || 16}px Inter, sans-serif`;
      ctx.fillText(ann.text, ann.x, ann.y);
      break;
    case 'stamp': {
      const stampColor = ann.color || '#dc2626';
      ctx.font = 'bold 20px Inter, sans-serif';
      const metrics = ctx.measureText(ann.text);
      const pw = 12;
      const ph = 6;
      const bw = metrics.width + pw * 2;
      const bh = 30;
      ctx.save();
      ctx.translate(ann.x, ann.y);
      ctx.rotate(-12 * Math.PI / 180);
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = stampColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
      ctx.fillStyle = stampColor;
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ann.text, 0, 0);
      ctx.restore();
      break;
    }
  }
  ctx.restore();
}

function drawArrow(ctx, x1, y1, x2, y2, color, width) {
  const headLen = 14;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}

function hitTestAnnotation(ann, x, y) {
  const margin = 8;
  switch (ann.type) {
    case 'highlight':
    case 'rectangle':
      return x >= ann.x - margin && x <= ann.x + ann.w + margin && y >= ann.y - margin && y <= ann.y + ann.h + margin;
    case 'underline':
      return x >= ann.x - margin && x <= ann.x + ann.w + margin && Math.abs(y - ann.y) <= margin + 4;
    case 'arrow': {
      const dx = ann.x2 - ann.x1, dy = ann.y2 - ann.y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len === 0) return Math.abs(x - ann.x1) <= margin && Math.abs(y - ann.y1) <= margin;
      const t = Math.max(0, Math.min(1, ((x - ann.x1) * dx + (y - ann.y1) * dy) / (len * len)));
      const px = ann.x1 + t * dx, py = ann.y1 + t * dy;
      return Math.sqrt((x - px) ** 2 + (y - py) ** 2) <= margin + 4;
    }
    case 'freehand':
      if (!ann.points) return false;
      return ann.points.some(p => Math.sqrt((x - p.x) ** 2 + (y - p.y) ** 2) <= margin + 4);
    case 'text':
      return x >= ann.x - margin && x <= ann.x + 200 && y >= ann.y - 20 && y <= ann.y + margin;
    case 'stamp':
      return Math.abs(x - ann.x) <= 60 && Math.abs(y - ann.y) <= 20;
    default:
      return false;
  }
}

function drawSelectionHighlight(canvas, ann) {
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 3]);
  switch (ann.type) {
    case 'highlight':
    case 'rectangle':
      ctx.strokeRect(ann.x - 4, ann.y - 4, ann.w + 8, ann.h + 8);
      break;
    case 'underline':
      ctx.strokeRect(ann.x - 4, ann.y - 8, ann.w + 8, 16);
      break;
    case 'arrow':
      ctx.strokeRect(Math.min(ann.x1, ann.x2) - 8, Math.min(ann.y1, ann.y2) - 8, Math.abs(ann.x2 - ann.x1) + 16, Math.abs(ann.y2 - ann.y1) + 16);
      break;
    case 'freehand':
      if (ann.points && ann.points.length > 0) {
        const xs = ann.points.map(p => p.x), ys = ann.points.map(p => p.y);
        ctx.strokeRect(Math.min(...xs) - 8, Math.min(...ys) - 8, Math.max(...xs) - Math.min(...xs) + 16, Math.max(...ys) - Math.min(...ys) + 16);
      }
      break;
    case 'text':
      ctx.strokeRect(ann.x - 4, ann.y - 20, 200, 28);
      break;
    case 'stamp':
      ctx.strokeRect(ann.x - 64, ann.y - 20, 128, 40);
      break;
  }
  ctx.restore();
}

function drawFreehandPreview(canvas, points, color, width) {
  const ctx = canvas.getContext('2d');
  drawAnnotations(canvas, _annotations[_currentPageIndex] || []);
  if (points.length < 2) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawShapePreview(canvas, start, end, tool, color, width) {
  const ctx = canvas.getContext('2d');
  drawAnnotations(canvas, _annotations[_currentPageIndex] || []);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash([5, 5]);
  if (tool === 'highlight') {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.25;
    ctx.fillRect(Math.min(start.x, end.x), Math.min(start.y, end.y), Math.abs(end.x - start.x), Math.abs(end.y - start.y));
  } else if (tool === 'underline') {
    ctx.beginPath();
    ctx.moveTo(start.x, Math.max(start.y, end.y));
    ctx.lineTo(end.x, Math.max(start.y, end.y));
    ctx.stroke();
  } else if (tool === 'rectangle') {
    ctx.strokeRect(Math.min(start.x, end.x), Math.min(start.y, end.y), Math.abs(end.x - start.x), Math.abs(end.y - start.y));
  } else if (tool === 'arrow') {
    ctx.setLineDash([]);
    drawArrow(ctx, start.x, start.y, end.x, end.y, color, width);
  }
  ctx.restore();
}

function embedHighlight(pdfPage, ann, h) {
  pdfPage.drawRectangle({
    x: ann.x * INV_SCALE, y: h - (ann.y + ann.h) * INV_SCALE,
    width: ann.w * INV_SCALE, height: ann.h * INV_SCALE,
    color: parseColor(ann.color || '#FFEB3B'), opacity: 0.35
  });
}

function embedUnderline(pdfPage, ann, h) {
  const ux = ann.x * INV_SCALE;
  pdfPage.drawLine({
    start: { x: ux, y: h - ann.y * INV_SCALE },
    end: { x: ux + ann.w * INV_SCALE, y: h - ann.y * INV_SCALE },
    color: parseColor(ann.color || '#FF0000'), thickness: (ann.width || 3) * INV_SCALE * 0.5
  });
}

function embedRect(pdfPage, ann, h) {
  pdfPage.drawRectangle({
    x: ann.x * INV_SCALE, y: h - (ann.y + ann.h) * INV_SCALE,
    width: ann.w * INV_SCALE, height: ann.h * INV_SCALE,
    color: parseColor(ann.color || '#FF0000'), opacity: 1,
    borderWidth: (ann.width || 3) * INV_SCALE * 0.5
  });
}

function embedArrow(pdfPage, ann, h) {
  pdfPage.drawLine({
    start: { x: ann.x1 * INV_SCALE, y: h - ann.y1 * INV_SCALE },
    end: { x: ann.x2 * INV_SCALE, y: h - ann.y2 * INV_SCALE },
    color: parseColor(ann.color || '#FF0000'), thickness: (ann.width || 3) * INV_SCALE * 0.5
  });
}

function embedFreehand(pdfPage, ann, h) {
  if (!ann.points || ann.points.length <= 1) return;
  const color = parseColor(ann.color || '#FF0000');
  const thickness = (ann.width || 3) * INV_SCALE * 0.5;
  for (let i = 0; i < ann.points.length - 1; i++) {
    const p1 = ann.points[i], p2 = ann.points[i + 1];
    pdfPage.drawLine({
      start: { x: p1.x * INV_SCALE, y: h - p1.y * INV_SCALE },
      end: { x: p2.x * INV_SCALE, y: h - p2.y * INV_SCALE },
      color, thickness
    });
  }
}

async function embedText(pdfDoc, pdfPage, ann, h) {
  const opts = { x: ann.x * INV_SCALE, y: h - ann.y * INV_SCALE, size: (ann.fontSize || 16) * INV_SCALE * 0.5, color: parseColor(ann.color || '#FF0000') };
  try { opts.font = await pdfDoc.embedFont('Helvetica-Bold'); } catch { /* built-in fallback */ }
  pdfPage.drawText(ann.text, opts);
}

async function embedStamp(pdfDoc, pdfPage, ann, h) {
  const opts = { x: ann.x * INV_SCALE, y: h - ann.y * INV_SCALE, size: 18 * INV_SCALE * 0.5, color: parseColor(ann.color || '#dc2626'), rotate: { type: 'degrees', angle: -12 } };
  try { opts.font = await pdfDoc.embedFont('Helvetica-Bold'); } catch { /* built-in fallback */ }
  pdfPage.drawText(ann.text, opts);
}

const EMBED_FNS = { highlight: embedHighlight, underline: embedUnderline, rectangle: embedRect, arrow: embedArrow, freehand: embedFreehand, text: embedText, stamp: embedStamp };
const ASYNC_TYPES = new Set(['text', 'stamp']);

async function embedAnnotations(pdfDoc, pdfPage, annotations) {
  if (!annotations || annotations.length === 0) return;
  const { height } = pdfPage.getSize();
  for (const ann of annotations) {
    const fn = EMBED_FNS[ann.type];
    if (!fn) continue;
    if (ASYNC_TYPES.has(ann.type)) {
      await fn(pdfDoc, pdfPage, ann, height);
    } else {
      fn(pdfPage, ann, height);
    }
  }
}

function parseColor(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;
  return rgb(r, g, b);
}

export function destroy() {
  _annotations = [];
  _currentPageIndex = 0;
  _pageCanvasesRef = [];
  _activeTool = 'select';
  _isDrawing = false;
  _drawStart = null;
  _freehandPoints = [];
  _textInputActive = false;
  _selectedAnnotationIndex = -1;
  if (_keydownHandler) {
    document.removeEventListener('keydown', _keydownHandler);
    _keydownHandler = null;
  }
  if (_browser) {
    _browser.destroy();
    _browser = null;
  }
}
