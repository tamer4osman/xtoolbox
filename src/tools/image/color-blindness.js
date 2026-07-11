import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { loadImageFromFile, downloadCanvas } from "./image-utils.js";

const SIMULATION_TYPES = [
  { id: "protanopia", name: "Protanopia", severity: 1.0, desc: "Red-blind (1% of males)" },
  { id: "deuteranopia", name: "Deuteranopia", severity: 1.0, desc: "Green-blind (1% of males)" },
  { id: "tritanopia", name: "Tritanopia", severity: 1.0, desc: "Blue-blind (rare)" },
  { id: "protanomaly", name: "Protanomaly", severity: 0.6, desc: "Red-weak (mild)" },
  { id: "deuteranomaly", name: "Deuteranomaly", severity: 0.6, desc: "Green-weak (mild)" },
  { id: "achromatopsia", name: "Achromatopsia", severity: 1.0, desc: "Total color blindness" }
];

const MATRICES = {
  protanopia: [
    [0.56667, 0.43333, 0],
    [0.55833, 0.44167, 0],
    [0, 0.24167, 0.75833]
  ],
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7]
  ],
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.43333, 0.56667],
    [0, 0.475, 0.525]
  ],
  achromatopsia: [
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114]
  ]
};

export const toolConfig = {
  id: "color-blindness",
  name: "Color Blindness Simulator",
  category: "image",
  description:
    "Upload an image and apply color blindness simulations: deuteranopia, protanopia, tritanopia, and more.",
  icon: "👁️",
  accept: "image/*",
  maxSizeMB: 50,
  keywords: [
    "color blindness",
    "deuteranopia",
    "protanopia",
    "tritanopia",
    "simulator",
    "vision",
    "accessibility"
  ],
  steps: [
    "Upload an image",
    "Click a simulation type to preview",
    "Compare original vs simulated using the slider",
    "Download the simulated image"
  ],
  faqs: [
    {
      question: "What is color blindness simulation?",
      answer:
        "It applies mathematical color matrices to approximate how someone with color vision deficiency perceives images."
    },
    {
      question: "Are the simulations 100% accurate?",
      answer:
        "They are approximations based on standard models. Real perception varies by individual."
    },
    {
      question: "Why simulate color blindness?",
      answer:
        "Designers and developers use it to ensure their content is accessible to people with color vision deficiencies."
    }
  ]
};

export function render(container) {
  let originalImg = null;
  let currentType = "deuteranopia";

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div id="sim-content" style="display:none;">
        <div id="preview-area" style="text-align:center;margin:var(--space-4) 0;position:relative;">
          <div id="comparison-container" style="position:relative;display:inline-block;">
            <canvas id="original-canvas" style="max-width:100%;max-height:500px;border-radius:var(--radius-md);display:block;"></canvas>
            <canvas id="simulated-canvas" style="position:absolute;top:0;left:0;max-width:100%;max-height:500px;border-radius:var(--radius-md);"></canvas>
            <input type="range" id="comparison-slider" min="0" max="100" value="50" style="position:absolute;top:50%;left:0;width:100%;transform:translateY(-50%);z-index:10;cursor:ew-resize;opacity:0;height:100%;">
            <div id="slider-handle" style="position:absolute;top:0;left:50%;width:3px;height:100%;background:#fff;box-shadow:0 0 4px rgba(0,0,0,0.5);z-index:5;pointer-events:none;"></div>
          </div>
        </div>
        <div style="display:flex;gap:var(--space-3);margin-bottom:var(--space-4);">
          <button class="btn btn-primary" id="download-btn" style="flex:1;">Download Simulated</button>
          <button class="btn btn-secondary" id="reset-btn" style="flex:none;">Re-upload</button>
        </div>
        <div class="form-group">
          <label>Simulation Type</label>
        </div>
        <div id="type-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:var(--space-2);"></div>
      </div>
    </div>
  `;

  const upload = createFileUpload({
    accept: "image/*",
    multiple: false,
    maxSizeMB: 50,
    onFilesSelected: async files => {
      if (files.length === 0) return;
      originalImg = await loadImageFromFile(files[0]);
      container.querySelector("#sim-content").style.display = "block";
      renderTypeGrid();
      renderComparison();
    }
  });

  container.querySelector("#upload-area").appendChild(upload.element);
  const typeGrid = container.querySelector("#type-grid");
  const origCanvas = container.querySelector("#original-canvas");
  const simCanvas = container.querySelector("#simulated-canvas");
  const slider = container.querySelector("#comparison-slider");
  const handle = container.querySelector("#slider-handle");

  function drawToCanvas(img, canvas, matrix, severity) {
    const maxW = canvas.parentElement.clientWidth - 4;
    const scale = Math.min(maxW / img.naturalWidth, 500 / img.naturalHeight, 1);
    canvas.width = img.naturalWidth * scale;
    canvas.height = img.naturalHeight * scale;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    if (!matrix) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;

      let sr = r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2];
      let sg = r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2];
      let sb = r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2];

      if (severity < 1) {
        sr = r + (sr - r) * severity;
        sg = g + (sg - g) * severity;
        sb = b + (sb - b) * severity;
      }

      data[i] = Math.max(0, Math.min(255, Math.round(sr * 255)));
      data[i + 1] = Math.max(0, Math.min(255, Math.round(sg * 255)));
      data[i + 2] = Math.max(0, Math.min(255, Math.round(sb * 255)));
    }

    ctx.putImageData(imageData, 0, 0);
  }

  function renderComparison() {
    if (!originalImg) return;
    const type = SIMULATION_TYPES.find(t => t.id === currentType);
    const matrix = MATRICES[currentType] || null;
    drawToCanvas(originalImg, origCanvas, null, 0);
    drawToCanvas(originalImg, simCanvas, matrix, type ? type.severity : 1);
    updateSlider(parseInt(slider.value));
  }

  function updateSlider(val) {
    simCanvas.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
    handle.style.left = val + "%";
  }

  slider.addEventListener("input", () => {
    updateSlider(parseInt(slider.value));
  });

  function renderTypeGrid() {
    typeGrid.innerHTML = "";
    SIMULATION_TYPES.forEach(t => {
      const item = document.createElement("div");
      item.className = "filter-item" + (t.id === currentType ? " active" : "");
      item.dataset.type = t.id;
      item.style.cssText =
        "cursor:pointer;border-radius:var(--radius-md);padding:var(--space-3);border:2px solid transparent;transition:border-color .2s;text-align:center;background:var(--color-surface);";

      const name = document.createElement("div");
      name.textContent = t.name;
      name.style.cssText = "font-weight:600;font-size:var(--text-sm);";

      const desc = document.createElement("div");
      desc.textContent = t.desc;
      desc.style.cssText =
        "font-size:var(--text-xs);color:var(--color-text-secondary);margin-top:var(--space-1);";

      item.appendChild(name);
      item.appendChild(desc);
      item.addEventListener("click", () => {
        currentType = t.id;
        typeGrid.querySelectorAll(".filter-item").forEach(el => {
          el.classList.toggle("active", el.dataset.type === t.id);
        });
        renderComparison();
      });
      typeGrid.appendChild(item);
    });
  }

  container.querySelector("#download-btn").addEventListener("click", () => {
    if (!originalImg) return;
    const type = SIMULATION_TYPES.find(t => t.id === currentType);
    const matrix = MATRICES[currentType] || null;
    const dlCanvas = document.createElement("canvas");
    dlCanvas.width = originalImg.naturalWidth;
    dlCanvas.height = originalImg.naturalHeight;
    const dlCtx = dlCanvas.getContext("2d");
    dlCtx.drawImage(originalImg, 0, 0);

    if (matrix) {
      const imageData = dlCtx.getImageData(0, 0, dlCanvas.width, dlCanvas.height);
      const data = imageData.data;
      const severity = type ? type.severity : 1;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i] / 255;
        const g = data[i + 1] / 255;
        const b = data[i + 2] / 255;

        let sr = r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2];
        let sg = r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2];
        let sb = r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2];

        if (severity < 1) {
          sr = r + (sr - r) * severity;
          sg = g + (sg - g) * severity;
          sb = b + (sb - b) * severity;
        }

        data[i] = Math.max(0, Math.min(255, Math.round(sr * 255)));
        data[i + 1] = Math.max(0, Math.min(255, Math.round(sg * 255)));
        data[i + 2] = Math.max(0, Math.min(255, Math.round(sb * 255)));
      }

      dlCtx.putImageData(imageData, 0, 0);
    }

    downloadCanvas(dlCanvas, `color-blindness-${currentType || "original"}.png`);
    showToast({ message: "Downloaded simulated image!", type: "success" });
  });

  container.querySelector("#reset-btn").addEventListener("click", () => {
    originalImg = null;
    container.querySelector("#sim-content").style.display = "none";
  });
}

export function destroy() {}
