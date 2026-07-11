import { createImageTool } from "./image-tool-factory.js";

export const toolConfig = {
  id: "blur-background",
  name: "Blur Background",
  category: "image",
  description:
    "Blur images with Gaussian, Box, or Pixelate effects. Apply to full image, radial, linear, or custom region.",
  icon: "🌫️",
  accept: "image/*",
  maxSizeMB: 50,
  keywords: [
    "blur background",
    "blur image",
    "depth of field",
    "tilt shift",
    "bokeh",
    "pixelate",
    "region blur"
  ],
  steps: [
    "Upload an image",
    "Choose blur mode and type",
    "Adjust intensity and focus area",
    "Download the result"
  ],
  faqs: [
    {
      question: "What blur types are available?",
      answer:
        "Gaussian (smooth, natural blur), Box (uniform averaging), and Pixelate (mosaic block effect)."
    },
    {
      question: "What area modes are available?",
      answer:
        "Full (entire image), Radial (center sharp, edges blurred), Linear (tilt-shift), and Region (draw a rectangle to blur)."
    },
    {
      question: "How do I use Region mode?",
      answer:
        "Select Region mode, then click and drag on the preview to draw a rectangle. Only that area will be blurred."
    }
  ]
};

const AREA_MODES = [
  { id: "full", name: "🌫️ Full" },
  { id: "radial", name: "🔘 Radial" },
  { id: "linear-h", name: "↔️ Horizontal" },
  { id: "linear-v", name: "↕️ Vertical" },
  { id: "region", name: "◻️ Region" }
];

const BLUR_TYPES = [
  { id: "gaussian", name: "Gaussian" },
  { id: "box", name: "Box" },
  { id: "pixelate", name: "Pixelate" }
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

function applyPixelate(ctx, w, h, blockSize) {
  const bs = Math.max(2, Math.round(blockSize));
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  for (let y = 0; y < h; y += bs) {
    for (let x = 0; x < w; x += bs) {
      let rSum = 0,
        gSum = 0,
        bSum = 0,
        count = 0;
      for (let py = y; py < Math.min(y + bs, h); py++) {
        for (let px = x; px < Math.min(x + bs, w); px++) {
          const idx = (py * w + px) * 4;
          rSum += data[idx];
          gSum += data[idx + 1];
          bSum += data[idx + 2];
          count++;
        }
      }
      const r = (rSum / count) | 0;
      const g = (gSum / count) | 0;
      const b = (bSum / count) | 0;
      for (let py = y; py < Math.min(y + bs, h); py++) {
        for (let px = x; px < Math.min(x + bs, w); px++) {
          const idx = (py * w + px) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function applyBlurToCanvas(ctx, w, h, blurType, amount) {
  if (blurType === "gaussian") {
    applyGaussianBlur(ctx, w, h, amount);
  } else if (blurType === "box") {
    applyBoxBlur(ctx, w, h, amount);
  } else {
    applyPixelate(ctx, w, h, amount);
  }
}

function createBlurredCanvas(srcCanvas, w, h, blurType, blurAmount) {
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const ctx = out.getContext("2d");
  ctx.drawImage(srcCanvas, 0, 0, w, h);
  applyBlurToCanvas(ctx, w, h, blurType, blurAmount);
  return out;
}

function applyRegionBlur(srcCanvas, w, h, blurType, blurAmount, region) {
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const ctx = out.getContext("2d");
  ctx.drawImage(srcCanvas, 0, 0, w, h);

  const blurred = createBlurredCanvas(srcCanvas, w, h, blurType, blurAmount);
  ctx.drawImage(
    blurred,
    region.x,
    region.y,
    region.w,
    region.h,
    region.x,
    region.y,
    region.w,
    region.h
  );

  return out;
}

function applyRadialBlur(srcCanvas, w, h, blurType, blurAmount, focusPercent) {
  const blurred = createBlurredCanvas(srcCanvas, w, h, blurType, blurAmount);
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const ctx = out.getContext("2d");

  ctx.drawImage(blurred, 0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const focusRadius = (Math.min(w, h) * (focusPercent / 100)) / 2;
  const maxRadius = Math.sqrt(cx * cx + cy * cy);
  const gradient = ctx.createRadialGradient(cx, cy, focusRadius, cx, cy, maxRadius);
  gradient.addColorStop(0, "rgba(0,0,0,1)");
  gradient.addColorStop(0.5, "rgba(0,0,0,0.5)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "destination-over";
  ctx.drawImage(srcCanvas, 0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";

  return out;
}

function applyLinearBlur(
  srcCanvas,
  w,
  h,
  blurType,
  blurAmount,
  focusPercent,
  positionPercent,
  direction
) {
  const blurred = createBlurredCanvas(srcCanvas, w, h, blurType, blurAmount);
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const ctx = out.getContext("2d");

  ctx.drawImage(blurred, 0, 0, w, h);

  const totalSize = direction === "h" ? h : w;
  const focusSize = totalSize * (focusPercent / 100);
  const pos = totalSize * (positionPercent / 100);
  const halfFocus = focusSize / 2;

  let gradient;
  if (direction === "h") {
    const top = pos - halfFocus;
    const bottom = pos + halfFocus;
    gradient = ctx.createLinearGradient(0, 0, 0, totalSize);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(Math.max(0, (top - 30) / totalSize), "rgba(0,0,0,0)");
    gradient.addColorStop(Math.max(0, top / totalSize), "rgba(0,0,0,1)");
    gradient.addColorStop(Math.min(1, bottom / totalSize), "rgba(0,0,0,1)");
    gradient.addColorStop(Math.min(1, (bottom + 30) / totalSize), "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
  } else {
    const left = pos - halfFocus;
    const right = pos + halfFocus;
    gradient = ctx.createLinearGradient(0, 0, totalSize, 0);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(Math.max(0, (left - 30) / totalSize), "rgba(0,0,0,0)");
    gradient.addColorStop(Math.max(0, left / totalSize), "rgba(0,0,0,1)");
    gradient.addColorStop(Math.min(1, right / totalSize), "rgba(0,0,0,1)");
    gradient.addColorStop(Math.min(1, (right + 30) / totalSize), "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
  }

  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "destination-over";
  ctx.drawImage(srcCanvas, 0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";

  return out;
}

export function render(container) {
  let areaMode = "radial";
  let blurType = "gaussian";
  let region = null;
  let dragging = false;
  let dragStart = null;

  const tool = createImageTool({
    container,
    toolId: "blur-bg",
    processingMessage: "Applying blur...",
    successMessage: "Blur applied!",
    getFilename: () =>
      `blurred-${areaMode}-${blurType}.${getFormat() === "image/png" ? "png" : "jpg"}`,
    getFormat: () => {
      const q = parseFloat(container.querySelector("#quality-select").value);
      return q >= 0.9 ? "image/png" : "image/jpeg";
    },
    getQuality: () => parseFloat(container.querySelector("#quality-select").value),
    optionsHTML: `
      <div class="form-group">
        <label>Area Mode</label>
        <div id="area-buttons" style="display:flex;gap:6px;flex-wrap:wrap;"></div>
      </div>
      <div class="form-group">
        <label>Blur Type</label>
        <div id="type-buttons" style="display:flex;gap:6px;flex-wrap:wrap;"></div>
      </div>
      <div class="form-group">
        <label>Blur Intensity: <span id="blur-val">15</span></label>
        <input type="range" id="blur-range" min="1" max="50" value="15" style="width:100%;">
      </div>
      <div class="form-group" id="focus-group">
        <label>Focus Area (%): <span id="focus-val">40</span></label>
        <input type="range" id="focus-range" min="10" max="80" value="40" style="width:100%;">
      </div>
      <div class="form-group" id="position-group">
        <label>Focus Position: <span id="position-val">Center</span></label>
        <input type="range" id="position-range" min="0" max="100" value="50" style="width:100%;">
      </div>
      <div class="form-group" id="region-info" style="display:none;">
        <p style="font-size:var(--text-sm);color:var(--color-text-secondary);margin:0;">Click and drag on the preview to select a region.</p>
        <button id="clear-region" class="btn btn-sm btn-secondary" style="margin-top:var(--space-2);">Clear Region</button>
      </div>
      <div class="form-group">
        <label>Output Quality</label>
        <select id="quality-select" class="select-input">
          <option value="0.92">High (PNG)</option>
          <option value="0.85" selected>Medium (JPEG 85%)</option>
          <option value="0.7">Low (JPEG 70%)</option>
        </select>
      </div>
    `,
    renderPreview: ({ state }) => {
      if (!state.originalImage) return;
      const canvas = container.querySelector("#blur-bg-preview-canvas");
      const result = processImage(
        state.originalImage,
        600,
        Math.round((600 * state.originalImage.naturalHeight) / state.originalImage.naturalWidth)
      );
      canvas.width = result.width;
      canvas.height = result.height;
      canvas.getContext("2d").drawImage(result, 0, 0);
      if (areaMode === "region" && region) {
        drawRegionOverlay(canvas);
      }
    },
    processForDownload: ({ state, canvas }) => {
      if (!state.originalImage) return;
      const result = processImage(
        state.originalImage,
        state.originalImage.naturalWidth,
        state.originalImage.naturalHeight
      );
      canvas.width = result.width;
      canvas.height = result.height;
      canvas.getContext("2d").drawImage(result, 0, 0);
    }
  });

  function renderAreaButtons() {
    const btns = container.querySelector("#area-buttons");
    btns.innerHTML = "";
    AREA_MODES.forEach(mode => {
      const btn = document.createElement("button");
      btn.className = `btn btn-sm ${areaMode === mode.id ? "btn-primary" : "btn-secondary"}`;
      btn.textContent = mode.name;
      btn.addEventListener("click", () => {
        areaMode = mode.id;
        region = null;
        renderAreaButtons();
        updateVisibility();
        tool.renderPreview();
      });
      btns.appendChild(btn);
    });
  }

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
        tool.renderPreview();
      });
      btns.appendChild(btn);
    });
  }

  function updateVisibility() {
    const focusGroup = container.querySelector("#focus-group");
    const positionGroup = container.querySelector("#position-group");
    const regionInfo = container.querySelector("#region-info");
    focusGroup.style.display = areaMode === "full" || areaMode === "region" ? "none" : "block";
    positionGroup.style.display =
      areaMode === "linear-h" || areaMode === "linear-v" ? "block" : "none";
    regionInfo.style.display = areaMode === "region" ? "block" : "none";
  }

  function drawRegionOverlay(canvas) {
    if (!region) return;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(region.x, region.y, region.w, region.h);
    ctx.setLineDash([]);
  }

  function getCanvasCoords(e) {
    const canvas = container.querySelector("#blur-bg-preview-canvas");
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function setupRegionDrag() {
    const canvas = container.querySelector("#blur-bg-preview-canvas");

    canvas.addEventListener("mousedown", e => {
      if (areaMode !== "region") return;
      dragging = true;
      dragStart = getCanvasCoords(e);
      region = null;
    });

    canvas.addEventListener("mousemove", e => {
      if (!dragging || areaMode !== "region") return;
      const cur = getCanvasCoords(e);
      region = {
        x: Math.min(dragStart.x, cur.x),
        y: Math.min(dragStart.y, cur.y),
        w: Math.abs(cur.x - dragStart.x),
        h: Math.abs(cur.y - dragStart.y)
      };
      tool.renderPreview();
    });

    canvas.addEventListener("mouseup", () => {
      dragging = false;
      if (region && region.w < 5 && region.h < 5) region = null;
    });

    canvas.addEventListener("mouseleave", () => {
      dragging = false;
    });
  }

  function processImage(originalImage, width, height) {
    const blurRange = container.querySelector("#blur-range");
    const focusRange = container.querySelector("#focus-range");
    const positionRange = container.querySelector("#position-range");

    const blurAmount = parseInt(blurRange.value) || 15;
    const focusPercent = parseInt(focusRange.value) || 40;
    const positionPercent = parseInt(positionRange.value) || 50;

    const temp = document.createElement("canvas");
    temp.width = width;
    temp.height = height;
    const tempCtx = temp.getContext("2d");
    tempCtx.drawImage(originalImage, 0, 0, width, height);

    if (areaMode === "full") {
      applyBlurToCanvas(tempCtx, width, height, blurType, blurAmount);
      return temp;
    } else if (areaMode === "radial") {
      return applyRadialBlur(temp, width, height, blurType, blurAmount, focusPercent);
    } else if (areaMode === "linear-h") {
      return applyLinearBlur(
        temp,
        width,
        height,
        blurType,
        blurAmount,
        focusPercent,
        positionPercent,
        "h"
      );
    } else if (areaMode === "linear-v") {
      return applyLinearBlur(
        temp,
        width,
        height,
        blurType,
        blurAmount,
        focusPercent,
        positionPercent,
        "v"
      );
    } else if (areaMode === "region" && region) {
      const scaleX = width / temp.width;
      const scaleY = height / temp.height;
      const scaledRegion = {
        x: region.x * scaleX,
        y: region.y * scaleY,
        w: region.w * scaleX,
        h: region.h * scaleY
      };
      return applyRegionBlur(temp, width, height, blurType, blurAmount, scaledRegion);
    }
    return temp;
  }

  renderAreaButtons();
  renderTypeButtons();
  updateVisibility();
  setupRegionDrag();

  container.querySelector("#clear-region").addEventListener("click", () => {
    region = null;
    tool.renderPreview();
  });

  tool.bindOptionChange({ rangeId: "blur-range", valueId: "blur-val" });
  tool.bindOptionChange({ rangeId: "focus-range", valueId: "focus-val" });
  tool.bindOptionChange({
    rangeId: "position-range",
    valueId: "position-val",
    formatValue: v => {
      const n = parseInt(v);
      return n < 35 ? "Top/Left" : n > 65 ? "Bottom/Right" : "Center";
    }
  });
}

export function destroy() {}
