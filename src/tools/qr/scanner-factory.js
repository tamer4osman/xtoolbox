export function createScanner({
  container,
  toolConfig,
  scanLabel,
  resultTitle,
  resultMetaId,
  hasCamera = false,
  hasOpenUrl = false,
  onScanFile
}) {
  const id = toolConfig.id;
  const uploadId = `${id}-upload-zone`;
  const fileInputId = `${id}-file-input`;
  const tabsId = `${id}-tabs`;
  const cameraPanelId = `${id}-camera-panel`;
  const startCameraId = `${id}-start-camera`;
  const stopCameraId = `${id}-stop-camera`;
  const readerId = `${id}-reader`;
  const uploadPanelId = `${id}-upload-panel`;
  const resultId = `${id}-result`;
  const resultContentId = `${id}-result-content`;
  const resultTypeId = `${id}-${resultMetaId}`;
  const errorId = `${id}-error`;
  const errorMessageId = `${id}-error-message`;
  const copyResultId = `${id}-copy-result`;
  const openUrlId = `${id}-open-url`;

  const cameraPanel = hasCamera ? `
        <div id="${cameraPanelId}" class="tab-panel">
          <div id="${readerId}" class="reader-container"></div>
          <button id="${startCameraId}" class="tool-button primary">Start Camera</button>
          <button id="${stopCameraId}" class="tool-button danger hidden">Stop Camera</button>
        </div>
  ` : '';

  const tabs = hasCamera ? `
        <div class="tabs-container" id="${tabsId}">
          <div class="tabs">
            <button class="tab active" data-tab="upload">Upload Image</button>
            <button class="tab" data-tab="camera">Use Camera</button>
          </div>
        </div>
  ` : '';

  const uploadPanelClass = hasCamera ? ' class="tab-panel active"' : '';
  const cameraTabStyles = hasCamera ? `
    .tabs-container { margin-bottom: var(--space-6); }
    .tabs { display: flex; border-bottom: 1px solid var(--color-border); }
    .tab { flex: 1; padding: var(--space-3) var(--space-4); background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-weight: 500; color: var(--color-text-secondary); transition: all 0.2s; }
    .tab.active { color: var(--color-primary); border-bottom-color: var(--color-primary); }
    .tab-panel { display: none; }
    .tab-panel.active { display: block; }
    .reader-container { width: 100%; min-height: 300px; background: #000; border-radius: var(--radius-lg); overflow: hidden; margin-bottom: var(--space-4); }
  ` : '';

  const openUrlButton = hasOpenUrl
    ? `<button id="${openUrlId}" class="tool-button secondary hidden">Open URL</button>`
    : '';

  const buttonStyles = hasCamera
    ? `
    .tool-button { padding: var(--space-3) var(--space-6); border-radius: var(--radius-md); font-weight: 600; font-size: var(--text-base); transition: all 0.2s; cursor: pointer; }
    .tool-button.primary { background: var(--color-primary); color: white; }
    .tool-button.primary:hover { background: var(--color-primary-hover); }
    .tool-button.danger { background: var(--color-error); color: white; }
    .tool-button.secondary { background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text); }
    .tool-button.secondary:hover { background: var(--color-border); }
    .tool-button.hidden { display: none; }
  `
    : `
    .tool-button { padding: var(--space-3) var(--space-6); border-radius: var(--radius-md); font-weight: 600; cursor: pointer; background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text); }
    .tool-button:hover { background: var(--color-border); }
  `;

  container.innerHTML = `
    <div class="tool-container ${id}">
      <div class="tool-content">
        ${tabs}
        <div id="${uploadPanelId}"${uploadPanelClass}>
          <div class="upload-zone" id="${uploadId}">
            <div class="upload-icon">📁</div>
            <p>Drop ${scanLabel} image here or <label class="upload-link">browse<input type="file" id="${fileInputId}" accept="image/*" hidden /></label></p>
            <p class="upload-hint">Supports JPG, PNG, WebP</p>
          </div>
        </div>
        ${cameraPanel}
        <div id="${resultId}" class="result-section hidden">
          <div class="result-box">
            <h3>${resultTitle}</h3>
            <pre id="${resultContentId}"></pre>
            <div class="result-type" id="${resultTypeId}"></div>
          </div>
          <div class="result-actions">
            <button id="${copyResultId}" class="tool-button secondary">Copy to Clipboard</button>
            ${openUrlButton}
          </div>
        </div>
        <div id="${errorId}" class="error-section hidden">
          <p id="${errorMessageId}"></p>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .${id} { max-width: 600px; margin: 0 auto; }
    .${id} .upload-zone { border: 2px dashed var(--color-border); border-radius: var(--radius-lg); padding: var(--space-12) var(--space-6); text-align: center; cursor: pointer; transition: all 0.2s; }
    .${id} .upload-zone:hover, .${id} .upload-zone.dragover { border-color: var(--color-primary); background: var(--color-primary-light); }
    .${id} .upload-icon { font-size: 3rem; margin-bottom: var(--space-4); }
    .${id} .upload-link { color: var(--color-primary); cursor: pointer; text-decoration: underline; }
    .${id} .upload-hint { font-size: var(--text-sm); color: var(--color-text-muted); margin-top: var(--space-2); }
    .${id} .result-section { margin-top: var(--space-6); text-align: center; }
    .${id} .result-section.hidden { display: none; }
    .${id} .result-box { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-6); text-align: left; }
    .${id} .result-box h3 { margin-bottom: var(--space-3); font-size: var(--text-sm); color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
    .${id} .result-box pre { background: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-md); overflow-x: auto; white-space: pre-wrap; word-break: break-all; font-size: var(--text-lg); font-weight: 600; }
    .${id} .result-type { margin-top: var(--space-3); font-size: var(--text-sm); color: var(--color-text-muted); }
    .${id} .result-actions { display: flex; gap: var(--space-3); justify-content: center; margin-top: var(--space-4); }
    ${buttonStyles}
    .${id} .error-section { margin-top: var(--space-4); padding: var(--space-4); background: #fef2f2; border-radius: var(--radius-md); text-align: center; }
    .${id} .error-section.hidden { display: none; }
    .${id} .error-section p { color: var(--color-error); }
    ${cameraTabStyles}
  `;
  container.appendChild(style);

  const elements = {
    tabs: container.querySelectorAll(`#${tabsId} .tab`),
    uploadPanel: container.querySelector(`#${uploadPanelId}`),
    cameraPanel: container.querySelector(`#${cameraPanelId}`),
    uploadZone: container.querySelector(`#${uploadId}`),
    fileInput: container.querySelector(`#${fileInputId}`),
    reader: container.querySelector(`#${readerId}`),
    startCamera: container.querySelector(`#${startCameraId}`),
    stopCamera: container.querySelector(`#${stopCameraId}`),
    resultSection: container.querySelector(`#${resultId}`),
    resultContent: container.querySelector(`#${resultContentId}`),
    resultType: container.querySelector(`#${resultTypeId}`),
    errorSection: container.querySelector(`#${errorId}`),
    errorMessage: container.querySelector(`#${errorMessageId}`),
    copyResult: container.querySelector(`#${copyResultId}`),
    openUrl: container.querySelector(`#${openUrlId}`)
  };

  if (hasCamera) {
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        elements.tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.tab;
        elements.uploadPanel.classList.toggle('active', target === 'upload');
        elements.cameraPanel.classList.toggle('active', target === 'camera');
      });
    });
  }

  elements.uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.uploadZone.classList.add('dragover');
  });
  elements.uploadZone.addEventListener('dragleave', () => {
    elements.uploadZone.classList.remove('dragover');
  });
  elements.uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.uploadZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) invokeScan(file);
  });
  elements.fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) invokeScan(file);
  });

  elements.copyResult.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(elements.resultContent.textContent);
      alert('Copied!');
    } catch {
      alert('Failed to copy');
    }
  });

  if (hasOpenUrl && elements.openUrl) {
    elements.openUrl.addEventListener('click', () => {
      const url = elements.resultContent.textContent;
      if (url.startsWith('http')) window.open(url, '_blank');
    });
  }

  function invokeScan(file) {
    elements.resultSection.classList.add('hidden');
    elements.errorSection.classList.add('hidden');
    onScanFile(file, elements);
  }

  return {
    elements,
    showResult(text, metaText) {
      elements.resultContent.textContent = text;
      elements.resultType.textContent = metaText;
      elements.resultSection.classList.remove('hidden');
      elements.errorSection.classList.add('hidden');
    },
    showError(message) {
      elements.errorMessage.textContent = message;
      elements.errorSection.classList.remove('hidden');
      elements.resultSection.classList.add('hidden');
    }
  };
}
