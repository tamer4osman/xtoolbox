export const toolConfig = {
  id: 'steganography',
  name: 'Image Steganography',
  category: 'privacy',
  description: 'Hide secret messages in images using LSB steganography.',
  icon: '🔍',
  steps: ['Upload image', 'Enter secret message', 'Encode/Decode']
};

export function render(container) {
  container.innerHTML = `
    <div class="steg-container">
      <div class="steg-tabs">
        <button class="steg-tab active" data-tab="encode">Encode</button>
        <button class="steg-tab" data-tab="decode">Decode</button>
      </div>
      
      <div class="steg-panel active" id="panel-encode">
        <input type="file" id="steg-file" accept="image/*">
        <textarea id="steg-msg" placeholder="Enter secret message..."></textarea>
        <button id="steg-encode">Encode Message</button>
        <a id="steg-download" class="download-link" style="display:none">Download Encoded Image</a>
      </div>
      
      <div class="steg-panel" id="panel-decode">
        <input type="file" id="steg-file-dec" accept="image/*">
        <button id="steg-decode">Decode Message</button>
        <div class="steg-result" id="decoded-result"></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .steg-container { max-width: 500px; margin: 0 auto; }
    .steg-tabs { display: flex; gap: var(--space-2); margin-bottom: var(--space-4); }
    .steg-tab { flex: 1; padding: var(--space-3); border: none; background: #f5f5f5; border-radius: var(--radius-md); cursor: pointer; }
    .steg-tab.active { background: var(--color-primary); color: white; }
    .steg-panel { display: none; }
    .steg-panel.active { display: block; }
    .steg-container input[type="file"] { margin-bottom: var(--space-3); width: 100%; }
    .steg-panel textarea { width: 100%; height: 100px; padding: var(--space-3); border: 1px solid #ddd; border-radius: var(--radius-md); resize: vertical; margin-bottom: var(--space-3); }
    .steg-panel button { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; margin-bottom: var(--space-3); }
    .download-link { display: block; text-align: center; padding: var(--space-3); background: #28a745; color: white; border-radius: var(--radius-md); text-decoration: none; }
    .steg-result { padding: var(--space-4); background: #f5f5f5; border-radius: var(--radius-lg); font-family: monospace; word-break: break-all; }
  `;
  container.appendChild(style);

  container.querySelectorAll('.steg-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.steg-tab').forEach(t => t.classList.remove('active'));
      container.querySelectorAll('.steg-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      container.querySelector(`#panel-${tab.dataset.tab}`).classList.add('active');
    });
  });

  container.querySelector('#steg-encode').addEventListener('click', async () => {
    const file = container.querySelector('#steg-file').files[0];
    const msg = container.querySelector('#steg-msg').value;
    if (!file || !msg) return;
    
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    const msgBits = msg.split('').flatMap(c => c.charCodeAt(0).toString(2).padStart(8, '0'));
    const lenBits = msgBits.length.toString(2).padStart(32, '0');
    const allBits = lenBits + msgBits;
    
    if (allBits.length > imgData.data.length / 4) {
      alert('Message too long for this image');
      return;
    }
    
    for (let i = 0; i < allBits.length; i++) {
      const pixelIdx = i * 4;
      imgData.data[pixelIdx] = (imgData.data[pixelIdx] & 0xFE) | parseInt(allBits[i]);
    }
    
    ctx.putImageData(imgData, 0, 0);
    
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const link = container.querySelector('#steg-download');
      link.href = url;
      link.download = 'encoded_' + file.name;
      link.style.display = 'block';
    });
  });

  container.querySelector('#steg-decode').addEventListener('click', async () => {
    const file = container.querySelector('#steg-file-dec').files[0];
    if (!file) return;
    
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    let lenBits = '';
    for (let i = 0; i < 32; i++) {
      lenBits += (imgData.data[i * 4] & 1).toString();
    }
    const len = parseInt(lenBits, 2);
    
    if (len <= 0 || len > imgData.data.length / 4) {
      container.querySelector('#decoded-result').textContent = 'No hidden message found';
      return;
    }
    
    let msgBits = '';
    for (let i = 32; i < 32 + len; i++) {
      msgBits += (imgData.data[i * 4] & 1).toString();
    }
    
    let msg = '';
    for (let i = 0; i < msgBits.length; i += 8) {
      msg += String.fromCharCode(parseInt(msgBits.slice(i, i + 8), 2);
    }
    
    container.querySelector('#decoded-result').textContent = msg;
  });

  return container;
}
