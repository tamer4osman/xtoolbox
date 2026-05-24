import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { loadImageFromFile, canvasToBlob } from './image-utils.js';

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

export function render(container) {
  let originalImage = null;
  let blurMode = 'radial';

  const upload = createFileUpload({
    accept: 'image/*',
    multiple: false,
    maxSizeMB: 50,
    onFilesSelected: async (files) => {
      originalImage = await loadImageFromFile(files[0]);
      countInfo.textContent = `${originalImage.naturalWidth}×${originalImage.naturalHeight}px`;
      optionsArea.style.display = 'block';
      previewArea.style.display = 'block';
      renderPreview();
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);" id="count-info">-</div>
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
        <button class="btn btn-primary btn-lg" id="download-btn" style="width:100%;">Download Blurred Image</button>
      </div>
      <div id="preview-area" style="display:none;margin-top:var(--space-6);">
        <h3 style="font-size:var(--text-lg);margin-bottom:var(--space-3);">Preview</h3>
        <canvas id="preview-canvas" style="width:100%;max-width:600px;border:1px solid var(--color-border);border-radius:var(--radius-lg);"></canvas>
      </div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Applying blur...</p></div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const countInfo = container.querySelector('#count-info');
  const previewArea = container.querySelector('#preview-area');
  const previewCanvas = container.querySelector('#preview-canvas');
  const blurRange = container.querySelector('#blur-range');
  const blurVal = container.querySelector('#blur-val');
  const focusRange = container.querySelector('#focus-range');
  const focusVal = container.querySelector('#focus-val');
  const positionRange = container.querySelector('#position-range');
  const positionVal = container.querySelector('#position-val');
  const downloadBtn = container.querySelector('#download-btn');
  const processing = container.querySelector('#processing');
  const modeButtons = container.querySelector('#mode-buttons');
  const focusGroup = container.querySelector('#focus-group');
  const positionGroup = container.querySelector('#position-group');

  const modes = [
    { id: 'full', name: '🌫️ Full Blur' },
    { id: 'radial', name: '🔘 Radial (DOF)' },
    { id: 'linear-h', name: '↔️ Horizontal (Tilt)' },
    { id: 'linear-v', name: '↕️ Vertical (Tilt)' },
  ];

  function renderModeButtons() {
    modeButtons.innerHTML = '';
    modes.forEach(mode => {
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
        renderPreview();
      });
      modeButtons.appendChild(btn);
    });
  }

  function updateVisibility() {
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

  // Stack blur implementation using canvas filter
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

    // Draw blurred version
    ctx.filter = `blur(${blurRadius}px)`;
    ctx.drawImage(srcCanvas, 0, 0, w, h);
    ctx.filter = 'none';

    // Create radial gradient mask
    const cx = w / 2;
    const cy = h / 2;
    const focusRadius = Math.min(w, h) * (focusPercent / 100) / 2;
    const maxRadius = Math.sqrt(cx * cx + cy * cy);
    const gradient = ctx.createRadialGradient(cx, cy, focusRadius, cx, cy, maxRadius);
    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(0.5, 'rgba(0,0,0,0.5)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    // Use composite to reveal sharp image in center
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

    // Draw blurred version
    ctx.filter = `blur(${blurRadius}px)`;
    ctx.drawImage(srcCanvas, 0, 0, w, h);
    ctx.filter = 'none';

    // Create linear gradient mask
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

  function processImage(canvas, width, height) {
    const blurRadius = parseInt(blurRange.value) || 15;
    const focusPercent = parseInt(focusRange.value) || 40;
    const positionPercent = parseInt(positionRange.value) || 50;

    // Draw original to temp canvas
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

  function renderPreview() {
    if (!originalImage) return;
    const previewW = 600;
    const scale = previewW / originalImage.naturalWidth;
    const previewH = Math.round(originalImage.naturalHeight * scale);
    const result = processImage(previewCanvas, previewW, previewH);
    previewCanvas.width = result.width;
    previewCanvas.height = result.height;
    previewCanvas.getContext('2d').drawImage(result, 0, 0);
  }

  renderModeButtons();
  updateVisibility();

  blurRange.addEventListener('input', () => {
    blurVal.textContent = blurRange.value;
    renderPreview();
  });

  focusRange.addEventListener('input', () => {
    focusVal.textContent = focusRange.value;
    renderPreview();
  });

  positionRange.addEventListener('input', () => {
    const v = parseInt(positionRange.value);
    positionVal.textContent = v < 35 ? 'Top/Left' : v > 65 ? 'Bottom/Right' : 'Center';
    renderPreview();
  });

  downloadBtn.addEventListener('click', async () => {
    if (!originalImage) return;
    const quality = parseFloat(container.querySelector('#quality-select').value);
    const type = quality >= 0.9 ? 'image/png' : 'image/jpeg';

    processing.style.display = 'block';

    try {
      const w = originalImage.naturalWidth;
      const h = originalImage.naturalHeight;
      const result = processImage(document.createElement('canvas'), w, h);
      const blob = await canvasToBlob(result, type, quality);
      downloadBlob(blob, `blurred-${blurMode}.${type === 'image/png' ? 'png' : 'jpg'}`);
      showToast({ message: 'Blur effect applied!', type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
    }
  });
}

export function destroy() {}
