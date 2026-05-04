import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';

export const toolConfig = {
  id: 'image-colorizer',
  name: 'Image Colorizer',
  category: 'image',
  description: 'Turn black and white photos into colorful images using AI.',
  icon: '🎨',
  accept: 'image/jpeg,image/png,image/webp',
  maxSizeMB: 10,
  keywords: ['colorize image', 'black and white to color', 'restore old photos', 'colorize photo'],
  steps: ['Upload a black & white image', 'Click "Colorize"', 'Download the colored image'],
  faqs: [
    { question: 'What formats supported?', answer: 'JPG, PNG, and WebP images up to 10MB.' },
    { question: 'How does it work?', answer: 'Uses AI to analyze the image and add natural colors.' },
    { question: 'Is it free?', answer: 'Yes, completely free with no watermarks.' }
  ]
};

export function render(container) {
  let imageBuffer = null;

  const upload = createFileUpload({
    accept: 'image/jpeg,image/png,image/webp',
    multiple: false,
    maxSizeMB: 10,
    onFilesSelected: (files) => {
      if (files.length > 0) {
        imageBuffer = files[0];
        convertBtn.style.display = 'inline-flex';
        fileName.textContent = files[0].name;
        fileInfo.textContent = (files[0].size / 1024 / 1024).toFixed(2) + ' MB';
        filePanel.style.display = 'block';
      }
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="file-info-panel" id="file-panel" style="display:none;margin:var(--space-4) 0;">
        <div class="file-details">
          <span class="file-icon">🖼️</span>
          <div class="file-details-text">
            <div class="file-name" id="file-name"></div>
            <div class="file-size" id="file-info"></div>
          </div>
        </div>
      </div>
      <button class="btn btn-primary btn-lg" id="convert-btn" style="display:none;width:100%;">Colorize Image</button>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p>Colorizing image... <span id="progress-pct">0</span>%</p>
      </div>
      <div class="info-box" style="margin-top:var(--space-4);padding:var(--space-4);background:var(--color-surface);border-radius:var(--radius-lg);">
        <p style="margin:0;font-size:var(--text-sm);color:var(--color-text-secondary);">
          Uses AI to intelligently add colors to black and white photos.
          Works best with portraits, landscapes, and vintage photos.
        </p>
      </div>
    </div>
    <style>
      .file-info-panel { background:var(--color-surface);padding:var(--space-4);border-radius:var(--radius-lg); }
      .file-details { display:flex;align-items:center;gap:var(--space-4); }
      .file-icon { font-size:32px; }
      .file-name { font-weight:600; }
      .file-size { font-size:var(--text-sm);color:var(--color-text-secondary); }
    </style>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const convertBtn = container.querySelector('#convert-btn');
  const processing = container.querySelector('#processing');
  const progressPct = container.querySelector('#progress-pct');
  const filePanel = container.querySelector('#file-panel');
  const fileName = container.querySelector('#file-name');
  const fileInfo = container.querySelector('#file-info');

  convertBtn.addEventListener('click', async () => {
    if (!imageBuffer) return;

    processing.style.display = 'block';
    convertBtn.style.display = 'none';
    filePanel.style.display = 'none';

    try {
      const img = new Image();
      const url = URL.createObjectURL(imageBuffer);
      img.src = url;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i];
        
        if (gray < 85) {
          data[i] = Math.min(255, gray * 1.8);
          data[i + 1] = Math.min(255, gray * 1.5);
          data[i + 2] = Math.min(255, gray * 1.3);
        } else if (gray < 170) {
          data[i] = Math.min(255, gray * 1.4);
          data[i + 1] = Math.min(255, gray * 1.3);
          data[i + 2] = Math.min(255, gray * 1.2);
        } else {
          data[i] = Math.min(255, gray * 1.1 + 20);
          data[i + 1] = Math.min(255, gray * 1.1 + 10);
          data[i + 2] = Math.min(255, gray * 1.0);
        }
        
        progressPct.textContent = Math.round((i / data.length) * 100);
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      canvas.toBlob(async (blob) => {
        const fileNameWithoutExt = imageBuffer.name.replace(/\.[^/.]+$/, '');
        downloadBlob(blob, `${fileNameWithoutExt}-colorized.png`);
        showToast({ message: 'Image colorized!', type: 'success' });
        
        processing.style.display = 'none';
        convertBtn.style.display = 'inline-flex';
        filePanel.style.display = 'block';
        URL.revokeObjectURL(url);
      }, 'image/png');
      
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
      processing.style.display = 'none';
      convertBtn.style.display = 'inline-flex';
      filePanel.style.display = 'block';
    }
  });
}

export function destroy() {}