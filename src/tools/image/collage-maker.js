import { createImageTool } from "./image-tool-factory.js";

export const toolConfig = {
  id: "collage-maker",
  name: "Collage Maker",
  category: "image",
  description:
    "Create beautiful photo collages with customizable layouts, spacing, borders, and backgrounds.",
  icon: "🎨",
  accept: "image/*",
  maxSizeMB: 50,
  keywords: ["collage maker", "photo collage", "image grid", "picture collage"],
  steps: [
    "Upload 2-12 photos",
    "Choose collage layout",
    "Customize spacing, border, and background",
    "Download your collage"
  ],
  faqs: [
    { question: "How many photos can I use?", answer: "Up to 12 photos in a single collage." },
    {
      question: "What formats are supported?",
      answer: "All common image formats: JPG, PNG, WebP, GIF, BMP."
    }
  ]
};

const LAYOUTS = [
  { id: "grid-2x2", name: "2×2 Grid", cols: 2, rows: 2, slots: 4 },
  { id: "grid-3x3", name: "3×3 Grid", cols: 3, rows: 3, slots: 9 },
  { id: "grid-4x3", name: "4×3 Grid", cols: 4, rows: 3, slots: 12 },
  { id: "horizontal-strip", name: "Horizontal Strip", cols: 0, rows: 1, slots: 6 },
  { id: "vertical-strip", name: "Vertical Strip", cols: 1, rows: 0, slots: 6 },
  { id: "mosaic-1", name: "Mosaic A (1 big + 3)", cols: 0, rows: 0, slots: 4, custom: "mosaic-1" },
  { id: "mosaic-2", name: "Mosaic B (2 big + 4)", cols: 0, rows: 0, slots: 6, custom: "mosaic-2" }
];

export function render(container) {
  let selectedLayout = LAYOUTS[0];

  const tool = createImageTool({
    container,
    toolId: "collage",
    multiple: true,
    maxSizeMB: 50,
    processingMessage: "Creating collage...",
    successMessage: "Collage created!",
    getFilename: () => "collage.png",
    getFormat: () => "image/png",
    getQuality: () => 0.92,
    optionsHTML: `
      <div class="form-group">
        <label>Layout</label>
        <div id="layout-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px;"></div>
      </div>
      <div class="form-group">
        <label>Spacing (px)</label>
        <input type="range" id="spacing-range" min="0" max="40" value="8" style="width:100%;">
        <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-secondary);"><span>0</span><span id="spacing-val">8</span><span>40</span></div>
      </div>
      <div class="form-group">
        <label>Border Width (px)</label>
        <input type="range" id="border-range" min="0" max="20" value="0" style="width:100%;">
        <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-secondary);"><span>0</span><span id="border-val">0</span><span>20</span></div>
      </div>
      <div class="form-group">
        <label>Border Radius (px)</label>
        <input type="range" id="radius-range" min="0" max="100" value="0" style="width:100%;">
        <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-secondary);"><span>0</span><span id="radius-val">0</span><span>100</span></div>
      </div>
      <div class="form-group">
        <label>Background Color</label>
        <div style="display:flex;gap:8px;align-items:center;">
          <input type="color" id="bg-color" value="#ffffff" style="width:60px;height:36px;border:1px solid var(--color-border);border-radius:var(--radius-md);cursor:pointer;">
          <span id="bg-color-hex" style="font-size:var(--text-sm);color:var(--color-text-secondary);">#ffffff</span>
        </div>
      </div>
      <div class="form-group">
        <label>Collage Width (px)</label>
        <input type="number" id="collage-width" class="text-input" value="1200" min="400" max="4000" step="100">
      </div>
    `,
    optionsCSS: "",
    onImageLoaded: ({ state }) => {
      updateLayoutOptions();
      if (state.images.length < 2) {
        tool.elements.previewArea.style.display = "none";
        tool.elements.optionsArea.style.display = state.images.length > 0 ? "block" : "none";
      }
    },
    renderPreview: ({ state }) => {
      if (state.images.length < 2) return;
      const canvas = container.querySelector("#collage-preview-canvas");
      drawCollage(canvas, state.images, selectedLayout, 600, container);
    },
    processForDownload: ({ state, canvas }) => {
      if (state.images.length < 2) return;
      const width = parseInt(container.querySelector("#collage-width").value) || 1200;
      drawCollage(canvas, state.images, selectedLayout, width, container);
    }
  });

  function updateLayoutOptions() {
    const layoutGrid = container.querySelector("#layout-grid");
    layoutGrid.innerHTML = "";
    const available = LAYOUTS.filter(
      l => tool.state.images.length >= 2 && tool.state.images.length <= l.slots
    );
    available.forEach(layout => {
      const btn = document.createElement("button");
      btn.className = `btn ${layout === selectedLayout ? "btn-primary" : "btn-secondary"}`;
      btn.style.fontSize = "var(--text-xs)";
      btn.style.padding = "8px";
      btn.textContent = layout.name;
      btn.addEventListener("click", () => {
        selectedLayout = layout;
        updateLayoutOptions();
        tool.renderPreview();
      });
      layoutGrid.appendChild(btn);
    });
  }

  tool.bindOptionChange({ rangeId: "spacing-range", valueId: "spacing-val" });
  tool.bindOptionChange({ rangeId: "border-range", valueId: "border-val" });
  tool.bindOptionChange({ rangeId: "radius-range", valueId: "radius-val" });

  const bgColor = container.querySelector("#bg-color");
  const bgColorHex = container.querySelector("#bg-color-hex");
  bgColor.addEventListener("input", () => {
    bgColorHex.textContent = bgColor.value;
    tool.renderPreview();
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function getLayoutPositions(layout, imgCount, cellW, cellH, spacing) {
  const positions = [];
  if (layout.custom === "mosaic-1") {
    const bigW = cellW * 2 + spacing;
    const smallW = cellW;
    const smallH = cellH;
    positions.push({ x: 0, y: 0, w: bigW, h: smallH * 2 + spacing });
    for (let i = 1; i < Math.min(imgCount, 4); i++) {
      positions.push({ x: bigW + spacing, y: (i - 1) * (smallH + spacing), w: smallW, h: smallH });
    }
  } else if (layout.custom === "mosaic-2") {
    const bigW = cellW;
    const bigH = cellH;
    const smallW = cellW;
    const smallH = cellH;
    positions.push({ x: 0, y: 0, w: bigW, h: bigH });
    positions.push({ x: bigW + spacing, y: 0, w: bigW, h: bigH });
    for (let i = 2; i < Math.min(imgCount, 6); i++) {
      const col = (i - 2) % 3;
      const row = Math.floor((i - 2) / 3);
      positions.push({
        x: col * (smallW + spacing),
        y: bigH + spacing + row * (smallH + spacing),
        w: smallW,
        h: smallH
      });
    }
  } else if (layout.rows === 1) {
    for (let i = 0; i < imgCount; i++) {
      positions.push({ x: i * (cellW + spacing), y: 0, w: cellW, h: cellH });
    }
  } else if (layout.cols === 1) {
    for (let i = 0; i < imgCount; i++) {
      positions.push({ x: 0, y: i * (cellH + spacing), w: cellW, h: cellH });
    }
  } else {
    const cols = layout.cols;
    for (let i = 0; i < imgCount; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      positions.push({
        x: col * (cellW + spacing),
        y: row * (cellH + spacing),
        w: cellW,
        h: cellH
      });
    }
  }
  return positions;
}

function drawCollage(canvas, images, selectedLayout, width, container) {
  const spacingRange = container.querySelector("#spacing-range");
  const borderRange = container.querySelector("#border-range");
  const radiusRange = container.querySelector("#radius-range");
  const bgColor = container.querySelector("#bg-color");

  const spacing = parseInt(spacingRange.value) || 0;
  const borderWidth = parseInt(borderRange.value) || 0;
  const borderRadius = parseInt(radiusRange.value) || 0;
  const bg = bgColor.value;

  let canvasW, canvasH, cellW, cellH, positions;

  if (selectedLayout.custom === "mosaic-1") {
    const cols = 3;
    cellW = (width - spacing * (cols - 1)) / cols;
    cellH = cellW;
    canvasW = width;
    canvasH = cellH * 2 + spacing;
    positions = getLayoutPositions(selectedLayout, images.length, cellW, cellH, spacing);
  } else if (selectedLayout.custom === "mosaic-2") {
    const cols = 3;
    cellW = (width - spacing * (cols - 1)) / cols;
    cellH = cellW;
    canvasW = width;
    canvasH = cellH * 3 + spacing * 2;
    positions = getLayoutPositions(selectedLayout, images.length, cellW, cellH, spacing);
  } else if (selectedLayout.rows === 1) {
    cellH = 400;
    cellW = (width - spacing * (images.length - 1)) / images.length;
    canvasW = width;
    canvasH = cellH;
    positions = getLayoutPositions(selectedLayout, images.length, cellW, cellH, spacing);
  } else if (selectedLayout.cols === 1) {
    cellW = width;
    cellH = 300;
    canvasW = width;
    canvasH = images.length * cellH + spacing * (images.length - 1);
    positions = getLayoutPositions(selectedLayout, images.length, cellW, cellH, spacing);
  } else {
    const cols = selectedLayout.cols;
    const rows = Math.ceil(images.length / cols);
    cellW = (width - spacing * (cols - 1)) / cols;
    cellH = cellW;
    canvasW = width;
    canvasH = rows * cellH + spacing * (rows - 1);
    positions = getLayoutPositions(selectedLayout, images.length, cellW, cellH, spacing);
  }

  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = bg;
  if (borderRadius > 0) {
    roundRect(ctx, 0, 0, canvasW, canvasH, borderRadius);
    ctx.fill();
  } else {
    ctx.fillRect(0, 0, canvasW, canvasH);
  }

  images.forEach((img, i) => {
    if (i >= positions.length) return;
    const pos = positions[i];

    ctx.save();
    if (borderRadius > 0) {
      roundRect(
        ctx,
        pos.x,
        pos.y,
        pos.w,
        pos.h,
        Math.min(borderRadius, Math.min(pos.w, pos.h) / 2)
      );
      ctx.clip();
    }

    const scale = Math.max(pos.w / img.naturalWidth, pos.h / img.naturalHeight);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const drawX = pos.x + (pos.w - drawW) / 2;
    const drawY = pos.y + (pos.h - drawH) / 2;
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();

    if (borderWidth > 0) {
      ctx.strokeStyle = bg;
      ctx.lineWidth = borderWidth;
      if (borderRadius > 0) {
        roundRect(
          ctx,
          pos.x,
          pos.y,
          pos.w,
          pos.h,
          Math.min(borderRadius, Math.min(pos.w, pos.h) / 2)
        );
        ctx.stroke();
      } else {
        ctx.strokeRect(pos.x, pos.y, pos.w, pos.h);
      }
    }
  });
}

export function destroy() {}
