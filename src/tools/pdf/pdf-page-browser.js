import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { renderAllPages } from "./pdf-utils.js";

/**
 * Factory for PDF page-browser tools. Mounts a single-file PDF uploader
 * + an options shell with a primary action button, renders the PDF's
 * pages into canvases, and provides helpers for processing state and
 * cleanup.
 *
 * The tool supplies:
 * - optionsHTML — inner content of the options area. Must include the
 *   action button (any id); pass `actionButtonSelector` to target it.
 * - styleCSS — tool-specific CSS to inject
 * - onPagesLoaded(canvases, api) — render the pages using tool-specific UI
 * - onAction(api) — handle the action button click (validation + work)
 * - onReset() — clear tool-specific state on "Change File"
 *
 * @returns {{ api: { canvases, file, showProcessing, hideProcessing, setProcessingText }, destroy: () => void }}
 */
export function createPdfPageBrowser({
  container,
  optionsHTML,
  styleCSS,
  actionButtonSelector,
  renderScale = 0.75,
  initialProcessingMessage = "Processing PDF...",
  onPagesLoaded,
  onAction,
  onReset
}) {
  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        ${optionsHTML}
        <button class="btn btn-secondary" id="change-file-btn" style="margin-top:var(--space-2);">Change File</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p id="processing-text">${initialProcessingMessage}</p>
      </div>
    </div>
  `;

  const $ = sel => container.querySelector(sel);
  const uploadArea = $("#upload-area");
  const optionsArea = $("#options-area");
  const changeFileBtn = $("#change-file-btn");
  const processing = $("#processing");
  const processingText = $("#processing-text");
  const actionBtn = $(actionButtonSelector);

  const style = document.createElement("style");
  style.textContent = styleCSS;
  container.appendChild(style);

  let currentFile = null;
  let pageCanvases = [];

  const api = {
    get canvases() {
      return pageCanvases;
    },
    get file() {
      return currentFile;
    },
    showProcessing(msg) {
      processingText.textContent = msg ?? initialProcessingMessage;
      processing.style.display = "block";
      if (actionBtn) actionBtn.style.display = "none";
    },
    hideProcessing() {
      processing.style.display = "none";
      if (actionBtn) actionBtn.style.display = "inline-flex";
    },
    setProcessingText(msg) {
      processingText.textContent = msg;
    }
  };

  const upload = createFileUpload({
    accept: ".pdf",
    multiple: false,
    maxSizeMB: 100,
    onFilesSelected: async files => {
      const file = files[0];
      if (!file) return;
      currentFile = file;
      try {
        const canvases = await renderAllPages(currentFile, renderScale);
        pageCanvases = canvases.filter(c => c instanceof HTMLCanvasElement);
        optionsArea.style.display = "block";
        uploadArea.style.display = "none";
        if (onPagesLoaded) await onPagesLoaded(pageCanvases, api);
      } catch (err) {
        showToast({ message: "Failed to load PDF: " + err.message, type: "error" });
      }
    }
  });
  uploadArea.appendChild(upload.element);

  changeFileBtn.addEventListener("click", () => {
    upload.clear();
    currentFile = null;
    pageCanvases = [];
    optionsArea.style.display = "none";
    uploadArea.style.display = "";
    if (onReset) onReset();
  });

  if (actionBtn && onAction) {
    actionBtn.addEventListener("click", async () => {
      if (!currentFile) return;
      await onAction(api);
    });
  }

  return {
    api,
    destroy() {
      if (style) style.remove();
      pageCanvases = [];
    }
  };
}
