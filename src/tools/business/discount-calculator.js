import { initBusinessCalc } from './business-calc-factory.js';

export const toolConfig = {
  id: 'discount-calculator',
  name: 'Discount Calculator',
  category: 'business',
  description: 'Calculate savings and final price after discounts.',
  icon: '💰',
  status: 'done'
};

export function render(container) {
  initBusinessCalc(container, {
    title: 'Discount Calculator',
    inputs: [
      { id: 'price', placeholder: 'Original Price', value: 100 },
      { id: 'percent', placeholder: 'Discount %', value: 20 }
    ],
    resultHTML: `
      <div>Final Price: <strong id="final">$80.00</strong></div>
      <div>You Save: <strong id="save">$20.00</strong></div>
    `,
    calc({ get, el }) {
      const saved = get('price') * get('percent') / 100;
      el('final').textContent = '$' + (get('price') - saved).toFixed(2);
      el('save').textContent = '$' + saved.toFixed(2);
    }
  });
}
