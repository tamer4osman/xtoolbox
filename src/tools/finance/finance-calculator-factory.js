const CARD_COLORS = {
  emerald: ['#10b981', '#059669'],
  red: ['#ef4444', '#dc2626'],
  purple: ['#8b5cf6', '#7c3aed'],
  blue: ['#3b82f6', '#2563eb'],
  orange: ['#f59e0b', '#d97706'],
  cyan: ['#06b6d4', '#0891b2']
};

export function createFinanceCalculator({
  container,
  toolId,
  icon,
  title,
  description,
  formHTML = '',
  calculate,
  cardColor = 'emerald',
  resultValueSize = '2.5rem'
}) {
  if (!calculate) throw new Error('createFinanceCalculator: calculate function is required');

  const [c1, c2] = CARD_COLORS[cardColor] || CARD_COLORS.emerald;

  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-header">
        <div class="tool-icon">${icon}</div>
        <h1>${title}</h1>
        <p class="tool-description">${description}</p>
      </div>
      <div class="tool-content">
        <div class="calculator-form" id="${toolId}-form">
          ${formHTML}
          <button id="${toolId}-calc-btn" class="tool-button primary">Calculate</button>
        </div>
        <div id="${toolId}-result" class="result hidden">
          <div class="result-card">
            <div class="result-label" id="${toolId}-primary-label"></div>
            <div class="result-value" id="${toolId}-primary-value"></div>
          </div>
          <div class="result-grid" id="${toolId}-items"></div>
          <div id="${toolId}-extras"></div>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .tool-container { max-width: 600px; margin: 0 auto; }
    .tool-header { text-align: center; margin-bottom: var(--space-8); }
    .tool-icon { font-size: 3rem; margin-bottom: var(--space-3); }
    .tool-description { color: var(--color-text-secondary); }
    .calculator-form { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-6); margin-bottom: var(--space-6); }
    .form-group { margin-bottom: var(--space-4); }
    .form-group label { display: block; margin-bottom: var(--space-2); font-weight: 500; }
    .form-group input, .form-group select { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg); color: var(--color-text); }
    .tool-button.primary { width: 100%; padding: var(--space-4); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .tool-button.primary:hover { background: var(--color-primary-hover); }
    .result-card { background: linear-gradient(135deg, ${c1} 0%, ${c2} 100%); color: white; border-radius: var(--radius-xl); padding: var(--space-8); text-align: center; margin-bottom: var(--space-4); }
    .result-label { font-size: var(--text-sm); opacity: 0.9; margin-bottom: var(--space-2); }
    .result-value { font-size: ${resultValueSize}; font-weight: 700; }
    .result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-4); }
    .result-item { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); text-align: center; }
    .hidden { display: none !important; }
  `;
  container.appendChild(style);

  const form = container.querySelector(`#${toolId}-form`);
  const result = container.querySelector(`#${toolId}-result`);
  const primaryLabel = container.querySelector(`#${toolId}-primary-label`);
  const primaryValue = container.querySelector(`#${toolId}-primary-value`);
  const itemsGrid = container.querySelector(`#${toolId}-items`);
  const extrasArea = container.querySelector(`#${toolId}-extras`);
  const calcBtn = container.querySelector(`#${toolId}-calc-btn`);

  function collectValues() {
    const vals = {};
    form.querySelectorAll('input, select').forEach(el => {
      if (el.id) vals[el.id] = el.value;
    });
    return vals;
  }

  function run() {
    const out = calculate(collectValues());
    primaryLabel.textContent = out.primary?.label || '';
    primaryValue.textContent = out.primary?.value || '';
    itemsGrid.innerHTML = (out.items || []).map(item => `
      <div class="result-item">
        <div class="result-label">${item.label}</div>
        <div class="result-value">${item.value}</div>
      </div>
    `).join('');
    extrasArea.innerHTML = out.extras || '';
    result.classList.remove('hidden');
  }

  calcBtn.addEventListener('click', run);
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      run();
    }
  });
}
