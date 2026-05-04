export const toolConfig = {
  id: 'roi-calculator',
  name: 'ROI Calculator',
  category: 'business',
  description: 'Calculate Return on Investment (ROI) for projects.',
  icon: '💹',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="roi-container">
      <h2>ROI Calculator</h2>
      <input type="number" id="investment" placeholder="Initial Investment" value="10000">
      <input type="number" id="return" placeholder="Final Value" value="15000">
      <input type="number" id="time" placeholder="Time Period (months)" value="12">
      <div class="result">
        <div>ROI: <strong id="roi">50%</strong></div>
        <div>Annual ROI: <strong id="annual">50%</strong></div>
        <div>Profit: <strong id="profit">$5000</strong></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .roi-container { max-width: 400px; margin: 0 auto; text-align: center; }
    .roi-container h2 { margin-bottom: var(--space-4); }
    .roi-container input { width: 100%; padding: var(--space-3); margin-bottom: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-lg); text-align: center; }
    .result { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); }
    .result div { margin-bottom: var(--space-2); }
    .result strong { color: var(--color-primary); font-size: var(--text-xl); }
  `;
  container.appendChild(style);

  function calc() {
    const invest = parseFloat(container.querySelector('#investment').value) || 0;
    const ret = parseFloat(container.querySelector('#return').value) || 0;
    const months = parseFloat(container.querySelector('#time').value) || 1;
    const profit = ret - invest;
    const roi = invest ? (profit / invest * 100) : 0;
    const annual = months ? (roi * 12 / months) : 0;
    container.querySelector('#roi').textContent = roi.toFixed(1) + '%';
    container.querySelector('#annual').textContent = annual.toFixed(1) + '%';
    container.querySelector('#profit').textContent = '$' + profit.toFixed(0);
  }
  container.querySelectorAll('input').forEach(i => i.addEventListener('input', calc));
  calc();
}
