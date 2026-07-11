import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { downloadBlob } from "../../utils/file.js";
import { loadImageFromFile, canvasToBlob } from "./image-utils.js";

export const toolConfig = {
  id: "panorama-stitcher",
  name: "Panorama Stitcher",
  category: "image",
  description: "Stitch multiple photos into a panoramic image with automatic overlap detection.",
  icon: "🏔️",
  accept: "image/*",
  maxSizeMB: 50,
  keywords: ["panorama", "stitch", "photo", "merge", "wide", "landscape"],
  steps: [
    "Upload 2-10 overlapping photos",
    "Reorder by dragging or using arrow buttons",
    "Stitch into panorama",
    "Download result"
  ],
  faqs: [
    { question: "How many photos can I stitch?", answer: "Up to 10 photos at once." },
    {
      question: "What kind of photos work best?",
      answer:
        "Photos with 20-40% overlap between adjacent shots, taken from roughly the same position."
    }
  ]
};

const STRIP_WIDTH_RATIO = 0.15;
const DOWNSCALE = 0.1;
const SEARCH_STEP = 4;

function getGrayscaleStrip(img, side) {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const sw = Math.max(1, Math.round(w * STRIP_WIDTH_RATIO));
  const sh = Math.max(1, Math.round(h * DOWNSCALE));
  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");
  const sx = side === "right" ? w - sw : 0;
  ctx.drawImage(img, sx, 0, sw, h, 0, 0, sw, sh);
  const data = ctx.getImageData(0, 0, sw, sh).data;
  const gray = new Float32Array(sw * sh);
  for (let i = 0; i < gray.length; i++) {
    const p = i * 4;
    gray[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
  }
  return { gray, width: sw, height: sh };
}

function computeMSE(grayA, grayB, offsetX, height) {
  const wA = grayA.width;
  const wB = grayB.width;
  let sum = 0;
  let count = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < wA; x++) {
      const bX = offsetX + x;
      if (bX < 0 || bX >= wB) continue;
      const diff = grayA[y * wA + x] - grayB[y * wB + bX];
      sum += diff * diff;
      count++;
    }
  }
  return count > 0 ? sum / count : Infinity;
}

export function detectOverlap(imgA, imgB) {
  const stripA = getGrayscaleStrip(imgA, "right");
  const stripB = getGrayscaleStrip(imgB, "left");
  const maxSearch = stripB.width;
  let bestScore = Infinity;
  let bestX = 0;
  for (let x = 0; x < maxSearch; x += SEARCH_STEP) {
    const score = computeMSE(stripA.gray, stripB.gray, x, stripA.height);
    if (score < bestScore) {
      bestScore = score;
      bestX = x;
    }
  }
  if (bestScore < 800) {
    return Math.round(bestX / DOWNSCALE);
  }
  const overlapRatio = bestX / stripB.width;
  if (overlapRatio > 0.05 && overlapRatio < 0.8) {
    return Math.round(bestX / DOWNSCALE);
  }
  return Math.round(imgA.naturalWidth * 0.3);
}

export function stitchPanorama(images, overlaps, blendMode = "gradient") {
  const n = images.length;
  const maxH = Math.max(...images.map(i => i.naturalHeight));
  let totalW = images[0].naturalWidth;
  for (let i = 1; i < n; i++) {
    totalW += images[i].naturalWidth - (overlaps[i - 1] || 0);
  }
  const canvas = document.createElement("canvas");
  canvas.width = totalW;
  canvas.height = maxH;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, totalW, maxH);
  const positions = [];
  let x = 0;
  for (let i = 0; i < n; i++) {
    const overlap = i > 0 ? overlaps[i - 1] || 0 : 0;
    const drawX = x - overlap;
    positions.push({ x: drawX, overlap });
    ctx.drawImage(images[i], drawX, 0);
    x += images[i].naturalWidth - overlap;
  }
  if (blendMode === "gradient") {
    for (let i = 1; i < n; i++) {
      const overlap = overlaps[i - 1] || 0;
      if (overlap <= 0) continue;
      const blendWidth = Math.min(overlap, 50);
      const imgW = images[i].naturalWidth;
      const imgX = positions[i].x;
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = imgW;
      maskCanvas.height = maxH;
      const maskCtx = maskCanvas.getContext("2d");
      const grad = maskCtx.createLinearGradient(0, 0, blendWidth * 2, 0);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,1)");
      maskCtx.fillStyle = "rgba(0,0,0,1)";
      maskCtx.fillRect(blendWidth * 2, 0, imgW - blendWidth * 2, maxH);
      maskCtx.fillStyle = grad;
      maskCtx.fillRect(0, 0, blendWidth * 2, maxH);
      maskCtx.globalCompositeOperation = "source-in";
      maskCtx.drawImage(images[i], 0, 0);
      ctx.drawImage(maskCanvas, imgX, 0);
    }
  }
  return canvas;
}

function swapItems(arr, from, to) {
  const item = arr.splice(from, 1)[0];
  arr.splice(to, 0, item);
}

const objectUrls = [];

function cleanupUrls() {
  for (const url of objectUrls) URL.revokeObjectURL(url);
  objectUrls.length = 0;
}

export function render(container) {
  let images = [];
  let overlaps = [];
  let stitching = false;

  const upload = createFileUpload({
    accept: "image/*",
    multiple: true,
    maxSizeMB: 50,
    maxFiles: 10,
    onFilesSelected: async files => {
      cleanupUrls();
      images = [];
      for (const f of files) {
        const url = URL.createObjectURL(f);
        objectUrls.push(url);
        const img = await loadImageFromFile(f);
        images.push(img);
      }
      overlaps = [];
      for (let i = 1; i < images.length; i++) {
        overlaps.push(detectOverlap(images[i - 1], images[i]));
      }
      countInfo.textContent = `${images.length} photos loaded`;
      optionsArea.style.display = images.length >= 2 ? "block" : "none";
      previewArea.style.display = "none";
      renderThumbnails();
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="pano-upload-area"></div>
      <div class="tool-options" id="pano-options" style="display:none;">
        <div style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);" id="pano-count-info">-</div>
        <div class="form-group">
          <label>Photo Order (drag or use arrow buttons)</label>
          <div id="pano-thumbnails" style="display:flex;gap:8px;flex-wrap:wrap;min-height:60px;border:1px dashed var(--color-border);border-radius:var(--radius-md);padding:8px;"></div>
        </div>
        <div class="form-group">
          <label>Blend Mode</label>
          <select id="pano-blend" class="select-input">
            <option value="gradient">Gradient Blend</option>
            <option value="none">No Blend (sharp seam)</option>
          </select>
        </div>
        <button class="btn btn-primary btn-lg" id="pano-stitch-btn" style="width:100%;">Stitch Panorama</button>
      </div>
      <div class="tool-preview" id="pano-preview" style="display:none;">
        <h3>Preview</h3>
        <canvas id="pano-preview-canvas" class="tool-preview-canvas" style="width:100%;max-width:800px;border:1px solid var(--color-border);border-radius:var(--radius-lg);"></canvas>
      </div>
      <div class="tool-processing" id="pano-processing" style="display:none;">
        <div class="spinner"></div>
        <p>Stitching panorama...</p>
      </div>
    </div>
  `;

  container.querySelector("#pano-upload-area").appendChild(upload.element);
  const optionsArea = container.querySelector("#pano-options");
  const countInfo = container.querySelector("#pano-count-info");
  const previewArea = container.querySelector("#pano-preview");
  const stitchBtn = container.querySelector("#pano-stitch-btn");
  const processing = container.querySelector("#pano-processing");

  function moveImage(from, to) {
    if (from < 0 || from >= images.length || to < 0 || to >= images.length) return;
    swapItems(images, from, to);
    overlaps = [];
    for (let i = 1; i < images.length; i++) {
      overlaps.push(detectOverlap(images[i - 1], images[i]));
    }
    renderThumbnails();
  }

  function renderThumbnails() {
    const strip = container.querySelector("#pano-thumbnails");
    strip.innerHTML = "";
    images.forEach((img, i) => {
      const thumb = document.createElement("div");
      thumb.draggable = true;
      thumb.dataset.index = i;
      thumb.setAttribute("role", "listitem");
      thumb.setAttribute("aria-label", `Photo ${i + 1} of ${images.length}`);
      thumb.style.cssText =
        "position:relative;cursor:grab;border:2px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;flex-shrink:0;display:flex;flex-direction:column;";
      const canvas = document.createElement("canvas");
      const maxDim = 80;
      const scale = Math.min(maxDim / img.naturalWidth, maxDim / img.naturalHeight, 1);
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.style.cssText = "display:block;width:100%;height:100%;object-fit:cover;";
      const label = document.createElement("div");
      label.textContent = i + 1;
      label.style.cssText =
        "position:absolute;top:2px;left:4px;font-size:11px;background:rgba(0,0,0,0.6);color:#fff;border-radius:3px;padding:1px 4px;";
      const btns = document.createElement("div");
      btns.style.cssText =
        "display:flex;justify-content:center;gap:2px;padding:2px;background:var(--color-surface);";
      const upBtn = document.createElement("button");
      upBtn.className = "btn btn-sm";
      upBtn.textContent = "\u25C0";
      upBtn.title = "Move left";
      upBtn.setAttribute("aria-label", `Move photo ${i + 1} left`);
      upBtn.disabled = i === 0;
      upBtn.addEventListener("click", e => {
        e.stopPropagation();
        moveImage(i, i - 1);
      });
      const downBtn = document.createElement("button");
      downBtn.className = "btn btn-sm";
      downBtn.textContent = "\u25B6";
      downBtn.title = "Move right";
      downBtn.setAttribute("aria-label", `Move photo ${i + 1} right`);
      downBtn.disabled = i === images.length - 1;
      downBtn.addEventListener("click", e => {
        e.stopPropagation();
        moveImage(i, i + 1);
      });
      btns.appendChild(upBtn);
      btns.appendChild(downBtn);
      thumb.appendChild(canvas);
      thumb.appendChild(label);
      thumb.appendChild(btns);
      thumb.addEventListener("dragstart", e => {
        e.dataTransfer.setData("text/plain", i);
        thumb.style.opacity = "0.4";
      });
      thumb.addEventListener("dragend", () => {
        thumb.style.opacity = "1";
      });
      thumb.addEventListener("dragover", e => {
        e.preventDefault();
        thumb.style.borderColor = "var(--color-primary)";
      });
      thumb.addEventListener("dragleave", () => {
        thumb.style.borderColor = "var(--color-border)";
      });
      thumb.addEventListener("drop", e => {
        e.preventDefault();
        thumb.style.borderColor = "var(--color-border)";
        const from = parseInt(e.dataTransfer.getData("text/plain"));
        if (from !== i) moveImage(from, i);
      });
      strip.appendChild(thumb);
    });
  }

  stitchBtn.addEventListener("click", async () => {
    if (images.length < 2 || stitching) return;
    stitching = true;
    processing.style.display = "block";
    stitchBtn.disabled = true;
    try {
      const blendMode = container.querySelector("#pano-blend").value;
      const result = stitchPanorama(images, overlaps, blendMode);
      const previewCanvas = container.querySelector("#pano-preview-canvas");
      const maxPreviewW = 800;
      const scale = Math.min(maxPreviewW / result.width, 1);
      previewCanvas.width = Math.round(result.width * scale);
      previewCanvas.height = Math.round(result.height * scale);
      previewCanvas
        .getContext("2d")
        .drawImage(result, 0, 0, previewCanvas.width, previewCanvas.height);
      previewArea.style.display = "block";
      const existing = previewArea.querySelector(".pano-dl-btn");
      if (existing) existing.remove();
      const dlBtn = document.createElement("button");
      dlBtn.className = "btn btn-primary btn-lg pano-dl-btn";
      dlBtn.style.cssText = "width:100%;margin-top:12px;";
      dlBtn.textContent = "Download Panorama";
      dlBtn.addEventListener("click", async () => {
        const blob = await canvasToBlob(result, "image/png");
        downloadBlob(blob, "panorama.png");
        showToast("Panorama saved!", "success");
      });
      previewArea.appendChild(dlBtn);
      showToast("Panorama stitched!", "success");
    } catch (err) {
      showToast("Error: " + err.message, "error");
    } finally {
      processing.style.display = "none";
      stitchBtn.disabled = false;
      stitching = false;
    }
  });
}

export function destroy() {
  cleanupUrls();
}
