export const toolConfig = {
  id: 'inflation-calculator',
  name: 'Inflation Calculator',
  category: 'finance',
  description: 'Calculate the value of money adjusted for inflation over time.',
  icon: '📊',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-header">
        <div class="tool-icon">📊</div>
        <h1>Inflation Calculator</h1>
        <p class="tool-description">Calculate the value of money adjusted for inflation over time.</p>
      </div>
      <div class="tool-content">
        <div class="calculator-form">
          <div class="form-group">
            <label>Current Amount ($)</label>
            <input type="number" id="amount" value="10000" min="1" />
          </div>
          <div class="form-group">
            <label>Inflation Rate (% per year)</label>
            <input type="number" id="rate" value="3" min="0" step="0.1" />
          </div>
          <div class="form-group">
            <label>Years in the Future</label>
            <input type="number" id="years" value="10" min="1" max="100" />
          </div>
          <button id="calc-btn" class="tool-button primary">Calculate</button>
        </div>
        <div id="result" class="result hidden">
          <div class="result-card">
            <div class="result-label">Future Value</div>
            <div class="result-value" id="future"></div>
          </div>
          <div class="result-grid">
            <div class="result-item">
              <div class="result-label">Lost Value</div>
              <div class="result-value" id="lost"></div>
            </div>
            <div class="result-item">
              <div class="result-label">Purchasing Power</div>
              <div class="result-value" id="power"></div>
            </div>
          </div>
          <div class="buying-power">
            <h3>What you could buy</h3>
            <p id="buying-text"></p>
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
    .tool-button.primary { width: 100%; padding: var(--space-4); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .result-card { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border-radius: var(--radius-xl); padding: var(--space-8); text-align: center; margin-bottom: var(--space-4); }
    .result-label { font-size: var(--text-sm); opacity: 0.9; margin-bottom: var(--space-2); }
    .result-value { font-size: 2.5rem; font-weight: 700; }
    .result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-6); }
    .result-item { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); text-align: center; }
    .buying-power { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); text-align: center; }
    .buying-power h3 { margin-bottom: var(--space-2); }
    .hidden { display: none !important; }
  `;
  container.appendChild(style);

  container.querySelector('#calc-btn').addEventListener('click', () => {
    const amount = parseFloat(container.querySelector('#amount').value);
    const rate = parseFloat(container.querySelector('#rate').value) / 100;
    const years = parseInt(container.querySelector('#years').value);
    
    const inflationFactor = Math.pow(1 + rate, years);
    const futureValue = amount / inflationFactor;
    const lost = amount - futureValue;
    const powerPercent = (1 / inflationFactor) * 100;
    
    document.getElementById('future').textContent = '$' + futureValue.toFixed(2);
    document.getElementById('lost').textContent = '$' + lost.toFixed(2);
    document.getElementById('power').textContent = powerPercent.toFixed(1) + '%';
    document.getElementById('buying-text').textContent = 'In ' + years + ' years, $' + amount + ' will have the purchasing power of $' + futureValue.toFixed(2) + ' today';
    container.querySelector('#result').classList.remove('hidden');
  });
}
