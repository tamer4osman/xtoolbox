import { createImageTool } from './image-tool-factory.js';

export const toolConfig = {
  id: 'blur-background',
  name: 'Blur Background',
  category: 'image',
  description: 'Apply blur effects to images. Full blur, radial (depth of field), or linear (tilt-shift) modes.',
  icon: '🌫️',
  accept: 'image/*',
  maxSizeMB: 50,
  keywords: ['blur background', 'blur image', 'depth of field', 'tilt shift', 'bokeh'],
  steps: ['Upload an image', 'Choose blur mode (full/radial/linear)', 'Adjust blur intensity and focus area', 'Download the result'],
  faqs: [
    { question: 'Does this use AI to detect the subject?', answer: 'No, this tool uses geometric blur patterns (radial, linear) to simulate depth of field. The subject area stays sharp while surrounding areas blur.' },
    { question: 'What blur modes are available?', answer: 'Full blur, radial blur (center sharp, edges blurred), and linear blur (middle sharp, top/bottom blurred — tilt-shift effect).' }
  ]
};

const MODES = [
  { id: 'full', name: '🌫️ Full Blur' },
  { id: 'radial', name: '🔘 Radial (DOF)' },
  { id: 'linear-h', name: '↔️ Horizontal (Tilt)' },
  { id: 'linear-v', name: '↕️ Vertical (Tilt)' }
];

export function render(container) {
  let blurMode = 'radial';

  const tool = createImageTool({
    container,
    toolId: 'blur-bg',
    processingMessage: 'Applying blur...',
    successMessage: 'Blur effect applied!',
    getFilename: () => `blurred-${blurMode}.${getFormat() === 'image/png' ? 'png' : 'jpg'}`,
    getFormat: () => {
      const q = parseFloat(container.querySelector('#quality-select').value);
      return q >= 0.9 ? 'image/png' : 'image/jpeg';
    },
    getQuality: () => parseFloat(container.querySelector('#quality-select').value),
    optionsHTML: `
      <div class="form-group">
        <label>Blur Mode</label>
        <div id="mode-buttons" style="display:flex;gap:8px;flex-wrap:wrap;"></div>
      </div>
      <div class="form-group">
        <label>Blur Intensity</label>
        <input type="range" id="blur-range" min="1" max="50" value="15" style="width:100%;">
        <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-secondary);"><span>1</span><span id="blur-val">15</span><span>50</span></div>
      </div>
      <div class="form-group" id="focus-group">
        <label>Focus Area (%)</label>
        <input type="range" id="focus-range" min="10" max="80" value="40" style="width:100%;">
        <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-secondary);"><span>10</span><span id="focus-val">40</span><span>80</span></div>
      </div>
      <div class="form-group" id="position-group">
        <label>Focus Position</label>
        <input type="range" id="position-range" min="0" max="100" value="50" style="width:100%;">
        <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-secondary);"><span>Top/Left</span><span id="position-val">Center</span><span>Bottom/Right</span></div>
      </div>
      <div class="form-group">
        <label>Output Quality</label>
        <select id="quality-select" class="select-input">
          <option value="0.92">High (PNG)</option>
          <option value="0.85" selected>Medium (JPEG 85%)</option>
          <option value="0.7">Low (JPEG 70%)</option>
        </select>
      </div>
    `,
    optionsCSS: '',
    renderPreview: ({ state }) => {
      if (!state.originalImage) return;
      const canvas = container.querySelector('#blur-bg-preview-canvas');
      const result = processImage(state.originalImage, 600, Math.round(600 * state.originalImage.naturalHeight / state.originalImage.naturalWidth), blurMode, container);
      canvas.width = result.width;
      canvas.height = result.height;
      canvas.getContext('2d').drawImage(result, 0, 0);
    },
    processForDownload: ({ state, canvas }) => {
      if (!state.originalImage) return;
      const result = processImage(state.originalImage, state.originalImage.naturalWidth, state.originalImage.naturalHeight, blurMode, container);
      canvas.width = result.width;
      canvas.height = result.height;
      canvas.getContext('2d').drawImage(result, 0, 0);
    }
  });

  function renderModeButtons() {
    const modeButtons = container.querySelector('#mode-buttons');
    modeButtons.innerHTML = '';
    MODES.forEach(mode => {
      const btn = document.createElement('button');
      btn.className = `btn ${blurMode === mode.id ? 'btn-primary' : 'btn-secondary'}`;
      btn.style.fontSize = 'var(--text-xs)';
      btn.style.flex = '1';
      btn.style.minWidth = '80px';
      btn.textContent = mode.name;
      btn.addEventListener('click', () => {
        blurMode = mode.id;
        renderModeButtons();
        updateVisibility();
        tool.renderPreview();
      });
      modeButtons.appendChild(btn);
    });
  }

  function updateVisibility() {
    const focusGroup = container.querySelector('#focus-group');
    const positionGroup = container.querySelector('#position-group');
    if (blurMode === 'full') {
      focusGroup.style.display = 'none';
      positionGroup.style.display = 'none';
    } else if (blurMode === 'radial') {
      focusGroup.style.display = 'block';
      positionGroup.style.display = 'none';
    } else {
      focusGroup.style.display = 'block';
      positionGroup.style.display = 'block';
    }
  }

  renderModeButtons();
  updateVisibility();

  tool.bindOptionChange({ rangeId: 'blur-range', valueId: 'blur-val' });
  tool.bindOptionChange({ rangeId: 'focus-range', valueId: 'focus-val' });
  tool.bindOptionChange({
    rangeId: 'position-range',
    valueId: 'position-val',
    formatValue: (v) => {
      const n = parseInt(v);
      return n < 35 ? 'Top/Left' : n > 65 ? 'Bottom/Right' : 'Center';
    }
  });
}

function applyBoxBlur(canvas, radius) {
  const ctx = canvas.getContext('2d');
  ctx.filter = `blur(${radius}px)`;
  ctx.drawImage(canvas, 0, 0);
  ctx.filter = 'none';
}

function applyRadialBlur(srcCanvas, blurRadius, focusPercent) {
  const w = srcCanvas.width;
  const h = srcCanvas.height;
  const result = document.createElement('canvas');
  result.width = w;
  result.height = h;
  const ctx = result.getContext('2d');

  ctx.filter = `blur(${blurRadius}px)`;
  ctx.drawImage(srcCanvas, 0, 0, w, h);
  ctx.filter = 'none';

  const cx = w / 2;
  const cy = h / 2;
  const focusRadius = Math.min(w, h) * (focusPercent / 100) / 2;
  const maxRadius = Math.sqrt(cx * cx + cy * cy);
  const gradient = ctx.createRadialGradient(cx, cy, focusRadius, cx, cy, maxRadius);
  gradient.addColorStop(0, 'rgba(0,0,0,1)');
  gradient.addColorStop(0.5, 'rgba(0,0,0,0.5)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'destination-over';
  ctx.drawImage(srcCanvas, 0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';

  return result;
}

function applyLinearBlur(srcCanvas, blurRadius, focusPercent, positionPercent, direction) {
  const w = srcCanvas.width;
  const h = srcCanvas.height;
  const result = document.createElement('canvas');
  result.width = w;
  result.height = h;
  const ctx = result.getContext('2d');

  ctx.filter = `blur(${blurRadius}px)`;
  ctx.drawImage(srcCanvas, 0, 0, w, h);
  ctx.filter = 'none';

  const focusSize = (direction === 'h' ? h : w) * (focusPercent / 100);
  const pos = (direction === 'h' ? h : w) * (positionPercent / 100);
  const halfFocus = focusSize / 2;
  const totalSize = direction === 'h' ? h : w;

  let gradient;
  if (direction === 'h') {
    const top = pos - halfFocus;
    const bottom = pos + halfFocus;
    gradient = ctx.createLinearGradient(0, 0, 0, totalSize);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(Math.max(0, (top - 30) / totalSize), 'rgba(0,0,0,0)');
    gradient.addColorStop(Math.max(0, top / totalSize), 'rgba(0,0,0,1)');
    gradient.addColorStop(Math.min(1, bottom / totalSize), 'rgba(0,0,0,1)');
    gradient.addColorStop(Math.min(1, (bottom + 30) / totalSize), 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
  } else {
    const left = pos - halfFocus;
    const right = pos + halfFocus;
    gradient = ctx.createLinearGradient(0, 0, totalSize, 0);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(Math.max(0, (left - 30) / totalSize), 'rgba(0,0,0,0)');
    gradient.addColorStop(Math.max(0, left / totalSize), 'rgba(0,0,0,1)');
    gradient.addColorStop(Math.min(1, right / totalSize), 'rgba(0,0,0,1)');
    gradient.addColorStop(Math.min(1, (right + 30) / totalSize), 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
  }

  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'destination-over';
  ctx.drawImage(srcCanvas, 0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';

  return result;
}

function processImage(originalImage, width, height, blurMode, container) {
  const blurRange = container.querySelector('#blur-range');
  const focusRange = container.querySelector('#focus-range');
  const positionRange = container.querySelector('#position-range');

  const blurRadius = parseInt(blurRange.value) || 15;
  const focusPercent = parseInt(focusRange.value) || 40;
  const positionPercent = parseInt(positionRange.value) || 50;

  const temp = document.createElement('canvas');
  temp.width = width;
  temp.height = height;
  const tempCtx = temp.getContext('2d');
  tempCtx.drawImage(originalImage, 0, 0, width, height);

  if (blurMode === 'full') {
    applyBoxBlur(temp, blurRadius);
    return temp;
  } else if (blurMode === 'radial') {
    return applyRadialBlur(temp, blurRadius, focusPercent);
  } else if (blurMode === 'linear-h') {
    return applyLinearBlur(temp, blurRadius, focusPercent, positionPercent, 'h');
  } else {
    return applyLinearBlur(temp, blurRadius, focusPercent, positionPercent, 'v');
  }
}

export function destroy() {}
