import { describe, it, expect } from 'vitest';
import { calcStats } from '../tools/fun/typing-speed-test.js';

describe('typing-speed-test', () => {
  describe('calcStats', () => {
    it('returns 0 WPM for no input', () => {
      const stats = calcStats('', 'hello world', 0);
      expect(stats.wpm).toBe(0);
      expect(stats.accuracy).toBe(100);
      expect(stats.charsTyped).toBe(0);
    });

    it('calculates perfect accuracy', () => {
      const stats = calcStats('hello', 'hello world', 60000);
      expect(stats.wpm).toBeGreaterThan(0);
      expect(stats.accuracy).toBe(100);
      expect(stats.charsCorrect).toBe(5);
    });

    it('calculates partial accuracy', () => {
      const stats = calcStats('hxllo', 'hello world', 60000);
      expect(stats.accuracy).toBe(80);
      expect(stats.charsCorrect).toBe(4);
      expect(stats.charsTyped).toBe(5);
    });

    it('handles longer input than target', () => {
      const stats = calcStats('hello world!!', 'hello world', 120000);
      expect(stats.charsTyped).toBe(13);
      expect(stats.charsCorrect).toBe(11);
    });

    it('returns seconds from elapsed', () => {
      const stats = calcStats('abc', 'abcdef', 5000);
      expect(stats.seconds).toBe(5);
    });
  });
});
