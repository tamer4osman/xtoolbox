import { describe, it, expect } from "vitest";
import { formatDuration } from "../tools/video/screen-recorder.js";

describe("screen-recorder", () => {
  describe("formatDuration", () => {
    it("formats zero milliseconds", () => {
      expect(formatDuration(0)).toBe("00:00:00");
    });

    it("formats seconds only", () => {
      expect(formatDuration(5000)).toBe("00:00:05");
    });

    it("formats minutes and seconds", () => {
      expect(formatDuration(125000)).toBe("00:02:05");
    });

    it("formats hours, minutes, and seconds", () => {
      expect(formatDuration(3661000)).toBe("01:01:01");
    });

    it("formats exactly one minute", () => {
      expect(formatDuration(60000)).toBe("00:01:00");
    });

    it("formats exactly one hour", () => {
      expect(formatDuration(3600000)).toBe("01:00:00");
    });

    it("pads single-digit minutes", () => {
      expect(formatDuration(65000)).toBe("00:01:05");
    });
  });
});
