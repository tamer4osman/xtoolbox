import { describe, it, expect } from 'vitest';
import { toolConfig, getCronDescription } from '../tools/dev/cron-builder.js';

describe('cron-builder', () => {
  describe('toolConfig', () => {
    it('has correct id, name, category', () => {
      expect(toolConfig.id).toBe('cron-builder');
      expect(toolConfig.name).toBe('Cron Expression Builder');
      expect(toolConfig.category).toBe('dev');
    });
  });

  describe('getCronDescription', () => {
    it('describes every minute', () => {
      expect(getCronDescription({ minute: '*', hour: '*', day: '*', month: '*', weekday: '*' })).toBe('Runs every minute');
    });

    it('describes every hour at minute 0', () => {
      expect(getCronDescription({ minute: '0', hour: '*', day: '*', month: '*', weekday: '*' })).toBe('Runs every hour at minute 0');
    });

    it('describes daily at midnight', () => {
      expect(getCronDescription({ minute: '0', hour: '0', day: '*', month: '*', weekday: '*' })).toBe('Runs daily at midnight');
    });

    it('describes weekdays at 9 AM', () => {
      expect(getCronDescription({ minute: '0', hour: '9', day: '*', month: '*', weekday: '1-5' })).toBe('Runs weekdays at 9 AM');
    });

    it('describes custom cron', () => {
      const result = getCronDescription({ minute: '15', hour: '6', day: '1', month: '6', weekday: '*' });
      expect(result).toContain('15 6 1 6 *');
    });
  });
});