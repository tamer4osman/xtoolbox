import { createHealthCalculator } from './health-calculator.js';

export const toolConfig = {
  id: 'water-intake-calculator',
  name: 'Water Intake Calculator',
  category: 'health',
  description: 'Calculate daily hydration needs based on weight.',
  icon: '💧',
  status: 'done'
};

const ACTIVITY_OPTIONS = [
  { value: '0.5', label: 'Sedentary (desk job)' },
  { value: '0.6', label: 'Light (walks)', selected: true },
  { value: '0.7', label: 'Moderate (exercise 3x/week)' },
  { value: '0.8', label: 'Active (daily exercise)' },
  { value: '1.0', label: 'Very Active (athlete)' }
];

const CLIMATE_OPTIONS = [
  { value: '0.9', label: 'Cold/Temperate' },
  { value: '1', label: 'Moderate', selected: true },
  { value: '1.1', label: 'Hot/Humid' }
];

const RESULT_CSS = `
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
`;

export function render(container) {
  createHealthCalculator({
    container,
    containerClass: 'water-container',
    calcButtonLabel: 'Calculate',
    extraCSS: RESULT_CSS,
    fields: [
      { id: 'weight', label: 'Weight (kg)', value: 70, min: 30, max: 300 },
      { id: 'activity', type: 'select', label: 'Activity Level', options: ACTIVITY_OPTIONS },
      { id: 'climate', type: 'select', label: 'Climate', options: CLIMATE_OPTIONS }
    ],
    onCalculate: (container, resultEl) => {
      const weight = parseFloat(container.querySelector('#weight').value) || 70;
      const activity = parseFloat(container.querySelector('#activity').value);
      const climate = parseFloat(container.querySelector('#climate').value);

      const baseWater = weight * 0.033;
      const water = Math.round(baseWater * activity * climate * 10) / 10;

      resultEl.innerHTML = `
        <div class="water-display">
          <div class="water-icon">💧</div>
          <div class="water-value">${water} L</div>
          <div class="water-label">daily intake</div>
        </div>
        <div class="water-breakdown">
          <div class="breakdown-item">
            <div class="breakdown-icon">🥤</div>
            <div class="breakdown-value">${Math.round(water * 4)}</div>
            <div class="breakdown-label">glasses (250ml)</div>
          </div>
          <div class="breakdown-item">
            <div class="breakdown-icon">🧴</div>
            <div class="breakdown-value">${Math.round(water * 2)}</div>
            <div class="breakdown-label">bottles (500ml)</div>
          </div>
          <div class="breakdown-item">
            <div class="breakdown-icon">⏰</div>
            <div class="breakdown-value">${Math.round(water / 16 * 10) / 10} L</div>
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
      `;
    }
  });
}
