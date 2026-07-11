import { describe, it, expect } from "vitest";
import {
  getSentimentColor,
  getSentimentLabel,
  splitSentences
} from "../tools/text/sentiment-heatmap.js";

describe("sentiment-heatmap", () => {
  describe("getSentimentColor", () => {
    it("returns dark green for strongly positive", () => {
      expect(getSentimentColor(0.8)).toEqual({ bg: "#22c55e", text: "#fff" });
    });

    it("returns dark red for strongly negative", () => {
      expect(getSentimentColor(-0.8)).toEqual({ bg: "#ef4444", text: "#fff" });
    });

    it("returns light green for slightly positive", () => {
      expect(getSentimentColor(0.1)).toEqual({ bg: "#86efac", text: "#000" });
    });

    it("returns light red for slightly negative", () => {
      expect(getSentimentColor(-0.1)).toEqual({ bg: "#fca5a5", text: "#000" });
    });

    it("returns yellow for neutral", () => {
      expect(getSentimentColor(0)).toEqual({ bg: "#fef9c3", text: "#000" });
    });

    it("returns neutral at boundary 0.05", () => {
      expect(getSentimentColor(0.05)).toEqual({ bg: "#fef9c3", text: "#000" });
    });

    it("returns neutral at boundary -0.05", () => {
      expect(getSentimentColor(-0.05)).toEqual({ bg: "#fef9c3", text: "#000" });
    });
  });

  describe("getSentimentLabel", () => {
    it("returns Positive for high score", () => {
      expect(getSentimentLabel(0.5)).toBe("Positive");
    });

    it("returns Negative for low score", () => {
      expect(getSentimentLabel(-0.5)).toBe("Negative");
    });

    it("returns Slightly Positive", () => {
      expect(getSentimentLabel(0.1)).toBe("Slightly Positive");
    });

    it("returns Slightly Negative", () => {
      expect(getSentimentLabel(-0.1)).toBe("Slightly Negative");
    });

    it("returns Neutral for zero", () => {
      expect(getSentimentLabel(0)).toBe("Neutral");
    });
  });

  describe("splitSentences", () => {
    it("splits on period", () => {
      expect(splitSentences("Hello. World.")).toEqual(["Hello.", "World."]);
    });

    it("splits on exclamation", () => {
      expect(splitSentences("Yes! No!")).toEqual(["Yes!", "No!"]);
    });

    it("splits on question mark", () => {
      expect(splitSentences("Who? What?")).toEqual(["Who?", "What?"]);
    });

    it("handles single sentence", () => {
      expect(splitSentences("Just one sentence.")).toEqual(["Just one sentence."]);
    });

    it("filters empty strings", () => {
      expect(splitSentences("  .  .  ")).toEqual(["  .", "."]);
    });
  });
});
