import { showToast } from '../../components/toast.js';
import { copyToClipboard } from '../../utils/clipboard.js';
import { downloadBlob } from '../../utils/file.js';

export const toolConfig = {
  id: 'env-editor',
  name: 'Environment Variable (.env) Editor',
  category: 'dev',
  description: 'Edit .env files visually with a live-validating editor, multi-file tabs (.env / .env.example / .env.production / .env.development), a preset library (Postgres, Redis, Stripe, AWS, OAuth, JWT, OpenAI, and more), and one-click conversion to JSON, YAML, shell exports, and docker --env-file format.',
  icon: '🔐',
  accept: null,
  maxSizeMB: null,
  keywords: ['env', 'environment', 'dotenv', '.env', 'config', 'secret', 'api key', 'docker', 'shell', 'json', 'yaml'],
  steps: [
    'Edit the .env file in the monospace pane — the validator flags invalid lines, duplicates, and quoting issues in real time',
    'Switch between .env, .env.example, .env.production, and .env.development tabs (or add your own file name)',
    'Click a preset chip (Postgres, Redis, Stripe, AWS, OpenAI, …) to append its variables to the current file',
    'Copy the result as text, download it as a file, or convert it to JSON / YAML / shell / docker format'
  ],
  faqs: [
    { question: 'What is a .env file?', answer: 'A plain-text file of KEY=VALUE pairs loaded by frameworks like Node.js (dotenv), Python (python-dotenv), Ruby (dotenv-rails), Docker Compose, and many others. Lines starting with # are comments, blank lines are ignored.' },
    { question: 'How do I quote values with spaces or special characters?', answer: 'Wrap the value in double or single quotes: GREETING="hello world" or SECRET=\'has #hash\'. The editor accepts both, preserves your quote choice, and warns if a quoted value is missing its closing quote.' },
    { question: 'What is the difference between .env and .env.example?', answer: '.env holds real secrets and must never be committed. .env.example is a template with empty values that is safe to commit, so teammates know which keys to set.' },
    { question: 'How do I switch the active file?', answer: 'Click a tab at the top of the editor. The active file is what gets edited, copied, downloaded, and converted. Each file is stored independently in your browser.' },
    { question: 'Are my values sent anywhere?', answer: 'No. Everything is processed locally in your browser. Preset chips just append template variables with empty or generic values — they never call any network endpoint.' }
  ]
};

export const DEFAULT_FILE_TEMPLATES = {
  '.env': '# Local development environment\nNODE_ENV=development\nPORT=3000\n',
  '.env.example': '# Copy to .env and fill in the values\nNODE_ENV=\nPORT=3000\n'
};

export const FILE_TABS = ['.env', '.env.example', '.env.production', '.env.development'];

export const PRESETS = [
  {
    id: 'postgres',
    name: 'PostgreSQL',
    icon: '🐘',
    vars: [
      { key: 'POSTGRES_HOST', value: 'localhost' },
      { key: 'POSTGRES_PORT', value: '5432' },
      { key: 'POSTGRES_DB', value: 'myapp' },
      { key: 'POSTGRES_USER', value: 'admin' },
      { key: 'POSTGRES_PASSWORD', value: '' }
    ]
  },
  {
    id: 'redis',
    name: 'Redis',
    icon: '🔴',
    vars: [
      { key: 'REDIS_URL', value: 'redis://localhost:6379' },
      { key: 'REDIS_PASSWORD', value: '' }
    ]
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    icon: '🍃',
    vars: [
      { key: 'MONGODB_URI', value: 'mongodb://localhost:27017/myapp' },
      { key: 'MONGODB_USER', value: '' },
      { key: 'MONGODB_PASSWORD', value: '' }
    ]
  },
  {
    id: 'mysql',
    name: 'MySQL',
    icon: '🐬',
    vars: [
      { key: 'MYSQL_HOST', value: 'localhost' },
      { key: 'MYSQL_PORT', value: '3306' },
      { key: 'MYSQL_DATABASE', value: 'myapp' },
      { key: 'MYSQL_USER', value: 'root' },
      { key: 'MYSQL_PASSWORD', value: '' }
    ]
  },
  {
    id: 'jwt',
    name: 'JWT Auth',
    icon: '🔑',
    vars: [
      { key: 'JWT_SECRET', value: '' },
      { key: 'JWT_EXPIRES_IN', value: '7d' },
      { key: 'JWT_ISSUER', value: 'myapp' }
    ]
  },
  {
    id: 'google',
    name: 'Google OAuth',
    icon: '🔵',
    vars: [
      { key: 'GOOGLE_CLIENT_ID', value: '' },
      { key: 'GOOGLE_CLIENT_SECRET', value: '' },
      { key: 'GOOGLE_REDIRECT_URI', value: 'http://localhost:3000/auth/google/callback' }
    ]
  },
  {
    id: 'github',
    name: 'GitHub OAuth',
    icon: '🐙',
    vars: [
      { key: 'GITHUB_CLIENT_ID', value: '' },
      { key: 'GITHUB_CLIENT_SECRET', value: '' },
      { key: 'GITHUB_REDIRECT_URI', value: 'http://localhost:3000/auth/github/callback' }
    ]
  },
  {
    id: 'stripe',
    name: 'Stripe',
    icon: '💳',
    vars: [
      { key: 'STRIPE_SECRET_KEY', value: '' },
      { key: 'STRIPE_PUBLISHABLE_KEY', value: '' },
      { key: 'STRIPE_WEBHOOK_SECRET', value: '' }
    ]
  },
  {
    id: 'aws',
    name: 'AWS S3',
    icon: '☁️',
    vars: [
      { key: 'AWS_ACCESS_KEY_ID', value: '' },
      { key: 'AWS_SECRET_ACCESS_KEY', value: '' },
      { key: 'AWS_REGION', value: 'us-east-1' },
      { key: 'S3_BUCKET', value: '' }
    ]
  },
  {
    id: 'mailgun',
    name: 'Mailgun',
    icon: '📧',
    vars: [
      { key: 'MAILGUN_API_KEY', value: '' },
      { key: 'MAILGUN_DOMAIN', value: '' },
      { key: 'MAILGUN_FROM', value: 'noreply@example.com' }
    ]
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    icon: '📨',
    vars: [
      { key: 'SENDGRID_API_KEY', value: '' },
      { key: 'SENDGRID_FROM', value: 'noreply@example.com' }
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '🧠',
    vars: [
      { key: 'OPENAI_API_KEY', value: '' },
      { key: 'OPENAI_ORG_ID', value: '' },
      { key: 'OPENAI_MODEL', value: 'gpt-4o-mini' }
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: '🤖',
    vars: [
      { key: 'ANTHROPIC_API_KEY', value: '' },
      { key: 'ANTHROPIC_MODEL', value: 'claude-3-5-sonnet-latest' }
    ]
  },
  {
    id: 'app',
    name: 'App / Server',
    icon: '🛠️',
    vars: [
      { key: 'APP_NAME', value: 'myapp' },
      { key: 'APP_URL', value: 'http://localhost:3000' },
      { key: 'LOG_LEVEL', value: 'info' },
      { key: 'CORS_ORIGIN', value: 'http://localhost:3000' }
    ]
  }
];

export function parseEnv(text) {
  const lines = (text || '').split(/\r?\n/);
  const entries = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();
    if (!trimmed) {
      entries.push({ type: 'blank', line: raw, num: i + 1 });
      continue;
    }
    if (trimmed.startsWith('#')) {
      entries.push({ type: 'comment', line: raw, num: i + 1, value: trimmed });
      continue;
    }
    const m = raw.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m) {
      entries.push({ type: 'invalid', line: raw, num: i + 1, reason: 'missing = or invalid key' });
      continue;
    }
    const key = m[1];
    let rawValue = m[2];
    let value = rawValue;
    let quote = null;
    if (rawValue.length >= 2) {
      const first = rawValue[0];
      const last = rawValue[rawValue.length - 1];
      if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
        quote = first;
        value = rawValue.slice(1, -1);
      }
    }
    let unclosedQuote = false;
    if ((rawValue.startsWith('"') && !rawValue.endsWith('"')) || (rawValue.startsWith("'") && !rawValue.endsWith("'"))) {
      unclosedQuote = true;
    }
    entries.push({ type: 'kv', line: raw, num: i + 1, key, value, rawValue, quote, unclosedQuote });
  }
  return entries;
}

export function validateEnv(entries) {
  const issues = [];
  const seen = new Map();
  for (const e of entries) {
    if (e.type !== 'kv') continue;
    if (e.unclosedQuote) {
      issues.push({ line: e.num, severity: 'error', message: `${e.key}: unclosed quote` });
    }
    if (e.rawValue !== e.rawValue.trim()) {
      issues.push({ line: e.num, severity: 'warn', message: `${e.key}: leading/trailing whitespace around value` });
    }
    if (/[\s]/.test(e.key)) {
      issues.push({ line: e.num, severity: 'error', message: `key contains whitespace` });
    }
    const valuePortion = e.line.split('=').slice(1).join('=');
    if (valuePortion !== valuePortion.trim()) {
      issues.push({ line: e.num, severity: 'warn', message: `${e.key}: leading or trailing whitespace around value` });
    }
    if (seen.has(e.key)) {
      issues.push({ line: e.num, severity: 'warn', message: `${e.key}: duplicate (first seen at line ${seen.get(e.key)})` });
    } else {
      seen.set(e.key, e.num);
    }
  }
  for (const e of entries) {
    if (e.type === 'invalid') {
      issues.push({ line: e.num, severity: 'error', message: e.reason });
    }
  }
  return issues;
}

export function buildEnvFromVars(vars, header) {
  const lines = [];
  if (header) lines.push(`# ${header}`);
  for (const v of vars) {
    if (!v || !v.key) continue;
    let val = v.value == null ? '' : String(v.value);
    if (val.includes(' ') || val.includes('#') || val.includes('"') || val.includes("'")) {
      val = '"' + val.replace(/"/g, '\\"') + '"';
    }
    lines.push(`${v.key}=${val}`);
  }
  return lines.join('\n') + '\n';
}

export function toJson(entries) {
  const obj = {};
  for (const e of entries) {
    if (e.type === 'kv') obj[e.key] = e.value;
  }
  return JSON.stringify(obj, null, 2) + '\n';
}

export function toYaml(entries) {
  const lines = [];
  for (const e of entries) {
    if (e.type === 'kv') {
      const v = e.value;
      const needsQuote = v === '' || /[#&*!|>'"%@`{}\[\],:\n]/.test(v) || /^\s|\s$/.test(v) || /^(true|false|null|yes|no|on|off)$/i.test(v) || /^-?\d+(\.\d+)?$/.test(v);
      lines.push(`${e.key}: ${needsQuote ? JSON.stringify(v) : v}`);
    }
  }
  return lines.join('\n') + '\n';
}

export function toShell(entries) {
  const lines = ['#!/usr/bin/env sh', '# Generated by XToolBox Environment Editor', ''];
  for (const e of entries) {
    if (e.type === 'kv') {
      const v = e.value;
      const escaped = v.replace(/'/g, "'\\''");
      lines.push(`export ${e.key}='${escaped}'`);
    }
  }
  return lines.join('\n') + '\n';
}

export function toDockerArgs(entries) {
  const lines = ['# Pass these to: docker run'];
  for (const e of entries) {
    if (e.type === 'kv') {
      lines.push(`--env ${e.key}=${e.value}`);
    }
  }
  return lines.join('\n') + '\n';
}

export function stats(entries) {
  let vars = 0, comments = 0, blanks = 0, invalid = 0;
  for (const e of entries) {
    if (e.type === 'kv') vars++;
    else if (e.type === 'comment') comments++;
    else if (e.type === 'blank') blanks++;
    else if (e.type === 'invalid') invalid++;
  }
  return { vars, comments, blanks, invalid, total: entries.length };
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const escapeAttr = escapeHtml;

function highlightLine(line) {
  if (line == null) return '';
  const raw = String(line);
  const trimmed = raw.trim();
  if (!trimmed) return '<span class="env-line env-line-blank">&nbsp;</span>';
  if (trimmed.startsWith('#')) return `<span class="env-line env-line-comment">${escapeHtml(raw)}</span>`;
  const m = raw.match(/^(\s*)(?:(export)\s+)?([A-Za-z_][A-Za-z0-9_]*)(\s*)=(\s*)(.*?)(\s*)$/);
  if (m) {
    const [, lead, exp, key, eqPre, valPre, val, eqPost] = m;
    return `${escapeHtml(lead)}${exp ? `<span class="env-kw">${escapeHtml(exp)} </span>` : ''}<span class="env-key">${escapeHtml(key)}</span>${escapeHtml(eqPre)}<span class="env-eq">=</span>${escapeHtml(valPre)}<span class="env-val">${escapeHtml(val)}</span>${escapeHtml(eqPost)}`;
  }
  return `<span class="env-line env-line-invalid">${escapeHtml(raw)}</span>`;
}

export function render(container) {
  const STORAGE_KEY = 'env-editor:files';
  let state = {
    active: '.env',
    files: { ...DEFAULT_FILE_TEMPLATES }
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.files && typeof parsed.files === 'object') {
        state.files = { ...DEFAULT_FILE_TEMPLATES, ...parsed.files };
        if (parsed.active && state.files[parsed.active] != null) state.active = parsed.active;
      }
    }
  } catch {}

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ active: state.active, files: state.files }));
    } catch {}
  }

  container.innerHTML = `
    <div class="tool-layout" style="display:flex;flex-direction:column;gap:var(--space-4);">
      <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-3) var(--space-4);">
        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3);">
          <div id="env-tabs" style="display:flex;flex-wrap:wrap;gap:var(--space-1);flex:1;min-width:0;"></div>
          <button class="btn btn-secondary btn-sm" id="env-add-file" type="button">+ File</button>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:var(--space-2);align-items:center;">
          <input type="search" id="env-search" class="text-input" placeholder="Search keys or values…" autocomplete="off" style="flex:1;min-width:160px;">
          <button class="btn btn-secondary btn-sm" id="env-clear" type="button">Clear file</button>
          <button class="btn btn-secondary btn-sm" id="env-reset" type="button">Reset all</button>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:minmax(0,1fr);gap:var(--space-4);">
        <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-2) var(--space-3);border-bottom:1px solid var(--color-border);background:var(--color-bg);">
            <span id="env-active-label" style="font-weight:600;font-size:var(--text-sm);color:var(--color-text-muted);"></span>
            <span id="env-stats" style="font-size:var(--text-xs);color:var(--color-text-muted);"></span>
          </div>
          <div style="position:relative;display:grid;grid-template-columns:auto 1fr;background:#1e1e2e;">
            <pre id="env-gutter" style="margin:0;padding:var(--space-3) var(--space-2) var(--space-3) var(--space-3);background:#1e1e2e;color:#6c7086;text-align:right;font-family:monospace;font-size:var(--text-sm);line-height:1.6;user-select:none;min-width:48px;overflow:hidden;"></pre>
            <div style="position:relative;">
              <pre id="env-highlight" aria-hidden="true" style="position:absolute;inset:0;margin:0;padding:var(--space-3);background:transparent;color:#cdd6f4;font-family:monospace;font-size:var(--text-sm);line-height:1.6;white-space:pre;pointer-events:none;overflow:auto;"></pre>
              <textarea id="env-textarea" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" wrap="off" style="position:relative;display:block;width:100%;min-height:420px;padding:var(--space-3);background:transparent;color:transparent;caret-color:#cdd6f4;font-family:monospace;font-size:var(--text-sm);line-height:1.6;border:none;outline:none;resize:vertical;white-space:pre;overflow:auto;tab-size:4;"></textarea>
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:var(--space-3);">
          <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-3);">
            <div style="font-size:var(--text-sm);font-weight:600;color:var(--color-text-muted);margin-bottom:var(--space-2);">Presets</div>
            <div id="env-presets" style="display:flex;flex-wrap:wrap;gap:var(--space-1);"></div>
          </div>
          <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-3);">
            <div style="font-size:var(--text-sm);font-weight:600;color:var(--color-text-muted);margin-bottom:var(--space-2);">Validation</div>
            <ul id="env-issues" style="margin:0;padding-left:var(--space-4);font-size:var(--text-xs);color:var(--color-text-muted);max-height:160px;overflow-y:auto;"></ul>
          </div>
        </div>

        <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-3);">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--space-2);margin-bottom:var(--space-2);">
            <div style="font-size:var(--text-sm);font-weight:600;color:var(--color-text-muted);">Output &amp; convert</div>
            <div style="display:flex;flex-wrap:wrap;gap:var(--space-1);">
              <button class="btn btn-secondary btn-sm" id="env-conv-json" type="button">As JSON</button>
              <button class="btn btn-secondary btn-sm" id="env-conv-yaml" type="button">As YAML</button>
              <button class="btn btn-secondary btn-sm" id="env-conv-shell" type="button">As shell</button>
              <button class="btn btn-secondary btn-sm" id="env-conv-docker" type="button">As docker</button>
            </div>
          </div>
          <pre id="env-output" style="background:#1e1e2e;color:#cdd6f4;padding:var(--space-3);border-radius:var(--radius-md);overflow-x:auto;font-size:var(--text-sm);line-height:1.6;white-space:pre-wrap;word-break:break-word;min-height:120px;font-family:monospace;max-height:280px;overflow-y:auto;margin:0;"></pre>
          <div style="display:flex;flex-wrap:wrap;gap:var(--space-2);margin-top:var(--space-2);">
            <button class="btn btn-secondary btn-sm" id="env-copy" type="button">Copy</button>
            <button class="btn btn-primary btn-sm" id="env-download" type="button">Download</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const tabsEl = container.querySelector('#env-tabs');
  const addFileBtn = container.querySelector('#env-add-file');
  const searchEl = container.querySelector('#env-search');
  const clearBtn = container.querySelector('#env-clear');
  const resetBtn = container.querySelector('#env-reset');
  const activeLabel = container.querySelector('#env-active-label');
  const statsEl = container.querySelector('#env-stats');
  const gutterEl = container.querySelector('#env-gutter');
  const highlightEl = container.querySelector('#env-highlight');
  const textarea = container.querySelector('#env-textarea');
  const presetsEl = container.querySelector('#env-presets');
  const issuesEl = container.querySelector('#env-issues');
  const outputEl = container.querySelector('#env-output');
  const copyBtn = container.querySelector('#env-copy');
  const downloadBtn = container.querySelector('#env-download');
  const convJsonBtn = container.querySelector('#env-conv-json');
  const convYamlBtn = container.querySelector('#env-conv-yaml');
  const convShellBtn = container.querySelector('#env-conv-shell');
  const convDockerBtn = container.querySelector('#env-conv-docker');

  let currentOutput = '';
  let currentOutputName = '';

  function renderTabs() {
    const names = Object.keys(state.files);
    tabsEl.innerHTML = names.map(n => {
      const active = n === state.active;
      return `<button type="button" class="env-tab" data-name="${escapeAttr(n)}" style="display:inline-flex;align-items:center;gap:var(--space-1);padding:var(--space-1) var(--space-3);background:${active ? 'var(--color-primary)' : 'var(--color-bg)'};color:${active ? 'white' : 'var(--color-text)'};border:1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'};border-radius:999px;font-size:var(--text-sm);cursor:pointer;transition:all 0.15s;">${escapeHtml(n)}${!FILE_TABS.includes(n) ? ` <span class="env-tab-remove" data-name="${escapeAttr(n)}" style="opacity:0.7;padding:0 var(--space-1);" title="Remove file">×</span>` : ''}</button>`;
    }).join('');
  }

  function renderPresets() {
    presetsEl.innerHTML = PRESETS.map(p => {
      return `<button type="button" class="env-preset" data-id="${escapeAttr(p.id)}" style="display:inline-flex;align-items:center;gap:var(--space-1);padding:var(--space-1) var(--space-2);background:var(--color-bg);color:var(--color-text);border:1px solid var(--color-border);border-radius:999px;font-size:var(--text-xs);cursor:pointer;" title="Append ${escapeAttr(p.vars.length)} variable(s) to ${escapeAttr(state.active)}">${p.icon} ${escapeHtml(p.name)}</button>`;
    }).join('');
  }

  function updateOutput(format) {
    const text = state.files[state.active] || '';
    const entries = parseEnv(text);
    let out = '';
    if (format === 'json') { out = toJson(entries); currentOutputName = state.active + '.json'; }
    else if (format === 'yaml') { out = toYaml(entries); currentOutputName = state.active + '.yaml'; }
    else if (format === 'shell') { out = toShell(entries); currentOutputName = state.active + '.sh'; }
    else if (format === 'docker') { out = toDockerArgs(entries); currentOutputName = state.active + '.docker.txt'; }
    else { out = text; currentOutputName = state.active; }
    currentOutput = out;
    outputEl.textContent = out;
  }

  function renderActive() {
    textarea.value = state.files[state.active] || '';
    activeLabel.textContent = `Editing: ${state.active}`;
    renderHighlight();
    renderStats();
    renderIssues();
    persist();
  }

  function renderHighlight() {
    const text = textarea.value;
    const lines = text.split('\n');
    gutterEl.textContent = lines.map((_, i) => i + 1).join('\n');
    highlightEl.innerHTML = lines.map(highlightLine).join('\n');
  }

  function renderStats() {
    const entries = parseEnv(textarea.value);
    const s = stats(entries);
    statsEl.textContent = `${s.vars} vars • ${s.comments} comments • ${s.blanks} blanks${s.invalid ? ` • ${s.invalid} invalid` : ''}`;
  }

  function renderIssues() {
    const entries = parseEnv(textarea.value);
    const issues = validateEnv(entries);
    if (issues.length === 0) {
      issuesEl.innerHTML = '<li style="color:var(--color-text-muted);">No issues found ✓</li>';
      return;
    }
    issuesEl.innerHTML = issues.map(i => {
      const color = i.severity === 'error' ? 'var(--color-error, #f38ba8)' : 'var(--color-warning, #f9e2af)';
      return `<li style="color:${color};">Line ${i.line}: ${escapeHtml(i.message)}</li>`;
    }).join('');
  }

  tabsEl.addEventListener('click', e => {
    const remove = e.target.closest('.env-tab-remove');
    if (remove) {
      e.stopPropagation();
      const name = remove.dataset.name;
      if (FILE_TABS.includes(name)) return;
      if (!confirm(`Remove file "${name}"?`)) return;
      delete state.files[name];
      if (state.active === name) {
        const remaining = Object.keys(state.files);
        state.active = remaining[0] || '.env';
      }
      renderTabs();
      renderActive();
      return;
    }
    const tab = e.target.closest('.env-tab');
    if (!tab) return;
    state.active = tab.dataset.name;
    renderTabs();
    renderActive();
  });

  addFileBtn.addEventListener('click', () => {
    const name = prompt('New file name (e.g. .env.staging):');
    if (!name) return;
    const clean = name.trim();
    if (!clean) return;
    if (state.files[clean] != null) {
      showToast({ message: 'A file with that name already exists', type: 'error' });
      return;
    }
    state.files[clean] = '';
    state.active = clean;
    renderTabs();
    renderActive();
    showToast({ message: `Created ${clean}`, type: 'success' });
  });

  textarea.addEventListener('input', () => {
    state.files[state.active] = textarea.value;
    renderHighlight();
    renderStats();
    renderIssues();
    persist();
  });

  textarea.addEventListener('scroll', () => {
    gutterEl.scrollTop = textarea.scrollTop;
    highlightEl.scrollTop = textarea.scrollTop;
    highlightEl.scrollLeft = textarea.scrollLeft;
  });

  searchEl.addEventListener('input', () => {
    const q = searchEl.value.trim().toLowerCase();
    if (!q) {
      textarea.value = state.files[state.active] || '';
      renderHighlight();
      return;
    }
    const entries = parseEnv(state.files[state.active] || '');
    const lines = (state.files[state.active] || '').split('\n');
    const filtered = entries
      .filter(e => {
        if (e.type === 'blank') return false;
        const hay = (e.line || '').toLowerCase();
        return hay.includes(q);
      })
      .map(e => lines[e.num - 1]);
    const filteredText = filtered.join('\n') + (filtered.length ? '\n' : '');
    textarea.value = filteredText;
    renderHighlight();
  });

  clearBtn.addEventListener('click', () => {
    if (!confirm(`Clear all content of ${state.active}?`)) return;
    state.files[state.active] = '';
    renderActive();
    showToast({ message: `Cleared ${state.active}`, type: 'success' });
  });

  resetBtn.addEventListener('click', () => {
    if (!confirm('Reset all files to defaults? This discards your current edits.')) return;
    state.files = { ...DEFAULT_FILE_TEMPLATES };
    state.active = '.env';
    renderTabs();
    renderActive();
    updateOutput('env');
    showToast({ message: 'Reset to defaults', type: 'success' });
  });

  presetsEl.addEventListener('click', e => {
    const btn = e.target.closest('.env-preset');
    if (!btn) return;
    const preset = PRESETS.find(p => p.id === btn.dataset.id);
    if (!preset) return;
    const current = state.files[state.active] || '';
    const trimEnd = current.replace(/\s+$/, '');
    const header = `${preset.name} (preset)`;
    const block = buildEnvFromVars(preset.vars, header);
    state.files[state.active] = (trimEnd ? trimEnd + '\n\n' : '') + block;
    renderActive();
    showToast({ message: `Added ${preset.vars.length} ${preset.name} variable(s)`, type: 'success' });
  });

  convJsonBtn.addEventListener('click', () => updateOutput('json'));
  convYamlBtn.addEventListener('click', () => updateOutput('yaml'));
  convShellBtn.addEventListener('click', () => updateOutput('shell'));
  convDockerBtn.addEventListener('click', () => updateOutput('docker'));

  copyBtn.addEventListener('click', async () => {
    if (!currentOutput) updateOutput('env');
    const ok = await copyToClipboard(currentOutput);
    showToast({ message: ok ? `Copied ${currentOutputName}` : 'Copy failed', type: ok ? 'success' : 'error' });
  });

  downloadBtn.addEventListener('click', () => {
    if (!currentOutput) updateOutput('env');
    const blob = new Blob([currentOutput], { type: 'text/plain' });
    downloadBlob(blob, currentOutputName);
    showToast({ message: `Downloaded ${currentOutputName}`, type: 'success' });
  });

  renderTabs();
  renderPresets();
  renderActive();
  updateOutput('env');
}

export function destroy() {}
