export function render(container) {
  container.innerHTML = `
    <div class="htaccess-container">
      <h2>.htaccess Generator</h2>
      <div class="options">
        <label><input type="checkbox" id="wwwRedirect"> WWW to non-WWW redirect</label>
        <label><input type="checkbox" id="httpsRedirect"> HTTP to HTTPS redirect</label>
        <label><input type="checkbox" id="wwwNonWww"> non-WWW to WWW redirect</label>
        <label><input type="checkbox" id="indexOptions"> Directory index options</label>
        <label><input type="checkbox" id="mimeTypes"> Custom MIME types</label>
        <label><input type="checkbox" id="securityHeaders"> Security headers</label>
        <label><input type="checkbox" id="gzip"> GZIP compression</label>
        <label><input type="checkbox" id="cors"> CORS headers</label>
      </div>
      <div class="output"><pre id="code"></pre><button id="copyBtn">Copy</button></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .htaccess-container { max-width: 700px; margin: 0 auto; }
    .htaccess-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .options { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); margin-bottom: var(--space-4); }
    .options label { display: block; padding: var(--space-2) 0; cursor: pointer; font-size: var(--text-sm); }
    .options input { margin-right: var(--space-2); }
    .output { display: flex; gap: var(--space-2); background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-xl); }
    .output pre { flex: 1; margin: 0; font-family: monospace; font-size: var(--text-xs); white-space: pre-wrap; max-height: 400px; overflow: auto; }
    #copyBtn { padding: var(--space-2) var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; height: fit-content; }
  `;
  container.appendChild(style);

  function generate() {
    let code = '# HTACCESS\n';
    if (container.querySelector('#wwwRedirect').checked) {
      code += '\n# WWW to non-WWW\nRewriteEngine On\nRewriteCond %{HTTP_HOST} ^www\\. [NC]\nRewriteRule ^(.*)$ http://%{HTTP_HOST}/$1 [R=301,L]\n';
    }
    if (container.querySelector('#httpsRedirect').checked) {
      code += '\n# HTTP to HTTPS\nRewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]\n';
    }
    if (container.querySelector('#wwwNonWww').checked) {
      code += '\n# non-WWW to WWW\nRewriteEngine On\nRewriteCond %{HTTP_HOST} !^www\\. [NC]\nRewriteRule ^(.*)$ http://www.%{HTTP_HOST}/$1 [R=301,L]\n';
    }
    if (container.querySelector('#indexOptions').checked) {
      code += '\n# Directory Options\nOptions -Indexes +FollowSymLinks\nDirectoryIndex index.html index.htm\n';
    }
    if (container.querySelector('#securityHeaders').checked) {
      code += '\n# Security Headers\nHeader always set X-Frame-Options "SAMEORIGIN"\nHeader always set X-Content-Type-Options "nosniff"\nHeader always set X-XSS-Protection "1; mode=block"\n';
    }
    if (container.querySelector('#gzip').checked) {
      code += '\n# GZIP Compression\n<IfModule mod_deflate.c>\nAddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript\n</IfModule>\n';
    }
    if (container.querySelector('#cors').checked) {
      code += '\n# CORS\nHeader set Access-Control-Allow-Origin "*"\nHeader set Access-Control-Allow-Methods "GET, POST, OPTIONS"\n';
    }
    container.querySelector('#code').textContent = code || '# Select options above';
  }

  container.querySelectorAll('input').forEach(i => i.addEventListener('change', generate));
  container.querySelector('#copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(container.querySelector('#code').textContent);
    container.querySelector('#copyBtn').textContent = 'Copied!';
    setTimeout(() => container.querySelector('#copyBtn').textContent = 'Copy', 1500);
  });
  generate();
}
