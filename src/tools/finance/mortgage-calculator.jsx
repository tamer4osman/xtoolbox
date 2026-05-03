export const toolConfig = {
  id: 'mortgage-calculator',
  name: 'Mortgage Calculator',
  category: 'finance',
  description: 'Calculate monthly mortgage payments with PMI and taxes.',
  icon: '🏠',
  steps: ['Enter loan details', 'Calculate']
};

export function render(container) {
  container.innerHTML = `
    <div class="mortgage-container">
      <div class="mortgage-inputs">
        <label>Home Price ($)</label><input type="number" id="home-price" value="300000">
        <label>Down Payment ($)</label><input type="number" id="down-payment" value="60000">
        <label>Interest Rate (%)</label><input type="number" id="mortgage-rate" value="6.5" step="0.1">
        <label>Loan Term (years)</label><select id="mortgage-term"><option value="15">15 years</option><option value="20">20 years</option><option value="30" selected>30 years</option></select>
        <label>Property Tax ($/year)</label><input type="number" id="tax" value="3000">
        <label>Insurance ($/year)</label><input type="number" id="insurance" value="1200">
      </div>
      <button id="mortgage-calc">Calculate</button>
      <div class="mortgage-results" id="mortgage-results"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .mortgage-container { max-width: 400px; margin: 0 auto; }
    .mortgage-inputs { display: grid; gap: var(--space-3); margin-bottom: var(--space-4); }
    .mortgage-inputs label { display: block; font-size: var(--text-sm); margin-bottom: var(--space-1); color: var(--color-text-secondary); }
    .mortgage-inputs input, .mortgage-inputs select { width: 100%; padding: var(--space-3); border: 1px solid #ddd; border-radius: var(--radius-md); }
    #mortgage-calc { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; }
    .mortgage-results .result-box { padding: var(--space-3); background: #f5f5f5; border-radius: var(--radius-md); margin-bottom: var(--space-2); }
    .mortgage-results .result-label { font-size: var(--text-xs); color: var(--color-text-secondary); }
    .mortgage-results .result-value { font-size: var(--text-xl); font-weight: bold; }
    .result-total { background: #e3f2fd !important; }
  `;
  container.appendChild(style);

  container.querySelector('#mortgage-calc').addEventListener('click', () => {
    const price = parseFloat(container.querySelector('#home-price').value);
    const down = parseFloat(container.querySelector('#down-payment').value);
    const rate = parseFloat(container.querySelector('#mortgage-rate').value) / 100 / 12;
    const years = parseFloat(container.querySelector('#mortgage-term').value);
    const tax = parseFloat(container.querySelector('#tax').value) / 12;
    const ins = parseFloat(container.querySelector('#insurance').value) / 12;
    
    const loan = price - down;
    const months = years * 12;
    const monthly = loan * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1);
    const total = monthly + tax + ins;
    
    container.querySelector('#mortgage-results').innerHTML = `
      <div class="result-box"><div class="result-label">Principal & Interest</div><div class="result-value">$${monthly.toFixed(0)}/mo</div></div>
      <div class="result-box"><div class="result-label">Property Tax</div><div class="result-value">$${tax.toFixed(0)}/mo</div></div>
      <div class="result-box"><div class="result-box"><div class="result-label">Insurance</div><div class="result-value">$${ins.toFixed(0)}/mo</div></div>
      <div class="result-box result-total"><div class="result-label">Total Monthly</div><div class="result-value">$${total.toFixed(0)}/mo</div></div>
    `;
  });

  return container;
}
