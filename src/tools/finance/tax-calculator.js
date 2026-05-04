export const toolConfig = {
  id: 'tax-calculator',
  name: 'Tax Estimator',
  category: 'finance',
  description: 'Estimate income tax based on income and deductions.',
  icon: '🧾',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-header">
        <div class="tool-icon">🧾</div>
        <h1>Tax Estimator</h1>
        <p class="tool-description">Estimate income tax based on income and deductions.</p>
      </div>
      <div class="tool-content">
        <div class="calculator-form">
          <div class="form-group">
            <label>Annual Income ($)</label>
            <input type="number" id="income" value="75000" min="0" />
          </div>
          <div class="form-group">
            <label>Filing Status</label>
            <select id="status">
              <option value="single" selected>Single</option>
              <option value="married">Married Filing Jointly</option>
              <option value="head">Head of Household</option>
            </select>
          </div>
          <div class="form-group">
            <label>Standard Deduction</label>
            <input type="number" id="deduction" value="14600" />
          </div>
          <button id="calc-btn" class="tool-button primary">Calculate Tax</button>
        </div>
        <div id="result" class="result hidden">
          <div class="result-grid">
            <div class="result-item">
              <div class="result-label">Taxable Income</div>
              <div class="result-value" id="taxable"></div>
            </div>
            <div class="result-item">
              <div class="result-label">Estimated Tax</div>
              <div class="result-value" id="tax"></div>
            </div>
            <div class="result-item">
              <div class="result-label">Effective Rate</div>
              <div class="result-value" id="rate"></div>
            </div>
            <div class="result-item">
              <div class="result-label">Take Home</div>
              <div class="result-value" id="take-home"></div>
            </div>
          </div>
          <div class="tax-brackets">
            <h3>US Federal Tax Brackets 2024</h3>
            <div id="brackets"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .tool-container { max-width: 600px; margin: 0 auto; }
    .tool-header { text-align: center; margin-bottom: var(--space-8); }
    .calculator-form { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-6); margin-bottom: var(--space-6); }
    .form-group { margin-bottom: var(--space-4); }
    .form-group label { display: block; margin-bottom: var(--space-2); font-weight: 500; }
    .form-group input, .form-group select { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .tool-button.primary { width: 100%; padding: var(--space-4); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-6); }
    .result-item { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); text-align: center; }
    .result-label { font-size: var(--text-sm); color: var(--color-text-secondary); margin-bottom: var(--space-1); }
    .result-value { font-size: var(--text-xl); font-weight: 700; }
    .tax-brackets { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); }
    .bracket-item { display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--color-border); font-size: var(--text-sm); }
    .bracket-item:last-child { border: none; }
    .hidden { display: none !important; }
  `;
  container.appendChild(style);

  const brackets = [
    { rate: 10, min: 0, max: 11600 },
    { rate: 12, min: 11600, max: 47150 },
    { rate: 22, min: 47150, max: 100525 },
    { rate: 24, min: 100525, max: 191950 },
    { rate: 32, min: 191950, max: 243725 },
    { rate: 35, min: 243725, max: 609350 },
    { rate: 37, min: 609350, max: Infinity }
  ];

  container.querySelector('#calc-btn').addEventListener('click', () => {
    const income = parseFloat(container.querySelector('#income').value);
    const deduction = parseFloat(container.querySelector('#deduction').value);
    const taxable = Math.max(0, income - deduction);
    
    let tax = 0;
    let bracketText = '';
    for (const b of brackets) {
      if (taxable > b.min) {
        const taxableInBracket = Math.min(taxable, b.max) - b.min;
        tax += taxableInBracket * b.rate / 100;
        bracketText += '<div class="bracket-item"><span>' + b.rate + '% bracket</span><span>$' + taxableInBracket.toLocaleString() + '</span></div>';
      }
    }
    
    const effectiveRate = (tax / income * 100) || 0;
    
    document.getElementById('taxable').textContent = '$' + taxable.toLocaleString();
    document.getElementById('tax').textContent = '$' + tax.toFixed(0);
    document.getElementById('rate').textContent = effectiveRate.toFixed(1) + '%';
    document.getElementById('take-home').textContent = '$' + (income - tax).toLocaleString();
    document.getElementById('brackets').innerHTML = bracketText;
    container.querySelector('#result').classList.remove('hidden');
  });
}
