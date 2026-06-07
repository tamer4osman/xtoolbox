import { createHealthCalculator } from './health-calculator.js';

export const toolConfig = {
  id: 'calorie-estimator',
  name: 'Calorie Estimator',
  category: 'health',
  description: 'Estimate daily calorie needs based on age, weight, height, and activity level.',
  icon: '🔥',
  status: 'done'
};

const ACTIVITY_OPTIONS = [
  { value: '1.2', label: 'Sedentary (little exercise)' },
  { value: '1.375', label: 'Light (exercise 1-3 days/week)' },
  { value: '1.55', label: 'Moderate (exercise 3-5 days/week)', selected: true },
  { value: '1.725', label: 'Active (exercise 6-7 days/week)' },
  { value: '1.9', label: 'Very Active (hard exercise daily)' }
];

const GOAL_OPTIONS = [
  { value: '-500', label: 'Lose weight (0.5 kg/week)' },
  { value: '-250', label: 'Slow weight loss' },
  { value: '0', label: 'Maintain weight', selected: true },
  { value: '250', label: 'Gain muscle' },
  { value: '500', label: 'Quick weight gain' }
];

const RESULT_CSS = `
  .calorie-card { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-6); text-align: center; }
  .calorie-main { margin-bottom: var(--space-6); padding-bottom: var(--space-6); border-bottom: 1px solid var(--color-border); }
  .calorie-label { font-size: var(--text-sm); color: var(--color-text-secondary); margin-bottom: var(--space-2); }
  .calorie-value { font-size: 3rem; font-weight: 700; color: var(--color-primary); }
  .calorie-breakdown { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-4); }
  .macro { text-align: center; }
  .macro-value { font-size: var(--text-xl); font-weight: 600; }
  .macro-label { font-size: var(--text-sm); color: var(--color-text-secondary); }
`;

export function render(container) {
  createHealthCalculator({
    container,
    containerClass: 'calorie-container',
    calcButtonLabel: 'Calculate',
    extraCSS: RESULT_CSS,
    fields: [
      { id: 'age', label: 'Age', value: 30, min: 15, max: 100 },
      { id: 'gender', type: 'select', label: 'Gender', options: [
        { value: 'male', label: 'Male', selected: true },
        { value: 'female', label: 'Female' }
      ]},
      { id: 'height', label: 'Height (cm)', value: 170, min: 100, max: 250 },
      { id: 'weight', label: 'Weight (kg)', value: 70, min: 30, max: 300 },
      { id: 'activity', type: 'select', label: 'Activity Level', options: ACTIVITY_OPTIONS },
      { id: 'goal', type: 'select', label: 'Goal', options: GOAL_OPTIONS }
    ],
    onCalculate: (container, resultEl) => {
      const age = parseInt(container.querySelector('#age').value) || 30;
      const gender = container.querySelector('#gender').value;
      const height = parseInt(container.querySelector('#height').value) || 170;
      const weight = parseFloat(container.querySelector('#weight').value) || 70;
      const activity = parseFloat(container.querySelector('#activity').value);
      const goal = parseInt(container.querySelector('#goal').value);

      const bmr = gender === 'male'
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

      const tdee = Math.round(bmr * activity + goal);

      const protein = Math.round(weight * 1.6);
      const carbs = Math.round(tdee * 0.35 / 4);
      const fat = Math.round(tdee * 0.25 / 9);

      resultEl.innerHTML = `
        <div class="calorie-card">
          <div class="calorie-main">
            <div class="calorie-label">Daily Calories</div>
            <div class="calorie-value">${tdee} kcal/day</div>
          </div>
          <div class="calorie-breakdown">
            <div class="macro">
              <div class="macro-value">${protein}g</div>
              <div class="macro-label">Protein</div>
            </div>
            <div class="macro">
              <div class="macro-value">${carbs}g</div>
              <div class="macro-label">Carbs</div>
            </div>
            <div class="macro">
              <div class="macro-value">${fat}g</div>
              <div class="macro-label">Fat</div>
            </div>
          </div>
        </div>
      `;
    }
  });
}
