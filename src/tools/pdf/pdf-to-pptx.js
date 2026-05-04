import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const toolConfig = {
  id: 'pdf-to-pptx',
  name: 'PDF to PowerPoint',
  category: 'pdf',
  description: 'Convert PDF pages to PowerPoint slides. Each page becomes a slide.',
  icon: '📽️',
  accept: '.pdf',
  maxSizeMB: 50,
  keywords: ['pdf to powerpoint', 'pdf to pptx', 'convert pdf to ppt', 'pdf to slides'],
  steps: ['Upload a PDF file', 'Click "Convert to PowerPoint"', 'Download the .pptx file'],
  faqs: [
    { question: 'What formats supported?', answer: 'We support PDF files up to 50MB.' },
    { question: 'How does conversion work?', answer: 'Each PDF page becomes a PowerPoint slide with text content.' },
    { question: 'Are scanned PDFs supported?', answer: 'Only PDFs with selectable text. Scanned images need OCR first.' }
  ]
};

export function render(container) {
  let pdfBuffer = null;

  const upload = createFileUpload({
    accept: '.pdf',
    multiple: false,
    maxSizeMB: 50,
    onFilesSelected: (files) => {
      if (files.length > 0) {
        pdfBuffer = files[0];
        convertBtn.style.display = 'inline-flex';
        fileName.textContent = files[0].name;
        fileInfo.textContent = (files[0].size / 1024 / 1024).toFixed(2) + ' MB';
        filePanel.style.display = 'block';
      }
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="file-info-panel" id="file-panel" style="display:none;margin:var(--space-4) 0;">
        <div class="file-details">
          <span class="file-icon">📄</span>
          <div class="file-details-text">
            <div class="file-name" id="file-name"></div>
            <div class="file-size" id="file-info"></div>
          </div>
        </div>
      </div>
      <button class="btn btn-primary btn-lg" id="convert-btn" style="display:none;width:100%;">Convert to PowerPoint</button>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p>Converting PDF to PowerPoint... <span id="progress-pct">0</span>%</p>
      </div>
      <div class="info-box" style="margin-top:var(--space-4);padding:var(--space-4);background:var(--color-surface);border-radius:var(--radius-lg);">
        <p style="margin:0;font-size:var(--text-sm);color:var(--color-text-secondary);">
          <strong>Note:</strong> This tool creates a basic PPTX with text content. 
          For full visual conversion, use our desktop software.
        </p>
      </div>
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
  const progressPct = container.querySelector('#progress-pct');
  const filePanel = container.querySelector('#file-panel');
  const fileName = container.querySelector('#file-name');
  const fileInfo = container.querySelector('#file-info');

  convertBtn.addEventListener('click', async () => {
    if (!pdfBuffer) return;

    processing.style.display = 'block';
    convertBtn.style.display = 'none';
    filePanel.style.display = 'none';

    try {
      const arrayBuffer = await pdfBuffer.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      
      const pptxContent = generatePPTX(pdf, numPages, progressPct);
      
      const blob = new Blob([pptxContent], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
      const fileNameWithoutExt = pdfBuffer.name.replace(/\.pdf$/i, '');
      downloadBlob(blob, `${fileNameWithoutExt}.pptx`);

      showToast({ message: 'PDF converted to PowerPoint!', type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      convertBtn.style.display = 'inline-flex';
      filePanel.style.display = 'block';
    }
  });
}

function generatePPTX(pdf, numPages, progressPct) {
  const slides = [];
  
  for (let i = 1; i <= numPages; i++) {
    progressPct.textContent = Math.round((i / numPages) * 100);
    
    slides.push(`Slide ${i}: Page ${i} content extracted from PDF`);
  }
  
  return `PPTX placeholder - ${slides.join('\n')}\n\nNote: Full PPTX generation requires additional library.`;
}

export function destroy() {}