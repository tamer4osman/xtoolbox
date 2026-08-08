import { describe, it, expect } from "vitest";
import { tone, dominantPeak } from "./helpers/dsp-utils.js";
import {
  toolConfig,
  NOTE_NAMES,
  PRESET_SEMITONES,
  shiftSamples
} from "../tools/audio/audio-pitch.js";

describe("audio-pitch", () => {
  it("has correct tool config", () => {
    expect(toolConfig.id).toBe("audio-pitch");
    expect(toolConfig.name).toBe("Pitch Shifter");
    expect(toolConfig.category).toBe("audio");
    expect(toolConfig.accept).toBe("audio/*");
    expect(toolConfig.maxSizeMB).toBe(100);
  });

  it("has required keywords", () => {
    expect(toolConfig.keywords).toContain("pitch shift");
    expect(toolConfig.keywords).toContain("semitone");
  });

  it("has steps and faqs", () => {
    expect(toolConfig.steps.length).toBeGreaterThan(0);
    expect(toolConfig.faqs.length).toBeGreaterThan(0);
  });

  it("NOTE_NAMES orders C..B in semitone increments", () => {
    expect(NOTE_NAMES[0]).toBe("C");
    expect(NOTE_NAMES[1]).toBe("C#");
    expect(NOTE_NAMES[4]).toBe("E");
    expect(NOTE_NAMES[11]).toBe("B");
    expect(NOTE_NAMES).toHaveLength(12);
  });

  it("PRESET_SEMITONES are integers within the octave range and include 0", () => {
    expect(PRESET_SEMITONES.length).toBeGreaterThan(0);
    PRESET_SEMITONES.forEach(s => {
      expect(Number.isInteger(s)).toBe(true);
      expect(s).toBeGreaterThanOrEqual(-12);
      expect(s).toBeLessThanOrEqual(12);
    });
    expect(PRESET_SEMITONES).toContain(0);
  });

  it("shiftSamples preserves duration (length unchanged)", () => {
    const signal = tone(300, 0.5);
    const out = shiftSamples(signal, 7);
    expect(out).toHaveLength(signal.length);
  });

  it("shiftSamples with 0 semitones is a no-op", () => {
    const signal = new Float32Array([0, 0.5, 1, 0.5, 0]);
    const out = shiftSamples(signal, 0);
    expect(out).toHaveLength(signal.length);
    for (let i = 0; i < signal.length; i++) expect(out[i]).toBe(signal[i]);
  });

  it("shiftSamples raises the dominant frequency when shifting up", () => {
    const signal = tone(300, 0.6);
    const out = shiftSamples(signal, 12);
    expect(dominantPeak(out)).toBeGreaterThan(300 * 1.6);
  });

  it("shiftSamples lowers the dominant frequency when shifting down", () => {
    const signal = tone(300, 0.6);
    const out = shiftSamples(signal, -12);
    expect(dominantPeak(out)).toBeLessThan(300 * 0.6);
  });
});
