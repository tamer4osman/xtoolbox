import { createImageTool } from "./image-tool-factory.js";

export const toolConfig = {
  id: "image-compare",
  name: "Image Comparison",
  category: "image",
  description: "Compare two images side-by-side with a swipe slider and overlay diff view.",
  icon: "🔍",
  accept: "image/*",
  maxSizeMB: 50,
  multiple: true,
  keywords: ["compare", "diff", "side by side", "overlay", "image comparison"],
  steps: [
    "Upload two images",
    "Choose comparison mode",
    "Swipe or overlay to see differences",
    "Download the diff view"
  ],
  faqs: [
    {
      question: "What comparison modes are available?",
      answer:
        "Side-by-side shows both images next to each other. Swipe uses a draggable slider to reveal one image over the other. Overlay blends both images with adjustable opacity."
    },
    {
      question: "Can I download the comparison?",
      answer: "Yes — the download captures the current comparison view as a PNG image."
    }
  ]
};

function drawScaled(img, canvas, maxW) {
  const scale = Math.min(maxW / img.naturalWidth, maxW / img.naturalHeight, 1);
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
}

export function render(container) {
  let mode = "side-by-side";
  let swipePos = 50;
  let overlayOpacity = 50;

  const tool = createImageTool({
    container,
    toolId: "img-compare",
    multiple: true,
    processingMessage: "Preparing comparison...",
    successMessage: "Comparison downloaded!",
    getFilename: () => `comparison-${mode}.png`,
    getFormat: () => "image/png",
    getQuality: () => 0.92,
    optionsHTML: `
      <div class="form-group">
        <label>Comparison Mode</label>
        <div id="mode-buttons" style="display:flex;gap:6px;flex-wrap:wrap;"></div>
      </div>
      <div class="form-group" id="swipe-group">
        <label>Swipe Position: <span id="swipe-val">50</span>%</label>
        <input type="range" id="swipe-range" min="0" max="100" value="50" style="width:100%;">
      </div>
      <div class="form-group" id="overlay-group" style="display:none;">
        <label>Overlay Opacity: <span id="overlay-val">50</span>%</label>
        <input type="range" id="overlay-range" min="0" max="100" value="50" style="width:100%;">
      </div>
    `,
    onImageLoaded: ({ state }) => {
      if (state.images && state.images.length >= 2) {
        tool.renderPreview();
      }
    },
    renderPreview: ({ state }) => {
      if (!state.images || state.images.length < 2) return;
      const canvas = container.querySelector("#img-compare-preview-canvas");
      const img1 = state.images[0];
      const img2 = state.images[1];
      const maxW = 600;
      const w = Math.max(
        Math.round(Math.min(maxW / img1.naturalWidth, 1) * img1.naturalWidth),
        Math.round(Math.min(maxW / img2.naturalWidth, 1) * img2.naturalWidth)
      );
      const h1 = Math.round(Math.min(maxW / img1.naturalWidth, 1) * img1.naturalHeight);
      const h2 = Math.round(Math.min(maxW / img2.naturalWidth, 1) * img2.naturalHeight);
      const h = Math.max(h1, h2);

      canvas.width = mode === "side-by-side" ? w * 2 + 4 : w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (mode === "side-by-side") {
        const s1 = Math.min(maxW / img1.naturalWidth, maxW / img1.naturalHeight, 1);
        const s2 = Math.min(maxW / img2.naturalWidth, maxW / img2.naturalHeight, 1);
        const w1 = Math.round(img1.naturalWidth * s1);
        const h1 = Math.round(img1.naturalHeight * s1);
        const w2 = Math.round(img2.naturalWidth * s2);
        const h2 = Math.round(img2.naturalHeight * s2);
        const gap = 4;
        canvas.width = w1 + gap + w2;
        canvas.height = Math.max(h1, h2);
        ctx.fillStyle = "#333";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img1, 0, 0, w1, h1);
        ctx.drawImage(img2, w1 + gap, 0, w2, h2);
      } else if (mode === "swipe") {
        const s = Math.min(maxW / img1.naturalWidth, maxW / img1.naturalHeight, 1);
        const dw = Math.round(img1.naturalWidth * s);
        const dh = Math.round(img1.naturalHeight * s);
        canvas.width = dw;
        canvas.height = dh;
        ctx.drawImage(img1, 0, 0, dw, dh);
        const splitX = Math.round(dw * (swipePos / 100));
        ctx.save();
        ctx.beginPath();
        ctx.rect(splitX, 0, dw - splitX, dh);
        ctx.clip();
        ctx.drawImage(img2, 0, 0, dw, dh);
        ctx.restore();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(splitX, 0);
        ctx.lineTo(splitX, dh);
        ctx.stroke();
      } else {
        const s = Math.min(maxW / img1.naturalWidth, maxW / img1.naturalHeight, 1);
        const dw = Math.round(img1.naturalWidth * s);
        const dh = Math.round(img1.naturalHeight * s);
        canvas.width = dw;
        canvas.height = dh;
        ctx.globalAlpha = 1;
        ctx.drawImage(img1, 0, 0, dw, dh);
        ctx.globalAlpha = overlayOpacity / 100;
        ctx.drawImage(img2, 0, 0, dw, dh);
        ctx.globalAlpha = 1;
      }
    },
    processForDownload: ({ state, canvas }) => {
      if (!state.images || state.images.length < 2) return;
      const img1 = state.images[0];
      const img2 = state.images[1];

      if (mode === "side-by-side") {
        const w1 = img1.naturalWidth;
        const h1 = img1.naturalHeight;
        const w2 = img2.naturalWidth;
        const h2 = img2.naturalHeight;
        const gap = 4;
        canvas.width = w1 + gap + w2;
        canvas.height = Math.max(h1, h2);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#333";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img1, 0, 0);
        ctx.drawImage(img2, w1 + gap, 0);
      } else if (mode === "swipe") {
        canvas.width = img1.naturalWidth;
        canvas.height = img1.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img1, 0, 0);
        const splitX = Math.round(img1.naturalWidth * (swipePos / 100));
        ctx.save();
        ctx.beginPath();
        ctx.rect(splitX, 0, img1.naturalWidth - splitX, img1.naturalHeight);
        ctx.clip();
        ctx.drawImage(img2, 0, 0);
        ctx.restore();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(splitX, 0);
        ctx.lineTo(splitX, img1.naturalHeight);
        ctx.stroke();
      } else {
        canvas.width = img1.naturalWidth;
        canvas.height = img1.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img1, 0, 0);
        ctx.globalAlpha = overlayOpacity / 100;
        ctx.drawImage(img2, 0, 0);
        ctx.globalAlpha = 1;
      }
    }
  });

  const MODES = [
    { id: "side-by-side", name: "Side by Side" },
    { id: "swipe", name: "Swipe" },
    { id: "overlay", name: "Overlay" }
  ];

  function renderModeButtons() {
    const btns = container.querySelector("#mode-buttons");
    btns.innerHTML = "";
    MODES.forEach(m => {
      const btn = document.createElement("button");
      btn.className = `btn btn-sm ${mode === m.id ? "btn-primary" : "btn-secondary"}`;
      btn.textContent = m.name;
      btn.addEventListener("click", () => {
        mode = m.id;
        renderModeButtons();
        updateVisibility();
        tool.renderPreview();
      });
      btns.appendChild(btn);
    });
  }

  function updateVisibility() {
    container.querySelector("#swipe-group").style.display = mode === "swipe" ? "block" : "none";
    container.querySelector("#overlay-group").style.display = mode === "overlay" ? "block" : "none";
  }

  renderModeButtons();
  updateVisibility();

  tool.bindOptionChange({
    rangeId: "swipe-range",
    valueId: "swipe-val",
    onChange: v => {
      swipePos = parseInt(v);
    }
  });
  tool.bindOptionChange({
    rangeId: "overlay-range",
    valueId: "overlay-val",
    onChange: v => {
      overlayOpacity = parseInt(v);
    }
  });
}

export function destroy() {}
