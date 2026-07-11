export const toolConfig = {
  id: "screen-ruler",
  name: "Screen Ruler & Color Picker",
  category: "dev",
  description:
    "Measure pixel distances and pick colors anywhere on screen with an interactive overlay ruler.",
  icon: "📏",
  keywords: ["ruler", "measure", "pixel", "color", "picker", "screen", "overlay"],
  accept: "",
  maxSizeMB: 0,
  status: "done"
};

const UNIT_LABELS = { px: "px", cm: "cm", in: "in", mm: "mm" };
const TICK_COLORS = {
  major: "rgba(255,255,255,0.9)",
  minor: "rgba(255,255,255,0.4)",
  text: "#fff"
};

export function pxToUnit(px, unit, dpr) {
  if (unit === "px") return px;
  const ppi = 96 * dpr;
  if (unit === "in") return px / ppi;
  if (unit === "cm") return px / (ppi / 2.54);
  if (unit === "mm") return px / (ppi / 25.4);
  return px;
}

export function formatMeasurement(px, unit, dpr) {
  const val = pxToUnit(px, unit, dpr);
  return unit === "px" ? `${Math.round(val)}` : val.toFixed(2);
}

export function hexFromRgb(r, g, b) {
  return "#" + [r, g, b].map(c => c.toString(16).padStart(2, "0")).join("");
}

function drawHorizontalRuler(ctx, width, height, scrollX, unit, dpr) {
  const rulerH = 28;
  ctx.fillStyle = "rgba(30,30,30,0.92)";
  ctx.fillRect(0, 0, width, rulerH);

  const step = unit === "px" ? 100 : unit === "mm" ? 10 * ((96 * dpr) / 25.4) : 50;
  const startOffset = scrollX % step;

  for (let x = -startOffset; x < width; x += step) {
    const realX = x + scrollX;
    const isMajor = Math.round(realX) % (step * 5) === 0 || Math.round(realX) % 100 === 0;

    ctx.strokeStyle = isMajor ? TICK_COLORS.major : TICK_COLORS.minor;
    ctx.lineWidth = isMajor ? 1.5 : 0.5;
    ctx.beginPath();
    ctx.moveTo(x, rulerH);
    ctx.lineTo(x, isMajor ? rulerH - 14 : rulerH - 7);
    ctx.stroke();

    if (isMajor || step > 30) {
      ctx.fillStyle = TICK_COLORS.text;
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(formatMeasurement(realX, unit, dpr), x, rulerH - 16);
    }
  }
}

function drawVerticalRuler(ctx, width, height, scrollY, unit, dpr) {
  const rulerW = 28;
  ctx.fillStyle = "rgba(30,30,30,0.92)";
  ctx.fillRect(0, 0, rulerW, height);

  const step = unit === "px" ? 100 : unit === "mm" ? 10 * ((96 * dpr) / 25.4) : 50;
  const startOffset = scrollY % step;

  for (let y = -startOffset; y < height; y += step) {
    const realY = y + scrollY;
    const isMajor = Math.round(realY) % (step * 5) === 0 || Math.round(realY) % 100 === 0;

    ctx.strokeStyle = isMajor ? TICK_COLORS.major : TICK_COLORS.minor;
    ctx.lineWidth = isMajor ? 1.5 : 0.5;
    ctx.beginPath();
    ctx.moveTo(rulerW, y);
    ctx.lineTo(isMajor ? rulerW - 14 : rulerW - 7, y);
    ctx.stroke();

    if (isMajor || step > 30) {
      ctx.save();
      ctx.fillStyle = TICK_COLORS.text;
      ctx.font = "10px monospace";
      ctx.translate(12, y);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = "center";
      ctx.fillText(formatMeasurement(realY, unit, dpr), 0, 0);
      ctx.restore();
    }
  }
}

function drawCrosshair(ctx, x, y, width, height) {
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = "rgba(0,200,255,0.7)";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(x, 28);
  ctx.lineTo(x, height);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(28, y);
  ctx.lineTo(width, y);
  ctx.stroke();

  ctx.setLineDash([]);
}

function drawMeasurementLine(ctx, x1, y1, x2, y2, unit, dpr) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);

  ctx.setLineDash([]);
  ctx.strokeStyle = "#ff4081";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  [
    { cx: x1, cy: y1 },
    { cx: x2, cy: y2 }
  ].forEach(({ cx, cy }) => {
    ctx.fillStyle = "#ff4081";
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  const label = `${formatMeasurement(Math.abs(dx), unit, dpr)} × ${formatMeasurement(Math.abs(dy), unit, dpr)} (${formatMeasurement(dist, unit, dpr)})`;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  ctx.font = "bold 12px monospace";
  const textW = ctx.measureText(label).width;
  ctx.fillStyle = "rgba(255,64,129,0.9)";
  ctx.fillRect(midX - textW / 2 - 6, midY - 20, textW + 12, 22);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, midX, midY - 9);
}

function drawTooltip(ctx, x, y, colorHex, unit, dpr) {
  const text = `(${x}, ${y}) ${colorHex}`;
  ctx.font = "11px monospace";
  const textW = ctx.measureText(text).width;
  const tipW = textW + 16;
  const tipH = 24;
  let tipX = x + 16;
  let tipY = y - 30;
  if (tipX + tipW > ctx.canvas.width) tipX = x - tipW - 8;
  if (tipY < 0) tipY = y + 16;

  ctx.fillStyle = "rgba(0,0,0,0.85)";
  ctx.beginPath();
  ctx.roundRect(tipX, tipY, tipW, tipH, 4);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, tipX + 8, tipY + tipH / 2);
}

function getPixelColor(canvas, x, y) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const pixel = ctx.getImageData(x, y, 1, 1).data;
  return { r: pixel[0], g: pixel[1], b: pixel[2] };
}

async function pickColorFromScreen() {
  if (typeof EyeDropper !== "undefined") {
    try {
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      return result.sRGBHex;
    } catch {
      return null;
    }
  }
  return null;
}

function renderToolbar(container) {
  const toolbar = document.createElement("div");
  toolbar.className = "sr-toolbar";
  toolbar.innerHTML = `
    <button id="sr-toggle" class="sr-btn sr-btn-primary">Activate Ruler</button>
    <div id="sr-controls" class="sr-controls" style="display:none">
      <label class="sr-label">Unit:</label>
      <select id="sr-unit" class="sr-select">
        <option value="px" selected>px</option>
        <option value="cm">cm</option>
        <option value="in">in</option>
        <option value="mm">mm</option>
      </select>
      <button id="sr-activate-eyedropper" class="sr-btn" title="Pick color from screen">🎨 Eyedropper</button>
      <span id="sr-color-display" class="sr-color-display" style="display:none">
        <span id="sr-color-swatch" class="sr-color-swatch"></span>
        <span id="sr-color-hex"></span>
      </span>
      <button id="sr-clear" class="sr-btn">Clear</button>
      <button id="sr-deactivate" class="sr-btn sr-btn-danger">Deactivate</button>
    </div>
    <div id="sr-info" class="sr-info">
      <span id="sr-pos">Move mouse to measure</span>
      <span id="sr-distance"></span>
    </div>
  `;
  container.appendChild(toolbar);
}

function renderOverlay(container) {
  const overlay = document.createElement("div");
  overlay.id = "sr-overlay";
  overlay.className = "sr-overlay";
  overlay.style.display = "none";

  const hRuler = document.createElement("canvas");
  hRuler.id = "sr-h-ruler";
  hRuler.className = "sr-h-ruler";

  const vRuler = document.createElement("canvas");
  vRuler.id = "sr-v-ruler";
  vRuler.className = "sr-v-ruler";

  const crosshairCanvas = document.createElement("canvas");
  crosshairCanvas.id = "sr-crosshair";
  crosshairCanvas.className = "sr-crosshair";

  overlay.appendChild(hRuler);
  overlay.appendChild(vRuler);
  overlay.appendChild(crosshairCanvas);
  container.appendChild(overlay);

  return { overlay, hRuler, vRuler, crosshairCanvas };
}

function renderStyles() {
  return `
    .sr-container { max-width: 800px; margin: 0 auto; }
    .sr-toolbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 12px 16px; background: var(--bg-secondary, #f8f9fa); border-radius: 8px; margin-bottom: 16px; }
    .sr-controls { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .sr-label { font-size: 13px; font-weight: 600; color: var(--text-muted, #888); }
    .sr-select { padding: 4px 8px; border: 1px solid var(--border, #ccc); border-radius: 6px; font-size: 13px; background: var(--bg, #fff); color: var(--text); }
    .sr-btn { padding: 6px 14px; border: 1px solid var(--border, #ccc); border-radius: 6px; font-size: 13px; cursor: pointer; background: var(--bg, #fff); color: var(--text); transition: all 0.15s; }
    .sr-btn:hover { background: var(--bg-secondary, #f0f0f0); }
    .sr-btn-primary { background: var(--primary, #4285f4); color: #fff; border-color: var(--primary, #4285f4); }
    .sr-btn-primary:hover { filter: brightness(0.9); }
    .sr-btn-danger { background: #dc2626; color: #fff; border-color: #dc2626; }
    .sr-btn-danger:hover { filter: brightness(0.9); }
    .sr-color-display { display: flex; align-items: center; gap: 6px; font-size: 13px; font-family: monospace; }
    .sr-color-swatch { width: 16px; height: 16px; border-radius: 3px; border: 1px solid var(--border, #ccc); }
    .sr-info { display: flex; gap: 16px; font-size: 13px; color: var(--text-muted, #888); margin-top: 8px; }
    .sr-overlay { position: fixed; top: 0; left: 0; z-index: 99999; pointer-events: none; }
    .sr-h-ruler { position: fixed; top: 0; left: 0; width: 100vw; height: 28px; z-index: 99999; }
    .sr-v-ruler { position: fixed; top: 0; left: 0; width: 28px; height: 100vh; z-index: 99999; }
    .sr-crosshair { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 99998; }
  `;
}

export function drawRulerTicks(ctx, length, thickness, scrollPos, unit, dpr, isHorizontal) {
  const step = unit === "px" ? 100 : unit === "mm" ? 10 * ((96 * dpr) / 25.4) : 50;
  const startOffset = scrollPos % step;

  for (let i = -startOffset; i < length; i += step) {
    const realPos = i + scrollPos;
    const isMajor = Math.round(realPos) % (step * 5) === 0 || Math.round(realPos) % 100 === 0;

    ctx.strokeStyle = isMajor ? TICK_COLORS.major : TICK_COLORS.minor;
    ctx.lineWidth = isMajor ? 1.5 : 0.5;
    ctx.beginPath();
    if (isHorizontal) {
      ctx.moveTo(i, thickness);
      ctx.lineTo(i, isMajor ? thickness - 14 : thickness - 7);
    } else {
      ctx.moveTo(thickness, i);
      ctx.lineTo(isMajor ? thickness - 14 : thickness - 7, i);
    }
    ctx.stroke();

    if (isMajor || step > 30) {
      ctx.fillStyle = TICK_COLORS.text;
      ctx.font = "10px monospace";
      if (isHorizontal) {
        ctx.textAlign = "center";
        ctx.fillText(formatMeasurement(realPos, unit, dpr), i, thickness - 16);
      } else {
        ctx.save();
        ctx.translate(12, i);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = "center";
        ctx.fillText(formatMeasurement(realPos, unit, dpr), 0, 0);
        ctx.restore();
      }
    }
  }
}

export function render(container) {
  container.innerHTML = `<style>${renderStyles()}</style><div class="sr-container" id="sr-root"></div>`;
  const root = container.querySelector("#sr-root");

  renderToolbar(root);
  const { overlay, hRuler, vRuler, crosshairCanvas } = renderOverlay(root);

  const toggleBtn = root.querySelector("#sr-toggle");
  const controls = root.querySelector("#sr-controls");
  const unitSelect = root.querySelector("#sr-unit");
  const posDisplay = root.querySelector("#sr-pos");
  const distDisplay = root.querySelector("#sr-distance");
  const colorSwatch = root.querySelector("#sr-color-swatch");
  const colorHex = root.querySelector("#sr-color-hex");
  const colorDisplay = root.querySelector("#sr-color-display");
  const clearBtn = root.querySelector("#sr-clear");
  const deactivateBtn = root.querySelector("#sr-deactivate");
  const eyedropperBtn = root.querySelector("#sr-activate-eyedropper");

  let active = false;
  let unit = "px";
  let anchor = null;
  let mouseX = 0,
    mouseY = 0;
  let dpr = window.devicePixelRatio || 1;
  let lastColor = null;

  function resizeCanvases() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    [hRuler, vRuler, crosshairCanvas].forEach(c => {
      c.width = w * dpr;
      c.height = h * dpr;
      c.style.width = w + "px";
      c.style.height = h + "px";
      c.getContext("2d").scale(dpr, dpr);
    });
  }

  function draw() {
    if (!active) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const hCtx = hRuler.getContext("2d");
    const vCtx = vRuler.getContext("2d");
    const cCtx = crosshairCanvas.getContext("2d");

    hCtx.clearRect(0, 0, w, h);
    vCtx.clearRect(0, 0, w, h);
    cCtx.clearRect(0, 0, w, h);

    hCtx.save();
    hCtx.scale(dpr, dpr);
    drawRulerTicks(hCtx, w, 28, window.scrollX, unit, dpr, true);
    hCtx.restore();

    vCtx.save();
    vCtx.scale(dpr, dpr);
    drawRulerTicks(vCtx, h, 28, window.scrollY, unit, dpr, false);
    vCtx.restore();

    cCtx.save();
    cCtx.scale(dpr, dpr);
    drawCrosshair(cCtx, mouseX, mouseY, w, h);

    if (anchor) {
      drawMeasurementLine(cCtx, anchor.x, anchor.y, mouseX, mouseY, unit, dpr);
    }

    drawTooltip(cCtx, mouseX, mouseY, lastColor || "#000000", unit, dpr);
    cCtx.restore();
  }

  function activate() {
    active = true;
    resizeCanvases();
    overlay.style.display = "";
    controls.style.display = "flex";
    toggleBtn.style.display = "none";
    draw();
  }

  function deactivate() {
    active = false;
    anchor = null;
    overlay.style.display = "none";
    controls.style.display = "none";
    toggleBtn.style.display = "";
    posDisplay.textContent = "Move mouse to measure";
    distDisplay.textContent = "";
    colorDisplay.style.display = "none";
  }

  toggleBtn.addEventListener("click", activate);
  deactivateBtn.addEventListener("click", deactivate);

  unitSelect.addEventListener("change", () => {
    unit = unitSelect.value;
    draw();
  });

  clearBtn.addEventListener("click", () => {
    anchor = null;
    draw();
  });

  eyedropperBtn.addEventListener("click", async () => {
    const hex = await pickColorFromScreen();
    if (hex) {
      lastColor = hex;
      colorSwatch.style.background = hex;
      colorHex.textContent = hex;
      colorDisplay.style.display = "flex";
      navigator.clipboard?.writeText(hex);
    }
  });

  crosshairCanvas.style.pointerEvents = "auto";
  crosshairCanvas.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    const color = getPixelColor(crosshairCanvas, e.clientX * dpr, e.clientY * dpr);
    lastColor = hexFromRgb(color.r, color.g, color.b);
    posDisplay.textContent = `(${mouseX}, ${mouseY})`;
    if (anchor) {
      const dx = mouseX - anchor.x;
      const dy = mouseY - anchor.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      distDisplay.textContent = `Δ ${formatMeasurement(Math.abs(dx), unit, dpr)} × ${formatMeasurement(Math.abs(dy), unit, dpr)} (${formatMeasurement(dist, unit, dpr)})`;
    }
    draw();
  });

  crosshairCanvas.addEventListener("click", e => {
    if (anchor) {
      anchor = null;
    } else {
      anchor = { x: e.clientX, y: e.clientY };
    }
    draw();
  });

  crosshairCanvas.addEventListener("contextmenu", e => {
    e.preventDefault();
    deactivate();
  });

  window.addEventListener("resize", () => {
    if (active) {
      dpr = window.devicePixelRatio || 1;
      resizeCanvases();
      draw();
    }
  });

  window.addEventListener("scroll", () => {
    if (active) draw();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && active) deactivate();
  });
}
