import QRCode from 'qrcode';
import { CONTENT_BUILDERS, TYPE_FIELDS, buildVcf } from './qr-content-builders.js';
import { QR_STYLES } from './qr-styles.js';

export const toolConfig = {
  id: 'qr-generator',
  name: 'QR Code Generator',
  category: 'qr',
  description: 'Generate QR codes from text, URLs, vCard, or WiFi credentials.',
  icon: '📱',
  status: 'done',
  keywords: ['qr code', 'qr generator', 'qrcode', 'vcard', 'wifi qr', 'contact qr'],
  steps: [
    'Select QR code type: text, URL, WiFi, vCard, email, phone, or SMS',
    'Fill in the details for your selected type',
    'Customize size, format, error correction, and color',
    'Click Generate QR Code, then download or copy'
  ],
  faqs: [
    {
      question: 'Can I scan QR codes with this tool?',
      answer: 'This tool only generates QR codes. Use the QR Code Scanner tool to scan existing QR codes from images.'
    },
    {
      question: 'Is the data I enter sent to a server?',
      answer: 'No. All QR code generation happens entirely in your browser using the qrcode library. Your data never leaves your device.'
    }
  ]
};

let _style = null;

function showTypeFields(container, type) {
  const allFields = ['content-inputs', 'wifi-fields', 'vcard-fields', 'email-fields', 'phone-fields', 'sms-fields'];
  allFields.forEach(id => { container.querySelector(`.${id}`).style.display = 'none'; });
  const target = TYPE_FIELDS[type];
  if (target) container.querySelector(`.${target}`).style.display = 'flex';
  const vcfBtn = container.querySelector('#download-vcf');
  if (vcfBtn) vcfBtn.style.display = type === 'vcard' ? '' : 'none';
  if (type === 'url' || type === 'text') {
    container.querySelector('#qr-content').placeholder = type === 'url' ? 'https://example.com' : 'Enter text...';
  }
}

async function generateQR(container) {
  const type = container.querySelector('#qr-type').value;
  const builder = CONTENT_BUILDERS[type];
  const data = builder ? builder(container) : '';
  if (!data) { alert('Please enter content to generate QR code'); return; }

  const size = parseInt(container.querySelector('#qr-size').value);
  const errorLevel = container.querySelector('#qr-error-level').value;
  const format = container.querySelector('#qr-format').value;
  const color = container.querySelector('#qr-color').value;
  const resultSection = container.querySelector('#result-section');
  const resultSize = container.querySelector('#result-size');
  const qrCanvas = container.querySelector('#qr-canvas');
  const downloadPng = container.querySelector('#download-png');

  try {
    if (format === 'svg') {
      const svg = await QRCode.toString(data, { type: 'svg', width: size, errorCorrectionLevel: errorLevel, color: { dark: color, light: '#ffffff' } });
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      downloadPng.onclick = () => { const a = document.createElement('a'); a.href = url; a.download = 'qrcode.svg'; a.click(); };
      resultSection.classList.remove('hidden');
      resultSize.textContent = 'SVG format generated';
    } else if (format === 'utf8') {
      const ascii = await QRCode.toString(data, { type: 'terminal', errorCorrectionLevel: errorLevel });
      const previewContainer = resultSection.querySelector('.preview-container');
      let pre = resultSection.querySelector('.ascii-preview');
      if (!pre) {
        pre = document.createElement('pre');
        pre.className = 'ascii-preview';
        pre.style.cssText = 'background:#1a1a1a;color:#00ff00;padding:20px;border-radius:8px;overflow-x:auto;text-align:left;font-family:monospace;';
        previewContainer.after(pre);
      }
      pre.textContent = ascii;
      pre.style.display = 'block';
      previewContainer.style.display = 'none';
      resultSection.classList.remove('hidden');
      resultSize.textContent = 'Terminal/ASCII format';
    } else {
      const previewContainer = resultSection.querySelector('.preview-container');
      const pre = resultSection.querySelector('.ascii-preview');
      if (pre) pre.style.display = 'none';
      previewContainer.style.display = 'inline-block';
      await QRCode.toCanvas(qrCanvas, data, { width: size, errorCorrectionLevel: errorLevel, color: { dark: color, light: '#ffffff' } });
      resultSection.classList.remove('hidden');
      resultSize.textContent = `${size} × ${size} pixels`;
    }
  } catch (err) {
    alert('Error generating QR code: ' + err.message);
  }
}

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
        <div class="input-section content-inputs"><label for="qr-content">Content</label><input type="text" id="qr-content" class="tool-input" placeholder="Enter URL or text..." /></div>
        <div class="input-section wifi-fields" style="display:none;"><label>WiFi Details</label><input type="text" id="wifi-ssid" class="tool-input" placeholder="Network Name (SSID)" /><input type="password" id="wifi-password" class="tool-input" placeholder="Password" /><select id="wifi-encryption" class="tool-select"><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">No Encryption</option></select><label class="checkbox-label"><input type="checkbox" id="wifi-hidden" /> Hidden Network</label></div>
        <div class="input-section vcard-fields" style="display:none;"><label>Contact Details</label><input type="text" id="vcard-name" class="tool-input" placeholder="Full Name" /><input type="tel" id="vcard-phone" class="tool-input" placeholder="Phone Number" /><input type="email" id="vcard-email" class="tool-input" placeholder="Email Address" /><input type="text" id="vcard-org" class="tool-input" placeholder="Organization" /><input type="text" id="vcard-title" class="tool-input" placeholder="Job Title" /><input type="url" id="vcard-website" class="tool-input" placeholder="Website" /></div>
        <div class="input-section email-fields" style="display:none;"><input type="email" id="email-address" class="tool-input" placeholder="Email Address" /><input type="text" id="email-subject" class="tool-input" placeholder="Subject (optional)" /><textarea id="email-body" class="tool-textarea" placeholder="Message (optional)"></textarea></div>
        <div class="input-section phone-fields" style="display:none;"><input type="tel" id="phone-number" class="tool-input" placeholder="Phone Number" /></div>
        <div class="input-section sms-fields" style="display:none;"><input type="tel" id="sms-number" class="tool-input" placeholder="Phone Number" /><textarea id="sms-body" class="tool-textarea" placeholder="Message"></textarea></div>
        <div class="options-grid">
          <div class="option-group"><label for="qr-size">Size</label><select id="qr-size" class="tool-select"><option value="128">128 × 128</option><option value="256" selected>256 × 256</option><option value="512">512 × 512</option><option value="1024">1024 × 1024</option></select></div>
          <div class="option-group"><label for="qr-format">Format</label><select id="qr-format" class="tool-select"><option value="png" selected>PNG</option><option value="svg">SVG</option><option value="utf8">Terminal (UTF-8)</option></select></div>
          <div class="option-group"><label for="qr-error-level">Error Correction</label><select id="qr-error-level" class="tool-select"><option value="L">Low (7%)</option><option value="M" selected>Medium (15%)</option><option value="Q">Quartile (25%)</option><option value="H">High (30%)</option></select></div>
          <div class="option-group"><label for="qr-color">Color</label><input type="color" id="qr-color" class="tool-color" value="#000000" /></div>
        </div>
        <button id="generate-btn" class="tool-button primary">Generate QR Code</button>
        <div id="result-section" class="result-section hidden">
          <div class="preview-container"><canvas id="qr-canvas"></canvas></div>
          <div class="result-info"><p id="result-size"></p></div>
          <div class="result-actions">
            <button id="download-png" class="tool-button secondary">Download PNG</button>
            <button id="download-vcf" class="tool-button secondary" style="display:none;">Download .vcf</button>
            <button id="copy-clipboard" class="tool-button secondary">Copy to Clipboard</button>
          </div>
        </div>
      </div>
    </div>
  `;

  _style = document.createElement('style');
  _style.textContent = QR_STYLES;
  container.appendChild(_style);

  // Type switching
  container.querySelector('#qr-type').addEventListener('change', (e) => {
    showTypeFields(container, e.target.value);
  });

  // Generate
  container.querySelector('#generate-btn').addEventListener('click', () => generateQR(container));
  container.querySelector('#qr-content').addEventListener('keypress', (e) => { if (e.key === 'Enter') generateQR(container); });

  // Download PNG
  container.querySelector('#download-png').addEventListener('click', () => {
    const a = document.createElement('a');
    a.download = 'qrcode.png';
    a.href = container.querySelector('#qr-canvas').toDataURL('image/png');
    a.click();
  });

  // Download VCF
  container.querySelector('#download-vcf').addEventListener('click', () => {
    const { vcf, filename } = buildVcf(container);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([vcf], { type: 'text/vcard;charset=utf-8' }));
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  });

  // Copy to clipboard
  container.querySelector('#copy-clipboard').addEventListener('click', () => {
    container.querySelector('#qr-canvas').toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        alert('Copied to clipboard!');
      } catch { alert('Copy failed. Try downloading instead.'); }
    });
  });
}

export function destroy() {
  if (_style) _style.remove();
}
