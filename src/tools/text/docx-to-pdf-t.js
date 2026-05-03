import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';

export const toolConfig = {
  id: 'docx-to-pdf-t',
  name: 'DOCX to PDF',
  category: 'text',
  description: 'Convert Word documents to PDF. Preserves formatting, fonts, images, and tables.',
  icon: '📝',
  accept: '.docx,.doc',
  maxSizeMB: 50,
  keywords: ['docx to pdf', 'word to pdf', 'convert docx', 'doc to pdf'],
  steps: ['Upload a Word document', 'Click Convert', 'Download PDF'],
  faqs: [
    { question: 'What formats supported?', answer: 'We support .docx and .doc files up to 50MB.' },
    { question: 'Is formatting preserved?', answer: 'Most formatting including fonts, colors, images, and tables are preserved.' }
  ]
};

export function render(container) {
  let docBuffer = null;

  const upload = createFileUpload({
    accept: '.docx,.doc',
    multiple: false,
    maxSizeMB: 50,
    onFilesSelected: (files) => {
      if (files.length > 0) {
        docBuffer = files[0];
        convertBtn.style.display = 'inline-flex';
        fileName.textContent = files[0].name;
        fileInfo.textContent = (files[0].size / 1024 / 1024).toFixed(2) + ' MB';
      }
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="file-info-panel" style="display:none;margin:var(--space-4) 0;">
        <div class="file-details">
          <span class="file-icon">📄</span>
          <div class="file-details-text">
            <div class="file-name" id="file-name"></div>
            <div class="file-size" id="file-info"></div>
          </div>
        </div>
      </div>
      <button class="btn btn-primary btn-lg" id="convert-btn" style="display:none;width:100%;">Convert to PDF</button>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Converting Word to PDF...</p></div>
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
  const fileInfoPanel = container.querySelector('.file-info-panel');

  convertBtn.addEventListener('click', async () => {
    if (!docBuffer) return;
    
    convertBtn.style.display = 'none';
    processing.style.display = 'flex';
    
    try {
      const docxPdf = await import('docx-pdf');
      const arrayBuffer = await docBuffer.arrayBuffer();
      const pdfBlob = await docxPdf.docxToPdf(arrayBuffer);
      
      const bytes = await pdfBlob.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const pdfBytes = await pdfDoc.save();
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const filename = docBuffer.name.replace(/\.docx?$/, '.pdf');
      downloadBlob(blob, filename);
      showToast({ message: 'Word document converted to PDF!', type: 'success' });
    } catch (err) {
      console.error('Conversion error:', err);
      showToast({ message: 'Conversion failed: ' + err.message, type: 'error' });
    } finally {
      convertBtn.style.display = 'inline-flex';
      processing.style.display = 'none';
    }
  });
}

export function destroy() {}
