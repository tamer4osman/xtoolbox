import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { loadImageFromFile } from './image-utils.js';

export const toolConfig = {
  id: 'png-to-svg',
  name: 'PNG to SVG Converter',
  category: 'image',
  description: 'Convert PNG images to SVG vector format.',
  icon: '',
  accept: '.png',
  maxSizeMB: 50,
  keywords: ['png to svg', 'convert png to svg', 'png to vector', 'svg converter'],
  steps: ['Upload PNG image(s)', 'Click "Convert to SVG"', 'Download converted SVG files'],
  faqs: [
    { question: 'Is the output a true vector?', answer: 'No, the SVG contains a base64-encoded PNG. For true vectorization, use a tracing tool like Potrace.' },
    { question: 'Why convert PNG to SVG?', answer: 'SVG is widely supported in web design and can be embedded directly in HTML/CSS.' },
    { question: 'Can I convert multiple PNGs?', answer: 'Yes, upload multiple PNGs and they will all be converted.' }
  ]
};

export function render(container) {
  let images = [];
  let files = [];

  const upload = createFileUpload({
    accept: '.png',
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
      
      totalFiles.textContent = files.length + ' PNG file(s)';
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
          <label>Mode</label>
          <select id="mode-select" class="select-input">
            <option value="embed">Embed PNG in SVG (base64)</option>
            <option value="trace">Simple trace (pixel-to-rect)</option>
          </select>
        </div>
        <div class="form-group" id="trace-options" style="display:none;">
          <label>Detail Level: <strong id="detail-display">50</strong></label>
          <input type="range" id="detail-slider" min="10" max="100" value="50" step="5" class="range-slider-input">
          <p style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:var(--space-2);">Higher = more detail, larger file</p>
        </div>
        <button class="btn btn-primary btn-lg" id="convert-btn" style="width:100%;">Convert to SVG</button>
        <div class="tool-processing" id="processing" style="display:none;">
          <div class="spinner"></div>
          <p>Converting... <span id="progress-pct">0</span>%</p>
        </div>
      </div>
    </div>
    <style>
      .select-input { padding:var(--space-2);border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-surface);color:var(--color-text);width:100%; }
    </style>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const totalFiles = container.querySelector('#total-files');
  const totalSize = container.querySelector('#total-size');
  const modeSelect = container.querySelector('#mode-select');
  const traceOptions = container.querySelector('#trace-options');
  const detailSlider = container.querySelector('#detail-slider');
  const detailDisplay = container.querySelector('#detail-display');
  const convertBtn = container.querySelector('#convert-btn');
  const processing = container.querySelector('#processing');
  const progressPct = container.querySelector('#progress-pct');

  modeSelect.addEventListener('change', () => {
    traceOptions.style.display = modeSelect.value === 'trace' ? 'block' : 'none';
  });
  
  detailSlider.addEventListener('input', () => { detailDisplay.textContent = detailSlider.value; });

  convertBtn.addEventListener('click', async () => {
    if (images.length === 0) return;
    
    processing.style.display = 'block';
    convertBtn.style.display = 'none';
    
    const mode = modeSelect.value;
    const detail = parseInt(detailSlider.value);
    
    try {
      for (let i = 0; i < images.length; i++) {
        progressPct.textContent = Math.round(((i + 1) / images.length) * 100);
        
        const img = images[i];
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        let svgContent;
        
        if (mode === 'embed') {
          // Create canvas and get base64
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          
          svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <image width="${width}" height="${height}" xlink:href="${dataUrl}"/>
</svg>`;
        } else {
          // Simple pixel trace
          const canvas = document.createElement('canvas');
          const scale = Math.max(1, Math.floor(detail / 10));
          const scaledWidth = Math.ceil(width / scale);
          const scaledHeight = Math.ceil(height / scale);
          canvas.width = scaledWidth;
          canvas.height = scaledHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
          const imageData = ctx.getImageData(0, 0, scaledWidth, scaledHeight);
          
          let rects = '';
          for (let y = 0; y < scaledHeight; y++) {
            for (let x = 0; x < scaledWidth; x++) {
              const idx = (y * scaledWidth + x) * 4;
              const r = imageData.data[idx];
              const g = imageData.data[idx + 1];
              const b = imageData.data[idx + 2];
              const a = imageData.data[idx + 3] / 255;
              if (a > 0.01) {
                rects += `<rect x="${x * scale}" y="${y * scale}" width="${scale}" height="${scale}" fill="rgb(${r},${g},${b})" fill-opacity="${a.toFixed(2)}"/>`;
              }
            }
          }
          
          svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
${rects}
</svg>`;
        }
        
        const fileName = files[i].name.replace(/\.png$/i, '');
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        downloadBlob(blob, `${fileName}.svg`);
      }
      
      showToast({ message: `Converted ${images.length} PNG(s) to SVG!`, type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      convertBtn.style.display = 'inline-flex';
    }
  });
}

export function destroy() {}
