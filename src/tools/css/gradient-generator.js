import { createCssGenerator } from "./css-generator-factory.js";

export const toolConfig = {
  id: "gradient-generator",
  name: "CSS Gradient Generator",
  category: "css",
  description: "Visual editor for linear, radial, and conic CSS gradients.",
  icon: "🎨",
  status: "done"
};

export function render(container) {
  const { fire } = createCssGenerator({
    container,
    cssClass: "gradient-gen",
    maxWidth: "700px",
    extraCSS: `
      .gradient-gen .preview { height: 200px; border-radius: var(--radius-xl); margin-bottom: var(--space-4); background: linear-gradient(90deg, #3b82f6, #8b5cf6); }
      .gradient-gen .color-stops { margin-bottom: var(--space-3); }
      .gradient-gen .color-stop { display: flex; gap: var(--space-2); margin-bottom: var(--space-2); }
      .gradient-gen .color-stop input[type="color"] { width: 40px; height: 40px; padding: 0; border: none; cursor: pointer; }
      .gradient-gen .color-stop input[type="text"] { flex: 1; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-family: monospace; }
      .gradient-gen .add-btn { width: 100%; padding: var(--space-2); background: var(--color-bg); border: 1px dashed var(--color-border); border-radius: var(--radius-md); cursor: pointer; }
    `,
    controlsHTML: `
      <div class="control-group">
        <label>Type</label>
        <select id="type"><option value="linear">Linear</option><option value="radial">Radial</option><option value="conic">Conic</option></select>
      </div>
      <div class="control-row">
        <label>Angle</label>
        <input type="range" id="angle" min="0" max="360" value="90">
        <span id="angleVal">90°</span>
      </div>
      <div class="color-stops" id="colorStops">
        <div class="color-stop"><input type="color" value="#3b82f6"><input type="text" value="#3b82f6"></div>
        <div class="color-stop"><input type="color" value="#8b5cf6"><input type="text" value="#8b5cf6"></div>
      </div>
      <button id="addStopBtn" class="add-btn">+ Add Color</button>
    `,
    onUpdate: ({ values, preview, cssOutput, container, controls }) => {
      const type = values.type;
      const angle = values.angle;
      const colorEls = controls.querySelectorAll('.color-stop input[type="color"]');
      const colors = Array.from(colorEls).map(el => el.value);
      let gradient;
      if (type === "linear") gradient = `linear-gradient(${angle}deg, ${colors.join(", ")})`;
      else if (type === "radial") gradient = `radial-gradient(circle, ${colors.join(", ")})`;
      else gradient = `conic-gradient(from ${angle}deg, ${colors.join(", ")})`;
      preview.style.background = gradient;
      cssOutput.textContent = `background: ${gradient};`;
      const angleVal = container.querySelector("#angleVal");
      if (angleVal) angleVal.textContent = angle + "°";
    }
  });

  const controlsEl = container.querySelector(".controls");
  container.querySelector("#addStopBtn").addEventListener("click", () => {
    const div = document.createElement("div");
    div.className = "color-stop";
    div.innerHTML = '<input type="color" value="#ffffff"><input type="text" value="#ffffff">';
    controlsEl.querySelector("#colorStops").appendChild(div);
    div.querySelector('input[type="color"]').addEventListener("input", fire);
    div.querySelector('input[type="text"]').addEventListener("input", fire);
    fire();
  });
}
