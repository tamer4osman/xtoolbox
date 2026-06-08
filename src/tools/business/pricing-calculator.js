import { initBusinessCalc } from './business-calc-factory.js';

export const toolConfig = {
  id: 'pricing-calculator',
  name: 'Pricing Calculator',
  category: 'business',
  description: 'Calculate optimal product pricing based on costs.',
  icon: '🏷️',
  status: 'done'
};

export function render(container) {
  initBusinessCalc(container, {
    title: 'Pricing Calculator',
    inputs: [
      { id: 'cost', placeholder: 'Cost', value: 100 },
      { id: 'margin', placeholder: 'Margin %', value: 30 },
      { id: 'tax', placeholder: 'Tax %', value: 0 }
    ],
    resultHTML: `
      <div>Price: <strong id="price">$0.00</strong></div>
      <div>Profit: <strong id="profit">$0.00</strong></div>
      <div>Tax: <strong id="taxOut">$0.00</strong></div>
    `,
    calc({ get, el }) {
      const profit = get('cost') * get('margin') / 100;
      el('price').textContent = '$' + (get('cost') + profit + get('cost') * get('tax') / 100).toFixed(2);
      el('profit').textContent = '$' + profit.toFixed(2);
      el('taxOut').textContent = '$' + (get('cost') * get('tax') / 100).toFixed(2);
    }
  });
}
