import { createHealthCalculator } from './health-calculator.js';

export const toolConfig = {
  id: 'heart-rate-zones',
  name: 'Heart Rate Zones',
  category: 'health',
  description: 'Calculate target heart rate zones for exercise.',
  icon: '💓',
  status: 'done'
};

const RESULT_CSS = `
  .hr-max { text-align: center; margin-bottom: var(--space-6); padding: var(--space-4); background: var(--color-surface); border-radius: var(--radius-xl); }
  .max-label { font-size: var(--text-sm); color: var(--color-text-secondary); }
  .max-value { font-size: 3rem; font-weight: 700; color: var(--color-primary); }
  .max-formula { font-size: var(--text-xs); color: var(--color-text-muted); }
  .hr-zones { display: flex; flex-direction: column; gap: var(--space-3); }
  .hr-zone { padding: var(--space-4); border-radius: var(--radius-lg); color: white; }
  .hr-zone-1 { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
  .hr-zone-2 { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
  .hr-zone-3 { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
  .hr-zone-4 { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); }
  .hr-zone-5 { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
  .zone-header { display: flex; justify-content: space-between; margin-bottom: var(--space-1); }
  .zone-name { font-weight: 600; }
  .zone-pct { font-size: var(--text-sm); opacity: 0.9; }
  .zone-range { font-size: var(--text-2xl); font-weight: 700; margin-bottom: var(--space-1); }
  .zone-desc { font-size: var(--text-xs); opacity: 0.9; }
`;

const ZONE_DEFS = [
  { pct: '50-60%', desc: 'Very Light - Warm up, recovery', low: 0.5, high: 0.6, name: 'Zone 1', cls: 'hr-zone-1' },
  { pct: '60-70%', desc: 'Light - Fat burning, endurance', low: 0.6, high: 0.7, name: 'Zone 2', cls: 'hr-zone-2' },
  { pct: '70-80%', desc: 'Moderate - Aerobic fitness', low: 0.7, high: 0.8, name: 'Zone 3', cls: 'hr-zone-3' },
  { pct: '80-90%', desc: 'Hard - Anaerobic, speed', low: 0.8, high: 0.9, name: 'Zone 4', cls: 'hr-zone-4' },
  { pct: '90-100%', desc: 'Maximum - Peak performance', low: 0.9, high: 1.0, name: 'Zone 5', cls: 'hr-zone-5' }
];

export function render(container) {
  createHealthCalculator({
    container,
    containerClass: 'hr-container',
    calcButtonLabel: 'Calculate Zones',
    extraCSS: RESULT_CSS,
    fields: [
      { id: 'age', label: 'Age', value: 30, min: 10, max: 100 },
      { id: 'resting', label: 'Resting Heart Rate (bpm)', value: 70, min: 40, max: 120 }
    ],
    onCalculate: (container, resultEl) => {
      const age = parseInt(container.querySelector('#age').value) || 30;
      const resting = parseInt(container.querySelector('#resting').value) || 70;

      const maxHR = 220 - age;
      const hrr = maxHR - resting;

      const zoneHTML = ZONE_DEFS.map(z => {
        const low = Math.round(resting + hrr * z.low);
        const high = Math.round(resting + hrr * z.high);
        return `
          <div class="hr-zone ${z.cls}">
            <div class="zone-header">
              <span class="zone-name">${z.name}</span>
              <span class="zone-pct">${z.pct}</span>
            </div>
            <div class="zone-range">${low} - ${high} bpm</div>
            <div class="zone-desc">${z.desc}</div>
          </div>
        `;
      }).join('');

      resultEl.innerHTML = `
        <div class="hr-max">
          <div class="max-label">Max Heart Rate</div>
          <div class="max-value">${maxHR} bpm</div>
          <div class="max-formula">220 - ${age} = ${maxHR} bpm</div>
        </div>
        <div class="hr-zones">${zoneHTML}</div>
      `;
    }
  });
}
