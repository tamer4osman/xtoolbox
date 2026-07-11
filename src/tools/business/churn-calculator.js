import { initBusinessCalc } from "./business-calc-factory.js";

export const toolConfig = {
  id: "churn-calculator",
  name: "Churn Rate Calculator",
  category: "business",
  description: "Calculate customer churn rate and retention.",
  icon: "📉",
  status: "done"
};

export function render(container) {
  initBusinessCalc(container, {
    title: "Churn Calculator",
    inputs: [
      { id: "customers", placeholder: "Total Customers", value: 1000 },
      { id: "lost", placeholder: "Customers Lost", value: 50 },
      { id: "rev", placeholder: "Monthly Revenue", value: 50000 }
    ],
    resultHTML: `
      <div>Churn Rate: <strong id="rate">5%</strong></div>
      <div>Monthly Lost Revenue: <strong id="lostRev">$2500</strong></div>
      <div>Annual Lost Revenue: <strong id="annualRev">$30000</strong></div>
    `,
    calc({ get, el }) {
      const total = get("customers");
      const lost = get("lost");
      const rev = get("rev");
      const rate = total ? (lost / total) * 100 : 0;
      const lostRev = (rev * rate) / 100;
      el("rate").textContent = rate.toFixed(1) + "%";
      el("lostRev").textContent = "$" + lostRev.toFixed(0);
      el("annualRev").textContent = "$" + (lostRev * 12).toFixed(0);
    }
  });
}
