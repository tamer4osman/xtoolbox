export const toolConfig = {
  id: 'inflation-calculator',
  name: 'Inflation Calculator',
  category: 'finance',
  description: 'Calculate future value accounting for inflation.',
  icon: '📉',
  steps: ['Enter values', 'Calculate']
};

export function render(container) {
  container.innerHTML = `
    <div class="inf-container">
      <label>Current Amount ($)</label><input type="number" id="inf-current" value="10000">
      <label>Inflation Rate (%/year)</label><input type="number" id="inf-rate" value="3" step="0.1">
      <label>Years</label><input type="number" id="inf-years" value="10">
      <button id="inf-calc">Calculate</button>
      <div class="inf-results" id="inf-results"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .inf-container { max-width: 400px; margin: 0 auto; }
    .inf-container label { display: block; font-size: var(--text-sm); margin-bottom: var(--space-1); color: var(--color-text-secondary); }
    .inf-container input { width: 100%; padding: var(--space-3); border: 1px solid #ddd; border-radius: var(--radius-md); margin-bottom: var(--space-3); font-size: var(--text-lg); }
    #inf-calc { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; font-size: var(--text-lg); }
    .inf-result { margin-top: var(--space-4); padding: var(--space-4); background: #fff3e0; border-radius: var(--radius-lg); }
    .inf-result .label { font-size: var(--text-sm); color: var(--color-text-secondary); }
    .inf-result .value { font-size: var(--text-2xl); font-weight: bold; }
    .inf-result .loss { color: #d32f2f; }
  `;
  container.appendChild(style);

  container.querySelector('#inf-calc').addEventListener('click', () => {
    const current = parseFloat(container.querySelector('#inf-current').value);
    const rate = parseFloat(container.querySelector('#inf-rate').value) / 100;
    const years = parseInt(container.querySelector('#inf-years').value);

    const future = current / Math.pow(1 + rate, years);
    const loss = current - future;

    container.querySelector('#inf-results').innerHTML = `
      <div class="inf-result">
        <div class="label">Future Purchasing Power</div>
        <div class="value">$${future.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
        <div class="label" style="margin-top:var(--space-3)">Value Lost to Inflation</div>
        <div class="value loss">-$${loss.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
      </div>
    `;
  });

  return container;
}
