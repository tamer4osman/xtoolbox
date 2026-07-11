import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { downloadBlob } from "../../utils/file.js";
import { loadImageFromFile, canvasToBlob } from "./image-utils.js";
import JSZip from "jszip";

export const toolConfig = {
  id: "split-image",
  name: "Image Splitter",
  category: "image",
  description:
    "Split any image into a grid of equal-sized tiles. Perfect for Instagram carousel posts, photo grids, or creating puzzle-like image collections.",
  icon: "✂️",
  accept: "image/*",
  maxSizeMB: 50,
  keywords: ["split image", "image splitter", "instagram grid"],
  steps: [
    "Upload an image",
    "Set number of rows and columns",
    "Preview how the image will be split",
    "Download all tiles as ZIP"
  ],
  faqs: [
    {
      question: "How does the splitting work?",
      answer:
        "The image is divided into equal tiles based on rows × columns. For example, a 3×3 grid splits your image into 9 equal parts."
    },
    {
      question: "What happens if image dimensions don't divide evenly?",
      answer:
        "Each tile gets the floor value of the division. Any remaining pixels on the right/bottom edges are cropped."
    },
    {
      question: "What format are the tiles?",
      answer:
        "All tiles are saved as PNG to preserve quality. They're named with row_col format (e.g., 1_1.png, 1_2.png)."
    },
    {
      question: "How do I use for Instagram?",
      answer:
        "Split your image into 3×1 for horizontal carousel, or 3×3 for a 9-image grid. Upload tiles in order (left to right, top to bottom)."
    }
  ]
};

export function render(container) {
  let originalImg = null;

  const upload = createFileUpload({
    accept: "image/*",
    multiple: false,
    maxSizeMB: 50,
    onFilesSelected: async files => {
      if (files.length === 0) return;
      originalImg = await loadImageFromFile(files[0]);
      dimsInfo.textContent = `${originalImg.naturalWidth} × ${originalImg.naturalHeight}px`;
      optionsArea.style.display = "block";
      updatePreview();
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-2);">Image: <strong id="dims-info">-</strong></div>
        <p style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">
          <strong>How it works:</strong> Enter rows and columns to split your image into that many tiles. 
          Each tile will be an equal-sized portion of your image, downloaded as a ZIP file.
        </p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
          <div class="form-group">
            <label>Rows</label>
            <select id="rows-input" class="text-input">
              ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<option value="${n}"${n === 3 ? " selected" : ""}>${n}</option>`).join("")}
            </select>
          </div>
          <div class="form-group">
            <label>Columns</label>
            <select id="cols-input" class="text-input">
              ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<option value="${n}"${n === 3 ? " selected" : ""}>${n}</option>`).join("")}
            </select>
          </div>
        </div>
        <div id="preview-area" style="margin:var(--space-4) 0;text-align:center;"></div>
        <div id="tile-info" style="text-align:center;font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);"></div>
        <button class="btn btn-primary btn-lg" id="split-btn" style="width:100%;">Split & Download ZIP</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Splitting...</p></div>
    </div>
  `;

  container.querySelector("#upload-area").appendChild(upload.element);
  const optionsArea = container.querySelector("#options-area");
  const dimsInfo = container.querySelector("#dims-info");
  const rowsInput = container.querySelector("#rows-input");
  const colsInput = container.querySelector("#cols-input");
  const previewArea = container.querySelector("#preview-area");
  const tileInfo = container.querySelector("#tile-info");
  const splitBtn = container.querySelector("#split-btn");
  const processing = container.querySelector("#processing");

  function updatePreview() {
    if (!originalImg) return;
    const rows = parseInt(rowsInput.value);
    const cols = parseInt(colsInput.value);
    const tw = Math.floor(originalImg.naturalWidth / cols);
    const th = Math.floor(originalImg.naturalHeight / rows);
    tileInfo.textContent = `${cols}×${rows} grid = ${cols * rows} tiles, each ${tw}×${th}px`;

    const canvas = document.createElement("canvas");
    const scale = Math.min(500 / originalImg.naturalWidth, 1);
    canvas.width = originalImg.naturalWidth * scale;
    canvas.height = originalImg.naturalHeight * scale;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(255,0,0,0.6)";
    ctx.lineWidth = 1;
    for (let r = 1; r < rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, (r * canvas.height) / rows);
      ctx.lineTo(canvas.width, (r * canvas.height) / rows);
      ctx.stroke();
    }
    for (let c = 1; c < cols; c++) {
      ctx.beginPath();
      ctx.moveTo((c * canvas.width) / cols, 0);
      ctx.lineTo((c * canvas.width) / cols, canvas.height);
      ctx.stroke();
    }
    previewArea.innerHTML = "";
    previewArea.appendChild(canvas);
  }

  rowsInput.addEventListener("input", updatePreview);
  colsInput.addEventListener("input", updatePreview);

  splitBtn.addEventListener("click", async () => {
    if (!originalImg) return;
    const rows = parseInt(rowsInput.value) || 3;
    const cols = parseInt(colsInput.value) || 3;
    const tw = Math.floor(originalImg.naturalWidth / cols);
    const th = Math.floor(originalImg.naturalHeight / rows);

    processing.style.display = "block";

    try {
      const zip = new JSZip();
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const canvas = document.createElement("canvas");
          canvas.width = tw;
          canvas.height = th;
          canvas.getContext("2d").drawImage(originalImg, c * tw, r * th, tw, th, 0, 0, tw, th);
          const blob = await canvasToBlob(canvas, "image/png");
          zip.file(`tile-${r + 1}-${c + 1}.png`, blob);
        }
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, "split-images.zip");
      showToast({ message: `${rows * cols} tiles created!`, type: "success" });
    } catch (err) {
      showToast({ message: "Error: " + err.message, type: "error" });
    } finally {
      processing.style.display = "none";
    }
  });
}

export function destroy() {}
