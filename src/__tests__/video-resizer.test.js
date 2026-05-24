import { describe, it, expect } from 'vitest';
import { presets, parseResolution } from '../tools/video/video-resizer.js';

describe('video-resizer', () => {
  describe('presets', () => {
    it('has 7 resolution presets', () => {
      expect(presets).toHaveLength(7);
    });

    it('includes 1080p', () => {
      expect(presets.find(p => p.value === '1920:1080')).toBeTruthy();
    });

    it('includes 4K', () => {
      expect(presets.find(p => p.value === '3840:2160')).toBeTruthy();
    });
  });

  describe('parseResolution', () => {
    it('parses "1920x1080"', () => {
      expect(parseResolution('1920x1080')).toEqual({ width: 1920, height: 1080 });
    });

    it('parses "1280 x 720" with spaces', () => {
      expect(parseResolution('1280 x 720')).toEqual({ width: 1280, height: 720 });
    });

    it('parses "3840:2160" with colon', () => {
      expect(parseResolution('3840:2160')).toEqual({ width: 3840, height: 2160 });
    });

    it('returns null for invalid input', () => {
      expect(parseResolution('abc')).toBeNull();
      expect(parseResolution('')).toBeNull();
      expect(parseResolution('1920x')).toBeNull();
    });
  });
});
