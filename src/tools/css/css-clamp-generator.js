export const toolConfig = {
  id: "css-clamp-generator",
  name: "Fluid Typography (CSS Clamp) Calculator",
  category: "css",
  description:
    "Calculate responsive font scales using CSS clamp() function with preferred viewport mathematical scale.",
  icon: "📐",
  accept: null,
  maxSizeMB: null,
  keywords: [
    "css clamp",
    "fluid typography",
    "responsive font",
    "viewport scaling",
    "clamp calculator",
    "font size"
  ],
  steps: [
    "Set min and max viewport widths",
    "Set min and max font sizes",
    "Copy the generated clamp() CSS rule"
  ],
  faqs: [
    {
      question: "What does clamp() do?",
      answer:
        "clamp() clamps a value between an upper and lower bound. For fluid typography, it lets text scale smoothly between viewport sizes."
    },
    {
      question: "When should I use fluid typography?",
      answer:
        "Use it for headings and body text where you want smooth scaling between breakpoints instead of abrupt media query jumps."
    },
    {
      question: "What units should I use?",
      answer:
        "Use px for precise control or rem for accessibility (respects user font-size settings). The preferred value uses vw units."
    }
  ]
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-layout">
      <div class="clamp-grid">
        <div class="clamp-inputs">
          <div class="form-group">
            <h3 style="margin-bottom:var(--space-3);font-size:var(--text-base);">Viewport Range</h3>
            <div class="clamp-row">
              <div style="flex:1">
                <label>Min Width</label>
                <input type="number" id="cc-min-vw" class="text-input" value="320" min="1">
                <select id="cc-vw-unit" class="text-input" style="width:auto;display:inline-block;margin-left:var(--space-1);">
                  <option value="px">px</option>
                  <option value="rem">rem</option>
                </select>
              </div>
              <div style="flex:1">
                <label>Max Width</label>
                <input type="number" id="cc-max-vw" class="text-input" value="1200" min="1">
                <span style="margin-left:var(--space-1);font-size:var(--text-sm);color:var(--color-text-secondary);" id="cc-max-vw-unit">px</span>
              </div>
            </div>
          </div>
          <div class="form-group">
            <h3 style="margin-bottom:var(--space-3);font-size:var(--text-base);">Font Size Range</h3>
            <div class="clamp-row">
              <div style="flex:1">
                <label>Min Size</label>
                <input type="number" id="cc-min-size" class="text-input" value="16" min="1" step="0.5">
                <select id="cc-size-unit" class="text-input" style="width:auto;display:inline-block;margin-left:var(--space-1);">
                  <option value="px">px</option>
                  <option value="rem">rem</option>
                </select>
              </div>
              <div style="flex:1">
                <label>Max Size</label>
                <input type="number" id="cc-max-size" class="text-input" value="32" min="1" step="0.5">
                <span style="margin-left:var(--space-1);font-size:var(--text-sm);color:var(--color-text-secondary);" id="cc-max-size-unit">px</span>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>Preview Text Size</label>
            <div style="display:flex;gap:var(--space-2);align-items:center;">
              <span style="font-size:var(--text-sm);">320px</span>
              <input type="range" id="cc-preview-vw" min="320" max="1200" value="760" style="flex:1;">
              <span style="font-size:var(--text-sm);">1200px</span>
            </div>
            <span style="font-size:var(--text-xs);color:var(--color-text-secondary);" id="cc-preview-label">Preview at 760px viewport</span>
          </div>
        </div>
        <div class="clamp-chart">
          <h3 style="margin-bottom:var(--space-2);font-size:var(--text-base);text-align:center;">Size Scale Preview</h3>
          <div class="clamp-scale-visual" id="cc-scale-visual">
            <div class="clamp-bar" id="cc-min-bar">
              <span id="cc-min-label">16px</span>
            </div>
            <div class="clamp-bar" id="cc-max-bar">
              <span id="cc-max-label">32px</span>
            </div>
          </div>
          <div class="clamp-preview-text" id="cc-preview-text">
            The quick brown fox jumps over the lazy dog
          </div>
        </div>
      </div>
      <div class="clamp-result">
        <div class="form-group">
          <label>Generated CSS Rule</label>
          <textarea id="cc-css" class="text-input" readonly style="width:100%;min-height:80px;font-family:monospace;font-size:var(--text-sm);resize:vertical;"></textarea>
        </div>
        <button class="btn btn-secondary" id="cc-copy" style="width:100%;">Copy CSS</button>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .clamp-grid { display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);margin-bottom:var(--space-4); }
    .clamp-row { display:flex;gap:var(--space-3); }
    .clamp-scale-visual { display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-4);background:var(--color-surface);border-radius:var(--radius-lg);margin-bottom:var(--space-3); }
    .clamp-bar { display:flex;align-items:center;gap:var(--space-2); }
    .clamp-bar span { font-family:monospace;font-size:var(--text-sm);color:var(--color-text-secondary); }
    #cc-min-bar::before { content:'';height:12px;flex:1;background:var(--color-primary);border-radius:var(--radius-sm);opacity:0.6; }
    #cc-max-bar::before { content:'';height:24px;flex:1;background:var(--color-primary);border-radius:var(--radius-sm); }
    .clamp-preview-text { padding:var(--space-4);background:var(--color-surface);border-radius:var(--radius-lg);text-align:center;border:1px solid var(--color-border);word-break:break-word; }
    @media (max-width:768px) { .clamp-grid { grid-template-columns:1fr; } .clamp-row { flex-direction:column; } }
  `;
  container.appendChild(style);

  const minVw = container.querySelector("#cc-min-vw");
  const maxVw = container.querySelector("#cc-max-vw");
  const vwUnit = container.querySelector("#cc-vw-unit");
  const minSize = container.querySelector("#cc-min-size");
  const maxSize = container.querySelector("#cc-max-size");
  const sizeUnit = container.querySelector("#cc-size-unit");
  const previewVw = container.querySelector("#cc-preview-vw");
  const previewLabel = container.querySelector("#cc-preview-label");
  const cssOutput = container.querySelector("#cc-css");
  const copyBtn = container.querySelector("#cc-copy");
  const previewText = container.querySelector("#cc-preview-text");
  const minLabel = container.querySelector("#cc-min-label");
  const maxLabel = container.querySelector("#cc-max-label");
  const maxVwUnit = container.querySelector("#cc-max-vw-unit");
  const maxSizeUnit = container.querySelector("#cc-max-size-unit");

  function update() {
    const mnVw = parseFloat(minVw.value) || 320;
    const mxVw = parseFloat(maxVw.value) || 1200;
    const mnSz = parseFloat(minSize.value) || 16;
    const mxSz = parseFloat(maxSize.value) || 32;
    const vu = vwUnit.value;
    const su = sizeUnit.value;

    maxVwUnit.textContent = vu;
    maxSizeUnit.textContent = su;

    previewVw.min = mnVw;
    previewVw.max = mxVw;
    const pVw = parseFloat(previewVw.value);
    previewLabel.textContent = `Preview at ${pVw}${vu} viewport`;

    if (mxVw <= mnVw || mxSz <= mnSz) {
      cssOutput.value = "/* Max values must be greater than min values */";
      previewText.style.fontSize = mnSz + su;
      return;
    }

    const slope = (mxSz - mnSz) / (mxVw - mnVw);
    const yInter = -mnVw * slope + mnSz;
    const preferred = `${yInter.toFixed(4)}${su} + ${(slope * 100).toFixed(4)}vw`;
    const clampRule = `font-size: clamp(${mnSz}${su}, ${preferred}, ${mxSz}${su});`;

    cssOutput.value = `.fluid-text {\n  ${clampRule}\n}`;

    const currentSize = yInter + slope * pVw;
    previewText.style.fontSize = `${Math.max(mnSz, Math.min(mxSz, currentSize))}${su}`;

    minLabel.textContent = `${mnSz}${su}`;
    maxLabel.textContent = `${mxSz}${su}`;
  }

  minVw.addEventListener("input", update);
  maxVw.addEventListener("input", update);
  vwUnit.addEventListener("change", update);
  minSize.addEventListener("input", update);
  maxSize.addEventListener("input", update);
  sizeUnit.addEventListener("change", update);
  previewVw.addEventListener("input", update);

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
