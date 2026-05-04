export const toolConfig = {
  id: 'sip-calculator',
  name: 'SIP Calculator',
  category: 'finance',
  description: 'Calculate returns on Systematic Investment Plan (SIP).',
  icon: '📈',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-header">
        <div class="tool-icon">📈</div>
        <h1>SIP Calculator</h1>
        <p class="tool-description">Calculate returns on Systematic Investment Plan (SIP).</p>
      </div>
      <div class="tool-content">
        <div class="calculator-form">
          <div class="form-group">
            <label>Monthly Investment ($)</label>
            <input type="number" id="monthly" value="500" min="10" />
          </div>
          <div class="form-group">
            <label>Expected Return Rate (% per year)</label>
            <input type="number" id="rate" value="12" min="1" max="50" step="0.5" />
          </div>
          <div class="form-group">
            <label>Investment Period (years)</label>
            <input type="number" id="years" value="10" min="1" max="40" />
          </div>
          <button id="calc-btn" class="tool-button primary">Calculate Returns</button>
        </div>
        <div id="result" class="result hidden">
          <div class="result-card">
            <div class="result-label">Future Value</div>
            <div class="result-value" id="future-value"></div>
          </div>
          <div class="result-grid">
            <div class="result-item">
              <div class="result-label">Total Invested</div>
              <div class="result-value" id="invested"></div>
            </div>
            <div class="result-item">
              <div class="result-label">Total Returns</div>
              <div class="result-value" id="returns"></div>
            </div>
          </div>
          <div class="result-breakdown">
            <h3>Yearly Breakdown</h3>
            <div id="breakdown"></div>
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
    .form-group input { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .tool-button.primary { width: 100%; padding: var(--space-4); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .result-card { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; border-radius: var(--radius-xl); padding: var(--space-8); text-align: center; margin-bottom: var(--space-4); }
    .result-label { font-size: var(--text-sm); opacity: 0.9; margin-bottom: var(--space-2); }
    .result-value { font-size: 2.5rem; font-weight: 700; }
    .result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-6); }
    .result-item { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); text-align: center; }
    .result-breakdown { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); }
    .breakdown-item { display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--color-border); }
    .breakdown-item:last-child { border: none; }
    .hidden { display: none !important; }
  `;
  container.appendChild(style);

  container.querySelector('#calc-btn').addEventListener('click', () => {
    const monthly = parseFloat(container.querySelector('#monthly').value);
    const annualRate = parseFloat(container.querySelector('#rate').value) / 100 / 12;
    const years = parseInt(container.querySelector('#years').value);
    const months = years * 12;
    
    let futureValue = 0;
    let invested = 0;
    let breakdown = '';
    
    for (let y = 1; y <= years; y++) {
      let yearValue = 0;
      for (let m = 1; m <= 12; m++) {
        futureValue += monthly * (1 + annualRate);
        invested += monthly;
        yearValue += monthly * (1 + annualRate);
      }
      breakdown += '<div class="breakdown-item"><span>Year ' + y + '</span><span>$' + Math.round(futureValue).toLocaleString() + '</span></div>';
    }
    const returns = futureValue - invested;
    
    document.getElementById('future-value').textContent = '$' + Math.round(futureValue).toLocaleString();
    document.getElementById('invested').textContent = '$' + invested.toLocaleString();
    document.getElementById('returns').textContent = '$' + Math.round(returns).toLocaleString();
    document.getElementById('breakdown').innerHTML = breakdown;
    container.querySelector('#result').classList.remove('hidden');
  });
}
