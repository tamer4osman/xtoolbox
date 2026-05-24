import { describe, it, expect } from 'vitest';
import { formatTime } from '../tools/productivity/stopwatch.js';

describe('stopwatch', () => {
  describe('formatTime', () => {
    it('formats zero correctly', () => {
      expect(formatTime(0)).toBe('00:00:00.000');
    });

    it('formats seconds and milliseconds', () => {
      const result = formatTime(1500);
      expect(result).toBe('00:00:01.500');
    });

    it('formats minutes', () => {
      const result = formatTime(75000);
      expect(result).toBe('00:01:15.000');
    });

    it('formats hours', () => {
      const result = formatTime(3661000);
      expect(result).toBe('01:01:01.000');
    });

    it('pads single digit values', () => {
      const result = formatTime(1000);
      expect(result).toBe('00:00:01.000');
    });

    it('handles large values', () => {
      const result = formatTime(90061000);
      expect(result).toBe('25:01:01.000');
    });
  });
});
