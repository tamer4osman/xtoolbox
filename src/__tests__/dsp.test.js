import { describe, it, expect } from "vitest";
import {
  hannWindow,
  fft,
  ifft,
  magSpectrum,
  stft,
  istft,
  phaseVocoder,
  resampleLinear,
  pitchShift
} from "../tools/audio/dsp.js";

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

describe("dsp", () => {
  describe("hannWindow", () => {
    it("returns a window of the requested length", () => {
      const w = hannWindow(256);
      expect(w).toHaveLength(256);
      expect(w[0]).toBeCloseTo(0, 5);
      expect(Math.max(...w)).toBeCloseTo(1, 3);
    });
  });

  describe("fft/ifft round-trip", () => {
    it("recovers a signal after forward and inverse transform", () => {
      const n = 256;
      const input = new Float32Array(n);
      for (let i = 0; i < n; i++) input[i] = Math.sin((2 * Math.PI * 8 * i) / n);
      const re = Float32Array.from(input);
      const im = new Float32Array(n);
      fft(re, im);
      ifft(re, im);
      for (let i = 0; i < n; i++) expect(re[i]).toBeCloseTo(input[i], 4);
    });

    it("concentrates energy in a single bin for a pure tone", () => {
      const n = 256;
      const re = new Float32Array(n);
      const im = new Float32Array(n);
      for (let i = 0; i < n; i++) re[i] = Math.cos((2 * Math.PI * 4 * i) / n);
      fft(re, im);
      const mag = magSpectrum(re, im);
      const peak = mag.indexOf(Math.max(...mag));
      expect(peak).toBe(4);
    });
  });

  describe("stft/istft round-trip", () => {
    it("reconstructs a tone with small error", () => {
      const signal = tone(220, 1);
      const { mags, phases } = stft(signal);
      const out = istft(mags, phases, signal.length);

      const start = Math.floor(SAMPLE_RATE * 0.3);
      const end = Math.floor(SAMPLE_RATE * 0.6);
      let sumSq = 0;
      let errSq = 0;
      for (let i = start; i < end; i++) {
        sumSq += signal[i] * signal[i];
        errSq += (out[i] - signal[i]) * (out[i] - signal[i]);
      }
      const eps = Math.sqrt(errSq / (end - start));
      const rms = Math.sqrt(sumSq / (end - start));
      expect(eps / rms).toBeLessThan(0.1);
    });
  });

  describe("phaseVocoder", () => {
    it("stretches the signal longer than its source", () => {
      const signal = tone(440, 0.6);
      const { mags, phases } = stft(signal);
      const stretched = phaseVocoder(mags, phases, 2);
      expect(stretched.length).toBeGreaterThan(signal.length);
    });
  });

  describe("resampleLinear", () => {
    it("honors the requested output length", () => {
      const src = new Float32Array([0, 1, 0, 1]);
      expect(resampleLinear(src, 8)).toHaveLength(8);
    });
  });

  describe("pitchShift", () => {
    it("returns a copy with the same length for zero semitones", () => {
      const signal = new Float32Array([0, 0.5, 1, 0.5, 0]);
      const out = pitchShift(signal, 0);
      expect(out).toHaveLength(signal.length);
      for (let i = 0; i < signal.length; i++) expect(out[i]).toBe(signal[i]);
    });

    it("preserves duration for non-zero shifts", () => {
      const signal = tone(300, 0.6);
      const out = pitchShift(signal, 12);
      expect(out).toHaveLength(signal.length);
    });

    it("raises the dominant frequency when shifting up", () => {
      const signal = tone(300, 0.6);
      const up = pitchShift(signal, 12);
      expect(dominantPeak(up)).toBeGreaterThan(300 * 1.6);
    });

    it("lowers the dominant frequency when shifting down", () => {
      const signal = tone(300, 0.6);
      const down = pitchShift(signal, -12);
      expect(dominantPeak(down)).toBeLessThan(300 * 0.6);
    });
  });
});
