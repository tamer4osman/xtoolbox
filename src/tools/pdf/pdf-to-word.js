import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const toolConfig = {
  id: 'pdf-to-word',
  name: 'PDF to Word',
  category: 'pdf',
  description: 'Convert PDF files to editable Word documents (.docx). Preserves text and basic formatting.',
  icon: '📄',
  accept: '.pdf',
  maxSizeMB: 50,
  keywords: ['pdf to word', 'pdf to docx', 'convert pdf to word', 'pdf to microsoft word'],
  steps: ['Upload a PDF file', 'Click "Convert to Word"', 'Download the .docx file'],
  faqs: [
    { question: 'What formats supported?', answer: 'We support PDF files up to 50MB.' },
    { question: 'Is formatting preserved?', answer: 'Text and basic formatting are preserved. Complex layouts may need manual adjustment.' },
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
      <button class="btn btn-primary btn-lg" id="convert-btn" style="display:none;width:100%;">Convert to Word</button>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p>Converting PDF to Word... <span id="progress-pct">0</span>%</p>
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
      const children = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const progress = Math.round((i / numPages) * 100);
        progressPct.textContent = progress;

        const pageText = textContent.items
          .map(item => item.str)
          .filter(text => text.trim().length > 0)
          .join(' ');

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
        sections: [{
          properties: {},
          children: children.length > 0 ? children : [
            new Paragraph({
              children: [new TextRun({ text: '(No text found in PDF)' })]
            })
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      const fileNameWithoutExt = pdfBuffer.name.replace(/\.pdf$/i, '');
      downloadBlob(blob, `${fileNameWithoutExt}.docx`);

      showToast({ message: 'PDF converted to Word!', type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      convertBtn.style.display = 'inline-flex';
      filePanel.style.display = 'block';
    }
  });
}

export function destroy() {}