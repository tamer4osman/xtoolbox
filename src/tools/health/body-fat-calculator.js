export function render(container) {
  container.innerHTML = `
    <div class="fat-container">
      <div class="fat-form">
        <div class="form-group">
          <label>Gender</label>
          <select id="gender">
            <option value="male" selected>Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div class="form-group">
          <label>Age</label>
          <input type="number" id="age" value="30" min="18" max="100" />
        </div>
        <div class="form-group">
          <label>Height (cm)</label>
          <input type="number" id="height" value="170" min="100" max="250" />
        </div>
        <div class="form-group">
          <label>Weight (kg)</label>
          <input type="number" id="weight" value="70" min="30" max="300" />
        </div>
        <div class="form-group">
          <label>Neck (cm)</label>
          <input type="number" id="neck" value="38" min="20" max="60" />
        </div>
        <div class="form-group" id="waist-group">
          <label>Waist (cm)</label>
          <input type="number" id="waist" value="85" min="40" max="200" />
        </div>
        <div class="form-group" id="hip-group">
          <label>Hip (cm)</label>
          <input type="number" id="hip" value="95" min="50" max="200" />
        </div>
        <button id="calc-btn" class="calc-button">Calculate Body Fat %</button>
      </div>
      <div id="result" class="result hidden">
        <div class="fat-display">
          <div class="fat-value" id="bodyfat"></div>
          <div class="fat-category" id="category"></div>
        </div>
        <div class="fat-scale">
          <div class="scale-bar"><div id="scale-fill"></div></div>
          <div class="scale-labels">
            <span>Essential</span>
            <span>Athletes</span>
            <span>Fitness</span>
            <span>Average</span>
            <span>Obese</span>
          </div>
        </div>
        <div class="fat-mass">
          <div class="mass-item">
            <div class="mass-value" id="fat-mass"></div>
            <div class="mass-label">Body Fat</div>
          </div>
          <div class="mass-item">
            <div class="mass-value" id="lean-mass"></div>
            <div class="mass-label">Lean Mass</div>
          </div>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .fat-container { max-width: 500px; margin: 0 auto; }
    .fat-container h2 { text-align: center; margin-bottom: var(--space-6); }
    .fat-form { background: var(--color-surface); padding: var(--space-6); border-radius: var(--radius-xl); margin-bottom: var(--space-6); }
    .form-group { margin-bottom: var(--space-4); text-align: left; }
    .form-group label { display: block; margin-bottom: var(--space-2); font-weight: 500; }
    .form-group input, .form-group select { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .calc-button { width: 100%; padding: var(--space-4); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .fat-display { text-align: center; margin-bottom: var(--space-6); }
    .fat-value { font-size: 3.5rem; font-weight: 700; }
    .fat-category { font-size: var(--text-lg); color: var(--color-text-secondary); }
    .fat-scale { margin-bottom: var(--space-6); }
    .scale-bar { height: 12px; background: linear-gradient(90deg, #3b82f6 0%, #10b981 25%, #10b981 50%, #f59e0b 75%, #ef4444 100%); border-radius: 6px; position: relative; }
    .scale-labels { display: flex; justify-content: space-between; font-size: 10px; color: var(--color-text-muted); margin-top: var(--space-1); }
    .fat-mass { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .mass-item { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-lg); text-align: center; }
    .mass-value { font-size: var(--text-xl); font-weight: 700; }
    .mass-label { font-size: var(--text-sm); color: var(--color-text-secondary); }
    .hidden { display: none; }
  `;
  container.appendChild(style);

  function calculate() {
    const gender = container.querySelector('#gender').value;
    const age = parseInt(container.querySelector('#age').value) || 30;
    const height = parseFloat(container.querySelector('#height').value) || 170;
    const weight = parseFloat(container.querySelector('#weight').value) || 70;
    const neck = parseFloat(container.querySelector('#neck').value) || 38;
    const waist = parseFloat(container.querySelector('#waist').value) || 85;
    const hip = parseFloat(container.querySelector('#hip').value) || 95;
    
    let bodyFat;
    if (gender === 'male') {
      bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    } else {
      bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
    }
    
    bodyFat = Math.max(2, Math.min(60, bodyFat));
    const fatMass = weight * bodyFat / 100;
    const leanMass = weight - fatMass;
    
    let category, color;
    if (gender === 'male') {
      if (bodyFat < 6) { category = 'Essential Fat'; color = '#3b82f6'; }
      else if (bodyFat < 14) { category = 'Athletes'; color = '#10b981'; }
      else if (bodyFat < 18) { category = 'Fitness'; color = '#10b981'; }
      else if (bodyFat < 25) { category = 'Average'; color = '#f59e0b'; }
      else { category = 'Obese'; color = '#ef4444'; }
    } else {
      if (bodyFat < 14) { category = 'Essential Fat'; color = '#3b82f6'; }
      else if (bodyFat < 21) { category = 'Athletes'; color = '#10b981'; }
      else if (bodyFat < 25) { category = 'Fitness'; color = '#10b981'; }
      else if (bodyFat < 32) { category = 'Average'; color = '#f59e0b'; }
      else { category = 'Obese'; color = '#ef4444'; }
    }
    
    container.querySelector('#bodyfat').textContent = bodyFat.toFixed(1) + '%';
    container.querySelector('#bodyfat').style.color = color;
    container.querySelector('#category').textContent = category;
    
    const percent = (bodyFat / 40) * 100;
    container.querySelector('#scale-fill').style.width = percent + '%';
    
    container.querySelector('#fat-mass').textContent = fatMass.toFixed(1) + ' kg';
    container.querySelector('#lean-mass').textContent = leanMass.toFixed(1) + ' kg';
    
    container.querySelector('#result').classList.remove('hidden');
  }

  container.querySelector('#calc-btn').addEventListener('click', calculate);
  container.querySelectorAll('input, select').forEach(el => el.addEventListener('input', calculate));
  calculate();
  
  }
