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
      <label>Height (cm or ft/in)</label>
      <div class="input-group" id="height-group">
        <input type="number" id="height" value="170" min="100" max="250" />
        <input type="number" id="height-feet" value="5" min="1" max="8" style="display:none" />
        <input type="number" id="height-inches" value="7" min="0" max="11" style="display:none" />
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
      const unitEl = container.querySelector('#unit');
      const unit = unitEl.value;
      const gender = container.querySelector('#gender').value;

      if (!unitEl._toggleWired) {
        const cmInput = container.querySelector('#height');
        const ftInput = container.querySelector('#height-feet');
        const inInput = container.querySelector('#height-inches');
        unitEl.addEventListener('change', () => {
          const isMetric = unitEl.value === 'cm';
          cmInput.style.display = isMetric ? '' : 'none';
          ftInput.style.display = isMetric ? 'none' : '';
          inInput.style.display = isMetric ? 'none' : '';
        });
        unitEl._toggleWired = true;
      }

      let h;
      if (unit === 'ft') {
        const feet = parseFloat(container.querySelector('#height-feet').value) || 5;
        const inches = parseFloat(container.querySelector('#height-inches').value) || 0;
        h = (feet * 12 + inches) * 2.54;
      } else {
        h = parseFloat(container.querySelector('#height').value) || 170;
      }

      const hM = h / 100;
      const minBMI = 18.5;
      const maxBMI = 24.9;
      const minKg = minBMI * hM * hM;
      const maxKg = maxBMI * hM * hM;

      const base = gender === 'male' ? 52 : 49;
      const inches = h / 2.54 - 60;
      const calc = (factor) => base + factor * inches;

      const weights = {
        robinson: calc(1.9),
        miller: calc(3.1),
        devine: calc(2.3),
        ideal: (calc(1.9) + calc(3.1) + calc(2.3)) / 3
      };

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
            <div class="ideal-value">${weights.ideal.toFixed(1)} kg</div>
          </div>
          <div class="weight-methods">
            <div class="method">
              <div class="method-name">Robinson Formula</div>
              <div class="method-value">${weights.robinson.toFixed(1)} kg</div>
            </div>
            <div class="method">
              <div class="method-name">Miller Formula</div>
              <div class="method-value">${weights.miller.toFixed(1)} kg</div>
            </div>
            <div class="method">
              <div class="method-name">Devine Formula</div>
              <div class="method-value">${weights.devine.toFixed(1)} kg</div>
            </div>
          </div>
        </div>
      `;
    }
  });
}
