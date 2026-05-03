export const toolConfig = {
  id: 'tip-calculator',
  name: 'Tip Calculator',
  category: 'finance',
  description: 'Calculate tip amounts and splits.',
  icon: '💵',
  steps: ['Enter bill amount', 'Calculate tip']
};

export function render(container) {
  container.innerHTML = `
    <div class="tip-container">
      <label>Bill Amount ($)</label><input type="number" id="tip-bill" value="50">
      <label>Tip %</label>
      <div class="tip-presets">
        <button class="tip-btn" data-tip="10">10%</button>
        <button class="tip-btn active" data-tip="15">15%</button>
        <button class="tip-btn" data-tip="18">18%</button>
        <button class="tip-btn" data-tip="20">20%</button>
        <button class="tip-btn" data-tip="25">25%</button>
      </div>
      <input type="range" id="tip-slider" min="0" max="30" value="15">
      <label>Number of People</label><input type="number" id="tip-people" value="1" min="1">
      <button id="tip-calc">Calculate</button>
      <div class="tip-results" id="tip-results"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .tip-container { max-width: 400px; margin: 0 auto; }
    .tip-container label { display: block; font-size: var(--text-sm); margin-bottom: var(--space-1); color: var(--color-text-secondary); }
    .tip-container input[type="number"] { width: 100%; padding: var(--space-3); border: 1px solid #ddd; border-radius: var(--radius-md); margin-bottom: var(--space-3); font-size: var(--text-lg); }
    .tip-presets { display: flex; gap: var(--space-2); margin-bottom: var(--space-3); }
    .tip-btn { flex: 1; padding: var(--space-2); border: 2px solid #ddd; background: white; border-radius: var(--radius-md); cursor: pointer; }
    .tip-btn.active { border-color: var(--color-primary); background: var(--color-primary); color: white; }
    #tip-slider { width: 100%; margin-bottom: var(--space-3); }
    #tip-calc { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; font-size: var(--text-lg); }
    .tip-result { margin-top: var(--space-4); padding: var(--space-4); background: #f5f5f5; border-radius: var(--radius-lg); text-align: center; }
    .tip-result .big { font-size: var(--text-3xl); font-weight: bold; color: var(--color-primary); }
  `;
  container.appendChild(style);

  let tipPercent = 15;

  container.querySelectorAll('.tip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.tip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      tipPercent = parseInt(btn.dataset.tip);
      container.querySelector('#tip-slider').value = tipPercent;
    });
  });

  container.querySelector('#tip-slider').addEventListener('input', (e) => {
    tipPercent = parseInt(e.target.value);
    container.querySelectorAll('.tip-btn').forEach(b => b.classList.remove('active'));
  });

  container.querySelector('#tip-calc').addEventListener('click', () => {
    const bill = parseFloat(container.querySelector('#tip-bill').value);
    const people = parseInt(container.querySelector('#tip-people').value);
    if (!bill) return;

    const tip = bill * tipPercent / 100;
    const total = bill + tip;
    const perPerson = total / people;

    container.querySelector('#tip-results').innerHTML = `
      <div class="tip-result">
        <div>Tip Amount</div>
        <div class="big">$${tip.toFixed(2)}</div>
        <div style="margin-top:var(--space-3)">Total</div>
        <div class="big">$${total.toFixed(2)}</div>
        ${people > 1 ? `<div style="margin-top:var(--space-3)">Per Person</div><div class="big">$${perPerson.toFixed(2)}</div>` : ''}
      </div>
    `;
  });

  return container;
}
