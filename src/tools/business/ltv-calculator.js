export function render(container) {
  container.innerHTML = `
    <div class="ltv-container">
      <h2>Customer LTV Calculator</h2>
      <input type="number" id="arpu" placeholder="Avg Revenue per User/mo" value="29">
      <input type="number" id="margin" placeholder="Profit Margin %" value="70">
      <input type="number" id="churn" placeholder="Churn Rate %" value="5">
      <div class="result">
        <div>LTV: <strong id="ltv">$406</strong></div>
        <div>LTV:CAC Ratio: <strong id="ratio">4.06</strong></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .ltv-container { max-width: 400px; margin: 0 auto; text-align: center; }
    .ltv-container h2 { margin-bottom: var(--space-4); }
    .ltv-container input { width: 100%; padding: var(--space-3); margin-bottom: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-lg); text-align: center; }
    .result { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); }
    .result div { margin-bottom: var(--space-2); }
    .result strong { color: var(--color-primary); font-size: var(--text-xl); }
  `;
  container.appendChild(style);

  function calc() {
    const arpu = parseFloat(container.querySelector('#arpu').value) || 0;
    const margin = parseFloat(container.querySelector('#margin').value) || 0;
    const churn = parseFloat(container.querySelector('#churn').value) || 1;
    const ltv = churn ? (arpu * margin / 100 / (churn / 100)) : 0;
    container.querySelector('#ltv').textContent = '$' + ltv.toFixed(0);
    container.querySelector('#ratio').textContent = (ltv / 100).toFixed(2);
  }
  container.querySelectorAll('input').forEach(i => i.addEventListener('input', calc));
  calc();
}
