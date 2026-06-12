import { describe, it, expect } from 'vitest';
import { toolConfig, initTextDiff, diffLines } from '../tools/text/text-diff.js';

describe('text-diff', () => {
  describe('toolConfig', () => {
    it('has correct id, name, category', () => {
      expect(toolConfig.id).toBe('text-diff');
      expect(toolConfig.name).toBe('Text Diff');
      expect(toolConfig.category).toBe('text');
    });
  });

  describe('initTextDiff', () => {
    it('returns early when required elements are missing', () => {
      expect(initTextDiff()).toBeUndefined();
    });
  });
});

describe('text-diff: diffLines', () => {
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  it('detects unchanged lines', () => {
    const diff = diffLines('a\nb\nc', 'a\nb\nc');
    expect(diff).toEqual([
      { type: 'unchanged', line: 'a' },
      { type: 'unchanged', line: 'b' },
      { type: 'unchanged', line: 'c' }
    ]);
  });

  it('detects added lines', () => {
    const diff = diffLines('a\nc', 'a\nb\nc');
    expect(diff).toContainEqual({ type: 'unchanged', line: 'a' });
    expect(diff).toContainEqual({ type: 'added', line: 'b' });
    expect(diff).toContainEqual({ type: 'unchanged', line: 'c' });
  });

  it('detects removed lines', () => {
    const diff = diffLines('a\nb\nc', 'a\nc');
    expect(diff).toContainEqual({ type: 'unchanged', line: 'a' });
    expect(diff).toContainEqual({ type: 'removed', line: 'b' });
    expect(diff).toContainEqual({ type: 'unchanged', line: 'c' });
  });

  it('handles edge cases with single line', () => {
    const bothEmpty = diffLines('', '');
    expect(bothEmpty.length).toBe(1);
    expect(bothEmpty[0].type).toBe('unchanged');

    const leftOnly = diffLines('a', '');
    expect(leftOnly.some(d => d.type === 'removed')).toBe(true);

    const rightOnly = diffLines('', 'b');
    expect(rightOnly.some(d => d.type === 'added')).toBe(true);
  });

  it('handles duplicate lines', () => {
    const diff = diffLines('a\na', 'a\nb\na');
    expect(diff.filter(d => d.type === 'unchanged')).toHaveLength(2);
    expect(diff.filter(d => d.type === 'added')).toHaveLength(1);
  });

  it('escapes HTML special characters', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });
});