import { describe, it, expect } from 'vitest';
import { toolConfig, render, destroy, generateBlobSVG } from '../tools/css/svg-blob-generator.js';
import { testToolConfig, testRenderAndDestroy } from './tool-config-test.js';

describe('svg-blob-generator', () => {
  testToolConfig(toolConfig, {
    id: 'svg-blob-generator',
    name: 'Organic SVG Blob & Wave Generator',
    category: 'css'
  });

  it('has icon', () => {
    expect(toolConfig.icon).toBe('🌊');
  });

  it('generateBlobSVG produces valid SVG for blob type', () => {
    const svg = generateBlobSVG('blob', 8, 0.6, '#667eea', '#764ba2', 12345);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('linearGradient');
    expect(svg).toContain('d="M');
    expect(svg).toContain('#667eea');
    expect(svg).toContain('#764ba2');
    expect(svg).toContain('viewBox="0 0 400 400"');
  });

  it('generateBlobSVG produces valid SVG for wave type', () => {
    const svg = generateBlobSVG('wave', 8, 0.6, '#667eea', '#764ba2', 12345, 30, 3, 2);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('d="M');
    expect(svg).toContain('viewBox="0 0 800 200"');
  });

  it('generateBlobSVG is deterministic with same seed', () => {
    const svg1 = generateBlobSVG('blob', 8, 0.6, '#667eea', '#764ba2', 99999);
    const svg2 = generateBlobSVG('blob', 8, 0.6, '#667eea', '#764ba2', 99999);
    expect(svg1).toBe(svg2);
  });

  it('generateBlobSVG produces different shapes with different seeds', () => {
    const svg1 = generateBlobSVG('blob', 8, 0.6, '#667eea', '#764ba2', 11111);
    const svg2 = generateBlobSVG('blob', 8, 0.6, '#667eea', '#764ba2', 22222);
    expect(svg1).not.toBe(svg2);
  });

  testRenderAndDestroy(render, destroy, [
    '.tool-layout',
    '.blob-grid',
    '#blob-type',
    '#blob-color1',
    '#blob-color2',
    '#blob-randomize',
    '#blob-copy',
    '#blob-download',
    '#blob-css'
  ]);
});
