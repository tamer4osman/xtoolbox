import { describe, it, expect } from "vitest";

describe("savings-calc", () => {
  it("calculates compound interest with monthly contributions", () => {
    const p = 10000;
    const m = 500;
    const r = 0.07;
    const y = 10;
    const n = 12;

    const totalMonths = y * 12;
    const ratePerMonth = r / 12;
    let balance = p;
    let totalContributions = p;

    for (let i = 0; i < totalMonths; i++) {
      balance *= 1 + ratePerMonth;
      balance += m;
      totalContributions += m;
    }

    const interest = balance - totalContributions;

    expect(balance).toBeGreaterThan(p);
    expect(interest).toBeGreaterThan(0);
    expect(totalContributions).toBe(p + m * totalMonths);
  });

  it("handles zero monthly contributions", () => {
    const p = 10000;
    const m = 0;
    const r = 0.07;
    const y = 10;
    const n = 12;

    const totalMonths = y * 12;
    const ratePerMonth = r / 12;
    let balance = p;

    for (let i = 0; i < totalMonths; i++) {
      balance *= 1 + ratePerMonth;
    }

    const expected = p * Math.pow(1 + r / 12, 120);
    expect(balance).toBeCloseTo(expected, 2);
  });

  it("handles zero interest rate", () => {
    const p = 10000;
    const m = 500;
    const r = 0;
    const y = 10;

    const totalMonths = y * 12;
    let balance = p;

    for (let i = 0; i < totalMonths; i++) {
      balance += m;
    }

    expect(balance).toBe(p + m * totalMonths);
  });
});
