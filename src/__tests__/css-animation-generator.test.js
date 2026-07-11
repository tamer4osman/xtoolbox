import { describe, it, expect } from "vitest";
import { generateCSS } from "../tools/css/css-animation-generator.js";

describe("css-animation-generator", () => {
  describe("generateCSS", () => {
    it("returns string with @keyframes", () => {
      const css = generateCSS("from { opacity: 0; } to { opacity: 1; }", {
        duration: 1,
        delay: 0,
        easing: "ease",
        iterations: "infinite",
        direction: "normal",
        fillMode: "none"
      });
      expect(css).toContain("@keyframes");
      expect(css).toContain("animation:");
      expect(css).toContain("1s");
      expect(css).toContain("ease");
    });

    it("includes custom duration", () => {
      const css = generateCSS("from { opacity: 0; } to { opacity: 1; }", {
        duration: 2.5,
        delay: 0.5,
        easing: "ease-in",
        iterations: "3",
        direction: "alternate",
        fillMode: "forwards"
      });
      expect(css).toContain("2.5s");
      expect(css).toContain("0.5s");
      expect(css).toContain("ease-in");
      expect(css).toContain("alternate");
      expect(css).toContain("forwards");
    });
  });
});
