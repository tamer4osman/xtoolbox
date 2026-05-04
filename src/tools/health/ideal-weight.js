export const toolConfig = {
  id: 'ideal-weight',
  name: 'Ideal Weight Calculator',
  category: 'health',
  description: 'Calculate ideal weight range based on height and gender.',
  icon: '🎯',
  status: 'done'
};

export function render(container) {
  container.innerHTML = `
    <div class="weight-container">
      <div class="weight-form">
        <div class="form-group">
          <label>Height</label>
          <div class="input-group">
            <input type="number" id="height" value="170" min="100" max="250" />
            <select id="unit">
              <option value="cm" selected>cm</option>
              <option value="ft">ft/in</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Gender</label>
          <select id="gender">
            <option value="male" selected>Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <button id="calc-btn" class="calc-button">Calculate</button>
      </div>
      <div id="result" class="result hidden">
        <div class="weight-card">
          <div class="weight-range">
            <div class="range-label">Healthy BMI Range</div>
            <div class="range-values">
              <span id="min-weight"></span>
              <span>to</span>
              <span id="max-weight"></span>
            </div>
          </div>
          <div class="ideal-weight">
            <div class="ideal-label">Ideal Weight</div>
            <div class="ideal-value" id="ideal"></div>
          </div>
          <div class="weight-methods">
            <div class="method">
              <div class="method-name">Robinson Formula</div>
              <div class="method-value" id="robinson"></div>
            </div>
            <div class="method">
              <div class="method-name">Miller Formula</div>
              <div class="method-value" id="millers"></div>
            </div>
            <div class="method">
              <div class="method-name">Devine Formula</div>
              <div class="method-value" id="devine"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .weight-container { max-width: 500px; margin: 0 auto; }
    .weight-container h2 { text-align: center; margin-bottom: var(--space-6); }
    .weight-form { background: var(--color-surface); padding: var(--space-6); border-radius: var(--radius-xl); margin-bottom: var(--space-6); }
    .form-group { margin-bottom: var(--space-4); text-align: left; }
    .form-group label { display: block; margin-bottom: var(--space-2); font-weight: 500; }
    .input-group { display: flex; gap: var(--space-2); }
    .input-group input { flex: 1; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .input-group select { width: 80px; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .calc-button { width: 100%; padding: var(--space-4); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .weight-card { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-6); }
    .weight-range { text-align: center; margin-bottom: var(--space-6); padding-bottom: var(--space-6); border-bottom: 1px solid var(--color-border); }
    .range-label { font-size: var(--text-sm); color: var(--color-text-secondary); margin-bottom: var(--space-2); }
    .range-values { font-size: var(--text-2xl); font-weight: 700; display: flex; justify-content: center; gap: var(--space-2); }
    .ideal-weight { text-align: center; margin-bottom: var(--space-6); }
    .ideal-label { font-size: var(--text-sm); color: var(--color-text-secondary); margin-bottom: var(--space-2); }
    .ideal-value { font-size: 2.5rem; font-weight: 700; color: var(--color-success); }
    .weight-methods { display: grid; gap: var(--space-3); }
    .method { display: flex; justify-content: space-between; padding: var(--space-3); background: var(--color-bg); border-radius: var(--radius-md); }
    .method-name { font-size: var(--text-sm); color: var(--color-text-secondary); }
    .method-value { font-weight: 600; }
    .hidden { display: none; }
  `;
  container.appendChild(style);

  function calculate() {
    let h = parseFloat(container.querySelector('#height').value) || 170;
    const unit = container.querySelector('#unit').value;
    const gender = container.querySelector('#gender').value;
    
    if (unit === 'ft') h = h * 30.48;
    
    const hM = h / 100;
    const minBMI = 18.5;
    const maxBMI = 24.9;
    
    const minKg = minBMI * hM * hM;
    const maxKg = maxBMI * hM * hM;
    
    container.querySelector('#min-weight').textContent = minKg.toFixed(1) + ' kg';
    container.querySelector('#max-weight').textContent = maxKg.toFixed(1) + ' kg';
    
    const base = gender === 'male' ? 52 : 49;
    const robinson = base + 1.9 * (h / 2.54 - 60);
    const miller = base + 3.1 * (h / 2.54 - 60);
    const devine = base + 2.3 * (h / 2.54 - 60);
    
    const ideal = (robinson + miller + devine) / 3;
    container.querySelector('#ideal').textContent = ideal.toFixed(1) + ' kg';
    container.querySelector('#robinson').textContent = robinson.toFixed(1) + ' kg';
    container.querySelector('#millers').textContent = miller.toFixed(1) + ' kg';
    container.querySelector('#devine').textContent = devine.toFixed(1) + ' kg';
    
    container.querySelector('#result').classList.remove('hidden');
  }

  container.querySelector('#calc-btn').addEventListener('click', calculate);
  container.querySelectorAll('input, select').forEach(el => el.addEventListener('input', calculate));
  calculate();
  
  }
