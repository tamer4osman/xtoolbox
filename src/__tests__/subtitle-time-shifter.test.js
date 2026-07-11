import { describe, it, expect } from "vitest";
import {
  toolConfig,
  parseTime,
  formatTime,
  shiftSubtitles,
  render,
  destroy
} from "../tools/productivity/subtitle-time-shifter.js";
import { testToolConfig, testRenderAndDestroy } from "./tool-config-test.js";

describe("subtitle-time-shifter", () => {
  testToolConfig(toolConfig, {
    id: "subtitle-time-shifter",
    name: "SRT / VTT Subtitle Sync Shifter",
    category: "productivity"
  });

  it("has icon", () => {
    expect(toolConfig.icon).toBe("⏱️");
  });

  describe("parseTime", () => {
    it("parses SRT time format", () => {
      const ms = parseTime("00:00:01,000", false);
      expect(ms).toBe(1000);
    });

    it("parses VTT time format", () => {
      const ms = parseTime("00:00:01.000", true);
      expect(ms).toBe(1000);
    });

    it("parses complex time", () => {
      const ms = parseTime("01:30:45,500", false);
      expect(ms).toBe(5445500);
    });

    it("returns null for invalid format", () => {
      expect(parseTime("invalid", false)).toBeNull();
      expect(parseTime("00:00:01", false)).toBeNull();
    });
  });

  describe("formatTime", () => {
    it("formats SRT time", () => {
      const time = formatTime(1000, false);
      expect(time).toBe("00:00:01,000");
    });

    it("formats VTT time", () => {
      const time = formatTime(1000, true);
      expect(time).toBe("00:00:01.000");
    });

    it("formats complex time", () => {
      const time = formatTime(5445500, false);
      expect(time).toBe("01:30:45,500");
    });

    it("handles zero", () => {
      const time = formatTime(0, false);
      expect(time).toBe("00:00:00,000");
    });

    it("handles negative by clamping to zero", () => {
      const time = formatTime(-1000, false);
      expect(time).toBe("00:00:00,000");
    });
  });

  describe("shiftSubtitles", () => {
    it("shifts SRT subtitles forward", () => {
      const srt = `1
00:00:01,000 --> 00:00:04,000
Hello world

2
00:00:05,000 --> 00:00:08,000
Second subtitle`;
      const shifted = shiftSubtitles(srt, 1000, false);
      expect(shifted).toContain("00:00:02,000 --> 00:00:05,000");
      expect(shifted).toContain("00:00:06,000 --> 00:00:09,000");
      expect(shifted).toContain("Hello world");
      expect(shifted).toContain("Second subtitle");
    });

    it("shifts SRT subtitles backward", () => {
      const srt = `1
00:00:02,000 --> 00:00:05,000
Hello`;
      const shifted = shiftSubtitles(srt, -1000, false);
      expect(shifted).toContain("00:00:01,000 --> 00:00:04,000");
    });

    it("shifts VTT subtitles", () => {
      const vtt = `WEBVTT

00:00:01.000 --> 00:00:04.000
Hello`;
      const shifted = shiftSubtitles(vtt, 500, true);
      expect(shifted).toContain("WEBVTT");
      expect(shifted).toContain("00:00:01.500 --> 00:00:04.500");
    });

    it("preserves subtitle text", () => {
      const srt = `1
00:00:01,000 --> 00:00:04,000
Line 1
Line 2`;
      const shifted = shiftSubtitles(srt, 100, false);
      expect(shifted).toContain("Line 1");
      expect(shifted).toContain("Line 2");
    });
  });

  testRenderAndDestroy(render, destroy, [
    ".tool-layout",
    "#sts-file",
    "#sts-offset-slider",
    "#sts-offset-input",
    "#sts-preview",
    "#sts-output",
    "#sts-copy",
    "#sts-download",
    "#sts-info"
  ]);
});
