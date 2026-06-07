import { createFinanceCalculator } from './finance-calculator-factory.js';

export const toolConfig = {
  id: 'inflation-calculator',
  name: 'Inflation Calculator',
  category: 'finance',
  description: 'Calculate the value of money adjusted for inflation over time.',
  icon: '📊',
  status: 'done'
};

export function render(container) {
  createFinanceCalculator({
    container,
    toolId: 'inflation',
    icon: toolConfig.icon,
    title: toolConfig.name,
    description: toolConfig.description,
    cardColor: 'red',
    formHTML: `
      <div class="form-group">
        <label>Current Amount ($)</label>
        <input type="number" id="amount" value="10000" min="1" />
      </div>
      <div class="form-group">
        <label>Inflation Rate (% per year)</label>
        <input type="number" id="rate" value="3" min="0" step="0.1" />
      </div>
      <div class="form-group">
        <label>Years in the Future</label>
        <input type="number" id="years" value="10" min="1" max="100" />
      </div>
    `,
    calculate: ({ amount, rate, years }) => {
      const a = parseFloat(amount);
      const r = parseFloat(rate) / 100;
      const y = parseInt(years);
      const factor = Math.pow(1 + r, y);
      const future = a / factor;
      const lost = a - future;
      const powerPercent = (1 / factor) * 100;
      return {
        primary: { label: 'Future Value', value: '$' + future.toFixed(2) },
        items: [
          { label: 'Lost Value', value: '$' + lost.toFixed(2) },
          { label: 'Purchasing Power', value: powerPercent.toFixed(1) + '%' }
        ],
        extras: `<div class="buying-power" style="background:var(--color-surface);border-radius:var(--radius-lg);padding:var(--space-4);text-align:center;"><h3 style="margin-bottom:var(--space-2);">What you could buy</h3><p>In ${y} years, $${a.toLocaleString()} will have the purchasing power of $${future.toFixed(2)} today</p></div>`
      };
    }
  });
}
