export const toolConfig = {
  id: 'discount-calculator',
  name: 'Discount Calculator',
  category: 'business',
  description: 'Calculate savings and final price after discounts.',
  icon: '💰',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="discount-container">
      <h2>Discount Calculator</h2>
      <input type="number" id="price" placeholder="Original Price" value="100">
      <input type="number" id="percent" placeholder="Discount %" value="20">
      <div class="result">
        <div>Final Price: <strong id="final">$80.00</strong></div>
        <div>You Save: <strong id="save">$20.00</strong></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .discount-container { max-width: 400px; margin: 0 auto; text-align: center; }
    .discount-container h2 { margin-bottom: var(--space-4); }
    .discount-container input { width: 100%; padding: var(--space-3); margin-bottom: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-lg); text-align: center; font-size: var(--text-lg); }
    .result { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); }
    .result div { margin-bottom: var(--space-2); }
    .result strong { color: var(--color-primary); font-size: var(--text-xl); }
  `;
  container.appendChild(style);

  function calc() {
    const price = parseFloat(container.querySelector('#price').value) || 0;
    const percent = parseFloat(container.querySelector('#percent').value) || 0;
    const saved = price * percent / 100;
    container.querySelector('#final').textContent = '$' + (price - saved).toFixed(2);
    container.querySelector('#save').textContent = '$' + saved.toFixed(2);
  }
  container.querySelectorAll('input').forEach(i => i.addEventListener('input', calc));
  calc();
}
