import * as XLSX from 'xlsx';
import { downloadBlob } from '../../utils/file.js';
import { showToast } from '../../components/toast.js';
import { createSingleFileTool } from '../../utils/single-file-tool.js';

export const toolConfig = {
  id: 'csv-to-excel',
  name: 'CSV to Excel Converter',
  category: 'text',
  description: 'Convert CSV files to Excel format with proper formatting.',
  icon: '🔄',
  accept: '.csv',
  maxSizeMB: 20,
  keywords: ['csv to excel', 'convert csv to xlsx', 'csv converter', 'spreadsheet converter'],
  steps: ['Upload a CSV file', 'Click Convert', 'Download Excel file'],
  faqs: [
    { question: 'What formats supported?', answer: 'We support .csv files up to 20MB.' },
    { question: 'Can I convert Excel back to CSV?', answer: 'Yes, use our Excel Viewer tool to export as CSV.' }
  ]
};

export function render(container) {
  createSingleFileTool({
    container,
    toolId: 'csv2excel',
    accept: '.csv',
    icon: '📄',
    buttonText: 'Convert to Excel',
    processingMessage: 'Converting CSV to Excel...',
    async onConvert({ file }) {
      const text = await file.text();
      const wb = XLSX.read(text, { type: 'string' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws, { header: 1 });

      const newWb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWb, XLSX.utils.aoa_to_sheet(json), 'Data');

      const wbout = XLSX.write(newWb, { bookType: 'xlsx', type: 'array' });
      downloadBlob(new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), file.name.replace(/\.csv$/i, '.xlsx'));
      showToast({ message: 'CSV converted to Excel!', type: 'success' });
    }
  });
}

export function destroy() {}
