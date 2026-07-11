import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { copyToClipboard } from "../../utils/clipboard.js";
import { downloadBlob } from "../../utils/file.js";
import { extractTextFromPdf } from "../pdf/pdf-utils.js";
import { escapeHtml } from "../../utils/escape-html.js";

export const toolConfig = {
  id: "pdf-to-text",
  name: "PDF to Text",
  category: "ocr",
  description: "Extract all text content from PDF files.",
  icon: "📋",
  accept: ".pdf",
  maxSizeMB: 100,
  keywords: ["pdf to text", "extract text pdf", "pdf text extractor"],
  steps: ["Upload a PDF file", "View extracted text per page", "Copy or download the text"],
  faqs: [
    {
      question: "Does this work on scanned PDFs?",
      answer:
        'Scanned PDFs contain images, not text. Use "Image to Text" OCR for scanned documents.'
    },
    {
      question: "Is formatting preserved?",
      answer: "Basic text is extracted. Complex layouts may not retain formatting."
    }
  ]
};

export function render(container) {
  let allText = "";

  const upload = createFileUpload({
    accept: ".pdf",
    multiple: false,
    maxSizeMB: 100,
    onFilesSelected: async files => {
      if (files.length === 0) return;
      resultsArea.style.display = "block";
      resultsArea.innerHTML =
        '<div style="text-align:center;padding:var(--space-8);"><div class="spinner"></div><p>Extracting text...</p></div>';

      try {
        const pages = await extractTextFromPdf(files[0]);
        allText = pages.map(p => `--- Page ${p.page} ---\n${p.text}`).join("\n\n");

        if (!allText.trim()) {
          resultsArea.innerHTML = `
            <div style="text-align:center;padding:var(--space-8);color:var(--color-text-muted);">
              <p style="font-size:var(--text-lg);margin-bottom:var(--space-4);">No text found</p>
              <p>This PDF may be a scanned document (images, not text). Try the <a href="#/tools/image-to-text">Image to Text (OCR)</a> tool instead.</p>
            </div>
          `;
          return;
        }

        resultsArea.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4);">
            <h3 style="font-size:var(--text-lg);font-weight:600;">${pages.length} pages processed</h3>
            <div style="display:flex;gap:var(--space-2);">
              <button class="btn btn-sm btn-secondary" id="copy-btn">📋 Copy All</button>
              <button class="btn btn-sm btn-secondary" id="download-btn">⬇️ Download .txt</button>
            </div>
          </div>
          <div id="text-pages"></div>
        `;

        const textPages = resultsArea.querySelector("#text-pages");
        pages.forEach(p => {
          const section = document.createElement("div");
          section.style.cssText = "margin-bottom:var(--space-4);";
          section.innerHTML = `
            <div style="font-size:var(--text-sm);font-weight:600;color:var(--color-text-muted);margin-bottom:var(--space-2);">Page ${p.page}</div>
            <pre style="background:var(--color-surface);padding:var(--space-4);border-radius:var(--radius-md);white-space:pre-wrap;word-break:break-word;font-size:var(--text-sm);line-height:1.6;max-height:200px;overflow-y:auto;border:1px solid var(--color-border);">${p.text || "(empty)"}</pre>
          `;
          textPages.appendChild(section);
        });

        resultsArea.querySelector("#copy-btn").addEventListener("click", async () => {
          await copyToClipboard(allText);
          showToast({ message: "Copied!", type: "success" });
        });

        resultsArea.querySelector("#download-btn").addEventListener("click", () => {
          downloadBlob(new Blob([allText], { type: "text/plain" }), "pdf-text.txt");
        });
      } catch (err) {
        resultsArea.innerHTML = `<div style="color:var(--color-error);padding:var(--space-4);">Error: ${escapeHtml(err.message)}</div>`;
      }
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div id="results-area" style="display:none;margin-top:var(--space-6);"></div>
    </div>
  `;

  container.querySelector("#upload-area").appendChild(upload.element);
  const resultsArea = container.querySelector("#results-area");
}

export function destroy() {}
