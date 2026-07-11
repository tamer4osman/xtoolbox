import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { downloadBlob } from "../../utils/file.js";

const STYLES = `
  .tool-options { background:var(--color-surface);padding:var(--space-4);border-radius:var(--radius-lg);margin:var(--space-4) 0; }
  .tool-processing { display:flex;flex-direction:column;align-items:center;gap:var(--space-3);padding:var(--space-4); }
`;

export function createPdfOptionsTool({
  container,
  toolId,
  accept = ".pdf",
  maxSizeMB = 100,
  optionsHTML = "",
  actionButtonText = "Run",
  processingMessage = "Working...",
  outputFilename = "output.pdf",
  successMessage = "Done!",
  validate,
  process
}) {
  let currentFile = null;

  const upload = createFileUpload({
    accept,
    multiple: false,
    maxSizeMB,
    onFilesSelected: files => {
      currentFile = files[0] || null;
      optionsArea.style.display = currentFile ? "block" : "none";
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="${toolId}-upload-area"></div>
      <div class="tool-options" id="${toolId}-options-area" style="display:none;">
        ${optionsHTML}
        <button class="btn btn-primary btn-lg" id="${toolId}-action-btn" style="width:100%;margin-top:var(--space-4);">${actionButtonText}</button>
      </div>
      <div class="tool-processing" id="${toolId}-processing" style="display:none;">
        <div class="spinner"></div>
        <p>${processingMessage}</p>
      </div>
    </div>
    <style>${STYLES}</style>
  `;

  container.querySelector(`#${toolId}-upload-area`).appendChild(upload.element);
  const optionsArea = container.querySelector(`#${toolId}-options-area`);
  const actionBtn = container.querySelector(`#${toolId}-action-btn`);
  const processing = container.querySelector(`#${toolId}-processing`);

  actionBtn.addEventListener("click", async () => {
    if (!currentFile) return;

    if (typeof validate === "function") {
      const err = validate(optionsArea);
      if (err) {
        showToast({ message: err, type: "warning" });
        return;
      }
    }

    processing.style.display = "block";
    actionBtn.style.display = "none";

    try {
      const result = await process(currentFile);
      let blob = null;
      let msg = successMessage;
      if (result instanceof Blob) {
        blob = result;
      } else if (result && typeof result === "object") {
        if (result.blob) blob = result.blob;
        if (result.successMessage) msg = result.successMessage;
      }
      if (blob) downloadBlob(blob, outputFilename);
      showToast({ message: msg, type: "success" });
    } catch (err) {
      showToast({ message: "Error: " + (err?.message || "Unknown error"), type: "error" });
    } finally {
      processing.style.display = "none";
      actionBtn.style.display = "inline-flex";
    }
  });

  return { optionsArea, actionBtn, processing };
}
