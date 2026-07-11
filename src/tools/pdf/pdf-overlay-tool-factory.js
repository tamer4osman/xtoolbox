import { createFileUpload } from "../../components/file-upload.js";
import { loadPdf, savePdf } from "./pdf-utils.js";

export function createPdfOverlayTool({ container, optionsHtml, onApply }) {
  let currentFile = null;

  const upload = createFileUpload({
    accept: ".pdf",
    multiple: false,
    maxSizeMB: 100,
    onFilesSelected: files => {
      currentFile = files[0] || null;
      optionsArea.style.display = currentFile ? "block" : "none";
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        ${optionsHtml}
        <button class="btn btn-primary btn-lg" id="apply-btn" style="width:100%;"></button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Processing...</p></div>
    </div>
  `;

  container.querySelector("#upload-area").appendChild(upload.element);
  const optionsArea = container.querySelector("#options-area");
  const applyBtn = container.querySelector("#apply-btn");
  const processing = container.querySelector("#processing");

  return {
    getFile: () => currentFile,
    optionsArea,
    applyBtn,
    processing,
    async process(filename, processFn) {
      if (!currentFile) return;
      processing.style.display = "block";
      applyBtn.style.display = "none";
      try {
        const pdfDoc = await loadPdf(currentFile);
        await processFn(pdfDoc);
        await savePdf(pdfDoc, filename);
      } finally {
        processing.style.display = "none";
        applyBtn.style.display = "inline-flex";
      }
    }
  };
}
