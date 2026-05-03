export function render(container) {
  container.innerHTML = `
    <div class="bmi-container">
      <div class="bmi-form">
        <div class="form-group">
          <label>Height</label>
          <div class="input-group">
            <input type="number" id="height" value="170" min="50" max="300" />
            <select id="height-unit">
              <option value="cm" selected>cm</option>
              <option value="ft">ft/in</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Weight</label>
          <div class="input-group">
            <input type="number" id="weight" value="70" min="20" max="500" />
            <select id="weight-unit">
              <option value="kg" selected>kg</option>
              <option value="lbs">lbs</option>
            </select>
          </div>
        </div>
        <button id="calc-btn" class="calc-button">Calculate BMI</button>
      </div>
      <div id="result" class="result hidden">
        <div class="bmi-gauge">
          <div class="gauge-track">
            <div class="gauge-fill" id="gauge-fill"></div>
            <div class="gauge-marker" id="marker"></div>
          </div>
          <div class="gauge-labels">
            <span>Underweight</span>
            <span>Normal</span>
            <span>Overweight</span>
            <span>Obese</span>
          </div>
        </div>
        <div class="bmi-value">
          <div id="bmi-number"></div>
          <div id="bmi-category"></div>
        </div>
        <div class="bmi-info">
          <p>BMI is a measure of body fat based on height and weight.</p>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .bmi-container { max-width: 500px; margin: 0 auto; text-align: center; }
    .bmi-form { background: var(--color-surface); padding: var(--space-6); border-radius: var(--radius-xl); margin-bottom: var(--space-6); }
    .form-group { margin-bottom: var(--space-4); text-align: left; }
    .form-group label { display: block; margin-bottom: var(--space-2); font-weight: 500; }
    .input-group { display: flex; gap: var(--space-2); }
    .input-group input { flex: 1; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .input-group select { width: 80px; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .calc-button { width: 100%; padding: var(--space-4); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .bmi-gauge { margin-bottom: var(--space-6); }
    .gauge-track { height: 20px; background: linear-gradient(90deg, #3b82f6 0%, #10b981 25%, #10b981 50%, #f59e0b 75%, #ef4444 100%); border-radius: 10px; position: relative; margin-bottom: var(--space-2); }
    .gauge-fill { height: 100%; border-radius: 10px; }
    .gauge-marker { position: absolute; top: -5px; width: 4px; height: 30px; background: var(--color-text); transition: left 0.3s; }
    .gauge-labels { display: flex; justify-content: space-between; font-size: var(--text-xs); color: var(--color-text-secondary); }
    .bmi-value { font-size: 4rem; font-weight: 700; margin-bottom: var(--space-4); }
    .bmi-info { color: var(--color-text-secondary); font-size: var(--text-sm); }
    .hidden { display: none; }
  `;
  container.appendChild(style);

  function calculate() {
    let h = parseFloat(container.querySelector('#height').value) || 170;
    let w = parseFloat(container.querySelector('#weight').value) || 70;
    const hUnit = container.querySelector('#height-unit').value;
    const wUnit = container.querySelector('#weight-unit').value;
    
    if (hUnit === 'ft') { h = h * 30.48; }
    if (wUnit === 'lbs') { w = w * 0.453592; }
    
    const bmi = w / ((h / 100) ** 2);
    const bmiRounded = bmi.toFixed(1);
    
    let category, color;
    if (bmi < 18.5) { category = 'Underweight'; color = '#3b82f6'; }
    else if (bmi < 25) { category = 'Normal weight'; color = '#10b981'; }
    else if (bmi < 30) { category = 'Overweight'; color = '#f59e0b'; }
    else { category = 'Obese'; color = '#ef4444'; }
    
    container.querySelector('#bmi-number').textContent = bmiRounded;
    container.querySelector('#bmi-number').style.color = color;
    container.querySelector('#bmi-category').textContent = category;
    
    const percent = Math.min(100, Math.max(0, (bmi - 15) / 20 * 100));
    container.querySelector('#marker').style.left = percent + '%';
    container.querySelector('#result').classList.remove('hidden');
  }

  container.querySelector('#calc-btn').addEventListener('click', calculate);
  container.querySelectorAll('input, select').forEach(el => el.addEventListener('input', calculate));
  calculate();
}
