import { createFileUpload } from '../../components/file-upload.js';

const SHELL_STYLES = `
  .tool-layout { max-width: 700px; margin: 0 auto; }
  .tool-options { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-lg); margin: var(--space-4) 0; }
  .tool-options .form-group { margin-bottom: var(--space-4); }
  .tool-options .form-group label { display: block; margin-bottom: var(--space-2); font-weight: 500; font-size: var(--text-sm); }
  .tool-processing { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); padding: var(--space-4); }
  .text-input { padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); color: var(--color-text); }
  .select-input { padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); color: var(--color-text); width: 100%; }
  .color-input { border: 1px solid var(--color-border); border-radius: var(--radius-sm); }
`;

export function createUploadTool({
  container,
  toolId,
  fileTypeName,
  accept,
  maxSizeMB = 50,
  buttonText,
  optionsHTML = '',
  onConvert
}) {
  let files = [];

  const upload = createFileUpload({
    accept,
    multiple: true,
    maxSizeMB,
    onFilesSelected: async (selectedFiles) => {
      if (selectedFiles.length === 0) return;
      files = Array.from(selectedFiles);
      totalFiles.textContent = files.length + ' ' + fileTypeName + ' file(s)';
      totalSize.textContent = (files.reduce((sum, f) => sum + f.size, 0) / 1024).toFixed(1) + ' KB total';
      optionsArea.style.display = 'block';
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="${toolId}-upload"></div>
      <div class="tool-options" id="${toolId}-options" style="display:none;">
        <div style="display:flex;gap:var(--space-6);margin-bottom:var(--space-4);">
          <div><span style="font-size:var(--text-xs);color:var(--color-text-muted);">Files</span><div id="${toolId}-files" style="font-weight:600;">-</div></div>
          <div><span style="font-size:var(--text-xs);color:var(--color-text-muted);">Total Size</span><div id="${toolId}-size" style="font-weight:600;">-</div></div>
        </div>
        ${optionsHTML}
        <button class="btn btn-primary btn-lg" id="${toolId}-btn" style="width:100%;">${buttonText}</button>
        <div class="tool-processing" id="${toolId}-processing" style="display:none;">
          <div class="spinner"></div>
          <p>Converting... <span id="${toolId}-pct">0</span>%</p>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = SHELL_STYLES;
  container.appendChild(style);

  container.querySelector(`#${toolId}-upload`).appendChild(upload.element);
  const optionsArea = container.querySelector(`#${toolId}-options`);
  const totalFiles = container.querySelector(`#${toolId}-files`);
  const totalSize = container.querySelector(`#${toolId}-size`);
  const convertBtn = container.querySelector(`#${toolId}-btn`);
  const processing = container.querySelector(`#${toolId}-processing`);
  const progressPct = container.querySelector(`#${toolId}-pct`);

  convertBtn.addEventListener('click', async () => {
    if (files.length === 0) return;
    processing.style.display = 'flex';
    convertBtn.style.display = 'none';
    try {
      await onConvert({ files, progress: (pct) => { progressPct.textContent = pct; } });
    } finally {
      processing.style.display = 'none';
      convertBtn.style.display = 'inline-flex';
    }
  });

  return { optionsArea, convertBtn, processing };
}
