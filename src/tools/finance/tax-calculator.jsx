export const toolConfig = {
  id: 'tax-calculator',
  name: 'Income Tax Calculator',
  category: 'finance',
  description: 'Estimate income tax based on US tax brackets.',
  icon: '📋',
  steps: ['Enter income', 'View tax breakdown']
};

export function render(container) {
  container.innerHTML = `
    <div class="tax-container">
      <div class="tax-inputs">
        <label>Annual Income ($)</label><input type="number" id="tax-income" value="75000">
        <label>Filing Status</label>
        <select id="tax-status">
          <option value="single">Single</option>
          <option value="married">Married Filing Jointly</option>
          <option value="head">Head of Household</option>
        </select>
      </div>
      <button id="tax-calc">Calculate Tax</button>
      <div class="tax-results" id="tax-results"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .tax-container { max-width: 400px; margin: 0 auto; }
    .tax-inputs { display: grid; gap: var(--space-3); margin-bottom: var(--space-4); }
    .tax-inputs label { display: block; font-size: var(--text-sm); margin-bottom: var(--space-1); color: var(--color-text-secondary); }
    .tax-inputs input, .tax-inputs select { width: 100%; padding: var(--space-3); border: 1px solid #ddd; border-radius: var(--radius-md); }
    #tax-calc { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; }
    .tax-row { display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid #eee; }
    .tax-row.total { border-bottom: none; font-weight: bold; font-size: var(--text-lg); padding-top: var(--space-3); border-top: 2px solid var(--color-primary); margin-top: var(--space-2); }
  `;
  container.appendChild(style);

  const brackets = {
    single: [[11600, 0.1], [47150, 0.12], [100525, 0.22], [191950, 0.24], [243725, 0.32], [609350, 0.35], [Infinity, 0.37]],
    married: [[23200, 0.1], [94300, 0.12], [201050, 0.22], [383900, 0.24], [487450, 0.32], [731200, 0.35], [Infinity, 0.37]],
    head: [[16550, 0.1], [63100, 0.12], [100500, 0.22], [191950, 0.24], [243700, 0.32], [609350, 0.35], [Infinity, 0.37]]
  };

  container.querySelector('#tax-calc').addEventListener('click', () => {
    const income = parseFloat(container.querySelector('#tax-income').value);
    const status = container.querySelector('#tax-status').value;
    const brak = brackets[status];
    
    let tax = 0;
    let remaining = income;
    let prev = 0;
    let breakdown = '';
    
    for (const [limit, rate] of brak) {
      if (remaining <= 0) break;
      const taxable = Math.min(remaining, limit - prev);
      if (taxable > 0) {
        tax += taxable * rate;
        breakdown += `<div class="tax-row"><span>$${prev.toLocaleString()} - $${limit === Infinity ? '∞' : limit.toLocaleString()}</span><span>${(rate * 100)}% → $${(taxable * rate).toLocaleString()}</span></div>`;
      }
      remaining -= taxable;
      prev = limit;
    }
    
    const effective = (tax / income * 100).toFixed(1);
    
    container.querySelector('#tax-results').innerHTML = breakdown + 
      `<div class="tax-row total"><span>Total Tax</span><span>$${tax.toLocaleString()}</span></div>
       <div class="tax-row"><span>Effective Rate</span><span>${effective}%</span></div>
       <div class="tax-row"><span>Take Home</span><span>$${(income - tax).toLocaleString()}/yr</span></div>`;
  });

  return container;
}
