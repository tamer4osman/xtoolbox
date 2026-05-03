export const toolConfig = {
  id: 'encrypt-file',
  name: 'File Encryption Tool',
  category: 'privacy',
  description: 'Encrypt files with AES-256-GCM password protection.',
  icon: '🔐',
  steps: ['Select file', 'Enter password', 'Encrypt/Decrypt']
};

export function render(container) {
  container.innerHTML = `
    <div class="enc-container">
      <div class="enc-tabs">
        <button class="enc-tab active" data-tab="encrypt">Encrypt</button>
        <button class="enc-tab" data-tab="decrypt">Decrypt</button>
      </div>
      
      <div class="enc-panel active" id="panel-encrypt">
        <input type="file" id="enc-file">
        <input type="password" id="enc-pwd" placeholder="Enter encryption password">
        <button id="enc-btn">Encrypt File</button>
        <a id="enc-download" class="download-link" style="display:none">Download Encrypted</a>
      </div>
      
      <div class="enc-panel" id="panel-decrypt">
        <input type="file" id="enc-file-dec">
        <input type="password" id="dec-pwd" placeholder="Enter decryption password">
        <button id="dec-btn">Decrypt File</button>
        <div class="enc-result" id="enc-result"></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .enc-container { max-width: 450px; margin: 0 auto; }
    .enc-tabs { display: flex; gap: var(--space-2); margin-bottom: var(--space-4); }
    .enc-tab { flex: 1; padding: var(--space-3); border: none; background: #f5f5f5; border-radius: var(--radius-md); cursor: pointer; }
    .enc-tab.active { background: var(--color-primary); color: white; }
    .enc-panel { display: none; }
    .enc-panel.active { display: block; }
    .enc-panel input { width: 100%; padding: var(--space-3); border: 1px solid #ddd; border-radius: var(--radius-md); margin-bottom: var(--space-3); }
    .enc-panel button { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; margin-bottom: var(--space-3); }
    .download-link { display: block; text-align: center; padding: var(--space-3); background: #28a745; color: white; border-radius: var(--radius-md); text-decoration: none; }
  `;
  container.appendChild(style);

  container.querySelectorAll('.enc-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.enc-tab').forEach(t => t.classList.remove('active'));
      container.querySelectorAll('.enc-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      container.querySelector(`#panel-${tab.dataset.tab}`).classList.add('active');
    });
  });

  async function deriveKey(pwd, salt) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(pwd), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }

  container.querySelector('#enc-btn').addEventListener('click', async () => {
    const file = container.querySelector('#enc-file').files[0];
    const pwd = container.querySelector('#enc-pwd').value;
    if (!file || !pwd) return;
    
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(pwd, salt);
    const data = await file.arrayBuffer();
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
    
    const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    result.set(salt, 0);
    result.set(iv, 16);
    result.set(new Uint8Array(encrypted), 28);
    
    const blob = new Blob([result]);
    const url = URL.createObjectURL(blob);
    const link = container.querySelector('#enc-download');
    link.href = url;
    link.download = file.name + '.enc';
    link.style.display = 'block';
  });

  return container;
}
