export function render(container) {
  container.innerHTML = `
    <div class="due-container">
      <div class="due-form">
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
        <button id="calc-btn" class="calc-button">Calculate Due Date</button>
      </div>
      <div id="result" class="result hidden">
        <div class="due-card">
          <div class="due-date">
            <div class="due-label">Your Due Date</div>
            <div class="due-value" id="due-date"></div>
          </div>
          <div class="due-weeks">
            <div class="week-item">
              <div class="week-number" id="weeks-pregnant"></div>
              <div class="week-label">weeks pregnant</div>
            </div>
            <div class="week-item">
              <div class="week-number" id="days-left"></div>
              <div class="week-label">days to go</div>
            </div>
          </div>
          <div class="milestones">
            <h3>Pregnancy Milestones</h3>
            <div class="milestone">
              <span>Viability (24 weeks)</span>
              <span id="viability"></span>
            </div>
            <div class="milestone">
              <span>Full Term (37 weeks)</span>
              <span id="full-term"></span>
            </div>
            <div class="milestone">
              <span>Due Date</span>
              <span id="due"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .due-container { max-width: 500px; margin: 0 auto; }
    .due-container h2 { text-align: center; margin-bottom: var(--space-6); }
    .due-form { background: var(--color-surface); padding: var(--space-6); border-radius: var(--radius-xl); margin-bottom: var(--space-6); }
    .form-group { margin-bottom: var(--space-4); text-align: left; }
    .form-group label { display: block; margin-bottom: var(--space-2); font-weight: 500; }
    .form-group input, .form-group select { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .calc-button { width: 100%; padding: var(--space-4); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .due-card { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-6); text-align: center; }
    .due-date { margin-bottom: var(--space-6); padding-bottom: var(--space-6); border-bottom: 1px solid var(--color-border); }
    .due-label { font-size: var(--text-sm); color: var(--color-text-secondary); margin-bottom: var(--space-2); }
    .due-value { font-size: 2rem; font-weight: 700; color: var(--color-primary); }
    .due-weeks { display: flex; justify-content: center; gap: var(--space-8); margin-bottom: var(--space-6); }
    .week-item { text-align: center; }
    .week-number { font-size: 2rem; font-weight: 700; }
    .week-label { font-size: var(--text-sm); color: var(--color-text-secondary); }
    .milestones { text-align: left; background: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-lg); }
    .milestones h3 { font-size: var(--text-sm); margin-bottom: var(--space-3); }
    .milestone { display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--color-border); font-size: var(--text-sm); }
    .milestone:last-child { border: none; }
    .hidden { display: none; }
  `;
  container.appendChild(style);

  const today = new Date().toISOString().split('T')[0];
  container.querySelector('#last-period').value = today;
  container.querySelector('#last-period').max = today;

  function calculate() {
    const lastPeriod = new Date(container.querySelector('#last-period').value);
    const cycle = parseInt(container.querySelector('#cycle').value) || 28;
    
    const ovulation = new Date(lastPeriod);
    ovulation.setDate(ovulation.getDate() + cycle - 14);
    
    const dueDate = new Date(ovulation);
    dueDate.setDate(dueDate.getDate() + 280);
    
    const now = new Date();
    const weeks = Math.floor((now - lastPeriod) / (7 * 24 * 60 * 60 * 1000));
    const daysLeft = Math.ceil((dueDate - now) / (24 * 60 * 60 * 1000));
    
    container.querySelector('#due-date').textContent = dueDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    container.querySelector('#weeks-pregnant').textContent = weeks;
    container.querySelector('#days-left').textContent = daysLeft;
    
    const viability = new Date(dueDate);
    viability.setDate(viability.getDate() - 196);
    container.querySelector('#viability').textContent = viability.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const fullTerm = new Date(dueDate);
    fullTerm.setDate(fullTerm.getDate() - 63);
    container.querySelector('#full-term').textContent = fullTerm.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    container.querySelector('#due').textContent = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    container.querySelector('#result').classList.remove('hidden');
  }

  container.querySelector('#calc-btn').addEventListener('click', calculate);
  calculate();
  
  }
