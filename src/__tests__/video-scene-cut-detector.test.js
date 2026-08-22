import { describe, expect, it } from "vitest";
import {
  buildChaptersText,
  buildCsv,
  cleanup,
  detectCuts,
  formatTs,
  frameDistance,
  grayHistogram
} from "../tools/video/video-scene-cut-detector.js";
import { testToolConfig } from "./helpers/tool-config-test.js";

testToolConfig(() => import("../tools/video/video-scene-cut-detector.js"), {
  id: "video-scene-cut-detector",
  name: "Video Scene Cut Detector",
  category: "video"
});

function makeImageData(pixels) {
  const data = new Uint8ClampedArray(pixels.length * 4);
  pixels.forEach((gray, i) => {
    data[i * 4] = gray;
    data[i * 4 + 1] = gray;
    data[i * 4 + 2] = gray;
    data[i * 4 + 3] = 255;
  });
  return { data };
}

describe("grayHistogram", () => {
  it("normalizes to fractions and bins correctly", () => {
    const h = grayHistogram(makeImageData([0, 255]));
    expect(h.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 5);
    expect(h[0]).toBeCloseTo(0.5, 2);
    expect(h[63]).toBeCloseTo(0.5, 2);
  });

  it("handles uniform mid-gray frames", () => {
    const h = grayHistogram(makeImageData(Array(16).fill(128)));
    const mass = h.reduce((a, b) => a + b, 0);
    expect(mass).toBeCloseTo(1, 5);
    expect(Math.max(...h)).toBeCloseTo(1, 1);
  });
});

describe("frameDistance", () => {
  it("returns 0 for identical histograms and ~1 for disjoint", () => {
    const a = Array.from({ length: 64 }, () => 0);
    a[0] = 1;
    const b = Array.from({ length: 64 }, () => 0);
    b[63] = 1;
    expect(frameDistance(a, a)).toBe(0);
    expect(frameDistance(a, b)).toBeCloseTo(1, 5);
  });
});

describe("detectCuts", () => {
  const flat = Array.from({ length: 20 }, () => 0.01);

  it("finds a strong spike above the adaptive threshold", () => {
    const dists = [...flat];
    dists[7] = 0.8;
    const { cuts, threshold } = detectCuts(dists, { sensitivity: 5 });
    expect(cuts).toEqual([7]);
    expect(threshold).toBeGreaterThan(0.01);
  });

  it("merges adjacent peaks into the strongest one", () => {
    const dists = [...flat];
    dists[5] = 0.5;
    dists[6] = 0.9;
    dists[7] = 0.4;
    const { cuts } = detectCuts(dists, { sensitivity: 5 });
    expect(cuts).toEqual([6]);
  });

  it("reports nothing for constant scenes regardless of sensitivity", () => {
    expect(detectCuts(flat, { sensitivity: 10 }).cuts).toHaveLength(0);
  });

  it("higher sensitivity finds more cuts", () => {
    const dists = [...flat, 0.35, ...flat, 0.12, ...flat, 0.3, ...flat];
    const low = detectCuts(dists, { sensitivity: 3 }).cuts.length;
    const high = detectCuts(dists, { sensitivity: 9 }).cuts.length;
    expect(high).toBeGreaterThanOrEqual(low);
  });

  it("handles empty input", () => {
    expect(detectCuts([], { sensitivity: 5 }).cuts).toEqual([]);
  });
});

describe("formatting helpers", () => {
  it("formats timestamps as M:SS", () => {
    expect(formatTs(0)).toBe("0:00");
    expect(formatTs(65)).toBe("1:05");
    expect(formatTs(600)).toBe("10:00");
  });

  it("builds YouTube chapters starting at 0:00", () => {
    expect(buildChaptersText([12.4, 95])).toBe("0:00 Chapter 1\n0:12 Chapter 2\n1:35 Chapter 3");
  });

  it("builds CSV with index, seconds and timestamp", () => {
    const csv = buildCsv([12.34]);
    expect(csv.split("\n")[0]).toBe("index,start_seconds,timestamp");
    expect(csv).toContain("1,12.34,0:12");
  });
});

describe("cleanup", () => {
  it("is safe to call repeatedly", () => {
    expect(() => {
      cleanup();
      cleanup();
    }).not.toThrow();
  });
});
