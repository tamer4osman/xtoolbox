import { initBusinessCalc } from "./business-calc-factory.js";

export const toolConfig = {
  id: "roi-calculator",
  name: "ROI Calculator",
  category: "business",
  description: "Calculate Return on Investment (ROI) for projects.",
  icon: "💹",
  status: "done"
};

export function render(container) {
  initBusinessCalc(container, {
    title: "ROI Calculator",
    inputs: [
      { id: "investment", placeholder: "Initial Investment", value: 10000 },
      { id: "returnVal", placeholder: "Final Value", value: 15000 },
      { id: "time", placeholder: "Time Period (months)", value: 12 }
    ],
    resultHTML: `
      <div>ROI: <strong id="roi">50%</strong></div>
      <div>Annual ROI: <strong id="annual">50%</strong></div>
      <div>Profit: <strong id="profit">$5000</strong></div>
    `,
    calc({ get, el }) {
      const invest = get("investment");
      const ret = get("returnVal");
      const months = get("time") || 1;
      const profit = ret - invest;
      const roi = invest ? (profit / invest) * 100 : 0;
      el("roi").textContent = roi.toFixed(1) + "%";
      el("annual").textContent = ((roi * 12) / months).toFixed(1) + "%";
      el("profit").textContent = "$" + profit.toFixed(0);
    }
  });
}
