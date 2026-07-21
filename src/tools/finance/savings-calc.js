import { createFinanceCalculator } from "./finance-calculator-factory.js";

export const toolConfig = {
  id: "savings-calc",
  name: "Savings Calculator",
  category: "finance",
  description: "Calculate compound interest and savings growth over time.",
  icon: "🏦",
  status: "done"
};

export function render(container) {
  createFinanceCalculator({
    container,
    toolId: "savings",
    icon: toolConfig.icon,
    title: toolConfig.name,
    description: toolConfig.description,
    cardColor: "emerald",
    formHTML: `
      <div class="form-group">
        <label>Initial Deposit ($)</label>
        <input type="number" id="principal" value="10000" min="1" />
      </div>
      <div class="form-group">
        <label>Monthly Contribution ($)</label>
        <input type="number" id="monthly" value="500" min="0" />
      </div>
      <div class="form-group">
        <label>Annual Interest Rate (%)</label>
        <input type="number" id="rate" value="7" step="0.1" />
      </div>
      <div class="form-group">
        <label>Compounding Frequency</label>
        <select id="frequency">
          <option value="1">Annually</option>
          <option value="2">Semi-annually</option>
          <option value="4">Quarterly</option>
          <option value="12" selected>Monthly</option>
          <option value="365">Daily</option>
        </select>
      </div>
      <div class="form-group">
        <label>Time Period (years)</label>
        <input type="number" id="years" value="10" min="1" />
      </div>
    `,
    calculate: ({ principal, monthly, rate, years }) => {
      const p = parseFloat(principal);
      const m = parseFloat(monthly);
      const r = parseFloat(rate) / 100;
      const y = parseInt(years);

      const totalMonths = y * 12;
      const ratePerMonth = r / 12;
      let balance = p;
      let totalContributions = p;

      for (let i = 0; i < totalMonths; i++) {
        balance *= 1 + ratePerMonth;
        balance += m;
        totalContributions += m;
      }

      const interest = balance - totalContributions;
      const effectiveRate = p > 0 ? (Math.pow(balance / p, 1 / y) - 1) * 100 : 0;

      return {
        primary: { label: "Final Balance", value: "$" + balance.toFixed(2) },
        items: [
          { label: "Total Interest Earned", value: "$" + interest.toFixed(2) },
          { label: "Total Contributions", value: "$" + totalContributions.toFixed(2) },
          { label: "Effective Annual Rate", value: effectiveRate.toFixed(2) + "%" }
        ]
      };
    }
  });
}
