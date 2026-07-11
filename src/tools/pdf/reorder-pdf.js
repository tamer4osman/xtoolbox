import { PDFDocument } from "pdf-lib";
import { showToast } from "../../components/toast.js";
import { loadPdf, savePdf, copyPages } from "./pdf-utils.js";
import { createPdfPreview } from "./pdf-preview.js";
import { createPdfPreviewTool } from "./pdf-preview-tool-factory.js";

export const toolConfig = {
  id: "reorder-pdf",
  name: "Reorder PDF Pages",
  category: "pdf",
  description: "Drag and drop to reorder pages in a PDF.",
  icon: "↕️",
  accept: ".pdf",
  maxSizeMB: 100,
  keywords: ["reorder pdf", "arrange pdf pages", "sort pdf pages"],
  steps: ["Upload a PDF file", "Drag pages to reorder them", 'Click "Download Reordered PDF"'],
  faqs: [
    {
      question: "Can I remove pages while reordering?",
      answer: "Use the Split PDF tool to extract specific pages first."
    }
  ]
};

export function render(container) {
  const { getFile, optionsArea, previewContainer, processing } = createPdfPreviewTool({
    container,
    async onFileLoaded(file) {
      preview = await createPdfPreview({
        file,
        reorderable: true,
        onReorder: () => {
          showToast({ message: "Page order updated", type: "info", duration: 1500 });
        }
      });
      previewContainer.innerHTML = "";
      previewContainer.appendChild(preview.element);
    }
  });

  let preview = null;

  optionsArea.innerHTML = `
    <p style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">Drag and drop pages to reorder them.</p>
    <div id="preview-container"></div>
    <button class="btn btn-primary btn-lg" id="save-btn" style="width:100%;margin-top:var(--space-4);">Download Reordered PDF</button>
  `;

  optionsArea.querySelector("#preview-container").replaceWith(previewContainer);
  const saveBtn = optionsArea.querySelector("#save-btn");

  saveBtn.addEventListener("click", async () => {
    const file = getFile();
    if (!file || !preview) return;
    processing.style.display = "block";
    try {
      const srcDoc = await loadPdf(file);
      const newDoc = await PDFDocument.create();
      await copyPages(srcDoc, newDoc, preview.getPageOrder());
      await savePdf(newDoc, "reordered.pdf");
      showToast({ message: "PDF reordered!", type: "success" });
    } catch (err) {
      showToast({ message: "Error: " + err.message, type: "error" });
    } finally {
      processing.style.display = "none";
    }
  });
}

export function destroy() {}
