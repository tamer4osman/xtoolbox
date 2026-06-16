import { optimizeSvg } from './svg-optimizer.js';
import { downloadBlob } from '../../utils/file.js';

export const toolConfig = {
  id: 'svg-icon-editor',
  name: 'SVG Icon Editor',
  category: 'css',
  description: 'Upload, view, edit attributes, and optimize SVG icons',
  icon: '🎨',
  keywords: ['svg', 'icon', 'editor', 'optimize', 'vector'],
  accept: '.svg',
  maxSizeMB: 5
};

const defaultPalette = ['#000000', '#ffffff', '#ff5722', '#4caf50', '#2196f3', '#9c27b0', '#ffc107', '#607d8b'];

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <h1>${toolConfig.name}</h1>
      <p>${toolConfig.description}</p>
      <div id="icon-editor"></div>
    </div>
  `;

  const editor = container.querySelector('#icon-editor');
  let originalSvg = '';
  let currentSvg = '';
  let fileName = 'icon.svg';

  editor.innerHTML = `
    <div class="icon-editor-layout" style="display:grid;grid-template-columns:1fr 280px;gap:var(--space-4);align-items:start;">
      <div class="preview-area" style="background:var(--color-surface);border-radius:var(--radius-lg);padding:var(--space-4);min-height:300px;display:flex;align-items:center;justify-content:center;">
        <div class="preview-placeholder" style="text-align:center;color:var(--color-text-muted);">
          <div style="font-size:48px;margin-bottom:var(--space-2);">📤</div>
          <div>Drop SVG file or paste SVG code</div>
        </div>
        <div class="svg-preview" style="display:none;width:200px;height:200px;align-items:center;justify-content:center;"></div>
      </div>
      <div class="controls-area" style="display:flex;flex-direction:column;gap:var(--space-3);">
        <div class="upload-section">
          <input type="file" id="svg-file-input" accept=".svg" hidden />
          <div class="paste-section" style="margin-bottom:var(--space-3);">
            <textarea id="svg-paste-input" placeholder="Or paste SVG code here..." style="width:100%;height:80px;padding:var(--space-2);border:var(--border-md);border-radius:var(--radius-md);font-family:monospace;font-size:var(--text-xs);resize:vertical;"></textarea>
            <button class="btn btn-primary" id="paste-svg-btn" style="margin-top:var(--space-2);width:100%;">Load SVG</button>
          </div>
        </div>
        <div class="edit-controls" style="display:none;flex-direction:column;gap:var(--space-3);">
          <div style="font-weight:600;font-size:var(--text-sm);">Edit Attributes</div>
          <div class="form-group">
            <label style="font-size:var(--text-xs);">Size</label>
            <input type="range" id="size-slider" min="16" max="256" value="128" style="width:100%;" />
            <span id="size-val" style="font-size:var(--text-xs);">128px</span>
          </div>
          <div class="form-group">
            <label style="font-size:var(--text-xs);">Fill</label>
            <div class="color-palette" style="display:flex;gap:var(--space-1);flex-wrap:wrap;"></div>
            <input type="color" id="fill-color" value="#000000" style="width:100%;height:32px;cursor:pointer;" />
          </div>
          <div class="form-group">
            <label style="font-size:var(--text-xs);">Stroke</label>
            <div class="stroke-palette" style="display:flex;gap:var(--space-1);flex-wrap:wrap;"></div>
            <input type="color" id="stroke-color" value="#000000" style="width:100%;height:32px;cursor:pointer;" />
          </div>
          <div class="form-group">
            <label style="font-size:var(--text-xs);">Stroke Width</label>
            <input type="range" id="stroke-width-slider" min="0" max="10" value="0" step="0.5" style="width:100%;" />
            <span id="stroke-width-val" style="font-size:var(--text-xs);">0px</span>
          </div>
          <div style="font-weight:600;font-size:var(--text-sm);margin-top:var(--space-2);">Optimize</div>
          <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer;">
            <input type="checkbox" id="opt-remove-comments" checked />
            <span style="font-size:var(--text-xs);">Remove comments</span>
          </label>
          <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer;">
            <input type="checkbox" id="opt-remove-metadata" checked />
            <span style="font-size:var(--text-xs);">Remove metadata</span>
          </label>
          <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer;">
            <input type="checkbox" id="opt-remove-empty-groups" checked />
            <span style="font-size:var(--text-xs);">Remove empty groups</span>
          </label>
          <div class="form-group">
            <label style="font-size:var(--text-xs);">Precision</label>
            <input type="range" id="opt-precision" min="0" max="5" value="2" style="width:100%;" />
            <span id="opt-precision-val" style="font-size:var(--text-xs);">2</span>
          </div>
          <div style="display:flex;gap:var(--space-2);margin-top:var(--space-2);">
            <button class="btn btn-secondary" id="download-btn" style="flex:1;">Download</button>
            <button class="btn btn-ghost" id="reset-btn">Reset</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const svgFileInput = editor.querySelector('#svg-file-input');
  const svgPasteInput = editor.querySelector('#svg-paste-input');
  const pasteSvgBtn = editor.querySelector('#paste-svg-btn');
  const previewPlaceholder = editor.querySelector('.preview-placeholder');
  const svgPreview = editor.querySelector('.svg-preview');
  const editControls = editor.querySelector('.edit-controls');
  const sizeSlider = editor.querySelector('#size-slider');
  const sizeVal = editor.querySelector('#size-val');
  const fillColor = editor.querySelector('#fill-color');
  const strokeColor = editor.querySelector('#stroke-color');
  const strokeWidthSlider = editor.querySelector('#stroke-width-slider');
  const strokeWidthVal = editor.querySelector('#stroke-width-val');
  const optRemoveComments = editor.querySelector('#opt-remove-comments');
  const optRemoveMetadata = editor.querySelector('#opt-remove-metadata');
  const optRemoveEmptyGroups = editor.querySelector('#opt-remove-empty-groups');
  const optPrecision = editor.querySelector('#opt-precision');
  const optPrecisionVal = editor.querySelector('#opt-precision-val');
  const downloadBtn = editor.querySelector('#download-btn');
  const resetBtn = editor.querySelector('#reset-btn');

  const colorPalette = editor.querySelector('.color-palette');
  const strokePalette = editor.querySelector('.stroke-palette');

  defaultPalette.forEach(c => {
    const btn1 = document.createElement('button');
    btn1.style.cssText = 'width:24px;height:24px;background:' + c + ';border:2px solid var(--color-border);border-radius:var(--radius-sm);cursor:pointer;';
    btn1.addEventListener('click', () => { fillColor.value = c; updateSvg(); });
    colorPalette.appendChild(btn1);

    const btn2 = document.createElement('button');
    btn2.style.cssText = 'width:24px;height:24px;background:' + c + ';border:2px solid var(--color-border);border-radius:var(--radius-sm);cursor:pointer;';
    btn2.addEventListener('click', () => { strokeColor.value = c; updateSvg(); });
    strokePalette.appendChild(btn2);
  });

  const dropArea = editor.querySelector('.preview-area');

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
    dropArea.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); });
  });

  dropArea.addEventListener('drop', e => {
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'image/svg+xml') loadSvgFile(file);
  });

  dropArea.addEventListener('click', () => svgFileInput.click());
  svgFileInput.addEventListener('change', e => { if (e.target.files[0]) loadSvgFile(e.target.files[0]); });

  function loadSvgFile(file) {
    if (!file) return;
    fileName = file.name.replace('.svg', '') + '.svg';
    const reader = new FileReader();
    reader.onload = e => {
      originalSvg = e.target.result;
      currentSvg = originalSvg;
      showPreview();
    };
    reader.readAsText(file);
  }

  pasteSvgBtn.addEventListener('click', () => {
    const val = svgPasteInput.value.trim();
    if (!val || !val.includes('<svg')) return;
    fileName = 'pasted.svg';
    originalSvg = val;
    currentSvg = val;
    showPreview();
  });

  function showPreview() {
    if (!originalSvg) return;
    previewPlaceholder.style.display = 'none';
    svgPreview.style.display = 'flex';
    svgPreview.innerHTML = currentSvg;
    const svgEl = svgPreview.querySelector('svg');
    if (svgEl) {
      svgEl.style.width = '100%';
      svgEl.style.height = '100%';
    }
    editControls.style.display = 'flex';
  }

  function updateSvg() {
    if (!originalSvg) return;
    let svg = originalSvg;

    svg = svg.replace(/<svg/, `<svg width="${sizeSlider.value}" height="${sizeSlider.value}"`);

    if (fillColor.value && fillColor.value !== '#000000') {
      svg = svg.replace(/fill="[^"]*"/g, '').replace(/fill=""/, '');
      svg = svg.replace(/<svg/, `<svg fill="${fillColor.value}"`);
    }

    if (strokeWidthSlider.value > 0) {
      svg = svg.replace(/stroke="[^"]*"/g, '').replace(/stroke=""/, '');
      svg = svg.replace(/<svg/, `<svg stroke="${strokeColor.value}" stroke-width="${strokeWidthSlider.value}"`);
    }

    const opts = {
      removeComments: optRemoveComments.checked,
      removeMetadata: optRemoveMetadata.checked,
      removeEmptyGroups: optRemoveEmptyGroups.checked,
      precision: parseInt(optPrecision.value)
    };
    currentSvg = optimizeSvg(svg, opts);
    svgPreview.innerHTML = currentSvg;
    const svgEl = svgPreview.querySelector('svg');
    if (svgEl) {
      svgEl.style.width = '100%';
      svgEl.style.height = '100%';
    }
  }

  sizeSlider.addEventListener('input', () => { sizeVal.textContent = sizeSlider.value + 'px'; updateSvg(); });
  fillColor.addEventListener('input', updateSvg);
  strokeColor.addEventListener('input', updateSvg);
  strokeWidthSlider.addEventListener('input', () => { strokeWidthVal.textContent = strokeWidthSlider.value + 'px'; updateSvg(); });
  optRemoveComments.addEventListener('change', updateSvg);
  optRemoveMetadata.addEventListener('change', updateSvg);
  optRemoveEmptyGroups.addEventListener('change', updateSvg);
  optPrecision.addEventListener('input', () => { optPrecisionVal.textContent = optPrecision.value; updateSvg(); });

  downloadBtn.addEventListener('click', () => {
    if (!currentSvg) return;
    downloadBlob(currentSvg, fileName, 'image/svg+xml');
  });

  resetBtn.addEventListener('click', () => {
    if (!originalSvg) return;
    currentSvg = originalSvg;
    sizeSlider.value = 128;
    sizeVal.textContent = '128px';
    fillColor.value = '#000000';
    strokeColor.value = '#000000';
    strokeWidthSlider.value = 0;
    strokeWidthVal.textContent = '0px';
    optPrecision.value = 2;
    optPrecisionVal.textContent = '2';
    showPreview();
  });
}

export function destroy() {}