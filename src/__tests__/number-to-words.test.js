import { describe, it, expect } from 'vitest';
import { numberToWords } from '../tools/text/number-to-words.js';

describe('number-to-words', () => {
  describe('numberToWords', () => {
    it('converts zero', () => {
      expect(numberToWords(0)).toBe('zero');
    });

    it('converts single digits', () => {
      expect(numberToWords(5)).toBe('five');
      expect(numberToWords(9)).toBe('nine');
    });

    it('converts teens', () => {
      expect(numberToWords(11)).toBe('eleven');
      expect(numberToWords(19)).toBe('nineteen');
    });

    it('converts tens', () => {
      expect(numberToWords(20)).toBe('twenty');
      expect(numberToWords(45)).toBe('forty five');
    });

    it('converts hundreds', () => {
      expect(numberToWords(100)).toBe('one hundred');
      expect(numberToWords(123)).toBe('one hundred twenty three');
    });

    it('converts thousands', () => {
      expect(numberToWords(1000)).toBe('one thousand');
      expect(numberToWords(1234)).toBe('one thousand two hundred thirty four');
    });

    it('converts millions', () => {
      const result = numberToWords(1000000);
      expect(result).toContain('million');
    });

    it('converts billions', () => {
      const result = numberToWords(1000000000);
      expect(result).toContain('billion');
    });

    it('handles negative numbers', () => {
      expect(numberToWords(-42)).toBe('negative forty two');
    });

    it('handles NaN', () => {
      expect(numberToWords(NaN)).toBe('');
    });

    it('handles decimals', () => {
      const result = numberToWords(123.45);
      expect(result).toContain('point');
    });
  });
});
