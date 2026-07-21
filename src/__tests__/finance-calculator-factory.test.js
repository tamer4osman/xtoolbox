import { describe, it, expect, vi, beforeEach } from "vitest";
import { createFinanceCalculator } from "../tools/finance/finance-calculator-factory.js";

function makeContainer() {
  const c = document.createElement("div");
  document.body.appendChild(c);
  return c;
}

beforeEach(() => {
  document.body.innerHTML = "";
});

function build(overrides = {}) {
  const container = makeContainer();
  const calculate =
    overrides.calculate ||
    vi.fn(() => ({
      primary: { label: "Result", value: "$123.45" },
      items: [
        { label: "Sub A", value: "$10" },
        { label: "Sub B", value: "5%" }
      ]
    }));
  const result = createFinanceCalculator({
    container,
    toolId: "test-finance",
    icon: "💰",
    title: "Test Finance Tool",
    description: "A test finance calculator.",
    cardColor: "emerald",
    formHTML: `
      <div class="form-group">
        <label>Amount ($)</label>
        <input type="number" id="amount" value="1000" />
      </div>
    `,
    calculate,
    ...overrides
  });
  return { container, result, calculate };
}

describe("createFinanceCalculator", () => {
  it("renders the header with icon, title, and description", () => {
    const { container } = build();
    expect(container.querySelector(".cf-icon").textContent).toBe("💰");
    expect(container.querySelector("h1").textContent).toBe("Test Finance Tool");
    expect(container.querySelector(".cf-desc").textContent).toBe("A test finance calculator.");
  });

  it("renders the form with provided formHTML and a calculate button", () => {
    const { container } = build();
    expect(container.querySelector("#amount")).toBeTruthy();
    expect(container.querySelector(".cf-calc-btn")).toBeTruthy();
  });

  it("hides the result area initially", () => {
    const { container } = build();
    expect(container.querySelector(".cf-result").classList.contains("cf-hidden")).toBe(true);
  });

  it("collects form values by id and calls calculate on click", () => {
    const calculate = vi.fn(() => ({
      primary: { label: "X", value: "1" },
      items: []
    }));
    const { container, calculate: c2 } = build({ calculate });
    container.querySelector(".cf-calc-btn").click();
    expect(c2).toHaveBeenCalledTimes(1);
    const vals = c2.mock.calls[0][0];
    expect(vals.amount).toBe("1000");
  });

  it("renders primary result card with label and value", () => {
    const { container } = build();
    container.querySelector(".cf-calc-btn").click();
    const card = container.querySelector(".cf-result-card");
    expect(card).toBeTruthy();
    expect(card.querySelector(".cf-result-label").textContent).toBe("Result");
    expect(card.querySelector(".cf-result-value").textContent).toBe("$123.45");
  });

  it("renders each result item in the grid", () => {
    const { container } = build();
    container.querySelector(".cf-calc-btn").click();
    const items = container.querySelectorAll(".cf-result-item");
    expect(items).toHaveLength(2);
    expect(items[0].querySelector(".cf-ri-label").textContent).toBe("Sub A");
    expect(items[0].querySelector(".cf-ri-value").textContent).toBe("$10");
    expect(items[1].querySelector(".cf-ri-label").textContent).toBe("Sub B");
    expect(items[1].querySelector(".cf-ri-value").textContent).toBe("5%");
  });

  it("shows the result area after calculation", () => {
    const { container } = build();
    container.querySelector(".cf-calc-btn").click();
    expect(container.querySelector(".cf-result").classList.contains("cf-hidden")).toBe(false);
  });

  it("renders optional extras HTML in the result area", () => {
    const calculate = () => ({
      primary: { label: "X", value: "1" },
      items: [],
      extras: '<div class="extras-section"><h3>Extra</h3><p>More info</p></div>'
    });
    const { container } = build({ calculate });
    container.querySelector(".cf-calc-btn").click();
    expect(container.querySelector(".extras-section")).toBeTruthy();
    expect(container.querySelector(".extras-section h3").textContent).toBe("Extra");
  });

  it("uses the cardColor for the result card gradient", () => {
    const { container } = build({ cardColor: "red" });
    const style = container.querySelector("style").textContent;
    expect(style).toContain("ef4444");
  });

  it("supports Enter key in form to trigger calculate", () => {
    const { container, calculate } = build();
    const input = container.querySelector("#amount");
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(calculate).toHaveBeenCalledTimes(1);
  });
});
