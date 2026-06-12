import { describe, it, expect } from 'vitest';
import { toolConfig, calcStats } from '../tools/fun/typing-speed-test.js';

describe('typing-speed-test', () => {
  describe('toolConfig', () => {
    it('has correct id, name, category', () => {
      expect(toolConfig.id).toBe('typing-speed-test');
      expect(toolConfig.name).toBe('Typing Speed Test');
      expect(toolConfig.category).toBe('fun');
    });
    it('has keywords', () => {
      expect(toolConfig.keywords.length).toBeGreaterThan(2);
    });
  });

  describe('calcStats', () => {
    it('calculates wpm', () => {
      const result = calcStats('hello', 'hello', 60000);
      expect(result.wpm).toBeGreaterThan(0);
    });

    it('calculates accuracy 100%', () => {
      const result = calcStats('hello', 'hello', 60000);
      expect(result.accuracy).toBe(100);
    });

    it('calculates accuracy below 100%', () => {
      const result = calcStats('hellx', 'hello', 60000);
      expect(result.accuracy).toBeLessThan(100);
    });

    it('handles empty input', () => {
      const result = calcStats('', 'hello', 60000);
      expect(result.wpm).toBe(0);
      expect(result.accuracy).toBe(100);
    });

    it('handles zero elapsed', () => {
      const result = calcStats('hello', 'hello', 0);
      expect(result.wpm).toBe(0);
    });
  });
});