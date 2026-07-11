import { createImageTool } from "./image-tool-factory.js";

export const toolConfig = {
  id: "image-blur",
  name: "Image Blur",
  category: "image",
  description: "Apply Gaussian, box, or motion blur to images with adjustable radius and angle.",
  icon: "🌫️",
  accept: "image/*",
  maxSizeMB: 50,
  keywords: ["blur", "gaussian", "soften", "motion blur", "box blur", "image"],
  steps: [
    "Upload an image",
    "Choose blur type and adjust intensity",
    "Preview the result",
    "Download the blurred image"
  ],
  faqs: [
    {
      question: "What is the difference between Gaussian and box blur?",
      answer:
        "Gaussian blur produces a smooth, natural-looking blur by weighting nearby pixels more heavily. Box blur averages all pixels equally within the radius, producing a more uniform but less natural effect."
    },
    {
      question: "What is motion blur?",
      answer:
        "Motion blur simulates the effect of movement during a photo exposure. You can set the angle to control the direction of the blur streak."
    },
    {
      question: "Will this reduce image quality?",
      answer:
        "Blur inherently reduces sharpness. Higher radius values produce stronger blur. The tool preserves the original image dimensions and format."
    }
  ]
};

const BLUR_TYPES = [
  { id: "gaussian", name: "Gaussian" },
  { id: "box", name: "Box" },
  { id: "motion", name: "Motion" }
];

function applyGaussianBlur(ctx, w, h, radius) {
  ctx.filter = `blur(${radius}px)`;
  ctx.drawImage(ctx.canvas, 0, 0);
  ctx.filter = "none";
}

function applyBoxBlur(ctx, w, h, radius) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const copy = new Uint8ClampedArray(data);
  const r = Math.max(1, Math.round(radius));
  const size = (2 * r + 1) * (2 * r + 1);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let rSum = 0,
        gSum = 0,
        bSum = 0;
      for (let ky = -r; ky <= r; ky++) {
        for (let kx = -r; kx <= r; kx++) {
          const px = Math.min(w - 1, Math.max(0, x + kx));
          const py = Math.min(h - 1, Math.max(0, y + ky));
          const idx = (py * w + px) * 4;
          rSum += copy[idx];
          gSum += copy[idx + 1];
          bSum += copy[idx + 2];
        }
      }
      const idx = (y * w + x) * 4;
      data[idx] = rSum / size;
      data[idx + 1] = gSum / size;
      data[idx + 2] = bSum / size;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function applyMotionBlur(ctx, w, h, radius, angle) {
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const copy = new Uint8ClampedArray(data);
  const r = Math.max(1, Math.round(radius));

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let rSum = 0,
        gSum = 0,
        bSum = 0,
        count = 0;
      for (let k = -r; k <= r; k++) {
        const px = Math.round(x + k * cos);
        const py = Math.round(y + k * sin);
        if (px >= 0 && px < w && py >= 0 && py < h) {
          const idx = (py * w + px) * 4;
          rSum += copy[idx];
          gSum += copy[idx + 1];
          bSum += copy[idx + 2];
          count++;
        }
      }
      if (count > 0) {
        const idx = (y * w + x) * 4;
        data[idx] = rSum / count;
        data[idx + 1] = gSum / count;
        data[idx + 2] = bSum / count;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function applyBlur(ctx, w, h, type, radius, angle) {
  if (type === "gaussian") {
    applyGaussianBlur(ctx, w, h, radius);
  } else if (type === "box") {
    applyBoxBlur(ctx, w, h, radius);
  } else {
    applyMotionBlur(ctx, w, h, radius, angle);
  }
}

export function render(container) {
  let blurType = "gaussian";

  const tool = createImageTool({
    container,
    toolId: "img-blur",
    processingMessage: "Applying blur...",
    successMessage: "Blur applied!",
    getFilename: () => `blurred-${blurType}.png`,
    getFormat: () => "image/png",
    getQuality: () => 0.92,
    optionsHTML: `
      <div class="form-group">
        <label>Blur Type</label>
        <div id="type-buttons" style="display:flex;gap:6px;flex-wrap:wrap;"></div>
      </div>
      <div class="form-group">
        <label>Radius: <span id="radius-val">5</span>px</label>
        <input type="range" id="radius-range" min="1" max="30" value="5" style="width:100%;">
      </div>
      <div class="form-group" id="angle-group">
        <label>Angle: <span id="angle-val">0</span>°</label>
        <input type="range" id="angle-range" min="0" max="360" value="0" style="width:100%;">
      </div>
    `,
    renderPreview: ({ state }) => {
      if (!state.originalImage) return;
      const canvas = container.querySelector("#img-blur-preview-canvas");
      const img = state.originalImage;
      const maxW = 600;
      const scale = Math.min(maxW / img.naturalWidth, 1);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);

      const temp = document.createElement("canvas");
      temp.width = w;
      temp.height = h;
      const ctx = temp.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);

      const radius = parseInt(container.querySelector("#radius-range").value) || 5;
      const angle = parseInt(container.querySelector("#angle-range").value) || 0;
      applyBlur(ctx, w, h, blurType, radius, angle);

      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(temp, 0, 0);
    },
    processForDownload: ({ state, canvas }) => {
      if (!state.originalImage) return;
      const img = state.originalImage;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const radius = parseInt(container.querySelector("#radius-range").value) || 5;
      const angle = parseInt(container.querySelector("#angle-range").value) || 0;
      applyBlur(ctx, img.naturalWidth, img.naturalHeight, blurType, radius, angle);
    }
  });

  function renderTypeButtons() {
    const btns = container.querySelector("#type-buttons");
    btns.innerHTML = "";
    BLUR_TYPES.forEach(type => {
      const btn = document.createElement("button");
      btn.className = `btn btn-sm ${blurType === type.id ? "btn-primary" : "btn-secondary"}`;
      btn.textContent = type.name;
      btn.addEventListener("click", () => {
        blurType = type.id;
        renderTypeButtons();
        updateAngleVisibility();
        tool.renderPreview();
      });
      btns.appendChild(btn);
    });
  }

  function updateAngleVisibility() {
    const angleGroup = container.querySelector("#angle-group");
    angleGroup.style.display = blurType === "motion" ? "block" : "none";
  }

  renderTypeButtons();
  updateAngleVisibility();

  tool.bindOptionChange({ rangeId: "radius-range", valueId: "radius-val" });
  tool.bindOptionChange({ rangeId: "angle-range", valueId: "angle-val" });
}

export function destroy() {}
