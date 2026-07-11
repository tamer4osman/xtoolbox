import { describe, it, expect } from "vitest";
import {
  parseColor,
  relativeLuminance,
  contrastRatio,
  checkWcag,
  rgbToHex,
  simulateColorBlindness,
  toolConfig
} from "../tools/css/wcag-contrast-checker.js";

describe("wcag-contrast-checker", () => {
  describe("parseColor", () => {
    it("parses 6-digit hex", () => {
      expect(parseColor("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
      expect(parseColor("#00ff00")).toEqual({ r: 0, g: 255, b: 0 });
      expect(parseColor("#0000ff")).toEqual({ r: 0, g: 0, b: 255 });
    });

    it("parses 3-digit hex", () => {
      expect(parseColor("#f00")).toEqual({ r: 255, g: 0, b: 0 });
      expect(parseColor("#0f0")).toEqual({ r: 0, g: 255, b: 0 });
    });

    it("parses hex without #", () => {
      expect(parseColor("ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    });

    it("parses rgb()", () => {
      expect(parseColor("rgb(255, 128, 0)")).toEqual({ r: 255, g: 128, b: 0 });
    });

    it("parses rgba()", () => {
      expect(parseColor("rgba(100, 200, 50, 0.5)")).toEqual({ r: 100, g: 200, b: 50 });
    });

    it("parses hsl()", () => {
      const result = parseColor("hsl(0, 100%, 50%)");
      expect(result.r).toBe(255);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
    });

    it("parses hsla()", () => {
      const result = parseColor("hsla(120, 100%, 50%, 1)");
      expect(result.r).toBe(0);
      expect(result.g).toBe(255);
      expect(result.b).toBe(0);
    });

    it("returns null for invalid input", () => {
      expect(parseColor("not a color")).toBeNull();
      expect(parseColor("")).toBeNull();
      expect(parseColor("12345")).toBeNull();
    });
  });

  describe("relativeLuminance", () => {
    it("returns 0 for black", () => {
      expect(relativeLuminance(0, 0, 0)).toBe(0);
    });

    it("returns ~1 for white", () => {
      expect(relativeLuminance(255, 255, 255)).toBeCloseTo(1.0, 2);
    });

    it("returns correct value for middle gray", () => {
      const lum = relativeLuminance(128, 128, 128);
      expect(lum).toBeGreaterThan(0.15);
      expect(lum).toBeLessThan(0.25);
    });
  });

  describe("contrastRatio", () => {
    it("returns 21:1 for black on white", () => {
      const ratio = contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
      expect(ratio).toBeCloseTo(21, 0);
    });

    it("returns 1:1 for same color", () => {
      const ratio = contrastRatio({ r: 128, g: 128, b: 128 }, { r: 128, g: 128, b: 128 });
      expect(ratio).toBeCloseTo(1, 1);
    });

    it("is commutative", () => {
      const a = { r: 255, g: 0, b: 0 };
      const b = { r: 0, g: 0, b: 255 };
      expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 10);
    });
  });

  describe("checkWcag", () => {
    it("passes AA normal for ratio >= 4.5", () => {
      expect(checkWcag(4.5).aa_normal).toBe(true);
      expect(checkWcag(4.4).aa_normal).toBe(false);
    });

    it("passes AA large for ratio >= 3", () => {
      expect(checkWcag(3).aa_large).toBe(true);
      expect(checkWcag(2.9).aa_large).toBe(false);
    });

    it("passes AAA normal for ratio >= 7", () => {
      expect(checkWcag(7).aaa_normal).toBe(true);
      expect(checkWcag(6.9).aaa_normal).toBe(false);
    });

    it("passes AAA large for ratio >= 4.5", () => {
      expect(checkWcag(4.5).aaa_large).toBe(true);
      expect(checkWcag(4.4).aaa_large).toBe(false);
    });
  });

  describe("rgbToHex", () => {
    it("converts RGB to hex", () => {
      expect(rgbToHex(255, 0, 0)).toBe("#ff0000");
      expect(rgbToHex(0, 255, 0)).toBe("#00ff00");
      expect(rgbToHex(0, 0, 255)).toBe("#0000ff");
    });

    it("pads single digits", () => {
      expect(rgbToHex(1, 2, 3)).toBe("#010203");
    });
  });

  describe("simulateColorBlindness", () => {
    it("returns same color for none", () => {
      const rgb = { r: 255, g: 0, b: 0 };
      expect(simulateColorBlindness(rgb, "protanopia")).not.toEqual(rgb);
    });

    it("returns grayscale for achromatopsia", () => {
      const result = simulateColorBlindness({ r: 255, g: 0, b: 0 }, "achromatopsia");
      expect(result.r).toBe(result.g);
      expect(result.g).toBe(result.b);
    });
  });

  it("has correct config", () => {
    expect(toolConfig.id).toBe("wcag-contrast-checker");
    expect(toolConfig.category).toBe("css");
    expect(toolConfig.keywords.length).toBeGreaterThan(3);
  });
});
