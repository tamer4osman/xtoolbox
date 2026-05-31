export const toolConfig = {
  id: 'security-headers-generator',
  name: 'Security Headers Generator',
  category: 'dev',
  description: 'Configure Content Security Policy (CSP), HSTS, and generate config rules for Nginx, Apache, or Cloudflare.',
  icon: '🛡️',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="shg-container">
      <div class="shg-controls">
        <div class="shg-section">
          <h3>Content Security Policy (CSP)</h3>
          <label class="shg-toggle"><input type="checkbox" id="shg-csp" checked> Enable CSP</label>
          <div class="shg-sub" id="shg-csp-opts">
            <label class="shg-toggle sub"><input type="checkbox" id="shg-csp-inline" checked> block inline scripts</label>
            <label class="shg-toggle sub"><input type="checkbox" id="shg-csp-eval" checked> block eval()</label>
            <label class="shg-toggle sub"><input type="checkbox" id="shg-csp-self" checked> allow self</label>
            <label class="shg-toggle sub"><input type="checkbox" id="shg-csp-https"> require HTTPS</label>
            <label class="shg-toggle sub"><input type="checkbox" id="shg-csp-google"> allow Google Analytics</label>
            <label class="shg-toggle sub"><input type="checkbox" id="shg-csp-cloudflare"> allow Cloudflare</label>
          </div>
        </div>
        <div class="shg-section">
          <h3>HTTP Strict Transport Security (HSTS)</h3>
          <label class="shg-toggle"><input type="checkbox" id="shg-hsts" checked> Enable HSTS</label>
          <div class="shg-sub" id="shg-hsts-opts">
            <div class="shg-row"><label>Max Age</label><select id="shg-hsts-age"><option value="31536000" selected>1 year</option><option value="63072000">2 years</option><option value="157680000">5 years</option></select></div>
            <label class="shg-toggle sub"><input type="checkbox" id="shg-hsts-sub" checked> include subdomains</label>
            <label class="shg-toggle sub"><input type="checkbox" id="shg-hsts-preload"> add to preload list</label>
          </div>
        </div>
        <div class="shg-section">
          <h3>Other Headers</h3>
          <label class="shg-toggle"><input type="checkbox" id="shg-xfo" checked> X-Frame-Options: DENY</label>
          <label class="shg-toggle"><input type="checkbox" id="shg-xcto" checked> X-Content-Type-Options: nosniff</label>
          <label class="shg-toggle"><input type="checkbox" id="shg-referrer" checked> Referrer-Policy: strict-origin-when-cross-origin</label>
          <label class="shg-toggle"><input type="checkbox" id="shg-permissions" checked> Permissions-Policy (restrictive)</label>
          <label class="shg-toggle"><input type="checkbox" id="shg-xxss"> X-XSS-Protection: 0 (deprecated)</label>
        </div>
        <div class="shg-section">
          <h3>Output Format</h3>
          <div class="shg-format-btns">
            <button class="shg-fmt active" data-fmt="nginx">Nginx</button>
            <button class="shg-fmt" data-fmt="apache">Apache</button>
            <button class="shg-fmt" data-fmt="cloudflare">Cloudflare</button>
            <button class="shg-fmt" data-fmt="raw">Raw Headers</button>
          </div>
        </div>
      </div>
      <div class="shg-output-section">
        <div class="shg-output-header">
          <span id="shg-fmt-label">Nginx Configuration</span>
          <button id="shg-copy" class="shg-btn shg-btn-primary">Copy</button>
        </div>
        <pre class="shg-output" id="shg-output"></pre>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .shg-container { max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    @media (max-width: 768px) { .shg-container { grid-template-columns: 1fr; } }
    .shg-controls { display: flex; flex-direction: column; gap: var(--space-3); }
    .shg-section { background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-xl); }
    .shg-section h3 { font-size: var(--text-sm); margin-bottom: var(--space-2); }
    .shg-toggle { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); cursor: pointer; padding: 2px 0; }
    .shg-toggle.sub { font-size: var(--text-xs); color: var(--color-text-secondary); padding-left: var(--space-4); }
    .shg-toggle input { margin: 0; }
    .shg-sub { margin-top: var(--space-2); }
    .shg-row { display: flex; align-items: center; gap: var(--space-2); margin-top: var(--space-2); font-size: var(--text-xs); }
    .shg-row label { width: 60px; }
    .shg-row select { flex: 1; padding: 2px 4px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: var(--text-xs); }
    .shg-format-btns { display: flex; gap: var(--space-2); }
    .shg-fmt { padding: var(--space-1) var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg); cursor: pointer; font-size: var(--text-xs); }
    .shg-fmt.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
    .shg-output-section { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-4); }
    .shg-output-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3); font-weight: 600; font-size: var(--text-sm); }
    .shg-btn { padding: var(--space-1) var(--space-3); border-radius: var(--radius-md); border: none; cursor: pointer; font-size: var(--text-xs); }
    .shg-btn-primary { background: var(--color-primary); color: #fff; }
    .shg-output { background: #1e1e2e; color: #cdd6f4; padding: var(--space-4); border-radius: var(--radius-lg); font-family: monospace; font-size: var(--text-xs); line-height: 1.6; overflow-x: auto; white-space: pre-wrap; word-break: break-all; max-height: 500px; overflow-y: auto; margin: 0; }
  `;
  container.appendChild(style);

  let fmt = 'nginx';
  const fmtLabels = { nginx: 'Nginx Configuration', apache: 'Apache .htaccess', cloudflare: 'Cloudflare _headers', raw: 'Raw HTTP Headers' };

  container.querySelectorAll('.shg-fmt').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.shg-fmt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      fmt = btn.dataset.fmt;
      container.querySelector('#shg-fmt-label').textContent = fmtLabels[fmt];
      generate();
    });
  });

  function getVals() {
    return {
      csp: container.querySelector('#shg-csp').checked,
      cspInline: container.querySelector('#shg-csp-inline').checked,
      cspEval: container.querySelector('#shg-csp-eval').checked,
      cspSelf: container.querySelector('#shg-csp-self').checked,
      cspHttps: container.querySelector('#shg-csp-https').checked,
      cspGa: container.querySelector('#shg-csp-google').checked,
      cspCf: container.querySelector('#shg-csp-cloudflare').checked,
      hsts: container.querySelector('#shg-hsts').checked,
      hstsAge: container.querySelector('#shg-hsts-age').value,
      hstsSub: container.querySelector('#shg-hsts-sub').checked,
      hstsPreload: container.querySelector('#shg-hsts-preload').checked,
      xfo: container.querySelector('#shg-xfo').checked,
      xcto: container.querySelector('#shg-xcto').checked,
      referrer: container.querySelector('#shg-referrer').checked,
      permissions: container.querySelector('#shg-permissions').checked,
      xxss: container.querySelector('#shg-xxss').checked,
    };
  }

  function buildCsp(v) {
    const parts = [];
    if (v.cspSelf) parts.push("'self'");
    if (v.cspHttps) parts.push('https:');
    if (v.cspGa) parts.push('https://www.google-analytics.com https://www.googletagmanager.com');
    if (v.cspCf) parts.push('https://challenges.cloudflare.com');
    const scriptSrc = ["'unsafe-inline'"];
    if (!v.cspInline) scriptSrc.shift();
    if (v.cspEval) scriptSrc.push("'unsafe-eval'");
    const directives = [
      "default-src 'self'",
      "script-src " + (parts.length ? parts.join(' ') + ' ' : '') + scriptSrc.join(' '),
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self'",
      "frame-ancestors 'none'"
    ];
    return directives.join('; ');
  }

  function buildHeaders(v) {
    const headers = [];
    if (v.csp) headers.push({ name: 'Content-Security-Policy', value: buildCsp(v) });
    if (v.hsts) {
      let val = 'max-age=' + v.hstsAge;
      if (v.hstsSub) val += '; includeSubDomains';
      if (v.hstsPreload) val += '; preload';
      headers.push({ name: 'Strict-Transport-Security', value: val });
    }
    if (v.xfo) headers.push({ name: 'X-Frame-Options', value: 'DENY' });
    if (v.xcto) headers.push({ name: 'X-Content-Type-Options', value: 'nosniff' });
    if (v.referrer) headers.push({ name: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' });
    if (v.permissions) headers.push({ name: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' });
    if (v.xxss) headers.push({ name: 'X-XSS-Protection', value: '0' });
    return headers;
  }

  function generate() {
    const v = getVals();
    const headers = buildHeaders(v);
    let output = '';

    if (fmt === 'nginx') {
      output = '# Nginx security headers\n# Add to your server {} or location {} block\n\n';
      headers.forEach(h => {
        output += 'add_header ' + h.name + ' "' + h.value + '" always;\n';
      });
    } else if (fmt === 'apache') {
      output = '# Apache .htaccess security headers\n# Add to your .htaccess or Apache config\n\n';
      headers.forEach(h => {
        output += 'Header always set ' + h.name + ' "' + h.value + '"\n';
      });
    } else if (fmt === 'cloudflare') {
      output = '# Cloudflare Pages _headers file\n# Place at the root of your public directory\n\n/*\n';
      headers.forEach(h => {
        output += '  ' + h.name + ': ' + h.value + '\n';
      });
    } else {
      output = '# Raw HTTP response headers\n\n';
      headers.forEach(h => {
        output += h.name + ': ' + h.value + '\n';
      });
    }

    container.querySelector('#shg-output').textContent = output || '# No headers selected';
  }

  container.querySelectorAll('input[type="checkbox"], select').forEach(el => {
    el.addEventListener('change', generate);
  });

  container.querySelector('#shg-copy').addEventListener('click', () => {
    const text = container.querySelector('#shg-output').textContent;
    navigator.clipboard.writeText(text).then(() => {
      container.querySelector('#shg-copy').textContent = 'Copied!';
      setTimeout(() => container.querySelector('#shg-copy').textContent = 'Copy', 1500);
    }).catch(() => {
      container.querySelector('#shg-copy').textContent = 'Failed';
      setTimeout(() => container.querySelector('#shg-copy').textContent = 'Copy', 1500);
    });
  });

  generate();
}
