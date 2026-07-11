import { describe, it, expect, vi } from "vitest";

vi.mock("../components/file-upload.js", () => ({ createFileUpload: vi.fn() }));
vi.mock("../components/toast.js", () => ({ showToast: vi.fn() }));
vi.mock("../utils/file.js", () => ({ downloadBlob: vi.fn() }));

import {
  formatTime,
  formatTranscript,
  createSpeechRecognizer
} from "../tools/video/video-transcriber.js";

describe("video-transcriber", () => {
  describe("formatTime", () => {
    it("formats zero seconds", () => {
      expect(formatTime(0)).toBe("00:00");
    });

    it("formats seconds under a minute", () => {
      expect(formatTime(45)).toBe("00:45");
    });

    it("formats exactly one minute", () => {
      expect(formatTime(60)).toBe("01:00");
    });

    it("formats minutes and seconds", () => {
      expect(formatTime(125)).toBe("02:05");
    });

    it("pads single-digit minutes and seconds", () => {
      expect(formatTime(61)).toBe("01:01");
    });

    it("formats large values", () => {
      expect(formatTime(3661)).toBe("61:01");
    });
  });

  describe("formatTranscript", () => {
    it("formats a single segment", () => {
      const segments = [{ start: 0, text: "Hello world" }];
      expect(formatTranscript(segments)).toBe("[00:00] Hello world");
    });

    it("formats multiple segments with newlines", () => {
      const segments = [
        { start: 0, text: "First" },
        { start: 3, text: "Second" }
      ];
      expect(formatTranscript(segments)).toBe("[00:00] First\n[00:03] Second");
    });

    it("formats segments with timestamps", () => {
      const segments = [{ start: 90, text: "Test" }];
      expect(formatTranscript(segments)).toBe("[01:30] Test");
    });

    it("returns empty string for empty segments", () => {
      expect(formatTranscript([])).toBe("");
    });
  });

  describe("createSpeechRecognizer", () => {
    it("returns null when SpeechRecognition is not available", () => {
      delete window.SpeechRecognition;
      delete window.webkitSpeechRecognition;
      expect(createSpeechRecognizer()).toBeNull();
    });

    it("creates recognizer with default lang", () => {
      class MockRecognition {
        constructor() {
          this.continuous = false;
          this.interimResults = false;
          this.lang = "";
        }
      }
      window.SpeechRecognition = MockRecognition;
      const rec = createSpeechRecognizer();
      expect(rec).toBeTruthy();
      expect(rec.continuous).toBe(true);
      expect(rec.interimResults).toBe(false);
      expect(rec.lang).toBe("en-US");
      delete window.SpeechRecognition;
    });

    it("creates recognizer with custom lang", () => {
      class MockRecognition {
        constructor() {
          this.continuous = false;
          this.interimResults = false;
          this.lang = "";
        }
      }
      window.SpeechRecognition = MockRecognition;
      const rec = createSpeechRecognizer("es-ES");
      expect(rec.lang).toBe("es-ES");
      delete window.SpeechRecognition;
    });
  });
});
