import { initBusinessCalc } from "./business-calc-factory.js";

export const toolConfig = {
  id: "break-even",
  name: "Break-Even Calculator",
  category: "business",
  description: "Calculate the break-even point for your business.",
  icon: "📈",
  status: "done"
};

export function render(container) {
  initBusinessCalc(container, {
    title: "Break-Even Calculator",
    inputs: [
      { id: "fixed", placeholder: "Fixed Costs", value: 10000 },
      { id: "price", placeholder: "Price per Unit", value: 50 },
      { id: "variable", placeholder: "Variable Cost per Unit", value: 30 }
    ],
    resultHTML: `
      <div>Break-Even Units: <strong id="units">500</strong></div>
      <div>Break-Even Revenue: <strong id="revenue">$25000</strong></div>
      <div>Contribution Margin: <strong id="margin">$20</strong></div>
    `,
    calc({ get, el }) {
      const margin = get("price") - get("variable");
      const units = margin > 0 ? Math.ceil(get("fixed") / margin) : 0;
      el("units").textContent = units;
      el("revenue").textContent = "$" + (units * get("price")).toLocaleString();
      el("margin").textContent = "$" + margin;
    }
  });
}
