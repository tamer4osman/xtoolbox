import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { canvasToBlob } from './image-utils.js';
import { createUploadTool } from './upload-tool-factory.js';

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

function svgToDimensions(svgText) {
  const w = svgText.match(/width="(\d+(?:\.\d+)?(?:px)?)"?/);
  const h = svgText.match(/height="(\d+(?:\.\d+)?(?:px)?)"?/);
  const vb = svgText.match(/viewBox="[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)"/);
  let width = parseInt(w?.[1]) || parseInt(vb?.[1]) || 800;
  let height = parseInt(h?.[1]) || parseInt(vb?.[2]) || 600;
  if (w?.[1]?.includes('px')) width = parseFloat(w[1]);
  if (h?.[1]?.includes('px')) height = parseFloat(h[1]);
  return { width: Math.round(width), height: Math.round(height) };
}

export function render(container) {
  createUploadTool({
    container,
    toolId: 'svg2png',
    fileTypeName: 'SVG',
    accept: '.svg',
    buttonText: 'Convert to PNG',
    optionsHTML: `
      <div class="form-group">
        <label>Scale: <strong id="svg2png-scale-display">2</strong>x</label>
        <input type="range" id="svg2png-scale" min="1" max="4" value="2" step="0.5">
      </div>
      <div class="form-group">
        <label>Custom Size (optional, overrides scale)</label>
        <div style="display:flex;gap:var(--space-3);align-items:center;">
          <input type="number" id="svg2png-width" placeholder="Width" class="text-input" style="width:100px;">
          <span>x</span>
          <input type="number" id="svg2png-height" placeholder="Height" class="text-input" style="width:100px;">
        </div>
      </div>
      <div class="form-group">
        <label>Background Color</label>
        <div style="display:flex;align-items:center;gap:var(--space-3);">
          <input type="color" id="svg2png-bg" value="#ffffff" class="color-input" style="width:40px;height:40px;border:none;cursor:pointer;">
          <label style="display:flex;align-items:center;gap:var(--space-2);">
            <input type="checkbox" id="svg2png-transparent" checked> Transparent
          </label>
        </div>
      </div>
    `,
    async onConvert({ files, uploadedData, progress }) {
      const svgs = [];
      for (const file of files) {
        svgs.push(await file.text());
      }

      const scale = parseFloat(container.querySelector('#svg2png-scale').value);
      const targetW = parseInt(container.querySelector('#svg2png-width').value) || 0;
      const targetH = parseInt(container.querySelector('#svg2png-height').value) || 0;
      const transparent = container.querySelector('#svg2png-transparent').checked;
      const bgColor = container.querySelector('#svg2png-bg').value;

      for (let i = 0; i < svgs.length; i++) {
        progress(Math.round(((i + 1) / svgs.length) * 100));
        const { width: origW, height: origH } = svgToDimensions(svgs[i]);
        const width = targetW || Math.round(origW * scale);
        const height = targetH || Math.round(origH * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!transparent) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, width, height);
        }

        const url = URL.createObjectURL(new Blob([svgs[i]], { type: 'image/svg+xml;charset=utf-8' }));
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => { ctx.drawImage(img, 0, 0, width, height); URL.revokeObjectURL(url); resolve(); };
          img.onerror = reject;
          img.src = url;
        });

        downloadBlob(await canvasToBlob(canvas, 'image/png'), files[i].name.replace(/\.svg$/i, '') + '.png');
      }
      showToast({ message: `Converted ${svgs.length} SVG(s) to PNG!`, type: 'success' });
    }
  });

  container.querySelector('#svg2png-scale')?.addEventListener('input', (e) => {
    container.querySelector('#svg2png-scale-display').textContent = e.target.value;
  });
  container.querySelector('#svg2png-transparent')?.addEventListener('change', (e) => {
    container.querySelector('#svg2png-bg').disabled = e.target.checked;
  });
}

export function destroy() {}
