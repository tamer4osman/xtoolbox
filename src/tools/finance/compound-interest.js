export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-header">
        <div class="tool-icon">💹</div>
        <h1>Compound Interest Calculator</h1>
        <p class="tool-description">Calculate compound interest with different compounding frequencies.</p>
      </div>
      <div class="tool-content">
        <div class="calculator-form">
          <div class="form-group">
            <label>Principal Amount ($)</label>
            <input type="number" id="principal" value="10000" min="1" />
          </div>
          <div class="form-group">
            <label>Annual Interest Rate (%)</label>
            <input type="number" id="rate" value="7" step="0.1" />
          </div>
          <div class="form-group">
            <label>Time Period (years)</label>
            <input type="number" id="years" value="10" min="1" />
          </div>
          <div class="form-group">
            <label>Compounding Frequency</label>
            <select id="frequency">
              <option value="1">Annually</option>
              <option value="2">Semi-annually</option>
              <option value="4" selected>Quarterly</option>
              <option value="12">Monthly</option>
              <option value="365">Daily</option>
            </select>
          </div>
          <button id="calc-btn" class="tool-button primary">Calculate</button>
        </div>
        <div id="result" class="result hidden">
          <div class="result-card">
            <div class="result-label">Final Amount</div>
            <div class="result-value" id="final"></div>
          </div>
          <div class="result-grid">
            <div class="result-item">
              <div class="result-label">Total Interest Earned</div>
              <div class="result-value" id="interest"></div>
            </div>
            <div class="result-item">
              <div class="result-label">Effective Rate</div>
              <div class="result-value" id="effective"></div>
            </div>
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
    .result-card { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: var(--radius-xl); padding: var(--space-8); text-align: center; margin-bottom: var(--space-4); }
    .result-label { font-size: var(--text-sm); opacity: 0.9; margin-bottom: var(--space-2); }
    .result-value { font-size: 2.5rem; font-weight: 700; }
    .result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .result-item { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); text-align: center; }
    .hidden { display: none !important; }
  `;
  container.appendChild(style);

  container.querySelector('#calc-btn').addEventListener('click', () => {
    const principal = parseFloat(container.querySelector('#principal').value);
    const rate = parseFloat(container.querySelector('#rate').value) / 100;
    const years = parseInt(container.querySelector('#years').value);
    const n = parseInt(container.querySelector('#frequency').value);
    
    const amount = principal * Math.pow(1 + rate / n, n * years);
    const interest = amount - principal;
    const effectiveRate = (Math.pow(amount / principal, 1 / years) - 1) * 100;
    
    document.getElementById('final').textContent = '$' + amount.toFixed(2);
    document.getElementById('interest').textContent = '$' + interest.toFixed(2);
    document.getElementById('effective').textContent = effectiveRate.toFixed(2) + '%';
    container.querySelector('#result').classList.remove('hidden');
  });
}
