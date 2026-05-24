import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const toolConfig = {
  id: 'delete-pdf-pages',
  name: 'Delete PDF Pages',
  category: 'pdf',
  description: 'Remove specific pages from a PDF with visual selector.',
  icon: '',
  accept: '.pdf',
  maxSizeMB: 50,
  keywords: ['delete pdf pages', 'remove pages', 'extract pages', 'pdf page remover'],
  steps: ['Upload a PDF file', 'Click pages you want to delete (or use Select All/None)', 'Click "Delete Selected Pages"', 'Download the modified PDF'],
  faqs: [
    { question: 'What formats supported?', answer: 'We support PDF files up to 50MB.' },
    { question: 'Can I delete multiple pages?', answer: 'Yes, click on any page thumbnail to mark it for deletion.' },
    { question: 'Are scanned PDFs supported?', answer: 'Yes, page thumbnails are rendered for visual selection.' }
  ]
};

async function renderPdfThumbnails(file, container) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const thumbnailsContainer = container.querySelector('#thumbnails');
  
  thumbnailsContainer.innerHTML = '';
  
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 0.3 });
    
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.className = 'page-thumbnail';
    canvas.dataset.page = i;
    
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'page-wrapper';
    wrapper.appendChild(canvas);
    
    const label = document.createElement('span');
    label.className = 'page-label';
    label.textContent = `Page ${i}`;
    wrapper.appendChild(label);
    
    wrapper.addEventListener('click', () => {
      wrapper.classList.toggle('selected');
      updateDeleteCount(container);
    });
    
    thumbnailsContainer.appendChild(wrapper);
  }
}

function updateDeleteCount(container) {
  const selected = container.querySelectorAll('.page-wrapper.selected').length;
  const total = container.querySelectorAll('.page-wrapper').length;
  const countEl = container.querySelector('#delete-count');
  if (countEl) {
    countEl.textContent = selected > 0 ? `${selected} of ${total} pages selected for deletion` : `Click pages to delete (${total} pages total)`;
  }
}

export function render(container) {
  let pdfFile = null;

  const upload = createFileUpload({
    accept: '.pdf',
    multiple: false,
    maxSizeMB: 50,
    onFilesSelected: (files) => {
      if (files.length > 0) {
        pdfFile = files[0];
        fileName.textContent = files[0].name;
        fileInfo.textContent = (files[0].size / 1024 / 1024).toFixed(2) + ' MB';
        filePanel.style.display = 'block';
        convertBtn.style.display = 'inline-flex';
        selectAllBtn.style.display = 'inline-flex';
        selectNoneBtn.style.display = 'inline-flex';
        thumbnailsContainer.style.display = 'grid';
        
        renderPdfThumbnails(files[0], container);
      }
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="file-info-panel" id="file-panel" style="display:none;margin:var(--space-4) 0;">
        <div class="file-details">
          <span class="file-icon"></span>
          <div class="file-details-text">
            <div class="file-name" id="file-name"></div>
            <div class="file-size" id="file-info"></div>
          </div>
        </div>
      </div>
      <div class="page-controls" id="page-controls" style="display:none;margin:var(--space-4) 0;">
        <button class="btn btn-secondary btn-sm" id="select-all-btn">Select All</button>
        <button class="btn btn-secondary btn-sm" id="select-none-btn">Select None</button>
        <span id="delete-count" style="margin-left:var(--space-3);color:var(--color-text-secondary);"></span>
      </div>
      <div class="thumbnails-grid" id="thumbnails" style="display:none;"></div>
      <button class="btn btn-danger btn-lg" id="convert-btn" style="display:none;width:100%;margin-top:var(--space-4);">Delete Selected Pages</button>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p>Removing pages...</p>
      </div>
    </div>
    <style>
      .file-info-panel { background:var(--color-surface);padding:var(--space-4);border-radius:var(--radius-lg); }
      .file-details { display:flex;align-items:center;gap:var(--space-4); }
      .file-icon { font-size:32px; }
      .file-name { font-weight:600; }
      .file-size { font-size:var(--text-sm);color:var(--color-text-secondary); }
      .page-controls { display:flex;align-items:center;gap:var(--space-3); }
      .thumbnails-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:var(--space-3);margin:var(--space-4) 0; }
      .page-wrapper { position:relative;cursor:pointer;border:2px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;transition:all 0.2s; }
      .page-wrapper:hover { border-color:var(--color-primary); }
      .page-wrapper.selected { border-color:var(--color-error);opacity:0.6; }
      .page-wrapper.selected::after { content:'✕';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:32px;color:var(--color-error);font-weight:bold; }
      .page-thumbnail { width:100%;display:block; }
      .page-label { display:block;text-align:center;padding:var(--space-1);font-size:var(--text-xs);color:var(--color-text-secondary);background:var(--color-surface); }
    </style>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const convertBtn = container.querySelector('#convert-btn');
  const processing = container.querySelector('#processing');
  const filePanel = container.querySelector('#file-panel');
  const fileName = container.querySelector('#file-name');
  const fileInfo = container.querySelector('#file-info');
  const thumbnailsContainer = container.querySelector('#thumbnails');
  const selectAllBtn = container.querySelector('#select-all-btn');
  const selectNoneBtn = container.querySelector('#select-none-btn');
  const pageControls = container.querySelector('#page-controls');

  selectAllBtn.addEventListener('click', () => {
    container.querySelectorAll('.page-wrapper').forEach(w => w.classList.add('selected'));
    updateDeleteCount(container);
  });

  selectNoneBtn.addEventListener('click', () => {
    container.querySelectorAll('.page-wrapper').forEach(w => w.classList.remove('selected'));
    updateDeleteCount(container);
  });

  convertBtn.addEventListener('click', async () => {
    if (!pdfFile) return;

    const selectedPages = Array.from(container.querySelectorAll('.page-wrapper.selected'))
      .map(w => parseInt(w.querySelector('.page-thumbnail').dataset.page));
    
    if (selectedPages.length === 0) {
      showToast({ message: 'Please select at least one page to delete.', type: 'warning' });
      return;
    }

    processing.style.display = 'block';
    convertBtn.style.display = 'none';

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer);
      const newDoc = await PDFDocument.create();
      
      const totalPages = srcDoc.getPageCount();
      const pagesToKeep = [];
      for (let i = 0; i < totalPages; i++) {
        if (!selectedPages.includes(i + 1)) {
          pagesToKeep.push(i);
        }
      }
      
      const copiedPages = await newDoc.copyPages(srcDoc, pagesToKeep);
      copiedPages.forEach(page => newDoc.addPage(page));
      
      const bytes = await newDoc.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const fileNameWithoutExt = pdfFile.name.replace(/\.pdf$/i, '');
      downloadBlob(blob, `${fileNameWithoutExt}_edited.pdf`);
      
      showToast({ message: `Deleted ${selectedPages.length} page(s). ${pagesToKeep.length} page(s) remaining.`, type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      convertBtn.style.display = 'inline-flex';
    }
  });
}

export function destroy() {}
