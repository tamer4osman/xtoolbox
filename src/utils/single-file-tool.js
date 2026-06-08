import { createFileUpload } from '../components/file-upload.js';
import { showToast } from '../components/toast.js';

const PANEL_STYLES = `
  .file-info-panel { background:var(--color-surface);padding:var(--space-4);border-radius:var(--radius-lg); }
  .file-details { display:flex;align-items:center;gap:var(--space-4); }
  .file-icon { font-size:32px; }
  .file-name { font-weight:600; }
  .file-size { font-size:var(--text-sm);color:var(--color-text-secondary); }
`;

export function createSingleFileTool({
  container,
  toolId,
  accept,
  icon = '',
  buttonText = 'Convert',
  processingMessage = 'Processing...',
  onConvert
}) {
  let currentFile = null;

  const upload = createFileUpload({
    accept,
    multiple: false,
    maxSizeMB: 50,
    onFilesSelected: (files) => {
      if (files.length > 0) {
        currentFile = files[0];
        convertBtn.style.display = 'inline-flex';
        fileName.textContent = files[0].name;
        fileInfo.textContent = (files[0].size / 1024 / 1024).toFixed(2) + ' MB';
        filePanel.style.display = 'block';
      }
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="${toolId}-upload"></div>
      <div class="file-info-panel" id="${toolId}-panel" style="display:none;margin:var(--space-4) 0;">
        <div class="file-details">
          <span class="file-icon">${icon}</span>
          <div class="file-details-text">
            <div class="file-name" id="${toolId}-name"></div>
            <div class="file-size" id="${toolId}-info"></div>
          </div>
        </div>
      </div>
      <button class="btn btn-primary btn-lg" id="${toolId}-btn" style="display:none;width:100%;">${buttonText}</button>
      <div class="tool-processing" id="${toolId}-processing" style="display:none;">
        <div class="spinner"></div>
        <p>${processingMessage} <span id="${toolId}-pct">0</span>%</p>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = PANEL_STYLES;
  container.appendChild(style);

  container.querySelector(`#${toolId}-upload`).appendChild(upload.element);
  const convertBtn = container.querySelector(`#${toolId}-btn`);
  const processing = container.querySelector(`#${toolId}-processing`);
  const progressPct = container.querySelector(`#${toolId}-pct`);
  const filePanel = container.querySelector(`#${toolId}-panel`);
  const fileName = container.querySelector(`#${toolId}-name`);
  const fileInfo = container.querySelector(`#${toolId}-info`);

  convertBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    processing.style.display = 'block';
    convertBtn.style.display = 'none';
    filePanel.style.display = 'none';
    try {
      await onConvert({
        file: currentFile,
        progress: (pct) => { progressPct.textContent = pct; }
      });
    } catch (err) {
      showToast({ message: 'Error: ' + (err?.message || 'Unknown error'), type: 'error' });
    } finally {
      processing.style.display = 'none';
      convertBtn.style.display = 'inline-flex';
    }
  });

  return { convertBtn, processing };
}
