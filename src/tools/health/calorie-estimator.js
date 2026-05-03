export function render(container) {
  container.innerHTML = `
    <div class="calorie-container">
      <div class="calorie-form">
        <div class="form-group">
          <label>Age</label>
          <input type="number" id="age" value="30" min="15" max="100" />
        </div>
        <div class="form-group">
          <label>Gender</label>
          <select id="gender">
            <option value="male" selected>Male</option>
            <option value="female">Female</option>
          </select>
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
          <label>Activity Level</label>
          <select id="activity">
            <option value="1.2">Sedentary (little exercise)</option>
            <option value="1.375">Light (exercise 1-3 days/week)</option>
            <option value="1.55" selected>Moderate (exercise 3-5 days/week)</option>
            <option value="1.725">Active (exercise 6-7 days/week)</option>
            <option value="1.9">Very Active (hard exercise daily)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Goal</label>
          <select id="goal">
            <option value="-500">Lose weight (0.5 kg/week)</option>
            <option value="-250">Slow weight loss</option>
            <option value="0" selected>Maintain weight</option>
            <option value="250">Gain muscle</option>
            <option value="500">Quick weight gain</option>
          </select>
        </div>
        <button id="calc-btn" class="calc-button">Calculate</button>
      </div>
      <div id="result" class="result hidden">
        <div class="calorie-card">
          <div class="calorie-main">
            <div class="calorie-label">Daily Calories</div>
            <div class="calorie-value" id="calories"></div>
          </div>
          <div class="calorie-breakdown">
            <div class="macro">
              <div class="macro-value" id="protein">150g</div>
              <div class="macro-label">Protein</div>
            </div>
            <div class="macro">
              <div class="macro-value" id="carbs">200g</div>
              <div class="macro-label">Carbs</div>
            </div>
            <div class="macro">
              <div class="macro-value" id="fat">65g</div>
              <div class="macro-label">Fat</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .calorie-container { max-width: 500px; margin: 0 auto; }
    .calorie-container h2 { text-align: center; margin-bottom: var(--space-6); }
    .calorie-form { background: var(--color-surface); padding: var(--space-6); border-radius: var(--radius-xl); margin-bottom: var(--space-6); }
    .form-group { margin-bottom: var(--space-4); }
    .form-group label { display: block; margin-bottom: var(--space-2); font-weight: 500; }
    .form-group input, .form-group select { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .calc-button { width: 100%; padding: var(--space-4); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .calorie-card { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-6); text-align: center; }
    .calorie-main { margin-bottom: var(--space-6); padding-bottom: var(--space-6); border-bottom: 1px solid var(--color-border); }
    .calorie-label { font-size: var(--text-sm); color: var(--color-text-secondary); margin-bottom: var(--space-2); }
    .calorie-value { font-size: 3rem; font-weight: 700; color: var(--color-primary); }
    .calorie-breakdown { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-4); }
    .macro { text-align: center; }
    .macro-value { font-size: var(--text-xl); font-weight: 600; }
    .macro-label { font-size: var(--text-sm); color: var(--color-text-secondary); }
    .hidden { display: none; }
  `;
  container.appendChild(style);

  function calculate() {
    const age = parseInt(container.querySelector('#age').value) || 30;
    const gender = container.querySelector('#gender').value;
    const height = parseInt(container.querySelector('#height').value) || 170;
    const weight = parseFloat(container.querySelector('#weight').value) || 70;
    const activity = parseFloat(container.querySelector('#activity').value);
    const goal = parseInt(container.querySelector('#goal').value);
    
    let bmr = gender === 'male' 
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
    
    const tdee = Math.round(bmr * activity + goal);
    
    container.querySelector('.calorie-value').textContent = tdee + ' kcal/day';
    
    const protein = Math.round(weight * 1.6);
    const carbs = Math.round(tdee * 0.35 / 4);
    const fat = Math.round(tdee * 0.25 / 9);
    
    container.querySelector('#protein').textContent = protein + 'g';
    container.querySelector('#carbs').textContent = carbs + 'g';
    container.querySelector('#fat').textContent = fat + 'g';
    
    container.querySelector('#result').classList.remove('hidden');
  }

  container.querySelector('#calc-btn').addEventListener('click', calculate);
  container.querySelectorAll('input, select').forEach(el => el.addEventListener('input', calculate));
  calculate();
  
  }
