import { createCssGenerator } from './css-generator-factory.js';

export const toolConfig = {
  id: 'css-grid-generator',
  name: 'CSS Grid Generator',
  category: 'css',
  description: 'Visual builder for CSS Grid layouts with copy-ready code.',
  icon: '📐',
  status: 'done'
};

export function render(container) {
  const { preview } = createCssGenerator({
    container,
    cssClass: 'grid-gen',
    maxWidth: '800px',
    previewHTML: '<div class="preview" id="preview"><div class="grid-box">1</div><div class="grid-box">2</div><div class="grid-box">3</div><div class="grid-box">4</div><div class="grid-box">5</div><div class="grid-box">6</div></div>',
    extraCSS: `
      .grid-gen .preview { display: grid; background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); min-height: 200px; margin-bottom: var(--space-4); }
      .grid-gen .grid-box { background: var(--color-primary); color: white; padding: var(--space-4); display: flex; align-items: center; justify-content: center; font-weight: 600; border-radius: var(--radius-md); }
      .grid-gen .control-row input[type="text"] { flex: 1; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    `,
    controlsHTML: `
      <div class="control-row">
        <label>Columns</label>
        <input type="text" id="columns" value="1fr 1fr 1fr" placeholder="e.g. 1fr 1fr 1fr">
      </div>
      <div class="control-row">
        <label>Rows</label>
        <input type="text" id="rows" value="auto auto" placeholder="e.g. auto 100px">
      </div>
      <div class="control-row">
        <label>Gap</label>
        <input type="range" id="gap" min="0" max="50" value="16">
        <span id="gapVal">16px</span>
      </div>
      <div class="control-row">
        <label>Justify Items</label>
        <select id="justify"><option value="stretch">stretch</option><option value="start">start</option><option value="end">end</option><option value="center">center</option></select>
      </div>
      <div class="control-row">
        <label>Align Items</label>
        <select id="align"><option value="stretch">stretch</option><option value="start">start</option><option value="end">end</option><option value="center">center</option></select>
      </div>
    `,
    onUpdate: ({ values, preview, cssOutput, container }) => {
      const cols = values.columns;
      const rows = values.rows;
      const gap = values.gap;
      const justify = values.justify;
      const align = values.align;
      preview.style.gridTemplateColumns = cols;
      preview.style.gridTemplateRows = rows;
      preview.style.gap = gap + 'px';
      preview.style.justifyItems = justify;
      preview.style.alignItems = align;
      cssOutput.textContent = `.container {
  display: grid;
  grid-template-columns: ${cols};
  grid-template-rows: ${rows};
  gap: ${gap}px;
  justify-items: ${justify};
  align-items: ${align};
}`;
      const gapVal = container.querySelector('#gapVal');
      if (gapVal) gapVal.textContent = gap + 'px';
    }
  });
}
