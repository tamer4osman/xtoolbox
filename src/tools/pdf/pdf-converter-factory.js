import { createFileUpload } from '../../components/file-upload.js';
import { showToast } from '../../components/toast.js';
import { downloadBlob, formatFileSize } from '../../utils/file.js';

const STYLES = `
  .file-info-panel { background:var(--color-surface);padding:var(--space-4);border-radius:var(--radius-lg); }
  .file-details { display:flex;align-items:center;gap:var(--space-4); }
  .file-icon { font-size:32px; }
  .file-name { font-weight:600; }
  .file-size { font-size:var(--text-sm);color:var(--color-text-secondary); }
`;

export function createPdfConverter({
  container,
  toolId,
  accept = '.pdf',
  maxSizeMB = 50,
  convertButtonText = 'Convert',
  progressMessage = 'Converting...',
  successMessage = 'Converted!',
  outputExt = 'out',
  outputMime = 'application/octet-stream',
  extraHTML = '',
  convert
}) {
  let currentFile = null;

  const upload = createFileUpload({
    accept,
    multiple: false,
    maxSizeMB,
    onFilesSelected: (files) => {
      if (files.length === 0) return;
      currentFile = files[0];
      fileName.textContent = currentFile.name;
      fileInfo.textContent = formatFileSize(currentFile.size);
      filePanel.style.display = 'block';
      convertBtn.style.display = 'inline-flex';
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="${toolId}-upload-area"></div>
      <div class="file-info-panel" id="${toolId}-file-panel" style="display:none;margin:var(--space-4) 0;">
        <div class="file-details">
          <span class="file-icon">📄</span>
          <div class="file-details-text">
            <div class="file-name" id="${toolId}-file-name"></div>
            <div class="file-size" id="${toolId}-file-info"></div>
          </div>
        </div>
      </div>
      ${extraHTML}
      <button class="btn btn-primary btn-lg" id="${toolId}-convert-btn" style="display:none;width:100%;">${convertButtonText}</button>
      <div class="tool-processing" id="${toolId}-processing" style="display:none;">
        <div class="spinner"></div>
        <p>${progressMessage} <span id="${toolId}-progress-pct">0</span>%</p>
      </div>
    </div>
    <style>${STYLES}</style>
  `;

  container.querySelector(`#${toolId}-upload-area`).appendChild(upload.element);
  const convertBtn = container.querySelector(`#${toolId}-convert-btn`);
  const processing = container.querySelector(`#${toolId}-processing`);
  const progressPct = container.querySelector(`#${toolId}-progress-pct`);
  const filePanel = container.querySelector(`#${toolId}-file-panel`);
  const fileName = container.querySelector(`#${toolId}-file-name`);
  const fileInfo = container.querySelector(`#${toolId}-file-info`);

  convertBtn.addEventListener('click', async () => {
    if (!currentFile) return;

    processing.style.display = 'block';
    convertBtn.style.display = 'none';
    filePanel.style.display = 'none';

    try {
      const onProgress = (pct) => { progressPct.textContent = String(pct); };
      const blob = await convert(currentFile, onProgress);
      const baseName = currentFile.name.replace(/\.pdf$/i, '');
      downloadBlob(blob, `${baseName}.${outputExt}`);
      showToast({ message: successMessage, type: 'success' });
    } catch (err) {
      showToast({ message: 'Error: ' + (err?.message || 'Unknown error'), type: 'error' });
    } finally {
      processing.style.display = 'none';
      convertBtn.style.display = 'inline-flex';
      filePanel.style.display = 'block';
    }
  });
}
