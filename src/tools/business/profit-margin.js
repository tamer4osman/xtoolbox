import { initBusinessCalc } from './business-calc-factory.js';

export const toolConfig = {
  id: 'profit-margin',
  name: 'Profit Margin Calculator',
  category: 'business',
  description: 'Calculate gross and net profit margins.',
  icon: '💵',
  status: 'done'
};

export function render(container) {
  initBusinessCalc(container, {
    title: 'Profit Margin Calculator',
    inputs: [
      { id: 'revenue', placeholder: 'Revenue', value: 1000 },
      { id: 'cogs', placeholder: 'Cost of Goods Sold', value: 600 }
    ],
    resultHTML: `
      <div>Gross Profit: <strong id="gross">$400</strong></div>
      <div>Gross Margin: <strong id="gm">40%</strong></div>
      <div>Net Margin: <strong id="nm">40%</strong></div>
    `,
    calc({ get, el }) {
      const gross = get('revenue') - get('cogs');
      const gm = get('revenue') ? (gross / get('revenue') * 100) : 0;
      el('gross').textContent = '$' + gross;
      el('gm').textContent = gm.toFixed(1) + '%';
      el('nm').textContent = gm.toFixed(1) + '%';
    }
  });
}
