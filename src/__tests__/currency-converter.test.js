import { describe, it, expect } from "vitest";
import { toolConfig, render } from "../tools/finance/currency-converter.js";
import { testSimpleToolConfig } from "./tool-config-test.js";

describe("currency-converter", () => {
  testSimpleToolConfig(toolConfig, "currency-converter", "Currency Exchange Calculator", "finance");

  it("exports render function", () => {
    expect(typeof render).toBe("function");
  });
});

describe("render", () => {
  it("creates all required elements", () => {
    const container = document.createElement("div");
    render(container);
    expect(container.querySelector("#cec-amount")).toBeTruthy();
    expect(container.querySelector("#cec-from")).toBeTruthy();
    expect(container.querySelector("#cec-to")).toBeTruthy();
    expect(container.querySelector("#cec-swap-btn")).toBeTruthy();
    expect(container.querySelector(".cec-result-value")).toBeTruthy();
    expect(container.querySelector(".cec-result-rate")).toBeTruthy();
    expect(container.querySelector("#cec-updated")).toBeTruthy();
    expect(container.querySelector("#cec-conversions")).toBeTruthy();
  });

  it("populates currency selects with major currencies", () => {
    const container = document.createElement("div");
    render(container);
    const from = container.querySelector("#cec-from");
    const to = container.querySelector("#cec-to");
    expect(from.options.length).toBe(11);
    expect(to.options.length).toBe(11);
    expect(from.value).toBe("USD");
    expect(to.value).toBe("EUR");
  });

  it("displays converted result on render", () => {
    const container = document.createElement("div");
    render(container);
    const result = container.querySelector(".cec-result-value").textContent;
    expect(result).toContain("EUR");
    expect(result).not.toBe("0.00 EUR");
  });

  it("updates result when amount changes", () => {
    const container = document.createElement("div");
    render(container);
    const amount = container.querySelector("#cec-amount");
    amount.value = "200";
    amount.dispatchEvent(new Event("input"));
    const result = container.querySelector(".cec-result-value").textContent;
    expect(result).toContain("EUR");
  });

  it("swaps currencies on swap button click", () => {
    const container = document.createElement("div");
    render(container);
    const from = container.querySelector("#cec-from");
    const to = container.querySelector("#cec-to");
    container.querySelector("#cec-swap-btn").click();
    expect(from.value).toBe("EUR");
    expect(to.value).toBe("USD");
  });

  it("shows rate text", () => {
    const container = document.createElement("div");
    render(container);
    const rate = container.querySelector(".cec-result-rate").textContent;
    expect(rate).toContain("1 USD =");
    expect(rate).toContain("EUR");
  });

  it("uses container scoping for all queries", () => {
    const container = document.createElement("div");
    render(container);
    const updated = container.querySelector("#cec-updated");
    expect(updated).toBeTruthy();
    expect(updated.textContent).toContain("Rates as of");
  });
});
