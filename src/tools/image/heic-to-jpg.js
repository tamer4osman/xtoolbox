import heic2any from 'heic2any';
import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { canvasToBlob } from '../image/image-utils.js';

export const toolConfig = {
  id: 'heic-to-jpg',
  name: 'HEIC to JPG Converter',
  category: 'image',
  description: 'Convert iPhone HEIC photos to JPG format.',
  icon: '',
  accept: '.heic,.heif',
  maxSizeMB: 50,
  keywords: ['heic to jpg', 'heif to jpg', 'iphone to jpg', 'heic converter'],
  steps: ['Upload HEIC image(s)', 'Adjust quality', 'Click "Convert to JPG"', 'Download converted images'],
  faqs: [
    { question: 'What is HEIC?', answer: 'HEIC is Apple\'s default photo format on iPhones. It provides better compression than JPG but isn\'t widely supported.' },
    { question: 'Are multiple files supported?', answer: 'Yes, you can convert multiple HEIC files at once.' },
    { question: 'Is conversion lossless?', answer: 'No, HEIC to JPG conversion is lossy. Use 90-100% quality for best results.' }
  ]
};

export function render(container) {
  let files = [];

  const upload = createFileUpload({
    accept: '.heic,.heif',
    multiple: true,
    maxSizeMB: 50,
    onFilesSelected: async (selectedFiles) => {
      if (selectedFiles.length === 0) return;
      
      files = Array.from(selectedFiles);
      
      totalFiles.textContent = files.length + ' HEIC file(s)';
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
          <label>Quality: <strong id="quality-display">92</strong>%</label>
          <input type="range" id="quality-slider" min="10" max="100" value="92" step="5" class="range-slider-input">
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
        <button class="btn btn-primary btn-lg" id="convert-btn" style="width:100%;">Convert to JPG</button>
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
  const qualitySlider = container.querySelector('#quality-slider');
  const qualityDisplay = container.querySelector('#quality-display');
  const convertBtn = container.querySelector('#convert-btn');
  const processing = container.querySelector('#processing');
  const progressPct = container.querySelector('#progress-pct');
  const resizeWidth = container.querySelector('#resize-width');
  const resizeHeight = container.querySelector('#resize-height');
  const maintainAspect = container.querySelector('#maintain-aspect');

  qualitySlider.addEventListener('input', () => { qualityDisplay.textContent = qualitySlider.value; });
  
  // Maintain aspect ratio (estimated since we don't know dimensions until conversion)
  resizeWidth.addEventListener('input', () => {
    if (maintainAspect.checked && resizeWidth.value) {
      // HEIC images are typically 4:3 or 16:9, assume 4:3
      resizeHeight.value = Math.round(resizeWidth.value * 0.75);
    }
  });
  
  resizeHeight.addEventListener('input', () => {
    if (maintainAspect.checked && resizeHeight.value) {
      resizeWidth.value = Math.round(resizeHeight.value * 1.33);
    }
  });

  convertBtn.addEventListener('click', async () => {
    if (files.length === 0) return;
    
    processing.style.display = 'block';
    convertBtn.style.display = 'none';
    
    const quality = parseInt(qualitySlider.value) / 100;
    const targetWidth = parseInt(resizeWidth.value) || 0;
    const targetHeight = parseInt(resizeHeight.value) || 0;
    
    try {
      for (let i = 0; i < files.length; i++) {
        progressPct.textContent = Math.round(((i + 1) / files.length) * 100);
        
        const file = files[i];
        
        // Convert HEIC to Blob (JPEG)
        const blob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: quality
        });
        
        // If resize is requested, draw to canvas and resize
        let outputBlob = blob;
        if (targetWidth > 0 || targetHeight > 0) {
          const img = await createImageBitmap(blob);
          const canvas = document.createElement('canvas');
          
          let width = targetWidth || img.width;
          let height = targetHeight || img.height;
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          outputBlob = await canvasToBlob(canvas, 'image/jpeg', quality);
        }
        
        const fileName = file.name.replace(/\.heic$/i, '').replace(/\.heif$/i, '');
        downloadBlob(outputBlob, `${fileName}.jpg`);
      }
      
      showToast({ message: `Converted ${files.length} HEIC file(s) to JPG!`, type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      convertBtn.style.display = 'inline-flex';
    }
  });
}

export function destroy() {}
