import { initBusinessCalc } from "./business-calc-factory.js";

export const toolConfig = {
  id: "ltv-calculator",
  name: "LTV Calculator",
  category: "business",
  description: "Calculate Customer Lifetime Value (LTV).",
  icon: "💎",
  status: "done"
};

export function render(container) {
  initBusinessCalc(container, {
    title: "Customer LTV Calculator",
    inputs: [
      { id: "arpu", placeholder: "Avg Revenue per User/mo", value: 29 },
      { id: "margin", placeholder: "Profit Margin %", value: 70 },
      { id: "churn", placeholder: "Churn Rate %", value: 5 }
    ],
    resultHTML: `
      <div>LTV: <strong id="ltv">$406</strong></div>
      <div>LTV:CAC Ratio: <strong id="ratio">4.06</strong></div>
    `,
    calc({ get, el }) {
      const churn = get("churn") || 1;
      const ltv = (get("arpu") * get("margin")) / 100 / (churn / 100);
      el("ltv").textContent = "$" + ltv.toFixed(0);
      el("ratio").textContent = (ltv / 100).toFixed(2);
    }
  });
}
