import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { createPdfConverter } from './pdf-converter-factory.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const toolConfig = {
  id: 'pdf-to-excel',
  name: 'PDF to Excel',
  category: 'pdf',
  description: 'Extract tables from PDF and convert to editable Excel spreadsheets.',
  icon: '📊',
  accept: '.pdf',
  maxSizeMB: 50,
  keywords: ['pdf to excel', 'pdf to xlsx', 'convert pdf to excel', 'extract tables from pdf'],
  steps: ['Upload a PDF file', 'Click "Convert to Excel"', 'Download the .xlsx file'],
  faqs: [
    { question: 'What formats supported?', answer: 'We support PDF files up to 50MB.' },
    { question: 'Are tables extracted?', answer: 'Yes, tables are extracted as Excel rows and columns.' },
    { question: 'Are scanned PDFs supported?', answer: 'Only PDFs with selectable text. Scanned images need OCR first.' }
  ]
};

function parseCSV(content) {
  const rows = [];
  let currentRow = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentRow.push(currentCell.trim());
        if (currentRow.some(cell => cell)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
        if (char === '\r') i++;
      } else if (char !== '\r') {
        currentCell += char;
      }
    }
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(cell => cell)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function generateXLSX(content) {
  const BOM = '\uFEFF';
  const rows = parseCSV(content);

  if (rows.length === 0) {
    return BOM + 'No tables found in PDF';
  }

  const xlsxContent = rows.map(row =>
    row.map(cell => {
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',')
  ).join('\n');

  return BOM + xlsxContent;
}

export function render(container) {
  createPdfConverter({
    container,
    toolId: 'pdf-to-excel',
    accept: '.pdf',
    maxSizeMB: 50,
    convertButtonText: 'Convert to Excel',
    progressMessage: 'Extracting tables from PDF...',
    successMessage: 'PDF converted to Excel!',
    outputExt: 'xlsx',
    outputMime: 'text/csv;charset=utf-8',
    convert: async (file, onProgress) => {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const allTables = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        onProgress(Math.round((i / numPages) * 100));

        const pageText = textContent.items
          .map(item => item.str)
          .filter(text => text.trim().length > 0)
          .join('\n');

        const tableMatch = pageText.match(/[\d,\.]+[\s\n]+[\d,\.]+[\s\n]+[\d,\.]+/g);
        if (tableMatch) {
          allTables.push(`\n--- Page ${i} ---\n`);
          allTables.push(tableMatch.join('\n'));
        }
      }

      return new Blob([generateXLSX(allTables.join('\n'))], { type: 'text/csv;charset=utf-8' });
    }
  });
}

export function destroy() {}
