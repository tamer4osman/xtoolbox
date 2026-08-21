import { describe, it, expect } from "vitest";
import { testToolConfig } from "./helpers/tool-config-test.js";
import {
  realReturn,
  projectAccumulation,
  simulateWithdrawal,
  planRetirement
} from "../tools/finance/retirement-planner.js";

testToolConfig(() => import("../tools/finance/retirement-planner.js"), {
  id: "retirement-planner",
  name: "Retirement Planner",
  category: "finance"
});

describe("realReturn", () => {
  it("computes inflation-adjusted return", () => {
    expect(realReturn(7, 2.5)).toBeCloseTo(0.0439, 3);
    expect(realReturn(5, 0)).toBeCloseTo(0.05, 6);
  });

  it("returns negative when inflation exceeds return", () => {
    expect(realReturn(2, 5)).toBeLessThan(0);
  });
});

describe("projectAccumulation", () => {
  it("grows savings with monthly contributions", () => {
    const r = projectAccumulation({
      currentSavings: 10000,
      monthlyContribution: 100,
      annualReturnReal: 0.05,
      years: 1
    });
    const monthly = 0.05 / 12;
    let bal = 10000;
    for (let i = 0; i < 12; i++) bal = bal * (1 + monthly) + 100;
    expect(r.nestEgg).toBeCloseTo(bal, 6);
    expect(r.series).toHaveLength(1);
  });

  it("handles zero horizon", () => {
    expect(projectAccumulation({ years: 0 }).nestEgg).toBe(0);
  });
});

describe("simulateWithdrawal", () => {
  it("never depletes when returns cover withdrawals", () => {
    const r = simulateWithdrawal({
      nestEgg: 1000000,
      annualIncomeReal: 30000,
      annualReturnReal: 0.05
    });
    expect(r.depleted).toBe(false);
    expect(r.lastsYears).toBe(Infinity);
  });

  it("detects depletion year", () => {
    const r = simulateWithdrawal({ nestEgg: 100000, annualIncomeReal: 50000, annualReturnReal: 0 });
    expect(r.depleted).toBe(true);
    expect(r.lastsYears).toBe(2);
  });

  it("treats zero income as infinite", () => {
    const r = simulateWithdrawal({ nestEgg: 10, annualIncomeReal: 0, annualReturnReal: 0 });
    expect(r.lastsYears).toBe(Infinity);
  });
});

describe("planRetirement", () => {
  const base = {
    currentAge: 30,
    retirementAge: 65,
    lifeExpectancy: 90,
    currentSavings: 25000,
    monthlyContribution: 500,
    preReturnPct: 7,
    postReturnPct: 5,
    inflationPct: 2.5,
    desiredAnnualIncome: 40000
  };

  it("produces coherent phases", () => {
    const p = planRetirement(base);
    expect(p.yearsToRetire).toBe(35);
    expect(p.retirementYears).toBe(25);
    expect(p.nestEgg).toBeGreaterThan(0);
    expect(p.growthSeries).toHaveLength(35);
  });

  it("flags unsustainable plan when income too high", () => {
    const p = planRetirement({ ...base, desiredAnnualIncome: 1000000 });
    expect(p.moneyLasts).toBe(false);
    expect(p.safeByGuideline).toBe(false);
    expect(p.depletionAge).not.toBeNull();
  });

  it("marks sustainable plan within 4% guideline", () => {
    const p = planRetirement({ ...base, desiredAnnualIncome: 15000 });
    expect(p.moneyLasts).toBe(true);
    expect(p.firstYearRate).toBeGreaterThan(0);
    expect(p.firstYearRate).toBeLessThanOrEqual(0.04);
  });

  it("clamps retirement before current age", () => {
    const p = planRetirement({ ...base, retirementAge: 20 });
    expect(p.yearsToRetire).toBe(0);
    expect(p.nestEgg).toBeCloseTo(25000, 6);
  });
});
