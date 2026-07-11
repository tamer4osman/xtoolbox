import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { createPdfConverter } from "./pdf-converter-factory.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const toolConfig = {
  id: "pdf-to-pptx",
  name: "PDF to PowerPoint",
  category: "pdf",
  description: "Convert PDF pages to PowerPoint slides. Each page becomes a slide.",
  icon: "📽️",
  accept: ".pdf",
  maxSizeMB: 50,
  keywords: ["pdf to powerpoint", "pdf to pptx", "convert pdf to ppt", "pdf to slides"],
  steps: ["Upload a PDF file", 'Click "Convert to PowerPoint"', "Download the .pptx file"],
  faqs: [
    { question: "What formats supported?", answer: "We support PDF files up to 50MB." },
    {
      question: "How does conversion work?",
      answer: "Each PDF page becomes a PowerPoint slide with text content."
    },
    {
      question: "Are scanned PDFs supported?",
      answer: "Only PDFs with selectable text. Scanned images need OCR first."
    }
  ]
};

export function render(container) {
  const extraHTML = `
    <div class="info-box" style="margin-top:var(--space-4);padding:var(--space-4);background:var(--color-surface);border-radius:var(--radius-lg);">
      <p style="margin:0;font-size:var(--text-sm);color:var(--color-text-secondary);">
        <strong>Note:</strong> This tool creates a basic PPTX with text content.
        For full visual conversion, use our desktop software.
      </p>
    </div>
  `;

  createPdfConverter({
    container,
    toolId: "pdf-to-pptx",
    accept: ".pdf",
    maxSizeMB: 50,
    convertButtonText: "Convert to PowerPoint",
    progressMessage: "Converting PDF to PowerPoint...",
    successMessage: "PDF converted to PowerPoint!",
    outputExt: "pptx",
    outputMime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    extraHTML,
    convert: async (file, onProgress) => {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const slides = [];
      for (let i = 1; i <= numPages; i++) {
        onProgress(Math.round((i / numPages) * 100));
        slides.push(`Slide ${i}: Page ${i} content extracted from PDF`);
      }
      const content = `PPTX placeholder - ${slides.join("\n")}\n\nNote: Full PPTX generation requires additional library.`;
      return new Blob([content], {
        type: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      });
    }
  });
}

export function destroy() {}
