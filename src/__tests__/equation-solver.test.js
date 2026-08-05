import { describe, it, expect } from "vitest";
import { parse } from "mathjs";
import {
  toolConfig,
  normalizeEquation,
  getPolynomialDegree,
  getSymbols,
  isZero,
  extractCoefficients,
  gcd,
  fmtNum,
  texNum,
  solveLinear,
  solveQuadratic,
  solveSystem,
  solveEquation
} from "../tools/math/equation-solver.js";

describe("equation-solver", () => {
  describe("toolConfig", () => {
    it("has correct id, name, category", () => {
      expect(toolConfig.id).toBe("equation-solver");
      expect(toolConfig.name).toBe("Equation Solver");
      expect(toolConfig.category).toBe("math");
    });

    it("has keywords, steps, and faqs", () => {
      expect(toolConfig.keywords.length).toBeGreaterThan(3);
      expect(toolConfig.steps.length).toBeGreaterThan(2);
      expect(toolConfig.faqs.length).toBeGreaterThan(1);
    });
  });

  describe("normalizeEquation", () => {
    it("converts unicode superscripts to caret notation", () => {
      expect(normalizeEquation("x² - 5x + 6 = 0")).toBe("x^2 - 5x + 6 = 0");
      expect(normalizeEquation("2x³ + 1 = 0")).toBe("2x^3 + 1 = 0");
    });

    it("converts unicode minus, multiplication and division symbols", () => {
      expect(normalizeEquation("3x − 5 = x + 7")).toBe("3x - 5 = x + 7");
      expect(normalizeEquation("2 × 3 = 6")).toBe("2 * 3 = 6");
      expect(normalizeEquation("2 ÷ 3 = x")).toBe("2 / 3 = x");
      expect(normalizeEquation("2·x = 4")).toBe("2*x = 4");
    });

    it("collapses whitespace and trims", () => {
      expect(normalizeEquation("  2x   + 3 = 7  ")).toBe("2x + 3 = 7");
    });
  });

  describe("getPolynomialDegree", () => {
    const v = new Set(["x"]);
    it("detects constants as degree 0", () => {
      expect(getPolynomialDegree(parse("7"), v)).toBe(0);
      expect(getPolynomialDegree(parse("2/3"), v)).toBe(0);
    });

    it("detects linear expressions", () => {
      expect(getPolynomialDegree(parse("2x + 3"), v)).toBe(1);
      expect(getPolynomialDegree(parse("3x - 5"), v)).toBe(1);
      expect(getPolynomialDegree(parse("x/2 + 1"), v)).toBe(1);
    });

    it("detects quadratic expressions including factored form", () => {
      expect(getPolynomialDegree(parse("x^2 - 5x + 6"), v)).toBe(2);
      expect(getPolynomialDegree(parse("(x+1)*(x+2)"), v)).toBe(2);
      expect(getPolynomialDegree(parse("x^2"), v)).toBe(2);
    });

    it("treats variables in a denominator as non-polynomial", () => {
      expect(getPolynomialDegree(parse("1/x"), v)).toBe(-1);
      expect(getPolynomialDegree(parse("x/(x-1)"), v)).toBe(-1);
    });

    it("treats transcendental functions as non-polynomial", () => {
      expect(getPolynomialDegree(parse("sin(x)"), v)).toBe(-1);
      expect(getPolynomialDegree(parse("log(x)"), v)).toBe(-1);
    });

    it("treats non-constant exponents as non-polynomial", () => {
      expect(getPolynomialDegree(parse("2^x"), v)).toBe(-1);
      expect(getPolynomialDegree(parse("x^(1/2)"), v)).toBe(-1);
    });

    it("treats x·y products as degree 2 in two-variable mode", () => {
      const v2 = new Set(["x", "y"]);
      expect(getPolynomialDegree(parse("x*y"), v2)).toBe(2);
      expect(getPolynomialDegree(parse("x + y"), v2)).toBe(1);
    });
  });

  describe("getSymbols", () => {
    it("collects variable names from an expression", () => {
      expect([...getSymbols(parse("2x + 3y"))].sort()).toEqual(["x", "y"]);
    });
  });

  describe("isZero", () => {
    it("returns true for values near zero relative to scale", () => {
      expect(isZero(0, 1)).toBe(true);
      expect(isZero(1e-12, 1)).toBe(true);
      expect(isZero(1, 1)).toBe(false);
      expect(isZero(1e-6, 1)).toBe(false);
    });
  });

  describe("extractCoefficients", () => {
    it("extracts quadratic coefficients", () => {
      const { a, b, c } = extractCoefficients("(x^2 - 5x + 6) - (0)", "x");
      expect(a).toBeCloseTo(1, 10);
      expect(b).toBeCloseTo(-5, 10);
      expect(c).toBeCloseTo(6, 10);
    });
  });

  describe("number formatting", () => {
    it("gcd works", () => {
      expect(gcd(12, 18)).toBe(6);
      expect(gcd(7, 3)).toBe(1);
    });

    it("fmtNum trims trailing noise", () => {
      expect(fmtNum(2)).toBe("2");
      expect(fmtNum(-0)).toBe("0");
      expect(fmtNum(0.5)).toBe("0.5");
    });

    it("texNum emits fractions for nice rationals", () => {
      expect(texNum(0.5)).toBe("\\frac{1}{2}");
      expect(texNum(-1.5)).toBe("-\\frac{3}{2}");
      expect(texNum(2)).toBe("2");
      expect(texNum(-0.25)).toBe("-\\frac{1}{4}");
    });
  });

  describe("solveLinear", () => {
    it("solves 2x + 3 = 7", () => {
      const result = solveLinear("2x + 3 = 7");
      expect(result.solution.kind).toBe("unique");
      expect(result.solution.root).toBe(2);
      expect(result.answerPlain).toBe("x = 2");
      expect(result.steps.length).toBeGreaterThan(3);
    });

    it("solves equations with variables on both sides", () => {
      const result = solveLinear("3x - 5 = x + 7");
      expect(result.solution.root).toBe(6);
    });

    it("solves fraction coefficients (y/2 + 1 = 3)", () => {
      const result = solveLinear("y/2 + 1 = 3", "y");
      expect(result.solution.root).toBe(4);
    });

    it("solves negative results", () => {
      const result = solveLinear("4 - 2x = 10");
      expect(result.solution.root).toBe(-3);
    });

    it("detects no solution", () => {
      const result = solveLinear("x + 1 = x + 2");
      expect(result.solution.kind).toBe("none");
      expect(result.answerPlain).toBe("No solution");
    });

    it("detects infinitely many solutions", () => {
      const result = solveLinear("x + 1 = x + 1");
      expect(result.solution.kind).toBe("infinite");
    });

    it("accepts unicode notation", () => {
      const result = solveLinear("2x − 3 = 0");
      expect(result.solution.roots[0]).toBeCloseTo(1.5);
    });

    it("rejects non-polynomial equations", () => {
      expect(() => solveLinear("sin(x) = 0.5")).toThrow(/polynomial/);
    });

    it("rejects quadratic equations in linear mode", () => {
      expect(() => solveLinear("x^2 - 5x + 6 = 0")).toThrow(/Quadratic mode/);
    });

    it("solves linear equations with extra variables in terms of the target variable", () => {
      const result = solveLinear("3x + 2y = 12", "y");
      expect(result.parameterized).toBe(true);
      expect(result.solution.variable).toBe("y");
      expect(result.answerPlain).toMatch(/y =/);
      expect(result.answerPlain).toContain("x");
      expect(result.steps.length).toBeGreaterThan(0);
    });

    it("solves the target variable symbolically (3x + 2y = 12 for y → y = (12 - 3x)/2)", () => {
      const result = solveLinear("3x + 2y = 12", "y");
      expect(result.answerPlain).toMatch(/\(12 - 3 \* x\) \/ 2|\(12-3\*x\)\/2/);
    });

    it("rejects equations without an equals sign", () => {
      expect(() => solveLinear("2x + 3")).toThrow(/one '='/);
    });

    it("rejects empty sides", () => {
      expect(() => solveLinear("x = ")).toThrow(/Both sides/);
    });

    it("rejects equations missing the variable", () => {
      expect(() => solveLinear("2 + 3 = 5")).toThrow(/doesn't contain/);
    });

    it("rejects invalid variable names", () => {
      expect(() => solveLinear("2x + 3 = 7", "xy")).toThrow(/single letter/);
    });

    it("rejects unparseable input", () => {
      expect(() => solveLinear("2x + = 7")).toThrow(/Could not parse/);
    });
  });

  describe("solveQuadratic", () => {
    it("solves x² - 5x + 6 = 0 with two real roots", () => {
      const result = solveQuadratic("x^2 - 5x + 6 = 0");
      expect(result.solution.kind).toBe("unique");
      expect(result.solution.discriminant).toBeCloseTo(1, 8);
      expect(result.solution.roots[0]).toBeCloseTo(3, 8);
      expect(result.solution.roots[1]).toBeCloseTo(2, 8);
    });

    it("solves 2x² - 4x - 6 = 0", () => {
      const result = solveQuadratic("2x^2 - 4x - 6 = 0");
      expect(result.solution.roots[0]).toBeCloseTo(3, 8);
      expect(result.solution.roots[1]).toBeCloseTo(-1, 8);
    });

    it("detects a double root", () => {
      const result = solveQuadratic("x^2 + 2x + 1 = 0");
      expect(result.solution.kind).toBe("double");
      expect(result.solution.root).toBeCloseTo(-1, 8);
    });

    it("finds complex roots when discriminant is negative", () => {
      const result = solveQuadratic("x^2 + 1 = 0");
      expect(result.solution.kind).toBe("complex");
      expect(result.solution.discriminant).toBeCloseTo(-4, 8);
      const [z1, z2] = result.solution.roots;
      expect(z1.re).toBeCloseTo(0, 8);
      expect(z1.im).toBeCloseTo(1, 8);
      expect(z2.im).toBeCloseTo(-1, 8);
    });

    it("accepts unicode superscript notation", () => {
      const result = solveQuadratic("x² − 5x + 6 = 0");
      expect(result.solution.roots[0]).toBeCloseTo(3, 8);
    });

    it("falls back to linear solving for degree-1 input", () => {
      const result = solveQuadratic("2x + 3 = 7");
      expect(result.solution.kind).toBe("unique");
      expect(result.solution.root).toBe(2);
      expect(result.note).toMatch(/linear/);
    });

    it("delegates to the linear solver when the x² terms cancel out", () => {
      const result = solveQuadratic("x^2 - x^2 + 2x = 0");
      expect(result.mode).toBe("quadratic");
      expect(result.solution.kind).toBe("unique");
      expect(result.solution.root).toBeCloseTo(0, 10);
      expect(result.answerPlain).toBe("x = 0");
      expect(result.note).toMatch(/cancel out/);
    });

    it("rejects cubic and higher equations", () => {
      expect(() => solveQuadratic("x^3 - 1 = 0")).toThrow(/degree 3/);
    });

    it("emits a quadratic-formula step", () => {
      const result = solveQuadratic("x^2 - 5x + 6 = 0");
      const titles = result.steps.map(s => s.title);
      expect(titles).toContain("Discriminant");
      expect(titles).toContain("Standard form");
    });
  });

  describe("solveSystem", () => {
    it("solves x + y = 5 and x - y = 1", () => {
      const result = solveSystem("x + y = 5", "x - y = 1");
      expect(result.solution.kind).toBe("unique");
      expect(result.solution.x).toBeCloseTo(3, 8);
      expect(result.solution.y).toBeCloseTo(2, 8);
    });

    it("solves 2x + 3y = 12 and x - y = 1", () => {
      const result = solveSystem("2x + 3y = 12", "x - y = 1");
      expect(result.solution.x).toBeCloseTo(3, 8);
      expect(result.solution.y).toBeCloseTo(2, 8);
    });

    it("solves equations each containing a single variable", () => {
      const result = solveSystem("x = 3", "y = 4");
      expect(result.solution.kind).toBe("unique");
      expect(result.solution.x).toBeCloseTo(3, 8);
      expect(result.solution.y).toBeCloseTo(4, 8);
    });

    it("detects dependent lines (infinitely many solutions)", () => {
      const result = solveSystem("x + y = 4", "2x + 2y = 8");
      expect(result.solution.kind).toBe("infinite");
    });

    it("detects parallel lines (no solution)", () => {
      const result = solveSystem("x + y = 4", "x + y = 7");
      expect(result.solution.kind).toBe("none");
    });

    it("rejects non-linear equations", () => {
      expect(() => solveSystem("x*y = 4", "x + y = 5")).toThrow(/linear/);
      expect(() => solveSystem("x^2 = 4", "x + y = 5")).toThrow(/linear/);
    });

    it("rejects equations missing both variables", () => {
      expect(() => solveSystem("2 + 3 = 5", "x + y = 1")).toThrow(/doesn't contain/);
    });

    it("rejects extra variables", () => {
      expect(() => solveSystem("x + y = 5", "x + z = 1")).toThrow(/extra variable/);
    });

    it("emits Cramer's rule steps", () => {
      const result = solveSystem("x + y = 5", "x - y = 1");
      const titles = result.steps.map(s => s.title);
      expect(titles.some(t => t.includes("Cramer's rule"))).toBe(true);
      expect(titles).toContain("Determinant");
    });
  });

  describe("solveEquation dispatcher", () => {
    it("routes to linear mode by default", () => {
      const result = solveEquation({ eq: "2x + 3 = 7" }, "linear");
      expect(result.mode).toBe("linear");
      expect(result.solution.root).toBe(2);
    });

    it("routes to quadratic mode", () => {
      const result = solveEquation({ eq: "x^2 + 1 = 0" }, "quadratic");
      expect(result.mode).toBe("quadratic");
      expect(result.solution.kind).toBe("complex");
    });

    it("routes to system mode", () => {
      const result = solveEquation({ eq1: "x + y = 5", eq2: "x - y = 1" }, "system");
      expect(result.mode).toBe("system");
      expect(result.solution.x).toBeCloseTo(3, 8);
    });
  });
});
