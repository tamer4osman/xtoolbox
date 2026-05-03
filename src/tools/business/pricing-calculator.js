export function render(container) {
  container.innerHTML = `
    <div class="pricing-container">
      <h2>Pricing Calculator</h2>
      <div class="inputs">
        <input type="number" id="cost" placeholder="Cost" value="100">
        <input type="number" id="margin" placeholder="Margin %" value="30">
        <input type="number" id="tax" placeholder="Tax %" value="0">
      </div>
      <div class="results">
        <div class="result"><span>Price</span><strong id="price">$0.00</strong></div>
        <div class="result"><span>Profit</span><strong id="profit">$0.00</strong></div>
        <div class="result"><span>Tax</span><strong id="taxOut">$0.00</strong></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .pricing-container { max-width: 500px; margin: 0 auto; text-align: center; }
    .pricing-container h2 { margin-bottom: var(--space-4); }
    .inputs { display: grid; gap: var(--space-3); margin-bottom: var(--space-4); }
    .inputs input { padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-lg); text-align: center; font-size: var(--text-lg); }
    .results { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-4); }
    .result { display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--color-border); }
    .result:last-child { border: none; }
    .result strong { color: var(--color-primary); font-size: var(--text-lg); }
  `;
  container.appendChild(style);

  function calc() {
    const cost = parseFloat(container.querySelector('#cost').value) || 0;
    const margin = parseFloat(container.querySelector('#margin').value) || 0;
    const tax = parseFloat(container.querySelector('#tax').value) || 0;
    const profit = cost * margin / 100;
    const price = cost + profit + tax;
    container.querySelector('#price').textContent = '$' + price.toFixed(2);
    container.querySelector('#profit').textContent = '$' + profit.toFixed(2);
    container.querySelector('#taxOut').textContent = '$' + (cost * tax / 100).toFixed(2);
  }

  container.querySelectorAll('input').forEach(i => i.addEventListener('input', calc));
  calc();
}
