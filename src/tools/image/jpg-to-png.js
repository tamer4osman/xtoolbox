import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { loadImageFromFile, canvasToBlob } from './image-utils.js';

export const toolConfig = {
  id: 'jpg-to-png',
  name: 'JPG to PNG Converter',
  category: 'image',
  description: 'Convert JPG images to lossless PNG format.',
  icon: '',
  accept: '.jpg,.jpeg',
  maxSizeMB: 50,
  keywords: ['jpg to png', 'jpeg to png', 'convert jpg', 'jpg converter'],
  steps: ['Upload JPG image(s)', 'Optionally resize', 'Click "Convert to PNG"', 'Download converted images'],
  faqs: [
    { question: 'Why convert to PNG?', answer: 'PNG is lossless, supports transparency, and is better for graphics, logos, and screenshots.' },
    { question: 'Will quality improve?', answer: 'No, JPG artifacts are preserved. PNG prevents further quality loss from re-saving.' },
    { question: 'Can I convert multiple JPGs?', answer: 'Yes, upload multiple JPGs and they will all be converted.' }
  ]
};

export function render(container) {
  let images = [];
  let files = [];

  const upload = createFileUpload({
    accept: '.jpg,.jpeg',
    multiple: true,
    maxSizeMB: 50,
    onFilesSelected: async (selectedFiles) => {
      if (selectedFiles.length === 0) return;
      
      files = Array.from(selectedFiles);
      images = [];
      
      for (const file of files) {
        const img = await loadImageFromFile(file);
        images.push(img);
      }
      
      totalFiles.textContent = files.length + ' JPG file(s)';
      totalSize.textContent = (files.reduce((sum, f) => sum + f.size, 0) / 1024).toFixed(1) + ' KB total';
      optionsArea.style.display = 'block';
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div style="display:flex;gap:var(--space-6);margin-bottom:var(--space-4);">
          <div><span style="font-size:var(--text-xs);color:var(--color-text-muted);">Files</span><div id="total-files" style="font-weight:600;">-</div></div>
          <div><span style="font-size:var(--text-xs);color:var(--color-text-muted);">Total Size</span><div id="total-size" style="font-weight:600;">-</div></div>
        </div>
        <div class="form-group">
          <label>Resize (optional)</label>
          <div style="display:flex;gap:var(--space-3);align-items:center;">
            <input type="number" id="resize-width" placeholder="Width" class="text-input" style="width:100px;">
            <span>×</span>
            <input type="number" id="resize-height" placeholder="Height" class="text-input" style="width:100px;">
            <label style="display:flex;align-items:center;gap:var(--space-2);margin-left:var(--space-3);">
              <input type="checkbox" id="maintain-aspect" checked> Keep aspect ratio
            </label>
          </div>
        </div>
        <button class="btn btn-primary btn-lg" id="convert-btn" style="width:100%;">Convert to PNG</button>
        <div class="tool-processing" id="processing" style="display:none;">
          <div class="spinner"></div>
          <p>Converting... <span id="progress-pct">0</span>%</p>
        </div>
      </div>
    </div>
    <style>
      .text-input { padding:var(--space-2);border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-surface);color:var(--color-text); }
    </style>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const totalFiles = container.querySelector('#total-files');
  const totalSize = container.querySelector('#total-size');
  const convertBtn = container.querySelector('#convert-btn');
  const processing = container.querySelector('#processing');
  const progressPct = container.querySelector('#progress-pct');
  const resizeWidth = container.querySelector('#resize-width');
  const resizeHeight = container.querySelector('#resize-height');
  const maintainAspect = container.querySelector('#maintain-aspect');
  
  // Maintain aspect ratio
  resizeWidth.addEventListener('input', () => {
    if (maintainAspect.checked && images.length > 0 && resizeWidth.value) {
      const ratio = images[0].naturalHeight / images[0].naturalWidth;
      resizeHeight.value = Math.round(resizeWidth.value * ratio);
    }
  });
  
  resizeHeight.addEventListener('input', () => {
    if (maintainAspect.checked && images.length > 0 && resizeHeight.value) {
      const ratio = images[0].naturalWidth / images[0].naturalHeight;
      resizeWidth.value = Math.round(resizeHeight.value * ratio);
    }
  });

  convertBtn.addEventListener('click', async () => {
    if (images.length === 0) return;
    
    processing.style.display = 'block';
    convertBtn.style.display = 'none';
    
    const targetWidth = parseInt(resizeWidth.value) || 0;
    const targetHeight = parseInt(resizeHeight.value) || 0;
    
    try {
      for (let i = 0; i < images.length; i++) {
        progressPct.textContent = Math.round(((i + 1) / images.length) * 100);
        
        const img = images[i];
        const canvas = document.createElement('canvas');
        
        let width = targetWidth || img.naturalWidth;
        let height = targetHeight || img.naturalHeight;
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const blob = await canvasToBlob(canvas, 'image/png');
        const fileName = files[i].name.replace(/\.jpe?g$/i, '');
        downloadBlob(blob, `${fileName}.png`);
      }
      
      showToast({ message: `Converted ${images.length} JPG(s) to PNG!`, type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      convertBtn.style.display = 'inline-flex';
    }
  });
}

export function destroy() {}
