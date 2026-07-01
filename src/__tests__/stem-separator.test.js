import { describe, it, expect } from 'vitest';
import { toolConfig, makeTransitionWindow, render } from '../tools/audio/stem-separator.js';

describe('stem-separator', () => {
  it('has correct tool config', () => {
    expect(toolConfig.id).toBe('stem-separator');
    expect(toolConfig.category).toBe('audio');
    expect(toolConfig.keywords).toContain('demucs');
    expect(toolConfig.keywords).toContain('vocal');
  });

  it('exports a render function', () => {
    expect(typeof render).toBe('function');
  });

  describe('makeTransitionWindow', () => {
    it('returns array of correct length', () => {
      const w = makeTransitionWindow(100, 25);
      expect(w).toHaveLength(100);
    });

    it('has triangular fade-in at start', () => {
      const w = makeTransitionWindow(100, 25);
      expect(w[0]).toBeCloseTo(0);
      expect(w[12]).toBeCloseTo(0.48, 1);
      expect(w[24]).toBeCloseTo(0.96, 1);
    });

    it('has triangular fade-out at end', () => {
      const w = makeTransitionWindow(100, 25);
      expect(w[99]).toBeCloseTo(0);
      expect(w[87]).toBeCloseTo(0.48, 1);
      expect(w[75]).toBeCloseTo(0.96, 1);
    });

    it('is flat (1) in the middle', () => {
      const w = makeTransitionWindow(100, 25);
      for (let i = 25; i < 75; i++) {
        expect(w[i]).toBe(1);
      }
    });
  });
});
