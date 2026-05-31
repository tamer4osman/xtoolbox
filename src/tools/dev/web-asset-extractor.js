export const toolConfig = {
  id: 'web-asset-extractor',
  name: 'Website Asset Extractor',
  category: 'dev',
  description: 'Extract SVG nodes, image links, stylesheets, and custom web fonts from pasted raw HTML code.',
  icon: '📦',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="wae-container">
      <div class="wae-input-section">
        <textarea id="wae-input" placeholder="Paste raw HTML source code here...&#10;&#10;Example: paste the HTML from View Source (Ctrl+U) of any website."></textarea>
        <div class="wae-actions">
          <button id="wae-extract" class="wae-btn wae-btn-primary">Extract Assets</button>
          <button id="wae-load-demo" class="wae-btn wae-btn-ghost">Load Demo</button>
          <button id="wae-clear" class="wae-btn wae-btn-ghost">Clear</button>
        </div>
      </div>
      <div class="wae-results" id="wae-results" style="display:none">
        <div class="wae-stats" id="wae-stats"></div>
        <div class="wae-tabs">
          <button class="wae-tab active" data-tab="svg">SVGs</button>
          <button class="wae-tab" data-tab="images">Images</button>
          <button class="wae-tab" data-tab="styles">Styles</button>
          <button class="wae-tab" data-tab="fonts">Fonts</button>
          <button class="wae-tab" data-tab="scripts">Scripts</button>
        </div>
        <div class="wae-tab-content" id="wae-tab-content"></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .wae-container { max-width: 900px; margin: 0 auto; }
    .wae-input-section textarea { width: 100%; height: 200px; padding: var(--space-3); border: 2px solid var(--color-border); border-radius: var(--radius-xl); font-family: monospace; font-size: var(--text-sm); resize: vertical; background: var(--color-surface); margin-bottom: var(--space-3); }
    .wae-input-section textarea:focus { outline: none; border-color: var(--color-primary); }
    .wae-actions { display: flex; gap: var(--space-3); }
    .wae-btn { padding: var(--space-2) var(--space-4); border-radius: var(--radius-md); border: none; cursor: pointer; font-size: var(--text-sm); font-weight: 500; }
    .wae-btn-primary { background: var(--color-primary); color: #fff; }
    .wae-btn-primary:hover { background: var(--color-primary-hover); }
    .wae-btn-ghost { background: transparent; color: var(--color-text-secondary); }
    .wae-results { margin-top: var(--space-4); }
    .wae-stats { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-3); }
    .wae-stat { padding: var(--space-1) var(--space-3); background: var(--color-surface); border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: 500; }
    .wae-stat .num { color: var(--color-primary); font-weight: 700; }
    .wae-tabs { display: flex; gap: var(--space-2); margin-bottom: var(--space-3); border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-2); }
    .wae-tab { padding: var(--space-2) var(--space-3); border: none; background: none; cursor: pointer; font-size: var(--text-sm); border-radius: var(--radius-md) var(--radius-md) 0 0; }
    .wae-tab.active { background: var(--color-primary); color: #fff; }
    .wae-tab:hover:not(.active) { background: var(--color-surface); }
    .wae-list { display: flex; flex-direction: column; gap: var(--space-2); }
    .wae-item { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-3); }
    .wae-item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2); }
    .wae-item-label { font-weight: 600; font-size: var(--text-sm); }
    .wae-item-actions { display: flex; gap: var(--space-2); }
    .wae-item-actions button { padding: 2px 8px; font-size: var(--text-xs); border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-bg); cursor: pointer; }
    .wae-item-actions button:hover { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
    .wae-item pre { background: #1e1e2e; color: #cdd6f4; padding: var(--space-3); border-radius: var(--radius-md); font-family: monospace; font-size: var(--text-xs); overflow-x: auto; white-space: pre-wrap; word-break: break-all; max-height: 200px; overflow-y: auto; margin: 0; }
    .wae-item img { max-width: 100%; max-height: 150px; border-radius: var(--radius-md); border: 1px solid var(--color-border); }
    .wae-empty { text-align: center; padding: var(--space-6); color: var(--color-text-secondary); }
  `;
  container.appendChild(style);

  const demo = `<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
  <style>
    body { font-family: 'Inter', sans-serif; }
    .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
  </style>
</head>
<body>
  <div class="hero">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#fff"/></svg>
    <svg width="200" height="100"><rect x="10" y="10" width="80" height="80" fill="coral" rx="10"/></svg>
    <img src="https://via.placeholder.com/300x200" alt="placeholder">
    <img src="https://via.placeholder.com/150x150" alt="avatar">
  </div>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script>
    console.log('Hello');
  </script>
</body>
</html>`;

  container.querySelector('#wae-load-demo').addEventListener('click', () => {
    container.querySelector('#wae-input').value = demo;
  });

  let currentData = { svg: [], images: [], styles: [], fonts: [], scripts: [] };
  let activeTab = 'svg';

  container.querySelectorAll('.wae-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.wae-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      renderTab();
    });
  });

  function renderTab() {
    const content = container.querySelector('#wae-tab-content');
    const items = currentData[activeTab];
    if (!items || items.length === 0) {
      content.innerHTML = '<div class="wae-empty">No ' + activeTab + ' found</div>';
      return;
    }
    const list = document.createElement('div');
    list.className = 'wae-list';
    items.forEach((item, i) => {
      const div = document.createElement('div');
      div.className = 'wae-item';

      const header = document.createElement('div');
      header.className = 'wae-item-header';

      const label = document.createElement('span');
      label.className = 'wae-item-label';
      label.textContent = item.label || (activeTab + ' #' + (i + 1));
      header.appendChild(label);

      const actions = document.createElement('div');
      actions.className = 'wae-item-actions';

      const copyBtn = document.createElement('button');
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(item.content).then(() => {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => copyBtn.textContent = 'Copy', 1500);
        }).catch(() => {
          copyBtn.textContent = 'Failed';
          setTimeout(() => copyBtn.textContent = 'Copy', 1500);
        });
      });
      actions.appendChild(copyBtn);

      if (item.download) {
        const dlBtn = document.createElement('button');
        dlBtn.textContent = 'Download';
        dlBtn.addEventListener('click', () => {
          const blob = new Blob([item.content], { type: item.type || 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = item.filename || 'asset-' + (i + 1) + '.txt';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
        actions.appendChild(dlBtn);
      }

      header.appendChild(actions);
      div.appendChild(header);

      if (activeTab === 'images' && item.url) {
        const img = document.createElement('img');
        img.src = item.url;
        img.alt = item.label;
        img.onerror = () => { img.style.display = 'none'; };
        div.appendChild(img);
      }

      const pre = document.createElement('pre');
      pre.textContent = item.content;
      div.appendChild(pre);

      list.appendChild(div);
    });
    content.textContent = '';
    content.appendChild(list);
  }

  container.querySelector('#wae-extract').addEventListener('click', () => {
    const html = container.querySelector('#wae-input').value.trim();
    if (!html) return;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // SVGs
      const svgs = [];
      doc.querySelectorAll('svg').forEach((svg, i) => {
        const content = svg.outerHTML;
        const labels = [];
        if (svg.querySelector('circle')) labels.push('circle');
        if (svg.querySelector('rect')) labels.push('rect');
        if (svg.querySelector('path')) labels.push('path');
        if (svg.querySelector('polygon')) labels.push('polygon');
        const viewBox = svg.getAttribute('viewBox');
        const size = svg.getAttribute('width') && svg.getAttribute('height')
          ? `${svg.getAttribute('width')}x${svg.getAttribute('height')}`
          : (viewBox || 'unknown');
        svgs.push({
          label: `SVG #${i + 1} (${size})${labels.length ? ' — ' + labels.join(', ') : ''}`,
          content,
          download: true,
          filename: `svg-${i + 1}.svg`,
          type: 'image/svg+xml'
        });
      });

      // Images
      const images = [];
      doc.querySelectorAll('img').forEach((img, i) => {
        const src = img.getAttribute('src') || '';
        const alt = img.getAttribute('alt') || '';
        images.push({
          label: `Image #${i + 1}: ${alt || src.slice(0, 50)}`,
          content: src,
          url: src,
          download: false
        });
      });

      // Styles
      const styles = [];
      doc.querySelectorAll('link[rel="stylesheet"]').forEach((link, i) => {
        styles.push({
          label: `External CSS #${i + 1}: ${link.getAttribute('href') || 'unknown'}`,
          content: `<link rel="stylesheet" href="${link.getAttribute('href')}">`,
          download: true,
          filename: `style-${i + 1}.html`,
          type: 'text/html'
        });
      });
      doc.querySelectorAll('style').forEach((style, i) => {
        styles.push({
          label: `Inline Style #${i + 1}`,
          content: style.textContent,
          download: true,
          filename: `inline-style-${i + 1}.css`,
          type: 'text/css'
        });
      });

      // Fonts
      const fonts = [];
      const fontUrls = new Set();
      doc.querySelectorAll('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]').forEach((link, i) => {
        const href = link.getAttribute('href');
        if (!fontUrls.has(href)) {
          fontUrls.add(href);
          fonts.push({
            label: `Google Font #${fonts.length + 1}`,
            content: `<link href="${href}" rel="stylesheet">`,
            download: true,
            filename: `font-${fonts.length + 1}.html`,
            type: 'text/html'
          });
        }
      });
      const inlineFontMatches = html.match(/font-family\s*:\s*['"]?([^;'"}\s]+)['"]?/gi);
      if (inlineFontMatches) {
        const seen = new Set();
        inlineFontMatches.forEach(m => {
          const name = m.replace(/font-family\s*:\s*['"]?/i, '').replace(/['"]?\s*$/, '').trim();
          if (name && !seen.has(name.toLowerCase()) && !['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'inherit', 'initial'].includes(name.toLowerCase())) {
            seen.add(name.toLowerCase());
            fonts.push({
              label: `Font Family: ${name}`,
              content: `font-family: '${name}', sans-serif;`,
              download: false
            });
          }
        });
      }

      // Scripts
      const scripts = [];
      doc.querySelectorAll('script[src]').forEach((script, i) => {
        scripts.push({
          label: `External Script #${i + 1}: ${script.getAttribute('src')?.slice(0, 60) || 'unknown'}`,
          content: `<script src="${script.getAttribute('src')}"><\/script>`,
          download: true,
          filename: `script-${i + 1}.html`,
          type: 'text/html'
        });
      });
      doc.querySelectorAll('script:not([src])').forEach((script, i) => {
        if (script.textContent.trim()) {
          scripts.push({
            label: `Inline Script #${i + 1}`,
            content: script.textContent,
            download: true,
            filename: `inline-script-${i + 1}.js`,
            type: 'application/javascript'
          });
        }
      });

      currentData = { svg: svgs, images, styles, fonts, scripts };

      const total = svgs.length + images.length + styles.length + fonts.length + scripts.length;
      const stats = container.querySelector('#wae-stats');
      stats.innerHTML = '';
      [
        { label: 'SVGs', count: svgs.length },
        { label: 'Images', count: images.length },
        { label: 'Styles', count: styles.length },
        { label: 'Fonts', count: fonts.length },
        { label: 'Scripts', count: scripts.length }
      ].forEach(s => {
        const badge = document.createElement('span');
        badge.className = 'wae-stat';
        badge.innerHTML = `<span class="num">${s.count}</span> ${s.label}`;
        stats.appendChild(badge);
      });

      container.querySelector('#wae-results').style.display = 'block';
      renderTab();
    } catch (e) {
      const results = container.querySelector('#wae-results');
      results.style.display = 'block';
      container.querySelector('#wae-stats').innerHTML = '';
      container.querySelector('#wae-tab-content').innerHTML = '<div class="wae-empty">Error: ' + e.message + '</div>';
    }
  });

  container.querySelector('#wae-clear').addEventListener('click', () => {
    container.querySelector('#wae-input').value = '';
    container.querySelector('#wae-results').style.display = 'none';
  });
}
