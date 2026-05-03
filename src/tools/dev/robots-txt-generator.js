export function render(container) {
  container.innerHTML = `
    <div class="robots-container">
      <div class="form">
        <input type="text" id="siteUrl" placeholder="https://example.com">
        <label><input type="checkbox" id="allowAll"> Allow all (empty rule)</label>
        <label><input type="checkbox" id="sitemap"> Include sitemap</label>
        <label><input type="checkbox" id="admin"> Block /admin/</label>
        <label><input type="checkbox" id="private"> Block /private/</label>
        <label><input type="checkbox" id="temp"> Block /tmp/</label>
        <label><input type="checkbox" id="cgi"> Block /cgi-bin/</label>
      </div>
      <div class="output"><pre id="code"></pre><button id="copyBtn">Copy</button></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .robots-container { max-width: 600px; margin: 0 auto; }
    .robots-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .form { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); margin-bottom: var(--space-4); }
    .form input[type="text"] { width: 100%; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); margin-bottom: var(--space-3); }
    .form label { display: block; padding: var(--space-2) 0; cursor: pointer; font-size: var(--text-sm); }
    .form input[type="checkbox"] { margin-right: var(--space-2); }
    .output { display: flex; gap: var(--space-2); background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-xl); }
    .output pre { flex: 1; margin: 0; font-family: monospace; font-size: var(--text-xs); white-space: pre-wrap; }
    #copyBtn { padding: var(--space-2) var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; height: fit-content; }
  `;
  container.appendChild(style);

  function generate() {
    const url = (container.querySelector('#siteUrl').value || 'example.com').replace(/\/$/, '');
    let code = `User-agent: *\n`;
    if (container.querySelector('#allowAll').checked) {
      code += 'Allow: /\n';
    } else {
      if (container.querySelector('#admin').checked) code += 'Disallow: /admin/\n';
      if (container.querySelector('#private').checked) code += 'Disallow: /private/\n';
      if (container.querySelector('#temp').checked) code += 'Disallow: /tmp/\n';
      if (container.querySelector('#cgi').checked) code += 'Disallow: /cgi-bin/\n';
    }
    if (container.querySelector('#sitemap').checked) code += `\nSitemap: ${url}/sitemap.xml`;
    container.querySelector('#code').textContent = code;
  }

  container.querySelectorAll('input').forEach(i => i.addEventListener('input', generate));
  container.querySelector('#copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(container.querySelector('#code').textContent);
    container.querySelector('#copyBtn').textContent = 'Copied!';
    setTimeout(() => container.querySelector('#copyBtn').textContent = 'Copy', 1500);
  });
  generate();
}
