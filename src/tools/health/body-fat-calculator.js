import { createHealthCalculator } from './health-calculator.js';

export const toolConfig = {
  id: 'body-fat-calculator',
  name: 'Body Fat Calculator',
  category: 'health',
  description: 'Estimate body fat percentage using US Navy method.',
  icon: '⚖️',
  status: 'done'
};

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male', selected: true },
  { value: 'female', label: 'Female' }
];

const RESULT_CSS = `
  .bf-display { text-align: center; margin-bottom: var(--space-6); }
  .bf-value { font-size: 3.5rem; font-weight: 700; }
  .bf-category { font-size: var(--text-lg); color: var(--color-text-secondary); }
  .bf-scale { margin-bottom: var(--space-6); }
  .scale-bar { height: 12px; background: linear-gradient(90deg, #3b82f6 0%, #10b981 25%, #10b981 50%, #f59e0b 75%, #ef4444 100%); border-radius: 6px; position: relative; overflow: hidden; }
  .scale-labels { display: flex; justify-content: space-between; font-size: 10px; color: var(--color-text-muted); margin-top: var(--space-1); }
  .bf-mass { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
  .mass-item { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-lg); text-align: center; }
  .mass-value { font-size: var(--text-xl); font-weight: 700; }
  .mass-label { font-size: var(--text-sm); color: var(--color-text-secondary); }
`;

export function bodyFatPercent({ gender, height, neck, waist, hip }) {
  let bf;
  if (gender === 'male') {
    bf = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
  } else {
    bf = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
  }
  return Math.max(2, Math.min(60, bf));
}

export function scaleBarPercent(bodyFat) {
  return Math.min(100, (bodyFat / 40) * 100);
}

export function classifyBodyFat(gender, bf) {
  if (gender === 'male') {
    if (bf < 6) return ['Essential Fat', '#3b82f6'];
    if (bf < 14) return ['Athletes', '#10b981'];
    if (bf < 18) return ['Fitness', '#10b981'];
    if (bf < 25) return ['Average', '#f59e0b'];
    return ['Obese', '#ef4444'];
  }
  if (bf < 14) return ['Essential Fat', '#3b82f6'];
  if (bf < 21) return ['Athletes', '#10b981'];
  if (bf < 25) return ['Fitness', '#10b981'];
  if (bf < 32) return ['Average', '#f59e0b'];
  return ['Obese', '#ef4444'];
}

export function render(container) {
  createHealthCalculator({
    container,
    containerClass: 'bf-container',
    calcButtonLabel: 'Calculate Body Fat %',
    extraCSS: RESULT_CSS,
    fields: [
      { id: 'gender', type: 'select', label: 'Gender', options: GENDER_OPTIONS },
      { id: 'height', label: 'Height (cm)', value: 170, min: 100, max: 250 },
      { id: 'weight', label: 'Weight (kg)', value: 70, min: 30, max: 300 },
      { id: 'neck', label: 'Neck (cm)', value: 38, min: 20, max: 60 },
      { id: 'waist', label: 'Waist (cm)', value: 85, min: 40, max: 200 },
      { id: 'hip', label: 'Hip (cm)', value: 95, min: 50, max: 200 }
    ],
    onCalculate: (container, resultEl) => {
      const gender = container.querySelector('#gender').value;
      const height = parseFloat(container.querySelector('#height').value) || 170;
      const weight = parseFloat(container.querySelector('#weight').value) || 70;
      const neck = parseFloat(container.querySelector('#neck').value) || 38;
      const waist = parseFloat(container.querySelector('#waist').value) || 85;
      const hip = parseFloat(container.querySelector('#hip').value) || 95;

      const bodyFat = bodyFatPercent({ gender, height, neck, waist, hip });
      const fatMass = weight * bodyFat / 100;
      const leanMass = weight - fatMass;
      const [category, color] = classifyBodyFat(gender, bodyFat);
      const percent = scaleBarPercent(bodyFat);

      resultEl.innerHTML = `
        <div class="bf-display">
          <div class="bf-value" style="color: ${color};">${bodyFat.toFixed(1)}%</div>
          <div class="bf-category">${category}</div>
        </div>
        <div class="bf-scale">
          <div class="scale-bar"><div style="width: ${percent}%; height: 100%;"></div></div>
          <div class="scale-labels">
            <span>Essential</span>
            <span>Athletes</span>
            <span>Fitness</span>
            <span>Average</span>
            <span>Obese</span>
          </div>
        </div>
        <div class="bf-mass">
          <div class="mass-item">
            <div class="mass-value">${fatMass.toFixed(1)} kg</div>
            <div class="mass-label">Body Fat</div>
          </div>
          <div class="mass-item">
            <div class="mass-value">${leanMass.toFixed(1)} kg</div>
            <div class="mass-label">Lean Mass</div>
          </div>
        </div>
      `;
    }
  });
}
