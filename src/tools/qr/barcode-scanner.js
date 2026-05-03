import { Html5Qrcode } from 'html5-qrcode';

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-content">
        <div class="upload-zone" id="upload-zone">
          <div class="upload-icon">📁</div>
          <p>Drop barcode image here or <label class="upload-link">browse<input type="file" id="file-input" accept="image/*" hidden /></label></p>
          <p class="upload-hint">Supports JPG, PNG, WebP</p>
        </div>
        <div id="result-section" class="result-section hidden">
          <div class="result-box">
            <h3>Decoded Barcode</h3>
            <pre id="result-content"></pre>
            <div class="result-type" id="result-format"></div>
          </div>
          <div class="result-actions">
            <button id="copy-result" class="tool-button secondary">Copy to Clipboard</button>
          </div>
        </div>
        <div id="error-section" class="error-section hidden">
          <p id="error-message"></p>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .tool-container { max-width: 600px; margin: 0 auto; }
    .tool-header { text-align: center; margin-bottom: var(--space-8); }
    .tool-icon { font-size: 4rem; margin-bottom: var(--space-4); }
    .tool-description { color: var(--color-text-secondary); max-width: 400px; margin: var(--space-2) auto 0; }
    .upload-zone { border: 2px dashed var(--color-border); border-radius: var(--radius-lg); padding: var(--space-12) var(--space-6); text-align: center; cursor: pointer; transition: all 0.2s; }
    .upload-zone:hover { border-color: var(--color-primary); background: var(--color-primary-light); }
    .upload-icon { font-size: 3rem; margin-bottom: var(--space-4); }
    .upload-link { color: var(--color-primary); cursor: pointer; text-decoration: underline; }
    .upload-hint { font-size: var(--text-sm); color: var(--color-text-muted); margin-top: var(--space-2); }
    .result-section { margin-top: var(--space-6); text-align: center; }
    .result-section.hidden { display: none; }
    .result-box { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-6); text-align: left; }
    .result-box h3 { margin-bottom: var(--space-3); font-size: var(--text-sm); color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
    .result-box pre { background: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-md); overflow-x: auto; white-space: pre-wrap; word-break: break-all; font-size: var(--text-lg); font-weight: 600; }
    .result-type { margin-top: var(--space-3); font-size: var(--text-sm); color: var(--color-text-muted); }
    .result-actions { display: flex; gap: var(--space-3); justify-content: center; margin-top: var(--space-4); }
    .tool-button { padding: var(--space-3) var(--space-6); border-radius: var(--radius-md); font-weight: 600; cursor: pointer; background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text); }
    .tool-button:hover { background: var(--color-border); }
    .error-section { margin-top: var(--space-4); padding: var(--space-4); background: #fef2f2; border-radius: var(--radius-md); text-align: center; }
    .error-section.hidden { display: none; }
    .error-section p { color: var(--color-error); }
  `;
  container.appendChild(style);

  const uploadZone = container.querySelector('#upload-zone');
  const fileInput = container.querySelector('#file-input');
  const resultSection = container.querySelector('#result-section');
  const resultContent = container.querySelector('#result-content');
  const resultFormat = container.querySelector('#result-format');
  const errorSection = container.querySelector('#error-section');
  const errorMessage = container.querySelector('#error-message');
  const copyResult = container.querySelector('#copy-result');

  uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) scanBarcode(file);
  });

  fileInput.addEventListener('change', (e) => { if (e.target.files[0]) scanBarcode(e.target.files[0]); });

  async function scanBarcode(file) {
    errorSection.classList.add('hidden');
    resultSection.classList.add('hidden');

    try {
      const html5QrCode = new Html5Qrcode('barcode-scanner');
      const result = await html5QrCode.scanFile(file, true);
      resultContent.textContent = result.text;
      resultFormat.textContent = `Format: ${result.result.format?.formatName || 'Unknown'}`;
      resultSection.classList.remove('hidden');
    } catch (err) {
      errorMessage.textContent = 'No barcode found. Try a clearer image.';
      errorSection.classList.remove('hidden');
    }
  }

  copyResult.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(resultContent.textContent);
      alert('Copied!');
    } catch { alert('Failed to copy'); }
  });
}
