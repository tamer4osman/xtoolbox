import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { loadImageFromFile, downloadCanvas } from './image-utils.js';

export const toolConfig = {
  id: 'rotate-flip-image',
  name: 'Rotate & Flip Image',
  category: 'image',
  description: 'Rotate images 90°, 180°, 270° or flip horizontally/vertically.',
  icon: '🔄',
  accept: 'image/*',
  maxSizeMB: 50,
  keywords: ['rotate image', 'flip image', 'turn image', 'mirror image'],
  steps: ['Upload an image', 'Click rotate or flip buttons', 'Preview the result', 'Download'],
  faqs: [
    { question: 'Can I combine rotation and flip?', answer: 'Yes. Apply multiple operations before downloading.' }
  ]
};

export function render(container) {
  let originalImg = null;
  let rotation = 0;
  let flipH = false;
  let flipV = false;

  const upload = createFileUpload({
    accept: 'image/*',
    multiple: false,
    maxSizeMB: 50,
    onFilesSelected: async (files) => {
      if (files.length === 0) return;
      originalImg = await loadImageFromFile(files[0]);
      rotation = 0; flipH = false; flipV = false;
      optionsArea.style.display = 'block';
      updatePreview();
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div style="text-align:center;margin:var(--space-4) 0;">
          <div id="preview-container" style="display:inline-block;max-width:100%;max-height:400px;overflow:hidden;border:1px solid var(--color-border);border-radius:var(--radius-md);"></div>
        </div>
        <div style="display:flex;gap:var(--space-2);justify-content:center;flex-wrap:wrap;margin-bottom:var(--space-4);">
          <button class="btn btn-secondary" id="rotate-ccw">↺ 90° Left</button>
          <button class="btn btn-secondary" id="rotate-cw">↻ 90° Right</button>
          <button class="btn btn-secondary" id="rotate-180">↕ 180°</button>
          <button class="btn btn-secondary" id="flip-h">↔ Flip H</button>
          <button class="btn btn-secondary" id="flip-v">↕ Flip V</button>
          <button class="btn btn-ghost" id="reset-btn">Reset</button>
        </div>
        <button class="btn btn-primary btn-lg" id="download-btn" style="width:100%;">Download</button>
      </div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const previewContainer = container.querySelector('#preview-container');
  const downloadBtn = container.querySelector('#download-btn');

  function updatePreview() {
    if (!originalImg) return;
    const isRotated = rotation % 180 !== 0;
    const w = isRotated ? originalImg.naturalHeight : originalImg.naturalWidth;
    const h = isRotated ? originalImg.naturalWidth : originalImg.naturalHeight;
    const scale = Math.min(400 / w, 400 / h, 1);

    const canvas = document.createElement('canvas');
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(originalImg, -originalImg.naturalWidth * scale / 2, -originalImg.naturalHeight * scale / 2, originalImg.naturalWidth * scale, originalImg.naturalHeight * scale);
    ctx.restore();
    previewContainer.innerHTML = '';
    previewContainer.appendChild(canvas);
  }

  container.querySelector('#rotate-ccw').addEventListener('click', () => { rotation = (rotation - 90 + 360) % 360; updatePreview(); });
  container.querySelector('#rotate-cw').addEventListener('click', () => { rotation = (rotation + 90) % 360; updatePreview(); });
  container.querySelector('#rotate-180').addEventListener('click', () => { rotation = (rotation + 180) % 360; updatePreview(); });
  container.querySelector('#flip-h').addEventListener('click', () => { flipH = !flipH; updatePreview(); });
  container.querySelector('#flip-v').addEventListener('click', () => { flipV = !flipV; updatePreview(); });
  container.querySelector('#reset-btn').addEventListener('click', () => { rotation = 0; flipH = false; flipV = false; updatePreview(); });

  downloadBtn.addEventListener('click', () => {
    if (!originalImg) return;
    const isRotated = rotation % 180 !== 0;
    const w = isRotated ? originalImg.naturalHeight : originalImg.naturalWidth;
    const h = isRotated ? originalImg.naturalWidth : originalImg.naturalHeight;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(originalImg, -originalImg.naturalWidth / 2, -originalImg.naturalHeight / 2);
    ctx.restore();
    downloadCanvas(canvas, 'rotated-image.png');
    showToast({ message: 'Downloaded!', type: 'success' });
  });
}

export function destroy() {}
