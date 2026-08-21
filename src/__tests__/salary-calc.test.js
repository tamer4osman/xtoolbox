import { describe, it, expect } from "vitest";
import { testToolConfig } from "./helpers/tool-config-test.js";
import {
  COUNTRIES,
  computeTakeHome,
  rankCountries,
  calcChildBenefits
} from "../tools/finance/salary-calc.js";

const us = COUNTRIES.find(c => c.code === "US");
const ae = COUNTRIES.find(c => c.code === "AE");
const uk = COUNTRIES.find(c => c.code === "GB");

testToolConfig(() => import("../tools/finance/salary-calc.js"), {
  id: "salary-calc",
  name: "Multi-Country Salary Calculator",
  category: "finance"
});

describe("dataset", () => {
  it("has valid brackets and unique codes for every country", () => {
    const codes = new Set();
    for (const c of COUNTRIES) {
      codes.add(c.code);
      expect(c.allowance).toBeGreaterThanOrEqual(0);
      expect(c.brackets.length).toBeGreaterThan(0);
      expect(c.brackets[c.brackets.length - 1][0]).toBe(Infinity);
    }
    expect(codes.size).toBe(COUNTRIES.length);
    expect(COUNTRIES.length).toBe(12);
  });
});

describe("computeTakeHome", () => {
  it("slices progressive brackets correctly for the US middle income", () => {
    const r = computeTakeHome(us, 58000);
    const expectedTax = 11925 * 0.1 + 31075 * 0.12;
    expect(r.tax).toBeCloseTo(expectedTax, 2);
    expect(r.social).toBeCloseTo(58000 * 0.0765, 2);
    expect(r.net).toBeCloseTo(58000 - expectedTax - 58000 * 0.0765, 2);
  });

  it("applies over-cap rate for US high earners", () => {
    const r = computeTakeHome(us, 500000);
    const expectedSocial = 176100 * 0.0765 + (500000 - 176100) * 0.0145;
    expect(r.social).toBeCloseTo(expectedSocial, 2);
  });

  it("honors the UK personal-allowance floor on national insurance", () => {
    const r = computeTakeHome(uk, 30000);
    expect(r.social).toBeCloseTo((30000 - 12570) * 0.08, 2);
  });

  it("returns fully untouched salary for zero-tax countries", () => {
    const r = computeTakeHome(ae, 1000000);
    expect(r.tax).toBe(0);
    expect(r.social).toBe(0);
    expect(r.net).toBe(1000000);
    expect(r.effective).toBe(0);
  });

  it("guards against negative or invalid gross", () => {
    for (const bad of [-5000, NaN, undefined]) {
      const r = computeTakeHome(us, bad);
      expect(r.gross).toBe(0);
      expect(r.net).toBe(0);
      expect(r.effective).toBe(0);
    }
  });
});

describe("family impact", () => {
  it("married split reduces German tax burden", () => {
    const single = rankCountries(80000, { married: false }).find(r => r.country.code === "DE");
    const married = rankCountries(80000, { married: true }).find(r => r.country.code === "DE");
    expect(married.effective).toBeLessThan(single.effective);
  });

  it("adds child benefits only where programs exist", () => {
    const de = COUNTRIES.find(c => c.code === "DE");
    const fr = COUNTRIES.find(c => c.code === "FR");
    const us = COUNTRIES.find(c => c.code === "US");
    const ae = COUNTRIES.find(c => c.code === "AE");
    expect(calcChildBenefits(de, 2)).toBe(510);
    expect(calcChildBenefits(fr, 1)).toBe(0);
    expect(calcChildBenefits(fr, 2)).toBe(370);
    const uk = COUNTRIES.find(c => c.code === "GB");
    expect(calcChildBenefits(uk, 2)).toBe(43);
    expect(calcChildBenefits(us, 3)).toBe(501);
    expect(calcChildBenefits(ae, 3)).toBe(0);
    expect(calcChildBenefits(de, 99)).toBe(5 * 255 + 4 * 0);
  });

  it("clamps kids to 0-5 and floors invalid input at zero benefits", () => {
    const de = COUNTRIES.find(c => c.code === "DE");
    expect(calcChildBenefits(de, -2)).toBe(0);
    expect(calcChildBenefits(de, NaN)).toBe(0);
  });

  it("household ranking keeps UAE on top and includes benefits in net", () => {
    const ranked = rankCountries(60000, { married: true, kids: 2 });
    expect(ranked[0].country.code).toBe("AE");
    const de = ranked.find(r => r.country.code === "DE");
    const baseTax = computeTakeHome(de.country, 30000).tax * 2;
    expect(de.net).toBeCloseTo(60000 - baseTax - de.social + 6120, 0);
  });
});

describe("rankCountries", () => {
  it("sorts ascending by effective tax rate with UAE always cheapest", () => {
    const ranked = rankCountries(60000);
    expect(ranked[0].country.code).toBe("AE");
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i].effective).toBeGreaterThanOrEqual(ranked[i - 1].effective);
    }
  });

  it("income tax burden grows with income for every country", () => {
    for (const c of COUNTRIES) {
      const low = computeTakeHome(c, 30000);
      const high = computeTakeHome(c, 600000);
      expect(high.tax / 600000).toBeGreaterThanOrEqual(low.tax / 30000 - 0.001);
    }
  });
});
