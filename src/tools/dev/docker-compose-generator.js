import { showToast } from '../../components/toast.js';
import { copyToClipboard } from '../../utils/clipboard.js';
import { downloadBlob } from '../../utils/file.js';

export const toolConfig = {
  id: 'docker-compose-generator',
  name: 'Docker Compose Generator',
  category: 'dev',
  description: 'Build a docker-compose.yml visually: pick services from a palette (Nginx, Node.js, PostgreSQL, Redis, MySQL, MongoDB, Python, PHP, and more), then tune image, ports, volumes, environment, depends_on, restart, and command. Live YAML output with copy and download.',
  icon: '🐳',
  accept: null,
  maxSizeMB: null,
  keywords: ['docker', 'docker-compose', 'compose', 'yml', 'yaml', 'container', 'service', 'nginx', 'postgres', 'redis', 'mongodb', 'mysql', 'devops'],
  steps: [
    'Type a project name (used for the default network)',
    'Click a service chip in the palette to add it to your compose',
    'Edit the service name, image, ports, volumes, environment, and depends_on',
    'Copy the generated docker-compose.yml or download it as a file'
  ],
  faqs: [
    { question: 'Where do I save the generated file?', answer: 'Save it as docker-compose.yml (or docker-compose.yaml) in your project root, then run docker compose up -d. Use docker compose down to stop and remove the containers.' },
    { question: 'What is a named volume vs a bind mount?', answer: 'A bind mount starts with ./ or / and points to a path on the host (./data:/var/lib/data). A named volume (e.g. pgdata:/var/lib/postgresql/data) is managed by Docker and declared in the top-level volumes: block. The generator auto-detects named volumes and adds the declaration for you.' },
    { question: 'Why are my ports quoted in the output?', answer: 'docker-compose treats unquoted values like "80:80" as numbers, which breaks host:container port mappings. The generator always quotes port mappings to keep them as strings.' },
    { question: 'Can I use this with Docker Swarm or Kubernetes?', answer: 'This generator targets the standard docker-compose v3 format. Most of the output also works in Swarm mode. For Kubernetes you would translate the services into Deployments and Services instead.' },
    { question: 'Do I need to add a network?', answer: 'No. When the top-level networks: block is missing, Docker Compose creates a default network and attaches every service to it, so they can reach each other by service name.' }
  ]
};

export const TEMPLATES = {
  nginx: { name: 'Nginx', icon: '🌐', image: 'nginx:alpine', ports: ['80:80'] },
  node: { name: 'Node.js', icon: '⬢', image: 'node:20-alpine', ports: ['3000:3000'] },
  python: { name: 'Python', icon: '🐍', image: 'python:3.12-slim' },
  php: { name: 'PHP + Apache', icon: '🐘', image: 'php:8.2-apache', ports: ['80:80'] },
  postgres: { name: 'PostgreSQL', icon: '🐘', image: 'postgres:16-alpine', ports: ['5432:5432'], environment: ['POSTGRES_PASSWORD=changeme', 'POSTGRES_DB=app'], volumes: ['pgdata:/var/lib/postgresql/data'] },
  mysql: { name: 'MySQL', icon: '🐬', image: 'mysql:8', ports: ['3306:3306'], environment: ['MYSQL_ROOT_PASSWORD=changeme'], volumes: ['mysqldata:/var/lib/mysql'] },
  mariadb: { name: 'MariaDB', icon: '🦭', image: 'mariadb:11', ports: ['3306:3306'], environment: ['MARIADB_ROOT_PASSWORD=changeme'], volumes: ['mariadata:/var/lib/mysql'] },
  mongodb: { name: 'MongoDB', icon: '🍃', image: 'mongo:7', ports: ['27017:27017'], environment: ['MONGO_INITDB_ROOT_USERNAME=admin', 'MONGO_INITDB_ROOT_PASSWORD=changeme'], volumes: ['mongodata:/data/db'] },
  redis: { name: 'Redis', icon: '🔴', image: 'redis:7-alpine', ports: ['6379:6379'] },
  memcached: { name: 'Memcached', icon: '💾', image: 'memcached:1.6-alpine', ports: ['11211:11211'] },
  rabbitmq: { name: 'RabbitMQ', icon: '🐰', image: 'rabbitmq:3.13-management-alpine', ports: ['5672:5672', '15672:15672'] },
  elasticsearch: { name: 'Elasticsearch', icon: '🔍', image: 'docker.elastic.co/elasticsearch/elasticsearch:8.11.0', ports: ['9200:9200'], environment: ['discovery.type=single-node', 'xpack.security.enabled=false'], volumes: ['esdata:/usr/share/elasticsearch/data'] },
  meilisearch: { name: 'Meilisearch', icon: '🔎', image: 'getmeili/meilisearch:v1.6', ports: ['7700:7700'], environment: ['MEILI_MASTER_KEY=changeme'], volumes: ['meilidata:/meili_data'] },
  minio: { name: 'MinIO', icon: '🪣', image: 'minio/minio:latest', ports: ['9000:9000', '9001:9001'], command: 'server /data --console-address ":9001"', environment: ['MINIO_ROOT_USER=admin', 'MINIO_ROOT_PASSWORD=changeme'], volumes: ['miniodata:/data'] },
  adminer: { name: 'Adminer', icon: '🗄️', image: 'adminer:latest', ports: ['8080:8080'] },
  traefik: { name: 'Traefik', icon: '🚦', image: 'traefik:v3.0', ports: ['80:80', '443:443'], command: '--providers.docker=true --providers.docker.exposedbydefault=false --entrypoints.web.address=:80' },
  keycloak: { name: 'Keycloak', icon: '🔐', image: 'quay.io/keycloak/keycloak:23.0', ports: ['8080:8080'], environment: ['KEYCLOAK_ADMIN=admin', 'KEYCLOAK_ADMIN_PASSWORD=changeme'], command: 'start-dev' }
};

const DEFAULT_NAMES = {
  postgres: 'db', mysql: 'db', mariadb: 'db', mongodb: 'db',
  redis: 'cache', elasticsearch: 'search', rabbitmq: 'mq',
  meilisearch: 'search', minio: 'storage', traefik: 'proxy', keycloak: 'auth',
  memcached: 'cache', adminer: 'adminer'
};

let _idCounter = 0;
function uid() {
  _idCounter += 1;
  return 'svc_' + Date.now().toString(36) + '_' + _idCounter;
}

export function defaultServiceFromTemplate(key) {
  const t = TEMPLATES[key];
  if (!t) return null;
  return {
    id: uid(),
    name: DEFAULT_NAMES[key] || key,
    image: t.image || '',
    command: t.command || '',
    ports: Array.isArray(t.ports) ? [...t.ports] : [],
    volumes: Array.isArray(t.volumes) ? [...t.volumes] : [],
    environment: Array.isArray(t.environment) ? [...t.environment] : [],
    dependsOn: [],
    networks: [],
    restart: 'unless-stopped'
  };
}

export function needsQuotes(s) {
  if (s === '') return true;
  if (/^-?\d+(\.\d+)?$/.test(s)) return true;
  if (/^(null|true|false|yes|no|on|off)$/i.test(s)) return true;
  if (/[:#\s\t\n\r]|["'`|&*?><!%@]/.test(s)) return true;
  if (/^[-?:\,\[\]\{\}\&\*#\!\|\>\'"%@\s]/.test(s)) return true;
  return false;
}

export function formatScalar(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'string') return needsQuotes(v) ? JSON.stringify(v) : v;
  return JSON.stringify(String(v));
}

export function isNamedVolume(v) {
  if (typeof v !== 'string') return false;
  const head = v.split(':')[0];
  if (head.startsWith('./') || head.startsWith('/') || head.startsWith('~')) return false;
  if (head.includes('/')) return false;
  if (!head) return false;
  return /^[A-Za-z0-9_.-]+$/.test(head);
}

export function buildCompose(state) {
  const services = {};
  const namedVolumes = new Set();
  const networks = new Set();

  for (const svc of state.services) {
    const name = (svc.name || '').trim();
    if (!name) continue;
    const def = {};
    if (svc.image && svc.image.trim()) def.image = svc.image.trim();
    if (svc.command && svc.command.trim()) def.command = svc.command.trim();
    if (Array.isArray(svc.ports) && svc.ports.length) {
      def.ports = svc.ports.map(s => s.trim()).filter(Boolean);
    }
    if (Array.isArray(svc.volumes) && svc.volumes.length) {
      const vols = svc.volumes.map(s => s.trim()).filter(Boolean);
      def.volumes = vols;
      for (const v of vols) if (isNamedVolume(v)) namedVolumes.add(v.split(':')[0]);
    }
    if (Array.isArray(svc.environment) && svc.environment.length) {
      def.environment = svc.environment.map(s => s.trim()).filter(Boolean);
    }
    if (Array.isArray(svc.dependsOn) && svc.dependsOn.length) {
      def.depends_on = svc.dependsOn.map(s => s.trim()).filter(Boolean);
    }
    if (Array.isArray(svc.networks) && svc.networks.length) {
      def.networks = svc.networks.map(s => s.trim()).filter(Boolean);
      svc.networks.forEach(n => n.trim() && networks.add(n.trim()));
    }
    if (svc.restart && svc.restart !== 'no') def.restart = svc.restart;
    services[name] = def;
  }

  const out = {};
  if (Object.keys(services).length === 0) {
    return '# Add at least one service to generate docker-compose.yml\n';
  }
  out.services = services;
  if (namedVolumes.size) {
    const volMap = {};
    for (const v of namedVolumes) volMap[v] = null;
    out.volumes = volMap;
  }
  if (state.projectName && state.projectName.trim()) {
    out.networks = { default: { name: state.projectName.trim() + '_default' } };
  }
  return toYaml(out) + '\n';
}

export function toYaml(value, indent = 0) {
  const pad = ' '.repeat(indent);
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return value.map(item => renderListItem(item, indent)).join('\n');
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) return '{}';
    return entries.map(([k, v]) => renderMapEntry(k, v, indent)).join('\n');
  }
  return formatScalar(value);
}

function renderListItem(item, indent) {
  const pad = ' '.repeat(indent);
  if (item === null || item === undefined) return `${pad}- null`;
  if (Array.isArray(item)) {
    return `${pad}-\n${toYaml(item, indent + 2)}`;
  }
  if (typeof item === 'object') {
    const entries = Object.entries(item);
    if (entries.length === 0) return `${pad}- {}`;
    const [firstK, firstV] = entries[0];
    const firstLine = `${pad}- ${firstK}: ${inlineValue(firstV, indent + 2)}`;
    const rest = entries.slice(1).map(([k, v]) => renderMapEntry(k, v, indent + 2));
    return [firstLine, ...rest].join('\n');
  }
  return `${pad}- ${formatScalar(item)}`;
}

function renderMapEntry(key, value, indent) {
  const pad = ' '.repeat(indent);
  if (value === null) return `${pad}${key}: null`;
  if (Array.isArray(value)) {
    if (value.length === 0) return `${pad}${key}: []`;
    return `${pad}${key}:\n${toYaml(value, indent + 2)}`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) return `${pad}${key}: {}`;
    return `${pad}${key}:\n${entries.map(([k, v]) => renderMapEntry(k, v, indent + 2)).join('\n')}`;
  }
  return `${pad}${key}: ${formatScalar(value)}`;
}

function inlineValue(value, indent) {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return toYaml(value, indent);
  }
  if (typeof value === 'object') {
    return toYaml(value, indent);
  }
return formatScalar(value);
  }

  export function render(container) {
  const state = {
    projectName: 'myapp',
    services: []
  };

  container.innerHTML = `
    <div class="tool-layout" style="display:grid;grid-template-columns:minmax(0,1fr);gap:var(--space-4);">
      <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);">
        <div style="display:flex;flex-wrap:wrap;gap:var(--space-3);align-items:flex-end;">
          <div style="flex:1;min-width:200px;">
            <label for="dc-project" style="font-size:var(--text-sm);font-weight:600;color:var(--color-text-muted);display:block;margin-bottom:var(--space-2);">Project name</label>
            <input type="text" id="dc-project" class="text-input" value="myapp" maxlength="60" placeholder="myapp">
          </div>
          <button class="btn btn-secondary btn-sm" id="dc-clear" type="button">Clear all</button>
        </div>
        <div style="margin-top:var(--space-3);">
          <div style="font-size:var(--text-sm);font-weight:600;color:var(--color-text-muted);margin-bottom:var(--space-2);">Service palette — click to add</div>
          <div id="dc-palette" style="display:flex;flex-wrap:wrap;gap:var(--space-2);"></div>
        </div>
      </div>

      <div id="dc-services" style="display:flex;flex-direction:column;gap:var(--space-3);"></div>

      <div id="dc-empty" style="background:var(--color-surface);border:1px dashed var(--color-border);border-radius:var(--radius-md);padding:var(--space-5);text-align:center;color:var(--color-text-muted);font-size:var(--text-sm);">
        No services yet. Click a chip above to add one.
      </div>

      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);flex-wrap:wrap;gap:var(--space-2);">
          <span style="font-weight:600;font-size:var(--text-sm);color:var(--color-text-muted);">Generated docker-compose.yml</span>
          <div style="display:flex;gap:var(--space-2);">
            <button class="btn btn-secondary btn-sm" id="dc-copy" type="button">Copy</button>
            <button class="btn btn-primary btn-sm" id="dc-download" type="button">Download docker-compose.yml</button>
          </div>
        </div>
        <pre id="dc-output" style="background:#1e1e2e;color:#cdd6f4;padding:var(--space-3);border-radius:var(--radius-md);overflow-x:auto;font-size:var(--text-sm);line-height:1.6;white-space:pre-wrap;word-break:break-word;min-height:200px;font-family:monospace;max-height:560px;overflow-y:auto;margin:0;"></pre>
      </div>
    </div>
  `;

  const projectEl = container.querySelector('#dc-project');
  const paletteEl = container.querySelector('#dc-palette');
  const servicesEl = container.querySelector('#dc-services');
  const emptyEl = container.querySelector('#dc-empty');
  const outputEl = container.querySelector('#dc-output');
  const clearBtn = container.querySelector('#dc-clear');
  const copyBtn = container.querySelector('#dc-copy');
  const downloadBtn = container.querySelector('#dc-download');

  function renderPalette() {
    const entries = Object.entries(TEMPLATES);
    paletteEl.innerHTML = entries.map(([key, t]) => {
      return `<button type="button" class="dc-palette-chip" data-key="${key}" style="display:inline-flex;align-items:center;gap:var(--space-1);padding:var(--space-1) var(--space-3);background:var(--color-bg);color:var(--color-text);border:1px solid var(--color-border);border-radius:999px;font-size:var(--text-sm);cursor:pointer;transition:all 0.15s;">${t.icon} ${t.name}</button>`;
    }).join('');
  }

  function renderServices() {
    if (state.services.length === 0) {
      servicesEl.innerHTML = '';
      emptyEl.style.display = '';
      return;
    }
    emptyEl.style.display = 'none';
    servicesEl.innerHTML = state.services.map((svc, idx) => renderServiceCard(svc, idx)).join('');
  }

  function renderServiceCard(svc, idx) {
    const ports = (svc.ports || []).map((p, i) => renderListRow('ports', i, p, '80:80')).join('');
    const volumes = (svc.volumes || []).map((v, i) => renderListRow('volumes', i, v, './data:/data')).join('');
    const env = (svc.environment || []).map((e, i) => renderListRow('environment', i, e, 'KEY=VALUE')).join('');
    const deps = (svc.dependsOn || []).map((d, i) => renderListRow('dependsOn', i, d, 'other-service')).join('');
    const nets = (svc.networks || []).map((n, i) => renderListRow('networks', i, n, 'frontend')).join('');

    return `
      <div class="dc-card" data-idx="${idx}" style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-3);">
          <div style="display:flex;align-items:center;gap:var(--space-2);flex:1;min-width:200px;">
            <span style="font-size:1.4em;">${TEMPLATES[svc.templateKey]?.icon || '🧩'}</span>
            <input type="text" class="text-input dc-name" data-idx="${idx}" value="${escapeAttr(svc.name)}" placeholder="service-name" style="font-weight:600;font-size:var(--text-base);max-width:240px;">
          </div>
          <div style="display:flex;gap:var(--space-2);">
            <button type="button" class="btn btn-secondary btn-sm dc-move-up" data-idx="${idx}">↑</button>
            <button type="button" class="btn btn-secondary btn-sm dc-move-down" data-idx="${idx}">↓</button>
            <button type="button" class="btn btn-secondary btn-sm dc-remove" data-idx="${idx}">Remove</button>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:var(--space-3);">
          <div>
            <label style="font-size:var(--text-xs);font-weight:600;color:var(--color-text-muted);display:block;margin-bottom:var(--space-1);">Image</label>
            <input type="text" class="text-input dc-image" data-idx="${idx}" value="${escapeAttr(svc.image)}" placeholder="nginx:alpine">
          </div>
          <div>
            <label style="font-size:var(--text-xs);font-weight:600;color:var(--color-text-muted);display:block;margin-bottom:var(--space-1);">Command (optional)</label>
            <input type="text" class="text-input dc-cmd" data-idx="${idx}" value="${escapeAttr(svc.command)}" placeholder="server /data --console-address :9001">
          </div>
          <div>
            <label style="font-size:var(--text-xs);font-weight:600;color:var(--color-text-muted);display:block;margin-bottom:var(--space-1);">Restart policy</label>
            <select class="text-input dc-restart" data-idx="${idx}">
              <option value="no" ${svc.restart === 'no' ? 'selected' : ''}>no</option>
              <option value="always" ${svc.restart === 'always' ? 'selected' : ''}>always</option>
              <option value="on-failure" ${svc.restart === 'on-failure' ? 'selected' : ''}>on-failure</option>
              <option value="unless-stopped" ${svc.restart === 'unless-stopped' ? 'selected' : ''}>unless-stopped</option>
            </select>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:var(--space-3);margin-top:var(--space-3);">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-1);">
              <label style="font-size:var(--text-xs);font-weight:600;color:var(--color-text-muted);">Ports (host:container)</label>
              <button type="button" class="btn btn-secondary btn-sm dc-add-list" data-idx="${idx}" data-list="ports">+ Add</button>
            </div>
            <div class="dc-list" data-idx="${idx}" data-list="ports" style="display:flex;flex-direction:column;gap:var(--space-1);">${ports || '<div class="dc-list-empty" style="color:var(--color-text-muted);font-size:var(--text-xs);padding:var(--space-1) 0;">No ports</div>'}</div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-1);">
              <label style="font-size:var(--text-xs);font-weight:600;color:var(--color-text-muted);">Volumes (host:container or named:path)</label>
              <button type="button" class="btn btn-secondary btn-sm dc-add-list" data-idx="${idx}" data-list="volumes">+ Add</button>
            </div>
            <div class="dc-list" data-idx="${idx}" data-list="volumes" style="display:flex;flex-direction:column;gap:var(--space-1);">${volumes || '<div class="dc-list-empty" style="color:var(--color-text-muted);font-size:var(--text-xs);padding:var(--space-1) 0;">No volumes</div>'}</div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-1);">
              <label style="font-size:var(--text-xs);font-weight:600;color:var(--color-text-muted);">Environment (KEY=VALUE)</label>
              <button type="button" class="btn btn-secondary btn-sm dc-add-list" data-idx="${idx}" data-list="environment">+ Add</button>
            </div>
            <div class="dc-list" data-idx="${idx}" data-list="environment" style="display:flex;flex-direction:column;gap:var(--space-1);">${env || '<div class="dc-list-empty" style="color:var(--color-text-muted);font-size:var(--text-xs);padding:var(--space-1) 0;">No env vars</div>'}</div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-1);">
              <label style="font-size:var(--text-xs);font-weight:600;color:var(--color-text-muted);">Depends on (other service names)</label>
              <button type="button" class="btn btn-secondary btn-sm dc-add-list" data-idx="${idx}" data-list="dependsOn">+ Add</button>
            </div>
            <div class="dc-list" data-idx="${idx}" data-list="dependsOn" style="display:flex;flex-direction:column;gap:var(--space-1);">${deps || '<div class="dc-list-empty" style="color:var(--color-text-muted);font-size:var(--text-xs);padding:var(--space-1) 0;">No dependencies</div>'}</div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-1);">
              <label style="font-size:var(--text-xs);font-weight:600;color:var(--color-text-muted);">Networks (custom names)</label>
              <button type="button" class="btn btn-secondary btn-sm dc-add-list" data-idx="${idx}" data-list="networks">+ Add</button>
            </div>
            <div class="dc-list" data-idx="${idx}" data-list="networks" style="display:flex;flex-direction:column;gap:var(--space-1);">${nets || '<div class="dc-list-empty" style="color:var(--color-text-muted);font-size:var(--text-xs);padding:var(--space-1) 0;">Default network only</div>'}</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderListRow(listKey, i, value, placeholder) {
    return `<div class="dc-list-row" style="display:flex;gap:var(--space-1);align-items:center;">
      <input type="text" class="text-input dc-list-input" data-list="${listKey}" data-i="${i}" value="${escapeAttr(value)}" placeholder="${escapeAttr(placeholder)}" style="flex:1;font-size:var(--text-sm);">
      <button type="button" class="btn btn-secondary btn-sm dc-list-remove" data-list="${listKey}" data-i="${i}" style="padding:0 var(--space-2);">×</button>
    </div>`;
  }

  function escapeAttr(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderOutput() {
    outputEl.textContent = buildCompose(state);
  }

  function rerender() {
    renderServices();
    renderOutput();
  }

  projectEl.addEventListener('input', () => {
    state.projectName = projectEl.value;
    renderOutput();
  });

  paletteEl.addEventListener('click', e => {
    const chip = e.target.closest('.dc-palette-chip');
    if (!chip) return;
    const key = chip.dataset.key;
    const svc = defaultServiceFromTemplate(key);
    if (!svc) return;
    svc.templateKey = key;
    let name = svc.name;
    let n = 2;
    while (state.services.some(s => s.name === name)) {
      name = svc.name + n;
      n += 1;
    }
    svc.name = name;
    state.services.push(svc);
    rerender();
    showToast({ message: `Added ${TEMPLATES[key].name} service`, type: 'success' });
  });

  servicesEl.addEventListener('click', e => {
    const removeBtn = e.target.closest('.dc-remove');
    if (removeBtn) {
      const idx = parseInt(removeBtn.dataset.idx, 10);
      state.services.splice(idx, 1);
      rerender();
      return;
    }
    const upBtn = e.target.closest('.dc-move-up');
    if (upBtn) {
      const idx = parseInt(upBtn.dataset.idx, 10);
      if (idx > 0) {
        const tmp = state.services[idx];
        state.services[idx] = state.services[idx - 1];
        state.services[idx - 1] = tmp;
        rerender();
      }
      return;
    }
    const downBtn = e.target.closest('.dc-move-down');
    if (downBtn) {
      const idx = parseInt(downBtn.dataset.idx, 10);
      if (idx < state.services.length - 1) {
        const tmp = state.services[idx];
        state.services[idx] = state.services[idx + 1];
        state.services[idx + 1] = tmp;
        rerender();
      }
      return;
    }
    const addBtn = e.target.closest('.dc-add-list');
    if (addBtn) {
      const idx = parseInt(addBtn.dataset.idx, 10);
      const list = addBtn.dataset.list;
      const svc = state.services[idx];
      if (svc) {
        svc[list] = svc[list] || [];
        svc[list].push('');
        rerender();
      }
      return;
    }
    const listRm = e.target.closest('.dc-list-remove');
    if (listRm) {
      const card = listRm.closest('.dc-card');
      const idx = parseInt(card.dataset.idx, 10);
      const list = listRm.dataset.list;
      const i = parseInt(listRm.dataset.i, 10);
      const svc = state.services[idx];
      if (svc && Array.isArray(svc[list])) {
        svc[list].splice(i, 1);
        rerender();
      }
      return;
    }
  });

  servicesEl.addEventListener('input', e => {
    const card = e.target.closest('.dc-card');
    if (!card) return;
    const idx = parseInt(card.dataset.idx, 10);
    const svc = state.services[idx];
    if (!svc) return;
    if (e.target.classList.contains('dc-name')) {
      svc.name = e.target.value.trim();
      renderOutput();
      return;
    }
    if (e.target.classList.contains('dc-image')) {
      svc.image = e.target.value;
      renderOutput();
      return;
    }
    if (e.target.classList.contains('dc-cmd')) {
      svc.command = e.target.value;
      renderOutput();
      return;
    }
    if (e.target.classList.contains('dc-restart')) {
      svc.restart = e.target.value;
      renderOutput();
      return;
    }
    if (e.target.classList.contains('dc-list-input')) {
      const list = e.target.dataset.list;
      const i = parseInt(e.target.dataset.i, 10);
      svc[list][i] = e.target.value;
      renderOutput();
      return;
    }
  });

  clearBtn.addEventListener('click', () => {
    if (state.services.length === 0) return;
    if (!confirm('Remove all services?')) return;
    state.services = [];
    rerender();
    showToast({ message: 'Cleared all services', type: 'success' });
  });

  copyBtn.addEventListener('click', async () => {
    const text = buildCompose(state);
    if (!text || text.startsWith('# Add at least one service')) {
      showToast({ message: 'Add at least one service first', type: 'error' });
      return;
    }
    const ok = await copyToClipboard(text);
    showToast({ message: ok ? 'Copied docker-compose.yml' : 'Copy failed', type: ok ? 'success' : 'error' });
  });

  downloadBtn.addEventListener('click', () => {
    const text = buildCompose(state);
    if (!text || text.startsWith('# Add at least one service')) {
      showToast({ message: 'Add at least one service first', type: 'error' });
      return;
    }
    const blob = new Blob([text], { type: 'text/yaml' });
    downloadBlob(blob, 'docker-compose.yml');
    showToast({ message: 'Downloaded docker-compose.yml', type: 'success' });
  });

  renderPalette();
  renderServices();
  renderOutput();
}

export function destroy() {}
