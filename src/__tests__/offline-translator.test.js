import { describe, it, expect } from 'vitest';
import { estimateTokenCount, LANGUAGES } from '../tools/text/offline-translator.js';

describe('offline-translator', () => {
  describe('estimateTokenCount', () => {
    it('counts single word', () => {
      expect(estimateTokenCount('hello')).toBe(1);
    });

    it('counts multiple words', () => {
      expect(estimateTokenCount('hello world')).toBe(2);
    });

    it('counts words with extra spaces', () => {
      expect(estimateTokenCount('  hello   world  ')).toBe(4);
    });

    it('returns 1 for empty string', () => {
      expect(estimateTokenCount('')).toBe(1);
    });

    it('counts a sentence', () => {
      expect(estimateTokenCount('The quick brown fox jumps')).toBe(5);
    });
  });

  describe('LANGUAGES', () => {
    it('contains English', () => {
      expect(LANGUAGES.some((l) => l.code === 'en' && l.name === 'English')).toBe(true);
    });

    it('has at least 10 languages', () => {
      expect(LANGUAGES.length).toBeGreaterThanOrEqual(10);
    });

    it('each language has code, name, and nllb FLORES-200 code', () => {
      LANGUAGES.forEach((l) => {
        expect(typeof l.code).toBe('string');
        expect(typeof l.name).toBe('string');
        expect(typeof l.nllb).toBe('string');
        expect(l.nllb).toMatch(/^[a-z]{3}_[A-Z][a-z]+$/);
      });
    });
  });
});
