import { describe, it, expect } from "vitest";
import { toolConfig } from "../tools/video/video-rotate.js";

describe("video-rotate", () => {
  describe("toolConfig", () => {
    it("has correct id", () => {
      expect(toolConfig.id).toBe("video-rotate");
    });

    it("has correct category", () => {
      expect(toolConfig.category).toBe("video");
    });

    it("accepts video files", () => {
      expect(toolConfig.accept).toBe("video/*");
    });

    it("has reasonable max size", () => {
      expect(toolConfig.maxSizeMB).toBe(500);
    });

    it("has descriptive name", () => {
      expect(toolConfig.name).toBe("Video Rotator");
    });

    it("has keywords", () => {
      expect(toolConfig.keywords.length).toBeGreaterThan(0);
      expect(toolConfig.keywords.some(k => k.includes("rotat"))).toBe(true);
    });

    it("has steps", () => {
      expect(toolConfig.steps.length).toBeGreaterThan(0);
    });

    it("has FAQs", () => {
      expect(toolConfig.faqs.length).toBeGreaterThan(0);
      toolConfig.faqs.forEach(faq => {
        expect(faq.question).toBeTruthy();
        expect(faq.answer).toBeTruthy();
      });
    });
  });
});
