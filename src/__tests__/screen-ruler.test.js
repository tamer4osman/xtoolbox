import { describe, it, expect } from 'vitest';
import { pxToUnit, formatMeasurement, hexFromRgb, drawRulerTicks } from '../tools/dev/screen-ruler.js';

describe('pxToUnit', () => {
  it('returns same value for px unit', () => {
    expect(pxToUnit(100, 'px', 1)).toBe(100);
  });

  it('converts px to inches', () => {
    const result = pxToUnit(96, 'in', 1);
    expect(result).toBe(1);
  });

  it('converts px to centimeters', () => {
    const result = pxToUnit(96, 'cm', 1);
    expect(result).toBeCloseTo(2.54, 2);
  });

  it('converts px to millimeters', () => {
    const result = pxToUnit(96, 'mm', 1);
    expect(result).toBeCloseTo(25.4, 1);
  });

  it('accounts for device pixel ratio', () => {
    const result = pxToUnit(192, 'in', 2);
    expect(result).toBe(1);
  });
});

describe('formatMeasurement', () => {
  it('formats px as rounded integer', () => {
    expect(formatMeasurement(123.7, 'px', 1)).toBe('124');
  });

  it('formats cm to 2 decimal places', () => {
    expect(formatMeasurement(96, 'cm', 1)).toBe('2.54');
  });

  it('formats in to 2 decimal places', () => {
    expect(formatMeasurement(96, 'in', 1)).toBe('1.00');
  });

  it('formats mm to 2 decimal places', () => {
    expect(formatMeasurement(96, 'mm', 1)).toBe('25.40');
  });
});

describe('hexFromRgb', () => {
  it('converts black', () => {
    expect(hexFromRgb(0, 0, 0)).toBe('#000000');
  });

  it('converts white', () => {
    expect(hexFromRgb(255, 255, 255)).toBe('#ffffff');
  });

  it('converts red', () => {
    expect(hexFromRgb(255, 0, 0)).toBe('#ff0000');
  });

  it('converts arbitrary color', () => {
    expect(hexFromRgb(17, 51, 85)).toBe('#113355');
  });
});

describe('drawRulerTicks', () => {
  function createMockCtx() {
    const calls = [];
    return {
      calls,
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      fillStyle: '',
      beginPath: () => calls.push(['beginPath']),
      moveTo: (x, y) => calls.push(['moveTo', x, y]),
      lineTo: (x, y) => calls.push(['lineTo', x, y]),
      stroke: () => calls.push(['stroke']),
      fillText: (text, x, y) => calls.push(['fillText', text, x, y]),
      save: () => calls.push(['save']),
      restore: () => calls.push(['restore']),
      translate: (x, y) => calls.push(['translate', x, y]),
      rotate: (a) => calls.push(['rotate', a]),
    };
  }

  it('draws ticks along horizontal ruler', () => {
    const ctx = createMockCtx();
    drawRulerTicks(ctx, 500, 28, 0, 'px', 1, true);
    const strokes = ctx.calls.filter(c => c[0] === 'stroke');
    expect(strokes.length).toBeGreaterThan(0);
  });

  it('draws ticks along vertical ruler', () => {
    const ctx = createMockCtx();
    drawRulerTicks(ctx, 500, 28, 0, 'px', 1, false);
    const strokes = ctx.calls.filter(c => c[0] === 'stroke');
    expect(strokes.length).toBeGreaterThan(0);
  });

  it('draws fewer ticks for cm unit', () => {
    const ctxH = createMockCtx();
    drawRulerTicks(ctxH, 500, 28, 0, 'cm', 1, true);
    const strokesH = ctxH.calls.filter(c => c[0] === 'stroke');

    const ctxCm = createMockCtx();
    drawRulerTicks(ctxCm, 500, 28, 0, 'cm', 1, true);
    const strokesCm = ctxCm.calls.filter(c => c[0] === 'stroke');

    expect(strokesH.length).toBe(strokesCm.length);
  });
});
