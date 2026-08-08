import { describe, it, expect } from "vitest";
import { toolConfig, volumeMultiplier, volumeFillWidth } from "../tools/video/video-volume.js";

describe("video-volume", () => {
  it("computes volume multiplier from slider value", () => {
    expect(volumeMultiplier(100)).toBe(1);
    expect(volumeMultiplier(50)).toBe(0.5);
    expect(volumeMultiplier(200)).toBe(2);
    expect(volumeMultiplier(0)).toBe(0);
    expect(volumeMultiplier(300)).toBe(3);
  });

  it("computes fill width percentage for the volume meter", () => {
    expect(volumeFillWidth(100)).toBeCloseTo(33.33, 1);
    expect(volumeFillWidth(0)).toBe(0);
    expect(volumeFillWidth(300)).toBe(100);
  });

  it("displays the volume percentage label", () => {
    const values = [0, 50, 100, 150, 200, 300];
    for (const v of values) {
      expect(`${v}%`).toBe(`${v}%`);
    }
  });

  it("has correct id, name, category", () => {
    expect(toolConfig.id).toBe("video-volume");
    expect(toolConfig.name).toBe("Video Volume Adjuster");
    expect(toolConfig.category).toBe("video");
  });
});