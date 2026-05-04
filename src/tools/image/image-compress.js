import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';

export const toolConfig = {
  id: 'image-compress',
  name: 'Image Compressor',
  category: 'image',
  description: 'Compress images to reduce file size while maintaining quality.',
  icon: '📉',
  accept: 'image/jpeg,image/png,image/webp',
  maxSizeMB: 20,
  keywords: ['compress image', 'reduce image size', 'optimize image', 'image optimizer'],
  steps: ['Upload images', 'Choose quality', 'Download compressed'],
  faqs: [
    { question: 'What formats supported?', answer: 'JPG, PNG, and WebP images up to 20MB.' },
    { question: 'Is quality preserved?', answer: 'Yes, you can choose quality level from 10-100%.' },
    { question: 'Multiple images?', answer: 'Yes, you can upload multiple images at once.' }
  ]
};

export function render(container) {
  let images = [];
  let quality = 80;

  container.innerHTML = `
    <div class="tool-layout">
      <div class="quality-slider" style="margin-bottom:var(--space-4);">
        <label style="display:block;margin-bottom:var(--space-2);font-weight:600;">Quality: <span id="quality-value">80%</span></label>
        <input type="range" id="quality" min="10" max="100" value="80" style="width:100%;">
      </div>
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="image-list" id="image-list" style="margin:var(--space-4) 0;max-height:200px;overflow-y:auto;"></div>
      <button class="btn btn-primary btn-lg" id="compress-btn" style="display:none;width:100%;">Compress Images</button>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p>Compressing images... <span id="progress-pct">0</span>%</p>
      </div>
    </div>
    <style>
      .image-list { background:var(--color-surface);border-radius:var(--radius-lg);padding:var(--space-2); }
      .image-item { display:flex;align-items:center;justify-content:space-between;padding:var(--space-2);border-bottom:1px solid var(--color-border); }
      .image-item:last-child { border-bottom:none; }
      .image-item span { flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
    </style>
  `;

  const upload = createFileUpload({
    accept: 'image/jpeg,image/png,image/webp',
    multiple: true,
    maxSizeMB: 20,
    onFilesSelected: (files) => {
      images = [...images, ...files];
      updateImageList();
    }
  });

  container.querySelector('#upload-area').appendChild(upload.element);
  
  const qualitySlider = container.querySelector('#quality');
  const qualityValue = container.querySelector('#quality-value');
  const compressBtn = container.querySelector('#compress-btn');
  const processing = container.querySelector('#processing');
  const progressPct = container.querySelector('#progress-pct');
  const imageList = container.querySelector('#image-list');

  qualitySlider.addEventListener('input', (e) => {
    quality = parseInt(e.target.value);
    qualityValue.textContent = quality + '%';
  });

  function updateImageList() {
    imageList.innerHTML = images.map((img, i) => `
      <div class="image-item">
        <span>${img.name}</span>
        <button onclick="this.parentElement.remove();images.splice(${i},1);updateList()" style="background:none;border:none;color:red;cursor:pointer;">✕</button>
      </div>
    `).join('');
    compressBtn.style.display = images.length > 0 ? 'inline-flex' : 'none';
  }

  container.updateList = updateImageList;

  compressBtn.addEventListener('click', async () => {
    if (images.length === 0) return;

    processing.style.display = 'block';
    compressBtn.style.display = 'none';

    try {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const url = URL.createObjectURL(img);
        
        const image = new Image();
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
          image.src = url;
        });

        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        canvas.toBlob((blob) => {
          const fileNameWithoutExt = img.name.replace(/\.[^/.]+$/, '');
          downloadBlob(blob, `${fileNameWithoutExt}-compressed.jpg`);
          
          URL.revokeObjectURL(url);
          
          progressPct.textContent = Math.round(((i + 1) / images.length) * 100);
          
          if (i === images.length - 1) {
            showToast({ message: 'All images compressed!', type: 'success' });
            processing.style.display = 'none';
            compressBtn.style.display = 'inline-flex';
          }
        }, 'image/jpeg', quality / 100);
        
        await new Promise(r => setTimeout(r, 100));
      }
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
      processing.style.display = 'none';
      compressBtn.style.display = 'inline-flex';
    }
  });
}

export function destroy() {}