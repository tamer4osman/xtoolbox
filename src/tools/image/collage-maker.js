import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { loadImageFromFile, canvasToBlob } from './image-utils.js';

export const toolConfig = {
  id: 'collage-maker',
  name: 'Collage Maker',
  category: 'image',
  description: 'Create beautiful photo collages with customizable layouts, spacing, borders, and backgrounds.',
  icon: '🎨',
  accept: 'image/*',
  maxSizeMB: 50,
  keywords: ['collage maker', 'photo collage', 'image grid', 'picture collage'],
  steps: ['Upload 2-12 photos', 'Choose collage layout', 'Customize spacing, border, and background', 'Download your collage'],
  faqs: [
    { question: 'How many photos can I use?', answer: 'Up to 12 photos in a single collage.' },
    { question: 'What formats are supported?', answer: 'All common image formats: JPG, PNG, WebP, GIF, BMP.' }
  ]
};

const LAYOUTS = [
  { id: 'grid-2x2', name: '2×2 Grid', cols: 2, rows: 2, slots: 4 },
  { id: 'grid-3x3', name: '3×3 Grid', cols: 3, rows: 3, slots: 9 },
  { id: 'grid-4x3', name: '4×3 Grid', cols: 4, rows: 3, slots: 12 },
  { id: 'horizontal-strip', name: 'Horizontal Strip', cols: 0, rows: 1, slots: 6 },
  { id: 'vertical-strip', name: 'Vertical Strip', cols: 1, rows: 0, slots: 6 },
  { id: 'mosaic-1', name: 'Mosaic A (1 big + 3)', cols: 0, rows: 0, slots: 4, custom: 'mosaic-1' },
  { id: 'mosaic-2', name: 'Mosaic B (2 big + 4)', cols: 0, rows: 0, slots: 6, custom: 'mosaic-2' },
];

export function render(container) {
  let images = [];
  let selectedLayout = LAYOUTS[0];

  const upload = createFileUpload({
    accept: 'image/*',
    multiple: true,
    maxSizeMB: 50,
    maxFiles: 12,
    onFilesSelected: async (files) => {
      images = [];
      for (const f of files) {
        const img = await loadImageFromFile(f);
        images.push(img);
      }
      countInfo.textContent = `${images.length} photo${images.length !== 1 ? 's' : ''} loaded`;
      updateLayoutOptions();
      optionsArea.style.display = 'block';
      previewArea.style.display = 'block';
      renderPreview();
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);" id="count-info">-</div>
        <div class="form-group">
          <label>Layout</label>
          <div id="layout-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px;"></div>
        </div>
        <div class="form-group">
          <label>Spacing (px)</label>
          <input type="range" id="spacing-range" min="0" max="40" value="8" style="width:100%;">
          <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-secondary);"><span>0</span><span id="spacing-val">8</span><span>40</span></div>
        </div>
        <div class="form-group">
          <label>Border Width (px)</label>
          <input type="range" id="border-range" min="0" max="20" value="0" style="width:100%;">
          <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-secondary);"><span>0</span><span id="border-val">0</span><span>20</span></div>
        </div>
        <div class="form-group">
          <label>Border Radius (px)</label>
          <input type="range" id="radius-range" min="0" max="100" value="0" style="width:100%;">
          <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-secondary);"><span>0</span><span id="radius-val">0</span><span>100</span></div>
        </div>
        <div class="form-group">
          <label>Background Color</label>
          <div style="display:flex;gap:8px;align-items:center;">
            <input type="color" id="bg-color" value="#ffffff" style="width:60px;height:36px;border:1px solid var(--color-border);border-radius:var(--radius-md);cursor:pointer;">
            <span id="bg-color-hex" style="font-size:var(--text-sm);color:var(--color-text-secondary);">#ffffff</span>
          </div>
        </div>
        <div class="form-group">
          <label>Collage Width (px)</label>
          <input type="number" id="collage-width" class="text-input" value="1200" min="400" max="4000" step="100">
        </div>
        <button class="btn btn-primary btn-lg" id="download-btn" style="width:100%;">Download Collage</button>
      </div>
      <div id="preview-area" style="display:none;margin-top:var(--space-6);">
        <h3 style="font-size:var(--text-lg);margin-bottom:var(--space-3);">Preview</h3>
        <canvas id="preview-canvas" style="width:100%;max-width:600px;border:1px solid var(--color-border);border-radius:var(--radius-lg);"></canvas>
      </div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Creating collage...</p></div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const countInfo = container.querySelector('#count-info');
  const previewArea = container.querySelector('#preview-area');
  const previewCanvas = container.querySelector('#preview-canvas');
  const spacingRange = container.querySelector('#spacing-range');
  const spacingVal = container.querySelector('#spacing-val');
  const borderRange = container.querySelector('#border-range');
  const borderVal = container.querySelector('#border-val');
  const radiusRange = container.querySelector('#radius-range');
  const radiusVal = container.querySelector('#radius-val');
  const bgColor = container.querySelector('#bg-color');
  const bgColorHex = container.querySelector('#bg-color-hex');
  const downloadBtn = container.querySelector('#download-btn');
  const processing = container.querySelector('#processing');
  const layoutGrid = container.querySelector('#layout-grid');

  function updateLayoutOptions() {
    layoutGrid.innerHTML = '';
    const available = LAYOUTS.filter(l => images.length >= 2 && images.length <= l.slots);
    available.forEach(layout => {
      const btn = document.createElement('button');
      btn.className = `btn ${layout === selectedLayout ? 'btn-primary' : 'btn-secondary'}`;
      btn.style.fontSize = 'var(--text-xs)';
      btn.style.padding = '8px';
      btn.textContent = layout.name;
      btn.addEventListener('click', () => {
        selectedLayout = layout;
        updateLayoutOptions();
        renderPreview();
      });
      layoutGrid.appendChild(btn);
    });
  }

  function getLayoutPositions(layout, imgCount, cellW, cellH, spacing) {
    const positions = [];
    if (layout.custom === 'mosaic-1') {
      // 1 big left (spans 2 rows), 3 small right
      const bigW = cellW * 2 + spacing;
      const smallW = cellW;
      const smallH = cellH;
      positions.push({ x: 0, y: 0, w: bigW, h: smallH * 2 + spacing });
      for (let i = 1; i < Math.min(imgCount, 4); i++) {
        positions.push({ x: bigW + spacing, y: (i - 1) * (smallH + spacing), w: smallW, h: smallH });
      }
    } else if (layout.custom === 'mosaic-2') {
      // 2 big top, 4 small bottom (2x2)
      const bigW = cellW;
      const bigH = cellH;
      const smallW = cellW;
      const smallH = cellH;
      positions.push({ x: 0, y: 0, w: bigW, h: bigH });
      positions.push({ x: bigW + spacing, y: 0, w: bigW, h: bigH });
      for (let i = 2; i < Math.min(imgCount, 6); i++) {
        const col = (i - 2) % 3;
        const row = Math.floor((i - 2) / 3);
        positions.push({ x: col * (smallW + spacing), y: bigH + spacing + row * (smallH + spacing), w: smallW, h: smallH });
      }
    } else if (layout.rows === 1) {
      // Horizontal strip
      for (let i = 0; i < imgCount; i++) {
        positions.push({ x: i * (cellW + spacing), y: 0, w: cellW, h: cellH });
      }
    } else if (layout.cols === 1) {
      // Vertical strip
      for (let i = 0; i < imgCount; i++) {
        positions.push({ x: 0, y: i * (cellH + spacing), w: cellW, h: cellH });
      }
    } else {
      // Standard grid
      const cols = layout.cols;
      for (let i = 0; i < imgCount; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        positions.push({ x: col * (cellW + spacing), y: row * (cellH + spacing), w: cellW, h: cellH });
      }
    }
    return positions;
  }

  function drawCollage(canvas, width) {
    const spacing = parseInt(spacingRange.value) || 0;
    const borderWidth = parseInt(borderRange.value) || 0;
    const borderRadius = parseInt(radiusRange.value) || 0;
    const bg = bgColor.value;
    const collageW = width;

    // Calculate height based on layout
    let canvasW, canvasH, cellW, cellH, positions;

    if (selectedLayout.custom === 'mosaic-1') {
      // 4 slots: 1 big (2x2 cells), 3 small (1x1 each on right)
      const cols = 3; // effectively 3 columns (big spans 2)
      cellW = (collageW - spacing * (cols - 1)) / cols;
      cellH = cellW; // square cells
      canvasW = collageW;
      canvasH = cellH * 2 + spacing;
      positions = getLayoutPositions(selectedLayout, images.length, cellW, cellH, spacing);
    } else if (selectedLayout.custom === 'mosaic-2') {
      // 6 slots: 2 big top, 4 small bottom (3x2 grid)
      const cols = 3;
      cellW = (collageW - spacing * (cols - 1)) / cols;
      cellH = cellW;
      canvasW = collageW;
      canvasH = cellH * 3 + spacing * 2;
      positions = getLayoutPositions(selectedLayout, images.length, cellW, cellH, spacing);
    } else if (selectedLayout.rows === 1) {
      // Horizontal strip
      cellH = 400;
      cellW = (collageW - spacing * (images.length - 1)) / images.length;
      canvasW = collageW;
      canvasH = cellH;
      positions = getLayoutPositions(selectedLayout, images.length, cellW, cellH, spacing);
    } else if (selectedLayout.cols === 1) {
      // Vertical strip
      cellW = collageW;
      cellH = 300;
      canvasW = collageW;
      canvasH = images.length * cellH + spacing * (images.length - 1);
      positions = getLayoutPositions(selectedLayout, images.length, cellW, cellH, spacing);
    } else {
      // Standard grid
      const cols = selectedLayout.cols;
      const rows = Math.ceil(images.length / cols);
      cellW = (collageW - spacing * (cols - 1)) / cols;
      cellH = cellW;
      canvasW = collageW;
      canvasH = rows * cellH + spacing * (rows - 1);
      positions = getLayoutPositions(selectedLayout, images.length, cellW, cellH, spacing);
    }

    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = bg;
    if (borderRadius > 0) {
      roundRect(ctx, 0, 0, canvasW, canvasH, borderRadius);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, canvasW, canvasH);
    }

    // Draw images
    images.forEach((img, i) => {
      if (i >= positions.length) return;
      const pos = positions[i];

      ctx.save();
      if (borderRadius > 0) {
        roundRect(ctx, pos.x, pos.y, pos.w, pos.h, Math.min(borderRadius, Math.min(pos.w, pos.h) / 2));
        ctx.clip();
      }

      // Calculate cover fit
      const scale = Math.max(pos.w / img.naturalWidth, pos.h / img.naturalHeight);
      const drawW = img.naturalWidth * scale;
      const drawH = img.naturalHeight * scale;
      const drawX = pos.x + (pos.w - drawW) / 2;
      const drawY = pos.y + (pos.h - drawH) / 2;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();

      // Border
      if (borderWidth > 0) {
        ctx.strokeStyle = bg;
        ctx.lineWidth = borderWidth;
        if (borderRadius > 0) {
          roundRect(ctx, pos.x, pos.y, pos.w, pos.h, Math.min(borderRadius, Math.min(pos.w, pos.h) / 2));
          ctx.stroke();
        } else {
          ctx.strokeRect(pos.x, pos.y, pos.w, pos.h);
        }
      }
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function renderPreview() {
    if (images.length < 2) return;
    drawCollage(previewCanvas, 600);
  }

  spacingRange.addEventListener('input', () => {
    spacingVal.textContent = spacingRange.value;
    renderPreview();
  });

  borderRange.addEventListener('input', () => {
    borderVal.textContent = borderRange.value;
    renderPreview();
  });

  radiusRange.addEventListener('input', () => {
    radiusVal.textContent = radiusRange.value;
    renderPreview();
  });

  bgColor.addEventListener('input', () => {
    bgColorHex.textContent = bgColor.value;
    renderPreview();
  });

  downloadBtn.addEventListener('click', async () => {
    if (images.length < 2) return;
    const width = parseInt(container.querySelector('#collage-width').value) || 1200;

    processing.style.display = 'block';

    try {
      const canvas = document.createElement('canvas');
      drawCollage(canvas, width);
      const blob = await canvasToBlob(canvas, 'image/png');
      downloadBlob(blob, 'collage.png');
      showToast({ message: 'Collage created!', type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
    }
  });
}

export function destroy() {}
