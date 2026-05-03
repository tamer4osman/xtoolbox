export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-content">
        <div class="calculator-form">
          <div class="form-group">
            <label>Loan Amount ($)</label>
            <input type="number" id="amount" value="100000" min="1000" />
          </div>
          <div class="form-group">
            <label>Interest Rate (% per year)</label>
            <input type="number" id="rate" value="8.5" min="0.1" step="0.1" />
          </div>
          <div class="form-group">
            <label>Loan Term (years)</label>
            <input type="number" id="years" value="20" min="1" max="50" />
          </div>
          <button id="calculate-btn" class="tool-button primary">Calculate</button>
        </div>
        <div id="result" class="result hidden">
          <div class="result-card">
            <div class="result-label">Monthly EMI</div>
            <div class="result-value" id="emi"></div>
          </div>
          <div class="result-grid">
            <div class="result-item">
              <div class="result-label">Total Interest</div>
              <div class="result-value" id="total-interest"></div>
            </div>
            <div class="result-item">
              <div class="result-label">Total Payment</div>
              <div class="result-value" id="total-payment"></div>
            </div>
          </div>
          <div class="schedule-section">
            <h3>Amortization Schedule</h3>
            <div id="schedule"></div>
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
    .result-card { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: var(--radius-xl); padding: var(--space-8); text-align: center; margin-bottom: var(--space-4); }
    .result-label { font-size: var(--text-sm); opacity: 0.9; margin-bottom: var(--space-2); }
    .result-value { font-size: 2.5rem; font-weight: 700; }
    .result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-6); }
    .result-item { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); text-align: center; }
    .schedule-section { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); }
    .schedule-section h3 { margin-bottom: var(--space-4); }
    .schedule-item { display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--color-border); font-size: var(--text-sm); }
    .schedule-item:last-child { border: none; }
    .hidden { display: none !important; }
  `;
  container.appendChild(style);

  const calcBtn = container.querySelector('#calculate-btn');
  
  calcBtn.addEventListener('click', () => {
    const principal = parseFloat(container.querySelector('#amount').value);
    const rate = parseFloat(container.querySelector('#rate').value) / 12 / 100;
    const years = parseInt(container.querySelector('#years').value);
    const months = years * 12;
    
    const emi = principal * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;
    
    document.getElementById('emi').textContent = '$' + emi.toFixed(2);
    document.getElementById('total-interest').textContent = '$' + totalInterest.toFixed(2);
    document.getElementById('total-payment').textContent = '$' + totalPayment.toFixed(2);
    
    let schedule = '';
    let balance = principal;
    for (let i = 1; i <= 12; i++) {
      const interest = balance * rate;
      const principalPaid = emi - interest;
      balance -= principalPaid;
      schedule += '<div class="schedule-item"><span>Month ' + i + '</span><span>Principal: $' + principalPaid.toFixed(0) + ', Interest: $' + interest.toFixed(0) + '</span></div>';
    }
    document.getElementById('schedule').innerHTML = schedule;
    container.querySelector('#result').classList.remove('hidden');
  });

}
