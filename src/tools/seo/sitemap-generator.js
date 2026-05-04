export const toolConfig = {
  id: 'sitemap-generator',
  name: 'Sitemap Generator',
  category: 'seo',
  description: 'Generate XML sitemaps for search engines.',
  icon: '🗺️',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="sitemap-container">
      <h2>Sitemap Generator</h2>
      <input type="text" id="baseUrl" placeholder="https://example.com" value="https://example.com">
      <textarea id="pages" placeholder="Page paths (one per line)">/about
/contact
/blog
/products
/services</textarea>
      <div class="options">
        <label>Change Frequency
          <select id="freq"><option value="daily">daily</option><option value="weekly">weekly</option><option value="monthly">monthly</option></select>
        </label>
        <label>Priority
          <select id="priority"><option value="1.0">1.0</option><option value="0.8">0.8</option><option value="0.6">0.6</option></select>
        </label>
      </div>
      <button id="generateBtn" class="generate-btn">Generate XML</button>
      <div class="output"><pre id="result"></pre><button id="copyBtn">Copy</button></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .sitemap-container { max-width: 700px; margin: 0 auto; }
    .sitemap-container h2 { text-align: center; margin-bottom: var(--space-4); }
    #baseUrl { width: 100%; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-lg); margin-bottom: var(--space-3); }
    #pages { width: 100%; height: 120px; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-xl); background: var(--color-surface); resize: vertical; margin-bottom: var(--space-3); font-family: monospace; font-size: var(--text-sm); }
    .options { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-3); }
    .options label { font-size: var(--text-sm); }
    .options select { width: 100%; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .generate-btn { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; margin-bottom: var(--space-4); }
    .output { display: flex; gap: var(--space-2); background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-xl); }
    .output pre { flex: 1; margin: 0; font-family: monospace; font-size: var(--text-xs); white-space: pre-wrap; max-height: 300px; overflow: auto; }
    #copyBtn { padding: var(--space-2); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; }
  `;
  container.appendChild(style);

  const now = new Date().toISOString().split('T')[0];

  container.querySelector('#generateBtn').addEventListener('click', () => {
    const base = (container.querySelector('#baseUrl').value || 'https://example.com').replace(/\/$/, '');
    const pages = container.querySelector('#pages').value.split('\n').filter(p => p.trim());
    const freq = container.querySelector('#freq').value;
    const pri = container.querySelector('#priority').value;
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    pages.forEach(p => {
      xml += '  <url>\n    <loc>' + base + p + '</loc>\n    <lastmod>' + now + '</lastmod>\n    <changefreq>' + freq + '</changefreq>\n    <priority>' + pri + '</priority>\n  </url>\n';
    });
    xml += '</urlset>';
    container.querySelector('#result').textContent = xml;
  });
  container.querySelector('#copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(container.querySelector('#result').textContent);
    container.querySelector('#copyBtn').textContent = 'Copied!';
    setTimeout(() => container.querySelector('#copyBtn').textContent = 'Copy', 1500);
  });
  container.querySelector('#generateBtn').click();
}
