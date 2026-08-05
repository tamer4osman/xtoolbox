import { describe, it, expect } from "vitest";
import {
  toolConfig,
  formatNumber,
  parseValue,
  buildMatrix,
  performOperation,
  matrixToCsv,
  matrixToSpaced,
  matrixToLatex,
  resultToText
} from "../tools/math/matrix-calc.js";

describe("matrix-calc", () => {
  describe("toolConfig", () => {
    it("has correct id, name, category", () => {
      expect(toolConfig.id).toBe("matrix-calc");
      expect(toolConfig.name).toBe("Matrix Calculator");
      expect(toolConfig.category).toBe("math");
    });

    it("has keywords, steps, and faqs", () => {
      expect(toolConfig.keywords.length).toBeGreaterThan(3);
      expect(toolConfig.steps.length).toBeGreaterThan(2);
      expect(toolConfig.faqs.length).toBeGreaterThan(1);
    });
  });

  describe("formatNumber", () => {
    it("formats integers without decimals", () => {
      expect(formatNumber(4)).toBe("4");
      expect(formatNumber(-2)).toBe("-2");
    });

    it("rounds to 6 significant digits", () => {
      expect(formatNumber(1 / 3)).toBe("0.333333");
      expect(formatNumber(2 / 3)).toBe("0.666667");
    });

    it("treats near-zero values as zero", () => {
      expect(formatNumber(1e-12)).toBe("0");
      expect(formatNumber(-1e-11)).toBe("0");
    });

    it("handles non-finite values", () => {
      expect(formatNumber(NaN)).toBe("undefined");
      expect(formatNumber(Infinity)).toBe("undefined");
    });
  });

  describe("parseValue", () => {
    it("parses valid numbers including negatives and decimals", () => {
      expect(parseValue("3")).toBe(3);
      expect(parseValue("-2.5")).toBe(-2.5);
      expect(parseValue(" 7 ")).toBe(7);
      expect(parseValue("1e3")).toBe(1000);
    });

    it("throws on empty input", () => {
      expect(() => parseValue("")).toThrow("Every cell must contain a number");
      expect(() => parseValue("   ")).toThrow("Every cell must contain a number");
    });

    it("throws on non-numeric input", () => {
      expect(() => parseValue("abc")).toThrow("is not a valid number");
      expect(() => parseValue("1,2")).toThrow("is not a valid number");
    });
  });

  describe("buildMatrix", () => {
    it("builds a matrix from a 2D model", () => {
      const model = [
        ["1", "2"],
        ["3", "4"]
      ];
      expect(buildMatrix(model)).toEqual([
        [1, 2],
        [3, 4]
      ]);
    });

    it("builds a non-square matrix", () => {
      const model = [
        ["1", "2", "3"],
        ["4", "5", "6"]
      ];
      expect(buildMatrix(model)).toEqual([
        [1, 2, 3],
        [4, 5, 6]
      ]);
    });

    it("throws when any cell is invalid", () => {
      const model = [
        ["1", "x"],
        ["3", "4"]
      ];
      expect(() => buildMatrix(model)).toThrow("is not a valid number");
    });
  });

  describe("performOperation", () => {
    const a = [
      [1, 2],
      [3, 4]
    ];
    const b = [
      [5, 6],
      [7, 8]
    ];

    it("adds matrices", () => {
      const { value, scalar } = performOperation("add", a, b);
      expect(scalar).toBe(false);
      expect(value).toEqual([
        [6, 8],
        [10, 12]
      ]);
    });

    it("subtracts matrices", () => {
      const { value } = performOperation("sub", a, b);
      expect(value).toEqual([
        [-4, -4],
        [-4, -4]
      ]);
    });

    it("multiplies matrices", () => {
      const { value } = performOperation("mul", a, b);
      expect(value).toEqual([
        [19, 22],
        [43, 50]
      ]);
    });

    it("transposes a matrix", () => {
      const rect = [
        [1, 2, 3],
        [4, 5, 6]
      ];
      const { value } = performOperation("trans", rect);
      expect(value).toEqual([
        [1, 4],
        [2, 5],
        [3, 6]
      ]);
    });

    it("inverts an invertible matrix", () => {
      const { value } = performOperation("inv", a);
      expect(value[0][0]).toBeCloseTo(-2, 5);
      expect(value[0][1]).toBeCloseTo(1, 5);
      expect(value[1][0]).toBeCloseTo(1.5, 5);
      expect(value[1][1]).toBeCloseTo(-0.5, 5);
    });

    it("computes the determinant as a scalar", () => {
      const { value, scalar } = performOperation("det", a);
      expect(scalar).toBe(true);
      expect(value).toBeCloseTo(-2, 5);
    });

    it("throws on singular matrix inverse", () => {
      const singular = [
        [1, 2],
        [2, 4]
      ];
      expect(() => performOperation("inv", singular)).toThrow();
    });

    it("throws on non-square determinant", () => {
      const rect = [
        [1, 2],
        [3, 4],
        [5, 6]
      ];
      expect(() => performOperation("det", rect)).toThrow();
    });

    it("throws on unknown operation", () => {
      expect(() => performOperation("sqrt", a)).toThrow("Unknown operation");
    });
  });

  describe("output formats", () => {
    const value = [
      [1, 2],
      [3, 4]
    ];

    it("exports CSV", () => {
      expect(matrixToCsv(value)).toBe("1,2\n3,4");
    });

    it("exports space-separated text", () => {
      expect(matrixToSpaced(value)).toBe("1 2\n3 4");
    });

    it("exports LaTeX matrix", () => {
      expect(matrixToLatex(value)).toBe("\\begin{pmatrix}1 & 2 \\\\ 3 & 4\\end{pmatrix}");
    });
  });

  describe("resultToText", () => {
    it("formats a scalar result", () => {
      const result = { value: 42, scalar: true };
      expect(resultToText(result, "csv")).toBe("42");
      expect(resultToText(result, "latex")).toBe("42");
    });

    it("formats a matrix result in the requested format", () => {
      const result = {
        value: [
          [1, 2],
          [3, 4]
        ],
        scalar: false
      };
      expect(resultToText(result, "csv")).toBe("1,2\n3,4");
      expect(resultToText(result, "spaces")).toBe("1 2\n3 4");
      expect(resultToText(result, "latex")).toBe("\\begin{pmatrix}1 & 2 \\\\ 3 & 4\\end{pmatrix}");
    });
  });
});
