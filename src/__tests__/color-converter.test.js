import { describe, it, expect } from "vitest";
import { convertColor } from "../tools/css/color-converter.js";

describe("color-converter", () => {
  describe("convertColor", () => {
    it("converts HEX", () => {
      const r = convertColor("#ff0000");
      expect(r).not.toBeNull();
      expect(r.hex).toBe("#ff0000");
      expect(r.rgb).toBe("rgb(255, 0, 0)");
    });

    it("converts HEX without hash", () => {
      const r = convertColor("00ff00");
      expect(r).not.toBeNull();
      expect(r.hex).toBe("#00ff00");
    });

    it("converts shorthand HEX", () => {
      const r = convertColor("#f00");
      expect(r).not.toBeNull();
      expect(r.hex).toBe("#ff0000");
    });

    it("converts RGB", () => {
      const r = convertColor("rgb(0, 0, 255)");
      expect(r).not.toBeNull();
      expect(r.hex).toBe("#0000ff");
      expect(r.rgb).toBe("rgb(0, 0, 255)");
    });

    it("converts HSL", () => {
      const r = convertColor("hsl(120, 100%, 50%)");
      expect(r).not.toBeNull();
      expect(r.hex.toLowerCase()).toBe("#00ff00");
    });

    it("returns null for invalid input", () => {
      expect(convertColor("invalid")).toBeNull();
      expect(convertColor("")).toBeNull();
    });
  });
});
