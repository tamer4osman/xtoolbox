import { createFinanceCalculator } from "./finance-calculator-factory.js";

export const toolConfig = {
  id: "mortgage-calculator",
  name: "Mortgage Calculator",
  category: "finance",
  description: "Calculate monthly mortgage payments and total cost.",
  icon: "🏠",
  status: "done"
};

export function render(container) {
  createFinanceCalculator({
    container,
    toolId: "mortgage",
    icon: toolConfig.icon,
    title: toolConfig.name,
    description: toolConfig.description,
    cardColor: "emerald",
    resultValueSize: "2rem",
    formHTML: `
      <div class="form-group">
        <label>Home Price ($)</label>
        <input type="number" id="price" value="400000" min="10000" />
      </div>
      <div class="form-group">
        <label>Down Payment ($)</label>
        <input type="number" id="down" value="80000" min="0" />
      </div>
      <div class="form-group">
        <label>Interest Rate (% per year)</label>
        <input type="number" id="rate" value="6.5" step="0.1" />
      </div>
      <div class="form-group">
        <label>Loan Term (years)</label>
        <select id="term">
          <option value="15">15 years</option>
          <option value="20">20 years</option>
          <option value="30" selected>30 years</option>
        </select>
      </div>
    `,
    calculate: ({ price, down, rate, term }) => {
      const p = parseFloat(price);
      const d = parseFloat(down);
      const r = parseFloat(rate) / 100 / 12;
      const y = parseInt(term);
      const months = y * 12;
      const loan = p - d;
      const payment = (loan * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
      const total = payment * months;
      const interest = total - loan;
      const payoff = new Date();
      payoff.setFullYear(payoff.getFullYear() + y);
      return {
        primary: { label: "Monthly Payment", value: "$" + payment.toFixed(0) },
        items: [
          { label: "Loan Amount", value: "$" + loan.toLocaleString() },
          { label: "Total Interest", value: "$" + interest.toLocaleString() },
          { label: "Total Cost", value: "$" + (p + interest - d).toLocaleString() },
          {
            label: "Payoff Date",
            value: payoff.toLocaleDateString("en-US", { month: "short", year: "numeric" })
          }
        ]
      };
    }
  });
}
