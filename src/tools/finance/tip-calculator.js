export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-header">
        <div class="tool-icon">💳</div>
        <h1>Tip Calculator</h1>
        <p class="tool-description">Calculate tip amount and split the bill between people.</p>
      </div>
      <div class="tool-content">
        <div class="calculator-form">
          <div class="form-group">
            <label>Bill Amount ($)</label>
            <input type="number" id="bill" value="45.00" min="0" step="0.01" />
          </div>
          <div class="form-group">
            <label>Tip Percentage</label>
            <div class="tip-buttons">
              <button type="button" class="tip-btn" data-tip="15">15%</button>
              <button type="button" class="tip-btn active" data-tip="18">18%</button>
              <button type="button" class="tip-btn" data-tip="20">20%</button>
              <button type="button" class="tip-btn" data-tip="25">25%</button>
            </div>
            <input type="number" id="tip-percent" value="18" min="0" max="100" />
          </div>
          <div class="form-group">
            <label>Number of People</label>
            <input type="number" id="people" value="1" min="1" max="20" />
          </div>
          <button id="calc-btn" class="tool-button primary">Calculate</button>
        </div>
        <div id="result" class="result hidden">
          <div class="result-card">
            <div class="result-label">Total per Person</div>
            <div class="result-value" id="per-person"></div>
          </div>
          <div class="result-grid">
            <div class="result-item">
              <div class="result-label">Tip Amount</div>
              <div class="result-value" id="tip-amount"></div>
            </div>
            <div class="result-item">
              <div class="result-label">Total Bill</div>
              <div class="result-value" id="total-bill"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .tool-container { max-width: 600px; margin: 0 auto; }
    .tool-header { text-align: center; margin-bottom: var(--space-8); }
    .calculator-form { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-6); margin-bottom: var(--space-6); }
    .form-group { margin-bottom: var(--space-4); }
    .form-group label { display: block; margin-bottom: var(--space-2); font-weight: 500; }
    .form-group input { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .tip-buttons { display: flex; gap: var(--space-2); margin-bottom: var(--space-2); }
    .tip-btn { flex: 1; padding: var(--space-2); border: 1px solid var(--color-border); background: white; border-radius: var(--radius-md); cursor: pointer; }
    .tip-btn.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }
    .tool-button.primary { width: 100%; padding: var(--space-4); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .result-card { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: var(--radius-xl); padding: var(--space-8); text-align: center; margin-bottom: var(--space-4); }
    .result-label { font-size: var(--text-sm); opacity: 0.9; margin-bottom: var(--space-2); }
    .result-value { font-size: 2.5rem; font-weight: 700; }
    .result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .result-item { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); text-align: center; }
    .hidden { display: none !important; }
  `;
  container.appendChild(style);

  container.querySelectorAll('.tip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.tip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      container.querySelector('#tip-percent').value = btn.dataset.tip;
    });
  });

  container.querySelector('#calc-btn').addEventListener('click', () => {
    const bill = parseFloat(container.querySelector('#bill').value) || 0;
    const tipPercent = parseFloat(container.querySelector('#tip-percent').value) || 0;
    const people = parseInt(container.querySelector('#people').value) || 1;
    
    const tip = bill * tipPercent / 100;
    const total = bill + tip;
    const perPerson = total / people;
    
    document.getElementById('tip-amount').textContent = '$' + tip.toFixed(2);
    document.getElementById('total-bill').textContent = '$' + total.toFixed(2);
    document.getElementById('per-person').textContent = '$' + perPerson.toFixed(2);
    container.querySelector('#result').classList.remove('hidden');
  });
}
