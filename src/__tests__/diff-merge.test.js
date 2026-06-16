import { describe, it, expect } from 'vitest';
import { diffLines, buildMergeResult } from '../tools/text/text-diff.js';

describe('diff-merge', () => {
  it('identifies added lines', () => {
    const oldText = 'line1\nline2\nline3';
    const newText = 'line1\nline2\nline3\nline4';
    const diff = diffLines(oldText, newText);
    const added = diff.filter(d => d.type === 'added');
    expect(added.length).toBe(1);
    expect(added[0].line).toBe('line4');
  });

  it('identifies removed lines', () => {
    const oldText = 'line1\nline2\nline3';
    const newText = 'line1\nline3';
    const diff = diffLines(oldText, newText);
    const removed = diff.filter(d => d.type === 'removed');
    expect(removed.length).toBe(1);
    expect(removed[0].line).toBe('line2');
  });

  it('builds merged result', () => {
    const diff = [
      { type: 'unchanged', line: 'line1', oldIdx: 0, newIdx: 0 }
    ];
    const accepted = new Set();
    const result = buildMergeResult(diff, accepted);
    expect(result).toBe('line1');
  });
});