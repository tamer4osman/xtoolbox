export const toolConfig = {
  id: 'heart-rate-zones',
  name: 'Heart Rate Zones',
  category: 'health',
  description: 'Calculate target heart rate zones for exercise.',
  icon: '💓',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="hr-container">
      <div class="hr-form">
        <div class="form-group">
          <label>Age</label>
          <input type="number" id="age" value="30" min="10" max="100" />
        </div>
        <div class="form-group">
          <label>Resting Heart Rate (bpm)</label>
          <input type="number" id="resting" value="70" min="40" max="120" />
        </div>
        <button id="calc-btn" class="calc-button">Calculate Zones</button>
      </div>
      <div id="result" class="result hidden">
        <div class="max-hr">
          <div class="max-label">Max Heart Rate</div>
          <div class="max-value" id="max-hr"></div>
          <div class="max-formula">${220 - 30} - age = formula</div>
        </div>
        <div class="zones">
          <div class="zone zone-1">
            <div class="zone-header">
              <span class="zone-name">Zone 1</span>
              <span class="zone-pct">50-60%</span>
            </div>
            <div class="zone-range" id="z1"></div>
            <div class="zone-desc">Very Light - Warm up, recovery</div>
          </div>
          <div class="zone zone-2">
            <div class="zone-header">
              <span class="zone-name">Zone 2</span>
              <span class="zone-pct">60-70%</span>
            </div>
            <div class="zone-range" id="z2"></div>
            <div class="zone-desc">Light - Fat burning, endurance</div>
          </div>
          <div class="zone zone-3">
            <div class="zone-header">
              <span class="zone-name">Zone 3</span>
              <span class="zone-pct">70-80%</span>
            </div>
            <div class="zone-range" id="z3"></div>
            <div class="zone-desc">Moderate - Aerobic fitness</div>
          </div>
          <div class="zone zone-4">
            <div class="zone-header">
              <span class="zone-name">Zone 4</span>
              <span class="zone-pct">80-90%</span>
            </div>
            <div class="zone-range" id="z4"></div>
            <div class="zone-desc">Hard - Anaerobic, speed</div>
          </div>
          <div class="zone zone-5">
            <div class="zone-header">
              <span class="zone-name">Zone 5</span>
              <span class="zone-pct">90-100%</span>
            </div>
            <div class="zone-range" id="z5"></div>
            <div class="zone-desc">Maximum - Peak performance</div>
          </div>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .hr-container { max-width: 500px; margin: 0 auto; }
    .hr-container h2 { text-align: center; margin-bottom: var(--space-6); }
    .hr-form { background: var(--color-surface); padding: var(--space-6); border-radius: var(--radius-xl); margin-bottom: var(--space-6); }
    .form-group { margin-bottom: var(--space-4); text-align: left; }
    .form-group label { display: block; margin-bottom: var(--space-2); font-weight: 500; }
    .form-group input { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .calc-button { width: 100%; padding: var(--space-4); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .max-hr { text-align: center; margin-bottom: var(--space-6); padding: var(--space-4); background: var(--color-surface); border-radius: var(--radius-xl); }
    .max-label { font-size: var(--text-sm); color: var(--color-text-secondary); }
    .max-value { font-size: 3rem; font-weight: 700; color: var(--color-primary); }
    .max-formula { font-size: var(--text-xs); color: var(--color-text-muted); }
    .zones { display: flex; flex-direction: column; gap: var(--space-3); }
    .zone { padding: var(--space-4); border-radius: var(--radius-lg); }
    .zone-1 { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
    .zone-2 { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; }
    .zone-3 { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; }
    .zone-4 { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; }
    .zone-5 { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; }
    .zone-header { display: flex; justify-content: space-between; margin-bottom: var(--space-1); }
    .zone-name { font-weight: 600; }
    .zone-pct { font-size: var(--text-sm); opacity: 0.9; }
    .zone-range { font-size: var(--text-2xl); font-weight: 700; margin-bottom: var(--space-1); }
    .zone-desc { font-size: var(--text-xs); opacity: 0.9; }
    .hidden { display: none; }
  `;
  container.appendChild(style);

  function calculate() {
    const age = parseInt(container.querySelector('#age').value) || 30;
    const resting = parseInt(container.querySelector('#resting').value) || 70;
    
    const maxHR = 220 - age;
    const hrr = maxHR - resting;
    
    container.querySelector('#max-hr').textContent = maxHR + ' bpm';
    container.querySelector('.max-formula').textContent = '220 - ' + age + ' = ' + maxHR + ' bpm';
    
    const zones = [
      [0.5, 0.6],
      [0.6, 0.7],
      [0.7, 0.8],
      [0.8, 0.9],
      [0.9, 1.0]
    ];
    
    zones.forEach((z, i) => {
      const low = Math.round(resting + hrr * z[0]);
      const high = Math.round(resting + hrr * z[1]);
      container.querySelector('#z' + (i + 1)).textContent = low + ' - ' + high + ' bpm';
    });
    
    container.querySelector('#result').classList.remove('hidden');
  }

  container.querySelector('#calc-btn').addEventListener('click', calculate);
  container.querySelectorAll('input').forEach(el => el.addEventListener('input', calculate));
  calculate();
  
  }
