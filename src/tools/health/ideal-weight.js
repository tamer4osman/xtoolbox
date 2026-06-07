import { createHealthCalculator } from './health-calculator.js';

export const toolConfig = {
  id: 'ideal-weight',
  name: 'Ideal Weight Calculator',
  category: 'health',
  description: 'Calculate ideal weight range based on height and gender.',
  icon: '🎯',
  status: 'done'
};

const HEIGHT_FIELD = {
  type: 'custom',
  html: `
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
  `
};

const RESULT_CSS = `
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
`;

export function render(container) {
  createHealthCalculator({
    container,
    containerClass: 'weight-container',
    calcButtonLabel: 'Calculate',
    extraCSS: RESULT_CSS,
    fields: [
      HEIGHT_FIELD,
      { id: 'gender', type: 'select', label: 'Gender', options: [
        { value: 'male', label: 'Male', selected: true },
        { value: 'female', label: 'Female' }
      ]}
    ],
    onCalculate: (container, resultEl) => {
      let h = parseFloat(container.querySelector('#height').value) || 170;
      const unit = container.querySelector('#unit').value;
      const gender = container.querySelector('#gender').value;

      if (unit === 'ft') h = h * 30.48;

      const hM = h / 100;
      const minBMI = 18.5;
      const maxBMI = 24.9;

      const minKg = minBMI * hM * hM;
      const maxKg = maxBMI * hM * hM;

      const base = gender === 'male' ? 52 : 49;
      const robinson = base + 1.9 * (h / 2.54 - 60);
      const miller = base + 3.1 * (h / 2.54 - 60);
      const devine = base + 2.3 * (h / 2.54 - 60);

      const ideal = (robinson + miller + devine) / 3;

      resultEl.innerHTML = `
        <div class="weight-card">
          <div class="weight-range">
            <div class="range-label">Healthy BMI Range</div>
            <div class="range-values">
              <span>${minKg.toFixed(1)} kg</span>
              <span>to</span>
              <span>${maxKg.toFixed(1)} kg</span>
            </div>
          </div>
          <div class="ideal-weight">
            <div class="ideal-label">Ideal Weight</div>
            <div class="ideal-value">${ideal.toFixed(1)} kg</div>
          </div>
          <div class="weight-methods">
            <div class="method">
              <div class="method-name">Robinson Formula</div>
              <div class="method-value">${robinson.toFixed(1)} kg</div>
            </div>
            <div class="method">
              <div class="method-name">Miller Formula</div>
              <div class="method-value">${miller.toFixed(1)} kg</div>
            </div>
            <div class="method">
              <div class="method-name">Devine Formula</div>
              <div class="method-value">${devine.toFixed(1)} kg</div>
            </div>
          </div>
        </div>
      `;
    }
  });
}
