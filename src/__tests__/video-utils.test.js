import { describe, it, expect } from 'vitest';
import { formatTime } from '../tools/video/video-utils.js';

describe('video-utils', () => {
  describe('formatTime', () => {
    it('formats seconds to MM:SS', () => {
      expect(formatTime(0)).toBe('0:00');
      expect(formatTime(30)).toBe('0:30');
      expect(formatTime(90)).toBe('1:30');
      expect(formatTime(3600)).toBe('1:00:00');
      expect(formatTime(3661)).toBe('1:01:01');
    });
  });
});
