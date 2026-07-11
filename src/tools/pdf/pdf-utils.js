import { PDFDocument } from "pdf-lib";
import { downloadBlob } from "../../utils/file.js";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

/**
 * Load a PDF from File object
 */
export async function loadPdf(file) {
  const bytes = await file.arrayBuffer();
  return PDFDocument.load(bytes);
}

/**
 * Get page count of a PDF
 */
export function getPdfPageCount(pdfDoc) {
  return pdfDoc.getPageCount();
}

/**
 * Render a PDF page to canvas (for preview)
 */
export async function renderPdfPage(file, pageNumber, scale = 1.0) {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

  const bytes = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const page = await pdf.getPage(pageNumber + 1);

  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext("2d");
  await page.render({ canvasContext: ctx, viewport }).promise;

  return canvas;
}

/**
 * Render all pages of a PDF as thumbnail canvases
 */
export async function renderAllPages(file, scale = 0.3) {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

  const bytes = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const pages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    await page.render({ canvasContext: ctx, viewport }).promise;
    pages.push(canvas);
  }

  return pages;
}

/**
 * Extract text from all pages of a PDF
 */
export async function extractTextFromPdf(file) {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

  const bytes = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const pages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map(item => item.str).join(" ");
    pages.push({ page: i, text });
  }

  return pages;
}

/**
 * Save PDFDocument and trigger download
 */
export async function savePdf(pdfDoc, filename) {
  const bytes = await pdfDoc.save();
  const blob = new Blob([bytes], { type: "application/pdf" });
  downloadBlob(blob, filename);
}

/**
 * Copy pages from one PDF to another
 */
export async function copyPages(sourceDoc, targetDoc, pageIndices) {
  const copiedPages = await targetDoc.copyPages(sourceDoc, pageIndices);
  copiedPages.forEach(page => targetDoc.addPage(page));
}
