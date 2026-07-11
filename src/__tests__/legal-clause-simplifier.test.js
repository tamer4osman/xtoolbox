import { describe, it, expect } from "vitest";
import { estimateReadingTime, simplifyLegalText } from "../tools/text/legal-clause-simplifier.js";

describe("legal-clause-simplifier", () => {
  describe("estimateReadingTime", () => {
    it("returns 1 for short text", () => {
      expect(estimateReadingTime("Hello world")).toBe(1);
    });

    it("calculates minutes for 200 words", () => {
      const text = Array(200).fill("word").join(" ");
      expect(estimateReadingTime(text)).toBe(1);
    });

    it("calculates minutes for 400 words", () => {
      const text = Array(400).fill("word").join(" ");
      expect(estimateReadingTime(text)).toBe(2);
    });

    it("rounds up for partial minutes", () => {
      const text = Array(250).fill("word").join(" ");
      expect(estimateReadingTime(text)).toBe(2);
    });

    it("returns at least 1 minute for empty string", () => {
      expect(estimateReadingTime("")).toBe(1);
    });
  });

  describe("simplifyLegalText", () => {
    it("replaces hereinafter", () => {
      const result = simplifyLegalText("The hereinafter clause");
      expect(result).toContain("from now on");
    });

    it("replaces herein", () => {
      const result = simplifyLegalText("herein described");
      expect(result).toContain("in this document");
    });

    it("replaces notwithstanding case-insensitively", () => {
      const result = simplifyLegalText("NOTWITHSTANDING the above");
      expect(result).toContain("despite");
    });

    it("replaces multiple legal terms", () => {
      const result = simplifyLegalText("pursuant to the aforementioned");
      expect(result).toContain("according to");
      expect(result).toContain("mentioned above");
    });

    it("replaces indemnify", () => {
      const result = simplifyLegalText("You shall indemnify us");
      expect(result).toContain("protect from loss");
    });

    it("splits long sentences at commas", () => {
      const longSentence = "A".repeat(90) + ", " + "B".repeat(20);
      const result = simplifyLegalText(longSentence);
      expect(result).toContain(",\n");
    });
  });
});
