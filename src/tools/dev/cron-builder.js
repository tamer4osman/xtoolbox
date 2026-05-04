export const toolConfig = {
  id: 'cron-builder',
  name: 'Cron Expression Builder',
  category: 'dev',
  description: 'Build cron expressions visually. See human-readable description and next runs.',
  icon: '⏰',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="cron-container">
      <h2>Cron Builder</h2>
      <div class="cron-inputs">
        <select id="minute"><option value="*">Every minute</option><option value="0">At minute 0</option><option value="15">At minute 15</option><option value="30">At minute 30</option><option value="45">At minute 45</option></select>
        <select id="hour"><option value="*">Every hour</option><option value="0">Midnight</option><option value="6">6 AM</option><option value="12">Noon</option><option value="18">6 PM</option></select>
        <select id="day"><option value="*">Every day</option><option value="1">1st</option><option value="15">15th</option></select>
        <select id="month"><option value="*">Every month</option><option value="1">January</option><option value="6">June</option><option value="12">December</option></select>
        <select id="weekday"><option value="*">Every weekday</option><option value="0">Sunday</option><option value="1">Monday</option><option value="5">Friday</option></select>
      </div>
      <div class="cron-output">
        <code id="cron">* * * * *</code>
        <button id="copyBtn">Copy</button>
      </div>
      <div class="description" id="desc">Runs every minute</div>
      <div class="presets">
        <button data-cron="0 0 * * *">Daily midnight</button>
        <button data-cron="0 9 * * 1-5">Weekdays 9 AM</button>
        <button data-cron="0 0 1 * *">Monthly</button>
        <button data-cron="*/15 * * * *">Every 15 min</button>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .cron-container { max-width: 600px; margin: 0 auto; }
    .cron-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .cron-inputs { display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--space-2); margin-bottom: var(--space-4); }
    .cron-inputs select { padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); }
    .cron-output { display: flex; gap: var(--space-2); background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-xl); margin-bottom: var(--space-3); }
    .cron-output code { flex: 1; font-family: monospace; font-size: var(--text-lg); font-weight: 600; }
    #copyBtn { padding: var(--space-2) var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; }
    .description { text-align: center; font-size: var(--text-sm); color: var(--color-text-secondary); margin-bottom: var(--space-4); }
    .presets { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-2); }
    .presets button { padding: var(--space-2); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer; font-size: var(--text-sm); }
    .presets button:hover { background: var(--color-bg); }
  `;
  container.appendChild(style);

  function update() {
    const m = container.querySelector('#minute').value;
    const h = container.querySelector('#hour').value;
    const d = container.querySelector('#day').value;
    const mon = container.querySelector('#month').value;
    const w = container.querySelector('#weekday').value;
    const cron = `${m} ${h} ${d} ${mon} ${w}`;
    container.querySelector('#cron').textContent = cron;
    let desc = 'Runs ';
    if (m === '*' && h === '*') desc += 'every minute';
    else if (m === '0' && h === '*') desc += 'every hour at minute 0';
    else if (m === '0' && h === '0') desc += 'daily at midnight';
    else if (w === '1-5' && h === '9') desc += 'weekdays at 9 AM';
    else desc += 'at ' + cron;
    container.querySelector('#desc').textContent = desc;
  }

  container.querySelectorAll('select').forEach(s => s.addEventListener('change', update));
  container.querySelector('#copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(container.querySelector('#cron').textContent);
    container.querySelector('#copyBtn').textContent = 'Copied!';
    setTimeout(() => container.querySelector('#copyBtn').textContent = 'Copy', 1500);
  });
  container.querySelectorAll('.presets button').forEach(btn => {
    btn.addEventListener('click', () => {
      const c = btn.dataset.cron.split(' ');
      container.querySelector('#minute').value = c[0];
      container.querySelector('#hour').value = c[1];
      container.querySelector('#day').value = c[2];
      container.querySelector('#month').value = c[3];
      container.querySelector('#weekday').value = c[4];
      update();
    });
  });
}
