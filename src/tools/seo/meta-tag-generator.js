export const toolConfig = {
  id: 'meta-tag-generator',
  name: 'Meta Tag Generator',
  category: 'seo',
  description: 'Generate SEO meta tags for your website.',
  icon: '🏷️',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="meta-container">
      <h2>Meta Tag Generator</h2>
      <div class="form">
        <input type="text" id="title" placeholder="Page Title" value="My Page Title">
        <textarea id="desc" placeholder="Meta description...">Welcome to my website</textarea>
        <input type="text" id="keywords" placeholder="Keywords (comma separated)">
        <input type="text" id="canonical" placeholder="Canonical URL">
        <input type="text" id="ogTitle" placeholder="OG Title">
        <textarea id="ogDesc" placeholder="OG Description"></textarea>
        <input type="text" id="ogImage" placeholder="OG Image URL">
        <div class="toggles">
          <label><input type="checkbox" id="noindex"> Noindex</label>
          <label><input type="checkbox" id="nofollow"> Nofollow</label>
          <label><input type="checkbox" id="noarchive"> Noarchive</label>
          <label><input type="checkbox" id="nosnippet"> Nosnippet</label>
        </div>
      </div>
      <button id="generateBtn" class="generate-btn">Generate Tags</button>
      <div class="output"><pre id="result"></pre><button id="copyBtn">Copy</button></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .meta-container { max-width: 700px; margin: 0 auto; }
    .meta-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .form { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); margin-bottom: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3); }
    .form input, .form textarea { padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .form textarea { min-height: 80px; resize: vertical; }
    .toggles { display: flex; gap: var(--space-4); flex-wrap: wrap; }
    .toggles label { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; font-size: var(--text-sm); }
    .generate-btn { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; margin-bottom: var(--space-4); }
    .output { display: flex; gap: var(--space-2); background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-xl); }
    .output pre { flex: 1; margin: 0; font-family: monospace; font-size: var(--text-xs); white-space: pre-wrap; }
    #copyBtn { padding: var(--space-2); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; }
  `;
  container.appendChild(style);

  function generate() {
    const title = container.querySelector('#title').value;
    const desc = container.querySelector('#desc').value;
    const keywords = container.querySelector('#keywords').value;
    const canonical = container.querySelector('#canonical').value;
    const ogTitle = container.querySelector('#ogTitle').value || title;
    const ogDesc = container.querySelector('#ogDesc').value || desc;
    const ogImage = container.querySelector('#ogImage').value;
const noindex = container.querySelector('#noindex').checked ? '<meta name="robots" content="noindex">\n' : '';
    const nofollow = container.querySelector('#nofollow').checked ? '<meta name="robots" content="nofollow">\n' : '';
    const noarchive = container.querySelector('#noarchive').checked ? '<meta name="robots" content="noarchive">\n' : '';
    const nosnippet = container.querySelector('#nosnippet').checked ? '<meta name="robots" content="nosnippet">\n' : '';
    
    let tags = '<title>' + title + '</title>\n';
    if (desc) tags += '<meta name="description" content="' + desc + '">\n';
    if (keywords) tags += '<meta name="keywords" content="' + keywords + '">\n';
    if (canonical) tags += '<link rel="canonical" href="' + canonical + '">\n';
    tags += '\n<!-- Open Graph -->\n';
    tags += '<meta property="og:title" content="' + ogTitle + '">\n';
    tags += '<meta property="og:description" content="' + ogDesc + '">\n';
    if (ogImage) tags += '<meta property="og:image" content="' + ogImage + '">\n';
    tags += '\n<!-- Robots -->\n' + noindex + nofollow + noarchive + nosnippet;
    container.querySelector('#result').textContent = tags;
  }

  container.querySelector('#generateBtn').addEventListener('click', generate);
  container.querySelectorAll('input, textarea').forEach(i => i.addEventListener('input', generate));
  container.querySelector('#copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(container.querySelector('#result').textContent);
    container.querySelector('#copyBtn').textContent = 'Copied!';
    setTimeout(() => container.querySelector('#copyBtn').textContent = 'Copy', 1500);
  });
  generate();
}
