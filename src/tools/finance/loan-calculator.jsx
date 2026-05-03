export const toolConfig = {
  id: 'loan-calculator',
  name: 'Loan Calculator',
  category: 'finance',
  description: 'Calculate monthly payments and total interest for loans.',
  icon: '🏦',
  steps: ['Enter loan details', 'Calculate']
};

export function render(container) {
  container.innerHTML = `
    <div class="loan-container">
      <div class="loan-inputs">
        <div class="loan-group">
          <label>Loan Amount ($)</label>
          <input type="number" id="loan-amount" value="10000">
        </div>
        <div class="loan-group">
          <label>Interest Rate (% per year)</label>
          <input type="number" id="loan-rate" value="5" step="0.1">
        </div>
        <div class="loan-group">
          <label>Loan Term (years)</label>
          <input type="number" id="loan-term" value="5">
        </div>
      </div>
      <button id="loan-calc">Calculate</button>
      <div class="loan-results" id="loan-results"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .loan-container { max-width: 400px; margin: 0 auto; }
    .loan-inputs { display: grid; gap: var(--space-3); margin-bottom: var(--space-4); }
    .loan-group label { display: block; font-size: var(--text-sm); margin-bottom: var(--space-1); color: var(--color-text-secondary); }
    .loan-group input { width: 100%; padding: var(--space-3); border: 1px solid #ddd; border-radius: var(--radius-md); font-size: var(--text-base); }
    #loan-calc { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; font-size: var(--text-base); margin-bottom: var(--space-4); }
    .loan-result { padding: var(--space-4); background: #f5f5f5; border-radius: var(--radius-lg); margin-bottom: var(--space-3); }
    .loan-result-label { font-size: var(--text-sm); color: var(--color-text-secondary); }
    .loan-result-value { font-size: var(--text-2xl); font-weight: bold; color: var(--color-primary); }
  `;
  container.appendChild(style);

  container.querySelector('#loan-calc').addEventListener('click', () => {
    const principal = parseFloat(container.querySelector('#loan-amount').value);
    const rate = parseFloat(container.querySelector('#loan-rate').value) / 100 / 12;
    const months = parseFloat(container.querySelector('#loan-term').value) * 12;
    
    if (!principal || !rate || !months) return;
    
    const monthly = principal * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1);
    const total = monthly * months;
    const interest = total - principal;
    
    container.querySelector('#loan-results').innerHTML = `
      <div class="loan-result"><div class="loan-result-label">Monthly Payment</div><div class="loan-result-value">$${monthly.toFixed(2)}</div></div>
      <div class="loan-result"><div class="loan-result-label">Total Interest</div><div class="loan-result-value">$${interest.toFixed(2)}</div></div>
      <div class="loan-result"><div class="loan-result-label">Total Cost</div><div class="loan-result-value">$${total.toFixed(2)}</div></div>
    `;
  });

  return container;
}
