import { describe, it, expect } from 'vitest';
import { toolConfig, calculate } from '../tools/math/scientific-calculator.js';

describe('scientific-calculator', () => {
  describe('toolConfig', () => {
    it('has correct id, name, category', () => {
      expect(toolConfig.id).toBe('scientific-calculator');
      expect(toolConfig.name).toBe('Scientific Calculator');
      expect(toolConfig.category).toBe('math');
    });
  });

  describe('calculate', () => {
    it('sqrt returns square root', () => {
      expect(calculate('9', 'sqrt')).toBe(3);
      expect(calculate('16', 'sqrt')).toBe(4);
    });

    it('pow returns square', () => {
      expect(calculate('5', 'pow')).toBe(25);
    });

    it('cube returns cube', () => {
      expect(calculate('3', 'cube')).toBe(27);
    });

    it('cubert returns cube root', () => {
      expect(calculate('27', 'cubert')).toBe(3);
    });

    it('factorial returns factorial', () => {
      expect(calculate('5', 'factorial')).toBe(120);
      expect(calculate('0', 'factorial')).toBe(1);
    });

    it('sin/cos/tan work in degrees', () => {
      expect(calculate('90', 'sin')).toBeCloseTo(1, 5);
      expect(calculate('0', 'cos')).toBeCloseTo(1, 5);
      expect(calculate('45', 'tan')).toBeCloseTo(1, 5);
    });

    it('asin/acos/atan return degrees', () => {
      expect(calculate('1', 'asin')).toBeCloseTo(90, 5);
    });

    it('log returns base-10 log', () => {
      expect(calculate('100', 'log')).toBe(2);
    });

    it('ln returns natural log', () => {
      expect(calculate('2.718281828', 'ln')).toBeCloseTo(1, 3);
    });

    it('exp returns e^x', () => {
      expect(calculate('1', 'exp')).toBeCloseTo(Math.E, 5);
    });

    it('tenpow returns 10^x', () => {
      expect(calculate('2', 'tenpow')).toBe(100);
    });

    it('inv returns reciprocal', () => {
      expect(calculate('2', 'inv')).toBe(0.5);
    });

    it('abs returns absolute value', () => {
      expect(calculate('-5', 'abs')).toBe(5);
    });

    it('returns null for unknown operation', () => {
      expect(calculate('1', 'unknown')).toBeNull();
    });
  });
});