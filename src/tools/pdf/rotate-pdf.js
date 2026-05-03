import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { loadPdf, savePdf, getPdfPageCount } from './pdf-utils.js';
import { createPdfPreview } from './pdf-preview.js';

export const toolConfig = {
  id: 'rotate-pdf',
  name: 'Rotate PDF',
  category: 'pdf',
  description: 'Rotate PDF pages 90°, 180°, or 270°.',
  icon: '🔄',
  accept: '.pdf',
  maxSizeMB: 100,
  keywords: ['rotate pdf', 'turn pdf', 'flip pdf pages'],
  steps: ['Upload a PDF file', 'Click pages to rotate them 90°', 'Or use "Rotate All" button', 'Download the rotated PDF'],
  faqs: [
    { question: 'Can I rotate individual pages?', answer: 'Yes. Click any page thumbnail to rotate it 90° clockwise.' },
    { question: 'Can I rotate 180° or 270°?', answer: 'Click a page multiple times. Each click adds 90° of rotation.' }
  ]
};

export function render(container) {
  let currentFile = null;
  let rotations = {};

  const upload = createFileUpload({
    accept: '.pdf',
    multiple: false,
    maxSizeMB: 100,
    onFilesSelected: async (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      rotations = {};
      optionsArea.style.display = 'block';
      previewContainer.innerHTML = '<div style="text-align:center;padding:var(--space-8);"><div class="spinner"></div><p>Rendering pages...</p></div>';

      const pageCount = getPdfPageCount(await loadPdf(currentFile));
      for (let i = 0; i < pageCount; i++) rotations[i] = 0;

      const preview = await createPdfPreview({ file: currentFile });
      previewContainer.innerHTML = '';
      previewContainer.appendChild(preview.element);

      // Add click-to-rotate on each thumbnail
      previewContainer.querySelectorAll('div[style*="position:relative"] > img').forEach((img, i) => {
        img.parentElement.style.cursor = 'pointer';
        img.parentElement.addEventListener('click', () => {
          rotations[i] = (rotations[i] + 90) % 360;
          img.style.transform = `rotate(${rotations[i]}deg)`;
          const label = img.parentElement.querySelector('div:last-child');
          if (label) label.textContent = `Page ${i + 1} (${rotations[i]}°)`;
        });
      });
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div id="preview-container"></div>
        <div style="display:flex;gap:var(--space-3);margin-top:var(--space-4);">
          <button class="btn btn-secondary" id="rotate-all-btn" style="flex:1;">Rotate All 90°</button>
          <button class="btn btn-primary" id="save-btn" style="flex:1;">Download Rotated PDF</button>
        </div>
      </div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Saving...</p></div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const previewContainer = container.querySelector('#preview-container');
  const rotateAllBtn = container.querySelector('#rotate-all-btn');
  const saveBtn = container.querySelector('#save-btn');
  const processing = container.querySelector('#processing');

  rotateAllBtn.addEventListener('click', () => {
    for (const i in rotations) rotations[i] = (rotations[i] + 90) % 360;
    previewContainer.querySelectorAll('img').forEach((img, i) => {
      img.style.transform = `rotate(${rotations[i] || 0}deg)`;
      const label = img.parentElement.querySelector('div:last-child');
      if (label) label.textContent = `Page ${i + 1} (${rotations[i] || 0}°)`;
    });
  });

  saveBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    processing.style.display = 'block';

    try {
      const pdfDoc = await loadPdf(currentFile);
      const pages = pdfDoc.getPages();
      pages.forEach((page, i) => {
        if (rotations[i]) page.setRotation({ type: 'degrees', angle: rotations[i] });
      });
      await savePdf(pdfDoc, 'rotated.pdf');
      showToast({ message: 'PDF rotated and saved!', type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
    }
  });
}

export function destroy() {}
