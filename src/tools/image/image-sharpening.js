import { createPixelTool } from "./pixel-tool-factory.js";

const { toolConfig, render } = createPixelTool({
  toolConfig: {
    id: "image-sharpening",
    name: "Image Sharpening",
    category: "image",
    description:
      "Sharpen blurry or soft images using convolution filters. Adjust intensity and preview results in real-time.",
    icon: "🔍",
    accept: "image/*",
    maxSizeMB: 50,
    keywords: ["sharpen image", "unsharp mask", "image clarity", "enhance photo", "fix blur"],
    steps: [
      "Upload an image",
      "Adjust sharpening intensity",
      "Preview the result",
      "Download the sharpened image"
    ],
    faqs: [
      {
        question: "Can this fix severely blurry images?",
        answer:
          "Sharpening enhances existing edges but cannot recover lost detail. It works best for slightly soft or out-of-focus images."
      },
      {
        question: "What sharpening method is used?",
        answer:
          "This tool uses an unsharp mask technique — a high-pass filter that enhances edge contrast while preserving smooth areas."
      }
    ]
  },
  optionsHTML: `
    <div class="form-group">
      <label>Sharpening Intensity: <span id="intensity-val">1.5</span></label>
      <input type="range" id="intensity-range" min="0.1" max="5" step="0.1" value="1.5" style="width:100%;">
    </div>
    <div style="display:flex;gap:8px;">
      <button id="compare-btn" class="btn btn-sm btn-secondary">👁️ Show Original</button>
    </div>
  `,
  outputFilename: "sharpened.png",
  successMessage: "Image sharpened successfully!",
  initControls(container, renderPreview) {
    const intensityRange = container.querySelector("#intensity-range");
    const intensityVal = container.querySelector("#intensity-val");
    const compareBtn = container.querySelector("#compare-btn");

    let intensity = 1.5;
    let showingOriginal = false;

    intensityRange.addEventListener("input", () => {
      intensity = parseFloat(intensityRange.value);
      intensityVal.textContent = intensity.toFixed(1);
      renderPreview();
    });

    compareBtn.addEventListener("click", () => {
      showingOriginal = !showingOriginal;
      compareBtn.textContent = showingOriginal ? "👁️ Show Sharpened" : "👁️ Show Original";
      renderPreview();
    });

    container._getState = () => ({ intensity, showingOriginal });
  },
  renderPreview(previewCanvas, originalImage, scale, container) {
    const { intensity, showingOriginal } = container._getState();
    if (!showingOriginal && intensity > 0) {
      const ctx = previewCanvas.getContext("2d");
      applySharpening(ctx, previewCanvas.width, previewCanvas.height, intensity);
    }
  },
  applyTransform(ctx, w, h, container) {
    const { intensity } = container._getState();
    applySharpening(ctx, w, h, intensity);
  }
});

function applySharpening(ctx, w, h, amount) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const copy = new Uint8ClampedArray(data);

  const kernel = [0, -1, 0, -1, 4 + 1 / amount, -1, 0, -1, 0];

  const scale = amount;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * w + (x + kx)) * 4 + c;
            sum += copy[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        const idx = (y * w + x) * 4 + c;
        data[idx] = Math.min(255, Math.max(0, copy[idx] + (sum - copy[idx]) * scale * 0.25));
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

export { toolConfig, render };
