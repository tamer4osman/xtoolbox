export const toolConfig = {
  id: 'htaccess-generator',
  name: '.htaccess Generator',
  category: 'dev',
  description: 'Generate Apache .htaccess rules for common configurations.',
  icon: '⚙️',
  steps: ['Select rules', 'Copy .htaccess code']
};

export function render(container) {
  container.innerHTML = `
    <div class="htaccess-container">
      <div class="htaccess-options">
        <label><input type="checkbox" id="opt-www"> Force www</label>
        <label><input type="checkbox" id="opt-https"> Force HTTPS</label>
        <label><input type="checkbox" id="opt-rewrite"> Enable Rewrite</label>
        <label><input type="checkbox" id="opt-index"> Directory Index</label>
        <label><input type="checkbox" id="opt-compress"> GZIP Compression</label>
        <label><input type="checkbox" id="opt-cache"> Browser Caching</label>
        <label><input type="checkbox" id="opt-blocks"> Block IPs</label>
        <label><input type="checkbox" id="opt-hotlink"> Prevent Hotlinking</label>
      </div>
      <pre class="htaccess-code" id="htaccess-output"></pre>
      <button id="htaccess-copy">Copy to Clipboard</button>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .htaccess-container { max-width: 600px; margin: 0 auto; }
    .htaccess-options { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); margin-bottom: var(--space-4); }
    .htaccess-options label { display: flex; align-items: center; gap: 8px; padding: var(--space-2); background: #f5f5f5; border-radius: var(--radius-md); cursor: pointer; font-size: var(--text-sm); }
    .htaccess-code { background: #1e1e1e; color: #d4d4d4; padding: var(--space-4); border-radius: var(--radius-lg); font-family: monospace; font-size: var(--text-sm); overflow: auto; max-height: 400px; white-space: pre; }
    .htaccess-copy { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; margin-top: var(--space-3); }
  `;
  container.appendChild(style);

  function generate() {
    let code = '# Apache .htaccess\n\n';
    
    if (container.querySelector('#opt-rewrite').checked) {
      code += 'RewriteEngine On\n\n';
    }
    
    if (container.querySelector('#opt-www').checked) {
      code += 'RewriteCond %{HTTP_HOST} !^www\\. [NC]\nRewriteRule ^(.*)$ http://www.%{HTTP_HOST}/$1 [R=301,L]\n\n';
    }
    
    if (container.querySelector('#opt-https').checked) {
      code += 'RewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]\n\n';
    }
    
    if (container.querySelector('#opt-index').checked) {
      code += 'DirectoryIndex index.html index.php\n\n';
    }
    
    if (container.querySelector('#opt-compress').checked) {
      code += '# GZIP Compression\n<IfModule mod_deflate.c>\nAddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript\n</IfModule>\n\n';
    }
    
    if (container.querySelector('#opt-cache').checked) {
      code += '# Browser Caching\n<IfModule mod_expires.c>\nExpiresActive On\nExpiresByType image/jpg "access plus 1 year"\nExpiresByType image/jpeg "access plus 1 year"\nExpiresByType image/gif "access plus 1 year"\nExpiresByType image/png "access plus 1 year"\nExpiresByType text/css "access plus 1 month"\nExpiresByType application/pdf "access plus 1 month"\nExpiresByType text/html "access plus 0 seconds"\n</IfModule>\n\n';
    }
    
    if (container.querySelector('#opt-blocks').checked) {
      code += '# Block IP\n<Limit GET POST>\norder deny,allow\ndeny from 192.168.1.1\nallow from all\n</Limit>\n\n';
    }
    
    if (container.querySelector('#opt-hotlink').checked) {
      code += '# Prevent Hotlinking\nRewriteCond %{HTTP_REFERER} !^$\nRewriteCond %{HTTP_REFERER} !^http://(www\\.)?yourdomain\\.com [NC]\nRewriteRule \\.(jpg|jpeg|png|gif)$ - [F]\n';
    }
    
    container.querySelector('#htaccess-output').textContent = code || '# Select options above';
  }

  container.querySelectorAll('input').forEach(cb => cb.addEventListener('change', generate));
  
  container.querySelector('#htaccess-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(container.querySelector('#htaccess-output').textContent);
  });

  generate();
  return container;
}
