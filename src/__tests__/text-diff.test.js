import { describe, it, expect } from 'vitest';
import { toolConfig, diffLines } from '../tools/text/text-diff.js';
import { escapeHtml } from '../utils/escape-html.js';
import { testSimpleToolConfig } from './tool-config-test.js';

describe('text-diff', () => {
  testSimpleToolConfig(toolConfig, 'text-diff', 'Text Diff', 'text');
});

describe('text-diff: diffLines', () => {
  it('detects unchanged lines', () => {
    const diff = diffLines('a\nb\nc', 'a\nb\nc');
    expect(diff).toEqual([
      { type: 'unchanged', line: 'a', oldIdx: 0, newIdx: 0 },
      { type: 'unchanged', line: 'b', oldIdx: 1, newIdx: 1 },
      { type: 'unchanged', line: 'c', oldIdx: 2, newIdx: 2 }
    ]);
  });

  it('detects added lines', () => {
    const diff = diffLines('a\nc', 'a\nb\nc');
    expect(diff).toContainEqual({ type: 'unchanged', line: 'a', oldIdx: 0, newIdx: 0 });
    expect(diff).toContainEqual({ type: 'added', line: 'b', oldIdx: null, newIdx: 1 });
    expect(diff).toContainEqual({ type: 'unchanged', line: 'c', oldIdx: 1, newIdx: 2 });
  });

  it('detects removed lines', () => {
    const diff = diffLines('a\nb\nc', 'a\nc');
    expect(diff).toContainEqual({ type: 'unchanged', line: 'a', oldIdx: 0, newIdx: 0 });
    expect(diff).toContainEqual({ type: 'removed', line: 'b', oldIdx: 1, newIdx: null });
    expect(diff).toContainEqual({ type: 'unchanged', line: 'c', oldIdx: 2, newIdx: 1 });
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
