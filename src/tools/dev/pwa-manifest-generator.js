export const toolConfig = {
  id: 'pwa-manifest-generator',
  name: 'PWA Manifest Generator',
  category: 'dev',
  description: 'Generate a web app manifest JSON for Progressive Web Apps.',
  icon: '📱',
  keywords: ['pwa', 'manifest', 'web app', 'progressive', 'manifest.json', 'service worker'],
  accept: '.json',
  maxSizeMB: 1
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div id="pwa-form"></div>
    </div>
  `;

  const form = container.querySelector('#pwa-form');
  form.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);">
      <div class="form-group">
        <label>App Name *</label>
        <input type="text" id="pwa-name" class="text-input" placeholder="My App" value="" />
      </div>
      <div class="form-group">
        <label>Short Name *</label>
        <input type="text" id="pwa-short-name" class="text-input" placeholder="MyApp" value="" />
      </div>
      <div class="form-group" style="grid-column:span 2;">
        <label>Description</label>
        <input type="text" id="pwa-description" class="text-input" placeholder="A description of your app" value="" />
      </div>
      <div class="form-group">
        <label>Start URL</label>
        <input type="text" id="pwa-start-url" class="text-input" placeholder="/" value="/" />
      </div>
      <div class="form-group">
        <label>Display Mode</label>
        <select id="pwa-display" class="text-input">
          <option value="standalone">standalone</option>
          <option value="fullscreen">fullscreen</option>
          <option value="minimal-ui">minimal-ui</option>
          <option value="browser">browser</option>
        </select>
      </div>
      <div class="form-group">
        <label>Background Color</label>
        <input type="color" id="pwa-bg-color" value="#ffffff" style="width:100%;height:40px;cursor:pointer;" />
      </div>
      <div class="form-group">
        <label>Theme Color</label>
        <input type="color" id="pwa-theme-color" value="#000000" style="width:100%;height:40px;cursor:pointer;" />
      </div>
      <div class="form-group">
        <label>Orientation</label>
        <select id="pwa-orientation" class="text-input">
          <option value="any">any</option>
          <option value="portrait">portrait</option>
          <option value="portrait-primary">portrait-primary</option>
          <option value="landscape">landscape</option>
          <option value="landscape-primary">landscape-primary</option>
        </select>
      </div>
      <div class="form-group">
        <label>Scope</label>
        <input type="text" id="pwa-scope" class="text-input" placeholder="/" value="/" />
      </div>
      <div class="form-group" style="grid-column:span 2;">
        <label>Icons (URLs, one per line)</label>
        <textarea id="pwa-icons" class="text-input" placeholder="https://example.com/icon-192.png&#10;https://example.com/icon-512.png" style="height:80px;resize:vertical;"></textarea>
      </div>
    </div>
    <button class="btn btn-primary" id="pwa-generate" style="width:100%;margin-top:var(--space-3);">Generate Manifest</button>
    <div id="pwa-output" style="display:none;margin-top:var(--space-3);">
      <label>Generated manifest.json:</label>
      <pre id="pwa-json" style="background:var(--color-surface);padding:var(--space-2);border-radius:var(--radius-md);overflow-x:auto;font-size:var(--text-xs);max-height:300px;overflow-y:auto;"></pre>
      <div style="display:flex;gap:var(--space-2);margin-top:var(--space-2);">
        <button class="btn btn-primary" id="pwa-download" style="flex:1;">Download</button>
        <button class="btn btn-ghost" id="pwa-copy">Copy</button>
      </div>
    </div>
  `;

  const nameInput = form.querySelector('#pwa-name');
  const shortNameInput = form.querySelector('#pwa-short-name');
  const descInput = form.querySelector('#pwa-description');
  const startUrlInput = form.querySelector('#pwa-start-url');
  const displayInput = form.querySelector('#pwa-display');
  const bgColorInput = form.querySelector('#pwa-bg-color');
  const themeColorInput = form.querySelector('#pwa-theme-color');
  const orientationInput = form.querySelector('#pwa-orientation');
  const scopeInput = form.querySelector('#pwa-scope');
  const iconsInput = form.querySelector('#pwa-icons');
  const generateBtn = form.querySelector('#pwa-generate');
  const outputArea = form.querySelector('#pwa-output');
  const jsonOutput = form.querySelector('#pwa-json');
  const downloadBtn = form.querySelector('#pwa-download');
  const copyBtn = form.querySelector('#pwa-copy');

  generateBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const shortName = shortNameInput.value.trim();

    if (!name || !shortName) {
      alert('Please enter App Name and Short Name');
      return;
    }

    const icons = iconsInput.value.trim().split('\n').filter(u => u.trim()).map((url, i) => ({
      src: url.trim(),
      sizes: i === 0 ? '192x192 512x512' : `${192 * (i + 1)}x${192 * (i + 1)}`,
      type: 'image/png',
      purpose: 'any maskable'
    }));

    const manifest = {
      name,
      short_name: shortName,
      description: descInput.value.trim() || undefined,
      start_url: startUrlInput.value.trim() || '/',
      display: displayInput.value,
      background_color: bgColorInput.value,
      theme_color: themeColorInput.value,
      orientation: orientationInput.value,
      scope: scopeInput.value.trim() || '/',
      icons: icons.length > 0 ? icons : undefined
    };

    Object.keys(manifest).forEach(key => {
      if (manifest[key] === undefined) delete manifest[key];
    });

    const json = JSON.stringify(manifest, null, 2);
    jsonOutput.textContent = json;
    outputArea.style.display = 'block';
  });

  downloadBtn.addEventListener('click', () => {
    const content = jsonOutput.textContent;
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manifest.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(jsonOutput.textContent).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
    }).catch(() => {});
  });
}

export function destroy() {}