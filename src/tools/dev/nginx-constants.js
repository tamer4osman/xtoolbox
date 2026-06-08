export const NGX_CSS = `
    .ngx-shell { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--space-4); }
    @media (max-width: 980px) { .ngx-shell { grid-template-columns: 1fr; } }
    .ngx-pane { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-4); }
    .ngx-controls { max-height: 78vh; overflow-y: auto; }
    .ngx-section { padding: var(--space-3) 0; border-bottom: 1px dashed var(--color-border); }
    .ngx-section:last-child { border-bottom: 0; }
    .ngx-section h3 { font-size: var(--text-sm); font-weight: 600; margin: 0 0 var(--space-2); color: var(--color-text); }
    .ngx-section h4 { font-size: var(--text-xs); font-weight: 600; margin: var(--space-3) 0 var(--space-2); color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
    .ngx-checks { display: flex; flex-direction: column; gap: var(--space-1); margin-bottom: var(--space-2); }
    .ngx-check { display: flex; align-items: flex-start; gap: var(--space-2); cursor: pointer; font-size: var(--text-sm); padding: 2px 0; }
    .ngx-check input { margin-top: 3px; }
    .ngx-check .ngx-hint { color: var(--color-text-muted); font-size: var(--text-xs); margin-left: 4px; }
    .ngx-hint { display: block; color: var(--color-text-muted); font-size: var(--text-xs); margin-top: var(--space-1); }
    .ngx-hint code { background: var(--color-bg); padding: 1px 4px; border-radius: var(--radius-sm); }
    .ngx-area { font-family: monospace; min-height: 64px; resize: vertical; }
    .ngx-output { display: flex; flex-direction: column; }
    .ngx-output-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3); gap: var(--space-2); flex-wrap: wrap; }
    .ngx-meta { display: flex; gap: var(--space-2); }
    .ngx-badge { font-size: var(--text-xs); padding: 2px 8px; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-full); color: var(--color-text-secondary); }
    .ngx-badge-soft { background: transparent; }
    .ngx-actions { display: flex; gap: var(--space-2); }
    .ngx-code { flex: 1; background: #1e1e2e; color: #cdd6f4; padding: var(--space-4); border-radius: var(--radius-md); font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: var(--text-xs); line-height: 1.55; overflow: auto; white-space: pre; max-height: 70vh; margin: 0; }
    .ngx-foot { margin-top: var(--space-3); color: var(--color-text-muted); }
    .ngx-foot code { background: var(--color-bg); padding: 1px 4px; border-radius: var(--radius-sm); }
`;

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function fieldHtml(id, label, state, fields, areaFields, placeholder) {
  const def = state[id] !== undefined ? state[id] : '';
  if (areaFields.has(id)) {
    return `
        <div class="form-group">
          <label for="ngx-${id}">${label}</label>
          <textarea id="ngx-${id}" class="text-input ngx-field ngx-area" data-field="${id}" rows="3" spellcheck="false" placeholder="${placeholder || ''}">${escapeHtml(String(def ?? ''))}</textarea>
        </div>`;
  }
  const inputType = fields.find(f => f.id === id)?.type || 'text';
  return `
        <div class="form-group">
          <label for="ngx-${id}">${label}</label>
          <input id="ngx-${id}" type="${inputType}" class="text-input ngx-field" data-field="${id}" value="${escapeHtml(String(def ?? ''))}" placeholder="${placeholder || ''}">
        </div>`;
}

export function selectHtml(id, label, options, state) {
  const value = state[id];
  return `
        <div class="form-group">
          <label for="ngx-${id}">${label}</label>
          <select id="ngx-${id}" class="text-input ngx-field" data-field="${id}">
            ${options.map(o => `<option value="${escapeHtml(o.value)}"${o.value === value ? ' selected' : ''}>${escapeHtml(o.label)}</option>`).join('')}
          </select>
        </div>`;
}

export function checkHtml(id, label, state, hint) {
  const checked = state[id];
  return `
        <label class="ngx-check">
          <input type="checkbox" id="ngx-${id}" class="ngx-toggle" data-field="${id}"${checked ? ' checked' : ''}>
          <span>${label}</span>
          ${hint ? `<small class="ngx-hint">${hint}</small>` : ''}
        </label>`;
}
