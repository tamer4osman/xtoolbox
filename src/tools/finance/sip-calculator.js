import { createFinanceCalculator } from './finance-calculator-factory.js';

export const toolConfig = {
  id: 'sip-calculator',
  name: 'SIP Calculator',
  category: 'finance',
  description: 'Calculate returns on Systematic Investment Plan (SIP).',
  icon: '📈',
  status: 'done'
};

export function render(container) {
  createFinanceCalculator({
    container,
    toolId: 'sip',
    icon: toolConfig.icon,
    title: toolConfig.name,
    description: toolConfig.description,
    cardColor: 'purple',
    formHTML: `
      <div class="form-group">
        <label>Monthly Investment ($)</label>
        <input type="number" id="monthly" value="500" min="10" />
      </div>
      <div class="form-group">
        <label>Expected Return Rate (% per year)</label>
        <input type="number" id="rate" value="12" min="1" max="50" step="0.5" />
      </div>
      <div class="form-group">
        <label>Investment Period (years)</label>
        <input type="number" id="years" value="10" min="1" max="40" />
      </div>
    `,
    calculate: ({ monthly, rate, years }) => {
      const m = parseFloat(monthly);
      const r = parseFloat(rate) / 100 / 12;
      const y = parseInt(years);
      let fv = 0;
      let invested = 0;
      let rows = '';
      for (let yr = 1; yr <= y; yr++) {
        for (let mo = 1; mo <= 12; mo++) {
          fv += m * (1 + r);
          invested += m;
        }
        rows += `<div class="breakdown-item" style="display:flex;justify-content:space-between;padding:var(--space-2) 0;border-bottom:1px solid var(--color-border);"><span>Year ${yr}</span><span>$${Math.round(fv).toLocaleString()}</span></div>`;
      }
      const returns = fv - invested;
      return {
        primary: { label: 'Future Value', value: '$' + Math.round(fv).toLocaleString() },
        items: [
          { label: 'Total Invested', value: '$' + invested.toLocaleString() },
          { label: 'Total Returns', value: '$' + Math.round(returns).toLocaleString() }
        ],
        extras: `<div class="result-breakdown" style="background:var(--color-surface);border-radius:var(--radius-lg);padding:var(--space-4);"><h3 style="margin-bottom:var(--space-2);">Yearly Breakdown</h3>${rows}</div>`
      };
    }
  });
}
