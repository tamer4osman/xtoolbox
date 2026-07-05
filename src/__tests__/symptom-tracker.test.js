import { describe, it, expect } from 'vitest';
import { generateId, formatDate, toLocalDatetimeInput, escapeHtml, BODY_PARTS, SEVERITY_LEVELS } from '../tools/health/symptom-tracker.js';

describe('symptom-tracker', () => {
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

  describe('formatDate', () => {
    it('formats a date string', () => {
      const result = formatDate('2024-06-15T10:30:00');
      expect(result).toContain('Jun');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('formats ISO date', () => {
      const result = formatDate('2024-01-01T00:00:00');
      expect(result).toContain('Jan');
      expect(result).toContain('1');
    });

    it('includes time components', () => {
      const result = formatDate('2024-03-20T14:45:00');
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('toLocalDatetimeInput', () => {
    it('returns a string in YYYY-MM-DDTHH:MM format', () => {
      const result = toLocalDatetimeInput(new Date(2024, 5, 15, 10, 30));
      expect(result).toBe('2024-06-15T10:30');
    });

    it('pads single digits', () => {
      const result = toLocalDatetimeInput(new Date(2024, 0, 5, 8, 5));
      expect(result).toBe('2024-01-05T08:05');
    });

    it('handles midnight', () => {
      const result = toLocalDatetimeInput(new Date(2024, 11, 31, 0, 0));
      expect(result).toBe('2024-12-31T00:00');
    });
  });

  describe('escapeHtml', () => {
    it('escapes ampersands', () => {
      expect(escapeHtml('a&b')).toBe('a&amp;b');
    });

    it('escapes angle brackets', () => {
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    });

    it('escapes quotes', () => {
      expect(escapeHtml('"hello\'')).toBe('&quot;hello&#39;');
    });

    it('handles null/undefined', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });
  });

  describe('BODY_PARTS', () => {
    it('contains common body parts', () => {
      expect(BODY_PARTS).toContain('Head');
      expect(BODY_PARTS).toContain('Chest');
      expect(BODY_PARTS).toContain('Back');
    });

    it('has at least 10 body parts', () => {
      expect(BODY_PARTS.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('SEVERITY_LEVELS', () => {
    it('has 4 severity levels', () => {
      expect(SEVERITY_LEVELS).toHaveLength(4);
    });

    it('has Mild as first level', () => {
      expect(SEVERITY_LEVELS[0].label).toBe('Mild');
      expect(SEVERITY_LEVELS[0].value).toBe(1);
    });

    it('has Very Severe as last level', () => {
      expect(SEVERITY_LEVELS[3].label).toBe('Very Severe');
      expect(SEVERITY_LEVELS[3].value).toBe(4);
    });

    it('each level has a color', () => {
      SEVERITY_LEVELS.forEach((s) => {
        expect(s.color).toBeDefined();
        expect(s.color).toMatch(/^#/);
      });
    });
  });
});
