import { createCssGenerator } from "./css-generator-factory.js";

export const toolConfig = {
  id: "clip-path-generator",
  name: "CSS Clip-Path Generator",
  category: "css",
  description: "Visual polygon editor for CSS clip-path.",
  icon: "✂️",
  status: "done"
};

export function render(container) {
  createCssGenerator({
    container,
    cssClass: "clip-gen",
    extraCSS: `
      .clip-gen .preview { width: 200px; height: 200px; margin: 0 auto var(--space-4); background: linear-gradient(135deg, #3b82f6, #8b5cf6); }
      .clip-gen .polygon-inputs { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-2); }
      .clip-gen .point { display: flex; gap: 2px; }
      .clip-gen .point input { width: 100%; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: var(--text-xs); text-align: center; }
    `,
    controlsHTML: `
      <div class="control-group">
        <label>Shape</label>
        <select id="shape">
          <option value="polygon">Polygon</option>
          <option value="circle">Circle</option>
          <option value="ellipse">Ellipse</option>
          <option value="inset">Inset</option>
        </select>
      </div>
      <div class="polygon-inputs" id="polygonInputs">
        <div class="point"><input type="number" id="p1x" value="0"><input type="number" id="p1y" value="0"></div>
        <div class="point"><input type="number" id="p2x" value="100"><input type="number" id="p2y" value="0"></div>
        <div class="point"><input type="number" id="p3x" value="100"><input type="number" id="p3y" value="100"></div>
        <div class="point"><input type="number" id="p4x" value="0"><input type="number" id="p4y" value="100"></div>
      </div>
      <div class="circle-inputs" id="circleInputs" style="display:none">
        <div class="control-row"><label>Radius %</label><input type="range" id="radius" value="50" min="0" max="100"><span id="radiusVal">50%</span></div>
        <div class="control-row"><label>Position X %</label><input type="range" id="cx" value="50" min="0" max="100"><span id="cxVal">50%</span></div>
        <div class="control-row"><label>Position Y %</label><input type="range" id="cy" value="50" min="0" max="100"><span id="cyVal">50%</span></div>
      </div>
      <div class="ellipse-inputs" id="ellipseInputs" style="display:none">
        <div class="control-row"><label>Radius X %</label><input type="range" id="rx" value="50" min="0" max="100"><span id="rxVal">50%</span></div>
        <div class="control-row"><label>Radius Y %</label><input type="range" id="ry" value="50" min="0" max="100"><span id="ryVal">50%</span></div>
        <div class="control-row"><label>Position X %</label><input type="range" id="ex" value="50" min="0" max="100"><span id="exVal">50%</span></div>
        <div class="control-row"><label>Position Y %</label><input type="range" id="ey" value="50" min="0" max="100"><span id="eyVal">50%</span></div>
      </div>
      <div class="inset-inputs" id="insetInputs" style="display:none">
        <div class="control-row"><label>Top</label><input type="range" id="top" value="0"><span id="topVal">0%</span></div>
        <div class="control-row"><label>Right</label><input type="range" id="right" value="0"><span id="rightVal">0%</span></div>
        <div class="control-row"><label>Bottom</label><input type="range" id="bottom" value="0"><span id="bottomVal">0%</span></div>
        <div class="control-row"><label>Left</label><input type="range" id="left" value="0"><span id="leftVal">0%</span></div>
      </div>
    `,
    onUpdate: ({ values, preview, cssOutput, container }) => {
      const shape = values.shape;
      let clip = "";
      container.querySelector("#polygonInputs").style.display =
        shape === "polygon" ? "grid" : "none";
      container.querySelector("#circleInputs").style.display =
        shape === "circle" ? "block" : "none";
      container.querySelector("#ellipseInputs").style.display =
        shape === "ellipse" ? "block" : "none";
      container.querySelector("#insetInputs").style.display = shape === "inset" ? "block" : "none";
      const setVal = (id, v) => {
        const el = container.querySelector("#" + id);
        if (el) el.textContent = v;
      };
      if (shape === "polygon") {
        const pts = [];
        for (let i = 1; i <= 4; i++) {
          pts.push(values["p" + i + "x"] + "% " + values["p" + i + "y"] + "%");
        }
        clip = "polygon(" + pts.join(", ") + ")";
      } else if (shape === "circle") {
        const r = values.radius;
        const cx = values.cx;
        const cy = values.cy;
        clip = "circle(" + r + "% at " + cx + "% " + cy + "%)";
        setVal("radiusVal", r + "%");
        setVal("cxVal", cx + "%");
        setVal("cyVal", cy + "%");
      } else if (shape === "inset") {
        const t = values.top,
          r = values.right,
          b = values.bottom,
          l = values.left;
        clip = "inset(" + t + "% " + r + "% " + b + "% " + l + "%)";
        setVal("topVal", t + "%");
        setVal("rightVal", r + "%");
        setVal("bottomVal", b + "%");
        setVal("leftVal", l + "%");
      } else if (shape === "ellipse") {
        const rx = values.rx,
          ry = values.ry,
          ex = values.ex,
          ey = values.ey;
        clip = "ellipse(" + rx + "% " + ry + "% at " + ex + "% " + ey + "%)";
        setVal("rxVal", rx + "%");
        setVal("ryVal", ry + "%");
        setVal("exVal", ex + "%");
        setVal("eyVal", ey + "%");
      }
      preview.style.clipPath = clip;
      cssOutput.textContent = "clip-path: " + clip + ";";
    }
  });
}
