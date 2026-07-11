import { PDFDocument } from "pdf-lib";
import { showToast } from "../../components/toast.js";
import { downloadBlob } from "../../utils/file.js";
import { loadPdf, copyPages } from "./pdf-utils.js";
import { createPdfPreview } from "./pdf-preview.js";
import { createPdfPreviewTool } from "./pdf-preview-tool-factory.js";

export const toolConfig = {
  id: "split-pdf",
  name: "Split PDF",
  category: "pdf",
  description: "Extract specific pages or split a PDF into multiple files.",
  icon: "✂️",
  accept: ".pdf",
  maxSizeMB: 100,
  keywords: ["split pdf", "extract pages", "separate pdf"],
  steps: [
    "Upload a PDF file",
    "Select the pages you want to extract",
    'Click "Extract Selected Pages"',
    "Download the new PDF"
  ],
  faqs: [
    {
      question: "Can I extract non-consecutive pages?",
      answer: "Yes. Select any combination of pages using the checkboxes."
    },
    {
      question: "Does splitting reduce quality?",
      answer: "No. The extracted pages maintain the exact same quality as the original."
    }
  ]
};

export function render(container) {
  const { getFile, optionsArea, previewContainer, processing } = createPdfPreviewTool({
    container,
    async onFileLoaded(file) {
      preview = await createPdfPreview({
        file,
        selectable: true,
        onSelectionChange: selected => {
          extractBtn.textContent = `Extract ${selected.length} Page${selected.length !== 1 ? "s" : ""}`;
          extractBtn.disabled = selected.length === 0;
        }
      });
      previewContainer.innerHTML = "";
      previewContainer.appendChild(preview.element);
    }
  });

  let preview = null;

  optionsArea.innerHTML = `
    <div id="preview-container"></div>
    <button class="btn btn-primary btn-lg" id="extract-btn" style="width:100%;" disabled>Extract 0 Pages</button>
  `;

  optionsArea.querySelector("#preview-container").replaceWith(previewContainer);
  const extractBtn = optionsArea.querySelector("#extract-btn");

  extractBtn.addEventListener("click", async () => {
    const file = getFile();
    if (!file || !preview) return;
    const selected = preview.getSelectedPages();
    if (selected.length === 0) return;

    processing.style.display = "block";
    extractBtn.style.display = "none";
    try {
      const srcDoc = await loadPdf(file);
      const newDoc = await PDFDocument.create();
      await copyPages(srcDoc, newDoc, selected);
      const bytes = await newDoc.save();
      downloadBlob(new Blob([bytes], { type: "application/pdf" }), "extracted-pages.pdf");
      showToast({ message: `${selected.length} page(s) extracted!`, type: "success" });
    } catch (err) {
      showToast({ message: "Error: " + err.message, type: "error" });
    } finally {
      processing.style.display = "none";
      extractBtn.style.display = "inline-flex";
    }
  });
}

export function destroy() {}
