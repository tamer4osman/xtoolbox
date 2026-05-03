export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-header">
        <div class="tool-icon">🏠</div>
        <h1>Mortgage Calculator</h1>
        <p class="tool-description">Calculate monthly mortgage payments and total cost.</p>
      </div>
      <div class="tool-content">
        <div class="calculator-form">
          <div class="form-group">
            <label>Home Price ($)</label>
            <input type="number" id="price" value="400000" min="10000" />
          </div>
          <div class="form-group">
            <label>Down Payment ($)</label>
            <input type="number" id="down" value="80000" min="0" />
          </div>
          <div class="form-group">
            <label>Interest Rate (% per year)</label>
            <input type="number" id="rate" value="6.5" step="0.1" />
          </div>
          <div class="form-group">
            <label>Loan Term (years)</label>
            <select id="term">
              <option value="15">15 years</option>
              <option value="20">20 years</option>
              <option value="30" selected>30 years</option>
            </select>
          </div>
          <button id="calc-btn" class="tool-button primary">Calculate</button>
        </div>
        <div id="result" class="result hidden">
          <div class="result-card">
            <div class="result-label">Monthly Payment</div>
            <div class="result-value" id="monthly"></div>
          </div>
          <div class="result-grid">
            <div class="result-item">
              <div class="result-label">Loan Amount</div>
              <div class="result-value" id="loan-amount"></div>
            </div>
            <div class="result-item">
              <div class="result-label">Total Interest</div>
              <div class="result-value" id="total-interest"></div>
            </div>
            <div class="result-item">
              <div class="result-label">Total Cost</div>
              <div class="result-value" id="total-cost"></div>
            </div>
            <div class="result-item">
              <div class="result-label">Payoff Date</div>
              <div class="result-value" id="payoff-date"></div>
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
    .result-value { font-size: 2rem; font-weight: 700; }
    .result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .result-item { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); text-align: center; }
    .hidden { display: none !important; }
  `;
  container.appendChild(style);

  container.querySelector('#calc-btn').addEventListener('click', () => {
    const price = parseFloat(container.querySelector('#price').value);
    const down = parseFloat(container.querySelector('#down').value);
    const rate = parseFloat(container.querySelector('#rate').value) / 100 / 12;
    const years = parseInt(container.querySelector('#term').value);
    const months = years * 12;
    const loan = price - down;
    
    const payment = loan * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1);
    const total = payment * months;
    const interest = total - loan;
    const payoff = new Date();
    payoff.setFullYear(payoff.getFullYear() + years);
    
    document.getElementById('monthly').textContent = '$' + payment.toFixed(0);
    document.getElementById('loan-amount').textContent = '$' + loan.toLocaleString();
    document.getElementById('total-interest').textContent = '$' + interest.toLocaleString();
    document.getElementById('total-cost').textContent = '$' + (price + interest - down).toLocaleString();
    document.getElementById('payoff-date').textContent = payoff.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    container.querySelector('#result').classList.remove('hidden');
  });
}
