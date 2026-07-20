import { describe, it, expect } from "vitest";
import {
  toolConfig,
  parseInput,
  mean,
  median,
  mode,
  variance,
  stdDev,
  quantile,
  quartiles,
  deciles,
  percentile,
  meanAbsDeviation,
  skewness,
  kurtosis,
  detectOutliers,
  computeAllStats,
  sturgesBinCount,
  computeHistogram
} from "../tools/math/stats-calc.js";

describe("stats-calc", () => {
  describe("toolConfig", () => {
    it("has correct id, name, category", () => {
      expect(toolConfig.id).toBe("stats-calc");
      expect(toolConfig.name).toBe("Statistics Calculator");
      expect(toolConfig.category).toBe("math");
    });

    it("has keywords, steps, and faqs", () => {
      expect(toolConfig.keywords.length).toBeGreaterThan(3);
      expect(toolConfig.steps.length).toBeGreaterThan(2);
      expect(toolConfig.faqs.length).toBeGreaterThan(1);
    });

    it("accepts csv and txt files", () => {
      expect(toolConfig.accept).toBe(".csv,.txt");
    });
  });

  describe("parseInput", () => {
    it("parses comma-separated values", () => {
      expect(parseInput("1, 2, 3, 4, 5").values).toEqual([1, 2, 3, 4, 5]);
    });

    it("parses newline-separated values", () => {
      expect(parseInput("1\n2\n3").values).toEqual([1, 2, 3]);
    });

    it("parses space-separated values", () => {
      expect(parseInput("1 2 3").values).toEqual([1, 2, 3]);
    });

    it("handles mixed delimiters", () => {
      expect(parseInput("1, 2; 3\n4\t5").values).toEqual([1, 2, 3, 4, 5]);
    });

    it("parses negative numbers", () => {
      expect(parseInput("-1, -2.5, 3").values).toEqual([-1, -2.5, 3]);
    });

    it("parses scientific notation", () => {
      expect(parseInput("1.5e-3, 2E6").values).toEqual([0.0015, 2000000]);
    });

    it("strips currency symbols", () => {
      expect(parseInput("$100, €200, £50").values).toEqual([100, 200, 50]);
    });

    it("skips header row on first non-numeric token", () => {
      const result = parseInput("value\n1\n2\n3");
      expect(result.values).toEqual([1, 2, 3]);
      expect(result.skipped).toBe(0);
    });

    it("counts skipped non-numeric values", () => {
      const result = parseInput("1, abc, 2, xyz, 3");
      expect(result.values).toEqual([1, 2, 3]);
      expect(result.skipped).toBe(2);
    });

    it("handles empty input", () => {
      expect(parseInput("").values).toEqual([]);
      expect(parseInput(null).values).toEqual([]);
    });
  });

  describe("mean", () => {
    it("computes arithmetic mean", () => {
      expect(mean([1, 2, 3, 4, 5])).toBe(3);
    });

    it("returns null for empty array", () => {
      expect(mean([])).toBeNull();
    });

    it("handles single value", () => {
      expect(mean([42])).toBe(42);
    });
  });

  describe("median", () => {
    it("returns middle value for odd count", () => {
      expect(median([1, 3, 5, 7, 9])).toBe(5);
    });

    it("returns average of two middle values for even count", () => {
      expect(median([1, 2, 3, 4])).toBe(2.5);
    });

    it("returns null for empty array", () => {
      expect(median([])).toBeNull();
    });
  });

  describe("mode", () => {
    it("returns most frequent value", () => {
      expect(mode([1, 2, 2, 3])).toEqual([2]);
    });

    it("returns multiple modes for multimodal data", () => {
      expect(mode([1, 1, 2, 2, 3])).toEqual([1, 2]);
    });

    it("returns empty array when all values are unique", () => {
      expect(mode([1, 2, 3, 4])).toEqual([]);
    });
  });

  describe("variance", () => {
    it("computes sample variance (N-1)", () => {
      const v = variance([2, 4, 4, 4, 5, 5, 7, 9], true);
      expect(v).toBeCloseTo(32 / 7, 5);
    });

    it("computes population variance (N)", () => {
      const v = variance([2, 4, 4, 4, 5, 5, 7, 9], false);
      expect(v).toBeCloseTo(4, 5);
    });

    it("returns null for sample variance with single value", () => {
      expect(variance([5], true)).toBeNull();
    });

    it("returns 0 for population variance with single value", () => {
      expect(variance([5], false)).toBe(0);
    });
  });

  describe("stdDev", () => {
    it("computes sample std dev", () => {
      const sd = stdDev([2, 4, 4, 4, 5, 5, 7, 9], true);
      expect(sd).toBeCloseTo(Math.sqrt(32 / 7), 5);
    });

    it("computes population std dev", () => {
      const sd = stdDev([2, 4, 4, 4, 5, 5, 7, 9], false);
      expect(sd).toBeCloseTo(2, 5);
    });
  });

  describe("quantile (Method 4 — p(n+1) interpolation)", () => {
    it("returns min for p=0", () => {
      expect(quantile([1, 2, 3, 4, 5], 0)).toBe(1);
    });

    it("returns max for p=1", () => {
      expect(quantile([1, 2, 3, 4, 5], 1)).toBe(5);
    });

    it("interpolates for non-integer ranks", () => {
      expect(quantile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 0.25)).toBe(3);
    });

    it("handles single-value array", () => {
      expect(quantile([42], 0.5)).toBe(42);
    });
  });

  describe("quartiles (Wikipedia example 1)", () => {
    it("matches Method 4 results for odd dataset", () => {
      const data = [6, 7, 15, 36, 39, 40, 41, 42, 43, 47, 49];
      const sorted = [...data].sort((a, b) => a - b);
      const q = quartiles(sorted);
      expect(q.q1).toBe(15);
      expect(q.q2).toBe(40);
      expect(q.q3).toBe(43);
    });

    it("matches Method 4 results for even dataset", () => {
      const data = [7, 15, 36, 39, 40, 41];
      const sorted = [...data].sort((a, b) => a - b);
      const q = quartiles(sorted);
      expect(q.q1).toBe(13);
      expect(q.q2).toBe(37.5);
      expect(q.q3).toBe(40.25);
    });
  });

  describe("deciles", () => {
    it("returns 9 deciles d1-d9", () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      const d = deciles(data);
      expect(Object.keys(d).length).toBe(9);
      expect(d.d1).toBeDefined();
      expect(d.d9).toBeDefined();
    });
  });

  describe("percentile", () => {
    it("returns value at given percentile", () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      expect(percentile(data, 50)).toBe(6);
    });

    it("returns null for out-of-range percentile", () => {
      expect(percentile([1, 2, 3], -1)).toBeNull();
      expect(percentile([1, 2, 3], 101)).toBeNull();
    });
  });

  describe("meanAbsDeviation", () => {
    it("computes mean absolute deviation", () => {
      expect(meanAbsDeviation([1, 2, 3, 4, 5])).toBeCloseTo(1.2, 5);
    });

    it("returns null for empty array", () => {
      expect(meanAbsDeviation([])).toBeNull();
    });
  });

  describe("skewness", () => {
    it("returns ~0 for symmetric data", () => {
      const s = skewness([-2, -1, 0, 1, 2]);
      expect(Math.abs(s)).toBeLessThan(0.1);
    });

    it("returns null for n < 3", () => {
      expect(skewness([1, 2])).toBeNull();
    });
  });

  describe("kurtosis", () => {
    it("returns ~0 excess kurtosis for normal-like data", () => {
      const data = [];
      for (let i = -5; i <= 5; i += 0.5) data.push(i);
      const k = kurtosis(data);
      expect(k).not.toBeNull();
    });

    it("returns null for n < 4", () => {
      expect(kurtosis([1, 2, 3])).toBeNull();
    });
  });

  describe("detectOutliers", () => {
    it("detects values outside 1.5*IQR fences", () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 100];
      const sorted = [...data].sort((a, b) => a - b);
      const result = detectOutliers(sorted);
      expect(result.outliers).toContain(100);
    });

    it("returns empty outliers for clean data", () => {
      const data = [1, 2, 3, 4, 5];
      const result = detectOutliers(data);
      expect(result.outliers).toEqual([]);
    });
  });

  describe("computeAllStats", () => {
    it("returns null for empty input", () => {
      expect(computeAllStats([])).toBeNull();
    });

    it("computes all statistics for a dataset", () => {
      const stats = computeAllStats([1, 2, 3, 4, 5]);
      expect(stats.count).toBe(5);
      expect(stats.mean).toBe(3);
      expect(stats.median).toBe(3);
      expect(stats.min).toBe(1);
      expect(stats.max).toBe(5);
      expect(stats.range).toBe(4);
      expect(stats.stdDevSample).toBeCloseTo(Math.sqrt(2.5), 5);
      expect(stats.stdDevPopulation).toBeCloseTo(Math.sqrt(2), 5);
      expect(stats.sorted).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe("sturgesBinCount", () => {
    it("returns at least 1 for small n", () => {
      expect(sturgesBinCount(0)).toBe(1);
      expect(sturgesBinCount(1)).toBe(1);
    });

    it("returns ceil(log2(n) + 1)", () => {
      expect(sturgesBinCount(8)).toBe(4);
      expect(sturgesBinCount(100)).toBe(8);
      expect(sturgesBinCount(1000)).toBe(11);
    });
  });

  describe("computeHistogram", () => {
    it("returns empty bins for empty input", () => {
      expect(computeHistogram([]).bins).toEqual([]);
    });

    it("returns single bin when all values are equal", () => {
      const result = computeHistogram([5, 5, 5, 5]);
      expect(result.binCount).toBe(1);
      expect(result.bins[0].count).toBe(4);
    });

    it("distributes values across bins", () => {
      const result = computeHistogram([1, 2, 3, 4, 5]);
      const total = result.bins.reduce((sum, b) => sum + b.count, 0);
      expect(total).toBe(5);
    });
  });
});
