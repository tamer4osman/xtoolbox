import { createImageFilterTool } from './image-filter-tool.js';

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

export const render = createImageFilterTool({
  optionsHTML: `
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
    </div>
  `,
  getFilter: (t) => `brightness(${t.getValue('brightness')}%) contrast(${t.getValue('contrast')}%) saturate(${t.getValue('saturation')}%) blur(${t.getValue('blur')}px)`,
  filename: 'adjusted.png',
  onReady: ({ container, tctx, updatePreview }) => {
    const ids = ['brightness', 'contrast', 'saturation', 'blur'];
    const valIds = ['bright-val', 'contrast-val', 'sat-val', 'blur-val'];
    ids.forEach((id, i) => {
      container.querySelector(`#${id}`).addEventListener('input', () => {
        tctx.setText(valIds[i], tctx.getValue(id));
        updatePreview();
      });
    });
    container.querySelector('#reset-btn').addEventListener('click', () => {
      ids.forEach((id, i) => {
        const v = id === 'blur' ? 0 : 100;
        container.querySelector(`#${id}`).value = v;
        tctx.setText(valIds[i], v);
      });
      updatePreview();
    });
  }
});

export function destroy() {}
