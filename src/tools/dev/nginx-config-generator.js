import { showToast } from '../../components/toast.js';
import { copyToClipboard } from '../../utils/clipboard.js';
import { downloadBlob } from '../../utils/file.js';
import { NGX_CSS, escapeHtml, fieldHtml, selectHtml, checkHtml } from './nginx-constants.js';

export const toolConfig = {
  id: 'nginx-config-generator',
  name: 'NGINX Config Generator',
  category: 'dev',
  description: 'Generate nginx.conf server blocks visually: HTTPS, reverse proxy, PHP-FPM, load balancing, rate limiting, security headers, and more. Includes ready-made presets for static sites, WordPress, Node.js, and load balancers.',
  icon: '🌐',
  accept: null,
  maxSizeMB: null,
  keywords: ['nginx', 'nginx.conf', 'reverse proxy', 'ssl', 'tls', 'https', 'php-fpm', 'fastcgi', 'load balancer', 'upstream', 'rate limit', 'server block', 'lets encrypt'],
  steps: [
    'Pick a preset (Static site, WordPress, Node.js, Load balancer) or start from Custom',
    'Fill in the server settings (server name, root, listen port)',
    'Toggle HTTPS, reverse proxy, PHP, gzip, security headers, rate limiting as needed',
    'Copy the generated nginx.conf to your clipboard or download it as a file'
  ],
  faqs: [
    { question: 'Where do I put the generated config?', answer: 'On most Linux installs the main config is /etc/nginx/nginx.conf and per-site configs go in /etc/nginx/sites-available/ as files symlinked into sites-enabled/.' },
    { question: 'How do I test the config before reloading?', answer: 'Run sudo nginx -t to validate the syntax. If it says "test is successful", reload with sudo nginx -s reload or sudo systemctl reload nginx.' },
    { question: 'Do I need to escape anything in custom locations?', answer: 'The generator outputs raw nginx directives. Make sure the path you type does not contain spaces; if it does, wrap the whole value in double quotes in the field.' },
    { question: 'What does the upstream block do?', answer: 'An upstream block defines a pool of backend servers. With more than one backend, nginx round-robins requests between them, providing simple load balancing with no extra software.' },
    { question: 'Does this work with Lets Encrypt?', answer: 'Yes. Enable HTTPS and put the Lets Encrypt fullchain.pem and privkey.pem paths into the SSL certificate and key fields. Run certbot to obtain the files first.' }
  ]
};

export const PRESETS = {
  'static-site': {
    label: 'Static site',
    description: 'Serve files from a directory with gzip + static asset caching.',
    values: {
      serverName: 'example.com',
      root: '/var/www/html',
      index: 'index.html index.htm',
      enableHttps: true,
      sslCertificate: '/etc/letsencrypt/live/example.com/fullchain.pem',
      sslCertificateKey: '/etc/letsencrypt/live/example.com/privkey.pem',
      enableWwwRedirect: 'to-www',
      enableHttpRedirect: true,
      enableGzip: true,
      enableStaticCache: true,
      cacheExpires: '30d',
      enableSecurityHeaders: true
    }
  },
  wordpress: {
    label: 'WordPress (PHP-FPM)',
    description: 'PHP-FPM backend with rewrites for pretty permalinks and static asset caching.',
    values: {
      serverName: 'example.com',
      root: '/var/www/wordpress',
      index: 'index.php index.html',
      enableHttps: true,
      sslCertificate: '/etc/letsencrypt/live/example.com/fullchain.pem',
      sslCertificateKey: '/etc/letsencrypt/live/example.com/privkey.pem',
      enableHttpRedirect: true,
      enableGzip: true,
      enableStaticCache: true,
      cacheExpires: '30d',
      enableSecurityHeaders: true,
      enablePhp: true,
      phpSocket: 'unix:/run/php/php8.2-fpm.sock'
    }
  },
  'node-proxy': {
    label: 'Node.js / reverse proxy',
    description: 'Forward requests to a Node.js app, with WebSocket support.',
    values: {
      serverName: 'app.example.com',
      root: '/var/www/app/public',
      index: 'index.html',
      enableHttps: true,
      sslCertificate: '/etc/letsencrypt/live/app.example.com/fullchain.pem',
      sslCertificateKey: '/etc/letsencrypt/live/app.example.com/privkey.pem',
      enableHttpRedirect: true,
      enableGzip: true,
      enableStaticCache: true,
      cacheExpires: '7d',
      enableSecurityHeaders: true,
      enableProxy: true,
      proxyUrl: 'http://127.0.0.1:3000',
      proxyWebsockets: true
    }
  },
  'load-balancer': {
    label: 'Load balancer',
    description: 'Round-robin across two backend app servers.',
    values: {
      serverName: 'app.example.com',
      root: '/var/www/app/public',
      index: 'index.html',
      enableHttps: true,
      sslCertificate: '/etc/letsencrypt/live/app.example.com/fullchain.pem',
      sslCertificateKey: '/etc/letsencrypt/live/app.example.com/privkey.pem',
      enableHttpRedirect: true,
      enableGzip: true,
      enableSecurityHeaders: true,
      enableUpstream: true,
      upstreamName: 'backend',
      upstreamBackends: 'http://127.0.0.1:8080\nhttp://127.0.0.1:8081',
      enableProxy: true,
      proxyUrl: 'http://backend',
      proxyWebsockets: true,
      enableRateLimit: true,
      rateLimitRate: '10r/s',
      rateLimitBurst: '20'
    }
  },
  custom: {
    label: 'Custom (start blank)',
    description: 'A blank server block for you to configure from scratch.',
    values: {}
  }
};

export function getPresetValues(presetId) {
  const p = PRESETS[presetId];
  return p ? p.values : null;
}

export function parseBackends(raw) {
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split(/[\n,]/)
    .map(s => s.trim())
    .filter(Boolean);
}

export function buildUpstreamBlock(name, backends) {
  const safeName = (name || 'backend').replace(/[^A-Za-z0-9_]/g, '_') || 'backend';
  if (!Array.isArray(backends) || backends.length === 0) return '';
  const lines = backends.map(b => `    server ${b};`).join('\n');
  return `upstream ${safeName} {\n    least_conn;\n${lines}\n}\n`;
}

export function buildSecurityHeaders() {
  return [
    '    add_header X-Frame-Options "SAMEORIGIN" always;',
    '    add_header X-Content-Type-Options "nosniff" always;',
    '    add_header X-XSS-Protection "0" always;',
    '    add_header Referrer-Policy "strict-origin-when-cross-origin" always;',
    '    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;'
  ].join('\n');
}

export function buildGzipSection() {
  return [
    'gzip on;',
    'gzip_vary on;',
    'gzip_min_length 1024;',
    'gzip_proxied any;',
    'gzip_comp_level 6;',
    'gzip_types',
    '    text/plain',
    '    text/css',
    '    text/xml',
    '    text/javascript',
    '    application/json',
    '    application/javascript',
    '    application/xml+rss',
    '    application/atom+xml',
    '    image/svg+xml;'
  ].join('\n');
}

export function buildLocationBlocks(state) {
  const out = [];

  if (state.enablePhp) {
    const socket = (state.phpSocket || 'unix:/run/php/php8.2-fpm.sock').trim();
    out.push(
      `    location ~ \\.php$ {\n        include snippets/fastcgi-php.conf;\n        fastcgi_pass ${socket};\n    }`
    );
  }

  if (state.enableStaticCache) {
    const exp = (state.cacheExpires || '30d').trim() || '30d';
    out.push(
      `    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {\n        expires ${exp};\n        add_header Cache-Control "public, max-age=2592000";\n        access_log off;\n    }`
    );
  }

  if (state.enableProxy) {
    const pass = (state.proxyUrl || '').trim();
    if (pass) {
      const ws = state.proxyWebsockets;
      const lines = [
        `    location / {`,
        `        proxy_pass ${pass};`,
        `        proxy_http_version 1.1;`,
        `        proxy_set_header Host $host;`,
        `        proxy_set_header X-Real-IP $remote_addr;`,
        `        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`,
        `        proxy_set_header X-Forwarded-Proto $scheme;`,
        `        proxy_set_header X-Forwarded-Host $host;`,
        `        proxy_connect_timeout 30s;`,
        `        proxy_send_timeout 60s;`,
        `        proxy_read_timeout 60s;`
      ];
      if (ws) {
        lines.push('        proxy_set_header Upgrade $http_upgrade;');
        lines.push('        proxy_set_header Connection "upgrade";');
      }
      lines.push('    }');
      out.push(lines.join('\n'));
    }
  }

  return out;
}

function appendLocations(lines, locations, withHeader = true) {
  if (locations.length === 0) return;
  lines.push('');
  if (withHeader) lines.push('    # Locations');
  locations.forEach((loc, i) => {
    lines.push(loc);
    if (i < locations.length - 1) lines.push('');
  });
}

export function buildMainServerBlock(state) {
  const lines = [];
  lines.push('server {');

  const listen = String(state.listen || 80);
  const listenExtra = (state.listenExtra || '').trim();
  lines.push(`    listen ${listen}${listenExtra ? ' ' + listenExtra : ''};`);
  lines.push(`    listen [::]:${listen}${listenExtra ? ' ' + listenExtra : ''};`);

  if (state.serverName) {
    lines.push(`    server_name ${state.serverName};`);
  }

  if (state.root) {
    lines.push(`    root ${state.root};`);
  }
  if (state.index) {
    lines.push(`    index ${state.index};`);
  }

  if (state.enableRateLimit) {
    const rate = (state.rateLimitRate || '10r/s').trim();
    const burst = (state.rateLimitBurst || '').trim();
    lines.push('');
    lines.push('    # Rate limiting');
    lines.push(`    limit_req zone=one burst=${burst || '20'} nodelay;`);
  }

  lines.push('');
  lines.push('    # Logging');
  const accessLog = (state.accessLog || '/var/log/nginx/access.log').trim();
  const errorLog = (state.errorLog || '/var/log/nginx/error.log').trim();
  lines.push(`    access_log ${accessLog};`);
  lines.push(`    error_log ${errorLog};`);

  const locations = buildLocationBlocks(state);
  appendLocations(lines, locations, true);

  if (state.enableSecurityHeaders) {
    lines.push('');
    lines.push('    # Security headers');
    lines.push(buildSecurityHeaders());
  }

  lines.push('}');
  return { lines, locations, listenExtra };
}

export function buildHttpsBlock(state, listenExtra) {
  const lines = [];
  lines.push('# HTTPS server block (port 443)');
  lines.push('server {');
  lines.push(`    listen 443 ssl${listenExtra ? ' ' + listenExtra : ''};`);
  lines.push(`    listen [::]:443 ssl${listenExtra ? ' ' + listenExtra : ''};`);
  if (state.serverName) lines.push(`    server_name ${state.serverName};`);

  if (state.root) lines.push(`    root ${state.root};`);
  if (state.index) lines.push(`    index ${state.index};`);

  const cert = (state.sslCertificate || '').trim();
  const key = (state.sslCertificateKey || '').trim();
  if (cert) lines.push(`    ssl_certificate ${cert};`);
  if (key) lines.push(`    ssl_certificate_key ${key};`);

  const protos = (state.sslProtocols || 'TLSv1.2 TLSv1.3').trim();
  lines.push(`    ssl_protocols ${protos};`);
  lines.push('    ssl_ciphers HIGH:!aNULL:!MD5;');
  lines.push('    ssl_prefer_server_ciphers on;');
  lines.push('    ssl_session_cache shared:SSL:10m;');
  lines.push('    ssl_session_timeout 1d;');
  lines.push('    ssl_session_tickets off;');

  const locations = buildLocationBlocks(state);
  appendLocations(lines, locations, false);

  if (state.enableSecurityHeaders) {
    lines.push('');
    lines.push('    # Security headers');
    lines.push(buildSecurityHeaders());
  }

  lines.push('}');
  return lines.join('\n');
}

export function buildWwwRedirectBlock(state, listenExtra) {
  if (!state.enableWwwRedirect || state.enableWwwRedirect === 'none') return '';
  const lines = [];
  lines.push('# WWW redirect');
  lines.push('server {');
  lines.push(`    listen 80${listenExtra ? ' ' + listenExtra : ''};`);
  lines.push(`    listen [::]:80${listenExtra ? ' ' + listenExtra : ''};`);
  if (state.enableWwwRedirect === 'to-www') {
    const host = (state.serverName || 'example.com').trim();
    lines.push(`    server_name ${host.split(/\s+/)[0]};`);
    lines.push(`    return 301 $scheme://www.${host.split(/\s+/)[0]}$request_uri;`);
  } else {
    const host = (state.serverName || 'example.com').trim();
    lines.push(`    server_name www.${host.split(/\s+/)[0]};`);
    lines.push(`    return 301 $scheme://${host.split(/\s+/)[0]}$request_uri;`);
  }
  lines.push('}');
  return lines.join('\n');
}

export function buildHttpRedirectBlock(state, listenExtra) {
  if (!state.enableHttpRedirect || !state.enableHttps) return '';
  const lines = [];
  lines.push('# HTTP -> HTTPS redirect');
  lines.push('server {');
  lines.push(`    listen 80${listenExtra ? ' ' + listenExtra : ''};`);
  lines.push(`    listen [::]:80${listenExtra ? ' ' + listenExtra : ''};`);
  if (state.serverName) lines.push(`    server_name ${state.serverName};`);
  lines.push('    return 301 https://$host$request_uri;');
  lines.push('}');
  return lines.join('\n');
}

export function buildServerBlock(state) {
  const lines = [];
  lines.push('# ============================================');
  lines.push(`# Server block for ${state.serverName || 'example.com'}`);
  lines.push('# Generated by ToolBox NGINX Config Generator');
  lines.push('# ============================================');

  const { lines: mainLines, listenExtra } = buildMainServerBlock(state);
  lines.push(...mainLines.join('\n').split('\n'));

  if (state.enableHttps) {
    lines.push('');
    buildHttpsBlock(state, listenExtra).split('\n').forEach(l => lines.push(l));
  }

  lines.push('');
  buildWwwRedirectBlock(state, listenExtra).split('\n').forEach(l => lines.push(l));

  lines.push('');
  buildHttpRedirectBlock(state, listenExtra).split('\n').forEach(l => lines.push(l));

  return lines.join('\n');
}

export function buildNginxConfig(state) {
  const sections = [];
  sections.push('# ============================================');
  sections.push('# nginx.conf — generated by ToolBox');
  sections.push('# https://your-site  •  client-side, no upload');
  sections.push('# ============================================');
  sections.push('');

  if (state.enableUpstream) {
    const backends = parseBackends(state.upstreamBackends || '');
    if (backends.length > 0) {
      const name = (state.upstreamName || 'backend').trim();
      sections.push(buildUpstreamBlock(name, backends));
    }
  }

  if (state.enableRateLimit) {
    const rate = (state.rateLimitRate || '10r/s').trim();
    sections.push('# Rate limiting zone (must be in http {} context)');
    sections.push(`limit_req_zone $binary_remote_addr zone=one:10m rate=${rate};`);
    sections.push('');
  }

  sections.push(buildServerBlock(state));

  return sections.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

export const DEFAULT_STATE = {
  preset: 'static-site',
  listen: 80,
  listenExtra: '',
  serverName: 'example.com',
  root: '/var/www/html',
  index: 'index.html index.htm',
  accessLog: '/var/log/nginx/access.log',
  errorLog: '/var/log/nginx/error.log',

  enableHttps: false,
  sslCertificate: '/etc/letsencrypt/live/example.com/fullchain.pem',
  sslCertificateKey: '/etc/letsencrypt/live/example.com/privkey.pem',
  sslProtocols: 'TLSv1.2 TLSv1.3',

  enableWwwRedirect: 'none',
  enableHttpRedirect: false,
  enableGzip: false,
  enableStaticCache: false,
  cacheExpires: '30d',
  enableSecurityHeaders: false,

  enablePhp: false,
  phpSocket: 'unix:/run/php/php8.2-fpm.sock',

  enableProxy: false,
  proxyUrl: 'http://127.0.0.1:3000',
  proxyWebsockets: true,

  enableUpstream: false,
  upstreamName: 'backend',
  upstreamBackends: 'http://127.0.0.1:8080\nhttp://127.0.0.1:8081',

  enableRateLimit: false,
  rateLimitRate: '10r/s',
  rateLimitBurst: '20'
};

export function applyPreset(presetId, current) {
  const values = getPresetValues(presetId);
  if (!values) return current;
  return { ...DEFAULT_STATE, ...current, preset: presetId, ...values };
}

export function render(container) {
  let state = { ...DEFAULT_STATE, ...PRESETS['static-site'].values, preset: 'static-site' };

  const FIELDS = [
    { id: 'listen', label: 'Port', type: 'number', min: 1, max: 65535 },
    { id: 'listenExtra', label: 'Extra listen flags (e.g. default_server)', type: 'text' },
    { id: 'serverName', label: 'Server name (domain)', type: 'text' },
    { id: 'root', label: 'Root directory', type: 'text' },
    { id: 'index', label: 'Index files', type: 'text' },
    { id: 'accessLog', label: 'Access log path', type: 'text' },
    { id: 'errorLog', label: 'Error log path', type: 'text' },
    { id: 'sslCertificate', label: 'SSL certificate path', type: 'text' },
    { id: 'sslCertificateKey', label: 'SSL certificate key', type: 'text' },
    { id: 'sslProtocols', label: 'SSL protocols', type: 'text' },
    { id: 'cacheExpires', label: 'Static cache expires', type: 'text' },
    { id: 'phpSocket', label: 'PHP-FPM socket / address', type: 'text' },
    { id: 'proxyUrl', label: 'Proxy pass URL', type: 'text' },
    { id: 'upstreamName', label: 'Upstream name', type: 'text' },
    { id: 'upstreamBackends', label: 'Upstream backends (one per line)', type: 'textarea' },
    { id: 'rateLimitRate', label: 'Rate (e.g. 10r/s)', type: 'text' },
    { id: 'rateLimitBurst', label: 'Burst size', type: 'text' }
  ];
  const TEXT_FIELDS = new Set(FIELDS.filter(f => f.type === 'text' || f.type === 'number').map(f => f.id));
  const AREA_FIELDS = new Set(FIELDS.filter(f => f.type === 'textarea').map(f => f.id));
  const fh = (id, label, ph) => fieldHtml(id, label, state, FIELDS, AREA_FIELDS, ph);
  const sh = (id, label, opts) => selectHtml(id, label, opts, state);
  const ch = (id, label, hint) => checkHtml(id, label, state, hint);

  container.innerHTML = `
    <div class="tool-layout">
      <div class="ngx-shell">
        <div class="ngx-pane ngx-controls">
          <div class="ngx-section">
            <h3>Preset</h3>
            <div class="form-group">
              <label for="ngx-preset">Start from</label>
              <select id="ngx-preset" class="text-input">
                ${Object.entries(PRESETS).map(([k, p]) => `<option value="${k}"${k === state.preset ? ' selected' : ''}>${p.label}</option>`).join('')}
              </select>
              <small class="ngx-hint" id="ngx-preset-desc">${PRESETS[state.preset]?.description || ''}</small>
            </div>
          </div>

          <div class="ngx-section">
            <h3>Server</h3>
            ${fh('listen', 'Listen port', '80')}
            ${fh('listenExtra', 'Extra listen flags', 'default_server')}
            ${fh('serverName', 'Server name', 'example.com www.example.com')}
            ${fh('root', 'Root directory', '/var/www/html')}
            ${fh('index', 'Index files', 'index.html index.htm')}
          </div>

          <div class="ngx-section">
            <h3>Logging</h3>
            ${fh('accessLog', 'Access log', '/var/log/nginx/access.log')}
            ${fh('errorLog', 'Error log', '/var/log/nginx/error.log')}
          </div>

          <div class="ngx-section">
            <h3>Performance</h3>
            <div class="ngx-checks">
              ${ch('enableGzip', 'Enable gzip', 'Compress text responses')}
              ${ch('enableStaticCache', 'Cache static assets', 'expires + Cache-Control headers')}
            </div>
            <div id="ngx-cacheExpires-wrap" style="display:none;">${fh('cacheExpires', 'Expires (e.g. 30d, 12h)', '30d')}</div>
          </div>

          <div class="ngx-section">
            <h3>Security</h3>
            <div class="ngx-checks">
              ${ch('enableSecurityHeaders', 'Add security headers', 'XFO, nosniff, Referrer-Policy, Permissions-Policy')}
            </div>
            <h4>Rate limiting</h4>
            <div class="ngx-checks">
              ${ch('enableRateLimit', 'Enable rate limiting', 'limit_req in server block')}
            </div>
            <div id="ngx-rate-opts" style="display:none;">
              ${fh('rateLimitRate', 'Rate', '10r/s')}
              ${fh('rateLimitBurst', 'Burst', '20')}
            </div>
          </div>

          <div class="ngx-section">
            <h3>HTTPS / TLS</h3>
            <div class="ngx-checks">
              ${ch('enableHttps', 'Enable HTTPS server block (port 443)')}
              ${ch('enableHttpRedirect', 'Redirect HTTP → HTTPS')}
            </div>
            <div id="ngx-https-opts" style="display:none;">
              ${fh('sslCertificate', 'ssl_certificate', '/etc/letsencrypt/live/example.com/fullchain.pem')}
              ${fh('sslCertificateKey', 'ssl_certificate_key', '/etc/letsencrypt/live/example.com/privkey.pem')}
              ${fh('sslProtocols', 'ssl_protocols', 'TLSv1.2 TLSv1.3')}
            </div>
          </div>

          <div class="ngx-section">
            <h3>WWW redirect</h3>
            ${sh('enableWwwRedirect', 'Redirect', [
              { value: 'none', label: 'No redirect' },
              { value: 'to-www', label: 'Force www. prefix' },
              { value: 'from-www', label: 'Force non-www' }
            ])}
          </div>

          <div class="ngx-section">
            <h3>PHP-FPM</h3>
            <div class="ngx-checks">
              ${ch('enablePhp', 'Pass .php to PHP-FPM', 'Adds a fastcgi location block')}
            </div>
            <div id="ngx-php-opts" style="display:none;">${fh('phpSocket', 'FPM socket / address', 'unix:/run/php/php8.2-fpm.sock')}</div>
          </div>

          <div class="ngx-section">
            <h3>Reverse proxy</h3>
            <div class="ngx-checks">
              ${ch('enableProxy', 'Enable reverse proxy', 'Adds a location / with proxy_pass')}
            </div>
            <div id="ngx-proxy-opts" style="display:none;">
              ${fh('proxyUrl', 'Proxy pass URL', 'http://127.0.0.1:3000')}
              <div class="ngx-checks">${ch('proxyWebsockets', 'WebSocket support', 'Adds Upgrade/Connection headers')}</div>
            </div>
          </div>

          <div class="ngx-section">
            <h3>Load balancing (upstream)</h3>
            <div class="ngx-checks">
              ${ch('enableUpstream', 'Define upstream block', 'Round-robins between backends')}
            </div>
            <div id="ngx-upstream-opts" style="display:none;">
              ${fh('upstreamName', 'Upstream name', 'backend')}
              ${fh('upstreamBackends', 'Backends (one per line)', 'http://127.0.0.1:8080')}
              <small class="ngx-hint">Use the upstream name (e.g. <code>http://backend</code>) as the proxy URL above to route to this pool.</small>
            </div>
          </div>
        </div>

        <div class="ngx-pane ngx-output">
          <div class="ngx-output-header">
            <div class="ngx-meta">
              <span class="ngx-badge" id="ngx-line-count">0 lines</span>
              <span class="ngx-badge ngx-badge-soft" id="ngx-byte-count">0 B</span>
            </div>
            <div class="ngx-actions">
              <button class="btn btn-sm" id="ngx-reset" type="button">Reset</button>
              <button class="btn btn-sm" id="ngx-download" type="button">Download</button>
              <button class="btn btn-primary btn-sm" id="ngx-copy" type="button">Copy</button>
            </div>
          </div>
          <pre class="ngx-code" id="ngx-output" aria-live="polite"></pre>
          <div class="ngx-foot">
            <small>Always validate with <code>sudo nginx -t</code> before reloading.</small>
          </div>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = NGX_CSS;
  container.appendChild(style);

  const output = container.querySelector('#ngx-output');
  const lineCountEl = container.querySelector('#ngx-line-count');
  const byteCountEl = container.querySelector('#ngx-byte-count');

  function updateMeta(text) {
    const lines = text ? text.split('\n').length : 0;
    const bytes = text ? new Blob([text]).size : 0;
    lineCountEl.textContent = `${lines} line${lines === 1 ? '' : 's'}`;
    byteCountEl.textContent = bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
  }

  function generate() {
    const text = buildNginxConfig(state);
    output.textContent = text;
    updateMeta(text);
  }

  function syncConditional() {
    const c = container;
    const set = (sel, show) => { const el = c.querySelector(sel); if (el) el.style.display = show ? '' : 'none'; };
    set('#ngx-cacheExpires-wrap', state.enableStaticCache);
    set('#ngx-rate-opts', state.enableRateLimit);
    set('#ngx-https-opts', state.enableHttps);
    set('#ngx-php-opts', state.enablePhp);
    set('#ngx-proxy-opts', state.enableProxy);
    set('#ngx-upstream-opts', state.enableUpstream);
  }

  container.querySelector('#ngx-preset').addEventListener('change', e => {
    const id = e.target.value;
    state = applyPreset(id, state);
    container.querySelector('#ngx-preset-desc').textContent = PRESETS[id]?.description || '';
    syncFormFromState();
    syncConditional();
    generate();
  });

  container.querySelectorAll('.ngx-toggle').forEach(el => {
    el.addEventListener('change', () => {
      state[el.dataset.field] = el.checked;
      syncConditional();
      generate();
    });
  });

  container.querySelectorAll('.ngx-field').forEach(el => {
    const evt = el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(evt, () => {
      const f = el.dataset.field;
      const raw = el.value;
      if (f === 'listen') {
        const n = parseInt(raw, 10);
        state[f] = isNaN(n) ? 80 : n;
      } else {
        state[f] = raw;
      }
      generate();
    });
  });

  function syncFormFromState() {
    container.querySelectorAll('.ngx-toggle').forEach(el => {
      el.checked = !!state[el.dataset.field];
    });
    container.querySelectorAll('.ngx-field').forEach(el => {
      const f = el.dataset.field;
      const v = state[f];
      if (v === undefined || v === null) {
        if (el.tagName === 'TEXTAREA') el.value = '';
        else el.value = '';
      } else {
        el.value = String(v);
      }
    });
  }

  container.querySelector('#ngx-copy').addEventListener('click', async () => {
    const text = output.textContent;
    const ok = await copyToClipboard(text);
    if (ok) {
      showToast({ message: 'Config copied to clipboard', type: 'success' });
    } else {
      showToast({ message: 'Copy failed', type: 'error' });
    }
  });

  container.querySelector('#ngx-download').addEventListener('click', () => {
    const text = output.textContent;
    const blob = new Blob([text], { type: 'text/plain' });
    const name = (state.serverName || 'nginx').split(/\s+/)[0].replace(/[^A-Za-z0-9.-]/g, '_') || 'nginx';
    downloadBlob(blob, `${name}.conf`);
    showToast({ message: `Downloaded ${name}.conf`, type: 'success' });
  });

  container.querySelector('#ngx-reset').addEventListener('click', () => {
    state = { ...DEFAULT_STATE };
    syncFormFromState();
    syncConditional();
    container.querySelector('#ngx-preset').value = 'custom';
    container.querySelector('#ngx-preset-desc').textContent = PRESETS.custom.description;
    generate();
  });

  syncFormFromState();
  syncConditional();
  generate();
}
