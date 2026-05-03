export const toolConfig = {
  id: 'cron-builder',
  name: 'Cron Expression Builder',
  category: 'dev',
  description: 'Build cron expressions visually. See human-readable description and next runs.',
  icon: '⏰',
  steps: ['Select schedule options', 'Get cron expression']
};

export function render(container) {
  container.innerHTML = `
    <div class="cron-container">
      <div class="cron-preview" id="cron-preview">* * * * *</div>
      <div class="cron-fields">
        <div class="cron-field">
          <label>Minute</label>
          <select id="minute">
            <option value="*">Every minute</option>
            <option value="0">At minute 0</option>
            <option value="*/5">Every 5 minutes</option>
            <option value="*/10">Every 10 minutes</option>
            <option value="*/15">Every 15 minutes</option>
            <option value="*/30">Every 30 minutes</option>
          </select>
        </div>
        <div class="cron-field">
          <label>Hour</label>
          <select id="hour">
            <option value="*">Every hour</option>
            <option value="0">At midnight</option>
            <option value="6">At 6 AM</option>
            <option value="9">At 9 AM</option>
            <option value="12">At noon</option>
            <option value="18">At 6 PM</option>
          </select>
        </div>
        <div class="cron-field">
          <label>Day of Month</label>
          <select id="day">
            <option value="*">Every day</option>
            <option value="1">1st</option>
            <option value="15">15th</option>
            <option value="1,15">1st & 15th</option>
          </select>
        </div>
        <div class="cron-field">
          <label>Month</label>
          <select id="month">
            <option value="*">Every month</option>
            <option value="1">January</option>
            <option value="6">June</option>
            <option value="12">December</option>
          </select>
        </div>
        <div class="cron-field">
          <label>Day of Week</label>
          <select id="weekday">
            <option value="*">Every day</option>
            <option value="0">Sunday</option>
            <option value="1">Monday</option>
            <option value="5">Friday</option>
            <option value="1-5">Weekdays</option>
          </select>
        </div>
      </div>
      <div class="cron-desc" id="cron-desc"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .cron-container { max-width: 500px; margin: 0 auto; }
    .cron-preview { font-size: var(--text-3xl); font-family: monospace; text-align: center; padding: var(--space-4); background: #e3f2fd; border-radius: var(--radius-lg); margin-bottom: var(--space-4); font-weight: bold; }
    .cron-fields { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
    .cron-field { }
    .cron-field label { display: block; font-size: var(--text-sm); margin-bottom: var(--space-1); color: var(--color-text-secondary); }
    .cron-field select { width: 100%; padding: var(--space-2); border: 1px solid #ddd; border-radius: var(--radius-md); }
    .cron-desc { margin-top: var(--space-4); padding: var(--space-3); background: #f5f5f5; border-radius: var(--radius-md); text-align: center; font-size: var(--text-sm); }
  `;
  container.appendChild(style);

  function updateCron() {
    const min = container.querySelector('#minute').value;
    const hr = container.querySelector('#hour').value;
    const day = container.querySelector('#day').value;
    const mon = container.querySelector('#month').value;
    const wd = container.querySelector('#weekday').value;
    
    const expr = `${min} ${hr} ${day} ${mon} ${wd}`;
    container.querySelector('#cron-preview').textContent = expr;
    
    let desc = 'Runs ';
    if (min === '*') desc += 'every minute';
    else if (min.startsWith('*/')) desc += `every ${min.slice(2)} minutes`;
    else desc += `at minute ${min}`;
    
    if (hr === '*') desc += ' of every hour';
    else desc += ` at ${hr}:00`;
    
    if (day !== '*') desc += ` on day ${day}`;
    if (wd !== '*') desc += wd === '1-5' ? ' on weekdays' : ` on day ${wd}`;
    
    container.querySelector('#cron-desc').textContent = desc;
  }

  container.querySelectorAll('select').forEach(s => s.addEventListener('change', updateCron));
  updateCron();

  return container;
}
