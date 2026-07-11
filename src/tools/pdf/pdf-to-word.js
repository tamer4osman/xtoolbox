import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { createPdfConverter } from "./pdf-converter-factory.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const toolConfig = {
  id: "pdf-to-word",
  name: "PDF to Word",
  category: "pdf",
  description:
    "Convert PDF files to editable Word documents (.docx). Preserves text and basic formatting.",
  icon: "📄",
  accept: ".pdf",
  maxSizeMB: 50,
  keywords: ["pdf to word", "pdf to docx", "convert pdf to word", "pdf to microsoft word"],
  steps: ["Upload a PDF file", 'Click "Convert to Word"', "Download the .docx file"],
  faqs: [
    { question: "What formats supported?", answer: "We support PDF files up to 50MB." },
    {
      question: "Is formatting preserved?",
      answer: "Text and basic formatting are preserved. Complex layouts may need manual adjustment."
    },
    {
      question: "Are scanned PDFs supported?",
      answer: "Only PDFs with selectable text. Scanned images need OCR first."
    }
  ]
};

export function render(container) {
  createPdfConverter({
    container,
    toolId: "pdf-to-word",
    accept: ".pdf",
    maxSizeMB: 50,
    convertButtonText: "Convert to Word",
    progressMessage: "Converting PDF to Word...",
    successMessage: "PDF converted to Word!",
    outputExt: "docx",
    outputMime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    convert: async (file, onProgress) => {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const children = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        onProgress(Math.round((i / numPages) * 100));

        const pageText = textContent.items
          .map(item => item.str)
          .filter(text => text.trim().length > 0)
          .join(" ");

        if (pageText.trim()) {
          children.push(
            new Paragraph({
              text: pageText,
              heading: i === 1 ? HeadingLevel.HEADING_1 : undefined,
              spacing: { after: 400 }
            })
          );
        }
      }

      const doc = new Document({
        sections: [
          {
            properties: {},
            children:
              children.length > 0
                ? children
                : [new Paragraph({ children: [new TextRun({ text: "(No text found in PDF)" })] })]
          }
        ]
      });
      return await Packer.toBlob(doc);
    }
  });
}

export function destroy() {}
