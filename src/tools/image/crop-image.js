import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { canvasToBlob } from './image-utils.js';

export const toolConfig = {
  id: 'crop-image',
  name: 'Image Cropper',
  category: 'image',
  description: 'Crop images with interactive selection. Preset aspect ratios available.',
  icon: '✂️',
  accept: 'image/*',
  maxSizeMB: 50,
  keywords: ['crop image', 'cut image', 'image cropper'],
  steps: ['Upload an image', 'Drag to select crop area', 'Choose aspect ratio preset (optional)', 'Download cropped image'],
  faqs: [
    { question: 'Can I crop to a specific aspect ratio?', answer: 'Yes. Use the preset buttons for common ratios like 1:1, 4:3, 16:9.' }
  ]
};

const CROP_HTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div style="text-align:center;margin:var(--space-4) 0;">
          <div id="crop-container" style="position:relative;display:inline-block;cursor:crosshair;max-width:100%;"></div>
        </div>
        <div style="display:flex;gap:var(--space-2);justify-content:center;flex-wrap:wrap;margin-bottom:var(--space-4);">
          <button class="btn btn-sm btn-secondary" data-ratio="1:1">1:1</button>
          <button class="btn btn-sm btn-secondary" data-ratio="4:3">4:3</button>
          <button class="btn btn-sm btn-secondary" data-ratio="16:9">16:9</button>
          <button class="btn btn-sm btn-secondary" data-ratio="3:2">3:2</button>
          <button class="btn btn-sm btn-ghost" data-ratio="free">Free</button>
        </div>
        <div id="crop-info" style="text-align:center;font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);"></div>
        <button class="btn btn-primary btn-lg" id="crop-btn" style="width:100%;" disabled>Crop & Download</button>
      </div>
    </div>`;

function updateSelection(cropContainer, cropStart, cropEnd, currentRatio, containerW, containerH) {
  const selection = cropContainer.querySelector('#crop-selection');
  let x1 = Math.min(cropStart.x, cropEnd.x);
  let y1 = Math.min(cropStart.y, cropEnd.y);
  let x2 = Math.max(cropStart.x, cropEnd.x);
  let y2 = Math.max(cropStart.y, cropEnd.y);
  if (currentRatio) {
    let w = x2 - x1; let h = w / currentRatio;
    if (y1 + h > containerH) { h = containerH - y1; w = h * currentRatio; }
    x2 = x1 + w; y2 = y1 + h;
  }
  selection.style.display = 'block';
  selection.style.left = x1 + 'px'; selection.style.top = y1 + 'px';
  selection.style.width = (x2 - x1) + 'px'; selection.style.height = (y2 - y1) + 'px';
}

function initCropper(container, originalImg, cropContainer, cropBtn, cropInfo, getCropState, setCropState) {
  const maxW = 700;
  const scale = Math.min(maxW / originalImg.naturalWidth, 1);
  const w = originalImg.naturalWidth * scale;
  const h = originalImg.naturalHeight * scale;
  cropContainer.style.width = w + 'px'; cropContainer.style.height = h + 'px';
  cropContainer.innerHTML = `
    <img src="${originalImg.src}" style="width:100%;height:100%;display:block;user-select:none;" draggable="false">
    <div id="crop-overlay" style="position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.3);pointer-events:none;display:none;"></div>
    <div id="crop-selection" style="position:absolute;border:2px dashed white;display:none;pointer-events:auto;cursor:move;box-shadow:0 0 0 9999px rgba(0,0,0,0.4);"></div>`;
  const selection = cropContainer.querySelector('#crop-selection');
  let isMoving = false, moveStartX = 0, moveStartY = 0, selectionStartX = 0, selectionStartY = 0;

  selection.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    const { cropStart, cropEnd } = getCropState();
    moveStartX = e.clientX; moveStartY = e.clientY;
    selectionStartX = Math.min(cropStart.x, cropEnd.x); selectionStartY = Math.min(cropStart.y, cropEnd.y);
    isMoving = true; setCropState({ isDragging: true });
  });

  cropContainer.addEventListener('mousedown', (e) => {
    if (e.target === selection) return;
    const rect = cropContainer.getBoundingClientRect();
    const cs = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setCropState({ cropStart: cs, cropEnd: { ...cs }, isDragging: true });
    selection.style.display = 'block';
  });

  document.addEventListener('mousemove', (e) => {
    const { isDragging, cropStart, cropEnd } = getCropState();
    if (!isDragging) return;
    const rect = cropContainer.getBoundingClientRect();
    if (isMoving && cropStart && cropEnd) {
      const selW = Math.abs(cropEnd.x - cropStart.x); const selH = Math.abs(cropEnd.y - cropStart.y);
      let newX = Math.max(0, Math.min(selectionStartX + (e.clientX - moveStartX), w - selW));
      let newY = Math.max(0, Math.min(selectionStartY + (e.clientY - moveStartY), h - selH));
      setCropState({ cropStart: { x: newX, y: newY }, cropEnd: { x: newX + selW, y: newY + selH } });
    } else {
      setCropState({ cropEnd: { x: Math.max(0, Math.min(e.clientX - rect.left, w)), y: Math.max(0, Math.min(e.clientY - rect.top, h)) } });
    }
    const cs = getCropState();
    if (cs.cropStart && cs.cropEnd) updateSelection(cropContainer, cs.cropStart, cs.cropEnd, cs.currentRatio, w, h);
  });

  document.addEventListener('mouseup', () => {
    const { isDragging, cropStart, cropEnd } = getCropState();
    if (isDragging) {
      setCropState({ isDragging: false, isMoving: false });
      if (cropStart && cropEnd) {
        cropBtn.disabled = false;
        const sw = Math.abs(cropEnd.x - cropStart.x) / scale; const sh = Math.abs(cropEnd.y - cropStart.y) / scale;
        cropInfo.textContent = `Selection: ${Math.round(sw)} × ${Math.round(sh)}px`;
      }
    }
  });

  container.querySelectorAll('[data-ratio]').forEach(btn => {
    btn.addEventListener('click', () => {
      const r = btn.dataset.ratio;
      const currentRatio = r === 'free' ? null : r.split(':').reduce((a, b) => a / b);
      setCropState({ currentRatio });
      container.querySelectorAll('[data-ratio]').forEach(b => { b.classList.remove('btn-primary'); b.classList.add('btn-secondary'); });
      btn.classList.remove('btn-secondary'); btn.classList.add('btn-primary');
      const scaledW = originalImg.naturalWidth * scale; const scaledH = originalImg.naturalHeight * scale;
      const cs = getCropState();
      if (!cs.cropStart || !cs.cropEnd) {
        const centerX = scaledW / 2; const centerY = scaledH / 2;
        let width, height;
        if (currentRatio) { height = scaledH * 0.8; width = height * currentRatio; if (width > scaledW) { width = scaledW * 0.8; height = width / currentRatio; } }
        else { width = scaledW * 0.8; height = scaledH * 0.8; }
        setCropState({ cropStart: { x: centerX - width/2, y: centerY - height/2 }, cropEnd: { x: centerX + width/2, y: centerY + height/2 } });
      }
      updateSelection(cropContainer, getCropState().cropStart, getCropState().cropEnd, currentRatio, scaledW, scaledH);
    });
  });
}

export function render(container) {
  let originalImg = null;
  const cropState = { cropStart: null, cropEnd: null, isDragging: false, currentRatio: null };

  const upload = createFileUpload({
    accept: 'image/*', multiple: false, maxSizeMB: 50,
    onFilesSelected: async (files) => {
      if (files.length === 0) return;
      originalImg = new Image();
      originalImg.onload = () => { optionsArea.style.display = 'block'; initCropper(container, originalImg, cropContainer, cropBtn, cropInfo, () => cropState, (patch) => Object.assign(cropState, patch)); };
      originalImg.src = URL.createObjectURL(files[0]);
    }
  });

  container.innerHTML = CROP_HTML;
  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const cropContainer = container.querySelector('#crop-container');
  const cropInfo = container.querySelector('#crop-info');
  const cropBtn = container.querySelector('#crop-btn');

  cropBtn.addEventListener('click', () => {
    if (!originalImg || !cropState.cropStart || !cropState.cropEnd) return;
    const scale = Math.min(700 / originalImg.naturalWidth, 1);
    const sx = Math.min(cropState.cropStart.x, cropState.cropEnd.x) / scale;
    const sy = Math.min(cropState.cropStart.y, cropState.cropEnd.y) / scale;
    const sw = Math.abs(cropState.cropEnd.x - cropState.cropStart.x) / scale;
    const sh = Math.abs(cropState.cropEnd.y - cropState.cropStart.y) / scale;
    if (sw < 1 || sh < 1) { showToast({ message: 'Select a larger area', type: 'warning' }); return; }
    const canvas = document.createElement('canvas');
    canvas.width = sw; canvas.height = sh;
    canvas.getContext('2d').drawImage(originalImg, sx, sy, sw, sh, 0, 0, sw, sh);
    canvas.toBlob(blob => { downloadBlob(blob, 'cropped.png'); showToast({ message: 'Cropped!', type: 'success' }); }, 'image/png');
  });
}

export function destroy() {}
