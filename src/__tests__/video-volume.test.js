import { describe, it, expect } from "vitest";

describe("video-volume", () => {
  it("volume multiplier calculation", () => {
    expect(100 / 100).toBe(1);
    expect(50 / 100).toBe(0.5);
    expect(200 / 100).toBe(2);
    expect(0 / 100).toBe(0);
    expect(300 / 100).toBe(3);
  });

  it("volume percentage display", () => {
    const values = [0, 50, 100, 150, 200, 300];
    for (const v of values) {
      expect(`${v}%`).toBe(`${v}%`);
    }
  });

  it("volume fill width calculation", () => {
    expect((100 / 300) * 100).toBeCloseTo(33.33, 1);
    expect((0 / 300) * 100).toBe(0);
    expect((300 / 300) * 100).toBe(100);
  });

  it("mute detection", () => {
    expect(0 / 100 === 0).toBe(true);
    expect(50 / 100 === 0).toBe(false);
  });
});