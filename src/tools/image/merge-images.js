import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { loadImageFromFile, canvasToBlob } from './image-utils.js';

export const toolConfig = {
  id: 'merge-images',
  name: 'Image Merger',
  category: 'image',
  description: 'Combine multiple images into one. Horizontal, vertical, or grid layout.',
  icon: '🖼️',
  accept: 'image/*',
  maxSizeMB: 50,
  keywords: ['merge images', 'combine images', 'image collage'],
  steps: ['Upload multiple images', 'Choose layout (horizontal/vertical/grid)', 'Set spacing', 'Download merged image'],
  faqs: [
    { question: 'How many images can I merge?', answer: 'Up to 20 images at once.' }
  ]
};

export function render(container) {
  let images = [];

  const upload = createFileUpload({
    accept: 'image/*',
    multiple: true,
    maxSizeMB: 50,
    maxFiles: 20,
    onFilesSelected: async (files) => {
      images = [];
      for (const f of files) {
        const img = await loadImageFromFile(f);
        images.push(img);
      }
      countInfo.textContent = `${images.length} images loaded`;
      optionsArea.style.display = images.length > 1 ? 'block' : 'none';
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);" id="count-info">-</div>
        <div class="form-group">
          <label>Layout</label>
          <select id="layout-select" class="select-input">
            <option value="horizontal">Horizontal (side by side)</option>
            <option value="vertical">Vertical (stacked)</option>
            <option value="grid">Grid (auto-fit)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Spacing (px)</label>
          <input type="number" id="spacing-input" class="text-input" value="0" min="0" max="100">
        </div>
        <div class="form-group">
          <label>Background Color</label>
          <input type="color" id="bg-color" value="#ffffff" style="width:60px;height:36px;border:1px solid var(--color-border);border-radius:var(--radius-md);cursor:pointer;">
        </div>
        <button class="btn btn-primary btn-lg" id="merge-btn" style="width:100%;">Merge & Download</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Merging...</p></div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const countInfo = container.querySelector('#count-info');
  const mergeBtn = container.querySelector('#merge-btn');
  const processing = container.querySelector('#processing');

  mergeBtn.addEventListener('click', async () => {
    if (images.length < 2) return;
    const layout = container.querySelector('#layout-select').value;
    const spacing = parseInt(container.querySelector('#spacing-input').value) || 0;
    const bgColor = container.querySelector('#bg-color').value;

    processing.style.display = 'block';

    try {
      let canvasW, canvasH, positions;
      const maxW = Math.max(...images.map(i => i.naturalWidth));
      const maxH = Math.max(...images.map(i => i.naturalHeight));

      if (layout === 'horizontal') {
        canvasW = images.reduce((s, i) => s + i.naturalWidth, 0) + spacing * (images.length - 1);
        canvasH = maxH;
        let x = 0;
        positions = images.map(img => { const p = { x, y: 0 }; x += img.naturalWidth + spacing; return p; });
      } else if (layout === 'vertical') {
        canvasW = maxW;
        canvasH = images.reduce((s, i) => s + i.naturalHeight, 0) + spacing * (images.length - 1);
        let y = 0;
        positions = images.map(img => { const p = { x: 0, y }; y += img.naturalHeight + spacing; return p; });
      } else {
        const cols = Math.ceil(Math.sqrt(images.length));
        const rows = Math.ceil(images.length / cols);
        canvasW = cols * maxW + spacing * (cols - 1);
        canvasH = rows * maxH + spacing * (rows - 1);
        positions = images.map((img, i) => ({ x: (i % cols) * (maxW + spacing), y: Math.floor(i / cols) * (maxH + spacing) }));
      }

      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvasW, canvasH);
      images.forEach((img, i) => ctx.drawImage(img, positions[i].x, positions[i].y));

      const blob = await canvasToBlob(canvas, 'image/png');
      downloadBlob(blob, 'merged.png');
      showToast({ message: 'Images merged!', type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
    }
  });
}

export function destroy() {}
