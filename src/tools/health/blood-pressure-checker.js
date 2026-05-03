export function render(container) {
  container.innerHTML = `
    <div class="bp-container">
      <div class="bp-form">
        <div class="form-group">
          <label>Systolic (upper number)</label>
          <input type="number" id="systolic" value="120" min="70" max="250" />
        </div>
        <div class="form-group">
          <label>Diastolic (lower number)</label>
          <input type="number" id="diastolic" value="80" min="40" max="150" />
        </div>
        <button id="check-btn" class="calc-button">Check Reading</button>
      </div>
      <div id="result" class="result hidden">
        <div class="bp-gauge">
          <div class="gauge-bg">
            <div class="gauge-fill" id="gauge-fill"></div>
            <div class="gauge-marker" id="marker"></div>
          </div>
          <div class="gauge-labels">
            <span>Normal</span>
            <span>Elevated</span>
            <span>High</span>
            <span>Crisis</span>
          </div>
        </div>
        <div class="bp-reading">
          <div class="reading-value">
            <span id="systolic-val">120</span>
            <span class="separator">/</span>
            <span id="diastolic-val">80</span>
          </div>
          <div class="reading-label">mmHg</div>
        </div>
        <div class="bp-category" id="category"></div>
        <div class="bp-description" id="description"></div>
        <div class="bp-tips" id="tips"></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .bp-container { max-width: 500px; margin: 0 auto; }
    .bp-container h2 { text-align: center; margin-bottom: var(--space-6); }
    .bp-form { background: var(--color-surface); padding: var(--space-6); border-radius: var(--radius-xl); margin-bottom: var(--space-6); }
    .form-group { margin-bottom: var(--space-4); text-align: left; }
    .form-group label { display: block; margin-bottom: var(--space-2); font-weight: 500; }
    .form-group input { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-xl); text-align: center; }
    .calc-button { width: 100%; padding: var(--space-4); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .bp-gauge { margin-bottom: var(--space-6); }
    .gauge-bg { height: 16px; background: linear-gradient(90deg, #10b981 0%, #10b981 25%, #f59e0b 50%, #ef4444 75%, #dc2626 100%); border-radius: 8px; position: relative; }
    .gauge-fill { height: 100%; border-radius: 8px; }
    .gauge-marker { position: absolute; top: -4px; width: 4px; height: 24px; background: var(--color-text); transition: left 0.3s; }
    .gauge-labels { display: flex; justify-content: space-between; font-size: 10px; color: var(--color-text-muted); margin-top: var(--space-1); }
    .bp-reading { text-align: center; margin-bottom: var(--space-4); }
    .reading-value { font-size: 3rem; font-weight: 700; }
    .separator { color: var(--color-text-secondary); margin: 0 var(--space-2); }
    .reading-label { font-size: var(--text-sm); color: var(--color-text-secondary); }
    .bp-category { text-align: center; font-size: var(--text-xl); font-weight: 600; margin-bottom: var(--space-2); }
    .bp-description { text-align: center; color: var(--color-text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-4); }
    .bp-tips { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-lg); font-size: var(--text-sm); }
    .bp-tips ul { margin: 0; padding-left: var(--space-4); color: var(--color-text-secondary); }
    .bp-tips li { margin-bottom: var(--space-1); }
    .hidden { display: none; }
  `;
  container.appendChild(style);

  function check() {
    const sys = parseInt(container.querySelector('#systolic').value) || 120;
    const dia = parseInt(container.querySelector('#diastolic').value) || 80;
    
    container.querySelector('#systolic-val').textContent = sys;
    container.querySelector('#diastolic-val').textContent = dia;
    
    let category, color, desc, tips, pos;
    
    if (sys > 180 || dia > 120) {
      category = 'Hypertensive Crisis';
      color = '#dc2626';
      desc = 'Seek immediate medical attention';
      tips = '<ul><li>Call emergency services immediately</li><li>Do not wait</li><li>This is a medical emergency</li></ul>';
      pos = 95;
    } else if (sys >= 140 || dia >= 90) {
      category = 'High Blood Pressure (Stage 2)';
      color = '#ef4444';
      desc = 'Consult a healthcare provider';
      tips = '<ul><li>Schedule appointment soon</li><li>Reduce sodium intake</li><li>Exercise regularly</li><li>Limit alcohol</li></ul>';
      pos = 75;
    } else if (sys >= 130 || dia >= 80) {
      category = 'High Blood Pressure (Stage 1)';
      color = '#f59e0b';
      desc = 'Lifestyle changes recommended';
      tips = '<ul><li>Reduce sodium</li><li>Increase physical activity</li><li>Maintain healthy weight</li><li>Monitor regularly</li></ul>';
      pos = 55;
    } else if (sys >= 120 && sys < 130 && dia < 80) {
      category = 'Elevated';
      color = '#10b981';
      desc = 'Lifestyle modifications advised';
      tips = '<ul><li>Maintain healthy diet</li><li>Regular exercise</li><li>Monitor readings</li></ul>';
      pos = 35;
    } else {
      category = 'Normal';
      color = '#10b981';
      desc = 'Keep up the good work';
      tips = '<ul><li>Maintain healthy lifestyle</li><li>Regular check-ups</li><li>Stay active</li></ul>';
      pos = 15;
    }
    
    container.querySelector('#category').textContent = category;
    container.querySelector('#category').style.color = color;
    container.querySelector('#description').textContent = desc;
    container.querySelector('#tips').innerHTML = tips;
    container.querySelector('#marker').style.left = pos + '%';
    
    container.querySelector('#result').classList.remove('hidden');
  }

  container.querySelector('#check-btn').addEventListener('click', check);
  container.querySelectorAll('input').forEach(el => el.addEventListener('input', check));
  check();
  
  }
