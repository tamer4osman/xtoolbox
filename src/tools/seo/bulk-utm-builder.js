import { showToast } from '../../components/toast.js';

export const toolConfig = {
  id: 'bulk-utm-builder',
  name: 'Bulk UTM Campaign URL Builder',
  category: 'seo',
  description: 'Generate campaign tracking URLs in bulk, manage presets, and export directly to CSV.',
  icon: '🔗',
  status: 'done'
};

const STORAGE_KEY = 'wme-utm-presets';

const UTM_CSS = `
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

const UTM_HTML = `
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
      <div class="utm-results-header"><span id="utm-count"></span></div>
      <div class="utm-output" id="utm-output"></div>
    </div>
  </div>
`;

function loadPresets() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function savePresets(presets) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(presets)); return true; } catch { return false; }
}

function refreshPresetList(selectEl) {
  const presets = loadPresets();
  selectEl.innerHTML = '<option value="">-- Select Preset --</option>';
  presets.forEach((p, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = p.name;
    selectEl.appendChild(opt);
  });
}

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

function getParams(container) {
  return {
    source: container.querySelector('#utm-source').value.trim(),
    medium: container.querySelector('#utm-medium').value.trim(),
    campaign: container.querySelector('#utm-campaign').value.trim(),
    content: container.querySelector('#utm-content').value.trim(),
    term: container.querySelector('#utm-term').value.trim(),
  };
}

function sanitizeCsvValue(v) {
  const str = v || '';
  if (/^[=+\-@\t\r]/.test(str)) return "'" + str;
  return str;
}

function exportCsv(baseUrls, params, urls) {
  const header = 'base_url,utm_source,utm_medium,utm_campaign,utm_content,utm_term,full_url';
  const rows = baseUrls.map((u, i) =>
    [u, params.source, params.medium, params.campaign, params.content, params.term, urls[i] || ''].map(v => '"' + sanitizeCsvValue(v).replace(/"/g, '""') + '"').join(',')
  );
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
}

export function render(container) {
  container.innerHTML = UTM_HTML;

  const style = document.createElement('style');
  style.textContent = UTM_CSS;
  container.appendChild(style);

  const q = id => container.querySelector(`#${id}`);
  const els = {
    urls: q('utm-urls'),
    source: q('utm-source'),
    medium: q('utm-medium'),
    campaign: q('utm-campaign'),
    content: q('utm-content'),
    term: q('utm-term'),
    presetSelect: q('utm-preset-select'),
    loadBtn: q('utm-load'),
    saveBtn: q('utm-save'),
    deleteBtn: q('utm-delete'),
    generateBtn: q('utm-generate'),
    copyAllBtn: q('utm-copy-all'),
    exportCsvBtn: q('utm-export-csv'),
    clearBtn: q('utm-clear'),
    results: q('utm-results'),
    count: q('utm-count'),
    output: q('utm-output'),
  };

  let generatedUrls = [];
  let generatedBaseUrls = [];
  let generatedParams = {};

  refreshPresetList(els.presetSelect);

  els.saveBtn.addEventListener('click', () => {
    const name = prompt('Preset name:');
    if (!name) return;
    const presets = loadPresets();
    presets.push({ name, source: els.source.value, medium: els.medium.value, campaign: els.campaign.value, content: els.content.value, term: els.term.value });
    if (!savePresets(presets)) { showToast({ message: 'Failed to save preset. Storage may be full or unavailable.', type: 'error' }); return; }
    refreshPresetList(els.presetSelect);
  });

  els.loadBtn.addEventListener('click', () => {
    const idx = els.presetSelect.value;
    if (idx === '') return;
    const p = loadPresets()[parseInt(idx)];
    if (!p) return;
    els.source.value = p.source || '';
    els.medium.value = p.medium || '';
    els.campaign.value = p.campaign || '';
    els.content.value = p.content || '';
    els.term.value = p.term || '';
  });

  els.deleteBtn.addEventListener('click', () => {
    const idx = els.presetSelect.value;
    if (idx === '') return;
    const presets = loadPresets();
    presets.splice(parseInt(idx), 1);
    if (!savePresets(presets)) { showToast({ message: 'Failed to delete preset. Storage may be full or unavailable.', type: 'error' }); return; }
    refreshPresetList(els.presetSelect);
  });

  els.generateBtn.addEventListener('click', () => {
    const urls = els.urls.value.split('\n').map(u => u.trim()).filter(Boolean);
    if (urls.length === 0) return;
    const params = getParams(container);
    generatedBaseUrls = urls;
    generatedParams = params;
    generatedUrls = urls.map(u => buildUrl(u, params));
    els.output.textContent = generatedUrls.join('\n');
    els.count.textContent = generatedUrls.length + ' URLs generated';
    els.results.style.display = 'block';
  });

  els.copyAllBtn.addEventListener('click', () => {
    if (generatedUrls.length === 0) return;
    navigator.clipboard.writeText(generatedUrls.join('\n')).then(() => {
      els.copyAllBtn.textContent = 'Copied!';
      setTimeout(() => { els.copyAllBtn.textContent = 'Copy All'; }, 1500);
    }).catch(() => {
      els.copyAllBtn.textContent = 'Failed';
      setTimeout(() => { els.copyAllBtn.textContent = 'Copy All'; }, 1500);
    });
  });

  els.exportCsvBtn.addEventListener('click', () => {
    if (generatedUrls.length === 0) return;
    exportCsv(generatedBaseUrls, generatedParams, generatedUrls);
  });

  els.clearBtn.addEventListener('click', () => {
    els.urls.value = '';
    els.source.value = '';
    els.medium.value = '';
    els.campaign.value = '';
    els.content.value = '';
    els.term.value = '';
    els.results.style.display = 'none';
    generatedUrls = [];
    generatedBaseUrls = [];
    generatedParams = {};
  });
}
