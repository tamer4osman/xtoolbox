const SHARED_CSS = `
  .hc-form { background: var(--color-surface); padding: var(--space-6); border-radius: var(--radius-xl); margin-bottom: var(--space-6); }
  .form-group { margin-bottom: var(--space-4); text-align: left; }
  .form-group label { display: block; margin-bottom: var(--space-2); font-weight: 500; }
  .form-group input, .form-group select { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
  .input-group { display: flex; gap: var(--space-2); }
  .input-group input { flex: 1; }
  .input-group select { width: 80px; }
  .calc-button { width: 100%; padding: var(--space-4); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
  .calc-button.secondary { background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text); }
  .hidden { display: none; }
`;

function renderField(field) {
  if (field.type === 'custom') return field.html;
  if (field.type === 'select') {
    const opts = field.options.map(o =>
      `<option value="${o.value}"${o.selected ? ' selected' : ''}>${o.label}</option>`
    ).join('');
    return `<div class="form-group"><label>${field.label}</label><select id="${field.id}">${opts}</select></div>`;
  }
  const minAttr = field.min !== undefined ? ` min="${field.min}"` : '';
  const maxAttr = field.max !== undefined ? ` max="${field.max}"` : '';
  return `<div class="form-group"><label>${field.label}</label><input type="${field.type || 'number'}" id="${field.id}" value="${field.value ?? ''}"${minAttr}${maxAttr} /></div>`;
}

/**
 * Creates a health calculator UI: form (auto-generated from fields), calc button,
 * result panel, event binding, initial render, and shared CSS.
 *
 * @param {Object} config
 * @param {HTMLElement} config.container - DOM container
 * @param {string} config.containerClass - unique class for CSS scoping (e.g., 'bmi-container')
 * @param {Array} config.fields - field definitions: { id, label, type, value, min, max, options }
 *   type: 'number' | 'date' | 'select' | 'custom'
 *   custom fields use { type: 'custom', html: '...' } to render raw HTML
 * @param {string} [config.calcButtonLabel='Calculate'] - text for the calc button
 * @param {string} [config.extraCSS=''] - additional CSS for result panel / custom styling
 * @param {Function} config.onCalculate - (container, resultEl) => void; reads inputs, sets resultEl.innerHTML
 * @param {boolean} [config.autoCalc=true] - call onCalculate on every input change
 * @returns {{ run: Function, resultEl: HTMLElement }}
 */
export function createHealthCalculator({
  container,
  containerClass,
  fields,
  calcButtonLabel = 'Calculate',
  extraCSS = '',
  onCalculate,
  autoCalc = true
}) {
  const style = document.createElement('style');
  style.textContent = `
    .${containerClass} { max-width: 500px; margin: 0 auto; }
    ${SHARED_CSS}
    ${extraCSS}
  `;

  const formHTML = fields.map(renderField).join('');

  container.innerHTML = `
    <div class="${containerClass}">
      <div class="${containerClass}-form hc-form">
        ${formHTML}
        <button id="hc-calc-btn" class="calc-button">${calcButtonLabel}</button>
      </div>
      <div id="hc-result" class="result hidden"></div>
    </div>
  `;
  container.appendChild(style);

  const resultEl = container.querySelector('#hc-result');

  function run() {
    onCalculate(container, resultEl);
    resultEl.classList.remove('hidden');
  }

  container.querySelector('#hc-calc-btn').addEventListener('click', run);
  if (autoCalc) {
    container.querySelectorAll('input, select').forEach(el => el.addEventListener('input', run));
  }
  run();

  return { run, resultEl };
}
