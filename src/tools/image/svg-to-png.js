import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { canvasToBlob } from './image-utils.js';

export const toolConfig = {
  id: 'svg-to-png',
  name: 'SVG to PNG Converter',
  category: 'image',
  description: 'Convert SVG images to PNG with size and background control.',
  icon: '',
  accept: '.svg',
  maxSizeMB: 50,
  keywords: ['svg to png', 'convert svg', 'svg to image', 'svg converter'],
  steps: ['Upload SVG image(s)', 'Set output size and background', 'Click "Convert to PNG"', 'Download converted images'],
  faqs: [
    { question: 'Will the PNG be high quality?', answer: 'Yes, you can set the output resolution up to 4x the original SVG size for crisp results.' },
    { question: 'What happens to transparency?', answer: 'SVG transparency is preserved by default. You can set a solid background color if needed.' },
    { question: 'Can I convert multiple SVGs?', answer: 'Yes, upload multiple SVGs and they will all be converted.' }
  ]
};

export function render(container) {
  let svgs = [];
  let files = [];

  const upload = createFileUpload({
    accept: '.svg',
    multiple: true,
    maxSizeMB: 50,
    onFilesSelected: async (selectedFiles) => {
      if (selectedFiles.length === 0) return;
      
      files = Array.from(selectedFiles);
      svgs = [];
      
      for (const file of files) {
        const text = await file.text();
        svgs.push(text);
      }
      
      totalFiles.textContent = files.length + ' SVG file(s)';
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
          <label>Scale: <strong id="scale-display">2</strong>x</label>
          <input type="range" id="scale-slider" min="1" max="4" value="2" step="0.5" class="range-slider-input">
        </div>
        <div class="form-group">
          <label>Custom Size (optional, overrides scale)</label>
          <div style="display:flex;gap:var(--space-3);align-items:center;">
            <input type="number" id="resize-width" placeholder="Width" class="text-input" style="width:100px;">
            <span>×</span>
            <input type="number" id="resize-height" placeholder="Height" class="text-input" style="width:100px;">
          </div>
        </div>
        <div class="form-group">
          <label>Background Color</label>
          <div style="display:flex;align-items:center;gap:var(--space-3);">
            <input type="color" id="bg-color" value="#ffffff" class="color-input" style="width:40px;height:40px;border:none;cursor:pointer;">
            <label style="display:flex;align-items:center;gap:var(--space-2);">
              <input type="checkbox" id="transparent-bg" checked> Transparent
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
      .color-input { border:1px solid var(--color-border);border-radius:var(--radius-sm); }
      .text-input { padding:var(--space-2);border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-surface);color:var(--color-text); }
    </style>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const totalFiles = container.querySelector('#total-files');
  const totalSize = container.querySelector('#total-size');
  const scaleSlider = container.querySelector('#scale-slider');
  const scaleDisplay = container.querySelector('#scale-display');
  const bgColor = container.querySelector('#bg-color');
  const transparentBg = container.querySelector('#transparent-bg');
  const convertBtn = container.querySelector('#convert-btn');
  const processing = container.querySelector('#processing');
  const progressPct = container.querySelector('#progress-pct');
  const resizeWidth = container.querySelector('#resize-width');
  const resizeHeight = container.querySelector('#resize-height');

  scaleSlider.addEventListener('input', () => { scaleDisplay.textContent = scaleSlider.value; });
  
  transparentBg.addEventListener('change', () => {
    bgColor.disabled = transparentBg.checked;
  });

  function svgToDimensions(svgText) {
    const widthMatch = svgText.match(/width="(\d+(?:\.\d+)?(?:px)?)"?/);
    const heightMatch = svgText.match(/height="(\d+(?:\.\d+)?(?:px)?)"?/);
    const viewBoxMatch = svgText.match(/viewBox="[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)"/);
    
    let width = parseInt(widthMatch?.[1]) || parseInt(viewBoxMatch?.[1]) || 800;
    let height = parseInt(heightMatch?.[1]) || parseInt(viewBoxMatch?.[2]) || 600;
    
    if (widthMatch?.[1]?.includes('px')) width = parseFloat(widthMatch[1]);
    if (heightMatch?.[1]?.includes('px')) height = parseFloat(heightMatch[1]);
    
    return { width: Math.round(width), height: Math.round(height) };
  }

  convertBtn.addEventListener('click', async () => {
    if (svgs.length === 0) return;
    
    processing.style.display = 'block';
    convertBtn.style.display = 'none';
    
    const scale = parseFloat(scaleSlider.value);
    const targetWidth = parseInt(resizeWidth.value) || 0;
    const targetHeight = parseInt(resizeHeight.value) || 0;
    const useTransparent = transparentBg.checked;
    const bgColorValue = bgColor.value;
    
    try {
      for (let i = 0; i < svgs.length; i++) {
        progressPct.textContent = Math.round(((i + 1) / svgs.length) * 100);
        
        const svgText = svgs[i];
        const { width: origWidth, height: origHeight } = svgToDimensions(svgText);
        
        const width = targetWidth || Math.round(origWidth * scale);
        const height = targetHeight || Math.round(origHeight * scale);
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!useTransparent) {
          ctx.fillStyle = bgColorValue;
          ctx.fillRect(0, 0, width, height);
        }
        
        const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, width, height);
            URL.revokeObjectURL(url);
            resolve();
          };
          img.onerror = reject;
          img.src = url;
        });
        
        const blob = await canvasToBlob(canvas, 'image/png');
        const fileName = files[i].name.replace(/\.svg$/i, '');
        downloadBlob(blob, `${fileName}.png`);
      }
      
      showToast({ message: `Converted ${svgs.length} SVG(s) to PNG!`, type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      convertBtn.style.display = 'inline-flex';
    }
  });
}

export function destroy() {}
