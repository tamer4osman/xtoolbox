import { describe, it, expect } from "vitest";
import { calculateBalances, simplifyDebts } from "../tools/finance/expense-splitter.js";

describe("expense-splitter", () => {
  it("exports toolConfig and render", async () => {
    const mod = await import("../tools/finance/expense-splitter.js");
    expect(mod.toolConfig).toBeDefined();
    expect(mod.toolConfig.id).toBe("expense-splitter");
    expect(mod.toolConfig.category).toBe("finance");
    expect(typeof mod.render).toBe("function");
  });

  it("toolConfig has required fields", async () => {
    const mod = await import("../tools/finance/expense-splitter.js");
    expect(mod.toolConfig.name).toBeTruthy();
    expect(mod.toolConfig.description).toBeTruthy();
    expect(mod.toolConfig.icon).toBeTruthy();
    expect(Array.isArray(mod.toolConfig.keywords)).toBe(true);
    expect(Array.isArray(mod.toolConfig.steps)).toBe(true);
    expect(Array.isArray(mod.toolConfig.faqs)).toBe(true);
  });
});

describe("calculateBalances", () => {
  const people = [
    { id: "a", name: "Alice" },
    { id: "b", name: "Bob" },
    { id: "c", name: "Charlie" }
  ];

  it("equal split between 2 people", () => {
    const expenses = [{ id: "e1", description: "Dinner", amount: 30, paidBy: "a", splitAmong: ["a", "b"] }];
    const balances = calculateBalances(people, expenses);
    expect(balances.a).toBeCloseTo(15);
    expect(balances.b).toBeCloseTo(-15);
  });

  it("3-way split", () => {
    const expenses = [{ id: "e1", description: "Trip", amount: 90, paidBy: "a", splitAmong: ["a", "b", "c"] }];
    const balances = calculateBalances(people, expenses);
    expect(balances.a).toBeCloseTo(60);
    expect(balances.b).toBeCloseTo(-30);
    expect(balances.c).toBeCloseTo(-30);
  });

  it("no expenses returns zero balances", () => {
    const balances = calculateBalances(people, []);
    expect(balances.a).toBe(0);
    expect(balances.b).toBe(0);
    expect(balances.c).toBe(0);
  });

  it("multiple expenses", () => {
    const expenses = [
      { id: "e1", description: "Dinner", amount: 40, paidBy: "a", splitAmong: ["a", "b"] },
      { id: "e2", description: "Gas", amount: 20, paidBy: "b", splitAmong: ["a", "b"] }
    ];
    const balances = calculateBalances(people, expenses);
    expect(balances.a).toBeCloseTo(10);
    expect(balances.b).toBeCloseTo(-10);
  });

  it("expense where payer is not in splitAmong", () => {
    const expenses = [{ id: "e1", description: "Gift", amount: 60, paidBy: "a", splitAmong: ["b", "c"] }];
    const balances = calculateBalances(people, expenses);
    expect(balances.a).toBeCloseTo(60);
    expect(balances.b).toBeCloseTo(-30);
    expect(balances.c).toBeCloseTo(-30);
  });
});

describe("simplifyDebts", () => {
  it("2 people settle up", () => {
    const balances = { a: 15, b: -15 };
    const txns = simplifyDebts(balances);
    expect(txns).toHaveLength(1);
    expect(txns[0]).toEqual({ from: "b", to: "a", amount: 15 });
  });

  it("3 people chain payments", () => {
    const balances = { a: 20, b: -10, c: -10 };
    const txns = simplifyDebts(balances);
    expect(txns).toHaveLength(2);
    expect(txns[0]).toEqual({ from: "b", to: "a", amount: 10 });
    expect(txns[1]).toEqual({ from: "c", to: "a", amount: 10 });
  });

  it("complex 3-person minimum transactions", () => {
    const balances = { a: 50, b: -30, c: -20 };
    const txns = simplifyDebts(balances);
    expect(txns).toHaveLength(2);
    expect(txns[0]).toEqual({ from: "b", to: "a", amount: 30 });
    expect(txns[1]).toEqual({ from: "c", to: "a", amount: 20 });
  });

  it("everyone settled returns empty", () => {
    const balances = { a: 0, b: 0, c: 0 };
    const txns = simplifyDebts(balances);
    expect(txns).toHaveLength(0);
  });

  it("floating point threshold below 0.01 ignored", () => {
    const balances = { a: 0.005, b: -0.005 };
    const txns = simplifyDebts(balances);
    expect(txns).toHaveLength(0);
  });

  it("4 people circular debt simplification", () => {
    const balances = { a: 30, b: -10, c: -10, d: -10 };
    const txns = simplifyDebts(balances);
    expect(txns).toHaveLength(3);
    expect(txns[0]).toEqual({ from: "b", to: "a", amount: 10 });
    expect(txns[1]).toEqual({ from: "c", to: "a", amount: 10 });
    expect(txns[2]).toEqual({ from: "d", to: "a", amount: 10 });
  });

  it("no debtors or creditors returns empty", () => {
    const txns = simplifyDebts({});
    expect(txns).toHaveLength(0);
  });
});
