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

export function buildServiceDef(svc, namedVolumes, networks) {
  const def = {};
  if (svc.image?.trim()) def.image = svc.image.trim();
  if (svc.command?.trim()) def.command = svc.command.trim();
  if (Array.isArray(svc.ports) && svc.ports.length) {
    def.ports = svc.ports.map(s => s.trim()).filter(Boolean);
  }
  if (Array.isArray(svc.volumes) && svc.volumes.length) {
    def.volumes = svc.volumes.map(s => s.trim()).filter(Boolean);
    for (const v of def.volumes) if (isNamedVolume(v)) namedVolumes.add(v.split(':')[0]);
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
  return def;
}

export function buildCompose(state) {
  const services = {};
  const namedVolumes = new Set();
  const networks = new Set();

  for (const svc of state.services) {
    const name = (svc.name || '').trim();
    if (!name) continue;
    const def = buildServiceDef(svc, namedVolumes, networks);
    services[name] = def;
  }

  const out = {};
  if (Object.keys(services).length === 0) {
    return '# Add at least one service to generate docker-compose.yml\n';
  }
  out.services = services;
  if (namedVolumes.size) {
    out.volumes = Object.fromEntries([...namedVolumes].map(v => [v, null]));
  }
  if (state.projectName?.trim()) {
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

function escapeAttr(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderListRow(listKey, i, value, placeholder) {
  return `<div class="dc-list-row" style="display:flex;gap:var(--space-1);align-items:center;">
    <input type="text" class="text-input dc-list-input" data-list="${listKey}" data-i="${i}" value="${escapeAttr(value)}" placeholder="${escapeAttr(placeholder)}" style="flex:1;font-size:var(--text-sm);">
    <button type="button" class="btn btn-secondary btn-sm dc-list-remove" data-list="${listKey}" data-i="${i}" style="padding:0 var(--space-2);">×</button>
  </div>`;
}

const DC_LIST_SECTIONS = [
  { list: 'ports', label: 'Ports (host:container)', ph: '80:80', empty: 'No ports' },
  { list: 'volumes', label: 'Volumes (host:container or named:path)', ph: './data:/data', empty: 'No volumes' },
  { list: 'environment', label: 'Environment (KEY=VALUE)', ph: 'KEY=VALUE', empty: 'No env vars' },
  { list: 'dependsOn', label: 'Depends on (other service names)', ph: 'other-service', empty: 'No dependencies' },
  { list: 'networks', label: 'Networks (custom names)', ph: 'frontend', empty: 'Default network only' }
];

function renderListSection(svc, idx, section) {
  const items = (svc[section.list] || []).map((v, i) => renderListRow(section.list, i, v, section.ph)).join('');
  return `<div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-1);">
      <label style="font-size:var(--text-xs);font-weight:600;color:var(--color-text-muted);">${section.label}</label>
      <button type="button" class="btn btn-secondary btn-sm dc-add-list" data-idx="${idx}" data-list="${section.list}">+ Add</button>
    </div>
    <div class="dc-list" data-idx="${idx}" data-list="${section.list}" style="display:flex;flex-direction:column;gap:var(--space-1);">${items || `<div class="dc-list-empty" style="color:var(--color-text-muted);font-size:var(--text-xs);padding:var(--space-1) 0;">${section.empty}</div>`}</div>
  </div>`;
}

function renderServiceCard(svc, idx) {
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
        ${DC_LIST_SECTIONS.map(s => renderListSection(svc, idx, s)).join('')}
      </div>
    </div>
  `;
}

export function render(container) {
  const state = { projectName: 'myapp', services: [] };
  container.innerHTML = DC_HTML;
  const paletteEl = container.querySelector('#dc-palette');
  const servicesEl = container.querySelector('#dc-services');
  const emptyEl = container.querySelector('#dc-empty');
  const outputEl = container.querySelector('#dc-output');
  renderPalette(paletteEl);
  bindDockerEvents(container, state, { paletteEl, servicesEl, outputEl, emptyEl });
  renderServicesList(state, servicesEl, emptyEl);
  outputEl.textContent = buildCompose(state);
}

export function destroy() {}
