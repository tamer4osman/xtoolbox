export const toolConfig = {
  id: 'revenue-forecast',
  name: 'Revenue Forecaster',
  category: 'business',
  description: 'Project future revenue based on growth rates.',
  icon: '📊',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="forecast-container">
      <h2>Revenue Forecast</h2>
      <input type="number" id="customers" placeholder="Customers" value="100">
      <input type="number" id="arpu" placeholder="Avg Revenue per User" value="29">
      <input type="number" id="growth" placeholder="Monthly Growth %" value="10">
      <input type="number" id="months" placeholder="Months" value="12">
      <div class="result" id="results"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .forecast-container { max-width: 500px; margin: 0 auto; }
    .forecast-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .forecast-container input { width: 100%; padding: var(--space-2); margin-bottom: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .result { background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-xl); margin-top: var(--space-3); }
    .result-row { display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--color-border); }
    .result-row:last-child { border: none; font-weight: bold; }
  `;
  container.appendChild(style);

  function calc() {
    let customers = parseFloat(container.querySelector('#customers').value) || 0;
    const arpu = parseFloat(container.querySelector('#arpu').value) || 0;
    const growth = parseFloat(container.querySelector('#growth').value) || 0;
    const months = parseFloat(container.querySelector('#months').value) || 12;
    let html = '';
    let total = 0;
    for (let i = 1; i <= months; i++) {
      const rev = customers * arpu;
      total += rev;
      html += '<div class="result-row"><span>Month ' + i + '</span><span>$' + rev.toLocaleString() + '</span></div>';
      customers *= (1 + growth / 100);
    }
    html += '<div class="result-row"><span>Total</span><span>$' + total.toLocaleString() + '</span></div>';
    container.querySelector('#results').innerHTML = html;
  }
  container.querySelectorAll('input').forEach(i => i.addEventListener('input', calc));
  calc();
}
