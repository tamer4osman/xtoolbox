import { createImageTool } from './image-tool-factory.js';

export const toolConfig = {
  id: 'round-image-cropper',
  name: 'Round Image Cropper',
  category: 'image',
  description: 'Crop images into perfect circles with customizable border, shadow, and background options.',
  icon: '⭕',
  accept: 'image/*',
  maxSizeMB: 50,
  keywords: ['round crop', 'circle crop', 'avatar maker', 'profile picture', 'circular image'],
  steps: ['Upload an image', 'Adjust crop area and size', 'Set border width and color', 'Add optional shadow', 'Download the circular image'],
  faqs: [
    { question: 'What format should I download in?', answer: 'Use PNG for transparent backgrounds. JPEG will fill transparent areas with white.' },
    { question: 'Can I add a colored border?', answer: 'Yes, you can add a solid border with any color and width.' }
  ]
};

export function render(container) {
  const tool = createImageTool({
    container,
    toolId: 'round-crop',
    processingMessage: 'Cropping...',
    successMessage: 'Circle crop saved!',
    getFilename: () => {
      const fmt = container.querySelector('#format-select').value;
      const ext = fmt === 'png' ? 'png' : fmt === 'webp' ? 'webp' : 'jpg';
      return `circle-crop.${ext}`;
    },
    getFormat: () => {
      const fmt = container.querySelector('#format-select').value;
      return fmt === 'png' ? 'image/png' : fmt === 'webp' ? 'image/webp' : 'image/jpeg';
    },
    getQuality: () => 0.92,
    optionsHTML: `
      <div class="form-group">
        <label>Output Size (px)</label>
        <input type="range" id="size-range" min="64" max="2000" value="500" step="16" style="width:100%;">
        <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-secondary);"><span>64</span><span id="size-val">500</span><span>2000</span></div>
      </div>
      <div class="form-group">
        <label>Crop Position X (%)</label>
        <input type="range" id="pos-x-range" min="0" max="100" value="50" style="width:100%;">
        <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-secondary);"><span>Left</span><span id="pos-x-val">Center</span><span>Right</span></div>
      </div>
      <div class="form-group">
        <label>Crop Position Y (%)</label>
        <input type="range" id="pos-y-range" min="0" max="100" value="50" style="width:100%;">
        <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-secondary);"><span>Top</span><span id="pos-y-val">Center</span><span>Bottom</span></div>
      </div>
      <div class="form-group">
        <label>Zoom (%)</label>
        <input type="range" id="zoom-range" min="50" max="200" value="100" style="width:100%;">
        <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-secondary);"><span>50</span><span id="zoom-val">100</span><span>200</span></div>
      </div>
      <div class="form-group">
        <label>Border Width (px)</label>
        <input type="range" id="border-range" min="0" max="50" value="0" style="width:100%;">
        <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-secondary);"><span>0</span><span id="border-val">0</span><span>50</span></div>
      </div>
      <div class="form-group">
        <label>Border Color</label>
        <div style="display:flex;gap:8px;align-items:center;">
          <input type="color" id="border-color" value="#000000" style="width:60px;height:36px;border:1px solid var(--color-border);border-radius:var(--radius-md);cursor:pointer;">
          <span id="border-color-hex" style="font-size:var(--text-sm);color:var(--color-text-secondary);">#000000</span>
        </div>
      </div>
      <div class="form-group">
        <label>Background</label>
        <select id="bg-select" class="select-input">
          <option value="transparent">Transparent</option>
          <option value="white">White</option>
          <option value="black">Black</option>
          <option value="custom">Custom Color</option>
        </select>
      </div>
      <div class="form-group" id="custom-bg-group" style="display:none;">
        <label>Background Color</label>
        <input type="color" id="bg-color" value="#ffffff" style="width:60px;height:36px;border:1px solid var(--color-border);border-radius:var(--radius-md);cursor:pointer;">
      </div>
      <div class="form-group">
        <label>Shadow</label>
        <div style="display:flex;gap:8px;align-items:center;">
          <input type="checkbox" id="shadow-toggle" style="width:18px;height:18px;">
          <span style="font-size:var(--text-sm);color:var(--color-text-secondary);">Enable drop shadow</span>
        </div>
      </div>
      <div class="form-group" id="shadow-options" style="display:none;">
        <label>Shadow Blur (px)</label>
        <input type="range" id="shadow-range" min="0" max="50" value="15" style="width:100%;">
        <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-secondary);"><span>0</span><span id="shadow-val">15</span><span>50</span></div>
      </div>
      <div class="form-group">
        <label>Output Format</label>
        <select id="format-select" class="select-input">
          <option value="png">PNG (transparent support)</option>
          <option value="webp">WebP (transparent support)</option>
          <option value="jpeg">JPEG (white background)</option>
        </select>
      </div>
    `,
    optionsCSS: '',
    renderPreview: ({ state }) => {
      if (!state.originalImage) return;
      const canvas = container.querySelector('#round-crop-preview-canvas');
      processImage(canvas, state.originalImage, 300, container);
    },
    processForDownload: ({ state, canvas }) => {
      if (!state.originalImage) return;
      const size = parseInt(container.querySelector('#size-range').value) || 500;
      processImage(canvas, state.originalImage, size, container);
    }
  });

  tool.bindOptionChange({ rangeId: 'size-range', valueId: 'size-val' });
  tool.bindOptionChange({
    rangeId: 'pos-x-range',
    valueId: 'pos-x-val',
    formatValue: (v) => {
      const n = parseInt(v);
      return n < 35 ? 'Left' : n > 65 ? 'Right' : 'Center';
    }
  });
  tool.bindOptionChange({
    rangeId: 'pos-y-range',
    valueId: 'pos-y-val',
    formatValue: (v) => {
      const n = parseInt(v);
      return n < 35 ? 'Top' : n > 65 ? 'Bottom' : 'Center';
    }
  });
  tool.bindOptionChange({ rangeId: 'zoom-range', valueId: 'zoom-val' });
  tool.bindOptionChange({ rangeId: 'border-range', valueId: 'border-val' });
  tool.bindOptionChange({ rangeId: 'shadow-range', valueId: 'shadow-val' });

  const borderColor = container.querySelector('#border-color');
  const borderColorHex = container.querySelector('#border-color-hex');
  borderColor.addEventListener('input', () => {
    borderColorHex.textContent = borderColor.value;
    tool.renderPreview();
  });

  const bgSelect = container.querySelector('#bg-select');
  const customBgGroup = container.querySelector('#custom-bg-group');
  bgSelect.addEventListener('change', () => {
    customBgGroup.style.display = bgSelect.value === 'custom' ? 'block' : 'none';
    tool.renderPreview();
  });

  const shadowToggle = container.querySelector('#shadow-toggle');
  const shadowOptions = container.querySelector('#shadow-options');
  shadowToggle.addEventListener('change', () => {
    shadowOptions.style.display = shadowToggle.checked ? 'block' : 'none';
    tool.renderPreview();
  });
}

function processImage(canvas, originalImage, outputSize, container) {
  const borderRange = container.querySelector('#border-range');
  const borderColor = container.querySelector('#border-color');
  const bgSelect = container.querySelector('#bg-select');
  const bgColor = container.querySelector('#bg-color');
  const shadowToggle = container.querySelector('#shadow-toggle');
  const shadowRange = container.querySelector('#shadow-range');
  const posXRange = container.querySelector('#pos-x-range');
  const posYRange = container.querySelector('#pos-y-range');
  const zoomRange = container.querySelector('#zoom-range');

  const borderWidth = parseInt(borderRange.value) || 0;
  const borderCol = borderColor.value;
  const bg = bgSelect.value;
  const bgCol = bgColor.value;
  const shadow = shadowToggle.checked;
  const shadowBlur = parseInt(shadowRange.value) || 15;
  const posX = parseInt(posXRange.value) / 100;
  const posY = parseInt(posYRange.value) / 100;
  const zoom = parseInt(zoomRange.value) / 100;

  const totalSize = outputSize + borderWidth * 2;
  canvas.width = totalSize;
  canvas.height = totalSize;
  const ctx = canvas.getContext('2d');

  if (bg === 'white') {
    ctx.fillStyle = '#ffffff';
  } else if (bg === 'black') {
    ctx.fillStyle = '#000000';
  } else if (bg === 'custom') {
    ctx.fillStyle = bgCol;
  } else {
    ctx.fillStyle = 'transparent';
  }

  const center = totalSize / 2;
  const radius = totalSize / 2;
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.fill();

  if (shadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = shadowBlur / 3;
  }

  ctx.beginPath();
  ctx.arc(center, center, outputSize / 2);
  ctx.clip();

  const imgW = originalImage.naturalWidth;
  const imgH = originalImage.naturalHeight;
  const minDim = Math.min(imgW, imgH);
  const cropSize = minDim / zoom;
  const cropX = (imgW - cropSize) * posX;
  const cropY = (imgH - cropSize) * posY;

  ctx.drawImage(
    originalImage,
    cropX, cropY, cropSize, cropSize,
    borderWidth, borderWidth, outputSize, outputSize
  );

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  if (borderWidth > 0) {
    ctx.strokeStyle = borderCol;
    ctx.lineWidth = borderWidth;
    ctx.beginPath();
    ctx.arc(center, center, outputSize / 2, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export function destroy() {}
