import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { loadImageFromFile, downloadCanvas } from './image-utils.js';

export const toolConfig = {
  id: 'grayscale-sepia',
  name: 'Grayscale & Sepia Filter',
  category: 'image',
  description: 'Apply grayscale, sepia, or invert filters to images.',
  icon: '🎨',
  accept: 'image/*',
  maxSizeMB: 50,
  keywords: ['grayscale', 'sepia', 'black and white', 'image filter'],
  steps: ['Upload an image', 'Choose a filter', 'Preview', 'Download'],
  faqs: [
    { question: 'Can I combine filters?', answer: 'Currently one filter at a time. You can download and re-upload to stack filters.' }
  ]
};

export function render(container) {
  let originalImg = null;
  let currentFilter = 'none';

  const upload = createFileUpload({
    accept: 'image/*',
    multiple: false,
    maxSizeMB: 50,
    onFilesSelected: async (files) => {
      if (files.length === 0) return;
      originalImg = await loadImageFromFile(files[0]);
      optionsArea.style.display = 'block';
      updatePreview();
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div id="preview-area" style="text-align:center;margin:var(--space-4) 0;"></div>
        <div style="display:flex;gap:var(--space-3);justify-content:center;flex-wrap:wrap;margin-bottom:var(--space-4);">
          <button class="btn btn-secondary filter-btn active" data-filter="none">Original</button>
          <button class="btn btn-secondary filter-btn" data-filter="grayscale">Grayscale</button>
          <button class="btn btn-secondary filter-btn" data-filter="sepia">Sepia</button>
          <button class="btn btn-secondary filter-btn" data-filter="invert">Invert</button>
          <button class="btn btn-secondary filter-btn" data-filter="warm">Warm</button>
          <button class="btn btn-secondary filter-btn" data-filter="cool">Cool</button>
          <button class="btn btn-secondary filter-btn" data-filter="vintage">Vintage</button>
        </div>
        <button class="btn btn-primary btn-lg" id="download-btn" style="width:100%;">Download</button>
      </div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const previewArea = container.querySelector('#preview-area');
  const downloadBtn = container.querySelector('#download-btn');

  const filterMap = {
    none: 'none',
    grayscale: 'grayscale(100%)',
    sepia: 'sepia(100%)',
    invert: 'invert(100%)',
    warm: 'sepia(30%) saturate(140%) brightness(105%)',
    cool: 'saturate(80%) hue-rotate(20deg) brightness(105%)',
    vintage: 'sepia(40%) contrast(120%) brightness(90%) saturate(80%)'
  };

  function updatePreview() {
    if (!originalImg) return;
    const scale = Math.min(500 / originalImg.naturalWidth, 1);
    const canvas = document.createElement('canvas');
    canvas.width = originalImg.naturalWidth * scale;
    canvas.height = originalImg.naturalHeight * scale;
    const ctx = canvas.getContext('2d');
    ctx.filter = filterMap[currentFilter];
    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);
    previewArea.innerHTML = '';
    previewArea.appendChild(canvas);
  }

  container.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updatePreview();
    });
  });

  downloadBtn.addEventListener('click', () => {
    if (!originalImg) return;
    const canvas = document.createElement('canvas');
    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.filter = filterMap[currentFilter];
    ctx.drawImage(originalImg, 0, 0);
    downloadCanvas(canvas, `filtered-${currentFilter}.png`);
    showToast({ message: 'Downloaded!', type: 'success' });
  });
}

export function destroy() {}
