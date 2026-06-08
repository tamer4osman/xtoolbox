import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { downloadBlob } from '../../utils/file.js';
import { showToast } from '../../components/toast.js';
import { createSingleFileTool } from '../../utils/single-file-tool.js';

export const toolConfig = {
  id: 'excel-to-pdf',
  name: 'Excel to PDF',
  category: 'pdf',
  description: 'Convert Excel spreadsheets (.xlsx) to PDF. Preserves tables and formatting.',
  icon: '📊',
  accept: '.xlsx,.xls,.csv',
  maxSizeMB: 50,
  keywords: ['excel to pdf', 'xlsx to pdf', 'spreadsheet to pdf', 'convert excel to pdf'],
  steps: ['Upload an Excel file', 'Click Convert', 'Download PDF'],
  faqs: [
    { question: 'What formats supported?', answer: 'We support .xlsx, .xls, and .csv files up to 50MB.' },
    { question: 'Is formatting preserved?', answer: 'Basic table formatting is preserved.' }
  ]
};

export function render(container) {
  createSingleFileTool({
    container,
    toolId: 'excel2pdf',
    accept: '.xlsx,.xls,.csv',
    icon: '📊',
    buttonText: 'Convert to PDF',
    processingMessage: 'Converting Excel to PDF...',
    async onConvert({ file }) {
      const xlsx = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const workbook = xlsx.read(buffer, { type: 'array' });

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        if (data.length === 0) continue;

        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const margin = 40;
        const cellWidth = (width - margin * 2) / Math.max(...data.map(r => r.length));
        const rowHeight = 20;

        let y = height - margin;
        for (let rowIdx = 0; rowIdx < data.length && y > margin; rowIdx++) {
          const row = data[rowIdx];
          const currentFont = rowIdx === 0 ? boldFont : font;
          for (let colIdx = 0; colIdx < row.length; colIdx++) {
            const cell = String(row[colIdx] || '');
            page.drawText(cell.substring(0, 20), {
              x: margin + colIdx * cellWidth,
              y: y - rowHeight + 4,
              size: 10,
              font: currentFont,
              color: rgb(0, 0, 0),
              maxWidth: cellWidth - 5
            });
          }
          y -= rowHeight;
        }
      }

      const bytes = await pdfDoc.save();
      downloadBlob(new Blob([bytes], { type: 'application/pdf' }), file.name.replace(/\.xlsx?$/, '.pdf'));
      showToast({ message: 'Excel converted to PDF!', type: 'success' });
    }
  });
}

export function destroy() {}
