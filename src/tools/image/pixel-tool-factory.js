import { createFileUpload } from '../../components/file-upload.js';
import { loadImageFromFile } from './image-utils.js';
import { setupPreviewCanvas, downloadTransformedImage } from './pixel-tool-utils.js';
import { showToast } from '../../components/toast.js';

export function createPixelTool(config) {
  return {
    toolConfig: config.toolConfig,
    render(container) {
      let originalImage = null;

      const upload = createFileUpload({
        accept: config.accept || 'image/*',
        multiple: false,
        maxSizeMB: config.maxSizeMB || 50,
        onFilesSelected: async (files) => {
          originalImage = await loadImageFromFile(files[0]);
          countInfo.textContent = `${originalImage.naturalWidth}×${originalImage.naturalHeight}px`;
          optionsArea.style.display = 'block';
          previewArea.style.display = 'block';
          actionsArea.style.display = 'block';
          config.onImageLoaded?.(originalImage);
          renderPreview();
        }
      });

      container.innerHTML = `
        <div class="tool-layout">
          <div class="tool-upload-area" id="upload-area"></div>
          <div class="tool-options" id="options-area" style="display:none;">
            <div style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);" id="count-info">-</div>
            ${config.optionsHTML || ''}
          </div>
          <div class="tool-preview" id="preview-area" style="display:none;">
            <canvas id="preview-canvas" style="max-width:100%;border:1px solid var(--color-border);border-radius:8px;display:block;margin:0 auto;cursor:${config.selectionEnabled ? 'crosshair' : 'default'};"></canvas>
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

      uploadArea.appendChild(upload.element);

      config.initControls?.(container, renderPreview);

      downloadBtn.addEventListener('click', async () => {
        if (!originalImage) return;
        downloadBtn.disabled = true;
        downloadBtn.textContent = 'Processing...';
        try {
          await downloadTransformedImage(
            originalImage,
            (ctx, w, h) => config.applyTransform(ctx, w, h, container),
            config.outputFilename || 'output.png',
            config.successMessage || 'Image processed successfully!'
          );
        } catch (err) {
          showToast('Failed to process image: ' + err.message, 'error');
        }
        downloadBtn.disabled = false;
        downloadBtn.textContent = 'Download';
      });

      function renderPreview() {
        if (!originalImage) return;
        const { scale } = setupPreviewCanvas(previewCanvas, originalImage, container);
        config.renderPreview?.(previewCanvas, originalImage, scale, container);
      }
    }
  };
}
