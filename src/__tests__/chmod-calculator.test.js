import { describe, it, expect } from 'vitest';
import {
  toolConfig,
  octalToChmod,
  chmodToOctal,
  chmodToSymbolic,
  symbolicToChmod
} from '../tools/dev/chmod-calculator.js';

describe('chmod-calculator', () => {
  describe('toolConfig', () => {
    it('has correct id, name, category', () => {
      expect(toolConfig.id).toBe('chmod-calculator');
      expect(toolConfig.name).toBe('Chmod Calculator');
      expect(toolConfig.category).toBe('dev');
    });

    it('has keywords, steps, and faqs', () => {
      expect(toolConfig.keywords.length).toBeGreaterThan(3);
      expect(toolConfig.steps.length).toBeGreaterThan(2);
      expect(toolConfig.faqs.length).toBeGreaterThan(1);
    });
  });

  describe('octalToChmod', () => {
    it('parses 755 correctly', () => {
      const p = octalToChmod('755');
      expect(p.owner).toEqual({ r: true, w: true, x: true });
      expect(p.group).toEqual({ r: true, w: false, x: true });
      expect(p.other).toEqual({ r: true, w: false, x: true });
      expect(p.special).toEqual({ setuid: false, setgid: false, sticky: false });
    });

    it('parses 644 correctly', () => {
      const p = octalToChmod('644');
      expect(p.owner).toEqual({ r: true, w: true, x: false });
      expect(p.group).toEqual({ r: true, w: false, x: false });
      expect(p.other).toEqual({ r: true, w: false, x: false });
    });

    it('parses 4-digit 4755 (setuid)', () => {
      const p = octalToChmod('4755');
      expect(p.special.setuid).toBe(true);
      expect(p.special.setgid).toBe(false);
      expect(p.special.sticky).toBe(false);
      expect(p.owner.x).toBe(true);
    });

    it('parses 1777 (sticky)', () => {
      const p = octalToChmod('1777');
      expect(p.special.sticky).toBe(true);
      expect(p.special.setuid).toBe(false);
      expect(p.other.x).toBe(true);
    });

    it('returns null for invalid octal "888"', () => {
      expect(octalToChmod('888')).toBeNull();
    });

    it('returns null for non-numeric "abc"', () => {
      expect(octalToChmod('abc')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(octalToChmod('')).toBeNull();
    });

    it('returns null for non-string input', () => {
      expect(octalToChmod(755)).toBeNull();
      expect(octalToChmod(null)).toBeNull();
      expect(octalToChmod(undefined)).toBeNull();
    });

    it('returns null for too-long string', () => {
      expect(octalToChmod('12345')).toBeNull();
    });
  });

  describe('chmodToOctal', () => {
    it('round-trips 755', () => {
      expect(chmodToOctal(octalToChmod('755'))).toBe('755');
    });

    it('round-trips 644', () => {
      expect(chmodToOctal(octalToChmod('644'))).toBe('644');
    });

    it('round-trips 4755 (setuid)', () => {
      expect(chmodToOctal(octalToChmod('4755'))).toBe('4755');
    });

    it('round-trips 1777 (sticky)', () => {
      expect(chmodToOctal(octalToChmod('1777'))).toBe('1777');
    });

    it('returns 000 for empty perms', () => {
      const empty = {
        owner: { r: false, w: false, x: false },
        group: { r: false, w: false, x: false },
        other: { r: false, w: false, x: false },
        special: { setuid: false, setgid: false, sticky: false }
      };
      expect(chmodToOctal(empty)).toBe('000');
    });

    it('omits special digit when 0', () => {
      const p = octalToChmod('755');
      expect(chmodToOctal(p)).toBe('755');
      expect(chmodToOctal(p)).not.toBe('0755');
    });

    it('returns null for null input', () => {
      expect(chmodToOctal(null)).toBeNull();
    });
  });

  describe('chmodToSymbolic', () => {
    it('produces -rwxr-xr-x for 755', () => {
      expect(chmodToSymbolic(octalToChmod('755'))).toBe('-rwxr-xr-x');
    });

    it('produces -rw-r--r-- for 644', () => {
      expect(chmodToSymbolic(octalToChmod('644'))).toBe('-rw-r--r--');
    });

    it('produces ---------- for 000', () => {
      expect(chmodToSymbolic(octalToChmod('000'))).toBe('----------');
    });

    it('shows sticky as t for 1777', () => {
      expect(chmodToSymbolic(octalToChmod('1777'))).toBe('-rwxrwxrwt');
    });

    it('shows setuid as s in owner.x slot for 4755', () => {
      expect(chmodToSymbolic(octalToChmod('4755'))).toBe('-rwsr-xr-x');
    });

    it('shows setuid as S when x is off (4644)', () => {
      expect(chmodToSymbolic(octalToChmod('4644'))).toBe('-rwSr--r--');
    });

    it('shows setgid as s in group.x slot for 2755', () => {
      expect(chmodToSymbolic(octalToChmod('2755'))).toBe('-rwxr-sr-x');
    });

    it('returns null for null input', () => {
      expect(chmodToSymbolic(null)).toBeNull();
    });
  });

  describe('symbolicToChmod', () => {
    it('round-trips -rwxr-xr-x to 755', () => {
      expect(chmodToOctal(symbolicToChmod('-rwxr-xr-x'))).toBe('755');
    });

    it('accepts 9-char form without leading type', () => {
      expect(chmodToOctal(symbolicToChmod('rwxr-xr-x'))).toBe('755');
    });

    it('round-trips sticky symbolic', () => {
      expect(chmodToOctal(symbolicToChmod('-rwxrwxrwt'))).toBe('1777');
    });

    it('round-trips setuid symbolic', () => {
      expect(chmodToOctal(symbolicToChmod('-rwsr-xr-x'))).toBe('4755');
    });

    it('round-trips setgid symbolic', () => {
      expect(chmodToOctal(symbolicToChmod('-rwxr-sr-x'))).toBe('2755');
    });

    it('returns null for malformed input', () => {
      expect(symbolicToChmod('garbage')).toBeNull();
      expect(symbolicToChmod('')).toBeNull();
      expect(symbolicToChmod('-rwx')).toBeNull();
      expect(symbolicToChmod(null)).toBeNull();
    });
  });
});
