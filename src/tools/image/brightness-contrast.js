import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { loadImageFromFile, downloadCanvas } from './image-utils.js';

export const toolConfig = {
  id: 'brightness-contrast',
  name: 'Brightness & Contrast',
  category: 'image',
  description: 'Adjust brightness, contrast, and saturation of images.',
  icon: '☀️',
  accept: 'image/*',
  maxSizeMB: 50,
  keywords: ['brightness', 'contrast', 'saturation', 'image adjust'],
  steps: ['Upload an image', 'Adjust sliders for brightness, contrast, saturation', 'Preview in real-time', 'Download'],
  faqs: [
    { question: 'Can I reset to original?', answer: 'Yes. Click the "Reset" button to restore original values.' }
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
        <div class="form-group">
          <label>Brightness: <strong id="bright-val">100</strong>%</label>
          <input type="range" id="brightness" min="0" max="200" value="100" class="range-slider-input">
        </div>
        <div class="form-group">
          <label>Contrast: <strong id="contrast-val">100</strong>%</label>
          <input type="range" id="contrast" min="0" max="200" value="100" class="range-slider-input">
        </div>
        <div class="form-group">
          <label>Saturation: <strong id="sat-val">100</strong>%</label>
          <input type="range" id="saturation" min="0" max="200" value="100" class="range-slider-input">
        </div>
        <div class="form-group">
          <label>Blur: <strong id="blur-val">0</strong>px</label>
          <input type="range" id="blur" min="0" max="20" value="0" class="range-slider-input">
        </div>
        <div style="display:flex;gap:var(--space-3);">
          <button class="btn btn-secondary" id="reset-btn" style="flex:1;">Reset</button>
          <button class="btn btn-primary" id="download-btn" style="flex:1;">Download</button>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const previewArea = container.querySelector('#preview-area');
  const downloadBtn = container.querySelector('#download-btn');
  const resetBtn = container.querySelector('#reset-btn');

  function getFilterString() {
    const b = container.querySelector('#brightness').value;
    const c = container.querySelector('#contrast').value;
    const s = container.querySelector('#saturation').value;
    const bl = container.querySelector('#blur').value;
    return `brightness(${b}%) contrast(${c}%) saturate(${s}%) blur(${bl}px)`;
  }

  function updatePreview() {
    if (!originalImg) return;
    const scale = Math.min(500 / originalImg.naturalWidth, 1);
    const canvas = document.createElement('canvas');
    canvas.width = originalImg.naturalWidth * scale;
    canvas.height = originalImg.naturalHeight * scale;
    const ctx = canvas.getContext('2d');
    ctx.filter = getFilterString();
    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);
    previewArea.innerHTML = '';
    previewArea.appendChild(canvas);

    container.querySelector('#bright-val').textContent = container.querySelector('#brightness').value;
    container.querySelector('#contrast-val').textContent = container.querySelector('#contrast').value;
    container.querySelector('#sat-val').textContent = container.querySelector('#saturation').value;
    container.querySelector('#blur-val').textContent = container.querySelector('#blur').value;
  }

  ['brightness', 'contrast', 'saturation', 'blur'].forEach(id => {
    container.querySelector(`#${id}`).addEventListener('input', updatePreview);
  });

  resetBtn.addEventListener('click', () => {
    container.querySelector('#brightness').value = 100;
    container.querySelector('#contrast').value = 100;
    container.querySelector('#saturation').value = 100;
    container.querySelector('#blur').value = 0;
    updatePreview();
  });

  downloadBtn.addEventListener('click', () => {
    if (!originalImg) return;
    const canvas = document.createElement('canvas');
    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.filter = getFilterString();
    ctx.drawImage(originalImg, 0, 0);
    downloadCanvas(canvas, 'adjusted.png');
    showToast({ message: 'Downloaded!', type: 'success' });
  });
}

export function destroy() {}
