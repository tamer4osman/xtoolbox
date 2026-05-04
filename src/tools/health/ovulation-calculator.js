export const toolConfig = {
  id: 'ovulation-calculator',
  name: 'Ovulation Calculator',
  category: 'health',
  description: 'Predict ovulation and fertile windows.',
  icon: '📅',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="ovu-container">
      <div class="ovu-form">
        <div class="form-group">
          <label>First Day of Last Period</label>
          <input type="date" id="last-period" />
        </div>
        <div class="form-group">
          <label>Cycle Length (days)</label>
          <select id="cycle">
            <option value="21">21 days</option>
            <option value="22">22 days</option>
            <option value="23">23 days</option>
            <option value="24">24 days</option>
            <option value="25">25 days</option>
            <option value="26">26 days</option>
            <option value="27">27 days</option>
            <option value="28" selected>28 days (typical)</option>
            <option value="29">29 days</option>
            <option value="30">30 days</option>
            <option value="31">31 days</option>
            <option value="32">32 days</option>
            <option value="33">33 days</option>
            <option value="34">34 days</option>
            <option value="35">35 days</option>
          </select>
        </div>
        <button id="calc-btn" class="calc-button">Calculate</button>
      </div>
      <div id="result" class="result hidden">
        <div class="ovu-card">
          <div class="ovu-main">
            <div class="ovu-icon">🥚</div>
            <div class="ovu-title">Fertile Window</div>
            <div class="ovu-dates" id="fertile"></div>
          </div>
          <div class="ovu-dates-list">
            <div class="date-item">
              <span class="date-label">Ovulation</span>
              <span class="date-value" id="ovulation"></span>
            </div>
            <div class="date-item">
              <span class="date-label">Best Day to Conceive</span>
              <span class="date-value" id="best"></span>
            </div>
            <div class="date-item">
              <span class="date-label">Period Expected</span>
              <span class="date-value" id="period"></span>
            </div>
          </div>
          <div class="ovu-disclaimer">
            <small>This is an estimate. Consult a healthcare provider for accurate fertility tracking.</small>
          </div>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .ovu-container { max-width: 500px; margin: 0 auto; }
    .ovu-container h2 { text-align: center; margin-bottom: var(--space-6); }
    .ovu-form { background: var(--color-surface); padding: var(--space-6); border-radius: var(--radius-xl); margin-bottom: var(--space-6); }
    .form-group { margin-bottom: var(--space-4); text-align: left; }
    .form-group label { display: block; margin-bottom: var(--space-2); font-weight: 500; }
    .form-group input, .form-group select { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .calc-button { width: 100%; padding: var(--space-4); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .ovu-card { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-6); }
    .ovu-main { text-align: center; margin-bottom: var(--space-6); padding-bottom: var(--space-6); border-bottom: 1px solid var(--color-border); }
    .ovu-icon { font-size: 3rem; margin-bottom: var(--space-2); }
    .ovu-title { font-size: var(--text-sm); color: var(--color-text-secondary); }
    .ovu-dates { font-size: var(--text-xl); font-weight: 600; color: var(--color-primary); }
    .ovu-dates-list { display: flex; flex-direction: column; gap: var(--space-3); margin-bottom: var(--space-4); }
    .date-item { display: flex; justify-content: space-between; padding: var(--space-3); background: var(--color-bg); border-radius: var(--radius-md); }
    .date-label { color: var(--color-text-secondary); font-size: var(--text-sm); }
    .date-value { font-weight: 600; }
    .ovu-disclaimer { text-align: center; font-size: var(--text-xs); color: var(--color-text-muted); margin-top: var(--space-4); }
    .hidden { display: none; }
  `;
  container.appendChild(style);

  const today = new Date().toISOString().split('T')[0];
  container.querySelector('#last-period').value = today;

  function calculate() {
    const lastPeriod = new Date(container.querySelector('#last-period').value);
    const cycle = parseInt(container.querySelector('#cycle').value) || 28;
    
    const ovulation = new Date(lastPeriod);
    ovulation.setDate(ovulation.getDate() + cycle - 14);
    
    const fertileStart = new Date(ovulation);
    fertileStart.setDate(fertileStart.getDate() - 5);
    const fertileEnd = new Date(ovulation);
    fertileEnd.setDate(fertileEnd.getDate() + 1);
    
    const nextPeriod = new Date(lastPeriod);
    nextPeriod.setDate(nextPeriod.getDate() + cycle);
    
    const format = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    container.querySelector('#fertile').textContent = format(fertileStart) + ' - ' + format(fertileEnd);
    container.querySelector('#ovulation').textContent = format(ovulation);
    container.querySelector('#best').textContent = format(ovulation);
    container.querySelector('#period').textContent = format(nextPeriod);
    
    container.querySelector('#result').classList.remove('hidden');
  }

  container.querySelector('#calc-btn').addEventListener('click', calculate);
  calculate();
  
  }
