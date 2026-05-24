import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { loadImageFromFile, canvasToBlob } from './image-utils.js';

export const toolConfig = {
  id: 'pixelate-image',
  name: 'Pixelate Image',
  category: 'image',
  description: 'Apply pixelation/mosaic effect to images. Adjust pixel size, select regions, and control intensity.',
  icon: '🔲',
  accept: 'image/*',
  maxSizeMB: 50,
  keywords: ['pixelate', 'mosaic', 'censor', 'blur pixels', 'pixel effect'],
  steps: ['Upload an image', 'Adjust pixel size', 'Choose full image or select region', 'Download the result'],
  faqs: [
    { question: 'Can I pixelate only part of the image?', answer: 'Yes, you can choose to pixelate the entire image or draw a selection rectangle to pixelate only a specific area.' },
    { question: 'What is the maximum pixel size?', answer: 'You can set pixel size from 2px up to 100px for extreme pixelation effects.' }
  ]
};

export function render(container) {
  let originalImage = null;
  let pixelSize = 10;
  let pixelateMode = 'full';
  let selectMode = false;
  let selection = null;
  let isSelecting = false;
  let selStart = { x: 0, y: 0 };

  const upload = createFileUpload({
    accept: 'image/*',
    multiple: false,
    maxSizeMB: 50,
    onFilesSelected: async (files) => {
      originalImage = await loadImageFromFile(files[0]);
      selection = null;
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
          <label>Pixelate Mode</label>
          <div id="mode-buttons" style="display:flex;gap:8px;flex-wrap:wrap;"></div>
        </div>
        <div class="form-group">
          <label>Pixel Size: <span id="pixel-val">10</span>px</label>
          <input type="range" id="pixel-range" min="2" max="100" value="10" style="width:100%;">
        </div>
        <div class="form-group" id="select-hint" style="display:none;">
          <label>Selection</label>
          <p style="font-size:var(--text-xs);color:var(--color-text-secondary);margin:0;">Click and drag on the preview to select the area to pixelate. <button id="clear-selection" style="background:var(--color-bg-tertiary);border:1px solid var(--color-border);color:var(--color-text);padding:2px 8px;border-radius:4px;cursor:pointer;font-size:var(--text-xs);">Clear Selection</button></p>
        </div>
      </div>
      <div class="tool-preview" id="preview-area" style="display:none;">
        <canvas id="preview-canvas" style="max-width:100%;border:1px solid var(--color-border);border-radius:8px;display:block;margin:0 auto;cursor:crosshair;"></canvas>
      </div>
      <div class="tool-actions" id="actions-area" style="display:none;">
        <button id="download-btn" class="btn btn-primary">Download</button>
      </div>
    </div>
  `;

  const uploadArea = container.querySelector('#upload-area');
  const optionsArea = container.querySelector('#options-area');
  const previewArea = container.querySelector('#preview-area');
  const actionsArea = container.querySelector('#actions-area');
  const countInfo = container.querySelector('#count-info');
  const modeButtons = container.querySelector('#mode-buttons');
  const pixelRange = container.querySelector('#pixel-range');
  const pixelVal = container.querySelector('#pixel-val');
  const previewCanvas = container.querySelector('#preview-canvas');
  const downloadBtn = container.querySelector('#download-btn');
  const selectHint = container.querySelector('#select-hint');
  const clearSelectionBtn = container.querySelector('#clear-selection');

  uploadArea.appendChild(upload.element);

  const modes = [
    { id: 'full', label: 'Full Image', icon: '🖼️' },
    { id: 'select', label: 'Select Region', icon: '✂️' }
  ];

  modes.forEach(mode => {
    const btn = document.createElement('button');
    btn.className = `btn btn-sm${mode.id === pixelateMode ? ' btn-primary' : ' btn-secondary'}`;
    btn.innerHTML = `${mode.icon} ${mode.label}`;
    btn.addEventListener('click', () => {
      pixelateMode = mode.id;
      selectMode = mode.id === 'select';
      selectHint.style.display = selectMode ? 'block' : 'none';
      if (!selectMode) selection = null;
      previewCanvas.style.cursor = selectMode ? 'crosshair' : 'default';
      modeButtons.querySelectorAll('.btn').forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-secondary');
      });
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-primary');
      renderPreview();
    });
    modeButtons.appendChild(btn);
  });

  pixelRange.addEventListener('input', () => {
    pixelSize = parseInt(pixelRange.value);
    pixelVal.textContent = pixelSize;
    renderPreview();
  });

  clearSelectionBtn?.addEventListener('click', () => {
    selection = null;
    renderPreview();
  });

  previewCanvas.addEventListener('mousedown', (e) => {
    if (!selectMode || !originalImage) return;
    isSelecting = true;
    const rect = previewCanvas.getBoundingClientRect();
    const scaleX = previewCanvas.width / rect.width;
    const scaleY = previewCanvas.height / rect.height;
    selStart = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
    selection = null;
  });

  previewCanvas.addEventListener('mousemove', (e) => {
    if (!isSelecting || !originalImage) return;
    const rect = previewCanvas.getBoundingClientRect();
    const scaleX = previewCanvas.width / rect.width;
    const scaleY = previewCanvas.height / rect.height;
    const current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
    selection = {
      x: Math.min(selStart.x, current.x),
      y: Math.min(selStart.y, current.y),
      w: Math.abs(current.x - selStart.x),
      h: Math.abs(current.y - selStart.y)
    };
    renderPreview();
  });

  previewCanvas.addEventListener('mouseup', () => {
    isSelecting = false;
    if (selection && (selection.w < 5 || selection.h < 5)) {
      selection = null;
      renderPreview();
    }
  });

  previewCanvas.addEventListener('mouseleave', () => {
    isSelecting = false;
  });

  downloadBtn.addEventListener('click', async () => {
    if (!originalImage) return;
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Processing...';

    try {
      const canvas = document.createElement('canvas');
      canvas.width = originalImage.naturalWidth;
      canvas.height = originalImage.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(originalImage, 0, 0);
      applyPixelation(ctx, canvas.width, canvas.height);
      const blob = await canvasToBlob(canvas, 'image/png');
      downloadBlob(blob, 'pixelated.png');
      showToast('Image pixelated successfully!', 'success');
    } catch (err) {
      showToast('Failed to pixelate image: ' + err.message, 'error');
    }

    downloadBtn.disabled = false;
    downloadBtn.textContent = 'Download';
  });

  function renderPreview() {
    if (!originalImage) return;

    const maxW = Math.min(600, container.parentElement.clientWidth - 40);
    const scale = maxW / originalImage.naturalWidth;
    const displayW = Math.round(originalImage.naturalWidth * scale);
    const displayH = Math.round(originalImage.naturalHeight * scale);

    previewCanvas.width = displayW;
    previewCanvas.height = displayH;

    const ctx = previewCanvas.getContext('2d');
    ctx.clearRect(0, 0, displayW, displayH);
    ctx.drawImage(originalImage, 0, 0, displayW, displayH);

    if (pixelSize > 1) {
      if (pixelateMode === 'full') {
        applyPixelation(ctx, displayW, displayH);
      } else if (pixelateMode === 'select' && selection && selection.w > 2 && selection.h > 2) {
        const scaledSel = {
          x: selection.x * scale,
          y: selection.y * scale,
          w: selection.w * scale,
          h: selection.h * scale
        };
        ctx.save();
        ctx.beginPath();
        ctx.rect(scaledSel.x, scaledSel.y, scaledSel.w, scaledSel.h);
        ctx.clip();
        applyPixelation(ctx, displayW, displayH);
        ctx.restore();

        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.strokeRect(scaledSel.x, scaledSel.y, scaledSel.w, scaledSel.h);
        ctx.setLineDash([]);
      }
    }
  }

  function applyPixelation(ctx, w, h) {
    const size = pixelSize;
    if (size <= 1) return;

    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    for (let y = 0; y < h; y += size) {
      for (let x = 0; x < w; x += size) {
        let r = 0, g = 0, b = 0, a = 0, count = 0;

        for (let dy = 0; dy < size && y + dy < h; dy++) {
          for (let dx = 0; dx < size && x + dx < w; dx++) {
            const idx = ((y + dy) * w + (x + dx)) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            a += data[idx + 3];
            count++;
          }
        }

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        a = Math.round(a / count);

        for (let dy = 0; dy < size && y + dy < h; dy++) {
          for (let dx = 0; dx < size && x + dx < w; dx++) {
            const idx = ((y + dy) * w + (x + dx)) * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = a;
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }
}
