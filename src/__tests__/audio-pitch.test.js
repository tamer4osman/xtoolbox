import { describe, it, expect } from "vitest";
import {
  toolConfig,
  NOTE_NAMES,
  PRESET_SEMITONES,
  shiftSamples
} from "../tools/audio/audio-pitch.js";
import { fft } from "../tools/audio/dsp.js";

const SAMPLE_RATE = 8000;

function tone(frequency, seconds) {
  const n = Math.floor(SAMPLE_RATE * seconds);
  const signal = new Float32Array(n);
  for (let i = 0; i < n; i++)
    signal[i] = 0.6 * Math.sin((2 * Math.PI * frequency * i) / SAMPLE_RATE);
  return signal;
}

function dominantPeak(samples) {
  const fftSize = 2048;
  const n = Math.min(fftSize, samples.length);
  const re = new Float64Array(fftSize);
  const im = new Float64Array(fftSize);
  for (let i = 0; i < n; i++) re[i] = samples[i];
  fft(re, im);
  const half = fftSize >> 1;
  let peak = 0;
  let peakIdx = 0;
  for (let b = 1; b < half; b++) {
    const m = re[b] * re[b] + im[b] * im[b];
    if (m > peak) {
      peak = m;
      peakIdx = b;
    }
  }
  return (peakIdx * SAMPLE_RATE) / fftSize;
}

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
