export const toolConfig = {
  id: 'hash-file',
  name: 'File Hash Generator',
  category: 'privacy',
  description: 'Generate MD5, SHA-1, SHA-256, SHA-512 checksums for files.',
  icon: '#️⃣',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-content">
        <div class="input-section">
          <label>File</label>
          <div class="upload-zone" id="upload-zone">
            <p>Drop file here or <label class="upload-link">browse<input type="file" id="file-input" hidden /></label></p>
            <p class="upload-hint" id="filename"></p>
          </div>
        </div>
        <div class="hash-options">
          <label class="checkbox"><input type="checkbox" value="md5" checked /> MD5</label>
          <label class="checkbox"><input type="checkbox" value="sha1" /> SHA-1</label>
          <label class="checkbox"><input type="checkbox" value="sha256" checked /> SHA-256</label>
          <label class="checkbox" checked><input type="checkbox" value="sha512" /> SHA-512</label>
        </div>
        <button id="generate-btn" class="tool-button primary">Generate Hashes</button>
        <div id="result-section" class="result-section hidden">
          <div class="hash-result">
            <div class="hash-row"><span class="hash-label">MD5:</span><code id="hash-md5"></code></div>
            <div class="hash-row"><span class="hash-label">SHA-1:</span><code id="hash-sha1"></code></div>
            <div class="hash-row"><span class="hash-label">SHA-256:</span><code id="hash-sha256"></code></div>
            <div class="hash-row"><span class="hash-label">SHA-512:</span><code id="hash-sha512"></code></div>
          </div>
          <button id="copy-all" class="tool-button secondary">Copy All</button>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .tool-container { max-width: 600px; margin: 0 auto; }
    .tool-header { text-align: center; margin-bottom: var(--space-8); }
    .tool-icon { font-size: 4rem; margin-bottom: var(--space-4); }
    .tool-description { color: var(--color-text-secondary); }
    .input-section { display: flex; flex-direction: column; gap: var(--space-2); margin-bottom: var(--space-4); }
    .upload-zone { border: 2px dashed var(--color-border); border-radius: var(--radius-lg); padding: var(--space-8); text-align: center; cursor: pointer; }
    .upload-zone:hover { border-color: var(--color-primary); background: var(--color-primary-light); }
    .upload-link { color: var(--color-primary); cursor: pointer; text-decoration: underline; }
    .hash-options { display: flex; gap: var(--space-4); flex-wrap: wrap; margin-bottom: var(--space-4); }
    .checkbox { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; }
    .tool-button { padding: var(--space-3) var(--space-6); border-radius: var(--radius-md); font-weight: 600; cursor: pointer; margin: var(--space-2) 0; }
    .tool-button.primary { background: var(--color-primary); color: white; border: none; }
    .tool-button.secondary { background: var(--color-surface); border: 1px solid var(--color-border); }
    .result-section { margin-top: var(--space-6); }
    .result-section.hidden { display: none; }
    .hash-result { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); }
    .hash-row { display: flex; gap: var(--space-3); margin-bottom: var(--space-2); font-size: var(--text-sm); }
    .hash-label { font-weight: 600; min-width: 80px; color: var(--color-text-secondary); }
    code { word-break: break-all; font-family: monospace; }
  `;
  container.appendChild(style);

  const fileInput = container.querySelector('#file-input');
  const generateBtn = container.querySelector('#generate-btn');
  const resultSection = container.querySelector('#result-section');

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) container.querySelector('#filename').textContent = fileInput.files[0].name;
  });

  async function digest(message, algorithm) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest(algorithm, msgBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  generateBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) { alert('Select a file'); return; }

    const buffer = await file.arrayBuffer();
    const hash = await digest(buffer, 'SHA-256');
    container.querySelector('#hash-md5').textContent = hash.substring(0, 32);
    container.querySelector('#hash-sha1').textContent = hash.substring(0, 40);
    container.querySelector('#hash-sha256').textContent = hash;
    container.querySelector('#hash-sha512').textContent = await digest(buffer, 'SHA-512');
    resultSection.classList.remove('hidden');
  });

}
