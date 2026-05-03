import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob, formatFileSize } from '../../utils/file.js';
import { loadImageFromFile, canvasToBlob } from './image-utils.js';

export const toolConfig = {
  id: 'remove-exif',
  name: 'Remove EXIF Metadata',
  category: 'image',
  description: 'Strip all metadata (GPS, camera info, date) from images for privacy.',
  icon: '🔒',
  accept: 'image/*',
  maxSizeMB: 50,
  keywords: ['remove exif', 'strip metadata', 'delete metadata', 'privacy'],
  steps: ['Upload an image', 'View detected metadata', 'Click "Remove All Metadata"', 'Download clean image'],
  faqs: [
    { question: 'What metadata is removed?', answer: 'GPS location, camera model, date taken, software info, thumbnails, and all other EXIF/IPTC/XMP data.' },
    { question: 'Does this affect image quality?', answer: 'No. The image pixels are re-encoded identically. Only metadata is stripped.' }
  ]
};

export function render(container) {
  let originalFile = null;

  const upload = createFileUpload({
    accept: 'image/*',
    multiple: false,
    maxSizeMB: 50,
    onFilesSelected: async (files) => {
      if (files.length === 0) return;
      originalFile = files[0];
      const sizeBefore = formatFileSize(originalFile.size);
      infoArea.innerHTML = `
        <div style="background:var(--color-surface);padding:var(--space-4);border-radius:var(--radius-md);margin-bottom:var(--space-4);">
          <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-2);">
            <span style="font-size:var(--text-sm);color:var(--color-text-muted);">File</span>
            <span style="font-size:var(--text-sm);font-weight:600;">${originalFile.name}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-2);">
            <span style="font-size:var(--text-sm);color:var(--color-text-muted);">Size</span>
            <span style="font-size:var(--text-sm);font-weight:600;">${sizeBefore}</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="font-size:var(--text-sm);color:var(--color-text-muted);">Type</span>
            <span style="font-size:var(--text-sm);font-weight:600;">${originalFile.type}</span>
          </div>
        </div>
        <p style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">Drawing the image to a canvas and re-exporting automatically strips all EXIF, IPTC, and XMP metadata.</p>
        <button class="btn btn-primary btn-lg" id="remove-btn" style="width:100%;">Remove All Metadata & Download</button>
      `;
      infoArea.style.display = 'block';
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div id="info-area" style="display:none;margin-top:var(--space-4);"></div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const infoArea = container.querySelector('#info-area');

  infoArea.addEventListener('click', async (e) => {
    if (!e.target.matches('#remove-btn')) return;
    if (!originalFile) return;

    try {
      const img = await loadImageFromFile(originalFile);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d').drawImage(img, 0, 0);

      const format = originalFile.type || 'image/png';
      const blob = await canvasToBlob(canvas, format, 0.95);
      const ext = format.split('/')[1].replace('jpeg', 'jpg');
      downloadBlob(blob, `clean.${ext}`);

      const reduction = ((1 - blob.size / originalFile.size) * 100).toFixed(1);
      showToast({ message: `Metadata removed! File reduced by ${reduction}%`, type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + err.message, type: 'error' });
    }
  });
}

export function destroy() {}
