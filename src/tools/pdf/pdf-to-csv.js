import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { downloadBlob } from "../../utils/file.js";
import { showToast } from "../../components/toast.js";
import { createSingleFileTool } from "../../utils/single-file-tool.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const toolConfig = {
  id: "pdf-to-csv",
  name: "PDF to CSV",
  category: "pdf",
  description: "Extract tabular data from PDF to CSV format.",
  icon: "📊",
  accept: ".pdf",
  maxSizeMB: 50,
  keywords: ["pdf to csv", "extract data from pdf", "convert pdf to csv", "pdf table to csv"],
  steps: ["Upload a PDF file", 'Click "Convert to CSV"', "Download the .csv file"],
  faqs: [
    { question: "What formats supported?", answer: "We support PDF files up to 50MB." },
    {
      question: "Are tables extracted?",
      answer: "Yes, text content is extracted and formatted as CSV."
    },
    {
      question: "Are scanned PDFs supported?",
      answer: "Only PDFs with selectable text. Scanned images need OCR first."
    }
  ]
};

function extractCSV(textContent) {
  const items = textContent.items;
  if (items.length === 0) return "";
  const rows = [];
  let currentRow = [];
  let lastY = null;
  for (const item of items) {
    const y = item.transform[5];
    const text = item.str.trim();
    if (!text) continue;
    if (lastY === null || Math.abs(y - lastY) > 5) {
      if (currentRow.length > 0) rows.push(currentRow);
      currentRow = [text];
    } else {
      currentRow.push(text);
    }
    lastY = y;
  }
  if (currentRow.length > 0) rows.push(currentRow);
  return rows
    .map(row =>
      row
        .map(cell =>
          cell.includes(",") || cell.includes('"') || cell.includes("\n")
            ? `"${cell.replace(/"/g, '""')}"`
            : cell
        )
        .join(",")
    )
    .join("\n");
}

export function render(container) {
  createSingleFileTool({
    container,
    toolId: "pdf2csv",
    accept: ".pdf",
    icon: "📄",
    buttonText: "Convert to CSV",
    processingMessage: "Extracting data from PDF...",
    async onConvert({ file, progress }) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let allCSV = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        progress(Math.round((i / pdf.numPages) * 100));
        const csv = extractCSV(textContent);
        if (csv) {
          if (i > 1) allCSV += "\n";
          allCSV += csv;
        }
      }
      if (!allCSV) {
        showToast({ message: "No extractable text found in PDF.", type: "warning" });
      } else {
        downloadBlob(
          new Blob(["\uFEFF" + allCSV], { type: "text/csv;charset=utf-8" }),
          file.name.replace(/\.pdf$/i, "") + ".csv"
        );
        showToast({ message: "PDF converted to CSV!", type: "success" });
      }
    }
  });
}

export function destroy() {}
