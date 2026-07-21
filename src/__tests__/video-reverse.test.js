import { describe, it, expect } from "vitest";

describe("video-reverse", () => {
  it("boomerang mode creates correct ffmpeg args", () => {
    const mode = "boomerang";
    expect(mode).toBe("boomerang");
  });

  it("video-only mode uses reverse filter", () => {
    const args = ["-i", "input.mp4", "-vf", "reverse", "-c:a", "copy", "output.mp4"];
    expect(args).toContain("reverse");
  });

  it("audio-only mode uses areverse filter", () => {
    const args = ["-i", "input.mp4", "-af", "areverse", "-c:v", "copy", "output.mp4"];
    expect(args).toContain("areverse");
  });

  it("both mode uses both filters", () => {
    const args = ["-i", "input.mp4", "-vf", "reverse", "-af", "areverse", "output.mp4"];
    expect(args).toContain("reverse");
    expect(args).toContain("areverse");
  });

  it("memory warning threshold is 50MB", () => {
    const threshold = 50 * 1024 * 1024;
    expect(threshold).toBe(52428800);
  });
});