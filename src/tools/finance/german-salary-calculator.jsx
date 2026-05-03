export const toolConfig = {
  id: 'german-salary-calculator',
  name: 'German Salary Calculator',
  category: 'finance',
  description: 'Calculate German net salary from gross (with taxes, social contributions).',
  icon: '🇩🇪',
  steps: ['Enter gross salary', 'Calculate net']
};

export function render(container) {
  container.innerHTML = `
    <div class="de-container">
      <label>Annual Gross Salary (€)</label><input type="number" id="de-salary" value="60000">
      <label>Tax Class</label>
      <select id="de-class">
        <option value="1">Class 1 (Single)</option>
        <option value="2">Class 2 (Single Parent)</option>
        <option value="3">Class 3 (Married, Higher Earner)</option>
        <option value="4">Class 4 (Married, Equal)</option>
        <option value="5">Class 5 (Married, Lower Earner)</option>
        <option value="6">Class 6 (Second Job)</option>
      </select>
      <label>Church Tax</label>
      <select id="de-church">
        <option value="no">No</option>
        <option value="yes">Yes (8-9%)</option>
      </select>
      <button id="de-calc">Calculate Net Salary</button>
      <div class="de-results" id="de-results"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .de-container { max-width: 400px; margin: 0 auto; }
    .de-container label { display: block; font-size: var(--text-sm); margin-bottom: var(--space-1); color: var(--color-text-secondary); }
    .de-container input, .de-container select { width: 100%; padding: var(--space-3); border: 1px solid #ddd; border-radius: var(--radius-md); margin-bottom: var(--space-3); }
    #de-calc { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; }
    .de-row { display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid #eee; }
    .de-row.total { font-weight: bold; font-size: var(--text-lg); border-top: 2px solid var(--color-primary); border-bottom: none; padding-top: var(--space-3); margin-top: var(--space-2); }
    .de-row.net { color: #2e7d32; font-size: var(--text-xl); }
  `;
  container.appendChild(style);

  container.querySelector('#de-calc').addEventListener('click', () => {
    const gross = parseFloat(container.querySelector('#de-salary').value);
    const taxClass = parseInt(container.querySelector('#de-class').value);
    const church = container.querySelector('#de-church').value === 'yes';

    let tax = 0;
    const yearly = gross;
    let taxBase = yearly - 11604;
    if (taxBase > 0) {
      if (taxBase <= 17005) tax = (taxBase - 11604) * 0.14 + 1025.38;
      else if (taxBase <= 66760) tax = (taxBase - 17005) * 0.24 + 1780.38 + 979.14;
      else if (taxBase <= 277825) tax = (taxBase - 66760) * 0.42 + 10272.38 + 1025.38;
      else tax = (taxBase - 277825) * 0.45 + 98790.13;
    }
    if (church) tax *= 1.09;

    const social = yearly * 0.20;
    const net = yearly - tax - social;

    container.querySelector('#de-results').innerHTML = `
      <div class="de-row"><span>Gross Salary</span><span>€${yearly.toLocaleString()}</span></div>
      <div class="de-row"><span>Income Tax</span><span>-€${tax.toLocaleString(undefined,{maximumFractionDigits:0})}</span></div>
      <div class="de-row"><span>Social Contributions</span><span>-€${social.toLocaleString(undefined,{maximumFractionDigits:0})}</span></div>
      <div class="de-row total"><span>Net Salary</span><span>€${net.toLocaleString(undefined,{maximumFractionDigits:0})}</span></div>
      <div class="de-row"><span>Monthly (Net)</span><span>€${(net/12).toLocaleString(undefined,{maximumFractionDigits:0})}</span></div>
    `;
  });

  return container;
}
