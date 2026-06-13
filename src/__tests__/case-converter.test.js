import { describe, it, expect } from 'vitest';
import { toolConfig, toLowerCase, toUpperCase, toTitleCase, toSentenceCase, toToggleCase } from '../tools/text/case-converter.js';
import { testSimpleToolConfig } from './tool-config-test.js';

describe('case-converter', () => {
  testSimpleToolConfig(toolConfig, 'case-converter', 'Case Converter', 'text');

  describe('toLowerCase', () => {
    it('converts to lowercase', () => {
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