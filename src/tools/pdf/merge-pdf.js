import { PDFDocument } from 'pdf-lib';
import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob, formatFileSize } from '../../utils/file.js';
import { loadPdf, copyPages } from './pdf-utils.js';

export const toolConfig = {
  id: 'merge-pdf',
  name: 'Merge PDF',
  category: 'pdf',
  description: 'Combine multiple PDF files into one. Reorder pages before merging.',
  icon: '📄',
  accept: '.pdf',
  maxSizeMB: 100,
  keywords: ['merge pdf', 'combine pdf', 'join pdf', 'pdf merger'],
  steps: ['Upload two or more PDF files', 'Drag to reorder them if needed', 'Click "Merge PDF" button', 'Download your merged PDF'],
  faqs: [
    { question: 'Is there a file size limit?', answer: 'You can merge PDFs up to 100MB total. Processing happens in your browser.' },
    { question: 'Are my files uploaded to a server?', answer: 'No. All processing happens locally in your browser.' }
  ]
};

export function render(container) {
  let files = [];

  const upload = createFileUpload({
    accept: '.pdf',
    multiple: true,
    maxSizeMB: 100,
    maxFiles: 20,
    onFilesSelected: (f) => {
      files = f;
      fileList.style.display = f.length > 1 ? 'block' : 'none';
      mergeBtn.style.display = f.length > 1 ? 'inline-flex' : 'none';
      renderFileList();
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div id="file-list" style="display:none;margin:var(--space-4) 0;"></div>
      <button class="btn btn-primary btn-lg" id="merge-btn" style="display:none;width:100%;">Merge PDFs</button>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Merging PDFs...</p></div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const fileList = container.querySelector('#file-list');
  const mergeBtn = container.querySelector('#merge-btn');
  const processing = container.querySelector('#processing');

  function renderFileList() {
    fileList.innerHTML = files.map((f, i) => `
      <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);margin-bottom:var(--space-2);">
        <span style="font-weight:600;color:var(--color-text-muted);">${i + 1}.</span>
        <span style="flex:1;font-size:var(--text-sm);">${f.name}</span>
        <span style="font-size:var(--text-xs);color:var(--color-text-muted);">${formatFileSize(f.size)}</span>
      </div>
    `).join('');
  }

  mergeBtn.addEventListener('click', async () => {
    if (files.length < 2) { showToast({ message: 'Please upload at least 2 PDF files', type: 'warning' }); return; }

    processing.style.display = 'block';
    mergeBtn.style.display = 'none';

    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const srcDoc = await loadPdf(file);
        await copyPages(srcDoc, mergedPdf, srcDoc.getPageIndices());
      }
      const bytes = await mergedPdf.save();
      downloadBlob(new Blob([bytes], { type: 'application/pdf' }), 'merged.pdf');
      showToast({ message: 'PDFs merged successfully!', type: 'success' });
    } catch (err) {
      showToast({ message: 'Error merging PDFs: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      mergeBtn.style.display = 'inline-flex';
    }
  });
}

export function destroy() {}
