import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { downloadBlob } from "../../utils/file.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const toolConfig = {
  id: "remove-watermark-pdf",
  name: "Remove Watermark from PDF",
  category: "pdf",
  description: "Remove overlay watermarks from PDF pages.",
  icon: "",
  accept: ".pdf",
  maxSizeMB: 50,
  keywords: ["remove watermark pdf", "delete watermark", "clean pdf", "watermark remover"],
  steps: [
    "Upload a PDF file",
    "Draw rectangles around watermark areas on the preview",
    'Click "Remove Watermarks"',
    "Download the cleaned PDF"
  ],
  faqs: [
    { question: "What formats supported?", answer: "We support PDF files up to 50MB." },
    {
      question: "How does it work?",
      answer: "Draw rectangles around watermark areas. Those areas will be removed from all pages."
    },
    {
      question: "Does it work on all watermarks?",
      answer:
        "Works best on text watermarks and simple image watermarks. Complex watermarks may leave artifacts."
    }
  ]
};

let watermarkRegions = [];
let isDrawing = false;
let startX, startY, endX, endY;
let previewCanvas, previewCtx;
let currentPdf = null;
let currentPageNum = 1;
let pdfDoc = null;

function renderPreview(pageNum) {
  return new Promise(async resolve => {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });

    previewCanvas.width = viewport.width;
    previewCanvas.height = viewport.height;

    const ctx = previewCanvas.getContext("2d");
    await page.render({ canvasContext: ctx, viewport }).promise;

    // Draw watermark regions overlay
    drawWatermarkRegions(viewport.width, viewport.height);

    resolve();
  });
}

function drawWatermarkRegions(canvasWidth, canvasHeight) {
  const ctx = previewCanvas.getContext("2d");

  // Redraw the base image (we need to keep a copy)
  // For simplicity, we'll just draw the regions on top
  // In a real implementation, we'd keep a copy of the base image

  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);

  for (const region of watermarkRegions) {
    const x = (region.x / 100) * canvasWidth;
    const y = (region.y / 100) * canvasHeight;
    const w = (region.width / 100) * canvasWidth;
    const h = (region.height / 100) * canvasHeight;

    ctx.fillStyle = "rgba(239, 68, 68, 0.2)";
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
  }

  ctx.setLineDash([]);
}

function setupCanvasInteraction() {
  previewCanvas.addEventListener("mousedown", e => {
    isDrawing = true;
    const rect = previewCanvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
  });

  previewCanvas.addEventListener("mousemove", e => {
    if (!isDrawing) return;

    const rect = previewCanvas.getBoundingClientRect();
    endX = e.clientX - rect.left;
    endY = e.clientY - rect.top;

    // Redraw preview and current selection
    renderPreview(currentPageNum).then(() => {
      const ctx = previewCanvas.getContext("2d");
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(startX, startY, endX - startX, endY - startY);
      ctx.setLineDash([]);
    });
  });

  previewCanvas.addEventListener("mouseup", e => {
    if (!isDrawing) return;
    isDrawing = false;

    const rect = previewCanvas.getBoundingClientRect();
    endX = e.clientX - rect.left;
    endY = e.clientY - rect.top;

    // Calculate region in percentage
    const x = (Math.min(startX, endX) / rect.width) * 100;
    const y = (Math.min(startY, endY) / rect.height) * 100;
    const width = (Math.abs(endX - startX) / rect.width) * 100;
    const height = (Math.abs(endY - startY) / rect.height) * 100;

    if (width > 1 && height > 1) {
      watermarkRegions.push({ x, y, width, height });
      updateRegionList();
      renderPreview(currentPageNum);
    }
  });
}

function updateRegionList() {
  const list = document.querySelector("#watermark-regions");
  if (!list) return;

  list.innerHTML = "";
  watermarkRegions.forEach((region, idx) => {
    const item = document.createElement("div");
    item.className = "region-item";
    item.innerHTML = `
      <span>Region ${idx + 1}: ${Math.round(region.width)}% × ${Math.round(region.height)}%</span>
      <button class="btn btn-sm btn-danger" data-idx="${idx}">Remove</button>
    `;
    list.appendChild(item);
  });

  list.querySelectorAll(".btn-danger").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.idx);
      watermarkRegions.splice(idx, 1);
      updateRegionList();
      renderPreview(currentPageNum);
    });
  });
}

async function removeWatermarks() {
  if (watermarkRegions.length === 0) {
    showToast({ message: "Please draw at least one watermark region.", type: "warning" });
    return;
  }

  const processing = document.querySelector("#processing");
  const convertBtn = document.querySelector("#convert-btn");
  const progressPct = document.querySelector("#progress-pct");

  processing.style.display = "block";
  convertBtn.style.display = "none";

  try {
    const arrayBuffer = await currentPdf.arrayBuffer();
    const srcDoc = await PDFDocument.load(arrayBuffer);
    const newDoc = await PDFDocument.create();

    const totalPages = srcDoc.getPageCount();

    for (let i = 0; i < totalPages; i++) {
      progressPct.textContent = Math.round(((i + 1) / totalPages) * 80);

      const page = await srcDoc.getPage(i + 1);
      const { width, height } = page.getSize();

      // Render page to canvas
      const pdfPage = await pdfDoc.getPage(i + 1);
      const scale = 2; // Higher quality
      const viewport = pdfPage.getViewport({ scale });

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");

      await pdfPage.render({ canvasContext: ctx, viewport }).promise;

      // Remove watermark regions
      for (const region of watermarkRegions) {
        const x = (region.x / 100) * canvas.width;
        const y = (region.y / 100) * canvas.height;
        const w = (region.width / 100) * canvas.width;
        const h = (region.height / 100) * canvas.height;

        // Fill with white (assuming white background)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x, y, w, h);
      }

      // Convert canvas to PNG and embed in new PDF
      const pngData = canvas.toDataURL("image/png").split(",")[1];
      const pngBytes = Uint8Array.from(atob(pngData), c => c.charCodeAt(0));
      const pngImage = await newDoc.embedPng(pngBytes);

      const newPage = newDoc.addPage([width, height]);
      newPage.drawImage(pngImage, {
        x: 0,
        y: 0,
        width,
        height
      });
    }

    progressPct.textContent = "95";

    const bytes = await newDoc.save();
    const blob = new Blob([bytes], { type: "application/pdf" });
    const fileNameWithoutExt = currentPdf.name.replace(/\.pdf$/i, "");
    downloadBlob(blob, `${fileNameWithoutExt}_cleaned.pdf`);

    progressPct.textContent = "100";
    showToast({ message: `Watermarks removed from ${totalPages} page(s).`, type: "success" });
  } catch (err) {
    showToast({ message: "Error: " + err.message, type: "error" });
  } finally {
    processing.style.display = "none";
    convertBtn.style.display = "inline-flex";
  }
}

export function render(container) {
  watermarkRegions = [];
  currentPdf = null;

  const upload = createFileUpload({
    accept: ".pdf",
    multiple: false,
    maxSizeMB: 50,
    onFilesSelected: files => {
      if (files.length > 0) {
        currentPdf = files[0];
        fileName.textContent = files[0].name;
        fileInfo.textContent = (files[0].size / 1024 / 1024).toFixed(2) + " MB";
        filePanel.style.display = "block";
        convertBtn.style.display = "inline-flex";
        previewContainer.style.display = "block";
        regionListContainer.style.display = "block";

        // Load PDF for preview
        files[0].arrayBuffer().then(async buffer => {
          pdfDoc = await pdfjsLib.getDocument({ data: buffer }).promise;
          currentPageNum = 1;
          await renderPreview(currentPageNum);
        });
      }
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="file-info-panel" id="file-panel" style="display:none;margin:var(--space-4) 0;">
        <div class="file-details">
          <span class="file-icon"></span>
          <div class="file-details-text">
            <div class="file-name" id="file-name"></div>
            <div class="file-size" id="file-info"></div>
          </div>
        </div>
      </div>
      <div class="preview-container" id="preview-container" style="display:none;margin:var(--space-4) 0;">
        <p class="preview-instructions">Draw rectangles around watermark areas on the preview:</p>
        <canvas id="preview-canvas" style="max-width:100%;border:1px solid var(--color-border);border-radius:var(--radius-md);cursor:crosshair;"></canvas>
      </div>
      <div class="region-list" id="region-list-container" style="display:none;margin:var(--space-4) 0;">
        <h3>Watermark Regions</h3>
        <div id="watermark-regions"></div>
        <button class="btn btn-secondary btn-sm" id="clear-regions-btn" style="margin-top:var(--space-2);">Clear All Regions</button>
      </div>
      <button class="btn btn-primary btn-lg" id="convert-btn" style="display:none;width:100%;">Remove Watermarks</button>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p>Removing watermarks... <span id="progress-pct">0</span>%</p>
      </div>
    </div>
    <style>
      .file-info-panel { background:var(--color-surface);padding:var(--space-4);border-radius:var(--radius-lg); }
      .file-details { display:flex;align-items:center;gap:var(--space-4); }
      .file-icon { font-size:32px; }
      .file-name { font-weight:600; }
      .file-size { font-size:var(--text-sm);color:var(--color-text-secondary); }
      .preview-container { text-align:center; }
      .preview-instructions { margin-bottom:var(--space-3);color:var(--color-text-secondary); }
      .region-list { background:var(--color-surface);padding:var(--space-4);border-radius:var(--radius-lg); }
      .region-item { display:flex;justify-content:space-between;align-items:center;padding:var(--space-2) 0;border-bottom:1px solid var(--color-border); }
      .region-item:last-child { border-bottom:none; }
    </style>
  `;

  container.querySelector("#upload-area").appendChild(upload.element);

  previewCanvas = container.querySelector("#preview-canvas");
  previewCtx = previewCanvas.getContext("2d");

  const convertBtn = container.querySelector("#convert-btn");
  const processing = container.querySelector("#processing");
  const progressPct = container.querySelector("#progress-pct");
  const filePanel = container.querySelector("#file-panel");
  const fileName = container.querySelector("#file-name");
  const fileInfo = container.querySelector("#file-info");
  const previewContainer = container.querySelector("#preview-container");
  const regionListContainer = container.querySelector("#region-list-container");

  setupCanvasInteraction();

  container.querySelector("#clear-regions-btn").addEventListener("click", () => {
    watermarkRegions = [];
    updateRegionList();
    renderPreview(currentPageNum);
  });

  convertBtn.addEventListener("click", async () => {
    await removeWatermarks();
  });
}

export function destroy() {
  watermarkRegions = [];
  currentPdf = null;
  pdfDoc = null;
}
