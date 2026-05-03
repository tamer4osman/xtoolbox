import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { loadImageFromFile, downloadCanvas } from './image-utils.js';

export const toolConfig = {
  id: 'watermark-image',
  name: 'Add Watermark to Image',
  category: 'image',
  description: 'Add text or logo watermark to images. Adjustable position and opacity.',
  icon: '💧',
  accept: 'image/*',
  maxSizeMB: 50,
  keywords: ['watermark image', 'image watermark', 'photo watermark'],
  steps: ['Upload an image', 'Enter watermark text', 'Choose position, size, and opacity', 'Download'],
  faqs: [
    { question: 'Can I use a logo as watermark?', answer: 'Currently text watermarks are supported. Logo support coming soon.' }
  ]
};

export function render(container) {
  let originalImg = null;

  const upload = createFileUpload({
    accept: 'image/*',
    multiple: false,
    maxSizeMB: 50,
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
        <div class="form-group"><label>Watermark Text</label><input type="text" id="wm-text" class="text-input" value="© Your Name" placeholder="Enter watermark text"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
          <div class="form-group"><label>Font Size</label>
            <select id="wm-size" class="select-input">
              <option value="small">Small</option>
              <option value="medium" selected>Medium</option>
              <option value="large">Large</option>
              <option value="xlarge">Extra Large</option>
            </select>
          </div>
          <div class="form-group"><label>Opacity</label>
            <select id="wm-opacity" class="select-input">
              <option value="0.2">Faint (20%)</option>
              <option value="0.4" selected>Light (40%)</option>
              <option value="0.6">Medium (60%)</option>
              <option value="0.8">Strong (80%)</option>
            </select>
          </div>
        </div>
        <div class="form-group"><label>Position</label>
          <select id="wm-position" class="select-input">
            <option value="center">Center</option>
            <option value="bottom-right" selected>Bottom Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="top-right">Top Right</option>
            <option value="tiled">Tiled (repeating)</option>
          </select>
        </div>
        <div class="form-group"><label>Text Color</label><input type="color" id="wm-color" value="#ffffff" style="width:60px;height:36px;border:1px solid var(--color-border);border-radius:var(--radius-md);cursor:pointer;"></div>
        <button class="btn btn-primary btn-lg" id="download-btn" style="width:100%;">Download Watermarked Image</button>
      </div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const previewArea = container.querySelector('#preview-area');
  const downloadBtn = container.querySelector('#download-btn');

  function updatePreview() {
    if (!originalImg) return;
    const scale = Math.min(500 / originalImg.naturalWidth, 1);
    const canvas = document.createElement('canvas');
    canvas.width = originalImg.naturalWidth * scale;
    canvas.height = originalImg.naturalHeight * scale;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);
    drawWatermark(ctx, canvas.width, canvas.height, scale);
    previewArea.innerHTML = '';
    previewArea.appendChild(canvas);
  }

  function drawWatermark(ctx, w, h, scale = 1) {
    const text = container.querySelector('#wm-text').value || 'WATERMARK';
    const sizeMap = { small: 16, medium: 32, large: 64, xlarge: 128 };
    const size = (sizeMap[container.querySelector('#wm-size').value] || 32) * scale;
    const opacity = parseFloat(container.querySelector('#wm-opacity').value);
    const position = container.querySelector('#wm-position').value;
    const color = container.querySelector('#wm-color').value;

    ctx.globalAlpha = opacity;
    ctx.font = `bold ${size}px Arial`;
    ctx.fillStyle = color;
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;

    if (position === 'tiled') {
      const xGap = ctx.measureText(text).width * 2;
      const yGap = size * 3;
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(-Math.PI / 6);
      for (let y = -h; y < h * 2; y += yGap) {
        for (let x = -w; x < w * 2; x += xGap) {
          ctx.fillText(text, x, y);
        }
      }
      ctx.restore();
    } else {
      const tw = ctx.measureText(text).width;
      let x, y;
      if (position === 'center') { x = (w - tw) / 2; y = h / 2; }
      else if (position === 'bottom-right') { x = w - tw - 20 * scale; y = h - 20 * scale; }
      else if (position === 'bottom-left') { x = 20 * scale; y = h - 20 * scale; }
      else { x = w - tw - 20 * scale; y = 40 * scale; }
      ctx.fillText(text, x, y);
    }
    ctx.globalAlpha = 1;
  }

  ['wm-text', 'wm-size', 'wm-opacity', 'wm-position', 'wm-color'].forEach(id => {
    container.querySelector(`#${id}`).addEventListener('input', updatePreview);
    container.querySelector(`#${id}`).addEventListener('change', updatePreview);
  });

  downloadBtn.addEventListener('click', () => {
    if (!originalImg) return;
    const canvas = document.createElement('canvas');
    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(originalImg, 0, 0);
    drawWatermark(ctx, canvas.width, canvas.height);
    downloadCanvas(canvas, 'watermarked.png');
    showToast({ message: 'Downloaded!', type: 'success' });
  });
}

export function destroy() {}
