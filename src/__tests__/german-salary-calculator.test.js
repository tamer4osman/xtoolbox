import { describe, it, expect } from "vitest";
import {
  toolConfig,
  getTaxThresholds,
  calculateIncomeTax,
  calculateSocialContributions
} from "../tools/finance/german-salary-calculator.js";

describe("german-salary-calculator", () => {
  describe("toolConfig", () => {
    it("has correct id, name, category", () => {
      expect(toolConfig.id).toBe("german-salary-calculator");
      expect(toolConfig.name).toBe("German Net Salary Calculator");
      expect(toolConfig.category).toBe("finance");
    });
  });

  describe("getTaxThresholds", () => {
    it("returns 2026 thresholds", () => {
      const t = getTaxThresholds(2026);
      expect(t.grundfreibetrag).toBe(12096);
      expect(t.kinderfreibetragAnnual).toBe(9600);
    });

    it("returns 2025 thresholds", () => {
      const t = getTaxThresholds(2025);
      expect(t.grundfreibetrag).toBe(11784);
      expect(t.kinderfreibetragAnnual).toBe(9540);
    });

    it("returns 2024 thresholds", () => {
      const t = getTaxThresholds(2024);
      expect(t.grundfreibetrag).toBe(11604);
      expect(t.kinderfreibetragAnnual).toBe(9456);
    });
  });

  describe("calculateIncomeTax", () => {
    it("returns zero for no taxable income", () => {
      expect(calculateIncomeTax(0)).toBe(0);
    });

    it("calculates tax for first bracket", () => {
      const tax = calculateIncomeTax(17005);
      expect(tax).toBeGreaterThan(0);
    });

    it("calculates tax for middle bracket", () => {
      const tax = calculateIncomeTax(50000);
      expect(tax).toBeGreaterThan(0);
    });

    it("calculates tax for high income", () => {
      const tax = calculateIncomeTax(300000);
      expect(tax).toBeGreaterThan(0);
    });
  });

  describe("calculateSocialContributions", () => {
    it("returns zero for private insurance", () => {
      const c = calculateSocialContributions(50000, true, true, 30);
      expect(c.health).toBe(0);
      expect(c.pension).toBe(0);
    });

    it("calculates statutory contributions for age 23+", () => {
      const c = calculateSocialContributions(50000, false, false, 25);
      expect(c.health).toBeCloseTo((50000 / 12) * 0.073, 10);
      expect(c.care).toBeCloseTo((50000 / 12) * 0.034, 10);
    });

    it("calculates lower care rate for age under 23", () => {
      const c = calculateSocialContributions(50000, false, false, 20);
      expect(c.care).toBeCloseTo((50000 / 12) * 0.02, 10);
    });
  });
});
