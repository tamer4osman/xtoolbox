const BACKGROUNDS = [
  { name: "Gradient Sunrise", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Gradient Ocean", value: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)" },
  { name: "Gradient Sunset", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { name: "Gradient Forest", value: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" },
  {
    name: "Gradient Midnight",
    value: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)"
  },
  { name: "Solid Light", value: "#f0f0f0" },
  { name: "Solid Dark", value: "#1a1a2e" },
  { name: "Solid Blue", value: "#2563eb" }
];

export const toolConfig = {
  id: "glassmorphism-generator",
  name: "CSS Glassmorphism Studio",
  category: "css",
  description:
    "Interactive studio for generating cross-browser glassmorphism (frosted glass) CSS with Safari fallbacks.",
  icon: "🔮",
  accept: null,
  maxSizeMB: null,
  keywords: [
    "glassmorphism",
    "frosted glass",
    "css glass effect",
    "backdrop-filter",
    "glass generator",
    "safari glass"
  ],
  steps: [
    "Choose a background",
    "Adjust blur, opacity, and radius sliders",
    "Copy the generated CSS code"
  ],
  faqs: [
    {
      question: "What is glassmorphism?",
      answer:
        "Glassmorphism is a UI design trend that creates a frosted glass effect using backdrop-filter: blur()."
    },
    {
      question: "Why does Safari need special handling?",
      answer:
        "Safari requires the -webkit- prefix for backdrop-filter. Our generator includes both standard and prefixed rules."
    },
    {
      question: "Does this work on all browsers?",
      answer:
        "Yes! Chrome, Firefox, Edge support backdrop-filter natively. Safari requires -webkit-backdrop-filter which we include."
    }
  ]
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-layout">
      <div class="gg-studio">
        <div class="gg-controls">
          <div class="form-group">
            <label>Background</label>
            <select id="gg-bg" class="text-input">
              ${BACKGROUNDS.map((b, i) => `<option value="${i}">${b.name}</option>`).join("")}
            </select>
          </div>
          <div class="form-group">
            <label>Glass Blur: <span id="gg-blur-val">10</span>px</label>
            <input type="range" id="gg-blur" min="0" max="40" step="1" value="10">
          </div>
          <div class="form-group">
            <label>Glass Opacity: <span id="gg-opacity-val">0.15</span></label>
            <input type="range" id="gg-opacity" min="0" max="100" step="1" value="15">
          </div>
          <div class="form-group">
            <label>Border Opacity: <span id="gg-border-opacity-val">0.20</span></label>
            <input type="range" id="gg-border-opacity" min="0" max="100" step="1" value="20">
          </div>
          <div class="form-group">
            <label>Border Radius: <span id="gg-radius-val">16</span>px</label>
            <input type="range" id="gg-radius" min="0" max="50" step="1" value="16">
          </div>
          <div class="form-group">
            <label>Saturation: <span id="gg-saturation-val">1.0</span></label>
            <input type="range" id="gg-saturation" min="50" max="200" step="1" value="100">
          </div>
          <div class="form-group">
            <label>Glass Hue</label>
            <input type="color" id="gg-hue" value="#ffffff">
          </div>
          <div class="form-group">
            <label><input type="checkbox" id="gg-safari" checked> Safari fallback (-webkit-)</label>
          </div>
        </div>
        <div class="gg-preview-area" id="gg-preview-area">
          <div class="gg-card" id="gg-card">
            <div class="gg-card-content">
              <div class="gg-card-icon">🔮</div>
              <h3>Glass Card</h3>
              <p>Frosted glass effect</p>
            </div>
          </div>
        </div>
      </div>
      <div class="gg-output">
        <label>Generated CSS</label>
        <textarea id="gg-css" class="text-input" readonly style="width:100%;min-height:160px;font-family:monospace;font-size:var(--text-sm);resize:vertical;"></textarea>
        <button class="btn btn-secondary" id="gg-copy" style="width:100%;margin-top:var(--space-2);">Copy CSS</button>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .gg-studio { display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);margin-bottom:var(--space-4); }
    .gg-controls { display:flex;flex-direction:column;gap:var(--space-3); }
    .gg-preview-area { border-radius:var(--radius-lg);min-height:320px;display:flex;align-items:center;justify-content:center;padding:var(--space-6);transition:background 0.3s;position:relative;overflow:hidden; }
    .gg-card { width:220px;padding:var(--space-6);border-radius:var(--radius-xl);text-align:center;transition:all 0.3s; }
    .gg-card-content h3 { margin:var(--space-2) 0 var(--space-1);font-size:var(--text-lg); }
    .gg-card-content p { font-size:var(--text-sm);margin:0; }
    .gg-card-icon { font-size:2rem; }
    .gg-output { margin-top:var(--space-2); }
    @media (max-width:768px) { .gg-studio { grid-template-columns:1fr; } }
  `;
  container.appendChild(style);

  const bg = container.querySelector("#gg-bg");
  const blur = container.querySelector("#gg-blur");
  const opacity = container.querySelector("#gg-opacity");
  const borderOp = container.querySelector("#gg-border-opacity");
  const radius = container.querySelector("#gg-radius");
  const saturation = container.querySelector("#gg-saturation");
  const hue = container.querySelector("#gg-hue");
  const safari = container.querySelector("#gg-safari");
  const card = container.querySelector("#gg-card");
  const previewArea = container.querySelector("#gg-preview-area");
  const cssOutput = container.querySelector("#gg-css");
  const copyBtn = container.querySelector("#gg-copy");

  function update() {
    const b = parseFloat(blur.value);
    const o = (parseFloat(opacity.value) / 100).toFixed(2);
    const bo = (parseFloat(borderOp.value) / 100).toFixed(2);
    const r = parseFloat(radius.value);
    const s = (parseFloat(saturation.value) / 100).toFixed(1);
    const h = hue.value;
    const useSafari = safari.checked;

    previewArea.style.background = BACKGROUNDS[bg.value].value;

    const bgStyle = `rgba(${hexToRgb(h)}, ${o})`;
    const borderStyle = `rgba(${hexToRgb(h)}, ${bo})`;
    const satStyle = `saturate(${s})`;

    card.style.background = bgStyle;
    card.style.backdropFilter = `${satStyle} blur(${b}px)`;
    if (useSafari) card.style.webkitBackdropFilter = `${satStyle} blur(${b}px)`;
    else card.style.webkitBackdropFilter = "none";
    card.style.borderRadius = `${r}px`;
    card.style.border = `1px solid ${borderStyle}`;
    card.style.boxShadow = `0 8px 32px 0 rgba(31, 38, 135, ${(parseFloat(o) * 0.6).toFixed(2)})`;

    let css = `.glass {\n`;
    css += `  background: ${bgStyle};\n`;
    css += `  backdrop-filter: ${satStyle} blur(${b}px);\n`;
    if (useSafari) css += `  -webkit-backdrop-filter: ${satStyle} blur(${b}px);\n`;
    css += `  border-radius: ${r}px;\n`;
    css += `  border: 1px solid ${borderStyle};\n`;
    css += `  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, ${(parseFloat(o) * 0.6).toFixed(2)});\n`;
    css += `}`;
    cssOutput.value = css;

    container.querySelector("#gg-blur-val").textContent = b;
    container.querySelector("#gg-opacity-val").textContent = o;
    container.querySelector("#gg-border-opacity-val").textContent = bo;
    container.querySelector("#gg-radius-val").textContent = r;
    container.querySelector("#gg-saturation-val").textContent = s;
  }

  bg.addEventListener("change", update);
  blur.addEventListener("input", update);
  opacity.addEventListener("input", update);
  borderOp.addEventListener("input", update);
  radius.addEventListener("input", update);
  saturation.addEventListener("input", update);
  hue.addEventListener("input", update);
  safari.addEventListener("change", update);

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

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "255,255,255";
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}
