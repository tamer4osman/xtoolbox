export const toolConfig = {
  id: 'qr-scanner',
  name: 'QR Code Scanner',
  category: 'qr',
  description: 'Scan and decode QR codes from images.',
  icon: '📷',
  status: 'done'
};

import { Html5Qrcode } from 'html5-qrcode';

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-content">
        <div class="tabs-container">
          <div class="tabs">
            <button class="tab active" data-tab="upload">Upload Image</button>
            <button class="tab" data-tab="camera">Use Camera</button>
          </div>
        </div>

        <div id="upload-panel" class="tab-panel active">
          <div class="upload-zone" id="upload-zone">
            <div class="upload-icon">📁</div>
            <p>Drop QR code image here or <label class="upload-link">browse<input type="file" id="file-input" accept="image/*" hidden /></label></p>
            <p class="upload-hint">Supports JPG, PNG, WebP</p>
          </div>
        </div>

        <div id="camera-panel" class="tab-panel">
          <div id="reader" class="reader-container"></div>
          <button id="start-camera" class="tool-button primary">Start Camera</button>
          <button id="stop-camera" class="tool-button danger hidden">Stop Camera</button>
        </div>

        <div id="result-section" class="result-section hidden">
          <div class="result-box">
            <h3>Decoded Content</h3>
            <pre id="result-content"></pre>
            <div class="result-type" id="result-type"></div>
          </div>
          <div class="result-actions">
            <button id="copy-result" class="tool-button secondary">Copy to Clipboard</button>
            <button id="open-url" class="tool-button secondary">Open URL</button>
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
    .tabs-container { margin-bottom: var(--space-6); }
    .tabs { display: flex; border-bottom: 1px solid var(--color-border); }
    .tab {
      flex: 1;
      padding: var(--space-3) var(--space-4);
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      font-weight: 500;
      color: var(--color-text-secondary);
      transition: all 0.2s;
    }
    .tab.active { color: var(--color-primary); border-bottom-color: var(--color-primary); }
    .tab-panel { display: none; }
    .tab-panel.active { display: block; }
    .upload-zone {
      border: 2px dashed var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-12) var(--space-6);
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .upload-zone:hover, .upload-zone.dragover {
      border-color: var(--color-primary);
      background: var(--color-primary-light);
    }
    .upload-icon { font-size: 3rem; margin-bottom: var(--space-4); }
    .upload-link { color: var(--color-primary); cursor: pointer; text-decoration: underline; }
    .upload-hint { font-size: var(--text-sm); color: var(--color-text-muted); margin-top: var(--space-2); }
    .reader-container {
      width: 100%;
      min-height: 300px;
      background: #000;
      border-radius: var(--radius-lg);
      overflow: hidden;
      margin-bottom: var(--space-4);
    }
    .tool-button {
      padding: var(--space-3) var(--space-6);
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: var(--text-base);
      transition: all 0.2s;
      cursor: pointer;
    }
    .tool-button.primary { background: var(--color-primary); color: white; }
    .tool-button.primary:hover { background: var(--color-primary-hover); }
    .tool-button.danger { background: var(--color-error); color: white; }
    .tool-button.secondary {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      color: var(--color-text);
    }
    .tool-button.secondary:hover { background: var(--color-border); }
    .tool-button.hidden { display: none; }
    .result-section { margin-top: var(--space-6); text-align: center; }
    .result-section.hidden { display: none; }
    .result-box {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      text-align: left;
    }
    .result-box h3 { margin-bottom: var(--space-3); font-size: var(--text-sm); color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
    .result-box pre {
      background: var(--color-bg);
      padding: var(--space-4);
      border-radius: var(--radius-md);
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
      font-size: var(--text-sm);
      max-height: 200px;
      overflow-y: auto;
    }
    .result-type {
      margin-top: var(--space-3);
      font-size: var(--text-sm);
      color: var(--color-text-muted);
    }
    .result-actions { display: flex; gap: var(--space-3); justify-content: center; margin-top: var(--space-4); flex-wrap: wrap; }
    .error-section { margin-top: var(--space-4); padding: var(--space-4); background: #fef2f2; border-radius: var(--radius-md); text-align: center; }
    .error-section.hidden { display: none; }
    .error-section p { color: var(--color-error); }
  `;
  container.appendChild(style);

  const tabs = container.querySelectorAll('.tab');
  const uploadPanel = container.querySelector('#upload-panel');
  const cameraPanel = container.querySelector('#camera-panel');
  const uploadZone = container.querySelector('#upload-zone');
  const fileInput = container.querySelector('#file-input');
  const reader = container.querySelector('#reader');
  const startCamera = container.querySelector('#start-camera');
  const stopCamera = container.querySelector('#stop-camera');
  const resultSection = container.querySelector('#result-section');
  const resultContent = container.querySelector('#result-content');
  const resultType = container.querySelector('#result-type');
  const errorSection = container.querySelector('#error-section');
  const errorMessage = container.querySelector('#error-message');
  const copyResult = container.querySelector('#copy-result');
  const openUrl = container.querySelector('#open-url');

  let html5QrCode = null;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const panel = tab.dataset.tab === 'upload' ? uploadPanel : cameraPanel;
      uploadPanel.classList.toggle('active', tab.dataset.tab === 'upload');
      cameraPanel.classList.toggle('active', tab.dataset.tab === 'camera');
    });
  });

  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) scanImage(file);
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) scanImage(file);
  });

  async function scanImage(file) {
    errorSection.classList.add('hidden');
    resultSection.classList.add('hidden');

    try {
      const html5QrCode = new Html5Qrcode('reader');
      await html5QrCode.scanFile(file, true);
    } catch (err) {
      try {
        const imageUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          const html5Qrcode = new Html5Qrcode('reader');
          await html5Qrcode.scanImage(canvas, { verbose: true });
        };
        img.src = imageUrl;
      } catch (e) {
        errorMessage.textContent = 'No QR code found in image. Please try a clearer image.';
        errorSection.classList.remove('hidden');
      }
    }
  }

  async function onScanSuccess(decodedText, decodedResult) {
    resultContent.textContent = decodedText;
    resultSection.classList.remove('hidden');

    let type = 'Text';
    if (decodedText.startsWith('http')) type = 'URL';
    else if (decodedText.startsWith('WIFI:')) type = 'WiFi Network';
    else if (decodedText.startsWith('BEGIN:VCARD')) type = 'Contact (vCard)';
    else if (decodedText.startsWith('mailto:')) type = 'Email';
    else if (decodedText.startsWith('tel:')) type = 'Phone Number';
    else if (decodedText.startsWith('sms:')) type = 'SMS';
    else if (decodedText.startsWith('MECARD:')) type = 'Contact (MeCard)';

    resultType.textContent = `Type: ${type}`;

    openUrl.classList.toggle('hidden', !decodedText.startsWith('http'));
  }

  startCamera.addEventListener('click', async () => {
    errorSection.classList.add('hidden');
    resultSection.classList.add('hidden');
    startCamera.classList.add('hidden');
    stopCamera.classList.remove('hidden');

    try {
      html5QrCode = new Html5Qrcode('reader');
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        () => {}
      );
    } catch (err) {
      errorMessage.textContent = 'Camera error: ' + err.message;
      errorSection.classList.remove('hidden');
      startCamera.classList.remove('hidden');
      stopCamera.classList.add('hidden');
    }
  });

  stopCamera.addEventListener('click', async () => {
    if (html5QrCode) {
      await html5QrCode.stop();
      html5QrCode.clear();
    }
    startCamera.classList.remove('hidden');
    stopCamera.classList.add('hidden');
  });

  copyResult.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(resultContent.textContent);
      alert('Copied to clipboard!');
    } catch (err) {
      alert('Failed to copy');
    }
  });

  openUrl.addEventListener('click', () => {
    const url = resultContent.textContent;
    if (url.startsWith('http')) {
      window.open(url, '_blank');
    }
  });
}
