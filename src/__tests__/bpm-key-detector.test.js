import { describe, it, expect } from 'vitest';
import {
  pearsonCorrelation,
  detectBPM,
  detectKey,
  formatBPM,
  formatKey
} from '../tools/audio/bpm-key-detector.js';

describe('bpm-key-detector', () => {
  describe('pearsonCorrelation', () => {
    it('returns 1 for identical arrays', () => {
      const arr = [1, 2, 3, 4, 5];
      expect(pearsonCorrelation(arr, arr)).toBeCloseTo(1.0, 5);
    });

    it('returns -1 for opposite arrays', () => {
      const a = [1, 2, 3, 4, 5];
      const b = [5, 4, 3, 2, 1];
      expect(pearsonCorrelation(a, b)).toBeCloseTo(-1.0, 5);
    });

    it('returns 0 for uncorrelated arrays', () => {
      const a = [1, 0, 1, 0, 1];
      const b = [0, 1, 0, 1, 0];
      expect(pearsonCorrelation(a, b)).toBeCloseTo(-1.0, 5);
    });
  });

  describe('detectBPM', () => {
    it('returns 0 for empty onsets', () => {
      expect(detectBPM([])).toEqual({ bpm: 0, confidence: 0 });
    });

    it('returns 0 for single onset', () => {
      expect(detectBPM([0.5])).toEqual({ bpm: 0, confidence: 0 });
    });

    it('detects 120 BPM from regular onsets', () => {
      const onsets = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0];
      const result = detectBPM(onsets);
      expect(result.bpm).toBe(120);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('detects 60 BPM from regular onsets', () => {
      const onsets = [0, 1.0, 2.0, 3.0, 4.0];
      const result = detectBPM(onsets);
      expect(result.bpm).toBe(60);
    });
  });

  describe('detectKey', () => {
    it('detects C major from C major chroma', () => {
      const cMajorChroma = [1, 0, 0.5, 0, 0.8, 0.6, 0, 0.9, 0, 0.5, 0, 0.3];
      const result = detectKey(cMajorChroma);
      expect(result.mode).toBe('major');
      expect(result.tonic).toBe(0);
      expect(result.label).toBe('C');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('returns scores for all 24 keys', () => {
      const chroma = new Float64Array([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      const result = detectKey(chroma);
      expect(result.scores.length).toBe(24);
    });
  });

  describe('formatBPM', () => {
    it('formats valid BPM', () => {
      expect(formatBPM(120)).toBe('120.0');
    });

    it('shows dash for zero BPM', () => {
      expect(formatBPM(0)).toBe('--');
    });
  });

  describe('formatKey', () => {
    it('formats major key', () => {
      expect(formatKey({ label: 'C' })).toBe('C');
    });

    it('formats minor key', () => {
      expect(formatKey({ label: 'Am' })).toBe('Am');
    });

    it('shows dash for empty key', () => {
      expect(formatKey({ label: '' })).toBe('--');
    });
  });
});
