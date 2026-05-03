import JsBarcode from 'jsbarcode';

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-content">
        <div class="input-section">
          <label for="barcode-type">Barcode Format</label>
          <select id="barcode-type" class="tool-select">
            <optgroup label="Retail & Inventory">
              <option value="CODE128" selected>Code 128 (Default - alphanumeric)</option>
              <option value="CODE39">Code 39 (Industrial)</option>
              <option value="EAN13">EAN-13 (Product)</option>
              <option value="EAN8">EAN-8 (Short product)</option>
              <option value="UPC">UPC-A (US products)</option>
              <option value="ITF14">ITF-14 (Carton)</option>
            </optgroup>
            <optgroup label="Healthcare & Library">
              <option value="CODE93">Code 93 (Compact)</option>
              <option value="CODABAR">Codabar (Libraries, blood banks)</option>
            </optgroup>
            <optgroup label="2D Codes">
              <option value="DATAMATRIX">Data Matrix (2D)</option>
              <option value="PDF417">PDF417 (Driver's license)</option>
            </optgroup>
          </select>
        </div>

        <div class="input-section">
          <label for="barcode-content">Content</label>
          <input type="text" id="barcode-content" class="tool-input" placeholder="Enter barcode content..." />
          <p class="input-hint" id="format-hint">Any alphanumeric text</p>
        </div>

        <div class="ean-fields" style="display: none;">
          <div class="input-section">
            <label for="ean-value">Barcode Number</label>
            <input type="text" id="ean-value" class="tool-input" placeholder="Enter number..." maxlength="13" />
            <p class="input-hint" id="ean-hint">12 or 13 digits for EAN-13</p>
          </div>
        </div>

        <div class="options-grid">
          <div class="option-group">
            <label for="barcode-width">Width</label>
            <input type="range" id="barcode-width" min="1" max="4" value="2" step="1" />
            <span class="range-value">2x</span>
          </div>

          <div class="option-group">
            <label for="barcode-height">Height</label>
            <input type="range" id="barcode-height" min="50" max="200" value="100" step="10" />
            <span class="range-value">100px</span>
          </div>

          <div class="option-group">
            <label for="barcode-show-text">Show Text</label>
            <label class="toggle">
              <input type="checkbox" id="barcode-show-text" checked />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="option-group">
            <label for="barcode-color">Color</label>
            <input type="color" id="barcode-color" class="tool-color" value="#000000" />
          </div>
        </div>

        <button id="generate-btn" class="tool-button primary">
          Generate Barcode
        </button>

        <div id="result-section" class="result-section hidden">
          <div class="preview-container">
            <svg id="barcode-svg"></svg>
          </div>
          <div class="result-actions">
            <button id="download-svg" class="tool-button secondary">Download SVG</button>
            <button id="download-png" class="tool-button secondary">Download PNG</button>
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
    .tool-content { display: flex; flex-direction: column; gap: var(--space-6); }
    .input-section { display: flex; flex-direction: column; gap: var(--space-2); }
    .input-section label { font-weight: 500; color: var(--color-text); }
    .input-hint { font-size: var(--text-sm); color: var(--color-text-muted); }
    .tool-input, .tool-select {
      padding: var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--text-base);
    }
    .tool-input:focus, .tool-select:focus { outline: none; border-color: var(--color-primary); }
    .options-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4); }
    .option-group { display: flex; flex-direction: column; gap: var(--space-2); }
    .option-group > label:first-child { font-size: var(--text-sm); color: var(--color-text-secondary); font-weight: 500; }
    .range-value { font-size: var(--text-sm); color: var(--color-text-muted); }
    input[type="range"] { width: 100%; cursor: pointer; }
    .toggle { position: relative; display: inline-block; width: 48px; height: 24px; }
    .toggle input { opacity: 0; width: 0; height: 0; }
    .toggle-slider {
      position: absolute; cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: var(--color-border);
      transition: 0.3s; border-radius: 24px;
    }
    .toggle-slider:before {
      position: absolute; content: "";
      height: 18px; width: 18px;
      left: 3px; bottom: 3px;
      background-color: white;
      transition: 0.3s; border-radius: 50%;
    }
    .toggle input:checked + .toggle-slider { background-color: var(--color-primary); }
    .toggle input:checked + .toggle-slider:before { transform: translateX(24px); }
    .tool-color { width: 100%; height: 40px; padding: 2px; cursor: pointer; }
    .tool-button {
      padding: var(--space-3) var(--space-6);
      border-radius: var(--radius-md);
      font-weight: 600;
      transition: all 0.2s; cursor: pointer;
    }
    .tool-button.primary { background: var(--color-primary); color: white; }
    .tool-button.primary:hover { background: var(--color-primary-hover); }
    .tool-button.secondary { background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text); }
    .tool-button.secondary:hover { background: var(--color-border); }
    .result-section { text-align: center; padding: var(--space-6) 0; }
    .result-section.hidden { display: none; }
    .preview-container {
      background: white; padding: var(--space-6);
      border-radius: var(--radius-lg);
      display: inline-block; box-shadow: var(--shadow-md);
      overflow-x: auto;
    }
    .result-actions { display: flex; gap: var(--space-3); justify-content: center; margin-top: var(--space-4); flex-wrap: wrap; }
    .error-section { padding: var(--space-4); background: #fef2f2; border-radius: var(--radius-md); text-align: center; }
    .error-section.hidden { display: none; }
    .error-section p { color: var(--color-error); }
    @media (max-width: 480px) { .options-grid { grid-template-columns: 1fr; } }
  `;
  container.appendChild(style);

  const barcodeType = container.querySelector('#barcode-type');
  const barcodeContent = container.querySelector('#barcode-content');
  const formatHint = container.querySelector('#format-hint');
  const eanFields = container.querySelector('.ean-fields');
  const eanValue = container.querySelector('#ean-value');
  const eanHint = container.querySelector('#ean-hint');
  const barcodeWidth = container.querySelector('#barcode-width');
  const barcodeHeight = container.querySelector('#barcode-height');
  const barcodeShowText = container.querySelector('#barcode-show-text');
  const barcodeColor = container.querySelector('#barcode-color');
  const generateBtn = container.querySelector('#generate-btn');
  const resultSection = container.querySelector('#result-section');
  const barcodeSvg = container.querySelector('#barcode-svg');
  const downloadSvg = container.querySelector('#download-svg');
  const downloadPng = container.querySelector('#download-png');
  const errorSection = container.querySelector('#error-section');
  const errorMessage = container.querySelector('#error-message');

  barcodeType.addEventListener('change', () => {
    const type = barcodeType.value;
    const isEan = ['EAN13', 'EAN8', 'UPC', 'ITF14'].includes(type);
    eanFields.style.display = isEan ? 'block' : 'none';
    barcodeContent.style.display = isEan ? 'none' : 'block';

    if (type === 'EAN13' || type === 'EAN-13') {
      formatHint.textContent = '12 or 13 digits';
      eanHint.textContent = 'Enter 12 or 13 digits';
      eanValue.maxLength = 13;
    } else if (type === 'EAN8' || type === 'EAN-8') {
      formatHint.textContent = '7 or 8 digits';
      eanHint.textContent = 'Enter 7 or 8 digits';
      eanValue.maxLength = 8;
    } else if (type === 'UPC') {
      formatHint.textContent = '11 or 12 digits';
      eanHint.textContent = 'Enter 11 or 12 digits (UPC-A)';
      eanValue.maxLength = 12;
    } else if (type === 'ITF14') {
      formatHint.textContent = '13 or 14 digits';
      eanHint.textContent = 'Enter 13 or 14 digits';
      eanValue.maxLength = 14;
    } else {
      formatHint.textContent = 'Any alphanumeric text';
    }
  });

  barcodeWidth.addEventListener('input', (e) => {
    e.target.nextElementSibling.textContent = e.target.value + 'x';
  });

  barcodeHeight.addEventListener('input', (e) => {
    e.target.nextElementSibling.textContent = e.target.value + 'px';
  });

  function generate() {
    errorSection.classList.add('hidden');
    resultSection.classList.add('hidden');

    const type = barcodeType.value;
    let content = barcodeContent.value;
    if (eanFields.style.display !== 'none') {
      content = eanValue.value;
    }

    if (!content) {
      errorMessage.textContent = 'Please enter content for the barcode';
      errorSection.classList.remove('hidden');
      return;
    }

    const options = {
      format: type,
      width: parseInt(barcodeWidth.value),
      height: parseInt(barcodeHeight.value),
      displayValue: barcodeShowText.checked,
      lineColor: barcodeColor.value,
      background: '#ffffff',
      margin: 10
    };

    try {
      JsBarcode(barcodeSvg, content, options);
      resultSection.classList.remove('hidden');
    } catch (err) {
      errorMessage.textContent = err.message || 'Invalid barcode content for selected format';
      errorSection.classList.remove('hidden');
    }
  }

  generateBtn.addEventListener('click', generate);

  downloadSvg.addEventListener('click', () => {
    const svgData = new XMLSerializer().serializeToString(barcodeSvg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'barcode.svg';
    a.click();
  });

  downloadPng.addEventListener('click', () => {
    const svgData = new XMLSerializer().serializeToString(barcodeSvg);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'barcode.png';
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  });
}
