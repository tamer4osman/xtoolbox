export const toolConfig = {
  id: 'compound-interest',
  name: 'Compound Interest Calculator',
  category: 'finance',
  description: 'Calculate compound interest growth over time.',
  icon: '💰',
  steps: ['Enter investment details', 'Calculate growth']
};

export function render(container) {
  container.innerHTML = `
    <div class="ci-container">
      <div class="ci-inputs">
        <label>Principal ($)</label><input type="number" id="ci-principal" value="10000">
        <label>Annual Rate (%)</label><input type="number" id="ci-rate" value="7">
        <label>Years</label><input type="number" id="ci-years" value="10">
        <label>Compounds per Year</label><select id="ci-compound"><option value="1">Annually</option><option value="4">Quarterly</option><option value="12" selected>Monthly</option><option value="365">Daily</option></select>
      </div>
      <button id="ci-calc">Calculate</button>
      <div class="ci-results" id="ci-results"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .ci-container { max-width: 400px; margin: 0 auto; }
    .ci-inputs { display: grid; gap: var(--space-3); margin-bottom: var(--space-4); }
    .ci-inputs label { display: block; font-size: var(--text-sm); margin-bottom: var(--space-1); }
    .ci-inputs input, .ci-inputs select { width: 100%; padding: var(--space-3); border: 1px solid #ddd; border-radius: var(--radius-md); }
    #ci-calc { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; }
    .ci-result { padding: var(--space-4); background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: var(--radius-lg); text-align: center; }
    .ci-result .amount { font-size: var(--text-4xl); font-weight: bold; }
    .ci-result .breakdown { margin-top: var(--space-3); padding-top: var(--space-3); border-top: 1px solid rgba(255,255,255,0.3); font-size: var(--text-sm); }
  `;
  container.appendChild(style);

  container.querySelector('#ci-calc').addEventListener('click', () => {
    const p = parseFloat(container.querySelector('#ci-principal').value);
    const r = parseFloat(container.querySelector('#ci-rate').value) / 100;
    const t = parseFloat(container.querySelector('#ci-years').value);
    const n = parseFloat(container.querySelector('#ci-compound').value);
    
    const a = p * Math.pow(1 + r / n, n * t);
    const interest = a - p;
    
    container.querySelector('#ci-results').innerHTML = `
      <div class="ci-result">
        <div>Future Value</div>
        <div class="amount">$${a.toLocaleString(undefined,{maximumFractionDigits:0})}</div>
        <div class="breakdown">
          <div>Principal: $${p.toLocaleString()}</div>
          <div>Interest: $${interest.toLocaleString(undefined,{maximumFractionDigits:0})}</div>
        </div>
      </div>
    `;
  });

  return container;
}
