export const toolConfig = {
  id: 'break-even',
  name: 'Break-Even Calculator',
  category: 'business',
  description: 'Calculate the break-even point for your business.',
  icon: '📈',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="breakeven-container">
      <h2>Break-Even Calculator</h2>
      <input type="number" id="fixed" placeholder="Fixed Costs" value="10000">
      <input type="number" id="price" placeholder="Price per Unit" value="50">
      <input type="number" id="variable" placeholder="Variable Cost per Unit" value="30">
      <div class="result">
        <div>Break-Even Units: <strong id="units">500</strong></div>
        <div>Break-Even Revenue: <strong id="revenue">$25000</strong></div>
        <div>Contribution Margin: <strong id="margin">$20</strong></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .breakeven-container { max-width: 400px; margin: 0 auto; text-align: center; }
    .breakeven-container h2 { margin-bottom: var(--space-4); }
    .breakeven-container input { width: 100%; padding: var(--space-3); margin-bottom: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-lg); text-align: center; }
    .result { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); }
    .result div { margin-bottom: var(--space-2); }
    .result strong { color: var(--color-primary); font-size: var(--text-xl); }
  `;
  container.appendChild(style);

  function calc() {
    const fixed = parseFloat(container.querySelector('#fixed').value) || 0;
    const price = parseFloat(container.querySelector('#price').value) || 1;
    const variable = parseFloat(container.querySelector('#variable').value) || 0;
    const margin = price - variable;
    const units = margin > 0 ? Math.ceil(fixed / margin) : 0;
    container.querySelector('#units').textContent = units;
    container.querySelector('#revenue').textContent = '$' + (units * price).toLocaleString();
    container.querySelector('#margin').textContent = '$' + margin;
  }
  container.querySelectorAll('input').forEach(i => i.addEventListener('input', calc));
  calc();
}
