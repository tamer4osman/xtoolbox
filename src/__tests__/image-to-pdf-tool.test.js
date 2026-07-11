import { describe, it, expect } from "vitest";
import { computePageDimensions, fitImageToPage } from "../tools/pdf/image-to-pdf-tool.js";

const makeImage = (naturalWidth, naturalHeight, renderedWidth, renderedHeight) => ({
  naturalWidth,
  naturalHeight,
  width: renderedWidth ?? naturalWidth,
  height: renderedHeight ?? naturalHeight
});

describe("computePageDimensions", () => {
  it("fit mode uses naturalWidth/naturalHeight, not CSS-scaled width/height", () => {
    const image = makeImage(800, 600, 400, 300);
    const [w, h] = computePageDimensions("fit", "auto", image, 0);
    expect(w).toBe(800);
    expect(h).toBe(600);
  });

  it("fit mode adds margin on both sides", () => {
    const image = makeImage(800, 600);
    const [w, h] = computePageDimensions("fit", "auto", image, 20);
    expect(w).toBe(840);
    expect(h).toBe(640);
  });

  it("A4 portrait by default", () => {
    const image = makeImage(800, 600);
    const [w, h] = computePageDimensions("a4", "portrait", image, 0);
    expect([w, h]).toEqual([595, 842]);
  });

  it("A4 landscape when orientation is landscape", () => {
    const image = makeImage(800, 600);
    const [w, h] = computePageDimensions("a4", "landscape", image, 0);
    expect([w, h]).toEqual([842, 595]);
  });

  it("A4 auto-orientation picks landscape for landscape image", () => {
    const image = makeImage(800, 600);
    const [w, h] = computePageDimensions("a4", "auto", image, 0);
    expect([w, h]).toEqual([842, 595]);
  });

  it("A4 auto-orientation picks portrait for portrait image", () => {
    const image = makeImage(600, 800);
    const [w, h] = computePageDimensions("a4", "auto", image, 0);
    expect([w, h]).toEqual([595, 842]);
  });

  it("letter size", () => {
    const image = makeImage(800, 600);
    const [w, h] = computePageDimensions("letter", "portrait", image, 0);
    expect([w, h]).toEqual([612, 792]);
  });

  it("legal size", () => {
    const image = makeImage(800, 600);
    const [w, h] = computePageDimensions("legal", "portrait", image, 0);
    expect([w, h]).toEqual([612, 1008]);
  });
});

describe("fitImageToPage", () => {
  it("uses naturalWidth/naturalHeight for aspect ratio, not CSS-scaled size", () => {
    const image = makeImage(800, 600, 400, 300);
    const { drawWidth, drawHeight } = fitImageToPage(image, 800, 600, 0);
    expect(drawWidth).toBe(800);
    expect(drawHeight).toBe(600);
  });

  it("constrains by width for wide images", () => {
    const image = makeImage(800, 400);
    const { drawWidth, drawHeight } = fitImageToPage(image, 600, 800, 0);
    expect(drawWidth).toBe(600);
    expect(drawHeight).toBe(300);
  });

  it("constrains by height for tall images", () => {
    const image = makeImage(400, 800);
    const { drawWidth, drawHeight } = fitImageToPage(image, 600, 800, 0);
    expect(drawHeight).toBe(800);
    expect(drawWidth).toBe(400);
  });

  it("respects margin when computing available area", () => {
    const image = makeImage(800, 400);
    const { drawWidth, drawHeight } = fitImageToPage(image, 600, 800, 50);
    expect(drawWidth).toBe(500);
    expect(drawHeight).toBe(250);
  });
});
