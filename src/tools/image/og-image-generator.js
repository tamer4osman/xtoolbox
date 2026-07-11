import { downloadBlob } from "../../utils/file.js";

const PRESETS = [
  { name: "Default", bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#ffffff" },
  { name: "Sunset", bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "#ffffff" },
  { name: "Ocean", bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "#ffffff" },
  { name: "Forest", bg: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "#1a1a2e" },
  { name: "Dark", bg: "linear-gradient(135deg, #0c0c1d 0%, #1a1a3e 100%)", color: "#ffffff" },
  { name: "Fire", bg: "linear-gradient(135deg, #f12711 0%, #f5af19 100%)", color: "#ffffff" },
  { name: "Minimal", bg: "#ffffff", color: "#111827" },
  { name: "Midnight", bg: "linear-gradient(135deg, #232526 0%, #414345 100%)", color: "#e2e8f0" }
];

function wrapText(ctx, text, maxWidth, fontSize) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;

  for (const word of words) {
    const testLine = currentLine ? currentLine + " " + word : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function drawOGImage(canvas, config) {
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;

  ctx.clearRect(0, 0, width, height);

  if (config.bgType === "gradient") {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    const colors = config.bgColors || ["#667eea", "#764ba2"];
    grad.addColorStop(0, colors[0]);
    grad.addColorStop(1, colors[1] || colors[0]);
    ctx.fillStyle = grad;
  } else if (config.bgType === "solid") {
    ctx.fillStyle = config.bgColor || "#ffffff";
  } else if (config.bgType === "pattern") {
    ctx.fillStyle = config.bgColor || "#1a1a2e";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(255,255,255,0.03)";
    for (let x = 0; x < width; x += 40) {
      for (let y = 0; y < height; y += 40) {
        ctx.fillRect(x, y, 20, 20);
      }
    }
  } else {
    ctx.fillStyle = "#667eea";
  }

  ctx.fillRect(0, 0, width, height);

  const padding = 80;
  const textAreaWidth = width - padding * 2;

  if (config.title) {
    const titleFontSize = Math.min(64, Math.max(32, textAreaWidth / (config.title.length * 0.5)));
    const titleLines = wrapText(ctx, config.title, textAreaWidth, titleFontSize);
    const lineHeight = titleFontSize * 1.2;
    const totalTitleHeight = titleLines.length * lineHeight;
    const startY = (height - totalTitleHeight) / 2 - (config.subtitle ? 20 : 0);

    ctx.fillStyle = config.textColor || "#ffffff";
    ctx.font = `bold ${titleFontSize}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    titleLines.forEach((line, i) => {
      ctx.fillText(line, padding, startY + i * lineHeight);
    });

    if (config.subtitle) {
      const subFontSize = Math.min(28, titleFontSize * 0.5);
      ctx.font = `${subFontSize}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = config.textColor || "#ffffff";
      ctx.globalAlpha = 0.7;
      ctx.fillText(config.subtitle, padding, startY + totalTitleHeight + 15);
      ctx.globalAlpha = 1;
    }
  }

  if (config.siteName) {
    const nameFontSize = 22;
    ctx.font = `bold ${nameFontSize}px system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = config.textColor || "#ffffff";
    ctx.globalAlpha = 0.5;
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText(config.siteName, padding, height - padding);
    ctx.globalAlpha = 1;
  }

  if (config.logo) {
    const img = new Image();
    img.src = config.logo;
    const logoSize = 60;
    try {
      ctx.drawImage(
        img,
        width - padding - logoSize,
        height - padding - logoSize,
        logoSize,
        logoSize
      );
    } catch {}
  }
}

export const toolConfig = {
  id: "og-image-generator",
  name: "Open Graph Image Generator",
  category: "image",
  description: "Create social media preview images with text overlays, gradients, and backgrounds.",
  icon: "🖼️",
  keywords: ["og", "open-graph", "social", "preview", "twitter", "image"],
  accept: "image/*",
  maxSizeMB: 5
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <h1>${toolConfig.name}</h1>
      <p class="tool-description">Create 1200×630 OG images with custom text, gradients, and backgrounds. Export as PNG.</p>

      <div class="og-layout">
        <div class="og-sidebar">
          <div class="og-field">
            <label for="og-title">Title</label>
            <input type="text" id="og-title" class="input-field" value="My Awesome Article" placeholder="Enter title">
          </div>
          <div class="og-field">
            <label for="og-subtitle">Subtitle (optional)</label>
            <input type="text" id="og-subtitle" class="input-field" value="A guide to building great tools" placeholder="Enter subtitle">
          </div>
          <div class="og-field">
            <label for="og-sitename">Site Name (optional)</label>
            <input type="text" id="og-sitename" class="input-field" value="xtoolbox.dev" placeholder="your-site.com">
          </div>
          <div class="og-field">
            <label>Background Style</label>
            <div id="bg-type-btns" class="btn-group">
              <button type="button" class="btn-toggle active" data-bg="gradient">Gradient</button>
              <button type="button" class="btn-toggle" data-bg="solid">Solid</button>
              <button type="button" class="btn-toggle" data-bg="pattern">Pattern</button>
            </div>
          </div>
          <div class="og-field" id="gradient-pickers" style="display:flex">
            <div class="color-pick">
              <label for="og-color1">Color 1</label>
              <input type="color" id="og-color1" value="#667eea">
            </div>
            <div class="color-pick">
              <label for="og-color2">Color 2</label>
              <input type="color" id="og-color2" value="#764ba2">
            </div>
          </div>
          <div class="og-field" id="solid-picker" style="display:none">
            <label for="og-bg-color">Background Color</label>
            <input type="color" id="og-bg-color" value="#ffffff">
          </div>
          <div class="og-field">
            <label for="og-text-color">Text Color</label>
            <input type="color" id="og-text-color" value="#ffffff">
          </div>
          <div class="og-field">
            <label>Presets</label>
            <div class="preset-grid" id="preset-grid">
              ${PRESETS.map(
                (p, i) => `
                <button type="button" class="preset-btn" data-index="${i}" style="background:${p.bg};color:${p.color}" title="${p.name}">
                  ${p.name}
                </button>
              `
              ).join("")}
            </div>
          </div>
          <div class="og-field">
            <label for="og-logo">Logo (optional)</label>
            <input type="file" id="og-logo" accept="image/*" class="file-input">
          </div>
          <div class="btn-row">
            <button type="button" id="download-btn" class="btn-primary">⬇ Download PNG</button>
          </div>
        </div>

        <div class="og-preview">
          <canvas id="og-canvas" width="1200" height="630"></canvas>
          <div class="og-size-label">1200 × 630</div>
        </div>
      </div>
    </div>
  `;

  const canvas = container.querySelector("#og-canvas");
  const titleInput = container.querySelector("#og-title");
  const subtitleInput = container.querySelector("#og-subtitle");
  const sitenameInput = container.querySelector("#og-sitename");
  const color1Input = container.querySelector("#og-color1");
  const color2Input = container.querySelector("#og-color2");
  const bgColorInput = container.querySelector("#og-bg-color");
  const textColorInput = container.querySelector("#og-text-color");
  const logoInput = container.querySelector("#og-logo");
  const downloadBtn = container.querySelector("#download-btn");
  const bgTypeBtns = container.querySelector("#bg-type-btns");
  const gradientPickers = container.querySelector("#gradient-pickers");
  const solidPicker = container.querySelector("#solid-picker");
  const presetGrid = container.querySelector("#preset-grid");

  let bgType = "gradient";
  let logoDataUrl = null;

  function getConfig() {
    return {
      title: titleInput.value,
      subtitle: subtitleInput.value,
      siteName: sitenameInput.value,
      bgType,
      bgColors: [color1Input.value, color2Input.value],
      bgColor: bgColorInput.value,
      textColor: textColorInput.value,
      logo: logoDataUrl
    };
  }

  function redraw() {
    drawOGImage(canvas, getConfig());
  }

  titleInput.addEventListener("input", redraw);
  subtitleInput.addEventListener("input", redraw);
  sitenameInput.addEventListener("input", redraw);
  color1Input.addEventListener("input", redraw);
  color2Input.addEventListener("input", redraw);
  bgColorInput.addEventListener("input", redraw);
  textColorInput.addEventListener("input", redraw);

  bgTypeBtns.addEventListener("click", e => {
    const btn = e.target.closest(".btn-toggle");
    if (!btn) return;
    bgTypeBtns.querySelectorAll(".btn-toggle").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    bgType = btn.dataset.bg;
    gradientPickers.style.display = bgType === "gradient" ? "flex" : "none";
    solidPicker.style.display = bgType === "solid" ? "block" : "none";
    redraw();
  });

  presetGrid.addEventListener("click", e => {
    const btn = e.target.closest(".preset-btn");
    if (!btn) return;
    const preset = PRESETS[parseInt(btn.dataset.index)];
    if (preset.bg.includes("gradient")) {
      const match = preset.bg.match(/#[0-9a-f]{6}/gi);
      if (match) {
        color1Input.value = match[0];
        color2Input.value = match[1] || match[0];
      }
      bgType = "gradient";
      gradientPickers.style.display = "flex";
      solidPicker.style.display = "none";
    } else {
      bgColorInput.value = preset.bg;
      bgType = "solid";
      gradientPickers.style.display = "none";
      solidPicker.style.display = "block";
    }
    textColorInput.value = preset.color;
    bgTypeBtns.querySelectorAll(".btn-toggle").forEach(b => {
      b.classList.toggle("active", b.dataset.bg === bgType);
    });
    redraw();
  });

  logoInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      logoDataUrl = reader.result;
      redraw();
    };
    reader.readAsDataURL(file);
  });

  downloadBtn.addEventListener("click", () => {
    canvas.toBlob(blob => {
      downloadBlob(blob, "og-image.png");
    }, "image/png");
  });

  redraw();
}
