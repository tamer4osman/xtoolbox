import { describe, it, expect } from "vitest";
import {
  hannWindow,
  fft,
  ifft,
  magSpectrum,
  estimateNoiseProfile,
  autoDetectNoiseFrames,
  spectralSubtraction,
  wienerFilter,
  stft,
  istft,
  encodeWav,
  computeMetrics
} from "../tools/audio/noise-remover.js";

describe("noise-remover", () => {
  describe("hannWindow", () => {
    it("returns correct length", () => {
      const w = hannWindow(256);
      expect(w.length).toBe(256);
    });

    it("starts and ends near zero", () => {
      const w = hannWindow(256);
      expect(w[0]).toBeCloseTo(0, 5);
      expect(w[255]).toBeCloseTo(0, 5);
    });

    it("peaks at 1.0 in the middle", () => {
      const w = hannWindow(256);
      expect(w[128]).toBeCloseTo(1.0, 3);
    });
  });

  describe("fft / ifft", () => {
    it("round-trips correctly", () => {
      const n = 64;
      const re = new Float32Array(n);
      const im = new Float32Array(n);
      for (let i = 0; i < n; i++) re[i] = Math.sin((2 * Math.PI * i) / n);
      const origRe = new Float32Array(re);
      const origIm = new Float32Array(im);
      fft(re, im);
      ifft(re, im);
      for (let i = 0; i < n; i++) {
        expect(re[i]).toBeCloseTo(origRe[i], 3);
        expect(im[i]).toBeCloseTo(origIm[i], 3);
      }
    });

    it("computes correct DFT for simple signal", () => {
      const n = 8;
      const re = new Float32Array(n);
      const im = new Float32Array(n);
      re[0] = 1;
      re[1] = 1;
      fft(re, im);
      expect(re[0]).toBeCloseTo(2, 4);
      expect(im[0]).toBeCloseTo(0, 4);
      expect(re[1]).toBeCloseTo(1.707, 2);
      expect(im[1]).toBeCloseTo(-0.707, 2);
    });
  });

  describe("magSpectrum", () => {
    it("returns half-length magnitudes", () => {
      const re = new Float32Array([3, 4, 0, 0]);
      const im = new Float32Array([0, 0, 0, 0]);
      fft(re, im);
      const m = magSpectrum(re, im);
      expect(m.length).toBe(2);
      expect(m[0]).toBeCloseTo(7, 4);
      expect(m[1]).toBeCloseTo(5, 4);
    });
  });

  describe("estimateNoiseProfile", () => {
    it("averages first N frames", () => {
      const mags = [new Float32Array([1, 2, 3]), new Float32Array([2, 4, 6])];
      const profile = estimateNoiseProfile(mags, 2);
      expect(profile[0]).toBeCloseTo(1.5, 4);
      expect(profile[1]).toBeCloseTo(3, 4);
      expect(profile[2]).toBeCloseTo(4.5, 4);
    });
  });

  describe("autoDetectNoiseFrames", () => {
    it("returns at least 4", () => {
      const mags = [new Float32Array([1])];
      expect(autoDetectNoiseFrames(mags)).toBeGreaterThanOrEqual(4);
    });
  });

  describe("spectralSubtraction", () => {
    it("reduces magnitude where noise is present", () => {
      const mags = [new Float32Array([0.5, 1.0, 0.3])];
      const phases = [new Float32Array([0, 0, 0])];
      const noise = new Float32Array([0.4, 0.8, 0.2]);
      const result = spectralSubtraction(mags, phases, noise, 2, 0.01);
      expect(result[0][0]).toBeLessThan(mags[0][0]);
      expect(result[0][1]).toBeLessThan(mags[0][1]);
    });
  });

  describe("wienerFilter", () => {
    it("reduces magnitude in noisy bins", () => {
      const mags = [new Float32Array([0.5, 1.0, 0.3])];
      const noise = new Float32Array([0.4, 0.8, 0.2]);
      const result = wienerFilter(mags, noise, 0.98);
      expect(result[0][0]).toBeLessThanOrEqual(mags[0][0]);
      expect(result[0][1]).toBeLessThanOrEqual(mags[0][1]);
    });
  });

  describe("stft / istft", () => {
    it("round-trips a simple signal", () => {
      const signal = new Float32Array(4096);
      for (let i = 0; i < signal.length; i++) signal[i] = Math.sin((2 * Math.PI * 440 * i) / 44100);
      const { mags, phases, nFrames } = stft(signal);
      expect(mags.length).toBe(nFrames);
      expect(mags[0].length).toBe(1024);
      const reconstructed = istft(mags, phases, signal.length);
      expect(reconstructed.length).toBe(signal.length);
      let correlation = 0,
        energy = 0;
      for (let i = 0; i < signal.length; i++) {
        correlation += signal[i] * reconstructed[i];
        energy += reconstructed[i] * reconstructed[i];
      }
      expect(correlation / Math.sqrt(energy * energy + 1e-10)).toBeGreaterThan(0.9);
    });
  });

  describe("encodeWav", () => {
    it("produces valid WAV header", () => {
      const blob = encodeWav(new Float32Array([0, 0.5, -0.5, 0]), 44100);
      expect(blob.type).toBe("audio/wav");
      expect(blob.size).toBe(44 + 4 * 2);
    });
  });

  describe("computeMetrics", () => {
    it("returns positive NRR for noisy-to-clean", () => {
      const original = new Float32Array([0.1, 0.2, 0.3, 0.4]);
      const processed = new Float32Array([0.08, 0.18, 0.28, 0.38]);
      const m = computeMetrics(original, processed);
      expect(m.nrr).toBeGreaterThanOrEqual(0);
      expect(m.speechPreserved).toBeGreaterThan(80);
    });
  });
});
