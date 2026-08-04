import { describe, it, expect } from "vitest";
import { hexToKeyColor, buildComposeFilter } from "../tools/video/chroma-key-composer.js";

describe("chroma-key-composer", () => {
  describe("hexToKeyColor", () => {
    it("converts #RRGGBB to 0xRRGGBB", () => {
      expect(hexToKeyColor("#00FF00")).toBe("0x00FF00");
    });

    it("converts lowercase hex", () => {
      expect(hexToKeyColor("#00ff00")).toBe("0x00FF00");
    });

    it("handles blue", () => {
      expect(hexToKeyColor("#0000FF")).toBe("0x0000FF");
    });
  });

  describe("buildComposeFilter", () => {
    const base = {
      w: 1920,
      h: 1080,
      color: "0x00FF00",
      similarity: 0.3,
      blend: 0.1,
      x: 0,
      y: 0,
      duration: 12.5
    };

    it("builds a full chromakey + overlay graph", () => {
      const filter = buildComposeFilter(base);
      expect(filter).toContain("chromakey=0x00FF00:0.30:0.10");
      expect(filter).toContain("scale=1920:1080:force_original_aspect_ratio=increase");
      expect(filter).toContain("crop=1920:1080");
      expect(filter).toContain("trim=duration=12.50");
      expect(filter).toContain("overlay=0:0");
    });

    it("includes foreground as input [0] and background as input [1]", () => {
      const filter = buildComposeFilter(base);
      expect(filter.startsWith("[0:v]chromakey=")).toBe(true);
      expect(filter).toContain("[1:v]scale=");
    });

    it("labels the output as [out]", () => {
      const filter = buildComposeFilter(base);
      expect(filter.endsWith("overlay=0:0[out]")).toBe(true);
    });

    it("applies x and y offsets", () => {
      const filter = buildComposeFilter({ ...base, x: 100, y: 50 });
      expect(filter).toContain("overlay=100:50");
    });

    it("formats similarity and blend with two decimals", () => {
      const filter = buildComposeFilter({ ...base, similarity: 0.5, blend: 0.2 });
      expect(filter).toContain("chromakey=0x00FF00:0.50:0.20");
    });

    it("handles string similarity values", () => {
      const filter = buildComposeFilter({ ...base, similarity: "0.4", blend: "0.15" });
      expect(filter).toContain("chromakey=0x00FF00:0.40:0.15");
    });
  });
});
