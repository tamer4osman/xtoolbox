import Papa from 'papaparse';
import writeExcelFile from 'write-excel-file/browser';
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
      const parsed = Papa.parse(text, { header: false, skipEmptyLines: true });
      const rows = parsed.data;

      const sheetData = rows.map(row =>
        row.map(cell => ({ type: String, value: cell != null ? String(cell) : '' }))
      );

      const blob = await writeExcelFile(sheetData, {
        columns: (rows[0] || []).map((_, i) => ({ header: `Column ${i + 1}` }))
      }).toBlob();

      downloadBlob(blob, file.name.replace(/\.csv$/i, '.xlsx'));
      showToast({ message: 'CSV converted to Excel!', type: 'success' });
    }
  });
}

export function destroy() {}
