import { PDFDocument } from "pdf-lib";
import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { downloadBlob } from "../../utils/file.js";

export const toolConfig = {
  id: "pdf-metadata-viewer",
  name: "PDF Metadata Viewer",
  category: "pdf",
  description: "View and edit PDF metadata: title, author, creator, creation date, keywords.",
  icon: "ℹ️",
  accept: ".pdf",
  maxSizeMB: 100,
  keywords: ["pdf metadata", "pdf info", "pdf properties", "pdf details", "view pdf metadata"],
  steps: ["Upload a PDF file", "View metadata", "Edit if needed", "Download"],
  faqs: [
    {
      question: "Is there a file size limit?",
      answer: "You can view metadata for PDFs up to 100MB."
    },
    { question: "Is my file uploaded?", answer: "No. All processing happens in your browser." }
  ]
};

export function render(container) {
  let pdfDoc = null;
  let currentFile = null;

  const upload = createFileUpload({
    accept: ".pdf",
    multiple: false,
    maxSizeMB: 100,
    onFilesSelected: files => {
      if (files.length > 0) {
        currentFile = files[0];
        loadMetadata(files[0]);
      }
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div id="metadata-panel" style="display:none;">
        <div class="metadata-section">
          <h3>PDF Metadata</h3>
          <div class="form-group">
            <label>Title</label>
            <input type="text" id="meta-title" class="input" placeholder="Document title">
          </div>
          <div class="form-group">
            <label>Author</label>
            <input type="text" id="meta-author" class="input" placeholder="Author name">
          </div>
          <div class="form-group">
            <label>Subject</label>
            <input type="text" id="meta-subject" class="input" placeholder="Document subject">
          </div>
          <div class="form-group">
            <label>Keywords</label>
            <input type="text" id="meta-keywords" class="input" placeholder="Comma-separated keywords">
          </div>
          <div class="form-group">
            <label>Creator</label>
            <input type="text" id="meta-creator" class="input" placeholder="Creator application">
          </div>
          <div class="form-group">
            <label>Producer</label>
            <input type="text" id="meta-producer" class="input" placeholder="PDF producer" readonly>
          </div>
          <div class="form-group">
            <label>Creation Date</label>
            <input type="text" id="meta-creation-date" class="input" readonly>
          </div>
          <div class="form-group">
            <label>Modification Date</label>
            <input type="text" id="meta-mod-date" class="input" readonly>
          </div>
          <div class="form-group">
            <label>Page Count</label>
            <input type="text" id="meta-page-count" class="input" readonly>
          </div>
          <button class="btn btn-primary" id="save-btn" style="width:100%;margin-top:var(--space-4);">Save PDF with Metadata</button>
        </div>
      </div>
    </div>
    <style>
      .metadata-section { background:var(--color-surface);padding:var(--space-6);border-radius:var(--radius-lg); }
      .metadata-section h3 { margin-bottom:var(--space-4); }
      .form-group { margin-bottom:var(--space-4); }
      .form-group label { display:block;font-weight:600;margin-bottom:var(--space-2);font-size:var(--text-sm); }
      .form-group .input { width:100%;padding:var(--space-3);border:1px solid var(--color-border);border-radius:var(--radius-md);font-size:var(--text-base); }
    </style>
  `;

  container.querySelector("#upload-area").appendChild(upload.element);
  const metadataPanel = container.querySelector("#metadata-panel");

  async function loadMetadata(file) {
    try {
      const bytes = await file.arrayBuffer();
      pdfDoc = await PDFDocument.load(bytes);
      const meta = pdfDoc.getTitle() || "";
      const author = pdfDoc.getAuthor() || "";
      const subject = pdfDoc.getSubject() || "";
      const keywords = pdfDoc.getKeywords() || "";
      const creator = pdfDoc.getCreator() || "";
      const producer = pdfDoc.getProducer() || "";
      const creationDate = pdfDoc.getCreationDate();
      const modDate = pdfDoc.getModificationDate();
      const pageCount = pdfDoc.getPageCount();

      container.querySelector("#meta-title").value = meta;
      container.querySelector("#meta-author").value = author;
      container.querySelector("#meta-subject").value = subject;
      container.querySelector("#meta-keywords").value = keywords;
      container.querySelector("#meta-creator").value = creator;
      container.querySelector("#meta-producer").value = producer;
      container.querySelector("#meta-creation-date").value = creationDate
        ? creationDate.toISOString()
        : "Not set";
      container.querySelector("#meta-mod-date").value = modDate ? modDate.toISOString() : "Not set";
      container.querySelector("#meta-page-count").value = pageCount;

      metadataPanel.style.display = "block";
    } catch (err) {
      showToast({ message: "Error loading PDF: " + err.message, type: "error" });
    }
  }

  container.querySelector("#save-btn").addEventListener("click", async () => {
    if (!pdfDoc) return;
    try {
      pdfDoc.setTitle(container.querySelector("#meta-title").value);
      pdfDoc.setAuthor(container.querySelector("#meta-author").value);
      pdfDoc.setSubject(container.querySelector("#meta-subject").value);
      pdfDoc.setKeywords(
        container
          .querySelector("#meta-keywords")
          .value.split(",")
          .map(k => k.trim())
          .filter(k => k)
      );
      pdfDoc.setCreator(container.querySelector("#meta-creator").value || "ToolBox");
      pdfDoc.setProducer("ToolBox PDF Metadata Editor");
      pdfDoc.setModificationDate(new Date());

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const filename =
        currentFile?.name?.replace(".pdf", "-with-metadata.pdf") || "pdf-with-metadata.pdf";
      downloadBlob(blob, filename);
      showToast({ message: "PDF saved with updated metadata!", type: "success" });
    } catch (err) {
      showToast({ message: "Error saving PDF: " + err.message, type: "error" });
    }
  });
}

export function destroy() {}
