import { createHealthCalculator } from './health-calculator.js';

export const toolConfig = {
  id: 'blood-pressure-checker',
  name: 'Blood Pressure Checker',
  category: 'health',
  description: 'Check and categorize blood pressure readings.',
  icon: '❤️',
  status: 'done'
};

const RESULT_CSS = `
  .bp-form .form-group input { font-size: var(--text-xl); text-align: center; }
  .bp-gauge { margin-bottom: var(--space-6); }
  .gauge-bg { height: 16px; background: linear-gradient(90deg, #10b981 0%, #10b981 25%, #f59e0b 50%, #ef4444 75%, #dc2626 100%); border-radius: 8px; position: relative; }
  .gauge-fill { height: 100%; border-radius: 8px; }
  .gauge-marker { position: absolute; top: -4px; width: 4px; height: 24px; background: var(--color-text); transition: left 0.3s; }
  .gauge-labels { display: flex; justify-content: space-between; font-size: 10px; color: var(--color-text-muted); margin-top: var(--space-1); }
  .bp-reading { text-align: center; margin-bottom: var(--space-4); }
  .reading-value { font-size: 3rem; font-weight: 700; }
  .reading-sep { color: var(--color-text-secondary); margin: 0 var(--space-2); }
  .reading-label { font-size: var(--text-sm); color: var(--color-text-secondary); }
  .bp-category { text-align: center; font-size: var(--text-xl); font-weight: 600; margin-bottom: var(--space-2); }
  .bp-description { text-align: center; color: var(--color-text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-4); }
  .bp-tips { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-lg); font-size: var(--text-sm); }
  .bp-tips ul { margin: 0; padding-left: var(--space-4); color: var(--color-text-secondary); }
  .bp-tips li { margin-bottom: var(--space-1); }
`;

function classifyBp(sys, dia) {
  if (sys > 180 || dia > 120) {
    return { category: 'Hypertensive Crisis', color: '#dc2626', desc: 'Seek immediate medical attention',
      tips: '<ul><li>Call emergency services immediately</li><li>Do not wait</li><li>This is a medical emergency</li></ul>', pos: 95 };
  }
  if (sys >= 140 || dia >= 90) {
    return { category: 'High Blood Pressure (Stage 2)', color: '#ef4444', desc: 'Consult a healthcare provider',
      tips: '<ul><li>Schedule appointment soon</li><li>Reduce sodium intake</li><li>Exercise regularly</li><li>Limit alcohol</li></ul>', pos: 75 };
  }
  if (sys >= 130 || dia >= 80) {
    return { category: 'High Blood Pressure (Stage 1)', color: '#f59e0b', desc: 'Lifestyle changes recommended',
      tips: '<ul><li>Reduce sodium</li><li>Increase physical activity</li><li>Maintain healthy weight</li><li>Monitor regularly</li></ul>', pos: 55 };
  }
  if (sys >= 120 && sys < 130 && dia < 80) {
    return { category: 'Elevated', color: '#10b981', desc: 'Lifestyle modifications advised',
      tips: '<ul><li>Maintain healthy diet</li><li>Regular exercise</li><li>Monitor readings</li></ul>', pos: 35 };
  }
  return { category: 'Normal', color: '#10b981', desc: 'Keep up the good work',
    tips: '<ul><li>Maintain healthy lifestyle</li><li>Regular check-ups</li><li>Stay active</li></ul>', pos: 15 };
}

export function render(container) {
  createHealthCalculator({
    container,
    containerClass: 'bp-container',
    calcButtonLabel: 'Check Reading',
    extraCSS: RESULT_CSS,
    fields: [
      { id: 'systolic', label: 'Systolic (upper number)', value: 120, min: 70, max: 250 },
      { id: 'diastolic', label: 'Diastolic (lower number)', value: 80, min: 40, max: 150 }
    ],
    onCalculate: (container, resultEl) => {
      const sys = parseInt(container.querySelector('#systolic').value) || 120;
      const dia = parseInt(container.querySelector('#diastolic').value) || 80;
      const c = classifyBp(sys, dia);

      resultEl.innerHTML = `
        <div class="bp-gauge">
          <div class="gauge-bg">
            <div class="gauge-fill"></div>
            <div class="gauge-marker" style="left: ${c.pos}%;"></div>
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
            <span>${sys}</span>
            <span class="reading-sep">/</span>
            <span>${dia}</span>
          </div>
          <div class="reading-label">mmHg</div>
        </div>
        <div class="bp-category" style="color: ${c.color};">${c.category}</div>
        <div class="bp-description">${c.desc}</div>
        <div class="bp-tips">${c.tips}</div>
      `;
    }
  });
}
