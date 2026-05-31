export const toolConfig = {
  id: 'bulk-utm-builder',
  name: 'Bulk UTM Campaign URL Builder',
  category: 'seo',
  description: 'Generate campaign tracking URLs in bulk, manage presets, and export directly to CSV.',
  icon: '🔗',
  status: 'done'
};

const STORAGE_KEY = 'wme-utm-presets';

export function render(container) {
  container.innerHTML = `
    <div class="utm-container">
      <div class="utm-input-section">
        <div class="utm-section">
          <h3>Base URLs</h3>
          <textarea id="utm-urls" placeholder="Enter one URL per line...&#10;https://example.com/pricing&#10;https://example.com/features&#10;https://example.com/contact"></textarea>
        </div>
        <div class="utm-section">
          <h3>UTM Parameters</h3>
          <div class="utm-fields">
            <div class="utm-field"><label>utm_source *</label><input type="text" id="utm-source" placeholder="google, facebook, newsletter"></div>
            <div class="utm-field"><label>utm_medium *</label><input type="text" id="utm-medium" placeholder="cpc, email, social"></div>
            <div class="utm-field"><label>utm_campaign *</label><input type="text" id="utm-campaign" placeholder="spring_sale, product_launch"></div>
            <div class="utm-field"><label>utm_content</label><input type="text" id="utm-content" placeholder="banner_a, sidebar_link"></div>
            <div class="utm-field"><label>utm_term</label><input type="text" id="utm-term" placeholder="running_shoes"></div>
          </div>
        </div>
        <div class="utm-section">
          <h3>Presets</h3>
          <div class="utm-presets">
            <select id="utm-preset-select"><option value="">-- Select Preset --</option></select>
            <button id="utm-load" class="utm-btn utm-btn-ghost">Load</button>
            <button id="utm-save" class="utm-btn utm-btn-ghost">Save Current</button>
            <button id="utm-delete" class="utm-btn utm-btn-ghost utm-btn-danger">Delete</button>
          </div>
        </div>
        <div class="utm-actions">
          <button id="utm-generate" class="utm-btn utm-btn-primary">Generate URLs</button>
          <button id="utm-copy-all" class="utm-btn utm-btn-ghost">Copy All</button>
          <button id="utm-export-csv" class="utm-btn utm-btn-ghost">Export CSV</button>
          <button id="utm-clear" class="utm-btn utm-btn-ghost">Clear</button>
        </div>
      </div>
      <div class="utm-results" id="utm-results" style="display:none">
        <div class="utm-results-header">
          <span id="utm-count"></span>
        </div>
        <div class="utm-output" id="utm-output"></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .utm-container { max-width: 900px; margin: 0 auto; }
    .utm-input-section { display: flex; flex-direction: column; gap: var(--space-3); }
    .utm-section { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); }
    .utm-section h3 { font-size: var(--text-sm); margin-bottom: var(--space-3); }
    .utm-section textarea { width: 100%; height: 120px; padding: var(--space-3); border: 2px solid var(--color-border); border-radius: var(--radius-lg); font-family: monospace; font-size: var(--text-sm); resize: vertical; background: var(--color-bg); }
    .utm-section textarea:focus { outline: none; border-color: var(--color-primary); }
    .utm-fields { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--space-3); }
    .utm-field label { display: block; font-size: var(--text-xs); font-weight: 600; margin-bottom: var(--space-1); color: var(--color-text-secondary); }
    .utm-field input { width: 100%; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); }
    .utm-field input:focus { outline: none; border-color: var(--color-primary); }
    .utm-presets { display: flex; gap: var(--space-2); align-items: center; flex-wrap: wrap; }
    .utm-presets select { flex: 1; min-width: 150px; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); }
    .utm-actions { display: flex; gap: var(--space-3); flex-wrap: wrap; }
    .utm-btn { padding: var(--space-2) var(--space-4); border-radius: var(--radius-md); border: none; cursor: pointer; font-size: var(--text-sm); font-weight: 500; }
    .utm-btn-primary { background: var(--color-primary); color: #fff; }
    .utm-btn-primary:hover { background: var(--color-primary-hover); }
    .utm-btn-ghost { background: transparent; color: var(--color-text-secondary); border: 1px solid var(--color-border); }
    .utm-btn-ghost:hover { background: var(--color-surface); }
    .utm-btn-danger { color: #ef4444; }
    .utm-results { margin-top: var(--space-4); }
    .utm-results-header { font-weight: 600; font-size: var(--text-sm); margin-bottom: var(--space-2); }
    .utm-output { background: #1e1e2e; color: #cdd6f4; padding: var(--space-4); border-radius: var(--radius-xl); font-family: monospace; font-size: var(--text-xs); line-height: 1.8; overflow-x: auto; white-space: pre-wrap; word-break: break-all; max-height: 400px; overflow-y: auto; }
  `;
  container.appendChild(style);

  let generatedUrls = [];
  let generatedBaseUrls = [];
  let generatedParams = {};

  function loadPresets() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch { return []; }
  }

  function savePresets(presets) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
      return true;
    } catch {
      return false;
    }
  }

  function refreshPresetList() {
    const select = container.querySelector('#utm-preset-select');
    const presets = loadPresets();
    select.innerHTML = '<option value="">-- Select Preset --</option>';
    presets.forEach((p, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = p.name;
      select.appendChild(opt);
    });
  }

  container.querySelector('#utm-save').addEventListener('click', () => {
    const name = prompt('Preset name:');
    if (!name) return;
    const presets = loadPresets();
    presets.push({
      name,
      source: container.querySelector('#utm-source').value,
      medium: container.querySelector('#utm-medium').value,
      campaign: container.querySelector('#utm-campaign').value,
      content: container.querySelector('#utm-content').value,
      term: container.querySelector('#utm-term').value,
    });
    if (!savePresets(presets)) {
      alert('Failed to save preset. Storage may be full or unavailable.');
      return;
    }
    refreshPresetList();
  });

  container.querySelector('#utm-load').addEventListener('click', () => {
    const idx = container.querySelector('#utm-preset-select').value;
    if (idx === '') return;
    const presets = loadPresets();
    const p = presets[parseInt(idx)];
    if (!p) return;
    container.querySelector('#utm-source').value = p.source || '';
    container.querySelector('#utm-medium').value = p.medium || '';
    container.querySelector('#utm-campaign').value = p.campaign || '';
    container.querySelector('#utm-content').value = p.content || '';
    container.querySelector('#utm-term').value = p.term || '';
  });

  container.querySelector('#utm-delete').addEventListener('click', () => {
    const idx = container.querySelector('#utm-preset-select').value;
    if (idx === '') return;
    const presets = loadPresets();
    presets.splice(parseInt(idx), 1);
    if (!savePresets(presets)) {
      alert('Failed to delete preset. Storage may be full or unavailable.');
      return;
    }
    refreshPresetList();
  });

  function buildUrl(base, params) {
    let url = base.trim();
    const separator = url.includes('?') ? '&' : '?';
    const utm = [];
    if (params.source) utm.push('utm_source=' + encodeURIComponent(params.source));
    if (params.medium) utm.push('utm_medium=' + encodeURIComponent(params.medium));
    if (params.campaign) utm.push('utm_campaign=' + encodeURIComponent(params.campaign));
    if (params.content) utm.push('utm_content=' + encodeURIComponent(params.content));
    if (params.term) utm.push('utm_term=' + encodeURIComponent(params.term));
    if (utm.length === 0) return url;
    return url + separator + utm.join('&');
  }

  container.querySelector('#utm-generate').addEventListener('click', () => {
    const urls = container.querySelector('#utm-urls').value.split('\n').map(u => u.trim()).filter(Boolean);
    if (urls.length === 0) return;

    const params = {
      source: container.querySelector('#utm-source').value.trim(),
      medium: container.querySelector('#utm-medium').value.trim(),
      campaign: container.querySelector('#utm-campaign').value.trim(),
      content: container.querySelector('#utm-content').value.trim(),
      term: container.querySelector('#utm-term').value.trim(),
    };

    generatedBaseUrls = urls;
    generatedParams = params;
    generatedUrls = urls.map(u => buildUrl(u, params));

    const output = container.querySelector('#utm-output');
    output.textContent = generatedUrls.join('\n');
    container.querySelector('#utm-count').textContent = generatedUrls.length + ' URLs generated';
    container.querySelector('#utm-results').style.display = 'block';
  });

  container.querySelector('#utm-copy-all').addEventListener('click', () => {
    if (generatedUrls.length === 0) return;
    navigator.clipboard.writeText(generatedUrls.join('\n')).then(() => {
      const btn = container.querySelector('#utm-copy-all');
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy All', 1500);
    }).catch(() => {});
  });

  container.querySelector('#utm-export-csv').addEventListener('click', () => {
    if (generatedUrls.length === 0) return;
    const header = 'base_url,utm_source,utm_medium,utm_campaign,utm_content,utm_term,full_url';
    const rows = generatedBaseUrls.map((u, i) => {
      return [u, generatedParams.source, generatedParams.medium, generatedParams.campaign, generatedParams.content, generatedParams.term, generatedUrls[i] || ''].map(v => '"' + (v || '').replace(/"/g, '""') + '"').join(',');
    });
    const csv = header + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'utm-urls-' + Date.now() + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  container.querySelector('#utm-clear').addEventListener('click', () => {
    container.querySelector('#utm-urls').value = '';
    container.querySelector('#utm-source').value = '';
    container.querySelector('#utm-medium').value = '';
    container.querySelector('#utm-campaign').value = '';
    container.querySelector('#utm-content').value = '';
    container.querySelector('#utm-term').value = '';
    container.querySelector('#utm-results').style.display = 'none';
    generatedUrls = [];
    generatedBaseUrls = [];
    generatedParams = {};
  });

  refreshPresetList();
}
