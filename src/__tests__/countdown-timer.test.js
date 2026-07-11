import { describe, it, expect } from "vitest";
import { calcTimeRemaining } from "../tools/productivity/countdown-timer.js";

describe("countdown-timer", () => {
  describe("calcTimeRemaining", () => {
    it("returns expired for past date", () => {
      const result = calcTimeRemaining(Date.now() - 1000);
      expect(result.expired).toBe(true);
      expect(result.days).toBe(0);
    });

    it("computes remaining time correctly", () => {
      const future = Date.now() + 90061000; // 1d 1h 1m 1s approx
      const result = calcTimeRemaining(future);
      expect(result.days).toBeGreaterThanOrEqual(1);
      expect(result.hours).toBeGreaterThanOrEqual(0);
      expect(result.minutes).toBeGreaterThanOrEqual(0);
      expect(result.seconds).toBeGreaterThanOrEqual(0);
      expect(result.expired).toBe(false);
    });

    it("handles exact 1 hour", () => {
      const future = Date.now() + 3600000;
      const result = calcTimeRemaining(future);
      expect(result.hours).toBe(1);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
    });
  });
});
