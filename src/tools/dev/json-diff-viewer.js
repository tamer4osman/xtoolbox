import { escapeHtml } from '../../utils/escape-html.js';
import { downloadBlob } from '../../utils/file.js';

export const toolConfig = {
  id: 'json-diff-viewer',
  name: 'JSON Diff Viewer',
  category: 'dev',
  description: 'Compare two JSON objects side-by-side and see added, removed, and changed values.',
  icon: '🔀',
  keywords: ['json diff', 'json compare', 'json diff viewer', 'json merge', 'json patch'],
  accept: '.json',
  maxSizeMB: 5
};

export function deepDiff(a, b, path = []) {
  const changes = [];

  if (a === b) return changes;

  if (a === null || a === undefined || b === null || b === undefined || typeof a !== typeof b) {
    changes.push({ type: 'changed', path, oldValue: a, newValue: b });
    return changes;
  }

  if (typeof a !== 'object') {
    if (a !== b) changes.push({ type: 'changed', path, oldValue: a, newValue: b });
    return changes;
  }

  if (Array.isArray(a) !== Array.isArray(b)) {
    changes.push({ type: 'changed', path, oldValue: a, newValue: b });
    return changes;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  const allKeys = new Set([...keysA, ...keysB]);

  for (const key of allKeys) {
    const childPath = [...path, key];
    if (!(key in a)) {
      changes.push({ type: 'added', path: childPath, newValue: b[key] });
    } else if (!(key in b)) {
      changes.push({ type: 'removed', path: childPath, oldValue: a[key] });
    } else {
      changes.push(...deepDiff(a[key], b[key], childPath));
    }
  }

  return changes;
}

export function pathToString(path) {
  return path.map((p, i) => {
    if (/^\d+$/.test(p)) return `[${p}]`;
    if (i === 0) return p;
    return /^\d+$/.test(p) ? `[${p}]` : `.${p}`;
  }).join('');
}

function formatValue(v, indent) {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (typeof v === 'string') return `"${v}"`;
  if (typeof v === 'object') return JSON.stringify(v, null, indent);
  return String(v);
}

export function buildPatch(changes) {
  return changes.map(c => {
    const path = '/' + c.path.join('/');
    if (c.type === 'added') return { op: 'add', path, value: c.newValue };
    if (c.type === 'removed') return { op: 'remove', path };
    return { op: 'replace', path, value: c.newValue };
  });
}

function renderJsonSide(obj, diffs, side) {
  if (obj === null || obj === undefined) return '<span class="jdv-empty">null</span>';
  const lines = JSON.stringify(obj, null, 2).split('\n');
  const pathMap = new Map();
  for (const d of diffs) {
    if (d.type === (side === 'a' ? 'removed' : 'added') || d.type === 'changed') {
      pathMap.set(pathToString(d.path), d.type);
    }
  }

  let depth = 0;
  const result = [];
  for (const line of lines) {
    const trimmed = line.trimStart();
    const depthChange = line.length - line.trimStart().length;
    depth = depthChange / 2;

    let className = '';
    for (const [p, type] of pathMap) {
      const segments = p.split(/[.[\]]+/).filter(Boolean);
      const key = segments[segments.length - 1];
      if (trimmed.startsWith(`"${key}"`)) {
        if (type === 'added' && side === 'b') className = 'jdv-added';
        else if (type === 'removed' && side === 'a') className = 'jdv-removed';
        else if (type === 'changed') className = 'jdv-changed';
        break;
      }
    }

    result.push(`<span class="${className}">${escapeHtml(line)}</span>`);
  }
  return result.join('\n');
}

function renderSummary(changes) {
  const added = changes.filter(c => c.type === 'added').length;
  const removed = changes.filter(c => c.type === 'removed').length;
  const changed = changes.filter(c => c.type === 'changed').length;
  const parts = [];
  if (changed) parts.push(`${changed} changed`);
  if (added) parts.push(`${added} added`);
  if (removed) parts.push(`${removed} removed`);
  return parts.length ? parts.join(' · ') : 'No differences found';
}

export function render(container) {
  container.innerHTML = `
    <div class="jdv-container">
      <h2>JSON Diff Viewer</h2>
      <div class="jdv-panels">
        <div class="jdv-panel">
          <label>JSON A</label>
          <textarea id="jdv-left" class="jdv-textarea" placeholder='Paste first JSON here...'></textarea>
          <input type="file" id="jdv-file-a" accept=".json" hidden />
          <button class="btn btn-sm btn-ghost" id="jdv-upload-a">Upload .json</button>
        </div>
        <div class="jdv-panel">
          <label>JSON B</label>
          <textarea id="jdv-right" class="jdv-textarea" placeholder='Paste second JSON here...'></textarea>
          <input type="file" id="jdv-file-b" accept=".json" hidden />
          <button class="btn btn-sm btn-ghost" id="jdv-upload-b">Upload .json</button>
        </div>
      </div>
      <div class="jdv-actions">
        <button id="jdv-compare" class="btn btn-primary">Compare</button>
        <button id="jdv-swap" class="btn btn-secondary">Swap A ↔ B</button>
        <button id="jdv-clear" class="btn btn-ghost">Clear</button>
      </div>
      <div id="jdv-summary" class="jdv-summary"></div>
      <div class="jdv-output-panels">
        <div class="jdv-output-panel" id="jdv-output-a"></div>
        <div class="jdv-output-panel" id="jdv-output-b"></div>
      </div>
      <div class="jdv-export" id="jdv-export" style="display:none">
        <button id="jdv-copy-patch" class="btn btn-secondary">Copy Patch</button>
        <button id="jdv-download-patch" class="btn btn-secondary">Download Patch</button>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .jdv-container { max-width: 1200px; margin: 0 auto; }
    .jdv-container h2 { text-align: center; margin-bottom: var(--space-6); }
    .jdv-panels { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .jdv-panel label { display: block; font-weight: 600; margin-bottom: var(--space-2); color: var(--color-text-secondary); }
    .jdv-textarea {
      width: 100%; height: 300px; padding: var(--space-4); border: 2px solid var(--color-border);
      border-radius: var(--radius-xl); background: var(--color-surface); font-family: 'Fira Code', monospace;
      font-size: var(--text-sm); resize: vertical; box-sizing: border-box;
    }
    .jdv-textarea:focus { outline: none; border-color: var(--color-primary); }
    .jdv-actions { display: flex; gap: var(--space-3); margin: var(--space-4) 0; justify-content: center; }
    .jdv-summary {
      text-align: center; padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg);
      font-weight: 600; margin-bottom: var(--space-4); display: none;
    }
    .jdv-summary.has-changes { display: block; background: #fef3c7; color: #92400e; }
    .jdv-summary.no-changes { display: block; background: #dcfce7; color: #166534; }
    .jdv-output-panels { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .jdv-output-panel {
      padding: var(--space-4); border: 2px solid var(--color-border); border-radius: var(--radius-xl);
      background: var(--color-surface); font-family: 'Fira Code', monospace; font-size: var(--text-sm);
      overflow: auto; max-height: 400px; white-space: pre; line-height: 1.6;
    }
    .jdv-added { background: #dcfce7; color: #166534; display: block; }
    .jdv-removed { background: #fee2e2; color: #991b1b; display: block; }
    .jdv-changed { background: #fef3c7; color: #92400e; display: block; }
    .jdv-empty { color: var(--color-text-muted); font-style: italic; }
    .jdv-export { display: flex; gap: var(--space-3); justify-content: center; margin-top: var(--space-4); }
    @media (max-width: 768px) {
      .jdv-panels, .jdv-output-panels { grid-template-columns: 1fr; }
    }
  `;
  container.appendChild(style);

  const leftInput = container.querySelector('#jdv-left');
  const rightInput = container.querySelector('#jdv-right');
  const outputA = container.querySelector('#jdv-output-a');
  const outputB = container.querySelector('#jdv-output-b');
  const summary = container.querySelector('#jdv-summary');
  const exportDiv = container.querySelector('#jdv-export');
  let currentPatch = [];

  function readFileAsJson(file, textarea) {
    const reader = new FileReader();
    reader.onload = (e) => { textarea.value = e.target.result; };
    reader.readAsText(file);
  }

  container.querySelector('#jdv-upload-a').addEventListener('click', () => {
    container.querySelector('#jdv-file-a').click();
  });
  container.querySelector('#jdv-file-b').addEventListener('click', () => {
    container.querySelector('#jdv-file-b').click();
  });
  container.querySelector('#jdv-file-a').addEventListener('change', (e) => {
    if (e.target.files[0]) readFileAsJson(e.target.files[0], leftInput);
  });
  container.querySelector('#jdv-file-b').addEventListener('change', (e) => {
    if (e.target.files[0]) readFileAsJson(e.target.files[0], rightInput);
  });

  container.querySelector('#jdv-compare').addEventListener('click', () => {
    let objA, objB;
    try {
      objA = JSON.parse(leftInput.value);
    } catch {
      summary.className = 'jdv-summary has-changes';
      summary.textContent = 'JSON A is invalid';
      outputA.innerHTML = '<span class="jdv-removed">Invalid JSON</span>';
      outputB.innerHTML = '';
      exportDiv.style.display = 'none';
      return;
    }
    try {
      objB = JSON.parse(rightInput.value);
    } catch {
      summary.className = 'jdv-summary has-changes';
      summary.textContent = 'JSON B is invalid';
      outputA.innerHTML = '';
      outputB.innerHTML = '<span class="jdv-removed">Invalid JSON</span>';
      exportDiv.style.display = 'none';
      return;
    }

    const changes = deepDiff(objA, objB);
    currentPatch = buildPatch(changes);

    summary.className = changes.length ? 'jdv-summary has-changes' : 'jdv-summary no-changes';
    summary.textContent = renderSummary(changes);

    outputA.innerHTML = renderJsonSide(objA, changes, 'a');
    outputB.innerHTML = renderJsonSide(objB, changes, 'b');

    exportDiv.style.display = changes.length ? 'flex' : 'none';
  });

  container.querySelector('#jdv-swap').addEventListener('click', () => {
    const tmp = leftInput.value;
    leftInput.value = rightInput.value;
    rightInput.value = tmp;
  });

  container.querySelector('#jdv-clear').addEventListener('click', () => {
    leftInput.value = '';
    rightInput.value = '';
    outputA.innerHTML = '';
    outputB.innerHTML = '';
    summary.className = 'jdv-summary';
    summary.textContent = '';
    exportDiv.style.display = 'none';
    currentPatch = [];
  });

  container.querySelector('#jdv-copy-patch').addEventListener('click', () => {
    const patchStr = JSON.stringify(currentPatch, null, 2);
    navigator.clipboard.writeText(patchStr).catch(() => {});
  });

  container.querySelector('#jdv-download-patch').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(currentPatch, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'json-patch.json');
  });
}
