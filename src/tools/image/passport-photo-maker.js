import { escapeHtml } from "../../utils/escape-html.js";

export const toolConfig = {
  id: "passport-photo-maker",
  name: "Passport / ID Photo Maker",
  category: "image",
  description:
    "Create professional passport photos with face guide frame, zoom controls, and background color options.",
  icon: "📸",
  keywords: ["passport", "photo", "id", "visa", "biometrics", "photo booth"],
  accept: "image/*",
  maxSizeMB: 10,
  status: "done"
};

const SIZES = [
  {
    id: "us-passport",
    name: "US Passport",
    label: "2x2 in",
    width: 600,
    height: 600,
    faceY: 0.35,
    guideW: 0.5
  },
  {
    id: "uk-passport",
    name: "UK Passport",
    label: "35x45mm",
    width: 600,
    height: 750,
    faceY: 0.38,
    guideW: 0.48
  },
  {
    id: "eu-passport",
    name: "EU Passport",
    label: "35x45mm",
    width: 590,
    height: 709,
    faceY: 0.38,
    guideW: 0.48
  },
  {
    id: "schengen",
    name: "Schengen Visa",
    label: "35x45mm",
    width: 590,
    height: 709,
    faceY: 0.38,
    guideW: 0.48
  },
  {
    id: "canada-passport",
    name: "Canada Passport",
    label: "50x70mm",
    width: 600,
    height: 720,
    faceY: 0.38,
    guideW: 0.5
  },
  {
    id: "aus-passport",
    name: "Australia Passport",
    label: "45x45mm",
    width: 600,
    height: 600,
    faceY: 0.35,
    guideW: 0.5
  },
  {
    id: "generic-id",
    name: "Generic ID",
    label: "2x2 in",
    width: 400,
    height: 500,
    faceY: 0.35,
    guideW: 0.55
  }
];

const BG_COLORS = [
  { id: "white", color: "#ffffff", name: "White" },
  { id: "light-blue", color: "#e6f0ff", name: "Light Blue" },
  { id: "light-gray", color: "#f0f0f0", name: "Light Gray" },
  { id: "transparent", color: "transparent", name: "Transparent" }
];

export function render(container) {
  container.innerHTML = `
    <div class="ppm-container">
      <div class="ppm-workspace">
        <div class="ppm-preview-area" id="ppm-preview-area">
          <canvas id="ppm-canvas"></canvas>
          <div class="ppm-guide-overlay" id="ppm-guide"></div>
        </div>
        <div class="ppm-controls">
          <div class="ppm-zoom">
            <button id="ppm-zoom-out" class="ppm-zoom-btn">−</button>
            <span id="ppm-zoom-level">100%</span>
            <button id="ppm-zoom-in" class="ppm-zoom-btn">+</button>
          </div>
          <div class="ppm-drag-hint">Drag to position face in the guide</div>
        </div>
      </div>
      <div class="ppm-sidebar">
        <div class="ppm-upload">
          <input type="file" id="ppm-input" accept="image/*" />
          <label for="ppm-input" class="ppm-upload-btn">📸 Upload Photo</label>
        </div>
        <div class="ppm-option">
          <label>Photo Size</label>
          <select id="ppm-size"></select>
        </div>
        <div class="ppm-option">
          <label>Background</label>
          <div class="ppm-bgs">
            ${BG_COLORS.map(b => `<button class="ppm-bg ${b.id === "white" ? "active" : ""}" data-bg="${b.id}" style="background:${b.color}" title="${b.name}"></button>`).join("")}
          </div>
        </div>
        <div class="ppm-info">
          <span class="ppm-info-icon">ℹ️</span>
          <span>Position your face within the oval guide. Adjust zoom to fit.</span>
        </div>
        <button id="ppm-process" class="ppm-btn ppm-btn-primary">Create Passport Photo</button>
        <div id="ppm-result"></div>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .ppm-container { display: flex; gap: var(--space-4); max-width: 900px; margin: 0 auto; flex-wrap: wrap; }
    .ppm-workspace { flex: 1; min-width: 300px; }
    .ppm-preview-area { position: relative; background: #ccc; border-radius: var(--radius-lg); overflow: hidden; aspect-ratio: 3/4; display: flex; align-items: center; justify-content: center; }
    .ppm-preview-area canvas { max-width: 100%; max-height: 100%; object-fit: contain; }
    .ppm-guide-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; margin: auto; width: 60%; height: 80%; border: 2px dashed rgba(255,255,255,0.8); border-radius: 35% 35% 35% 35% / 50% 50% 50% 50%; box-shadow: 0 0 0 9999px rgba(0,0,0,0.5); pointer-events: none; }
    .ppm-guide-overlay::before { content: ''; position: absolute; top: -25%; left: 50%; transform: translateX(-50%); width: 2px; height: 20%; background: rgba(255,255,255,0.4); }
    .ppm-guide-overlay::after { content: ''; position: absolute; bottom: -10%; left: 50%; transform: translateX(-50%); width: 2px; height: 10%; background: rgba(255,255,255,0.4); }
    .ppm-controls { display: flex; justify-content: center; gap: var(--space-3); margin-top: var(--space-2); }
    .ppm-zoom { display: flex; align-items: center; gap: var(--space-2); background: var(--color-surface); padding: var(--space-2) var(--space-3); border-radius: var(--radius-lg); }
    .ppm-zoom-btn { width: 32px; height: 32px; border: none; border-radius: var(--radius-md); background: var(--color-border); cursor: pointer; font-size: var(--text-lg); font-weight: bold; }
    .ppm-zoom-btn:hover { background: var(--color-primary); color: white; }
    .ppm-zoom-level { min-width: 50px; text-align: center; font-weight: 600; }
    .ppm-drag-hint { font-size: var(--text-xs); color: var(--color-text-muted); align-self: center; }
    .ppm-sidebar { width: 250px; display: flex; flex-direction: column; gap: var(--space-3); }
    .ppm-upload-btn { display: block; padding: var(--space-4); background: var(--color-primary); color: white; text-align: center; border-radius: var(--radius-lg); cursor: pointer; font-weight: 600; }
    .ppm-upload-btn:hover { filter: brightness(0.9); }
    .ppm-upload input { display: none; }
    .ppm-option label { display: block; font-weight: 600; margin-bottom: var(--space-1); font-size: var(--text-sm); }
    .ppm-option select { width: 100%; padding: var(--space-2); border: 2px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-surface); }
    .ppm-bgs { display: flex; gap: var(--space-2); }
    .ppm-bg { width: 36px; height: 36px; border: 2px solid var(--color-border); border-radius: 50%; cursor: pointer; }
    .ppm-bg.active { border-color: var(--color-primary); transform: scale(1.1); box-shadow: 0 0 0 2px var(--color-primary-bg); }
    .ppm-info { display: flex; gap: var(--space-2); font-size: var(--text-xs); color: var(--color-text-muted); align-items: flex-start; }
    .ppm-info-icon { flex-shrink: 0; }
    .ppm-btn { width: 100%; padding: var(--space-3); border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; background: var(--color-primary); color: white; }
    .ppm-btn:hover { filter: brightness(0.9); }
    .ppm-result { margin-top: var(--space-3); text-align: center; }
    .ppm-result img { max-width: 100%; border-radius: var(--radius-lg); border: 2px solid var(--color-border); }
    .ppm-download { display: inline-block; margin-top: var(--space-2); padding: var(--space-2) var(--space-3); background: var(--color-primary); color: white; border-radius: var(--radius-lg); text-decoration: none; font-weight: 600; }
  `;
  container.appendChild(style);

  const canvas = document.getElementById("ppm-canvas");
  const ctx = canvas.getContext("2d");
  const guide = document.getElementById("ppm-guide");
  const sizeSelect = document.getElementById("ppm-size");
  const zoomIn = document.getElementById("ppm-zoom-in");
  const zoomOut = document.getElementById("ppm-zoom-out");
  const zoomLevel = document.getElementById("ppm-zoom-level");
  const processBtn = document.getElementById("ppm-process");
  const result = document.getElementById("ppm-result");
  const bgBtns = container.querySelectorAll(".ppm-bg");

  SIZES.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.name + " (" + s.label + ")";
    sizeSelect.appendChild(opt);
  });

  let currentSize = SIZES[0];
  let currentBg = "white";
  let sourceImage = null;
  let zoom = 1;
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };

  canvas.width = 400;
  canvas.height = 400;
  ctx.fillStyle = "#ccc";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "20px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("No image", 200, 200);

  function updateCanvas() {
    if (!sourceImage) return;
    const w = canvas.width;
    const h = canvas.height;
    const bg = BG_COLORS.find(b => b.id === currentBg);

    if (bg.id === "transparent") {
      ctx.clearRect(0, 0, w, h);
    } else {
      ctx.fillStyle = bg.color;
      ctx.fillRect(0, 0, w, h);
    }

    const scale = zoom * Math.min(w / sourceImage.width, h / sourceImage.height);
    const dw = sourceImage.width * scale;
    const dh = sourceImage.height * scale;
    const dx = (w - dw) / 2 + offsetX;
    const dy = (h - dh) / 2 + offsetY;

    ctx.drawImage(sourceImage, dx, dy, dw, dh);
    zoomLevel.textContent = Math.round(zoom * 100) + "%";
  }

  function updateGuide() {
    const s = SIZES.find(s => s.id === sizeSelect.value) || SIZES[0];
    guide.style.borderRadius = "50%";
    guide.style.top = s.faceY * 100 - s.guideW * 50 + "%";
    guide.style.height = s.guideW * 100 + "%";
    currentSize = s;
    updateCanvas();
  }

  sizeSelect.addEventListener("change", updateGuide);

  zoomIn.addEventListener("click", () => {
    zoom = Math.min(zoom + 0.1, 3);
    updateCanvas();
  });

  zoomOut.addEventListener("click", () => {
    zoom = Math.max(zoom - 0.1, 0.3);
    updateCanvas();
  });

  bgBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      bgBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentBg = btn.dataset.bg;
      updateCanvas();
    });
  });

  const previewArea = document.getElementById("ppm-preview-area");
  previewArea.addEventListener("mousedown", e => {
    isDragging = true;
    dragStart = { x: e.clientX - offsetX, y: e.clientY - offsetY };
  });
  previewArea.addEventListener("mousemove", e => {
    if (isDragging) {
      offsetX = e.clientX - dragStart.x;
      offsetY = e.clientY - dragStart.y;
      updateCanvas();
    }
  });
  previewArea.addEventListener("mouseup", () => (isDragging = false));
  previewArea.addEventListener("mouseleave", () => (isDragging = false));

  document.getElementById("ppm-input").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      sourceImage = img;
      zoom = 1;
      offsetX = 0;
      offsetY = 0;
      updateCanvas();
    };
    img.src = url;
  });

  processBtn.addEventListener("click", () => {
    if (!sourceImage) {
      result.innerHTML = '<p style="color:red">Please upload a photo first</p>';
      return;
    }

    const s = currentSize;
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = s.width;
    outputCanvas.height = s.height;
    const octx = outputCanvas.getContext("2d");

    const bg = BG_COLORS.find(b => b.id === currentBg);
    if (bg.id === "transparent") {
      octx.clearRect(0, 0, s.width, s.height);
    } else {
      octx.fillStyle = bg.color;
      octx.fillRect(0, 0, s.width, s.height);
    }

    const previewW = canvas.width;
    const previewH = canvas.height;
    const previewScale =
      zoom * Math.min(previewW / sourceImage.width, previewH / sourceImage.height);
    const scale = zoom * Math.min(s.width / sourceImage.width, s.height / sourceImage.height);
    const scaleRatio = scale / previewScale;
    const dw = sourceImage.width * scale;
    const dh = sourceImage.height * scale;
    const dx = (s.width - dw) / 2 + offsetX * scaleRatio;
    const dy = (s.height - dh) / 2 + offsetY * scaleRatio;

    octx.drawImage(sourceImage, dx, dy, dw, dh);

    result.innerHTML = `
      <img src="${outputCanvas.toDataURL("image/jpeg", 0.92)}" alt="Passport photo" />
      <a class="ppm-download" href="${outputCanvas.toDataURL("image/jpeg", 0.92)}" download="passport-photo.jpg">Download Photo</a>
    `;
  });

  updateGuide();
}
