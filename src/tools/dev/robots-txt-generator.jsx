export const toolConfig = {
  id: 'robots-txt-generator',
  name: 'Robots.txt Generator',
  category: 'dev',
  description: 'Generate robots.txt file with common crawl rules.',
  icon: '🤖',
  steps: ['Configure rules', 'Copy robots.txt']
};

export function render(container) {
  container.innerHTML = `
    <div class="robots-container">
      <div class="robots-inputs">
        <label>Sitemap URL (optional)</label>
        <input type="text" id="sitemap" placeholder="https://example.com/sitemap.xml">
        <label>User-agent</label>
        <select id="useragent">
          <option value="*">All Bots (*)</option>
          <option value="Googlebot">Googlebot</option>
          <option value="Bingbot">Bingbot</option>
        </select>
        <label>Disallow (one per line)</label>
        <textarea id="disallow" placeholder="/admin&#10;/private&#10;/tmp"></textarea>
        <label>Allow (one per line)</label>
        <textarea id="allow" placeholder="/public/&#10;/static/"></textarea>
      </div>
      <pre class="robots-output" id="robots-output"></pre>
      <button id="robots-copy">Copy to Clipboard</button>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .robots-container { max-width: 600px; margin: 0 auto; }
    .robots-inputs { margin-bottom: var(--space-4); }
    .robots-inputs label { display: block; font-weight: 500; margin-bottom: var(--space-1); }
    .robots-inputs input, .robots-inputs select { width: 100%; padding: var(--space-2); border: 1px solid #ddd; border-radius: var(--radius-md); margin-bottom: var(--space-3); }
    .robots-inputs textarea { width: 100%; height: 80px; padding: var(--space-2); border: 1px solid #ddd; border-radius: var(--radius-md); resize: vertical; }
    .robots-output { background: #1e1e1e; color: #d4d4d4; padding: var(--space-4); border-radius: var(--radius-lg); font-family: monospace; font-size: var(--text-sm); white-space: pre-wrap; }
    .robots-copy { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; margin-top: var(--space-3); }
  `;
  container.appendChild(style);

  function generate() {
    let txt = 'User-agent: ' + container.querySelector('#useragent').value + '\n';
    
    const disallowed = container.querySelector('#disallow').value.split('\n').filter(l => l.trim());
    disallowed.forEach(d => txt += 'Disallow: ' + d + '\n');
    
    const allowed = container.querySelector('#allow').value.split('\n').filter(l => l.trim());
    allowed.forEach(a => txt += 'Allow: ' + a + '\n');
    
    const sitemap = container.querySelector('#sitemap').value.trim();
    if (sitemap) txt += '\nSitemap: ' + sitemap;
    
    container.querySelector('#robots-output').textContent = txt;
  }

  container.querySelectorAll('input, textarea, select').forEach(el => {
    el.addEventListener('input', generate);
  });
  
  container.querySelector('#robots-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(container.querySelector('#robots-output').textContent);
  });

  generate();
  return container;
}
