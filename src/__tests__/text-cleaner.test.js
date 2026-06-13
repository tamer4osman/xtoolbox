import { describe, it, expect } from 'vitest';
import { toolConfig, trimText, removeExtraSpaces, removeEmptyLines, removeAllLineBreaks, sortLines, uniqueLines, cleanAll } from '../tools/text/text-cleaner.js';
import { testSimpleToolConfig } from './tool-config-test.js';

describe('text-cleaner', () => {
  testSimpleToolConfig(toolConfig, 'text-cleaner', 'Text Cleaner', 'text');

  describe('trimText', () => {
    it('trims whitespace', () => {
      expect(trimText('  hello  ')).toBe('hello');
    });
    it('handles empty', () => {
      expect(trimText('')).toBe('');
    });
  });

  describe('removeExtraSpaces', () => {
    it('collapses spaces', () => {
      expect(removeExtraSpaces('hello    world')).toBe('hello world');
    });
    it('trims edges', () => {
      expect(removeExtraSpaces('  hello  ')).toBe('hello');
    });
  });

  describe('removeEmptyLines', () => {
    it('removes blank lines', () => {
      expect(removeEmptyLines('a\n\nb')).toBe('a\nb');
    });
  });

  describe('removeAllLineBreaks', () => {
    it('replaces newlines', () => {
      expect(removeAllLineBreaks('a\nb')).toBe('a b');
    });
  });

  describe('sortLines', () => {
    it('sorts alphabetically', () => {
      expect(sortLines('c\na\nb')).toBe('a\nb\nc');
    });
    it('handles empty', () => {
      expect(sortLines('')).toBe('');
    });
  });

  describe('uniqueLines', () => {
    it('removes duplicates', () => {
      expect(uniqueLines('a\nb\na')).toBe('a\nb');
    });
  });

  describe('cleanAll', () => {
    it('combines operations', () => {
      expect(cleanAll('  a   \n\n  b  ')).toBe('a b');
    });
  });
});