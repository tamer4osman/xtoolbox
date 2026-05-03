import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';

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
  let excelBuffer = null;

  const upload = createFileUpload({
    accept: '.xlsx,.xls,.csv',
    multiple: false,
    maxSizeMB: 50,
    onFilesSelected: (files) => {
      if (files.length > 0) {
        excelBuffer = files[0];
        convertBtn.style.display = 'inline-flex';
        fileName.textContent = files[0].name;
        fileInfo.textContent = (files[0].size / 1024 / 1024).toFixed(2) + ' MB';
        fileInfoPanel.style.display = 'block';
      }
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="file-info-panel" id="file-panel" style="display:none;margin:var(--space-4) 0;">
        <div class="file-details">
          <span class="file-icon">📊</span>
          <div class="file-details-text">
            <div class="file-name" id="file-name"></div>
            <div class="file-size" id="file-info"></div>
          </div>
        </div>
      </div>
      <button class="btn btn-primary btn-lg" id="convert-btn" style="display:none;width:100%;margin-top:var(--space-4);">Convert to PDF</button>
      <div class="tool-processing" id="processing" style="display:none;margin-top:var(--space-4);"><div class="spinner"></div><p>Converting Excel to PDF...</p></div>
    </div>
    <style>
      .file-info-panel { background:var(--color-surface);padding:var(--space-4);border-radius:var(--radius-lg); }
      .file-details { display:flex;align-items:center;gap:var(--space-4); }
      .file-icon { font-size:32px; }
      .file-name { font-weight:600; }
      .file-size { font-size:var(--text-sm);color:var(--color-text-secondary); }
    </style>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const convertBtn = container.querySelector('#convert-btn');
  const processing = container.querySelector('#processing');
  const fileName = container.querySelector('#file-name');
  const fileInfo = container.querySelector('#file-info');
  const fileInfoPanel = container.querySelector('#file-panel');

  convertBtn.addEventListener('click', async () => {
    if (!excelBuffer) return;
    
    convertBtn.style.display = 'none';
    processing.style.display = 'flex';
    
    try {
      const xlsx = await import('xlsx');
      const buffer = await excelBuffer.arrayBuffer();
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
        const fontSize = 10;
        
        let y = height - margin;
        
        for (let rowIdx = 0; rowIdx < data.length && y > margin; rowIdx++) {
          const row = data[rowIdx];
          const isHeader = rowIdx === 0;
          const currentFont = isHeader ? boldFont : font;
          
          for (let colIdx = 0; colIdx < row.length; colIdx++) {
            const cell = String(row[colIdx] || '');
            const x = margin + colIdx * cellWidth;
            
            page.drawText(cell.substring(0, 20), {
              x: x,
              y: y - rowHeight + 4,
              size: fontSize,
              font: currentFont,
              color: rgb(0, 0, 0),
              maxWidth: cellWidth - 5
            });
          }
          y -= rowHeight;
        }
      }
      
      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const filename = excelBuffer.name.replace(/\.xlsx?$/, '.pdf');
      downloadBlob(blob, filename);
      showToast({ message: 'Excel converted to PDF!', type: 'success' });
    } catch (err) {
      console.error('Excel conversion error:', err);
      showToast({ message: 'Conversion failed: ' + err.message, type: 'error' });
    } finally {
      convertBtn.style.display = 'inline-flex';
      processing.style.display = 'none';
    }
  });
}

export function destroy() {}
