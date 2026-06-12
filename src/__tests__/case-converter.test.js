import { describe, it, expect } from 'vitest';
import { toolConfig, toLowerCase, toUpperCase, toTitleCase, toSentenceCase, toToggleCase } from '../tools/text/case-converter.js';

describe('case-converter', () => {
  describe('toolConfig', () => {
    it('has correct id, name, category', () => {
      expect(toolConfig.id).toBe('case-converter');
      expect(toolConfig.name).toBe('Case Converter');
      expect(toolConfig.category).toBe('text');
    });
  });

  describe('toLowerCase', () => {
    it('converts to lowercase', () => {
      expect(toolConfig.id).toBe('case-converter');
      expect(toLowerCase('HELLO')).toBe('hello');
    });
  });

  describe('toUpperCase', () => {
    it('converts to uppercase', () => {
      expect(toUpperCase('hello')).toBe('HELLO');
    });
  });

  describe('toTitleCase', () => {
    it('capitalizes each word', () => {
      expect(toTitleCase('hello world')).toBe('Hello World');
    });
    it('handles empty', () => {
      expect(toTitleCase('')).toBe('');
    });
  });

  describe('toSentenceCase', () => {
    it('capitalizes first letter', () => {
      expect(toSentenceCase('hello. world!')).toBe('Hello. World!');
    });
  });

  describe('toToggleCase', () => {
    it('toggles each character', () => {
      expect(toToggleCase('Hello')).toBe('hELLO');
    });
    it('handles empty', () => {
      expect(toToggleCase('')).toBe('');
    });
  });
});