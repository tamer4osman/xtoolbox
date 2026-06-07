import { createCssGenerator } from './css-generator-factory.js';

export const toolConfig = {
  id: 'box-shadow-generator',
  name: 'Box Shadow Generator',
  category: 'css',
  description: 'Visual editor for CSS box-shadow with live preview.',
  icon: '🔲',
  status: 'done'
};

export function render(container) {
  createCssGenerator({
    container,
    cssClass: 'shadow-gen',
    extraCSS: `
      .shadow-gen .preview { width: 150px; height: 150px; margin: 0 auto var(--space-4); background: white; border-radius: var(--radius-lg); }
    `,
    controlsHTML: `
      <div class="control-row">
        <label>Horizontal</label>
        <input type="range" id="h" min="-50" max="50" value="10">
        <span id="hVal">10px</span>
      </div>
      <div class="control-row">
        <label>Vertical</label>
        <input type="range" id="v" min="-50" max="50" value="10">
        <span id="vVal">10px</span>
      </div>
      <div class="control-row">
        <label>Blur</label>
        <input type="range" id="blur" min="0" max="100" value="20">
        <span id="blurVal">20px</span>
      </div>
      <div class="control-row">
        <label>Spread</label>
        <input type="range" id="spread" min="-50" max="50" value="0">
        <span id="spreadVal">0px</span>
      </div>
      <div class="control-row">
        <label>Color</label>
        <input type="color" id="color" value="#000000">
        <input type="range" id="opacity" min="0" max="100" value="25">
        <span id="opacityVal">25%</span>
      </div>
      <div class="control-row">
        <label><input type="checkbox" id="inset"> Inset</label>
      </div>
    `,
    onUpdate: ({ values, preview, cssOutput }) => {
      const h = values.h;
      const v = values.v;
      const blur = values.blur;
      const spread = values.spread;
      const color = values.color;
      const opacity = values.opacity;
      const inset = values.inset;
      const rgba = color + Math.round(opacity * 2.55).toString(16).padStart(2, '0');
      const shadow = `${inset ? 'inset ' : ''}${h}px ${v}px ${blur}px ${spread}px ${rgba}`;
      preview.style.boxShadow = shadow;
      cssOutput.textContent = `box-shadow: ${shadow};`;
      const set = (id, val) => { const el = preview.parentElement.querySelector('#' + id); if (el) el.textContent = val; };
      set('hVal', h + 'px');
      set('vVal', v + 'px');
      set('blurVal', blur + 'px');
      set('spreadVal', spread + 'px');
      set('opacityVal', opacity + '%');
    }
  });
}
