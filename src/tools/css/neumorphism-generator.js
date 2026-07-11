const PRESETS = [
  { name: "Light Mode", bg: "#e0e0e0", shadow: "#bebebe", highlight: "#ffffff" },
  { name: "Dark Mode", bg: "#2d2d2d", shadow: "#1a1a1a", highlight: "#404040" },
  { name: "Soft Blue", bg: "#e0e5ec", shadow: "#a3b1c6", highlight: "#ffffff" },
  { name: "Warm Gray", bg: "#e0dcd5", shadow: "#b8b4ad", highlight: "#ffffff" },
  { name: "Cool Gray", bg: "#e0e4ea", shadow: "#b0b8c4", highlight: "#ffffff" },
  { name: "Pastel Pink", bg: "#f0e0e8", shadow: "#d0b8c4", highlight: "#ffffff" },
  { name: "Pastel Blue", bg: "#e0e8f0", shadow: "#b8c4d0", highlight: "#ffffff" },
  { name: "Mint Green", bg: "#e0f0e8", shadow: "#b8d0c4", highlight: "#ffffff" }
];

export const toolConfig = {
  id: "neumorphism-generator",
  name: "CSS Neumorphism Studio",
  category: "css",
  description:
    "Interactive tool to generate convex, concave, or pressed neumorphic shadow sets based on hue luminance offset.",
  icon: "🔘",
  accept: null,
  maxSizeMB: null,
  keywords: [
    "neumorphism",
    "neumorphic",
    "soft ui",
    "css shadows",
    "convex",
    "concave",
    "pressed",
    "extruded"
  ],
  steps: [
    "Choose a preset or custom background color",
    "Adjust shadow intensity and blur",
    "Select element shape (convex, concave, pressed)",
    "Copy the generated CSS code"
  ],
  faqs: [
    {
      question: "What is neumorphism?",
      answer:
        "Neumorphism (or soft UI) is a design trend that uses two opposing shadows to create extruded, 3D-looking elements that appear to push out from or sink into the background."
    },
    {
      question: "What are convex, concave, and pressed?",
      answer:
        "Convex appears raised (like a button), concave appears recessed (like an input field), and pressed appears flattened (active state)."
    },
    {
      question: "Why must the background match?",
      answer:
        "Neumorphism relies on subtle shadow differences. The element color must be similar to the background for the shadows to create the 3D illusion."
    }
  ]
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-layout">
      <div class="neo-studio">
        <div class="neo-controls">
          <div class="form-group">
            <label>Preset</label>
            <select id="neo-preset" class="text-input">
              ${PRESETS.map((p, i) => `<option value="${i}">${p.name}</option>`).join("")}
              <option value="custom">Custom</option>
            </select>
          </div>
          <div class="form-group">
            <label>Background Color</label>
            <input type="color" id="neo-bg" value="#e0e0e0">
          </div>
          <div class="form-group">
            <label>Shadow Intensity: <span id="neo-intensity-val">30</span>%</label>
            <input type="range" id="neo-intensity" min="5" max="80" step="1" value="30">
          </div>
          <div class="form-group">
            <label>Shadow Blur: <span id="neo-blur-val">20</span>px</label>
            <input type="range" id="neo-blur" min="5" max="60" step="1" value="20">
          </div>
          <div class="form-group">
            <label>Shadow Distance: <span id="neo-distance-val">10</span>px</label>
            <input type="range" id="neo-distance" min="1" max="30" step="1" value="10">
          </div>
          <div class="form-group">
            <label>Border Radius: <span id="neo-radius-val">20</span>px</label>
            <input type="range" id="neo-radius" min="0" max="50" step="1" value="20">
          </div>
          <div class="form-group">
            <label>Element Shape</label>
            <div class="neo-shape-btns">
              <button class="neo-shape-btn active" data-shape="convex">Convex</button>
              <button class="neo-shape-btn" data-shape="concave">Concave</button>
              <button class="neo-shape-btn" data-shape="pressed">Pressed</button>
            </div>
          </div>
        </div>
        <div class="neo-preview-area" id="neo-preview-area">
          <div class="neo-card" id="neo-card">
            <div class="neo-card-content">
              <div class="neo-card-icon">🔘</div>
              <h3>Neumorphic Card</h3>
              <p>Soft UI effect</p>
            </div>
          </div>
        </div>
      </div>
      <div class="neo-output">
        <label>Generated CSS</label>
        <textarea id="neo-css" class="text-input" readonly style="width:100%;min-height:160px;font-family:monospace;font-size:var(--text-sm);resize:vertical;"></textarea>
        <button class="btn btn-secondary" id="neo-copy" style="width:100%;margin-top:var(--space-2);">Copy CSS</button>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .neo-studio { display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);margin-bottom:var(--space-4); }
    .neo-controls { display:flex;flex-direction:column;gap:var(--space-3); }
    .neo-preview-area { border-radius:var(--radius-lg);min-height:320px;display:flex;align-items:center;justify-content:center;padding:var(--space-6);transition:background 0.3s;position:relative;overflow:hidden; }
    .neo-card { width:220px;padding:var(--space-6);text-align:center;transition:all 0.3s; }
    .neo-card-content h3 { margin:var(--space-2) 0 var(--space-1);font-size:var(--text-lg); }
    .neo-card-content p { font-size:var(--text-sm);margin:0; }
    .neo-card-icon { font-size:2rem; }
    .neo-output { margin-top:var(--space-2); }
    .neo-shape-btns { display:flex;gap:var(--space-2); }
    .neo-shape-btn { padding:var(--space-2) var(--space-3);border-radius:var(--radius-md);background:var(--color-surface);border:1px solid var(--color-border);cursor:pointer;font-size:var(--text-sm);transition:all 0.2s; }
    .neo-shape-btn.active { background:var(--color-primary);color:white;border-color:var(--color-primary); }
    @media (max-width:768px) { .neo-studio { grid-template-columns:1fr; } }
  `;
  container.appendChild(style);

  const preset = container.querySelector("#neo-preset");
  const bg = container.querySelector("#neo-bg");
  const intensity = container.querySelector("#neo-intensity");
  const blur = container.querySelector("#neo-blur");
  const distance = container.querySelector("#neo-distance");
  const radius = container.querySelector("#neo-radius");
  const shapeBtns = container.querySelectorAll(".neo-shape-btn");
  const card = container.querySelector("#neo-card");
  const previewArea = container.querySelector("#neo-preview-area");
  const cssOutput = container.querySelector("#neo-css");
  const copyBtn = container.querySelector("#neo-copy");

  let currentShape = "convex";

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { r: 224, g: 224, b: 224 };
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    };
  }

  function adjustColor(hex, amount) {
    const rgb = hexToRgb(hex);
    const r = Math.max(0, Math.min(255, rgb.r + amount));
    const g = Math.max(0, Math.min(255, rgb.g + amount));
    const b = Math.max(0, Math.min(255, rgb.b + amount));
    return `rgb(${r},${g},${b})`;
  }

  function update() {
    const bgColor = bg.value;
    const int = parseFloat(intensity.value) / 100;
    const b = parseFloat(blur.value);
    const d = parseFloat(distance.value);
    const r = parseFloat(radius.value);

    previewArea.style.background = bgColor;
    card.style.background = bgColor;
    card.style.borderRadius = `${r}px`;

    const darkShadow = adjustColor(bgColor, -Math.round(50 * int));
    const lightShadow = adjustColor(bgColor, Math.round(50 * int));

    let boxShadow;
    if (currentShape === "convex") {
      boxShadow = `${d}px ${d}px ${b}px ${darkShadow}, -${d}px -${d}px ${b}px ${lightShadow}`;
    } else if (currentShape === "concave") {
      boxShadow = `inset ${d}px ${d}px ${b}px ${darkShadow}, inset -${d}px -${d}px ${b}px ${lightShadow}`;
    } else {
      boxShadow = `${d / 2}px ${d / 2}px ${b / 2}px ${darkShadow}, -${d / 2}px -${d / 2}px ${b / 2}px ${lightShadow}`;
    }
    card.style.boxShadow = boxShadow;

    let css = `.neumorphic {\n`;
    css += `  background: ${bgColor};\n`;
    css += `  border-radius: ${r}px;\n`;
    css += `  box-shadow: ${boxShadow};\n`;
    css += `}`;
    cssOutput.value = css;

    container.querySelector("#neo-intensity-val").textContent = Math.round(int * 100);
    container.querySelector("#neo-blur-val").textContent = b;
    container.querySelector("#neo-distance-val").textContent = d;
    container.querySelector("#neo-radius-val").textContent = r;
  }

  preset.addEventListener("change", () => {
    const val = preset.value;
    if (val !== "custom") {
      const p = PRESETS[val];
      bg.value = p.bg;
      update();
    }
  });

  bg.addEventListener("input", () => {
    preset.value = "custom";
    update();
  });

  intensity.addEventListener("input", update);
  blur.addEventListener("input", update);
  distance.addEventListener("input", update);
  radius.addEventListener("input", update);

  shapeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      shapeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentShape = btn.dataset.shape;
      update();
    });
  });

  copyBtn.addEventListener("click", () => {
    navigator.clipboard
      .writeText(cssOutput.value)
      .then(() => {
        copyBtn.textContent = "Copied!";
        setTimeout(() => {
          copyBtn.textContent = "Copy CSS";
        }, 1500);
      })
      .catch(() => {});
  });

  update();
}

export function destroy() {}
