import { createCssGenerator } from "./css-generator-factory.js";

export const toolConfig = {
  id: "border-radius-generator",
  name: "Border Radius Generator",
  category: "css",
  description: "Visual editor for CSS border-radius with per-corner control.",
  icon: "⬜",
  status: "done"
};

export function render(container) {
  createCssGenerator({
    container,
    cssClass: "br-gen",
    extraCSS: `
      .br-gen .preview { width: 150px; height: 150px; margin: 0 auto var(--space-4); background: var(--color-primary); }
      .br-gen .control-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-2); margin-bottom: var(--space-3); }
      .br-gen .corner { text-align: center; }
      .br-gen .corner label { display: block; font-size: var(--text-xs); margin-bottom: var(--space-1); }
      .br-gen .corner input { width: 100%; }
    `,
    controlsHTML: `
      <div class="control-row">
        <label>All Corners</label>
        <input type="range" id="all" min="0" max="100" value="20">
        <span id="allVal">20px</span>
      </div>
      <div class="control-grid">
        <div class="corner"><label>TL</label><input type="range" id="tl" min="0" max="100" value="20"></div>
        <div class="corner"><label>TR</label><input type="range" id="tr" min="0" max="100" value="20"></div>
        <div class="corner"><label>BL</label><input type="range" id="bl" min="0" max="100" value="20"></div>
        <div class="corner"><label>BR</label><input type="range" id="br" min="0" max="100" value="20"></div>
      </div>
      <div class="control-row">
        <label><input type="checkbox" id="linkAll" checked> Link all corners</label>
      </div>
    `,
    onUpdate: ({ values, preview, cssOutput, container }) => {
      const linked = values.linkAll;
      const all = values.all;
      const tl = linked ? all : values.tl;
      const tr = linked ? all : values.tr;
      const bl = linked ? all : values.bl;
      const br = linked ? all : values.br;
      const radius = `${tl}px ${tr}px ${br}px ${bl}px`;
      preview.style.borderRadius = radius;
      cssOutput.textContent = `border-radius: ${radius};`;
      const allVal = container.querySelector("#allVal");
      if (allVal) allVal.textContent = all + "px";
    }
  });
}
