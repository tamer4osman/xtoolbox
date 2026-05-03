import { jsPDF } from 'jspdf';
import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';

export const toolConfig = {
  id: 'image-to-pdf',
  name: 'Image to PDF',
  category: 'pdf',
  description: 'Convert images into a PDF document.',
  icon: '📄',
  accept: 'image/*',
  maxSizeMB: 50,
  keywords: ['image to pdf', 'jpg to pdf', 'png to pdf'],
  steps: ['Upload one or more images', 'Choose page size', 'Click "Convert to PDF"', 'Download the PDF'],
  faqs: [
    { question: 'What image formats are supported?', answer: 'JPG, PNG, WebP, GIF, BMP, and SVG.' },
    { question: 'Will images be scaled?', answer: 'Images are scaled to fit the chosen page size while maintaining aspect ratio.' }
  ]
};

export function render(container) {
  let files = [];

  const upload = createFileUpload({
    accept: 'image/*',
    multiple: true,
    maxSizeMB: 50,
    maxFiles: 50,
    onFilesSelected: (f) => {
      files = f;
      convertBtn.style.display = f.length > 0 ? 'inline-flex' : 'none';
      optionsArea.style.display = f.length > 0 ? 'block' : 'none';
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div class="form-group">
          <label>Page Size</label>
          <select id="size-select" class="select-input">
            <option value="a4">A4</option>
            <option value="letter">Letter</option>
            <option value="fit">Fit to Image</option>
          </select>
        </div>
        <div class="form-group">
          <label>Orientation</label>
          <select id="orient-select" class="select-input">
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
            <option value="auto">Auto (match image)</option>
          </select>
        </div>
        <button class="btn btn-primary btn-lg" id="convert-btn" style="display:none;width:100%;">Convert to PDF</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Creating PDF...</p></div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const optionsArea = container.querySelector('#options-area');
  const convertBtn = container.querySelector('#convert-btn');
  const processing = container.querySelector('#processing');

  convertBtn.addEventListener('click', async () => {
    if (files.length === 0) return;
    const pageSize = container.querySelector('#size-select').value;
    const orientation = container.querySelector('#orient-select').value;

    processing.style.display = 'block';
    convertBtn.style.display = 'none';

    try {
      let pdf = null;

      for (let i = 0; i < files.length; i++) {
        const imgData = await loadImageAsDataUrl(files[i]);
        const img = await loadImage(imgData);

        const isLandscape = orientation === 'landscape' || (orientation === 'auto' && img.width > img.height);
        const orient = isLandscape ? 'landscape' : 'portrait';

        if (pageSize === 'fit') {
          // Create page matching image dimensions (in points, 72dpi)
          const w = img.width * 72 / 96;
          const h = img.height * 72 / 96;
          if (i === 0) pdf = new jsPDF({ orientation: w > h ? 'landscape' : 'portrait', unit: 'px', format: [w, h] });
          else pdf.addPage([w, h], w > h ? 'landscape' : 'portrait');
          pdf.addImage(imgData, 'JPEG', 0, 0, w, h);
        } else {
          if (i === 0) pdf = new jsPDF({ orientation: orient, format: pageSize });
          else pdf.addPage(pageSize, orient);
          const pageW = pdf.internal.pageSize.getWidth();
          const pageH = pdf.internal.pageSize.getHeight();
          const ratio = Math.min(pageW / img.width, pageH / img.height);
          const w = img.width * ratio;
          const h = img.height * ratio;
          const x = (pageW - w) / 2;
          const y = (pageH - h) / 2;
          pdf.addImage(imgData, 'JPEG', x, y, w, h);
        }
      }

      pdf.save('converted.pdf');
      showToast({ message: `${files.length} image(s) converted to PDF!`, type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      processing.style.display = 'none';
      convertBtn.style.display = 'inline-flex';
    }
  });
}

function loadImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function destroy() {}
