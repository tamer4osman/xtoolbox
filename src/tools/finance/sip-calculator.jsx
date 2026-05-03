export const toolConfig = {
  id: 'sip-calculator',
  name: 'SIP Calculator',
  category: 'finance',
  description: 'Calculate returns on Systematic Investment Plans.',
  icon: '📈',
  steps: ['Enter investment details', 'Calculate returns']
};

export function render(container) {
  container.innerHTML = `
    <div class="sip-container">
      <div class="sip-inputs">
        <label>Monthly Investment ($)</label><input type="number" id="sip-monthly" value="500">
        <label>Expected Return (%/year)</label><input type="number" id="sip-return" value="12">
        <label>Investment Period (years)</label><input type="number" id="sip-years" value="10">
      </div>
      <button id="sip-calc">Calculate</button>
      <div class="sip-results" id="sip-results"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .sip-container { max-width: 400px; margin: 0 auto; }
    .sip-inputs { display: grid; gap: var(--space-3); margin-bottom: var(--space-4); }
    .sip-inputs label { display: block; font-size: var(--text-sm); margin-bottom: var(--space-1); color: var(--color-text-secondary); }
    .sip-inputs input { width: 100%; padding: var(--space-3); border: 1px solid #ddd; border-radius: var(--radius-md); }
    #sip-calc { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; }
    .sip-result { padding: var(--space-4); background: #e8f5e9; border-radius: var(--radius-lg); text-align: center; margin-bottom: var(--space-3); }
    .sip-result .amount { font-size: var(--text-3xl); font-weight: bold; color: #2e7d32; }
    .sip-result .label { font-size: var(--text-sm); color: var(--color-text-secondary); }
  `;
  container.appendChild(style);

  container.querySelector('#sip-calc').addEventListener('click', () => {
    const monthly = parseFloat(container.querySelector('#sip-monthly').value);
    const rate = parseFloat(container.querySelector('#sip-return').value) / 100 / 12;
    const years = parseFloat(container.querySelector('#sip-years').value);
    const months = years * 12;
    
    const futureValue = monthly * ((Math.pow(1 + rate, months) - 1) / rate) * (1 + rate);
    const invested = monthly * months;
    const returns = futureValue - invested;
    
    container.querySelector('#sip-results').innerHTML = `
      <div class="sip-result"><div class="label">Invested Amount</div><div class="amount">$${invested.toLocaleString()}</div></div>
      <div class="sip-result"><div class="label">Future Value</div><div class="amount">$${futureValue.toLocaleString()}</div></div>
      <div class="sip-result"><div class="label">Total Returns</div><div class="amount">$${returns.toLocaleString()}</div></div>
    `;
  });

  return container;
}
