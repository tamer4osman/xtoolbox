import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { loadImageFromFile, canvasToBlob } from './image-utils.js';

export const toolConfig = {
  id: 'round-image-cropper',
  name: 'Round Image Cropper',
  category: 'image',
  description: 'Crop images into perfect circles with customizable border, shadow, and background options.',
  icon: '⭕',
  accept: 'image/*',
  maxSizeMB: 50,
  keywords: ['round crop', 'circle crop', 'avatar maker', 'profile picture', 'circular image'],
  steps: ['Upload an image', 'Adjust crop area and size', 'Set border width and color', 'Add optional shadow', 'Download the circular image'],
  faqs: [
    { question: 'What format should I download in?', answer: 'Use PNG for transparent backgrounds. JPEG will fill transparent areas with white.' },
    { question: 'Can I add a colored border?', answer: 'Yes, you can add a solid border with any color and width.' }
  ]
};

export function render(container) {
  let originalImage = null;

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
          <label>Output Size (px)</label>
          <input type="range" id="size-range" min="64" max="2000" value="500" step="16" style="width:100%;">
          <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-secondary);"><span>64</span><span id="size-val">500</span><span>2000</span></div>
        </div>
        <div class="form-group">
          <label>Crop Position X (%)</label>
          <input type="range" id="pos-x-range" min="0" max="100" value="50" style="width:100%;">
          <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-secondary);"><span>Left</span><span id="pos-x-val">Center</span><span>Right</span></div>
        </div>
        <div class="form-group">
          <label>Crop Position Y (%)</label>
          <input type="range" id="pos-y-range" min="0" max="100" value="50" style="width:100%;">
          <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-secondary);"><span>Top</span><span id="pos-y-val">Center</span><span>Bottom</span></div>
        </div>
        <div class="form-group">
          <label>Zoom (%)</label>
          <input type="range" id="zoom-range" min="50" max="200" value="100" style="width:100%;">
          <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-secondary);"><span>50</span><span id="zoom-val">100</span><span>200</span></div>
        </div>
        <div class="form-group">
          <label>Border Width (px)</label>
          <input type="range" id="border-range" min="0" max="50" value="0" style="width:100%;">
          <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-secondary);"><span>0</span><span id="border-val">0</span><span>50</span></div>
        </div>
        <div class="form-group">
          <label>Border Color</label>
          <div style="display:flex;gap:8px;align-items:center;">
            <input type="color" id="border-color" value="#000000" style="width:60px;height:36px;border:1px solid var(--color-border);border-radius:var(--radius-md);cursor:pointer;">
            <span id="border-color-hex" style="font-size:var(--text-sm);color:var(--color-text-secondary);">#000000</span>
          </div>
        </div>
        <div class="form-group">
          <label>Background</label>
          <select id="bg-select" class="select-input">
            <option value="transparent">Transparent</option>
            <option value="white">White</option>
            <option value="black">Black</option>
            <option value="custom">Custom Color</option>
          </select>
        </div>
        <div class="form-group" id="custom-bg-group" style="display:none;">
          <label>Background Color</label>
          <input type="color" id="bg-color" value="#ffffff" style="width:60px;height:36px;border:1px solid var(--color-border);border-radius:var(--radius-md);cursor:pointer;">
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
            <option value="png">PNG (transparent support)</option>
            <option value="webp">WebP (transparent support)</option>
            <option value="jpeg">JPEG (white background)</option>
          </select>
        </div>
        <button class="btn btn-primary btn-lg" id="download-btn" style="width:100%;">Download Circle Crop</button>
      </div>
      <div id="preview-area" style="display:none;margin-top:var(--space-6);">
        <h3 style="font-size:var(--text-lg);margin-bottom:var(--space-3);">Preview</h3>
        <canvas id="preview-canvas" style="width:100%;max-width:400px;border:1px solid var(--color-border);border-radius:var(--radius-lg);"></canvas>
      </div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Cropping...</p></div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const countInfo = container.querySelector('#count-info');
  const previewArea = container.querySelector('#preview-area');
  const previewCanvas = container.querySelector('#preview-canvas');
  const sizeRange = container.querySelector('#size-range');
  const sizeVal = container.querySelector('#size-val');
  const posXRange = container.querySelector('#pos-x-range');
  const posXVal = container.querySelector('#pos-x-val');
  const posYRange = container.querySelector('#pos-y-range');
  const posYVal = container.querySelector('#pos-y-val');
  const zoomRange = container.querySelector('#zoom-range');
  const zoomVal = container.querySelector('#zoom-val');
  const borderRange = container.querySelector('#border-range');
  const borderVal = container.querySelector('#border-val');
  const borderColor = container.querySelector('#border-color');
  const borderColorHex = container.querySelector('#border-color-hex');
  const bgSelect = container.querySelector('#bg-select');
  const customBgGroup = container.querySelector('#custom-bg-group');
  const bgColor = container.querySelector('#bg-color');
  const shadowToggle = container.querySelector('#shadow-toggle');
  const shadowOptions = container.querySelector('#shadow-options');
  const shadowRange = container.querySelector('#shadow-range');
  const shadowVal = container.querySelector('#shadow-val');
  const downloadBtn = container.querySelector('#download-btn');
  const processing = container.querySelector('#processing');

  function processImage(canvas, outputSize) {
    const borderWidth = parseInt(borderRange.value) || 0;
    const borderCol = borderColor.value;
    const bg = bgSelect.value;
    const bgCol = bgColor.value;
    const shadow = shadowToggle.checked;
    const shadowBlur = parseInt(shadowRange.value) || 15;
    const posX = parseInt(posXRange.value) / 100;
    const posY = parseInt(posYRange.value) / 100;
    const zoom = parseInt(zoomRange.value) / 100;

    const totalSize = outputSize + borderWidth * 2;
    canvas.width = totalSize;
    canvas.height = totalSize;
    const ctx = canvas.getContext('2d');

    // Background
    if (bg === 'white') {
      ctx.fillStyle = '#ffffff';
    } else if (bg === 'black') {
      ctx.fillStyle = '#000000';
    } else if (bg === 'custom') {
      ctx.fillStyle = bgCol;
    } else {
      ctx.fillStyle = 'transparent';
    }

    // Draw circular background
    const center = totalSize / 2;
    const radius = totalSize / 2;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fill();

    // Shadow
    if (shadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = shadowBlur;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = shadowBlur / 3;
    }

    // Clip to circle
    ctx.beginPath();
    ctx.arc(center, center, outputSize / 2);
    ctx.clip();

    // Calculate image draw
    const imgW = originalImage.naturalWidth;
    const imgH = originalImage.naturalHeight;
    const minDim = Math.min(imgW, imgH);
    const cropSize = minDim / zoom;
    const cropX = (imgW - cropSize) * posX;
    const cropY = (imgH - cropSize) * posY;

    ctx.drawImage(
      originalImage,
      cropX, cropY, cropSize, cropSize,
      borderWidth, borderWidth, outputSize, outputSize
    );

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Border
    if (borderWidth > 0) {
      ctx.strokeStyle = borderCol;
      ctx.lineWidth = borderWidth;
      ctx.beginPath();
      ctx.arc(center, center, outputSize / 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function renderPreview() {
    if (!originalImage) return;
    processImage(previewCanvas, 300);
  }

  sizeRange.addEventListener('input', () => {
    sizeVal.textContent = sizeRange.value;
    renderPreview();
  });

  posXRange.addEventListener('input', () => {
    const v = parseInt(posXRange.value);
    posXVal.textContent = v < 35 ? 'Left' : v > 65 ? 'Right' : 'Center';
    renderPreview();
  });

  posYRange.addEventListener('input', () => {
    const v = parseInt(posYRange.value);
    posYVal.textContent = v < 35 ? 'Top' : v > 65 ? 'Bottom' : 'Center';
    renderPreview();
  });

  zoomRange.addEventListener('input', () => {
    zoomVal.textContent = zoomRange.value;
    renderPreview();
  });

  borderRange.addEventListener('input', () => {
    borderVal.textContent = borderRange.value;
    renderPreview();
  });

  borderColor.addEventListener('input', () => {
    borderColorHex.textContent = borderColor.value;
    renderPreview();
  });

  bgSelect.addEventListener('change', () => {
    customBgGroup.style.display = bgSelect.value === 'custom' ? 'block' : 'none';
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
    const outputSize = parseInt(sizeRange.value) || 500;
    const format = container.querySelector('#format-select').value;
    const type = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
    const ext = format === 'png' ? 'png' : format === 'webp' ? 'webp' : 'jpg';

    processing.style.display = 'block';

    try {
      const canvas = document.createElement('canvas');
      processImage(canvas, outputSize);
      const blob = await canvasToBlob(canvas, type, 0.92);
      downloadBlob(blob, `circle-crop.${ext}`);
      showToast({ message: 'Circle crop saved!', type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
    }
  });
}

export function destroy() {}
