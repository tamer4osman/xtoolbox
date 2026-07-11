import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { downloadBlob } from "../../utils/file.js";
import { renderAllPages } from "./pdf-utils.js";

export const toolConfig = {
  id: "pdf-to-image",
  name: "PDF to Image",
  category: "pdf",
  description: "Convert PDF pages to PNG or JPG images.",
  icon: "🖼️",
  accept: ".pdf",
  maxSizeMB: 100,
  keywords: ["pdf to image", "pdf to png", "pdf to jpg"],
  steps: [
    "Upload a PDF file",
    "Choose output format (PNG or JPG)",
    'Click "Convert"',
    "Download the images"
  ],
  faqs: [
    {
      question: "What resolution are the images?",
      answer: "Images are rendered at 2x scale (roughly 150 DPI) for good quality."
    },
    {
      question: "Can I convert just one page?",
      answer: "Currently all pages are converted. Use Split PDF first to extract specific pages."
    }
  ]
};

export function render(container) {
  let currentFile = null;

  const upload = createFileUpload({
    accept: ".pdf",
    multiple: false,
    maxSizeMB: 100,
    onFilesSelected: files => {
      if (files.length === 0) return;
      currentFile = files[0];
      optionsArea.style.display = "block";
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div class="form-group">
          <label>Output Format</label>
          <select id="format-select" class="select-input">
            <option value="image/png">PNG (lossless)</option>
            <option value="image/jpeg">JPG (smaller size)</option>
          </select>
        </div>
        <button class="btn btn-primary btn-lg" id="convert-btn" style="width:100%;">Convert to Images</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p id="progress-text">Converting...</p>
      </div>
    </div>
  `;

  container.querySelector("#upload-area").appendChild(upload.element);
  const optionsArea = container.querySelector("#options-area");
  const convertBtn = container.querySelector("#convert-btn");
  const processing = container.querySelector("#processing");
  const progressText = container.querySelector("#progress-text");

  convertBtn.addEventListener("click", async () => {
    if (!currentFile) return;
    const format = container.querySelector("#format-select").value;
    const ext = format === "image/png" ? "png" : "jpg";

    processing.style.display = "block";
    convertBtn.style.display = "none";

    try {
      const pages = await renderAllPages(currentFile, 2.0);
      progressText.textContent = `Converting ${pages.length} pages...`;

      for (let i = 0; i < pages.length; i++) {
        const canvas = pages[i];
        const blob = await new Promise(resolve => canvas.toBlob(resolve, format, 0.92));
        const suffix = pages.length === 1 ? "" : `-${i + 1}`;
        downloadBlob(blob, `page${suffix}.${ext}`);
        // Small delay between downloads to avoid browser blocking
        if (i < pages.length - 1) await new Promise(r => setTimeout(r, 300));
      }

      showToast({ message: `${pages.length} page(s) converted!`, type: "success" });
    } catch (err) {
      showToast({ message: "Error: " + err.message, type: "error" });
    } finally {
      processing.style.display = "none";
      convertBtn.style.display = "inline-flex";
    }
  });
}

export function destroy() {}
