import { createFileUpload } from '../../components/file-upload.js';
import { loadImageFromFile, canvasToBlob } from './image-utils.js';
import { setupPreviewCanvas, attachDragSelection } from './pixel-tool-utils.js';
import { downloadBlob } from '../../utils/file.js';
import { showToast } from '../../components/toast.js';

export const toolConfig = {
  id: 'remove-text-image',
  name: 'Remove Text from Image',
  category: 'image',
  description: 'Remove unwanted text from images by selecting the area. Uses content-aware fill to blend the background.',
  icon: '🧹',
  accept: 'image/*',
  maxSizeMB: 50,
  keywords: ['remove text', 'erase text', 'content aware fill', 'inpaint', 'clean image'],
  steps: ['Upload an image', 'Draw a selection over the text you want to remove', 'Apply the removal', 'Download the cleaned image'],
  faqs: [
    { question: 'How does text removal work?', answer: 'This tool uses a content-aware fill technique that samples pixels from around the selected area and blends them to fill the gap, making the removal look natural.' },
    { question: 'Can it remove any text?', answer: 'It works best on simple backgrounds. Complex or textured backgrounds may require multiple smaller selections for best results.' }
  ]
};

export function render(container) {
  let originalImage = null;
  let selection = null;

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
      actionsArea.style.display = 'flex';
      renderPreview();
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);" id="count-info">-</div>
        <div class="form-group">
          <label>Instructions</label>
          <p style="font-size:var(--text-xs);color:var(--color-text-secondary);margin:0;">Click and drag on the image to draw a rectangle over the text you want to remove. The selected area will be filled using surrounding pixels.</p>
        </div>
        <div style="display:flex;gap:8px;">
          <button id="clear-selection-btn" class="btn btn-sm btn-secondary">Clear Selection</button>
          <button id="apply-btn" class="btn btn-sm btn-primary">🧹 Remove Text</button>
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
  const previewCanvas = container.querySelector('#preview-canvas');
  const downloadBtn = container.querySelector('#download-btn');
  const clearBtn = container.querySelector('#clear-selection-btn');
  const applyBtn = container.querySelector('#apply-btn');

  uploadArea.appendChild(upload.element);

  attachDragSelection(previewCanvas, (sel) => {
    selection = sel;
    renderPreview();
  });

  clearBtn.addEventListener('click', () => {
    selection = null;
    renderPreview();
  });

  applyBtn.addEventListener('click', async () => {
    if (!originalImage || !selection) {
      showToast('Please select an area first by drawing on the image.', 'warning');
      return;
    }

    applyBtn.disabled = true;
    applyBtn.textContent = 'Processing...';

    try {
      const canvas = document.createElement('canvas');
      canvas.width = originalImage.naturalWidth;
      canvas.height = originalImage.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(originalImage, 0, 0);

      const scaleX = originalImage.naturalWidth / previewCanvas.width;
      const scaleY = originalImage.naturalHeight / previewCanvas.height;

      const sel = {
        x: Math.round(selection.x * scaleX),
        y: Math.round(selection.y * scaleY),
        w: Math.round(selection.w * scaleX),
        h: Math.round(selection.h * scaleY)
      };

      applyContentAwareFill(ctx, canvas.width, canvas.height, sel);
      selection = null;

      const blob = await canvasToBlob(canvas, 'image/png');
      downloadBlob(blob, 'text-removed.png');
      showToast('Text removed successfully!', 'success');

      originalImage = await loadImageFromFile(blob);
      renderPreview();
    } catch (err) {
      showToast('Failed to remove text: ' + err.message, 'error');
    }

    applyBtn.disabled = false;
    applyBtn.textContent = '🧹 Remove Text';
  });

  downloadBtn.addEventListener('click', async () => {
    if (!originalImage) return;
    const blob = await canvasToBlob(previewCanvas, 'image/png');
    downloadBlob(blob, 'text-removed.png');
    showToast('Image downloaded!', 'success');
  });

  function renderPreview() {
    if (!originalImage) return;
    setupPreviewCanvas(previewCanvas, originalImage, container);

    if (selection && selection.w > 2 && selection.h > 2) {
      const ctx = previewCanvas.getContext('2d');
      ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
      ctx.fillRect(selection.x, selection.y, selection.w, selection.h);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(selection.x, selection.y, selection.w, selection.h);
      ctx.setLineDash([]);
    }
  }

  function applyContentAwareFill(ctx, w, h, sel) {
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    const result = new Uint8ClampedArray(data);
    const cx = sel.x + sel.w / 2;
    const cy = sel.y + sel.h / 2;

    for (let y = sel.y; y < sel.y + sel.h; y++) {
      for (let x = sel.x; x < sel.x + sel.w; x++) {
        if (x < 0 || x >= w || y < 0 || y >= h) continue;

        const dx = (x - cx) / (sel.w / 2);
        const dy = (y - cy) / (sel.h / 2);

        const wLeft = (1 - dx) / 2;
        const wRight = (1 + dx) / 2;
        const wTop = (1 - dy) / 2;
        const wBottom = (1 + dy) / 2;

        const topIdx = (sel.y * w + x) * 4;
        const bottomIdx = ((sel.y + sel.h - 1) * w + x) * 4;
        const leftIdx = (y * w + sel.x) * 4;
        const rightIdx = (y * w + sel.x + sel.w - 1) * 4;

        const totalW = wLeft + wRight + wTop + wBottom;

        const idx = (y * w + x) * 4;
        result[idx] = Math.round(
          (data[leftIdx] * wLeft + data[rightIdx] * wRight +
           data[topIdx] * wTop + data[bottomIdx] * wBottom) / totalW
        );
        result[idx + 1] = Math.round(
          (data[leftIdx + 1] * wLeft + data[rightIdx + 1] * wRight +
           data[topIdx + 1] * wTop + data[bottomIdx + 1] * wBottom) / totalW
        );
        result[idx + 2] = Math.round(
          (data[leftIdx + 2] * wLeft + data[rightIdx + 2] * wRight +
           data[topIdx + 2] * wTop + data[bottomIdx + 2] * wBottom) / totalW
        );
      }
    }

    for (let pass = 0; pass < 8; pass++) {
      const temp = new Uint8ClampedArray(result);
      for (let y = sel.y + 1; y < sel.y + sel.h - 1; y++) {
        for (let x = sel.x + 1; x < sel.x + sel.w - 1; x++) {
          if (x < 0 || x >= w || y < 0 || y >= h) continue;
          const cIdx = (y * w + x) * 4;
          for (let c = 0; c < 3; c++) {
            result[cIdx + c] = Math.round(
              (temp[((y - 1) * w + x) * 4 + c] +
               temp[((y + 1) * w + x) * 4 + c] +
               temp[(y * w + x - 1) * 4 + c] +
               temp[(y * w + x + 1) * 4 + c] +
               temp[cIdx + c] * 4) / 8
            );
          }
        }
      }
    }

    ctx.putImageData(new ImageData(result, w, h), 0, 0);
  }
}
