import { describe, it, expect } from "vitest";
import {
  calculateHourlyRate,
  calculateMeetingCost,
  formatCurrency,
  formatDuration
} from "../tools/productivity/meeting-cost-calculator.js";

describe("meeting-cost-calculator", () => {
  describe("calculateHourlyRate", () => {
    it("calculates hourly rate with default params", () => {
      expect(calculateHourlyRate(100000)).toBe(50);
    });

    it("calculates with custom hours per week", () => {
      expect(calculateHourlyRate(100000, 30)).toBeCloseTo(66.67, 1);
    });

    it("calculates with custom weeks per year", () => {
      expect(calculateHourlyRate(100000, 40, 48)).toBeCloseTo(52.08, 1);
    });

    it("returns 0 for 0 salary", () => {
      expect(calculateHourlyRate(0)).toBe(0);
    });

    it("handles small salary", () => {
      expect(calculateHourlyRate(2000)).toBe(1);
    });
  });

  describe("calculateMeetingCost", () => {
    it("calculates cost for single participant", () => {
      expect(calculateMeetingCost(50, 60, 1)).toBe(50);
    });

    it("calculates cost for multiple participants", () => {
      expect(calculateMeetingCost(50, 60, 5)).toBe(250);
    });

    it("calculates cost for 30-minute meeting", () => {
      expect(calculateMeetingCost(100, 30, 1)).toBe(50);
    });

    it("returns 0 for 0 duration", () => {
      expect(calculateMeetingCost(50, 0, 5)).toBe(0);
    });
  });

  describe("formatCurrency", () => {
    it("formats with dollar sign", () => {
      expect(formatCurrency(1000)).toContain("1,000");
    });

    it("formats zero", () => {
      expect(formatCurrency(0)).toContain("0.00");
    });

    it("formats decimal amounts", () => {
      expect(formatCurrency(1234.56)).toContain("1,234.56");
    });
  });

  describe("formatDuration", () => {
    it("formats seconds only", () => {
      expect(formatDuration(45)).toBe("45s");
    });

    it("formats minutes and seconds", () => {
      expect(formatDuration(125)).toBe("2m 5s");
    });

    it("formats hours, minutes, and seconds", () => {
      expect(formatDuration(3661)).toBe("1h 1m 1s");
    });

    it("formats zero seconds", () => {
      expect(formatDuration(0)).toBe("0s");
    });

    it("formats exactly one minute", () => {
      expect(formatDuration(60)).toBe("1m 0s");
    });
  });
});
