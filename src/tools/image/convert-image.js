import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { downloadBlob } from "../../utils/file.js";
import { loadImageFromFile, canvasToBlob } from "./image-utils.js";

export const toolConfig = {
  id: "convert-image",
  name: "Image Format Converter",
  category: "image",
  description: "Convert images between JPG, PNG, WebP, and BMP formats.",
  icon: "🔄",
  accept: "image/*",
  maxSizeMB: 50,
  keywords: ["convert image", "jpg to png", "png to webp", "image converter"],
  steps: [
    "Upload an image",
    "Choose output format",
    "Choose quality (for lossy formats)",
    "Download converted image"
  ],
  faqs: [
    {
      question: "Which format should I choose?",
      answer: "PNG for transparency, JPG for photos, WebP for best compression."
    }
  ]
};

export function render(container) {
  let originalImg = null;
  let originalFile = null;

  const upload = createFileUpload({
    accept: "image/*",
    multiple: false,
    maxSizeMB: 50,
    onFilesSelected: async files => {
      if (files.length === 0) return;
      originalFile = files[0];
      originalImg = await loadImageFromFile(files[0]);
      currentFormat.textContent = originalFile.type || "unknown";
      currentSize.textContent = (originalFile.size / 1024).toFixed(1) + " KB";
      optionsArea.style.display = "block";
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div style="display:flex;gap:var(--space-6);margin-bottom:var(--space-4);">
          <div><span style="font-size:var(--text-xs);color:var(--color-text-muted);">Current Format</span><div id="current-format" style="font-weight:600;">-</div></div>
          <div><span style="font-size:var(--text-xs);color:var(--color-text-muted);">Current Size</span><div id="current-size" style="font-weight:600;">-</div></div>
        </div>
        <div class="form-group">
          <label>Convert To</label>
          <select id="format-select" class="select-input">
            <option value="image/png">PNG (lossless, supports transparency)</option>
            <option value="image/jpeg">JPG (lossy, smallest for photos)</option>
            <option value="image/webp">WebP (best compression)</option>
            <option value="image/bmp">BMP (uncompressed)</option>
          </select>
        </div>
        <div class="form-group" id="quality-group">
          <label>Quality: <strong id="quality-display">92</strong>%</label>
          <input type="range" id="quality-slider" min="10" max="100" value="92" step="5" class="range-slider-input">
        </div>
        <button class="btn btn-primary btn-lg" id="convert-btn" style="width:100%;">Convert & Download</button>
      </div>
    </div>
  `;

  container.querySelector("#upload-area").appendChild(upload.element);
  const optionsArea = container.querySelector("#options-area");
  const currentFormat = container.querySelector("#current-format");
  const currentSize = container.querySelector("#current-size");
  const qualityGroup = container.querySelector("#quality-group");
  const qualitySlider = container.querySelector("#quality-slider");
  const qualityDisplay = container.querySelector("#quality-display");
  const convertBtn = container.querySelector("#convert-btn");

  qualitySlider.addEventListener("input", () => {
    qualityDisplay.textContent = qualitySlider.value;
  });

  container.querySelector("#format-select").addEventListener("change", e => {
    qualityGroup.style.display = e.target.value === "image/bmp" ? "none" : "block";
  });

  convertBtn.addEventListener("click", async () => {
    if (!originalImg) return;
    const format = container.querySelector("#format-select").value;
    const quality = parseInt(qualitySlider.value) / 100;

    const canvas = document.createElement("canvas");
    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    canvas.getContext("2d").drawImage(originalImg, 0, 0);

    const blob = await canvasToBlob(canvas, format, quality);
    const ext = format.split("/")[1].replace("jpeg", "jpg");
    downloadBlob(blob, `converted.${ext}`);
    showToast({ message: `Converted to ${ext.toUpperCase()}!`, type: "success" });
  });
}

export function destroy() {}
