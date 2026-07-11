import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { downloadBlob } from "../../utils/file.js";
import { loadImageFromFile, canvasToBlob } from "./image-utils.js";
import JSZip from "jszip";

export const toolConfig = {
  id: "favicon-generator",
  name: "Favicon Generator",
  category: "image",
  description: "Generate all favicon sizes from a single image (16, 32, 180, 192, 512px).",
  icon: "🌐",
  accept: "image/*",
  maxSizeMB: 10,
  keywords: ["favicon generator", "favicon", "website icon", "app icon"],
  steps: [
    "Upload an image (square recommended)",
    "Preview all favicon sizes",
    "Download ZIP with all sizes"
  ],
  faqs: [
    {
      question: "What sizes are generated?",
      answer: "16×16, 32×32, 180×180 (Apple), 192×192 (Android), and 512×512 (PWA)."
    },
    { question: "What format?", answer: "PNG format, compatible with all browsers and devices." }
  ]
};

export function render(container) {
  let originalImg = null;

  const upload = createFileUpload({
    accept: "image/*",
    multiple: false,
    maxSizeMB: 10,
    onFilesSelected: async files => {
      if (files.length === 0) return;
      originalImg = await loadImageFromFile(files[0]);
      optionsArea.style.display = "block";
      renderPreviews();
    }
  });

  const sizes = [
    { size: 16, label: "16×16", desc: "Browser tab icon" },
    { size: 32, label: "32×32", desc: "Favicon" },
    { size: 180, label: "180×180", desc: "Apple Touch Icon" },
    { size: 192, label: "192×192", desc: "Android Chrome" },
    { size: 512, label: "512×512", desc: "PWA Splash" }
  ];

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div id="preview-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:var(--space-4);margin:var(--space-4) 0;"></div>
        <button class="btn btn-primary btn-lg" id="download-btn" style="width:100%;">Download All as ZIP</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Generating favicons...</p></div>
    </div>
  `;

  container.querySelector("#upload-area").appendChild(upload.element);
  const optionsArea = container.querySelector("#options-area");
  const previewGrid = container.querySelector("#preview-grid");
  const downloadBtn = container.querySelector("#download-btn");
  const processing = container.querySelector("#processing");

  function renderPreviews() {
    previewGrid.innerHTML = "";
    sizes.forEach(({ size, label, desc }) => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      canvas.getContext("2d").drawImage(originalImg, 0, 0, size, size);
      const displaySize = Math.min(size, 80);

      const card = document.createElement("div");
      card.style.cssText =
        "text-align:center;padding:var(--space-4);background:var(--color-surface);border-radius:var(--radius-md);border:1px solid var(--color-border);";
      card.innerHTML = `
        <div style="display:flex;justify-content:center;margin-bottom:var(--space-2);">
          <div style="width:${displaySize}px;height:${displaySize}px;background:repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50%/16px 16px;display:flex;align-items:center;justify-content:center;">
            <img src="${canvas.toDataURL()}" style="width:${displaySize}px;height:${displaySize}px;">
          </div>
        </div>
        <div style="font-weight:600;font-size:var(--text-sm);">${label}</div>
        <div style="font-size:var(--text-xs);color:var(--color-text-muted);">${desc}</div>
      `;
      previewGrid.appendChild(card);
    });
  }

  downloadBtn.addEventListener("click", async () => {
    if (!originalImg) return;
    processing.style.display = "block";

    try {
      const zip = new JSZip();
      for (const { size } of sizes) {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        canvas.getContext("2d").drawImage(originalImg, 0, 0, size, size);
        const blob = await canvasToBlob(canvas, "image/png");
        zip.file(`favicon-${size}x${size}.png`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, "favicons.zip");
      showToast({ message: "Favicons generated!", type: "success" });
    } catch (err) {
      showToast({ message: "Error: " + err.message, type: "error" });
    } finally {
      processing.style.display = "none";
    }
  });
}

export function destroy() {}
