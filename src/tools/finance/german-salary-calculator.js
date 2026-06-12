export const toolConfig = {
  id: 'german-salary-calculator',
  name: 'German Net Salary Calculator',
  category: 'finance',
  description: 'Calculate German net salary with tax class, church tax, and social contributions.',
  icon: '🇩🇪',
  status: 'done'
};

export function getTaxThresholds(taxYear) {
  return {
    grundfreibetrag: taxYear >= 2026 ? 12096 : (taxYear >= 2025 ? 11784 : 11604),
    kinderfreibetragAnnual: taxYear >= 2026 ? 9600 : (taxYear >= 2025 ? 9540 : 9456)
  };
}

export function calculateIncomeTax(taxableIncome) {
  if (taxableIncome <= 17005) {
    return (1164.67 * taxableIncome / 10000 + 1400) * taxableIncome / 10000;
  } else if (taxableIncome <= 66760) {
    return (181.19 * taxableIncome / 10000 + 2397) * taxableIncome / 10000 + 1025.38;
  } else if (taxableIncome <= 277825) {
    return 0.42 * taxableIncome - 10602.13;
  } else {
    return 0.45 * taxableIncome - 18936.88;
  }
}

export function calculateSocialContributions(adjustedGross, isPrivateHealth, isPrivatePension, age) {
  const health = isPrivateHealth ? 0 : adjustedGross / 12 * 0.073;
  const careRate = age >= 23 ? 0.034 : 0.02;
  let care = isPrivateHealth ? 0 : adjustedGross / 12 * careRate;
  if (adjustedGross > 90600 && !isPrivateHealth) {
    care += (adjustedGross - 90600) / 12 * 0.002;
  }
  const pension = isPrivatePension ? 0 : adjustedGross / 12 * 0.093;
  const unemployment = isPrivateHealth ? 0 : adjustedGross / 12 * 0.012;

  return { health, pension, unemployment, care };
}

const fmt = (amt) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amt);

const SALARY_CALC_CSS = `
    .tool-container { max-width: 600px; margin: 0 auto; }
    .calculator-form { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-6); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .form-group { margin-bottom: var(--space-4); }
    .form-group label { display: block; margin-bottom: var(--space-2); font-weight: 500; font-size: var(--text-sm); }
    .form-group input, .form-group select { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .tool-button.primary { width: 100%; padding: var(--space-4); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; margin-top: var(--space-4); }
    .tool-button.primary:hover { background: var(--color-primary-hover); }
    .results { margin-top: var(--space-6); }
    .results.hidden { display: none; }
    .result-card { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: var(--radius-xl); padding: var(--space-8); text-align: center; margin-bottom: var(--space-4); }
    .result-label { font-size: var(--text-sm); opacity: 0.9; margin-bottom: var(--space-2); }
    .result-value { font-size: 2rem; font-weight: 700; }
    .result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-4); }
    .result-item { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); text-align: center; }
    .result-section { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); margin-bottom: var(--space-4); }
    .result-section h3 { margin-bottom: var(--space-3); font-size: var(--text-base); }
    .breakdown-item { display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--color-border); font-size: var(--text-sm); }
    .breakdown-item:last-child { border-bottom: none; }
    .effective-rate { text-align: center; padding: var(--space-4); background: var(--color-surface); border-radius: var(--radius-lg); font-weight: 600; }
`;

const SALARY_CALC_HTML = `
    <div class="tool-container">
      <div class="tool-content">
        <div class="calculator-form">
          <div class="form-row">
            <div class="form-group">
              <label>Gross Salary (Bruttolohn) *</label>
              <input type="number" id="gross-salary" value="2890" min="0" step="50" />
            </div>
            <div class="form-group">
              <label>Pay Period</label>
              <select id="pay-period">
                <option value="month" selected>Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Year</label>
              <select id="tax-year">
                <option value="2026" selected>2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
            <div class="form-group">
              <label>Salaries Per Year</label>
              <select id="salaries-per-year">
                <option value="12" selected>12</option>
                <option value="13">13</option>
                <option value="14">14</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Tax Class (Steuerklasse)</label>
            <select id="tax-class">
              <option value="1" selected>Class 1 (Single)</option>
              <option value="2">Class 2 (Single Parent)</option>
              <option value="3">Class 3 (Married - Higher Earner)</option>
              <option value="4">Class 4 (Married - Equal)</option>
              <option value="5">Class 5 (Married - Lower Earner)</option>
              <option value="6">Class 6 (Secondary Job)</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Church Tax (Kirchensteuer)</label>
              <select id="church-tax">
                <option value="yes" selected>Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div class="form-group">
              <label>Children up to 25</label>
              <input type="number" id="children-count" value="0" min="0" max="10" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Health Insurance</label>
              <select id="health-ins">
                <option value="statutory" selected>Statutory (gesetzlich)</option>
                <option value="private">Private (privat)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Pension Insurance</label>
              <select id="pension-ins">
                <option value="statutory" selected>Statutory (gesetzlich)</option>
                <option value="private">Private (privat)</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Company Pension (€/month)</label>
              <input type="number" id="company-pension" value="0" min="0" step="10" />
            </div>
            <div class="form-group">
              <label>Company Car (€/month)</label>
              <input type="number" id="company-car" value="0" min="0" step="10" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Weekly Hours</label>
              <input type="number" id="weekly-hours" value="40" min="1" max="60" />
            </div>
            <div class="form-group">
              <label>Age</label>
              <input type="number" id="age" value="35" min="15" max="70" />
            </div>
          </div>
          <button id="calculate-btn" class="tool-button primary">Calculate Net Salary</button>
          <div id="results" class="results hidden">
            <div class="result-card">
              <div class="result-label">Net Monthly Salary</div>
              <div class="result-value" id="net-monthly">-</div>
            </div>
            <div class="result-grid">
              <div class="result-item"><div class="result-label">Gross Monthly</div><div class="result-value" id="gross-monthly">-</div></div>
              <div class="result-item"><div class="result-label">Total Deductions</div><div class="result-value" id="total-deductions">-</div></div>
            </div>
            <div class="result-section">
              <h3>Tax & Contributions (Monthly)</h3>
              <div class="breakdown-item"><span>Child Allowance (Kinderfreibetrag)</span><span id="kinderfreibetrag">-</span></div>
              <div class="breakdown-item"><span>Income Tax</span><span id="income-tax">-</span></div>
              <div class="breakdown-item"><span>Church Tax</span><span id="church-tax-val">-</span></div>
              <div class="breakdown-item"><span>Solidarity Surcharge</span><span id="solidarity">-</span></div>
            </div>
            <div class="result-section">
              <h3>Social Contributions (Monthly)</h3>
              <div class="breakdown-item"><span>Health Insurance</span><span id="health-ins-val">-</span></div>
              <div class="breakdown-item"><span>Pension Insurance</span><span id="pension-ins-val">-</span></div>
              <div class="breakdown-item"><span>Unemployment Insurance</span><span id="unemployment-ins-val">-</span></div>
              <div class="breakdown-item"><span>Long-term Care</span><span id="care-ins-val">-</span></div>
            </div>
            <div class="effective-rate">Effective Tax Rate: <span id="effective-rate">-</span></div>
          </div>
        </div>
      </div>
    </div>
`;

function readInputs(inputs) {
  return {
    grossSalary: parseFloat(inputs.grossSalary.value) || 0,
    isMonthly: inputs.payPeriod.value === 'month',
    taxYear: parseInt(inputs.taxYear.value),
    isChurchMember: inputs.churchTax.value === 'yes',
    childrenCount: parseInt(inputs.childrenCount.value) || 0,
    isPrivateHealth: inputs.healthIns.value === 'private',
    isPrivatePension: inputs.pensionIns.value === 'private',
    companyPension: parseFloat(inputs.companyPension.value) || 0,
    companyCar: parseFloat(inputs.companyCar.value) || 0,
    age: parseInt(inputs.age.value) || 35
  };
}

function calculateSalary(vals) {
  const grossAnnual = vals.isMonthly ? vals.grossSalary * 12 : vals.grossSalary;
  if (grossAnnual <= 0) return null;

  const adjustedGross = grossAnnual - (vals.companyPension * 12) - (vals.companyCar * 12);
  const { grundfreibetrag, kinderfreibetragAnnual } = getTaxThresholds(vals.taxYear);
  const kinderfreibetrag = vals.childrenCount > 0 ? kinderfreibetragAnnual * vals.childrenCount : 0;

  let annualTax = 0;
  const totalAllowance = grundfreibetrag + kinderfreibetrag;
  if (adjustedGross > totalAllowance) {
    annualTax = Math.max(0, calculateIncomeTax(adjustedGross - totalAllowance));
  }

  const churchTax = vals.isChurchMember && annualTax > 0 ? annualTax * 0.09 : 0;
  let solidarity = 0;
  if (annualTax + churchTax > 17175.39) solidarity = (annualTax + churchTax) * 0.057;

  const totalTaxAnnual = annualTax + churchTax + solidarity;
  const social = calculateSocialContributions(adjustedGross, vals.isPrivateHealth, vals.isPrivatePension, vals.age);
  const totalDeductionsMonthly = (totalTaxAnnual / 12) + social.health + social.pension + social.unemployment + social.care;
  const grossMonthly = vals.isMonthly ? vals.grossSalary : vals.grossSalary / 12;
  const netMonthly = grossMonthly - totalDeductionsMonthly;
  const effectiveRate = grossMonthly > 0 ? ((grossMonthly - netMonthly) / grossMonthly * 100) : 0;

  return { grossMonthly, netMonthly, totalDeductionsMonthly, kinderfreibetrag, childrenCount: vals.childrenCount, annualTax, churchTax, solidarity, social, effectiveRate, isPrivateHealth: vals.isPrivateHealth, isPrivatePension: vals.isPrivatePension };
}

function writeResults(container, r) {
  if (!r) { container.querySelector('#results').classList.add('hidden'); return; }
  const q = id => container.querySelector(`#${id}`);
  q('gross-monthly').textContent = fmt(r.grossMonthly);
  q('total-deductions').textContent = fmt(r.totalDeductionsMonthly);
  q('net-monthly').textContent = fmt(r.netMonthly);
  q('kinderfreibetrag').textContent = r.childrenCount > 0 ? `${r.childrenCount} child${r.childrenCount > 1 ? 'ren' : ''} × ${fmt(r.kinderfreibetrag / 12 / r.childrenCount)}/mo` : '0';
  q('income-tax').textContent = fmt(r.annualTax / 12);
  q('church-tax-val').textContent = fmt(r.churchTax / 12);
  q('solidarity').textContent = fmt(r.solidarity / 12);
  q('health-ins-val').textContent = r.isPrivateHealth ? 'Private' : fmt(r.social.health);
  q('pension-ins-val').textContent = r.isPrivatePension ? 'Private' : fmt(r.social.pension);
  q('unemployment-ins-val').textContent = r.isPrivatePension ? '-' : fmt(r.social.unemployment);
  q('care-ins-val').textContent = r.isPrivateHealth ? '-' : fmt(r.social.care);
  q('effective-rate').textContent = r.effectiveRate.toFixed(1) + '%';
  container.querySelector('#results').classList.remove('hidden');
}

export function render(container) {
  container.innerHTML = SALARY_CALC_HTML;
  const style = document.createElement('style');
  style.textContent = SALARY_CALC_CSS;
  container.appendChild(style);

  const inputs = {
    grossSalary: container.querySelector('#gross-salary'),
    payPeriod: container.querySelector('#pay-period'),
    taxYear: container.querySelector('#tax-year'),
    salariesPerYear: container.querySelector('#salaries-per-year'),
    taxClass: container.querySelector('#tax-class'),
    churchTax: container.querySelector('#church-tax'),
    childrenCount: container.querySelector('#children-count'),
    healthIns: container.querySelector('#health-ins'),
    pensionIns: container.querySelector('#pension-ins'),
    companyPension: container.querySelector('#company-pension'),
    companyCar: container.querySelector('#company-car'),
    weeklyHours: container.querySelector('#weekly-hours'),
    age: container.querySelector('#age')
  };

  function calculate() {
    writeResults(container, calculateSalary(readInputs(inputs)));
  }

  container.querySelector('#calculate-btn').addEventListener('click', calculate);
  Object.values(inputs).forEach(input => {
    input.addEventListener('input', calculate);
    input.addEventListener('change', calculate);
  });
}
