import { describe, it, expect } from 'vitest';
import { isWeekend, isHoliday, countWorkingDays, HOLIDAYS } from '../tools/productivity/working-days-calculator.js';

describe('working-days-calculator', () => {
  describe('isWeekend', () => {
    it('returns true for Sunday', () => {
      expect(isWeekend(new Date('2024-01-07'))).toBe(true);
    });

    it('returns true for Saturday', () => {
      expect(isWeekend(new Date('2024-01-06'))).toBe(true);
    });

    it('returns false for Monday', () => {
      expect(isWeekend(new Date('2024-01-08'))).toBe(false);
    });

    it('returns false for Friday', () => {
      expect(isWeekend(new Date('2024-01-05'))).toBe(false);
    });

    it('returns false for Wednesday', () => {
      expect(isWeekend(new Date('2024-01-03'))).toBe(false);
    });
  });

  describe('isHoliday', () => {
    it('returns true for US New Year', () => {
      expect(isHoliday(new Date('2024-01-01'), 'US')).toBe(true);
    });

    it('returns false for non-holiday', () => {
      expect(isHoliday(new Date('2024-01-02'), 'US')).toBe(false);
    });

    it('returns false for unknown country', () => {
      expect(isHoliday(new Date('2024-01-01'), 'XX')).toBe(false);
    });

    it('returns true for US July 4th', () => {
      expect(isHoliday(new Date('2024-07-04'), 'US')).toBe(true);
    });

    it('returns true for UK New Year', () => {
      expect(isHoliday(new Date('2024-01-01'), 'UK')).toBe(true);
    });
  });

  describe('countWorkingDays', () => {
    it('counts a single working day', () => {
      const start = new Date('2024-01-01'); // Monday (but US holiday)
      const end = new Date('2024-01-01');
      expect(countWorkingDays(start, end, 'US')).toBe(0);
    });

    it('excludes weekends', () => {
      const start = new Date('2024-01-08'); // Monday
      const end = new Date('2024-01-12'); // Friday
      expect(countWorkingDays(start, end, 'US')).toBe(5);
    });

    it('excludes weekends and counts correct days', () => {
      const start = new Date('2024-01-05'); // Friday
      const end = new Date('2024-01-08'); // Monday
      expect(countWorkingDays(start, end, 'US')).toBe(2);
    });

    it('returns 0 for weekend-only range', () => {
      const start = new Date('2024-01-06'); // Saturday
      const end = new Date('2024-01-07'); // Sunday
      expect(countWorkingDays(start, end, 'US')).toBe(0);
    });

    it('accounts for US holidays', () => {
      const start = new Date('2024-01-01'); // Monday (New Year)
      const end = new Date('2024-01-05'); // Friday
      // Mon=Holiday, Tue-Fri=4 working days
      expect(countWorkingDays(start, end, 'US')).toBe(4);
    });

    it('counts holidays across year boundary', () => {
      const start = new Date('2024-12-30'); // Monday
      const end = new Date('2025-01-03'); // Friday
      // Dec 30 Mon, Dec 31 Tue, Jan 1 Wed (holiday), Jan 2 Thu, Jan 3 Fri
      expect(countWorkingDays(start, end, 'US')).toBe(4);
    });
  });

  describe('HOLIDAYS', () => {
    it('has US holidays', () => {
      expect(HOLIDAYS.US).toBeDefined();
      expect(HOLIDAYS.US.length).toBeGreaterThan(0);
    });

    it('has UK holidays', () => {
      expect(HOLIDAYS.UK).toBeDefined();
    });

    it('has DE holidays', () => {
      expect(HOLIDAYS.DE).toBeDefined();
    });
  });
});
