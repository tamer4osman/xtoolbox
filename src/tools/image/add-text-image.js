import { createImageTool } from './create-image-tool.js';

export const toolConfig = {
  id: 'add-text-image',
  name: 'Add Text to Image',
  category: 'image',
  description: 'Add custom text overlays to images with fonts, colors, and positioning.',
  icon: '✏️',
  accept: 'image/*',
  maxSizeMB: 50,
  keywords: ['add text to image', 'text on image', 'image text overlay'],
  steps: ['Upload an image', 'Enter your text', 'Customize font, size, color, position', 'Download'],
  faqs: [
    { question: 'Can I add multiple text layers?', answer: 'Yes. Click "Add Text" to add more layers.' }
  ]
};

let textLayers = [{ text: 'Your Text', x: 50, y: 50, size: 48, color: '#ffffff', font: 'Arial', bold: true, outline: true }];

function drawTextLayers(ctx, w, h, scale) {
  textLayers.forEach(layer => {
    const x = (layer.x / 100) * w;
    const y = (layer.y / 100) * h;
    const size = layer.size * scale;
    ctx.font = `${layer.bold ? 'bold ' : ''}${size}px ${layer.font}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    if (layer.outline) {
      ctx.strokeStyle = 'rgba(0,0,0,0.7)';
      ctx.lineWidth = 3;
      ctx.strokeText(layer.text, x, y);
    }
    ctx.fillStyle = layer.color;
    ctx.fillText(layer.text, x, y);
  });
}

function renderLayerControls(container, updatePreview) {
  const layersArea = container.querySelector('#layers-area');
  layersArea.innerHTML = textLayers.map((layer, i) => `
    <div style="background:var(--color-surface);padding:var(--space-4);border-radius:var(--radius-md);margin-bottom:var(--space-3);border:1px solid var(--color-border);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-3);">
        <strong>Text ${i + 1}</strong>
        ${textLayers.length > 1 ? `<button class="btn btn-sm btn-ghost" data-remove="${i}" style="color:var(--color-error);">Remove</button>` : ''}
      </div>
      <div class="form-group"><label>Text</label><input type="text" class="text-input" data-field="text" data-idx="${i}" value="${layer.text}"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-3);">
        <div class="form-group"><label>Size</label><input type="number" class="text-input" data-field="size" data-idx="${i}" value="${layer.size}" min="8" max="200"></div>
        <div class="form-group"><label>Color</label><input type="color" data-field="color" data-idx="${i}" value="${layer.color}" style="width:100%;height:38px;border:1px solid var(--color-border);border-radius:var(--radius-md);cursor:pointer;"></div>
        <div class="form-group"><label>Font</label>
          <select class="select-input" data-field="font" data-idx="${i}">
            ${['Arial', 'Verdana', 'Georgia', 'Times New Roman', 'Courier New', 'Impact'].map(f => `<option value="${f}" ${layer.font === f ? 'selected' : ''}>${f}</option>`).join('')}
          </select>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);">
        <div class="form-group"><label>X Position (%)</label><input type="range" min="0" max="100" value="${layer.x}" data-field="x" data-idx="${i}" class="range-slider-input"></div>
        <div class="form-group"><label>Y Position (%)</label><input type="range" min="0" max="100" value="${layer.y}" data-field="y" data-idx="${i}" class="range-slider-input"></div>
      </div>
      <div style="display:flex;gap:var(--space-3);">
        <label class="checkbox-label"><input type="checkbox" data-field="bold" data-idx="${i}" ${layer.bold ? 'checked' : ''}> Bold</label>
        <label class="checkbox-label"><input type="checkbox" data-field="outline" data-idx="${i}" ${layer.outline ? 'checked' : ''}> Text Outline</label>
      </div>
    </div>
  `).join('');

  layersArea.querySelectorAll('[data-field]').forEach(el => {
    const idx = parseInt(el.dataset.idx);
    const field = el.dataset.field;
    const evt = el.type === 'range' || el.type === 'text' ? 'input' : 'change';
    el.addEventListener(evt, () => {
      textLayers[idx][field] = el.type === 'checkbox' ? el.checked : el.type === 'range' || el.type === 'number' ? Number(el.value) : el.value;
      updatePreview();
    });
  });

  layersArea.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      textLayers.splice(parseInt(btn.dataset.remove), 1);
      renderLayerControls(container, updatePreview);
      updatePreview();
    });
  });
}

export const render = createImageTool({
  optionsHTML: `
    <div id="layers-area"></div>
    <button class="btn btn-secondary" id="add-layer-btn" style="width:100%;margin-bottom:var(--space-3);">+ Add Another Text</button>
  `,
  previewStyle: 'text-align:center;margin:var(--space-4) 0;position:relative;display:inline-block;max-width:100%;cursor:move;',
  drawEffect(ctx, w, h, scale, tctx, img) {
    ctx.drawImage(img, 0, 0, w, h);
    drawTextLayers(ctx, w, h, scale);
  },
  onReady({ container, updatePreview }) {
    renderLayerControls(container, updatePreview);
    container.querySelector('#add-layer-btn').addEventListener('click', () => {
      textLayers.push({ text: 'New Text', x: 50, y: 50, size: 36, color: '#ffffff', font: 'Arial', bold: true, outline: true });
      renderLayerControls(container, updatePreview);
      updatePreview();
    });
  },
});

export function destroy() {}
