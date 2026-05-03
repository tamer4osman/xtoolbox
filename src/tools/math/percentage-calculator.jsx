export const toolConfig = {
  id: 'percentage-calculator',
  name: 'Percentage Calculator',
  category: 'math',
  description: 'Calculate percentages, percentage increase/decrease, and percentage of values.',
  icon: '📊',
  steps: ['Enter values', 'Select calculation type', 'Calculate']
};

export function render(container) {
  container.innerHTML = `
    <div class="pct-container">
      <div class="pct-tabs">
        <button class="pct-tab active" data-tab="simple">Simple %</button>
        <button class="pct-tab" data-tab="change">% Change</button>
        <button class="pct-tab" data-tab="reverse">Reverse %</button>
      </div>
      
      <div class="pct-panel active" id="panel-simple">
        <div class="pct-inputs">
          <div class="pct-input-group">
            <label>What is</label>
            <input type="number" id="simple-pct" placeholder="10">
          </div>
          <div class="pct-input-group">
            <label>% of</label>
            <input type="number" id="simple-num" placeholder="100">
          </div>
        </div>
        <button class="pct-calc" data-target="simple">Calculate</button>
        <div class="pct-result" id="result-simple"></div>
      </div>
      
      <div class="pct-panel" id="panel-change">
        <div class="pct-inputs">
          <div class="pct-input-group">
            <label>From</label>
            <input type="number" id="change-from" placeholder="100">
          </div>
          <div class="pct-input-group">
            <label>To</label>
            <input type="number" id="change-to" placeholder="150">
          </div>
        </div>
        <button class="pct-calc" data-target="change">Calculate</button>
        <div class="pct-result" id="result-change"></div>
      </div>
      
      <div class="pct-panel" id="panel-reverse">
        <div class="pct-inputs">
          <div class="pct-input-group">
            <label>Value</label>
            <input type="number" id="reverse-val" placeholder="25">
          </div>
          <div class="pct-input-group">
            <label>Percentage</label>
            <input type="number" id="reverse-pct" placeholder="20">
          </div>
        </div>
        <button class="pct-calc" data-target="reverse">Calculate</button>
        <div class="pct-result" id="result-reverse"></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .pct-container { max-width: 400px; margin: 0 auto; }
    .pct-tabs { display: flex; gap: 8px; margin-bottom: var(--space-4); }
    .pct-tab { flex: 1; padding: var(--space-2) var(--space-3); border: none; background: #f5f5f5; border-radius: var(--radius-md); cursor: pointer; font-size: var(--text-sm); }
    .pct-tab.active { background: var(--color-primary); color: white; }
    .pct-panel { display: none; }
    .pct-panel.active { display: block; }
    .pct-inputs { display: flex; gap: var(--space-3); margin-bottom: var(--space-3); }
    .pct-input-group { flex: 1; }
    .pct-input-group label { display: block; font-size: var(--text-sm); margin-bottom: var(--space-1); color: var(--color-text-secondary); }
    .pct-input-group input { width: 100%; padding: var(--space-3); border: 1px solid #ddd; border-radius: var(--radius-md); font-size: var(--text-base); }
    .pct-calc { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); font-size: var(--text-base); cursor: pointer; margin-bottom: var(--space-3); }
    .pct-result { padding: var(--space-4); background: #f5f5f5; border-radius: var(--radius-lg); text-align: center; font-size: var(--text-xl); font-weight: bold; color: var(--color-primary); }
  `;
  container.appendChild(style);

  container.querySelectorAll('.pct-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.pct-tab').forEach(t => t.classList.remove('active'));
      container.querySelectorAll('.pct-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      container.querySelector(`#panel-${tab.dataset.tab}`).classList.add('active');
    });
  });

  container.querySelectorAll('.pct-calc').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      let result = '';
      
      if (target === 'simple') {
        const pct = parseFloat(container.querySelector('#simple-pct').value);
        const num = parseFloat(container.querySelector('#simple-num').value);
        if (!isNaN(pct) && !isNaN(num)) {
          result = `${pct}% of ${num} = ${(pct / 100 * num).toLocaleString()}`;
        }
      } else if (target === 'change') {
        const from = parseFloat(container.querySelector('#change-from').value);
        const to = parseFloat(container.querySelector('#change-to').value);
        if (!isNaN(from) && !isNaN(to) && from !== 0) {
          const change = ((to - from) / from * 100).toFixed(2);
          result = change > 0 ? `+${change}% increase` : `${change}% decrease`;
        }
      } else if (target === 'reverse') {
        const val = parseFloat(container.querySelector('#reverse-val').value);
        const pct = parseFloat(container.querySelector('#reverse-pct').value);
        if (!isNaN(val) && !isNaN(pct) && pct !== 0) {
          result = `${val} is ${pct}% of ${(val / pct * 100).toLocaleString()}`;
        }
      }
      
      container.querySelector(`#result-${target}`).textContent = result;
    });
  });

  return container;
}
