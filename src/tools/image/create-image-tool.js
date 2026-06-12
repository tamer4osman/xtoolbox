import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { loadImageFromFile, downloadCanvas } from './image-utils.js';

export function createImageTool({
  optionsHTML,
  drawEffect,
  previewScale = 500,
  filename = 'image.png',
  accept = 'image/*',
  maxSizeMB = 50,
  previewStyle = 'text-align:center;margin:var(--space-4) 0;',
  getDimensions,
  onUpload,
  onReady,
  destroy: onDestroy,
}) {
  return function render(container) {
    let originalImg = null;

    const upload = createFileUpload({
      accept,
      multiple: false,
      maxSizeMB,
      onFilesSelected: async (files) => {
        if (files.length === 0) return;
        originalImg = await loadImageFromFile(files[0]);
        if (onUpload) onUpload();
        optionsArea.style.display = 'block';
        updatePreview();
      }
    });

    container.innerHTML = `
      <div class="tool-layout">
        <div class="tool-upload-area" id="upload-area"></div>
        <div class="tool-options" id="options-area" style="display:none;">
          <div id="preview-area" style="${previewStyle}"></div>
          ${optionsHTML}
          <button class="btn btn-primary btn-lg" id="download-btn" style="width:100%;">Download</button>
        </div>
      </div>
    `;

    container.querySelector('#upload-area').appendChild(upload.element);
    const optionsArea = container.querySelector('#options-area');
    const previewArea = container.querySelector('#preview-area');
    const downloadBtn = container.querySelector('#download-btn');

    const tctx = {
      container,
      getValue: (id) => container.querySelector(`#${id}`).value,
      setText: (id, text) => { container.querySelector(`#${id}`).textContent = text; },
      query: (sel) => container.querySelector(sel),
    };

    function updatePreview() {
      if (!originalImg) return;
      const dims = getDimensions
        ? getDimensions(originalImg, previewScale)
        : { w: originalImg.naturalWidth, h: originalImg.naturalHeight };
      const scale = Math.min(previewScale / dims.w, previewScale / dims.h, 1);
      const canvas = document.createElement('canvas');
      canvas.width = dims.w * scale;
      canvas.height = dims.h * scale;
      const ctx = canvas.getContext('2d');
      drawEffect(ctx, canvas.width, canvas.height, scale, tctx, originalImg);
      previewArea.innerHTML = '';
      previewArea.appendChild(canvas);
    }

    downloadBtn.addEventListener('click', () => {
      if (!originalImg) return;
      const dims = getDimensions
        ? getDimensions(originalImg, Infinity)
        : { w: originalImg.naturalWidth, h: originalImg.naturalHeight };
      const canvas = document.createElement('canvas');
      canvas.width = dims.w;
      canvas.height = dims.h;
      const ctx = canvas.getContext('2d');
      drawEffect(ctx, dims.w, dims.h, 1, tctx, originalImg);
      const name = typeof filename === 'function' ? filename(tctx) : filename;
      downloadCanvas(canvas, name);
      showToast({ message: 'Downloaded!', type: 'success' });
    });

    if (onReady) onReady({ container, tctx, updatePreview });
    if (onDestroy) container._destroy = onDestroy;
  };
}
