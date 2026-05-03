import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { copyToClipboard } from '../../utils/clipboard.js';
import EXIF from 'exif-js';

export const toolConfig = {
  id: 'view-exif',
  name: 'View EXIF Data',
  category: 'image',
  description: 'View all metadata embedded in an image: camera, lens, ISO, GPS, date.',
  icon: 'ℹ️',
  accept: 'image/*',
  maxSizeMB: 50,
  keywords: ['view exif', 'exif data', 'image metadata', 'camera info'],
  steps: ['Upload an image', 'View all embedded EXIF metadata', 'Copy data if needed'],
  faqs: [
    { question: 'What information is in EXIF?', answer: 'Camera model, lens, ISO, aperture, shutter speed, date/time, GPS coordinates, software, and more.' },
    { question: 'Do all images have EXIF data?', answer: 'No. Screenshots, downloaded images, and heavily edited images often have no EXIF data.' }
  ]
};

export function render(container) {
  const upload = createFileUpload({
    accept: 'image/*',
    multiple: false,
    maxSizeMB: 50,
    onFilesSelected: async (files) => {
      if (files.length === 0) return;
      resultsArea.style.display = 'block';
      resultsArea.innerHTML = '<div style="text-align:center;padding:var(--space-4);"><div class="spinner"></div><p>Reading metadata...</p></div>';

      try {
        const img = new Image();
        img.onload = () => {
          EXIF.getData(img, function() {
            const allData = EXIF.getAllTags(this);
            if (!allData || Object.keys(allData).length === 0) {
              resultsArea.innerHTML = '<div style="text-align:center;padding:var(--space-8);color:var(--color-text-muted);">No EXIF data found in this image.</div>';
              return;
            }

            const rows = Object.entries(allData)
              .filter(([key]) => !key.startsWith('_'))
              .map(([key, value]) => {
                let displayValue = value;
                if (value instanceof Array) displayValue = value.join(', ');
                if (typeof value === 'object' && value.numerator) displayValue = `${value.numerator}/${value.denominator}`;
                return `<tr><td style="padding:var(--space-2) var(--space-3);font-weight:600;white-space:nowrap;border-bottom:1px solid var(--color-border);font-size:var(--text-sm);">${key}</td><td style="padding:var(--space-2) var(--space-3);border-bottom:1px solid var(--color-border);font-size:var(--text-sm);word-break:break-all;">${displayValue}</td></tr>`;
              }).join('');

            resultsArea.innerHTML = `
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4);">
                <h3 style="font-size:var(--text-lg);font-weight:600;">${Object.keys(allData).filter(k => !k.startsWith('_')).length} metadata fields</h3>
                <button class="btn btn-sm btn-secondary" id="copy-btn">📋 Copy All</button>
              </div>
              <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;">
                  <thead><tr style="background:var(--color-surface);"><th style="padding:var(--space-2) var(--space-3);text-align:left;font-size:var(--text-sm);border-bottom:2px solid var(--color-border);">Field</th><th style="padding:var(--space-2) var(--space-3);text-align:left;font-size:var(--text-sm);border-bottom:2px solid var(--color-border);">Value</th></tr></thead>
                  <tbody>${rows}</tbody>
                </table>
              </div>
            `;

            resultsArea.querySelector('#copy-btn').addEventListener('click', async () => {
              const text = Object.entries(allData).filter(([k]) => !k.startsWith('_')).map(([k, v]) => `${k}: ${v}`).join('\n');
              await copyToClipboard(text);
              showToast({ message: 'Copied!', type: 'success' });
            });
          });
        };
        img.src = URL.createObjectURL(files[0]);
      } catch (err) {
        resultsArea.innerHTML = `<div style="color:var(--color-error);">Error: ${err.message}</div>`;
      }
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div id="results-area" style="display:none;margin-top:var(--space-6);"></div>
    </div>
  `;

  container.querySelector('#upload-area').appendChild(upload.element);
  const resultsArea = container.querySelector('#results-area');
}

export function destroy() {}
