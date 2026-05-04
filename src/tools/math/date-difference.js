export const toolConfig = {
  id: 'date-difference',
  name: 'Date Difference Calculator',
  category: 'math',
  description: 'Calculate the exact difference between two dates in days, weeks, months.',
  icon: '📅',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="calc-container">
      <div class="calc-form">
        <div class="form-group">
          <label>Start Date</label>
          <input type="date" id="start-date" />
        </div>
        <div class="form-group">
          <label>End Date</label>
          <input type="date" id="end-date" />
        </div>
        <button id="calc-btn" class="calc-button">Calculate</button>
      </div>
      <div id="result" class="result hidden">
        <div class="result-grid">
          <div class="result-item">
            <div class="result-label">Days</div>
            <div class="result-value" id="days">0</div>
          </div>
          <div class="result-item">
            <div class="result-label">Weeks</div>
            <div class="result-value" id="weeks">0</div>
          </div>
          <div class="result-item">
            <div class="result-label">Months</div>
            <div class="result-value" id="months">0</div>
          </div>
          <div class="result-item">
            <div class="result-label">Years</div>
            <div class="result-value" id="years">0</div>
          </div>
        </div>
        <div class="result-detail" id="detail"></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .calc-container { max-width: 500px; margin: 0 auto; }
    .calc-container h2 { text-align: center; margin-bottom: var(--space-6); }
    .calc-form { background: var(--color-surface); padding: var(--space-6); border-radius: var(--radius-xl); margin-bottom: var(--space-6); }
    .form-group { margin-bottom: var(--space-4); }
    .form-group label { display: block; margin-bottom: var(--space-2); font-weight: 500; }
    .form-group input { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .calc-button { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-4); }
    .result-item { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-lg); text-align: center; }
    .result-label { font-size: var(--text-sm); color: var(--color-text-secondary); margin-bottom: var(--space-1); }
    .result-value { font-size: var(--text-2xl); font-weight: 700; }
    .result-detail { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-lg); text-align: center; font-size: var(--text-sm); }
    .hidden { display: none; }
  `;
  container.appendChild(style);

  const today = new Date().toISOString().split('T')[0];
  container.querySelector('#start-date').value = today;
  container.querySelector('#end-date').value = today;

  container.querySelector('#calc-btn').addEventListener('click', () => {
    const start = new Date(container.querySelector('#start-date').value);
    const end = new Date(container.querySelector('#end-date').value);
    const diff = Math.abs(end - start);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    container.querySelector('#days').textContent = days;
    container.querySelector('#weeks').textContent = weeks;
    container.querySelector('#months').textContent = months;
    container.querySelector('#years').textContent = years;
    
    const sign = end >= start ? '' : '-';
    container.querySelector('#detail').textContent = sign + days + ' days' + (sign ? ' difference' : ' between dates');
    container.querySelector('#result').classList.remove('hidden');
  });
}
