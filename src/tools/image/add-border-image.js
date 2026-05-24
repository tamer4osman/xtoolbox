import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { loadImageFromFile, canvasToBlob } from './image-utils.js';

export const toolConfig = {
  id: 'add-border-image',
  name: 'Add Border to Image',
  category: 'image',
  description: 'Add customizable borders to images. Solid, dashed, double, or rounded corners with shadow effects.',
  icon: '🖼️',
  accept: 'image/*',
  maxSizeMB: 50,
  keywords: ['add border', 'image border', 'photo frame', 'picture border'],
  steps: ['Upload an image', 'Choose border style and width', 'Set border color and corner radius', 'Add optional shadow', 'Download the result'],
  faqs: [
    { question: 'What border styles are available?', answer: 'Solid, dashed, dotted, double, and groove styles with customizable color and width.' },
    { question: 'Can I add rounded corners?', answer: 'Yes, use the corner radius slider to round the image corners.' }
  ]
};

const BORDER_STYLES = [
  { id: 'solid', name: 'Solid' },
  { id: 'dashed', name: 'Dashed' },
  { id: 'dotted', name: 'Dotted' },
  { id: 'double', name: 'Double' },
  { id: 'groove', name: 'Groove' },
];

export function render(container) {
  let originalImage = null;
  let borderStyle = 'solid';

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
          <label>Border Style</label>
          <div id="style-buttons" style="display:flex;gap:8px;flex-wrap:wrap;"></div>
        </div>
        <div class="form-group">
          <label>Border Width (px)</label>
          <input type="range" id="width-range" min="1" max="100" value="20" style="width:100%;">
          <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-secondary);"><span>1</span><span id="width-val">20</span><span>100</span></div>
        </div>
        <div class="form-group">
          <label>Border Color</label>
          <div style="display:flex;gap:8px;align-items:center;">
            <input type="color" id="border-color" value="#000000" style="width:60px;height:36px;border:1px solid var(--color-border);border-radius:var(--radius-md);cursor:pointer;">
            <span id="border-color-hex" style="font-size:var(--text-sm);color:var(--color-text-secondary);">#000000</span>
          </div>
        </div>
        <div class="form-group">
          <label>Corner Radius (px)</label>
          <input type="range" id="radius-range" min="0" max="200" value="0" style="width:100%;">
          <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-secondary);"><span>0</span><span id="radius-val">0</span><span>200</span></div>
        </div>
        <div class="form-group">
          <label>Shadow</label>
          <div style="display:flex;gap:8px;align-items:center;">
            <input type="checkbox" id="shadow-toggle" style="width:18px;height:18px;">
            <span style="font-size:var(--text-sm);color:var(--color-text-secondary);">Enable drop shadow</span>
          </div>
        </div>
        <div class="form-group" id="shadow-options" style="display:none;">
          <label>Shadow Blur (px)</label>
          <input type="range" id="shadow-range" min="0" max="50" value="15" style="width:100%;">
          <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-secondary);"><span>0</span><span id="shadow-val">15</span><span>50</span></div>
        </div>
        <div class="form-group">
          <label>Output Format</label>
          <select id="format-select" class="select-input">
            <option value="png">PNG (lossless)</option>
            <option value="jpeg" selected>JPEG (smaller file)</option>
            <option value="webp">WebP (modern)</option>
          </select>
        </div>
        <button class="btn btn-primary btn-lg" id="download-btn" style="width:100%;">Download with Border</button>
      </div>
      <div id="preview-area" style="display:none;margin-top:var(--space-6);">
        <h3 style="font-size:var(--text-lg);margin-bottom:var(--space-3);">Preview</h3>
        <canvas id="preview-canvas" style="width:100%;max-width:600px;border:1px solid var(--color-border);border-radius:var(--radius-lg);"></canvas>
      </div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Adding border...</p></div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const countInfo = container.querySelector('#count-info');
  const previewArea = container.querySelector('#preview-area');
  const previewCanvas = container.querySelector('#preview-canvas');
  const widthRange = container.querySelector('#width-range');
  const widthVal = container.querySelector('#width-val');
  const borderColor = container.querySelector('#border-color');
  const borderColorHex = container.querySelector('#border-color-hex');
  const radiusRange = container.querySelector('#radius-range');
  const radiusVal = container.querySelector('#radius-val');
  const shadowToggle = container.querySelector('#shadow-toggle');
  const shadowOptions = container.querySelector('#shadow-options');
  const shadowRange = container.querySelector('#shadow-range');
  const shadowVal = container.querySelector('#shadow-val');
  const downloadBtn = container.querySelector('#download-btn');
  const processing = container.querySelector('#processing');
  const styleButtons = container.querySelector('#style-buttons');

  function renderStyleButtons() {
    styleButtons.innerHTML = '';
    BORDER_STYLES.forEach(style => {
      const btn = document.createElement('button');
      btn.className = `btn ${borderStyle === style.id ? 'btn-primary' : 'btn-secondary'}`;
      btn.style.fontSize = 'var(--text-xs)';
      btn.style.flex = '1';
      btn.style.minWidth = '60px';
      btn.textContent = style.name;
      btn.addEventListener('click', () => {
        borderStyle = style.id;
        renderStyleButtons();
        renderPreview();
      });
      styleButtons.appendChild(btn);
    });
  }

  function drawBorder(ctx, x, y, w, h, borderWidth, color, style, radius) {
    ctx.strokeStyle = color;
    ctx.lineWidth = borderWidth;

    if (radius > 0) {
      const r = Math.min(radius, Math.min(w, h) / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    } else {
      ctx.beginPath();
      ctx.rect(x, y, w, h);
    }

    if (style === 'dashed') {
      ctx.setLineDash([borderWidth * 2, borderWidth]);
    } else if (style === 'dotted') {
      ctx.setLineDash([borderWidth, borderWidth]);
    } else if (style === 'double') {
      ctx.setLineDash([]);
      // Draw double border: outer then inner
      const half = borderWidth / 3;
      ctx.lineWidth = half;
      ctx.stroke();
      ctx.beginPath();
      if (radius > 0) {
        const r = Math.min(radius, Math.min(w, h) / 2) - borderWidth;
        ctx.moveTo(x + borderWidth + r, y + borderWidth);
        ctx.lineTo(x + w - borderWidth - r, y + borderWidth);
        ctx.quadraticCurveTo(x + w - borderWidth, y + borderWidth, x + w - borderWidth, y + borderWidth + r);
        ctx.lineTo(x + w - borderWidth, y + h - borderWidth - r);
        ctx.quadraticCurveTo(x + w - borderWidth, y + h - borderWidth, x + w - borderWidth - r, y + h - borderWidth);
        ctx.lineTo(x + borderWidth + r, y + h - borderWidth);
        ctx.quadraticCurveTo(x + borderWidth, y + h - borderWidth, x + borderWidth, y + h - borderWidth - r);
        ctx.lineTo(x + borderWidth, y + borderWidth + r);
        ctx.quadraticCurveTo(x + borderWidth, y + borderWidth, x + borderWidth + r, y + borderWidth);
      } else {
        ctx.rect(x + borderWidth, y + borderWidth, w - borderWidth * 2, h - borderWidth * 2);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      return;
    } else if (style === 'groove') {
      ctx.setLineDash([]);
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 2;
      ctx.stroke();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      return;
    } else {
      ctx.setLineDash([]);
    }

    ctx.stroke();
    ctx.setLineDash([]);
  }

  function processImage(canvas, width) {
    const borderWidth = parseInt(widthRange.value) || 20;
    const color = borderColor.value;
    const radius = parseInt(radiusRange.value) || 0;
    const shadow = shadowToggle.checked;
    const shadowBlur = parseInt(shadowRange.value) || 15;

    const imgW = originalImage.naturalWidth;
    const imgH = originalImage.naturalHeight;
    const scale = width / imgW;
    const drawW = width;
    const drawH = Math.round(imgH * scale);

    const totalW = drawW + borderWidth * 2;
    const totalH = drawH + borderWidth * 2;

    canvas.width = totalW;
    canvas.height = totalH;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    if (radius > 0) {
      const r = Math.min(radius + borderWidth, Math.min(totalW, totalH) / 2);
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(totalW - r, 0);
      ctx.quadraticCurveTo(totalW, 0, totalW, r);
      ctx.lineTo(totalW, totalH - r);
      ctx.quadraticCurveTo(totalW, totalH, totalW - r, totalH);
      ctx.lineTo(r, totalH);
      ctx.quadraticCurveTo(0, totalH, 0, totalH - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, totalW, totalH);
    }

    // Shadow
    if (shadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = shadowBlur;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = shadowBlur / 3;
    }

    // Clip for rounded corners on image
    if (radius > 0) {
      const r = Math.min(radius, Math.min(drawW, drawH) / 2);
      ctx.beginPath();
      ctx.moveTo(borderWidth + r, borderWidth);
      ctx.lineTo(borderWidth + drawW - r, borderWidth);
      ctx.quadraticCurveTo(borderWidth + drawW, borderWidth, borderWidth + drawW, borderWidth + r);
      ctx.lineTo(borderWidth + drawW, borderWidth + drawH - r);
      ctx.quadraticCurveTo(borderWidth + drawW, borderWidth + drawH, borderWidth + drawW - r, borderWidth + drawH);
      ctx.lineTo(borderWidth + r, borderWidth + drawH);
      ctx.quadraticCurveTo(borderWidth, borderWidth + drawH, borderWidth, borderWidth + drawH - r);
      ctx.lineTo(borderWidth, borderWidth + r);
      ctx.quadraticCurveTo(borderWidth, borderWidth, borderWidth + r, borderWidth);
      ctx.closePath();
      ctx.clip();
    }

    ctx.drawImage(originalImage, borderWidth, borderWidth, drawW, drawH);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Border
    drawBorder(ctx, 0, 0, totalW, totalH, borderWidth, color, borderStyle, radius + borderWidth);
  }

  function renderPreview() {
    if (!originalImage) return;
    processImage(previewCanvas, 500);
  }

  renderStyleButtons();

  widthRange.addEventListener('input', () => {
    widthVal.textContent = widthRange.value;
    renderPreview();
  });

  borderColor.addEventListener('input', () => {
    borderColorHex.textContent = borderColor.value;
    renderPreview();
  });

  radiusRange.addEventListener('input', () => {
    radiusVal.textContent = radiusRange.value;
    renderPreview();
  });

  shadowToggle.addEventListener('change', () => {
    shadowOptions.style.display = shadowToggle.checked ? 'block' : 'none';
    renderPreview();
  });

  shadowRange.addEventListener('input', () => {
    shadowVal.textContent = shadowRange.value;
    renderPreview();
  });

  downloadBtn.addEventListener('click', async () => {
    if (!originalImage) return;
    const format = container.querySelector('#format-select').value;
    const type = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
    const ext = format === 'png' ? 'png' : format === 'webp' ? 'webp' : 'jpg';

    processing.style.display = 'block';

    try {
      const canvas = document.createElement('canvas');
      processImage(canvas, originalImage.naturalWidth);
      const blob = await canvasToBlob(canvas, type, 0.92);
      downloadBlob(blob, `bordered-image.${ext}`);
      showToast({ message: 'Border added!', type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
    }
  });
}

export function destroy() {}
