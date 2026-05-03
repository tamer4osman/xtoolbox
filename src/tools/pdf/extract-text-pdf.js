import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { copyToClipboard } from '../../utils/clipboard.js';
import { downloadBlob } from '../../utils/file.js';
import { extractTextFromPdf } from './pdf-utils.js';

export const toolConfig = {
  id: 'extract-text-pdf',
  name: 'Extract Text from PDF',
  category: 'pdf',
  description: 'Extract all text content from a PDF file.',
  icon: '📋',
  accept: '.pdf',
  maxSizeMB: 100,
  keywords: ['extract text pdf', 'pdf to text', 'pdf text extractor'],
  steps: ['Upload a PDF file', 'View extracted text per page', 'Copy or download the text'],
  faqs: [
    { question: 'Does this work on scanned PDFs?', answer: 'Scanned PDFs contain images, not text. Use the OCR tool for scanned documents.' },
    { question: 'Is formatting preserved?', answer: 'Basic text is extracted. Complex layouts may not retain their formatting.' }
  ]
};

export function render(container) {
  let allText = '';

  const upload = createFileUpload({
    accept: '.pdf',
    multiple: false,
    maxSizeMB: 100,
    onFilesSelected: async (files) => {
      if (files.length === 0) return;
      resultsArea.style.display = 'block';
      resultsArea.innerHTML = '<div style="text-align:center;padding:var(--space-8);"><div class="spinner"></div><p>Extracting text...</p></div>';

      try {
        const pages = await extractTextFromPdf(files[0]);
        allText = pages.map(p => `--- Page ${p.page} ---\n${p.text}`).join('\n\n');

        if (!allText.trim()) {
          resultsArea.innerHTML = '<div style="text-align:center;padding:var(--space-8);color:var(--color-text-muted);">No text found in this PDF. It may be a scanned document — try the OCR tool.</div>';
          return;
        }

        resultsArea.innerHTML = `
          <div style="display:flex;gap:var(--space-3);margin-bottom:var(--space-4);">
            <button class="btn btn-secondary" id="copy-btn">📋 Copy All</button>
            <button class="btn btn-secondary" id="download-txt-btn">⬇️ Download .txt</button>
          </div>
          <div id="text-pages"></div>
        `;

        const textPages = resultsArea.querySelector('#text-pages');
        pages.forEach(p => {
          const section = document.createElement('div');
          section.style.cssText = 'margin-bottom:var(--space-4);';
          section.innerHTML = `
            <div style="font-size:var(--text-sm);font-weight:600;color:var(--color-text-muted);margin-bottom:var(--space-2);">Page ${p.page}</div>
            <pre style="background:var(--color-surface);padding:var(--space-4);border-radius:var(--radius-md);white-space:pre-wrap;word-break:break-word;font-size:var(--text-sm);line-height:1.6;max-height:200px;overflow-y:auto;">${p.text || '(empty)'}</pre>
          `;
          textPages.appendChild(section);
        });

        resultsArea.querySelector('#copy-btn').addEventListener('click', async () => {
          await copyToClipboard(allText);
          showToast({ message: 'Text copied!', type: 'success' });
        });

        resultsArea.querySelector('#download-txt-btn').addEventListener('click', () => {
          downloadBlob(new Blob([allText], { type: 'text/plain' }), 'extracted-text.txt');
        });
      } catch (err) {
        resultsArea.innerHTML = `<div style="color:var(--color-error);">Error: ${err.message}</div>`;
      }
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div id="results-area" style="display:none;margin-top:var(--space-6);"></div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const resultsArea = container.querySelector('#results-area');
}

export function destroy() {}
