import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { downloadBlob } from "../../utils/file.js";
import { loadImageFromFile, canvasToBlob } from "./image-utils.js";

export const toolConfig = {
  id: "resize-image",
  name: "Image Resizer",
  category: "image",
  description: "Change image dimensions. Resize by pixels, percentage, or social media presets.",
  icon: "📐",
  accept: "image/*",
  maxSizeMB: 50,
  keywords: ["resize image", "change image size", "image resizer"],
  steps: [
    "Upload an image",
    "Set new dimensions or choose a preset",
    'Click "Resize"',
    "Download the resized image"
  ],
  faqs: [
    {
      question: "Will resizing reduce quality?",
      answer: "Upscaling may reduce quality. Downscaling maintains quality well."
    },
    {
      question: "What are the social media presets?",
      answer: "Common sizes for Instagram, Facebook, Twitter, and YouTube."
    }
  ]
};

export function render(container) {
  let originalImg = null;
  let aspectRatio = 1;

  const upload = createFileUpload({
    accept: "image/*",
    multiple: false,
    maxSizeMB: 50,
    onFilesSelected: async files => {
      if (files.length === 0) return;
      originalImg = await loadImageFromFile(files[0]);
      aspectRatio = originalImg.naturalWidth / originalImg.naturalHeight;
      widthInput.value = originalImg.naturalWidth;
      heightInput.value = originalImg.naturalHeight;
      originalInfo.textContent = `${originalImg.naturalWidth} × ${originalImg.naturalHeight}px`;
      optionsArea.style.display = "block";
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">Original: <strong id="original-info">-</strong></div>
        <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:var(--space-3);align-items:end;">
          <div class="form-group"><label>Width (px)</label><input type="number" id="width-input" class="text-input" min="1"></div>
          <button class="btn btn-sm btn-ghost" id="lock-btn" title="Lock aspect ratio">🔗</button>
          <div class="form-group"><label>Height (px)</label><input type="number" id="height-input" class="text-input" min="1"></div>
        </div>
        <div class="form-group">
          <label>Presets</label>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
            <button class="btn btn-sm btn-secondary" data-w="1080" data-h="1080">Instagram (1080²)</button>
            <button class="btn btn-sm btn-secondary" data-w="1200" data-h="630">Facebook (1200×630)</button>
            <button class="btn btn-sm btn-secondary" data-w="1200" data-h="675">Twitter (1200×675)</button>
            <button class="btn btn-sm btn-secondary" data-w="1920" data-h="1080">Full HD (1920×1080)</button>
            <button class="btn btn-sm btn-secondary" data-w="50" data-h="50">50%</button>
            <button class="btn btn-sm btn-secondary" data-w="25" data-h="25">25%</button>
          </div>
        </div>
        <div class="form-group">
          <label>Output Format</label>
          <select id="format-select" class="select-input">
            <option value="image/png">PNG</option>
            <option value="image/jpeg">JPG</option>
            <option value="image/webp">WebP</option>
          </select>
        </div>
        <button class="btn btn-primary btn-lg" id="resize-btn" style="width:100%;">Resize Image</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Resizing...</p></div>
    </div>
  `;

  container.querySelector("#upload-area").appendChild(upload.element);
  const optionsArea = container.querySelector("#options-area");
  const widthInput = container.querySelector("#width-input");
  const heightInput = container.querySelector("#height-input");
  const lockBtn = container.querySelector("#lock-btn");
  const originalInfo = container.querySelector("#original-info");
  const resizeBtn = container.querySelector("#resize-btn");
  const processing = container.querySelector("#processing");

  let lockAspect = true;
  lockBtn.style.background = "var(--color-primary-light)";
  lockBtn.addEventListener("click", () => {
    lockAspect = !lockAspect;
    lockBtn.style.background = lockAspect ? "var(--color-primary-light)" : "transparent";
  });

  widthInput.addEventListener("input", () => {
    if (lockAspect) heightInput.value = Math.round(widthInput.value / aspectRatio);
  });
  heightInput.addEventListener("input", () => {
    if (lockAspect) widthInput.value = Math.round(heightInput.value * aspectRatio);
  });

  container.querySelectorAll("[data-w]").forEach(btn => {
    btn.addEventListener("click", () => {
      const w = parseInt(btn.dataset.w);
      const h = parseInt(btn.dataset.h);
      if (w <= 100 && h <= 100) {
        // Percentage
        widthInput.value = Math.round((originalImg.naturalWidth * w) / 100);
        heightInput.value = Math.round((originalImg.naturalHeight * h) / 100);
      } else {
        widthInput.value = w;
        heightInput.value = h;
      }
    });
  });

  resizeBtn.addEventListener("click", async () => {
    if (!originalImg) return;
    const w = parseInt(widthInput.value);
    const h = parseInt(heightInput.value);
    if (!w || !h || w < 1 || h < 1) {
      showToast({ message: "Invalid dimensions", type: "warning" });
      return;
    }

    processing.style.display = "block";

    try {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(originalImg, 0, 0, w, h);
      const format = container.querySelector("#format-select").value;
      const blob = await canvasToBlob(canvas, format, 0.92);
      const ext = format.split("/")[1].replace("jpeg", "jpg");
      downloadBlob(blob, `resized-${w}x${h}.${ext}`);
      showToast({ message: `Resized to ${w}×${h}!`, type: "success" });
    } catch (err) {
      showToast({ message: "Error: " + err.message, type: "error" });
    } finally {
      processing.style.display = "none";
    }
  });
}

export function destroy() {}
