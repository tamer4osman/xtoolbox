import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { loadImageFromFile, downloadCanvas } from './image-utils.js';

const FILTERS = [
  { id: 'normal', name: 'Normal', filter: '' },
  { id: 'grayscale', name: 'Grayscale', filter: 'grayscale(100%)' },
  { id: 'sepia', name: 'Sepia', filter: 'sepia(100%)' },
  { id: 'invert', name: 'Invert', filter: 'invert(100%)' },
  { id: 'vintage', name: 'Vintage', filter: 'sepia(50%) contrast(110%) brightness(90%)' },
  { id: 'noir', name: 'Noir', filter: 'grayscale(100%) contrast(150%) brightness(90%)' },
  { id: 'warm', name: 'Warm', filter: 'sepia(30%) saturate(140%) brightness(110%)' },
  { id: 'cool', name: 'Cool', filter: 'hue-rotate(180deg) saturate(120%) brightness(110%)' },
  { id: 'blur', name: 'Blur', filter: 'blur(4px)' },
  { id: 'high-contrast', name: 'High Contrast', filter: 'contrast(200%) brightness(110%)' },
  { id: 'saturated', name: 'Saturated', filter: 'saturate(200%)' },
  { id: 'faded', name: 'Faded', filter: 'opacity(80%) contrast(80%) saturate(80%)' }
];

export const toolConfig = {
  id: 'image-filters',
  name: 'Image Filter Gallery',
  category: 'image',
  description: 'Apply cinematic filters to your photos. Click any filter to preview and download.',
  icon: '🎞️',
  accept: 'image/*',
  maxSizeMB: 50,
  keywords: ['image filters', 'photo filters', 'vintage', 'noir', 'sepia', 'grayscale', 'cinematic', 'photo effects'],
  steps: ['Upload an image', 'Browse the filter gallery', 'Click a filter to preview on your image', 'Download your filtered image'],
  faqs: [
    { question: 'Can I apply multiple filters?', answer: 'Each filter is a preset. Apply one at a time by clicking its thumbnail.' },
    { question: 'Are the filters reversible?', answer: 'Yes — click "Normal" or re-upload to restore the original image.' },
    { question: 'What image formats are supported?', answer: 'All common image formats: JPG, PNG, WebP, GIF, BMP.' }
  ]
};

export function render(container) {
  let originalImg = null;

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div id="filters-content" style="display:none;">
        <div id="main-preview" style="text-align:center;margin:var(--space-4) 0;position:relative;">
          <canvas id="filter-canvas" style="max-width:100%;max-height:500px;border-radius:var(--radius-md);"></canvas>
        </div>
        <div style="display:flex;gap:var(--space-3);margin-bottom:var(--space-4);">
          <button class="btn btn-primary" id="download-btn" style="flex:1;">Download</button>
          <button class="btn btn-secondary" id="reset-btn" style="flex:none;">Re-upload</button>
        </div>
        <div class="form-group">
          <label>Choose a Filter</label>
        </div>
        <div id="filter-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:var(--space-3);"></div>
      </div>
    </div>
  `;

  const upload = createFileUpload({
    accept: 'image/*',
    multiple: false,
    maxSizeMB: 50,
    onFilesSelected: async (files) => {
      if (files.length === 0) return;
      originalImg = await loadImageFromFile(files[0]);
      container.querySelector('#filters-content').style.display = 'block';
      renderFilterGrid();
      applyFilter('normal');
    }
  });

  container.querySelector('#upload-area').appendChild(upload.element);
  const filterGrid = container.querySelector('#filter-grid');
  const canvas = container.querySelector('#filter-canvas');
  const ctx = canvas.getContext('2d');

  const ro = new ResizeObserver(() => {
    if (originalImg) renderCurrentFilter();
  });

  function renderCurrentFilter() {
    if (!originalImg) return;
    const maxW = canvas.parentElement.clientWidth - 4;
    const scale = Math.min(maxW / originalImg.naturalWidth, 500 / originalImg.naturalHeight, 1);
    canvas.width = originalImg.naturalWidth * scale;
    canvas.height = originalImg.naturalHeight * scale;
    ctx.filter = currentFilter;
    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);
  }

  let currentFilter = '';

  function applyFilter(filterId) {
    const f = FILTERS.find(x => x.id === filterId);
    if (!f) return;
    currentFilter = f.filter;
    renderCurrentFilter();

    filterGrid.querySelectorAll('.filter-item').forEach(el => {
      el.classList.toggle('active', el.dataset.filter === filterId);
    });
  }

  function renderFilterGrid() {
    filterGrid.innerHTML = '';
    FILTERS.forEach(f => {
      const item = document.createElement('div');
      item.className = 'filter-item' + (f.id === 'normal' ? ' active' : '');
      item.dataset.filter = f.id;
      item.style.cssText = 'cursor:pointer;border-radius:var(--radius-md);overflow:hidden;border:2px solid transparent;transition:border-color .2s;';

      const thumb = document.createElement('canvas');
      const size = 140;
      thumb.width = size;
      thumb.height = size;
      const tCtx = thumb.getContext('2d');
      const s = Math.min(size / originalImg.naturalWidth, size / originalImg.naturalHeight);
      const dx = (size - originalImg.naturalWidth * s) / 2;
      const dy = (size - originalImg.naturalHeight * s) / 2;
      tCtx.filter = f.filter;
      tCtx.drawImage(originalImg, dx, dy, originalImg.naturalWidth * s, originalImg.naturalHeight * s);
      thumb.style.cssText = 'width:100%;display:block;';

      const label = document.createElement('div');
      label.textContent = f.name;
      label.style.cssText = 'padding:var(--space-2);text-align:center;font-size:var(--text-sm);font-weight:600;background:var(--color-surface);';

      item.appendChild(thumb);
      item.appendChild(label);
      item.addEventListener('click', () => applyFilter(f.id));
      filterGrid.appendChild(item);
    });
  }

  container.querySelector('#download-btn').addEventListener('click', () => {
    if (!originalImg) return;
    const dlCanvas = document.createElement('canvas');
    dlCanvas.width = originalImg.naturalWidth;
    dlCanvas.height = originalImg.naturalHeight;
    const dlCtx = dlCanvas.getContext('2d');
    dlCtx.filter = currentFilter;
    dlCtx.drawImage(originalImg, 0, 0);
    downloadCanvas(dlCanvas, 'filtered-image.png');
    showToast({ message: 'Downloaded!', type: 'success' });
  });

  container.querySelector('#reset-btn').addEventListener('click', () => {
    originalImg = null;
    container.querySelector('#filters-content').style.display = 'none';
  });
}

export function destroy() {}
