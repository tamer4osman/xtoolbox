import { TABS_CSS } from '../shared/tabs-css.js';
import { wireTabSwitching } from '../shared/tab-switching.js';

export const toolConfig = {
  id: 'steganography',
  name: 'Steganography',
  category: 'privacy',
  description: 'Hide secret text messages inside images.',
  icon: '🕵️',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-content">
        <div class="tabs">
          <button class="tab active" data-tab="encode">Encode</button>
          <button class="tab" data-tab="decode">Decode</button>
        </div>
        <div class="tab-panel active" id="encode-panel">
          <div class="input-section">
            <label>Image (PNG recommended)</label>
            <div class="upload-zone" id="encode-upload">
              <p>Drop image or <label>browse<input type="file" id="encode-file" accept="image/*" hidden /></label></p>
            </div>
          </div>
          <div class="input-section">
            <label>Secret Message</label>
            <textarea id="secret-text" class="tool-textarea" placeholder="Enter secret message..."></textarea>
          </div>
          <button id="encode-btn" class="tool-button primary">Hide Message</button>
        </div>
        <div class="tab-panel" id="decode-panel">
          <div class="input-section">
            <label>Stego-Image</label>
            <div class="upload-zone" id="decode-upload">
              <p>Drop image or <label>browse<input type="file" id="decode-file" accept="image/*" hidden /></label></p>
            </div>
          </div>
          <button id="decode-btn" class="tool-button primary">Reveal Message</button>
          <div id="decoded-result" class="decoded-result hidden">
            <h3>Hidden Message:</h3>
            <pre id="decoded-text"></pre>
          </div>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .tool-container { max-width: 600px; margin: 0 auto; }
    .tool-header { text-align: center; margin-bottom: var(--space-8); }
    .tool-textarea { min-height: 100px; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); resize: vertical; }
    .decoded-result { margin-top: var(--space-4); padding: var(--space-4); background: var(--color-surface); border-radius: var(--radius-lg); }
    .decoded-result.hidden { display: none; }
    .decoded-result pre { white-space: pre-wrap; word-break: break-all; }
    ${TABS_CSS}
  `;
  container.appendChild(style);

  const encodeBtn = container.querySelector('#encode-btn');
  const decodeBtn = container.querySelector('#decode-btn');

  wireTabSwitching(container);

  encodeBtn.addEventListener('click', async () => {
    const fileInput = container.querySelector('#encode-file');
    const text = container.querySelector('#secret-text').value;
    if (!fileInput.files[0] || !text) { alert('Select image and enter message'); return; }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const msg = text + '\0';
      const bits = msg.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join('');
      
      for (let i = 0; i < bits.length && i < data.data.length; i += 4) {
        data.data[i] = (data.data[i] & 254) | parseInt(bits[i / 4] || 0);
      }
      ctx.putImageData(data, 0, 0);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'stego.png';
      a.click();
    };
    img.src = URL.createObjectURL(fileInput.files[0]);
  });

  decodeBtn.addEventListener('click', async () => {
    const fileInput = container.querySelector('#decode-file');
    if (!fileInput.files[0]) { alert('Select image'); return; }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let bits = '';
      for (let i = 0; i < data.data.length; i += 4) {
        bits += (data.data[i] & 1).toString();
      }
      let chars = '';
      for (let i = 0; i < bits.length; i += 8) {
        const byte = bits.slice(i, i + 8);
        if (byte.length < 8) break;
        const char = String.fromCharCode(parseInt(byte, 2));
        if (char === '\0') break;
        chars += char;
      }
      container.querySelector('#decoded-text').textContent = chars || 'No hidden message found';
      container.querySelector('#decoded-result').classList.remove('hidden');
    };
    img.src = URL.createObjectURL(fileInput.files[0]);
  });
}
