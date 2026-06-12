import { createImageTool } from './create-image-tool.js';

export const toolConfig = {
  id: 'rotate-flip-image',
  name: 'Rotate & Flip Image',
  category: 'image',
  description: 'Rotate images 90°, 180°, 270° or flip horizontally/vertically.',
  icon: '🔄',
  accept: 'image/*',
  maxSizeMB: 50,
  keywords: ['rotate image', 'flip image', 'turn image', 'mirror image'],
  steps: ['Upload an image', 'Click rotate or flip buttons', 'Preview the result', 'Download'],
  faqs: [
    { question: 'Can I combine rotation and flip?', answer: 'Yes. Apply multiple operations before downloading.' }
  ]
};

let rotation = 0;
let flipH = false;
let flipV = false;

function getDimensions(img, maxScale) {
  const isRotated = rotation % 180 !== 0;
  return {
    w: isRotated ? img.naturalHeight : img.naturalWidth,
    h: isRotated ? img.naturalWidth : img.naturalHeight,
  };
}

function drawEffect(ctx, w, h, scale, tctx, img) {
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(rotation * Math.PI / 180);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.drawImage(img, -img.naturalWidth * scale / 2, -img.naturalHeight * scale / 2, img.naturalWidth * scale, img.naturalHeight * scale);
  ctx.restore();
}

export const render = createImageTool({
  optionsHTML: `
    <div style="display:flex;gap:var(--space-2);justify-content:center;flex-wrap:wrap;margin-bottom:var(--space-4);">
      <button class="btn btn-secondary" id="rotate-ccw">↺ 90° Left</button>
      <button class="btn btn-secondary" id="rotate-cw">↻ 90° Right</button>
      <button class="btn btn-secondary" id="rotate-180">↕ 180°</button>
      <button class="btn btn-secondary" id="flip-h">↔ Flip H</button>
      <button class="btn btn-secondary" id="flip-v">↕ Flip V</button>
      <button class="btn btn-ghost" id="reset-btn">Reset</button>
    </div>
  `,
  drawEffect,
  getDimensions,
  onUpload: () => { rotation = 0; flipH = false; flipV = false; },
  onReady: ({ container, updatePreview }) => {
    container.querySelector('#rotate-ccw').addEventListener('click', () => { rotation = (rotation - 90 + 360) % 360; updatePreview(); });
    container.querySelector('#rotate-cw').addEventListener('click', () => { rotation = (rotation + 90) % 360; updatePreview(); });
    container.querySelector('#rotate-180').addEventListener('click', () => { rotation = (rotation + 180) % 360; updatePreview(); });
    container.querySelector('#flip-h').addEventListener('click', () => { flipH = !flipH; updatePreview(); });
    container.querySelector('#flip-v').addEventListener('click', () => { flipV = !flipV; updatePreview(); });
    container.querySelector('#reset-btn').addEventListener('click', () => { rotation = 0; flipH = false; flipV = false; updatePreview(); });
  },
  destroy: () => {},
});
