export const toolConfig = {
  id: 'profit-margin',
  name: 'Profit Margin Calculator',
  category: 'business',
  description: 'Calculate gross and net profit margins.',
  icon: '💵',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="margin-container">
      <h2>Profit Margin Calculator</h2>
      <input type="number" id="revenue" placeholder="Revenue" value="1000">
      <input type="number" id="cogs" placeholder="Cost of Goods Sold" value="600">
      <div class="result">
        <div>Gross Profit: <strong id="gross">$400</strong></div>
        <div>Gross Margin: <strong id="gm">40%</strong></div>
        <div>Net Margin: <strong id="nm">40%</strong></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .margin-container { max-width: 400px; margin: 0 auto; text-align: center; }
    .margin-container h2 { margin-bottom: var(--space-4); }
    .margin-container input { width: 100%; padding: var(--space-3); margin-bottom: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-lg); text-align: center; }
    .result { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); }
    .result div { margin-bottom: var(--space-2); }
    .result strong { color: var(--color-primary); font-size: var(--text-xl); }
  `;
  container.appendChild(style);

  function calc() {
    const rev = parseFloat(container.querySelector('#revenue').value) || 0;
    const cogs = parseFloat(container.querySelector('#cogs').value) || 0;
    const gross = rev - cogs;
    const gm = rev ? (gross / rev * 100) : 0;
    container.querySelector('#gross').textContent = '$' + gross;
    container.querySelector('#gm').textContent = gm.toFixed(1) + '%';
    container.querySelector('#nm').textContent = gm.toFixed(1) + '%';
  }
  container.querySelectorAll('input').forEach(i => i.addEventListener('input', calc));
  calc();
}
