export function render(container) {
  container.innerHTML = `
    <div class="water-container">
      <div class="water-form">
        <div class="form-group">
          <label>Weight (kg)</label>
          <input type="number" id="weight" value="70" min="30" max="300" />
        </div>
        <div class="form-group">
          <label>Activity Level</label>
          <select id="activity">
            <option value="0.5">Sedentary (desk job)</option>
            <option value="0.6" selected>Light (walks)</option>
            <option value="0.7">Moderate (exercise 3x/week)</option>
            <option value="0.8">Active (daily exercise)</option>
            <option value="1.0">Very Active (athlete)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Climate</label>
          <select id="climate">
            <option value="0.9">Cold/Temperate</option>
            <option value="1" selected>Moderate</option>
            <option value="1.1">Hot/Humid</option>
          </select>
        </div>
        <button id="calc-btn" class="calc-button">Calculate</button>
      </div>
      <div id="result" class="result hidden">
        <div class="water-display">
          <div class="water-icon">💧</div>
          <div class="water-value" id="water"></div>
          <div class="water-label">daily intake</div>
        </div>
        <div class="water-breakdown">
          <div class="breakdown-item">
            <div class="breakdown-icon">🥤</div>
            <div class="breakdown-value" id="glasses"></div>
            <div class="breakdown-label">glasses (250ml)</div>
          </div>
          <div class="breakdown-item">
            <div class="breakdown-icon">🧴</div>
            <div class="breakdown-value" id="bottles"></div>
            <div class="breakdown-label">bottles (500ml)</div>
          </div>
          <div class="breakdown-item">
            <div class="breakdown-icon">⏰</div>
            <div class="breakdown-value" id="hourly"></div>
            <div class="breakdown-label">per hour</div>
          </div>
        </div>
        <div class="water-tips">
          <h3>💡 Tips</h3>
          <ul>
            <li>Drink more during exercise and hot weather</li>
            <li>Start your day with a glass of water</li>
            <li>Drink before you feel thirsty</li>
            <li>Monitor urine color - pale = good</li>
          </ul>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .water-container { max-width: 500px; margin: 0 auto; }
    .water-container h2 { text-align: center; margin-bottom: var(--space-6); }
    .water-form { background: var(--color-surface); padding: var(--space-6); border-radius: var(--radius-xl); margin-bottom: var(--space-6); }
    .form-group { margin-bottom: var(--space-4); text-align: left; }
    .form-group label { display: block; margin-bottom: var(--space-2); font-weight: 500; }
    .form-group input, .form-group select { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .calc-button { width: 100%; padding: var(--space-4); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .water-display { text-align: center; margin-bottom: var(--space-6); }
    .water-icon { font-size: 4rem; margin-bottom: var(--space-2); }
    .water-value { font-size: 3rem; font-weight: 700; color: #3b82f6; }
    .water-label { color: var(--color-text-secondary); }
    .water-breakdown { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-6); }
    .breakdown-item { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-lg); text-align: center; }
    .breakdown-icon { font-size: 1.5rem; margin-bottom: var(--space-1); }
    .breakdown-value { font-size: var(--text-xl); font-weight: 600; }
    .breakdown-label { font-size: var(--text-xs); color: var(--color-text-secondary); }
    .water-tips { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-lg); }
    .water-tips h3 { font-size: var(--text-sm); margin-bottom: var(--space-3); }
    .water-tips ul { margin: 0; padding-left: var(--space-4); font-size: var(--text-sm); color: var(--color-text-secondary); }
    .water-tips li { margin-bottom: var(--space-1); }
    .hidden { display: none; }
  `;
  container.appendChild(style);

  function calculate() {
    const weight = parseFloat(container.querySelector('#weight').value) || 70;
    const activity = parseFloat(container.querySelector('#activity').value);
    const climate = parseFloat(container.querySelector('#climate').value);
    
    const baseWater = weight * 0.033;
    const water = Math.round(baseWater * activity * climate * 10) / 10;
    
    container.querySelector('#water').textContent = water + ' L';
    container.querySelector('#glasses').textContent = Math.round(water * 4);
    container.querySelector('#bottles').textContent = Math.round(water * 2);
    container.querySelector('#hourly').textContent = Math.round(water / 16 * 10) / 10 + ' L';
    
    container.querySelector('#result').classList.remove('hidden');
  }

  container.querySelector('#calc-btn').addEventListener('click', calculate);
  container.querySelectorAll('input, select').forEach(el => el.addEventListener('input', calculate));
  calculate();
  
  }
