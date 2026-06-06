import { createFileUpload } from '../../components/file-upload.js';
import { loadImageFromFile } from './image-utils.js';
import { setupPreviewCanvas, downloadTransformedImage } from './pixel-tool-utils.js';
import { showToast } from '../../components/toast.js';

export const toolConfig = {
  id: 'image-sharpening',
  name: 'Image Sharpening',
  category: 'image',
  description: 'Sharpen blurry or soft images using convolution filters. Adjust intensity and preview results in real-time.',
  icon: '🔍',
  accept: 'image/*',
  maxSizeMB: 50,
  keywords: ['sharpen image', 'unsharp mask', 'image clarity', 'enhance photo', 'fix blur'],
  steps: ['Upload an image', 'Adjust sharpening intensity', 'Preview the result', 'Download the sharpened image'],
  faqs: [
    { question: 'Can this fix severely blurry images?', answer: 'Sharpening enhances existing edges but cannot recover lost detail. It works best for slightly soft or out-of-focus images.' },
    { question: 'What sharpening method is used?', answer: 'This tool uses an unsharp mask technique — a high-pass filter that enhances edge contrast while preserving smooth areas.' }
  ]
};

export function render(container) {
  let originalImage = null;
  let intensity = 1.5;

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
          <label>Sharpening Intensity: <span id="intensity-val">1.5</span></label>
          <input type="range" id="intensity-range" min="0.1" max="5" step="0.1" value="1.5" style="width:100%;">
        </div>
        <div style="display:flex;gap:8px;">
          <button id="compare-btn" class="btn btn-sm btn-secondary">👁️ Show Original</button>
        </div>
      </div>
      <div class="tool-preview" id="preview-area" style="display:none;">
        <canvas id="preview-canvas" style="max-width:100%;border:1px solid var(--color-border);border-radius:8px;display:block;margin:0 auto;"></canvas>
      </div>
      <div class="tool-actions" id="actions-area" style="display:none;">
        <button id="download-btn" class="btn btn-primary">Download</button>
      </div>
    </div>
  `;

  const uploadArea = container.querySelector('#upload-area');
  const optionsArea = container.querySelector('#options-area');
  const previewArea = container.querySelector('#preview-area');
  const countInfo = container.querySelector('#count-info');
  const intensityRange = container.querySelector('#intensity-range');
  const intensityVal = container.querySelector('#intensity-val');
  const previewCanvas = container.querySelector('#preview-canvas');
  const downloadBtn = container.querySelector('#download-btn');
  const compareBtn = container.querySelector('#compare-btn');

  uploadArea.appendChild(upload.element);

  intensityRange.addEventListener('input', () => {
    intensity = parseFloat(intensityRange.value);
    intensityVal.textContent = intensity.toFixed(1);
    renderPreview();
  });

  let showingOriginal = false;
  compareBtn.addEventListener('click', () => {
    showingOriginal = !showingOriginal;
    compareBtn.textContent = showingOriginal ? '👁️ Show Sharpened' : '👁️ Show Original';
    renderPreview();
  });

  downloadBtn.addEventListener('click', async () => {
    if (!originalImage) return;
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Processing...';
    try {
      await downloadTransformedImage(
        originalImage,
        (ctx, w, h) => applySharpening(ctx, w, h, intensity),
        'sharpened.png',
        'Image sharpened successfully!'
      );
    } catch (err) {
      showToast('Failed to sharpen image: ' + err.message, 'error');
    }
    downloadBtn.disabled = false;
    downloadBtn.textContent = 'Download';
  });

  function renderPreview() {
    if (!originalImage) return;
    const { width: displayW, height: displayH } = setupPreviewCanvas(previewCanvas, originalImage, container);
    if (!showingOriginal && intensity > 0) {
      const ctx = previewCanvas.getContext('2d');
      applySharpening(ctx, displayW, displayH, intensity);
    }
  }

  function applySharpening(ctx, w, h, amount) {
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const copy = new Uint8ClampedArray(data);

    const kernel = [
      0, -1, 0,
      -1, 4 + (1 / amount), -1,
      0, -1, 0
    ];

    const scale = amount;

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * w + (x + kx)) * 4 + c;
              sum += copy[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
            }
          }
          const idx = (y * w + x) * 4 + c;
          data[idx] = Math.min(255, Math.max(0, copy[idx] + (sum - copy[idx]) * scale * 0.25));
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }
}
