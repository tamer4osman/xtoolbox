import { escapeHtml } from '../../utils/escape-html.js';

export const toolConfig = {
  id: 'sitemap-visualizer',
  name: 'Sitemap XML Visualizer',
  category: 'dev',
  description: 'Parse and display sitemap.xml files as interactive, collapsible directory tree mind-maps.',
  icon: '🌳',
  status: 'done'
};

const SV_CSS = `
  .sv-container { max-width: 900px; margin: 0 auto; }
  .sv-tabs { display: flex; gap: var(--space-2); margin-bottom: var(--space-3); }
  .sv-tab { padding: var(--space-2) var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg); cursor: pointer; font-size: var(--text-sm); }
  .sv-tab.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
  .sv-tab-content textarea { width: 100%; height: 200px; padding: var(--space-3); border: 2px solid var(--color-border); border-radius: var(--radius-xl); font-family: monospace; font-size: var(--text-sm); resize: vertical; background: var(--color-surface); }
  .sv-tab-content textarea:focus { outline: none; border-color: var(--color-primary); }
  .sv-dropzone { border: 2px dashed var(--color-border); border-radius: var(--radius-xl); padding: var(--space-10); text-align: center; cursor: pointer; color: var(--color-text-secondary); position: relative; }
  .sv-dropzone.dragover { border-color: var(--color-primary); background: var(--color-primary-light); }
  .sv-dropzone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
  .sv-actions { display: flex; gap: var(--space-3); margin-top: var(--space-3); }
  .sv-btn { padding: var(--space-2) var(--space-4); border-radius: var(--radius-md); border: none; cursor: pointer; font-size: var(--text-sm); font-weight: 500; }
  .sv-btn-primary { background: var(--color-primary); color: #fff; }
  .sv-btn-primary:hover { background: var(--color-primary-hover); }
  .sv-btn-ghost { background: transparent; color: var(--color-text-secondary); }
  .sv-results { margin-top: var(--space-6); }
  .sv-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: var(--space-3); margin-bottom: var(--space-4); }
  .sv-stat { background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-lg); text-align: center; }
  .sv-stat .num { font-size: var(--text-2xl); font-weight: 700; color: var(--color-primary); }
  .sv-stat .label { font-size: var(--text-xs); color: var(--color-text-secondary); margin-top: var(--space-1); }
  .sv-tree { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-4); font-family: monospace; font-size: var(--text-sm); overflow-x: auto; }
  .sv-node { margin-left: 20px; }
  .sv-node-row { display: flex; align-items: center; gap: var(--space-2); padding: 3px 0; cursor: pointer; user-select: none; }
  .sv-node-row:hover { background: rgba(0,0,0,0.03); border-radius: var(--radius-sm); }
  .sv-toggle { width: 16px; text-align: center; font-size: 10px; color: var(--color-text-muted); flex-shrink: 0; }
  .sv-toggle.open::before { content: '▼'; }
  .sv-toggle.closed::before { content: '▶'; }
  .sv-toggle.leaf { visibility: hidden; }
  .sv-icon { flex-shrink: 0; }
  .sv-name { font-weight: 500; }
  .sv-count { color: var(--color-text-muted); font-size: var(--text-xs); }
  .sv-meta { color: var(--color-text-secondary); font-size: var(--text-xs); margin-left: auto; }
  .sv-url-list { margin-left: 20px; padding: var(--space-2) var(--space-3); background: rgba(0,0,0,0.02); border-radius: var(--radius-md); }
  .sv-url-item { padding: 2px 0; color: var(--color-text-secondary); font-size: var(--text-xs); word-break: break-all; }
  .sv-url-item:hover { color: var(--color-primary); }
  .sv-error { padding: var(--space-4); background: #fee2e2; color: #991b1b; border-radius: var(--radius-xl); text-align: center; }
`;

const DEMO_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.com/</loc><lastmod>2026-01-15</lastmod><priority>1.0</priority></url>
  <url><loc>https://example.com/about</loc><lastmod>2026-01-10</lastmod><priority>0.8</priority></url>
  <url><loc>https://example.com/blog/</loc><lastmod>2026-03-20</lastmod><priority>0.9</priority></url>
  <url><loc>https://example.com/blog/post-1</loc><lastmod>2026-03-18</lastmod><changefreq>monthly</changefreq></url>
  <url><loc>https://example.com/blog/post-2</loc><lastmod>2026-03-15</lastmod><changefreq>monthly</changefreq></url>
  <url><loc>https://example.com/blog/post-3</loc><lastmod>2026-02-28</lastmod><changefreq>yearly</changefreq></url>
  <url><loc>https://example.com/products/</loc><lastmod>2026-03-22</lastmod><priority>0.9</priority></url>
  <url><loc>https://example.com/products/widget-a</loc><lastmod>2026-03-20</lastmod><changefreq>weekly</changefreq></url>
  <url><loc>https://example.com/products/widget-b</loc><lastmod>2026-03-19</lastmod><changefreq>weekly</changefreq></url>
  <url><loc>https://example.com/products/widget-c</loc><lastmod>2026-01-05</lastmod><changefreq>yearly</changefreq></url>
  <url><loc>https://example.com/contact</loc><lastmod>2025-12-01</lastmod><priority>0.5</priority></url>
  <url><loc>https://example.com/privacy</loc><lastmod>2025-06-15</lastmod><priority>0.3</priority></url>
  <url><loc>https://example.com/terms</loc><lastmod>2025-06-15</lastmod><priority>0.3</priority></url>
</urlset>`;

function renderTree(node, depth) {
  let html = '';
  const keys = Object.keys(node).sort((a, b) => {
    const aUrls = node[a]._urls?.length || 0;
    const bUrls = node[b]._urls?.length || 0;
    return bUrls - aUrls;
  });
  keys.forEach(key => {
    const child = node[key];
    const urlCount = child._urls?.length || 0;
    const hasChildren = Object.keys(child).some(k => k !== '_urls');
    const isLeaf = !hasChildren && urlCount <= 1;
    const toggleClass = isLeaf ? 'leaf' : 'open';
    const icon = hasChildren ? '📁' : (urlCount > 1 ? '📄' : '🔗');
    const count = urlCount > 1 ? `<span class="sv-count">(${urlCount} urls)</span>` : '';

    html += `<div class="sv-node-row" style="padding-left:${depth * 20}px">`;
    html += `<span class="sv-toggle ${toggleClass}"></span>`;
    html += `<span class="sv-icon">${icon}</span>`;
    html += `<span class="sv-name">${escapeHtml(key)}</span>${count}`;
    if (child._urls?.length === 1 && !hasChildren) {
      const m = child._urls[0].lastmod;
      if (m) html += `<span class="sv-meta">${m}</span>`;
    }
    html += `</div>`;

    if (hasChildren) {
      html += `<div class="sv-node" style="padding-left:${depth * 20 + 20}px">`;
      html += renderTree(child, depth + 1);
      html += `</div>`;
    } else if (urlCount > 1) {
      html += `<div class="sv-url-list" style="display:block;padding-left:${depth * 20 + 20}px">`;
      child._urls.forEach(u => {
        const m = u.lastmod ? ` — ${u.lastmod}` : '';
        html += `<div class="sv-url-item">${escapeHtml(u.loc)}${m}</div>`;
      });
      html += `</div>`;
    }
  });
  return html;
}

function parseSitemapXml(xml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) throw new Error('Invalid XML: ' + parseError.textContent.slice(0, 200));

  const urls = doc.querySelectorAll('url');
  if (urls.length === 0) throw new Error('No <url> entries found. Make sure this is a valid sitemap.');

  const entries = [];
  urls.forEach(url => {
    const loc = url.querySelector('loc')?.textContent?.trim();
    if (!loc) return;
    const lastmod = url.querySelector('lastmod')?.textContent?.trim() || '';
    const changefreq = url.querySelector('changefreq')?.textContent?.trim() || '';
    const priority = url.querySelector('priority')?.textContent?.trim() || '';
    entries.push({ loc, lastmod, changefreq, priority });
  });

  const root = {};
  entries.forEach(entry => {
    const url = new URL(entry.loc);
    const parts = url.hostname.replace(/^www\./, '').split('.').concat(url.pathname.split('/').filter(Boolean));
    let node = root;
    parts.forEach((part, i) => {
      if (!node[part]) node[part] = i === parts.length - 1 ? { _urls: [] } : {};
      if (i === parts.length - 1) node[part]._urls = node[part]._urls || [];
      if (i === parts.length - 1) node[part]._urls.push(entry);
      node = node[part];
    });
  });

  return { entries, root };
}

function renderStatsHtml(entries) {
  const priorities = entries.filter(e => e.priority).map(e => parseFloat(e.priority));
  const dates = entries.filter(e => e.lastmod).map(e => new Date(e.lastmod));
  const freqs = entries.reduce((acc, e) => { if (e.changefreq) acc[e.changefreq] = (acc[e.changefreq] || 0) + 1; return acc; }, {});
  const mostRecent = dates.length ? new Date(Math.max(...dates)).toLocaleDateString() : 'N/A';
  const oldest = dates.length ? new Date(Math.min(...dates)).toLocaleDateString() : 'N/A';
  const avgPriority = priorities.length ? (priorities.reduce((a, b) => a + b, 0) / priorities.length).toFixed(2) : 'N/A';

  return `
    <div class="sv-stat"><div class="num">${entries.length}</div><div class="label">Total URLs</div></div>
    <div class="sv-stat"><div class="num">${mostRecent}</div><div class="label">Most Recent</div></div>
    <div class="sv-stat"><div class="num">${oldest}</div><div class="label">Oldest Date</div></div>
    <div class="sv-stat"><div class="num">${avgPriority}</div><div class="label">Avg Priority</div></div>
    <div class="sv-stat"><div class="num">${Object.keys(freqs).length}</div><div class="label">Freq Types</div></div>
  `;
}

function bindSitemapEvents(container, els) {
  container.querySelectorAll('.sv-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.sv-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      container.querySelector('#pasteTab').style.display = tab.dataset.tab === 'paste' ? 'block' : 'none';
      container.querySelector('#uploadTab').style.display = tab.dataset.tab === 'upload' ? 'block' : 'none';
    });
  });

  const dropzone = container.querySelector('#dropzone');
  const fileInput = container.querySelector('#fileInput');
  dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('dragover'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  });
  fileInput.addEventListener('change', e => { if (e.target.files[0]) readFile(e.target.files[0]); });

  function readFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
      els.xmlInput.value = e.target.result;
      container.querySelectorAll('.sv-tab').forEach(t => t.classList.remove('active'));
      container.querySelector('.sv-tab[data-tab="paste"]').classList.add('active');
      container.querySelector('#pasteTab').style.display = 'block';
      container.querySelector('#uploadTab').style.display = 'none';
    };
    reader.readAsText(file);
  }

  container.querySelector('.sv-tab[data-tab="demo"]').addEventListener('click', () => {
    els.xmlInput.value = DEMO_XML;
  });

  container.querySelector('#parseBtn').addEventListener('click', () => {
    const xml = els.xmlInput.value.trim();
    if (!xml) {
      els.results.style.display = 'block';
      els.stats.innerHTML = '';
      els.tree.innerHTML = '<div class="sv-error">Please paste sitemap XML or upload a file.</div>';
      return;
    }
    try {
      const { entries, root } = parseSitemapXml(xml);
      els.stats.innerHTML = renderStatsHtml(entries);
      els.tree.innerHTML = renderTree(root, 0);
      els.results.style.display = 'block';

      els.tree.querySelectorAll('.sv-node-row').forEach(row => {
        row.addEventListener('click', () => {
          const children = row.nextElementSibling;
          if (!children || !children.classList.contains('sv-node')) return;
          const toggle = row.querySelector('.sv-toggle');
          if (toggle.classList.contains('leaf')) return;
          const isOpen = children.style.display !== 'none';
          children.style.display = isOpen ? 'none' : 'block';
          toggle.classList.toggle('open', !isOpen);
          toggle.classList.toggle('closed', isOpen);
        });
      });
    } catch (e) {
      els.results.style.display = 'block';
      els.stats.innerHTML = '';
      els.tree.innerHTML = `<div class="sv-error">${e.message}</div>`;
    }
  });

  container.querySelector('#clearBtn').addEventListener('click', () => {
    els.xmlInput.value = '';
    els.results.style.display = 'none';
    els.stats.innerHTML = '';
    els.tree.innerHTML = '';
  });
}

export function render(container) {
  container.innerHTML = `
    <div class="sv-container">
      <div class="sv-input-area">
        <div class="sv-tabs">
          <button class="sv-tab active" data-tab="paste">Paste XML</button>
          <button class="sv-tab" data-tab="upload">Upload File</button>
          <button class="sv-tab" data-tab="demo">Demo</button>
        </div>
        <div class="sv-tab-content" id="pasteTab">
          <textarea id="xmlInput" placeholder="Paste your sitemap.xml content here..."></textarea>
        </div>
        <div class="sv-tab-content" id="uploadTab" style="display:none">
          <div class="sv-dropzone" id="dropzone">
            <span>Drop sitemap.xml here or click to browse</span>
            <input type="file" id="fileInput" accept=".xml,.txt">
          </div>
        </div>
        <div class="sv-actions">
          <button id="parseBtn" class="sv-btn sv-btn-primary">Visualize</button>
          <button id="clearBtn" class="sv-btn sv-btn-ghost">Clear</button>
        </div>
      </div>
      <div class="sv-results" id="results" style="display:none">
        <div class="sv-stats" id="stats"></div>
        <div class="sv-tree" id="tree"></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = SV_CSS;
  container.appendChild(style);

  const els = {
    xmlInput: container.querySelector('#xmlInput'),
    results: container.querySelector('#results'),
    stats: container.querySelector('#stats'),
    tree: container.querySelector('#tree'),
  };

  bindSitemapEvents(container, els);
}
