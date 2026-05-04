export const toolConfig = {
  id: 'churn-calculator',
  name: 'Churn Rate Calculator',
  category: 'business',
  description: 'Calculate customer churn rate and retention.',
  icon: '📉',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="churn-container">
      <h2>Churn Calculator</h2>
      <input type="number" id="customers" placeholder="Total Customers" value="1000">
      <input type="number" id="lost" placeholder="Customers Lost" value="50">
      <input type="number" id="revenue" placeholder="Monthly Revenue" value="50000">
      <div class="result">
        <div>Churn Rate: <strong id="rate">5%</strong></div>
        <div>Monthly Lost Revenue: <strong id="lostRev">$2500</strong></div>
        <div>Annual Lost Revenue: <strong id="annualRev">$30000</strong></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .churn-container { max-width: 400px; margin: 0 auto; text-align: center; }
    .churn-container h2 { margin-bottom: var(--space-4); }
    .churn-container input { width: 100%; padding: var(--space-3); margin-bottom: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-lg); text-align: center; }
    .result { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); }
    .result div { margin-bottom: var(--space-2); }
    .result strong { color: var(--color-primary); font-size: var(--text-xl); }
  `;
  container.appendChild(style);

  function calc() {
    const total = parseFloat(container.querySelector('#customers').value) || 0;
    const lost = parseFloat(container.querySelector('#lost').value) || 0;
    const rev = parseFloat(container.querySelector('#rev').value) || 0;
    const rate = total ? (lost / total * 100) : 0;
    const lostRev = rev * rate / 100;
    container.querySelector('#rate').textContent = rate.toFixed(1) + '%';
    container.querySelector('#lostRev').textContent = '$' + lostRev.toFixed(0);
    container.querySelector('#annualRev').textContent = '$' + (lostRev * 12).toFixed(0);
  }
  container.querySelectorAll('input').forEach(i => i.addEventListener('input', calc));
  calc();
}
