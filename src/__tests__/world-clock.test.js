import { describe, it, expect } from 'vitest';
import {
  toolConfig,
  getAllTimeZones,
  getZoneOffsetMinutes,
  formatInZone,
  formatDateInZone,
  convertTime,
  getDefaultZones
} from '../tools/reference/world-clock.js';

describe('world-clock', () => {
  describe('toolConfig', () => {
    it('has correct id, name, category', () => {
      expect(toolConfig.id).toBe('world-clock');
      expect(toolConfig.name).toBe('World Clock & Time Zone Converter');
      expect(toolConfig.category).toBe('reference');
    });

    it('has keywords, steps, and faqs', () => {
      expect(toolConfig.keywords.length).toBeGreaterThan(3);
      expect(toolConfig.steps.length).toBeGreaterThan(2);
      expect(toolConfig.faqs.length).toBeGreaterThan(1);
    });
  });

  describe('getAllTimeZones', () => {
    it('returns a non-empty array of strings', () => {
      const z = getAllTimeZones();
      expect(Array.isArray(z)).toBe(true);
      expect(z.length).toBeGreaterThan(0);
      z.forEach(s => expect(typeof s).toBe('string'));
    });

    it('includes common zones', () => {
      const z = getAllTimeZones();
      ['America/New_York', 'Europe/London', 'Asia/Tokyo'].forEach(zone => {
        expect(z).toContain(zone);
      });
    });

    it('has unique entries', () => {
      const z = getAllTimeZones();
      expect(new Set(z).size).toBe(z.length);
    });
  });

  describe('getZoneOffsetMinutes', () => {
    const winterDate = new Date('2026-01-15T12:00:00Z');
    const summerDate = new Date('2026-07-15T12:00:00Z');

    it('returns 0 for UTC', () => {
      expect(getZoneOffsetMinutes('UTC', winterDate)).toBe(0);
      expect(getZoneOffsetMinutes('UTC', summerDate)).toBe(0);
    });

    it('returns +540 for Asia/Tokyo (no DST)', () => {
      expect(getZoneOffsetMinutes('Asia/Tokyo', winterDate)).toBe(540);
      expect(getZoneOffsetMinutes('Asia/Tokyo', summerDate)).toBe(540);
    });

    it('returns +180 for Europe/Istanbul (no DST since 2016)', () => {
      expect(getZoneOffsetMinutes('Europe/Istanbul', winterDate)).toBe(180);
      expect(getZoneOffsetMinutes('Europe/Istanbul', summerDate)).toBe(180);
    });

    it('handles DST for America/New_York (EST/EDT)', () => {
      const winter = getZoneOffsetMinutes('America/New_York', winterDate);
      const summer = getZoneOffsetMinutes('America/New_York', summerDate);
      expect(winter).toBe(-300);
      expect(summer).toBe(-240);
    });

    it('handles DST for Europe/London (GMT/BST)', () => {
      const winter = getZoneOffsetMinutes('Europe/London', winterDate);
      const summer = getZoneOffsetMinutes('Europe/London', summerDate);
      expect(winter).toBe(0);
      expect(summer).toBe(60);
    });

    it('returns 0 for empty zone', () => {
      expect(getZoneOffsetMinutes('', winterDate)).toBe(0);
    });
  });

  describe('formatInZone', () => {
    const date = new Date('2026-06-15T12:00:00Z');

    it('returns a non-empty string', () => {
      const out = formatInZone(date, 'UTC');
      expect(typeof out).toBe('string');
      expect(out.length).toBeGreaterThan(0);
      expect(out).not.toBe('—');
    });

    it('formats 24-hour time in UTC', () => {
      expect(formatInZone(date, 'UTC')).toBe('12:00:00');
    });

    it('formats correctly for Asia/Tokyo (UTC+9)', () => {
      expect(formatInZone(date, 'Asia/Tokyo')).toBe('21:00:00');
    });

    it('returns "—" for invalid zone', () => {
      expect(formatInZone(date, 'Not/A_Zone')).toBe('—');
    });
  });

  describe('formatDateInZone', () => {
    it('returns a non-empty string', () => {
      const out = formatDateInZone(new Date('2026-06-15T12:00:00Z'), 'UTC');
      expect(typeof out).toBe('string');
      expect(out.length).toBeGreaterThan(0);
    });
  });

  describe('convertTime', () => {
    it('returns null for invalid inputs', () => {
      const d = new Date('2026-06-15T12:00:00Z');
      expect(convertTime(null, 'UTC', 'Asia/Tokyo')).toBeNull();
      expect(convertTime(d, '', 'Asia/Tokyo')).toBeNull();
      expect(convertTime(d, 'UTC', '')).toBeNull();
    });

    it('returns a Date instance', () => {
      const d = new Date('2026-06-15T12:00:00Z');
      expect(convertTime(d, 'UTC', 'Asia/Tokyo')).toBeInstanceOf(Date);
    });

    it('interprets UTC components as wall clock in sourceZone', () => {
      const d = new Date('2026-06-15T12:00:00Z');
      const out = convertTime(d, 'UTC', 'Asia/Tokyo');
      expect(formatInZone(out, 'UTC')).toBe('12:00:00');
      expect(formatInZone(out, 'Asia/Tokyo')).toBe('21:00:00');
    });

    it('same-zone conversion preserves wall clock in source zone', () => {
      const d = new Date('2026-01-15T12:00:00Z');
      const out = convertTime(d, 'America/New_York', 'America/New_York');
      expect(formatInZone(out, 'America/New_York')).toBe('12:00:00');
    });

    it('handles 12:00 NY → Tokyo correctly in summer (EDT)', () => {
      const d = new Date('2026-06-15T12:00:00Z');
      const out = convertTime(d, 'America/New_York', 'Asia/Tokyo');
      expect(formatInZone(out, 'America/New_York')).toBe('12:00:00');
      expect(formatInZone(out, 'Asia/Tokyo')).toBe('01:00:00');
    });

    it('handles 12:00 NY → Tokyo correctly in winter (EST)', () => {
      const d = new Date('2026-01-15T12:00:00Z');
      const out = convertTime(d, 'America/New_York', 'Asia/Tokyo');
      expect(formatInZone(out, 'America/New_York')).toBe('12:00:00');
      expect(formatInZone(out, 'Asia/Tokyo')).toBe('02:00:00');
    });
  });

  describe('getDefaultZones', () => {
    it('returns a non-empty array of valid zones', () => {
      const z = getDefaultZones();
      expect(Array.isArray(z)).toBe(true);
      expect(z.length).toBeGreaterThanOrEqual(5);
      const all = getAllTimeZones();
      z.forEach(zone => expect(all).toContain(zone));
    });

    it('has unique entries', () => {
      const z = getDefaultZones();
      expect(new Set(z).size).toBe(z.length);
    });
  });
});
