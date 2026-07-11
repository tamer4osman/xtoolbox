import { describe, it, expect } from "vitest";
import { toolConfig } from "../tools/audio/normalize-audio.js";

describe("normalize-audio", () => {
  it("has correct tool config", () => {
    expect(toolConfig.id).toBe("normalize-audio");
    expect(toolConfig.name).toBe("Audio Normalizer");
    expect(toolConfig.category).toBe("audio");
    expect(toolConfig.accept).toBe("audio/*");
    expect(toolConfig.maxSizeMB).toBe(100);
  });

  it("has required keywords for both modes", () => {
    expect(toolConfig.keywords).toContain("normalize audio");
    expect(toolConfig.keywords).toContain("loudness");
    expect(toolConfig.keywords).toContain("lufs");
    expect(toolConfig.keywords).toContain("ebu r128");
    expect(toolConfig.keywords).toContain("peak");
    expect(toolConfig.keywords).toContain("podcast");
  });

  it("has steps and faqs", () => {
    expect(toolConfig.steps.length).toBeGreaterThan(0);
    expect(toolConfig.faqs.length).toBeGreaterThan(0);
  });

  it("has faq explaining peak vs loudness", () => {
    const faq = toolConfig.faqs.find(f => f.question.includes("difference"));
    expect(faq).toBeDefined();
    expect(faq.answer).toContain("Peak");
    expect(faq.answer).toContain("Loudness");
  });

  it("has faq with LUFS target guidance", () => {
    const faq = toolConfig.faqs.find(f => f.question.includes("target"));
    expect(faq).toBeDefined();
    expect(faq.answer).toContain("-16");
    expect(faq.answer).toContain("-14");
    expect(faq.answer).toContain("-23");
  });
});
