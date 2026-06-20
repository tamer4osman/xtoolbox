export const toolConfig = {
  id: 'pixel-art-editor',
  name: 'Pixel Art & Sprite Sheet Editor',
  category: 'image',
  description: 'Create pixel art and sprite sheets with customizable grids, color palettes, and export options.',
  icon: '🎨',
  keywords: ['pixel', 'art', 'sprite', '8-bit', 'retro', 'game', 'editor'],
  accept: 'image/*',
  maxSizeMB: 5,
  status: 'done'
};

const PRESETS = [
  { w: 8, h: 8, label: '8x8' },
  { w: 16, h: 16, label: '16x16' },
  { w: 32, h: 32, label: '32x32' },
  { w: 64, h: 64, label: '64x64' },
  { w: 128, h: 128, label: '128x128' }
];

const DEFAULT_PALETTE = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00',
  '#ff00ff', '#00ffff', '#808080', '#c0c0c0', '#800000', '#008000',
  '#000080', '#808000', '#800080', '#008080', '#ffa500', '#a52a2a',
  '#8b4513', '#ffd700', '#ff6347', '#ff1493', '#c71585', '#dc143c'
];

export function render(container) {
  container.innerHTML = `
    <div class="pa-container">
      <div class="pa-sidebar">
        <div class="pa-section">
          <label>Canvas Size</label>
          <select id="pa-size"></select>
        </div>
        <div class="pa-section">
          <label>Color</label>
          <input type="color" id="pa-color" value="#000000" />
        </div>
        <div class="pa-section">
          <label>Palette</label>
          <div class="pa-colors" id="pa-colors"></div>
        </div>
        <div class="pa-section">
          <button id="pa-clear" class="pa-btn">Clear</button>
          <button id="pa-download" class="pa-btn pa-btn-primary">Download</button>
        </div>
      </div>
      <div class="pa-main">
        <canvas id="pa-canvas" class="pa-canvas"></canvas>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .pa-container { display: flex; gap: var(--space-4); max-width: 900px; margin: 0 auto; }
    .pa-sidebar { width: 180px; display: flex; flex-direction: column; gap: var(--space-3); flex-shrink: 0; }
    .pa-section label { display: block; font-weight: 600; font-size: var(--text-sm); margin-bottom: var(--space-1); }
    .pa-section select, .pa-section input { width: 100%; padding: var(--space-2); border: 2px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-surface); }
    .pa-colors { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; margin-bottom: var(--space-2); }
    .pa-color-swatch { width: 100%; aspect-ratio: 1; border: 2px solid var(--color-border); cursor: pointer; border-radius: 2px; }
    .pa-color-swatch.active { border-color: var(--color-primary); }
    #pa-color { height: 32px; cursor: pointer; }
    .pa-btn { width: 100%; padding: var(--space-2); border: 2px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-surface); cursor: pointer; font-weight: 600; }
    .pa-btn-primary { background: var(--color-primary); color: white; border-color: var(--color-primary); }
    .pa-main { flex: 1; display: flex; align-items: center; justify-content: center; background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-3); }
    .pa-canvas { image-rendering: pixelated; cursor: crosshair; }
  `;
  container.appendChild(style);

  const sizeSelect = container.querySelector('#pa-size');
  const colorsDiv = container.querySelector('#pa-colors');
  const colorPicker = container.querySelector('#pa-color');
  const clearBtn = container.querySelector('#pa-clear');
  const downloadBtn = container.querySelector('#pa-download');
  const canvas = container.querySelector('#pa-canvas');
  const ctx = canvas.getContext('2d');

  let currentPreset = PRESETS[2];
  let currentColor = '#000000';
  let pixelData = {};

  PRESETS.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.w;
    opt.textContent = p.label;
    sizeSelect.appendChild(opt);
  });
  sizeSelect.value = '32';

  DEFAULT_PALETTE.forEach(c => {
    const sw = document.createElement('div');
    sw.className = 'pa-color-swatch' + (c === currentColor ? ' active' : '');
    sw.style.background = c;
    sw.dataset.color = c;
    sw.addEventListener('click', () => {
      colorsDiv.querySelectorAll('.pa-color-swatch').forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
      currentColor = c;
      colorPicker.value = c;
    });
    colorsDiv.appendChild(sw);
  });

  colorPicker.addEventListener('input', e => {
    currentColor = e.target.value;
    colorsDiv.querySelectorAll('.pa-color-swatch').forEach(s => s.classList.remove('active'));
  });

  function drawCanvas() {
    const displaySize = 384;
    const pixelSize = displaySize / currentPreset.w;
    canvas.width = displaySize;
    canvas.height = displaySize;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, displaySize, displaySize);
    ctx.imageSmoothingEnabled = false;

    for (let y = 0; y < currentPreset.h; y++) {
      for (let x = 0; x < currentPreset.w; x++) {
        const key = x + ',' + y;
        if (pixelData[key]) {
          ctx.fillStyle = pixelData[key];
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    }

    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    for (let i = 0; i <= currentPreset.w; i++) {
      ctx.beginPath();
      ctx.moveTo(i * pixelSize, 0);
      ctx.lineTo(i * pixelSize, displaySize);
      ctx.stroke();
    }
    for (let i = 0; i <= currentPreset.h; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * pixelSize);
      ctx.lineTo(displaySize, i * pixelSize);
      ctx.stroke();
    }
  }

  function setPixelFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / rect.width * currentPreset.w);
    const y = Math.floor((e.clientY - rect.top) / rect.height * currentPreset.h);
    if (x >= 0 && x < currentPreset.w && y >= 0 && y < currentPreset.h) {
      pixelData[x + ',' + y] = currentColor;
      drawCanvas();
    }
  }

  canvas.addEventListener('mousedown', setPixelFromEvent);

  canvas.addEventListener('mousemove', e => {
    if (e.buttons === 1) setPixelFromEvent(e);
  });

  sizeSelect.addEventListener('change', () => {
    currentPreset = PRESETS.find(p => p.w === parseInt(sizeSelect.value)) || PRESETS[2];
    pixelData = {};
    drawCanvas();
  });

  clearBtn.addEventListener('click', () => {
    pixelData = {};
    drawCanvas();
  });

  downloadBtn.addEventListener('click', () => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = currentPreset.w;
    exportCanvas.height = currentPreset.h;
    const ectx = exportCanvas.getContext('2d');
    ectx.fillStyle = '#ffffff';
    ectx.fillRect(0, 0, currentPreset.w, currentPreset.h);
    for (let y = 0; y < currentPreset.h; y++) {
      for (let x = 0; x < currentPreset.w; x++) {
        if (pixelData[x + ',' + y]) {
          ectx.fillStyle = pixelData[x + ',' + y];
          ectx.fillRect(x, y, 1, 1);
        }
      }
    }
    const link = document.createElement('a');
    link.download = 'pixel-art-' + currentPreset.w + 'x' + currentPreset.h + '.png';
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  });

  drawCanvas();
}