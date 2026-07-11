import { createFinanceCalculator } from "./finance-calculator-factory.js";

export const toolConfig = {
  id: "compound-interest",
  name: "Compound Interest Calculator",
  category: "finance",
  description: "Calculate compound interest with different compounding frequencies.",
  icon: "💹",
  status: "done"
};

export function render(container) {
  createFinanceCalculator({
    container,
    toolId: "compound",
    icon: toolConfig.icon,
    title: toolConfig.name,
    description: toolConfig.description,
    cardColor: "emerald",
    formHTML: `
      <div class="form-group">
        <label>Principal Amount ($)</label>
        <input type="number" id="principal" value="10000" min="1" />
      </div>
      <div class="form-group">
        <label>Annual Interest Rate (%)</label>
        <input type="number" id="rate" value="7" step="0.1" />
      </div>
      <div class="form-group">
        <label>Time Period (years)</label>
        <input type="number" id="years" value="10" min="1" />
      </div>
      <div class="form-group">
        <label>Compounding Frequency</label>
        <select id="frequency">
          <option value="1">Annually</option>
          <option value="2">Semi-annually</option>
          <option value="4" selected>Quarterly</option>
          <option value="12">Monthly</option>
          <option value="365">Daily</option>
        </select>
      </div>
    `,
    calculate: ({ principal, rate, years, frequency }) => {
      const p = parseFloat(principal);
      const r = parseFloat(rate) / 100;
      const y = parseInt(years);
      const n = parseInt(frequency);
      const amount = p * Math.pow(1 + r / n, n * y);
      const interest = amount - p;
      const effectiveRate = (Math.pow(amount / p, 1 / y) - 1) * 100;
      return {
        primary: { label: "Final Amount", value: "$" + amount.toFixed(2) },
        items: [
          { label: "Total Interest Earned", value: "$" + interest.toFixed(2) },
          { label: "Effective Rate", value: effectiveRate.toFixed(2) + "%" }
        ]
      };
    }
  });
}
