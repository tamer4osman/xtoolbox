import { createFileUpload } from "../../components/file-upload.js";
import { loadImageFromFile, canvasToBlob } from "./image-utils.js";
import { downloadBlob } from "../../utils/file.js";
import { showToast } from "../../components/toast.js";

/**
 * Factory for image transform tools (Pattern A: full scaffold).
 *
 * Handles the shared chrome:
 * - File upload (single or multi)
 * - HTML scaffold (upload / options / preview / processing)
 * - State: originalImage (single) or images[] (multi)
 * - Download button: spinner + format/quality + filename + toast
 * - Slider event wiring via bindOptionChange helper
 *
 * Tools provide:
 * - optionsHTML: form controls
 * - optionsCSS: scoped styles
 * - renderPreview({ state, container }): draw preview canvas
 * - processForDownload({ state, canvas }): draw full-size for download
 * - getFilename, getFormat, getQuality: per-download values
 */
export function createImageTool({
  container,
  toolId,
  accept = "image/*",
  multiple = false,
  maxSizeMB = 50,
  optionsHTML = "",
  optionsCSS = "",
  processingMessage = "Processing...",
  successMessage = "Done!",
  getFilename,
  getFormat,
  getQuality,
  renderPreview = () => {},
  processForDownload = () => {},
  onImageLoaded = null
}) {
  const state = multiple ? { images: [] } : { originalImage: null };

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="${toolId}-upload-area"></div>
      <div class="tool-options" id="${toolId}-options" style="display:none;">
        <div class="tool-count-info" id="${toolId}-count-info">-</div>
        ${optionsHTML}
        <button class="btn btn-primary btn-lg" id="${toolId}-download-btn" style="width:100%;">Download</button>
      </div>
      <div class="tool-preview" id="${toolId}-preview" style="display:none;">
        <h3>Preview</h3>
        <canvas id="${toolId}-preview-canvas" class="tool-preview-canvas" style="width:100%;max-width:600px;border:1px solid var(--color-border);border-radius:var(--radius-lg);"></canvas>
      </div>
      <div class="tool-processing" id="${toolId}-processing" style="display:none;">
        <div class="spinner"></div>
        <p>${processingMessage}</p>
      </div>
    </div>
  `;

  if (optionsCSS) {
    const style = document.createElement("style");
    style.textContent = optionsCSS;
    container.appendChild(style);
  }

  const elements = {
    uploadArea: container.querySelector(`#${toolId}-upload-area`),
    optionsArea: container.querySelector(`#${toolId}-options`),
    countInfo: container.querySelector(`#${toolId}-count-info`),
    previewArea: container.querySelector(`#${toolId}-preview`),
    previewCanvas: container.querySelector(`#${toolId}-preview-canvas`),
    processing: container.querySelector(`#${toolId}-processing`),
    downloadBtn: container.querySelector(`#${toolId}-download-btn`),
    showOptions() {
      elements.optionsArea.style.display = "block";
      elements.previewArea.style.display = "block";
    }
  };

  const upload = createFileUpload({
    accept,
    multiple,
    maxSizeMB,
    onFilesSelected: async files => {
      if (multiple) {
        state.images = [];
        for (const f of files) {
          const img = await loadImageFromFile(f);
          state.images.push(img);
        }
        elements.countInfo.textContent = `${state.images.length} photo${state.images.length !== 1 ? "s" : ""} loaded`;
      } else {
        state.originalImage = await loadImageFromFile(files[0]);
        elements.countInfo.textContent = `${state.originalImage.naturalWidth}×${state.originalImage.naturalHeight}px`;
      }
      elements.showOptions();
      if (onImageLoaded) onImageLoaded({ state, container, elements });
      renderPreview({ state, container, elements });
    }
  });
  elements.uploadArea.appendChild(upload.element);

  elements.downloadBtn.addEventListener("click", async () => {
    elements.processing.style.display = "block";
    elements.downloadBtn.disabled = true;
    try {
      const canvas = document.createElement("canvas");
      processForDownload({ state, canvas, elements });
      const blob = await canvasToBlob(canvas, getFormat(), getQuality());
      downloadBlob(blob, getFilename());
      showToast(successMessage, "success");
    } catch (err) {
      showToast("Error: " + err.message, "error");
    } finally {
      elements.processing.style.display = "none";
      elements.downloadBtn.disabled = false;
    }
  });

  function bindOptionChange({ rangeId, valueId, formatValue = v => v, onChange = null }) {
    const range = container.querySelector(`#${rangeId}`);
    const val = container.querySelector(`#${valueId}`);
    if (!range || !val) return;
    range.addEventListener("input", () => {
      val.textContent = formatValue(range.value);
      if (onChange) onChange(range.value);
      renderPreview({ state, container, elements });
    });
  }

  return {
    state,
    elements,
    bindOptionChange,
    renderPreview: () => renderPreview({ state, container, elements })
  };
}
