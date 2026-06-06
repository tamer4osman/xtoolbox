import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { loadImageFromFile, downloadCanvas } from './image-utils.js';

export function createImageFilterTool({ optionsHTML, getFilter, filename, onReady, accept = 'image/*', maxSizeMB = 50 }) {
  return function render(container) {
    let originalImg = null;

    const upload = createFileUpload({
      accept,
      multiple: false,
      maxSizeMB,
      onFilesSelected: async (files) => {
        if (files.length === 0) return;
        originalImg = await loadImageFromFile(files[0]);
        optionsArea.style.display = 'block';
        updatePreview();
      }
    });

    container.innerHTML = `
      <div class="tool-layout">
        <div class="tool-upload-area" id="upload-area"></div>
        <div class="tool-options" id="options-area" style="display:none;">
          <div id="preview-area" style="text-align:center;margin:var(--space-4) 0;"></div>
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
      setText: (id, text) => { container.querySelector(`#${id}`).textContent = text; }
    };

    function updatePreview() {
      if (!originalImg) return;
      const scale = Math.min(500 / originalImg.naturalWidth, 1);
      const canvas = document.createElement('canvas');
      canvas.width = originalImg.naturalWidth * scale;
      canvas.height = originalImg.naturalHeight * scale;
      const c2d = canvas.getContext('2d');
      c2d.filter = getFilter(tctx);
      c2d.drawImage(originalImg, 0, 0, canvas.width, canvas.height);
      previewArea.innerHTML = '';
      previewArea.appendChild(canvas);
    }

    downloadBtn.addEventListener('click', () => {
      if (!originalImg) return;
      const canvas = document.createElement('canvas');
      canvas.width = originalImg.naturalWidth;
      canvas.height = originalImg.naturalHeight;
      const c2d = canvas.getContext('2d');
      c2d.filter = getFilter(tctx);
      c2d.drawImage(originalImg, 0, 0);
      const name = typeof filename === 'function' ? filename(tctx) : filename;
      downloadCanvas(canvas, name);
      showToast({ message: 'Downloaded!', type: 'success' });
    });

    if (onReady) onReady({ container, tctx, updatePreview });
  };
}
