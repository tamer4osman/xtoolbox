import { describe, it, expect } from "vitest";
import { optimizeSvg, toolConfig } from "../tools/css/svg-optimizer.js";

const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 200 200">
  <metadata>Some metadata</metadata>
  <!-- This is a comment -->
  <sodipodi:namedview id="namedview1"/>
  <defs>
    <linearGradient id="grad1">
      <stop offset="0%" stop-color="red"/>
      <stop offset="100%" stop-color="blue"/>
    </linearGradient>
  </defs>
  <g data-name="layer1" fill="none">
    <g transform="translate(10,10)">
      <rect x="10" y="10" width="50" height="50" fill="url(#grad1)" data-id="rect1"/>
      <circle cx="100" cy="100" r="30.456789"/>
    </g>
    <g></g>
  </g>
  <title>My SVG</title>
  <desc>A description</desc>
</svg>`;

describe("svg-optimizer", () => {
  describe("optimizeSvg", () => {
    it("removes metadata", () => {
      const result = optimizeSvg(sampleSvg, {
        removeMetadata: true,
        removeComments: true,
        removeEditorData: true
      });
      expect(result.optimized).not.toContain("metadata");
      expect(result.optimized).not.toContain("Some metadata");
    });

    it("removes comments", () => {
      const result = optimizeSvg(sampleSvg, { removeComments: true });
      expect(result.optimized).not.toContain("<!--");
    });

    it("removes editor data (sodipodi)", () => {
      const result = optimizeSvg(sampleSvg, { removeEditorData: true });
      expect(result.optimized).not.toContain("sodipodi");
      expect(result.optimized).not.toContain("namedview");
    });

    it("removes title and desc", () => {
      const result = optimizeSvg(sampleSvg);
      expect(result.optimized).not.toContain("<title>");
      expect(result.optimized).not.toContain("<desc>");
    });

    it("removes empty groups", () => {
      const result = optimizeSvg(sampleSvg, { removeEmptyGroups: true });
      expect(result.optimized).not.toContain("<g></g>");
    });

    it("removes data- attributes", () => {
      const result = optimizeSvg(sampleSvg);
      expect(result.optimized).not.toContain("data-name");
      expect(result.optimized).not.toContain("data-id");
    });

    it("rounds path data coordinates", () => {
      const result = optimizeSvg(sampleSvg, { precision: 1 });
      expect(result.optimized).not.toContain("30.456789");
      expect(result.optimized).toContain("30.5");
    });

    it("returns correct stats", () => {
      const result = optimizeSvg(sampleSvg);
      expect(result.stats.before).toBe(sampleSvg.length);
      expect(result.stats.after).toBeLessThan(result.stats.before);
      expect(result.stats.saved).toBeGreaterThan(0);
      expect(parseFloat(result.stats.percent)).toBeGreaterThan(0);
    });

    it("returns optimized SVG that is valid", () => {
      const result = optimizeSvg(sampleSvg);
      expect(result.optimized).toContain("<svg");
      expect(result.optimized).toContain("</svg>");
    });

    it("handles invalid SVG gracefully", () => {
      const result = optimizeSvg("not an svg");
      expect(result.stats.before).toBe("not an svg".length);
    });

    it("preserves visual elements", () => {
      const result = optimizeSvg(sampleSvg);
      expect(result.optimized).toContain("<rect");
      expect(result.optimized).toContain("<circle");
    });

    it("respects precision option", () => {
      const low = optimizeSvg(sampleSvg, { precision: 0 });
      const high = optimizeSvg(sampleSvg, { precision: 5 });
      expect(low.optimized.length).toBeLessThanOrEqual(high.optimized.length);
    });

    it("can disable individual options", () => {
      const result = optimizeSvg(sampleSvg, { removeComments: false });
      expect(result.optimized).toContain("<!--");
    });
  });

  describe("collapseGroups", () => {
    it("collapses single-child groups with transforms", () => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg"><g transform="translate(10,10)"><rect x="0" y="0" width="10" height="10"/></g></svg>`;
      const result = optimizeSvg(svg, { collapseGroups: true });
      expect(result.optimized).toContain("translate(10,10)");
    });
  });

  it("has correct config", () => {
    expect(toolConfig.id).toBe("svg-optimizer");
    expect(toolConfig.category).toBe("css");
    expect(toolConfig.keywords.length).toBeGreaterThan(3);
  });
});
