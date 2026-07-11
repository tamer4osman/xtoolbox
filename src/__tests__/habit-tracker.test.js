import { describe, it, expect } from "vitest";
import { calculateStreak } from "../tools/productivity/habit-tracker.js";

describe("habit-tracker", () => {
  it("should calculate streak correctly", () => {
    expect(calculateStreak([])).toBe(0);
    expect(calculateStreak(["2024-01-01"])).toBe(0);
  });
});
