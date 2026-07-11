import { describe, it, expect } from "vitest";
import { toRoman, fromRoman, toolConfig } from "../tools/text/roman-numerals.js";

describe("roman-numerals", () => {
  describe("toRoman", () => {
    it("converts basic numbers", () => {
      expect(toRoman(1)).toBe("I");
      expect(toRoman(5)).toBe("V");
      expect(toRoman(10)).toBe("X");
      expect(toRoman(50)).toBe("L");
      expect(toRoman(100)).toBe("C");
      expect(toRoman(500)).toBe("D");
      expect(toRoman(1000)).toBe("M");
    });

    it("converts 2024", () => {
      expect(toRoman(2024)).toBe("MMXXIV");
    });

    it("converts 3999", () => {
      expect(toRoman(3999)).toBe("MMMCMXCIX");
    });

    it("converts 4 and 9", () => {
      expect(toRoman(4)).toBe("IV");
      expect(toRoman(9)).toBe("IX");
    });

    it("returns null for out of range", () => {
      expect(toRoman(0)).toBeNull();
      expect(toRoman(-1)).toBeNull();
      expect(toRoman(4000)).toBeNull();
    });

    it("returns null for non-integers", () => {
      expect(toRoman(1.5)).toBeNull();
    });
  });

  describe("fromRoman", () => {
    it("converts basic numerals", () => {
      expect(fromRoman("I")).toBe(1);
      expect(fromRoman("V")).toBe(5);
      expect(fromRoman("X")).toBe(10);
      expect(fromRoman("L")).toBe(50);
      expect(fromRoman("C")).toBe(100);
      expect(fromRoman("D")).toBe(500);
      expect(fromRoman("M")).toBe(1000);
    });

    it("converts MMXXIV", () => {
      expect(fromRoman("MMXXIV")).toBe(2024);
    });

    it("converts MMMCMXCIX", () => {
      expect(fromRoman("MMMCMXCIX")).toBe(3999);
    });

    it("converts subtractive notation", () => {
      expect(fromRoman("IV")).toBe(4);
      expect(fromRoman("IX")).toBe(9);
      expect(fromRoman("XL")).toBe(40);
      expect(fromRoman("XC")).toBe(90);
      expect(fromRoman("CD")).toBe(400);
      expect(fromRoman("CM")).toBe(900);
    });

    it("handles lowercase", () => {
      expect(fromRoman("mmxxiv")).toBe(2024);
    });

    it("returns null for invalid input", () => {
      expect(fromRoman("")).toBeNull();
      expect(fromRoman(null)).toBeNull();
      expect(fromRoman("IIII")).toBeNull();
      expect(fromRoman("ABC")).toBeNull();
      expect(fromRoman("XIVI")).toBeNull();
    });
  });

  it("round-trip 1-3999", () => {
    for (let i = 1; i <= 3999; i++) {
      expect(fromRoman(toRoman(i))).toBe(i);
    }
  });

  it("has correct config", () => {
    expect(toolConfig.id).toBe("roman-numerals");
    expect(toolConfig.category).toBe("text");
    expect(toolConfig.keywords.length).toBeGreaterThan(3);
  });
});
