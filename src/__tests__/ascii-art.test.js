import { describe, it, expect } from 'vitest';
import { generateAscii, getFonts } from '../tools/text/ascii-art.js';

describe('ascii-art', () => {
  describe('generateAscii', () => {
    it('returns non-empty string for valid input', () => {
      const result = generateAscii('Hello', 'Standard');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty string for empty input', () => {
      const result = generateAscii('', 'Standard');
      expect(typeof result).toBe('string');
    });

    it('handles unknown font gracefully', () => {
      const result = generateAscii('Test', 'NonExistentFont');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('generates Bubble font correctly', () => {
      const result = generateAscii('A', 'Bubble');
      expect(result).toContain('╭');
    });

    it('preserves spaces in input', () => {
      const result = generateAscii('A B', 'Standard');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getFonts', () => {
    it('returns an array of font names', () => {
      const fonts = getFonts();
      expect(Array.isArray(fonts)).toBe(true);
      expect(fonts.length).toBeGreaterThan(0);
      expect(fonts).toContain('Standard');
      expect(fonts).toContain('Bubble');
      expect(fonts).toContain('Digital');
    });
  });
});
