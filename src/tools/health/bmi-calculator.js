import { createHealthCalculator } from './health-calculator.js';

export const toolConfig = {
  id: 'bmi-calculator',
  name: 'BMI Calculator',
  category: 'health',
  description: 'Calculate Body Mass Index with health category and visual gauge.',
  icon: '⚖️',
  status: 'done'
};

const HEIGHT_FIELD = {
  type: 'custom',
  html: `
    <div class="form-group">
      <label>Height (cm or ft/in)</label>
      <div class="input-group" id="height-group">
        <input type="number" id="height" value="170" min="50" max="300" />
        <input type="number" id="height-feet" value="5" min="1" max="8" style="display:none" />
        <input type="number" id="height-inches" value="7" min="0" max="11" style="display:none" />
        <select id="height-unit">
          <option value="cm" selected>cm</option>
          <option value="ft">ft/in</option>
        </select>
      </div>
    </div>
  `
};

const WEIGHT_FIELD = {
  type: 'custom',
  html: `
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
  `
};

const CONTAINER_EXTRA = `text-align: center;`;
const RESULT_CSS = `
  .bmi-gauge { margin-bottom: var(--space-6); }
  .gauge-track { height: 20px; background: linear-gradient(90deg, #3b82f6 0%, #10b981 25%, #10b981 50%, #f59e0b 75%, #ef4444 100%); border-radius: 10px; position: relative; margin-bottom: var(--space-2); }
  .gauge-fill { height: 100%; border-radius: 10px; }
  .gauge-marker { position: absolute; top: -5px; width: 4px; height: 30px; background: var(--color-text); transition: left 0.3s; }
  .gauge-labels { display: flex; justify-content: space-between; font-size: var(--text-xs); color: var(--color-text-secondary); }
  .bmi-value { font-size: 4rem; font-weight: 700; margin-bottom: var(--space-4); }
  .bmi-info { color: var(--color-text-secondary); font-size: var(--text-sm); }
`;

function classifyBmi(bmi) {
  if (bmi < 18.5) return ['Underweight', '#3b82f6'];
  if (bmi < 25) return ['Normal weight', '#10b981'];
  if (bmi < 30) return ['Overweight', '#f59e0b'];
  return ['Obese', '#ef4444'];
}

export function feetInchesToCm(feet, inches) {
  return (feet * 12 + inches) * 2.54;
}

export function render(container) {
  createHealthCalculator({
    container,
    containerClass: 'bmi-container',
    calcButtonLabel: 'Calculate BMI',
    extraCSS: CONTAINER_EXTRA + RESULT_CSS,
    fields: [HEIGHT_FIELD, WEIGHT_FIELD],
    onCalculate: (container, resultEl) => {
      const hUnit = container.querySelector('#height-unit').value;

      const heightUnit = container.querySelector('#height-unit');
      if (!heightUnit._toggleWired) {
        const cmInput = container.querySelector('#height');
        const ftInput = container.querySelector('#height-feet');
        const inInput = container.querySelector('#height-inches');
        heightUnit.addEventListener('change', () => {
          const isMetric = heightUnit.value === 'cm';
          cmInput.style.display = isMetric ? '' : 'none';
          ftInput.style.display = isMetric ? 'none' : '';
          inInput.style.display = isMetric ? 'none' : '';
        });
        heightUnit._toggleWired = true;
      }

      let h;
      if (hUnit === 'ft') {
        const feet = parseFloat(container.querySelector('#height-feet').value) || 5;
        const inches = parseFloat(container.querySelector('#height-inches').value) || 0;
        h = feetInchesToCm(feet, inches);
      } else {
        h = parseFloat(container.querySelector('#height').value) || 170;
      }

      let w = parseFloat(container.querySelector('#weight').value) || 70;
      const wUnit = container.querySelector('#weight-unit').value;
      if (wUnit === 'lbs') w = w * 0.453592;

      const bmi = w / ((h / 100) ** 2);
      const bmiRounded = bmi.toFixed(1);
      const [category, color] = classifyBmi(bmi);
      const percent = Math.min(100, Math.max(0, (bmi - 15) / 20 * 100));

      resultEl.innerHTML = `
        <div class="bmi-gauge">
          <div class="gauge-track">
            <div class="gauge-fill" id="gauge-fill"></div>
            <div class="gauge-marker" id="marker" style="left: ${percent}%;"></div>
          </div>
          <div class="gauge-labels">
            <span>Underweight</span>
            <span>Normal</span>
            <span>Overweight</span>
            <span>Obese</span>
          </div>
        </div>
        <div class="bmi-value" style="color: ${color};">${bmiRounded}</div>
        <div class="bmi-category" style="color: ${color};">${category}</div>
        <div class="bmi-info">
          <p>BMI is a measure of body fat based on height and weight.</p>
        </div>
      `;
    }
  });
}
