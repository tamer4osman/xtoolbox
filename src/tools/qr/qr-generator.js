export const toolConfig = {
  id: 'qr-generator',
  name: 'QR Code Generator',
  category: 'qr',
  description: 'Generate QR codes from text, URLs, vCard, or WiFi credentials.',
  icon: '📱',
  status: 'done'
};

import QRCode from 'qrcode';
import { downloadDataUrl } from '../../utils/file.js';

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-content">
        <div class="input-section">
          <label for="qr-type">QR Code Type</label>
          <select id="qr-type" class="tool-select">
            <option value="text">Plain Text</option>
            <option value="url" selected>URL / Website</option>
            <option value="wifi">WiFi Network</option>
            <option value="vcard">vCard / Contact</option>
            <option value="email">Email</option>
            <option value="phone">Phone Number</option>
            <option value="sms">SMS</option>
          </select>
        </div>

        <div class="input-section" id="content-inputs">
          <label for="qr-content">Content</label>
          <input type="text" id="qr-content" class="tool-input" placeholder="Enter URL or text..." />
        </div>

        <div class="input-section wifi-fields" style="display: none;">
          <label>WiFi Details</label>
          <input type="text" id="wifi-ssid" class="tool-input" placeholder="Network Name (SSID)" />
          <input type="password" id="wifi-password" class="tool-input" placeholder="Password" />
          <select id="wifi-encryption" class="tool-select">
            <option value="WPA">WPA/WPA2</option>
            <option value="WEP">WEP</option>
            <option value="nopass">No Encryption</option>
          </select>
          <label class="checkbox-label">
            <input type="checkbox" id="wifi-hidden" /> Hidden Network
          </label>
        </div>

        <div class="input-section vcard-fields" style="display: none;">
          <label>Contact Details</label>
          <input type="text" id="vcard-name" class="tool-input" placeholder="Full Name" />
          <input type="tel" id="vcard-phone" class="tool-input" placeholder="Phone Number" />
          <input type="email" id="vcard-email" class="tool-input" placeholder="Email Address" />
          <input type="text" id="vcard-org" class="tool-input" placeholder="Organization" />
          <input type="text" id="vcard-title" class="tool-input" placeholder="Job Title" />
          <input type="url" id="vcard-website" class="tool-input" placeholder="Website" />
        </div>

        <div class="input-section email-fields" style="display: none;">
          <input type="email" id="email-address" class="tool-input" placeholder="Email Address" />
          <input type="text" id="email-subject" class="tool-input" placeholder="Subject (optional)" />
          <textarea id="email-body" class="tool-textarea" placeholder="Message (optional)"></textarea>
        </div>

        <div class="input-section phone-fields" style="display: none;">
          <input type="tel" id="phone-number" class="tool-input" placeholder="Phone Number" />
        </div>

        <div class="input-section sms-fields" style="display: none;">
          <input type="tel" id="sms-number" class="tool-input" placeholder="Phone Number" />
          <textarea id="sms-body" class="tool-textarea" placeholder="Message"></textarea>
        </div>

        <div class="options-grid">
          <div class="option-group">
            <label for="qr-size">Size</label>
            <select id="qr-size" class="tool-select">
              <option value="128">128 × 128</option>
              <option value="256" selected>256 × 256</option>
              <option value="512">512 × 512</option>
              <option value="1024">1024 × 1024</option>
            </select>
          </div>

          <div class="option-group">
            <label for="qr-format">Format</label>
            <select id="qr-format" class="tool-select">
              <option value="png" selected>PNG</option>
              <option value="svg">SVG</option>
              <option value="utf8">Terminal (UTF-8)</option>
            </select>
          </div>

          <div class="option-group">
            <label for="qr-error-level">Error Correction</label>
            <select id="qr-error-level" class="tool-select">
              <option value="L">Low (7%)</option>
              <option value="M" selected>Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
          </div>

          <div class="option-group">
            <label for="qr-color">Color</label>
            <input type="color" id="qr-color" class="tool-color" value="#000000" />
          </div>
        </div>

        <button id="generate-btn" class="tool-button primary">
          Generate QR Code
        </button>

        <div id="result-section" class="result-section hidden">
          <div class="preview-container">
            <canvas id="qr-canvas"></canvas>
          </div>
          <div class="result-info">
            <p id="result-size"></p>
          </div>
          <div class="result-actions">
            <button id="download-png" class="tool-button secondary">Download PNG</button>
            <button id="download-vcf" class="tool-button secondary" style="display:none;">Download .vcf</button>
            <button id="copy-clipboard" class="tool-button secondary">Copy to Clipboard</button>
          </div>
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
    .tool-input, .tool-select, .tool-textarea {
      padding: var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--text-base);
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .tool-input:focus, .tool-select:focus, .tool-textarea:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-light);
    }
    .tool-textarea { min-height: 80px; resize: vertical; }
    .checkbox-label { display: flex; align-items: center; gap: var(--space-2); font-weight: normal; cursor: pointer; }
    .options-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4); }
    .option-group { display: flex; flex-direction: column; gap: var(--space-2); }
    .option-group label { font-size: var(--text-sm); color: var(--color-text-secondary); font-weight: 500; }
    .tool-color { width: 100%; height: 40px; padding: 2px; cursor: pointer; }
    .tool-button {
      padding: var(--space-3) var(--space-6);
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: var(--text-base);
      transition: all 0.2s;
      cursor: pointer;
    }
    .tool-button.primary {
      background: var(--color-primary);
      color: white;
    }
    .tool-button.primary:hover { background: var(--color-primary-hover); }
    .tool-button.secondary {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      color: var(--color-text);
    }
    .tool-button.secondary:hover { background: var(--color-border); }
    .result-section { text-align: center; padding: var(--space-8) 0; }
    .result-section.hidden { display: none; }
    .preview-container {
      background: white;
      padding: var(--space-6);
      border-radius: var(--radius-lg);
      display: inline-block;
      box-shadow: var(--shadow-md);
    }
    #qr-canvas { max-width: 100%; height: auto; }
    .result-info { margin: var(--space-4) 0; color: var(--color-text-secondary); font-size: var(--text-sm); }
    .result-actions { display: flex; gap: var(--space-3); justify-content: center; flex-wrap: wrap; }
    @media (max-width: 480px) {
      .options-grid { grid-template-columns: 1fr; }
      .result-actions { flex-direction: column; }
      .tool-button { width: 100%; }
    }
  `;
  container.appendChild(style);

  const contentInputs = container.querySelector('#content-inputs');
  const wifiFields = container.querySelector('.wifi-fields');
  const vcardFields = container.querySelector('.vcard-fields');
  const emailFields = container.querySelector('.email-fields');
  const phoneFields = container.querySelector('.phone-fields');
  const smsFields = container.querySelector('.sms-fields');

  const qrType = container.querySelector('#qr-type');
  const qrContent = container.querySelector('#qr-content');
  const qrSize = container.querySelector('#qr-size');
  const qrFormat = container.querySelector('#qr-format');
  const qrErrorLevel = container.querySelector('#qr-error-level');
  const qrColor = container.querySelector('#qr-color');
  const generateBtn = container.querySelector('#generate-btn');
  const resultSection = container.querySelector('#result-section');
  const qrCanvas = container.querySelector('#qr-canvas');
  const resultSize = container.querySelector('#result-size');
  const downloadPng = container.querySelector('#download-png');
  const downloadVcf = container.querySelector('#download-vcf');
  const copyClipboard = container.querySelector('#copy-clipboard');

  qrType.addEventListener('change', () => {
    const type = qrType.value;
    contentInputs.style.display = 'none';
    wifiFields.style.display = 'none';
    vcardFields.style.display = 'none';
    emailFields.style.display = 'none';
    phoneFields.style.display = 'none';
    smsFields.style.display = 'none';

    if (type === 'text' || type === 'url') {
      contentInputs.style.display = 'flex';
      qrContent.placeholder = type === 'url' ? 'https://example.com' : 'Enter text...';
    } else if (type === 'wifi') {
      wifiFields.style.display = 'flex';
    } else     if (type === 'vcard') {
      vcardFields.style.display = 'flex';
      downloadVcf.style.display = '';
    } else {
      downloadVcf.style.display = 'none';
    }

    if (type === 'email') {
      emailFields.style.display = 'flex';
    } else if (type === 'phone') {
      phoneFields.style.display = 'flex';
    } else if (type === 'sms') {
      smsFields.style.display = 'flex';
    }
  });

  function buildQRData() {
    const type = qrType.value;
    if (type === 'text') return qrContent.value;
    if (type === 'url') return qrContent.value;

    if (type === 'wifi') {
      const ssid = container.querySelector('#wifi-ssid').value;
      const password = container.querySelector('#wifi-password').value;
      const encryption = container.querySelector('#wifi-encryption').value;
      const hidden = container.querySelector('#wifi-hidden').checked;
      return `WIFI:T:${encryption};S:${ssid};P:${password};H:${hidden};;`;
    }

    if (type === 'vcard') {
      const name = container.querySelector('#vcard-name').value;
      const phone = container.querySelector('#vcard-phone').value;
      const email = container.querySelector('#vcard-email').value;
      const org = container.querySelector('#vcard-org').value;
      const title = container.querySelector('#vcard-title').value;
      const website = container.querySelector('#vcard-website').value;
      return `BEGIN:VCARD\nVERSION:3.0\nN:${name}\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nORG:${org}\nTITLE:${title}\nURL:${website}\nEND:VCARD`;
    }

    if (type === 'email') {
      const address = container.querySelector('#email-address').value;
      const subject = container.querySelector('#email-subject').value;
      const body = container.querySelector('#email-body').value;
      return `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    if (type === 'phone') {
      return `tel:${container.querySelector('#phone-number').value}`;
    }

    if (type === 'sms') {
      const number = container.querySelector('#sms-number').value;
      const body = container.querySelector('#sms-body').value;
      return `sms:${number}?body=${encodeURIComponent(body)}`;
    }

    return qrContent.value;
  }

  async function generateQR() {
    const data = buildQRData();
    if (!data || (data.startsWith('tel:') && !data.replace('tel:', ''))) {
      alert('Please enter content to generate QR code');
      return;
    }

    const size = parseInt(qrSize.value);
    const errorLevel = qrErrorLevel.value;
    const format = qrFormat.value;
    const color = qrColor.value;

    try {
      if (format === 'svg') {
        const svg = await QRCode.toString(data, {
          type: 'svg',
          width: size,
          errorCorrectionLevel: errorLevel,
          color: { dark: color, light: '#ffffff' }
        });
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        downloadPng.onclick = () => {
          const a = document.createElement('a');
          a.href = url;
          a.download = 'qrcode.svg';
          a.click();
        };
        resultSection.classList.remove('hidden');
        resultSize.textContent = `SVG format generated`;
      } else if (format === 'utf8') {
        const ascii = await QRCode.toString(data, {
          type: 'terminal',
          errorCorrectionLevel: errorLevel
        });
        const pre = document.createElement('pre');
        pre.style.cssText = 'background: #1a1a1a; color: #00ff00; padding: 20px; border-radius: 8px; overflow-x: auto; text-align: left; font-family: monospace;';
        pre.textContent = ascii;
        resultSection.querySelector('.preview-container').replaceWith(pre);
        resultSection.querySelector('.preview-container') || container.querySelector('.preview-container');
        resultSection.classList.remove('hidden');
        resultSize.textContent = 'Terminal/ASCII format';
      } else {
        await QRCode.toCanvas(qrCanvas, data, {
          width: size,
          errorCorrectionLevel: errorLevel,
          color: { dark: color, light: '#ffffff' }
        });
        resultSection.classList.remove('hidden');
        resultSize.textContent = `${size} × ${size} pixels`;
      }
    } catch (err) {
      alert('Error generating QR code: ' + err.message);
    }
  }

  generateBtn.addEventListener('click', generateQR);
  qrContent.addEventListener('keypress', (e) => e.key === 'Enter' && generateQR());

  downloadPng.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = qrCanvas.toDataURL('image/png');
    link.click();
  });

  downloadVcf.addEventListener('click', () => {
    const name = container.querySelector('#vcard-name').value || 'Contact';
    const phone = container.querySelector('#vcard-phone').value;
    const email = container.querySelector('#vcard-email').value;
    const org = container.querySelector('#vcard-org').value;
    const title = container.querySelector('#vcard-title').value;
    const website = container.querySelector('#vcard-website').value;
    const parts = name.trim().split(/\s+/);
    const lastName = parts.length > 1 ? parts.pop() : '';
    const firstName = parts.join(' ');
    let vcf = 'BEGIN:VCARD\nVERSION:3.0\n';
    vcf += `N:${lastName};${firstName};;;\nFN:${name}\n`;
    if (phone) vcf += `TEL:${phone}\n`;
    if (email) vcf += `EMAIL:${email}\n`;
    if (org) vcf += `ORG:${org}\n`;
    if (title) vcf += `TITLE:${title}\n`;
    if (website) vcf += `URL:${website}\n`;
    vcf += 'END:VCARD';
    const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${name.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  });

  copyClipboard.addEventListener('click', async () => {
    qrCanvas.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        alert('Copied to clipboard!');
      } catch {
        alert('Copy failed. Try downloading instead.');
      }
    });
  });
}
