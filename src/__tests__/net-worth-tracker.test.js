import { describe, it, expect } from 'vitest';
import { calculateNetWorth, formatCurrency, generateId, ASSET_TYPES, LIABILITY_TYPES } from '../tools/finance/net-worth-tracker.js';

describe('net-worth-tracker', () => {
  describe('calculateNetWorth', () => {
    it('calculates net worth with assets and liabilities', () => {
      const entries = [
        { type: 'asset', amount: 100000 },
        { type: 'asset', amount: 50000 },
        { type: 'liability', amount: 30000 },
      ];
      const result = calculateNetWorth(entries);
      expect(result.assets).toBe(150000);
      expect(result.liabilities).toBe(30000);
      expect(result.netWorth).toBe(120000);
    });

    it('handles only assets', () => {
      const entries = [{ type: 'asset', amount: 50000 }];
      const result = calculateNetWorth(entries);
      expect(result.netWorth).toBe(50000);
    });

    it('handles only liabilities', () => {
      const entries = [{ type: 'liability', amount: 20000 }];
      const result = calculateNetWorth(entries);
      expect(result.netWorth).toBe(-20000);
    });

    it('handles empty entries', () => {
      const result = calculateNetWorth([]);
      expect(result).toEqual({ assets: 0, liabilities: 0, netWorth: 0 });
    });

    it('handles zero amounts', () => {
      const entries = [{ type: 'asset', amount: 0 }, { type: 'liability', amount: 0 }];
      const result = calculateNetWorth(entries);
      expect(result.netWorth).toBe(0);
    });
  });

  describe('formatCurrency', () => {
    it('formats positive amount', () => {
      expect(formatCurrency(1000)).toContain('1,000');
    });

    it('formats zero', () => {
      expect(formatCurrency(0)).toContain('0');
    });

    it('formats negative amount', () => {
      expect(formatCurrency(-500)).toContain('500');
    });

    it('formats large amounts', () => {
      expect(formatCurrency(1000000)).toContain('1,000,000');
    });
  });

  describe('generateId', () => {
    it('returns a string', () => {
      expect(typeof generateId()).toBe('string');
    });

    it('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('generates non-empty string', () => {
      expect(generateId().length).toBeGreaterThan(0);
    });
  });

  describe('ASSET_TYPES and LIABILITY_TYPES', () => {
    it('has asset types', () => {
      expect(ASSET_TYPES.length).toBeGreaterThan(0);
    });

    it('has liability types', () => {
      expect(LIABILITY_TYPES.length).toBeGreaterThan(0);
    });

    it('includes Bank Account in asset types', () => {
      expect(ASSET_TYPES).toContain('Bank Account');
    });

    it('includes Mortgage in liability types', () => {
      expect(LIABILITY_TYPES).toContain('Mortgage');
    });
  });
});
