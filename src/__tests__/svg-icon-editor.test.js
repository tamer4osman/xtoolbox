import { describe, it, expect } from 'vitest';
import { optimizeSvg } from '../tools/css/svg-optimizer.js';

describe('svg-icon-editor', () => {
  it('optimizes SVG with comments removed', () => {
    const svg = '<!-- comment --><svg xmlns="http://www.w3.org/2000/svg"></svg>';
    const result = optimizeSvg(svg, { removeComments: true });
    expect(result).not.toContain('<!-- comment -->');
  });

  it('optimizes SVG with metadata removed', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><metadata></metadata></svg>';
    const result = optimizeSvg(svg, { removeMetadata: true });
    expect(result).not.toContain('<metadata>');
  });

  it('optimizes SVG with precision rounding', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect x="10.12345" y="20.98765"/></svg>';
    const result = optimizeSvg(svg, { precision: 1 });
    expect(result.optimized).toContain('10.1');
    expect(result.optimized).toContain('21');
  });
});