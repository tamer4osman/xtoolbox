import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { formatFileSize, downloadBlob } from "../../utils/file.js";
import { loadImageFromFile, canvasToBlob } from "./image-utils.js";

export const toolConfig = {
  id: "compress-image",
  name: "Image Compressor",
  category: "image",
  description: "Reduce image file size while maintaining quality. Supports JPG, PNG, WebP.",
  icon: "📦",
  accept: "image/jpeg,image/png,image/webp",
  maxSizeMB: 50,
  keywords: ["compress image", "reduce image size", "image optimizer"],
  steps: [
    "Upload an image",
    "Adjust the quality slider",
    "See the size comparison",
    "Download the compressed image"
  ],
  faqs: [
    {
      question: "How much can I compress?",
      answer: "Typically 30-70% size reduction depending on quality setting and image content."
    },
    {
      question: "Does compression reduce quality?",
      answer:
        "At 80% quality the difference is usually invisible while significantly reducing file size."
    }
  ]
};

export function render(container) {
  let originalFile = null;
  let originalImg = null;

  const upload = createFileUpload({
    accept: "image/jpeg,image/png,image/webp",
    multiple: false,
    maxSizeMB: 50,
    onFilesSelected: async files => {
      if (files.length === 0) return;
      originalFile = files[0];
      originalImg = await loadImageFromFile(originalFile);
      optionsArea.style.display = "block";
      originalSizeEl.textContent = formatFileSize(originalFile.size);
      compressImage();
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div class="form-group">
          <label>Output Format</label>
          <select id="format-select" class="select-input">
            <option value="image/jpeg">JPG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WebP</option>
          </select>
        </div>
        <div class="form-group">
          <label>Quality: <strong id="quality-display">80</strong>%</label>
          <input type="range" id="quality-slider" min="10" max="100" value="80" step="5" class="range-slider-input">
        </div>
        <div class="stats-row">
          <div class="stat"><span class="stat-label">Original</span><span class="stat-value" id="original-size">-</span></div>
          <div class="stat"><span class="stat-label">Compressed</span><span class="stat-value" id="compressed-size">-</span></div>
          <div class="stat"><span class="stat-label">Reduction</span><span class="stat-value" id="reduction">-</span></div>
        </div>
        <div id="comparison-area"></div>
        <button class="btn btn-primary btn-lg" id="download-btn" style="width:100%;margin-top:var(--space-4);">Download Compressed Image</button>
      </div>
    </div>
  `;

  container.querySelector("#upload-area").appendChild(upload.element);
  const optionsArea = container.querySelector("#options-area");
  const qualitySlider = container.querySelector("#quality-slider");
  const qualityDisplay = container.querySelector("#quality-display");
  const originalSizeEl = container.querySelector("#original-size");
  const compressedSizeEl = container.querySelector("#compressed-size");
  const reductionEl = container.querySelector("#reduction");
  const comparisonArea = container.querySelector("#comparison-area");
  const downloadBtn = container.querySelector("#download-btn");
  let compressedBlob = null;

  qualitySlider.addEventListener("input", () => {
    qualityDisplay.textContent = qualitySlider.value;
    compressImage();
  });
  container.querySelector("#format-select").addEventListener("change", compressImage);

  async function compressImage() {
    if (!originalImg) return;
    const quality = parseInt(qualitySlider.value) / 100;
    const format = container.querySelector("#format-select").value;

    const canvas = document.createElement("canvas");
    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    canvas.getContext("2d").drawImage(originalImg, 0, 0);

    compressedBlob = await canvasToBlob(canvas, format, quality);
    compressedSizeEl.textContent = formatFileSize(compressedBlob.size);
    const pct = ((1 - compressedBlob.size / originalFile.size) * 100).toFixed(1);
    reductionEl.textContent = `${pct}%`;

    comparisonArea.innerHTML = `
      <div style="display:flex;gap:var(--space-4);margin:var(--space-4) 0;">
        <div style="flex:1;text-align:center;">
          <img src="${URL.createObjectURL(originalFile)}" style="max-height:200px;margin:0 auto;border-radius:var(--radius-md);border:1px solid var(--color-border);">
          <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:var(--space-2);">Original</div>
        </div>
        <div style="flex:1;text-align:center;">
          <img src="${URL.createObjectURL(compressedBlob)}" style="max-height:200px;margin:0 auto;border-radius:var(--radius-md);border:1px solid var(--color-border);">
          <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:var(--space-2);">Compressed</div>
        </div>
      </div>
    `;
  }

  downloadBtn.addEventListener("click", () => {
    if (compressedBlob) {
      const ext = container
        .querySelector("#format-select")
        .value.split("/")[1]
        .replace("jpeg", "jpg");
      downloadBlob(compressedBlob, `compressed.${ext}`);
      showToast({ message: "Downloaded!", type: "success" });
    }
  });
}

export function destroy() {}
