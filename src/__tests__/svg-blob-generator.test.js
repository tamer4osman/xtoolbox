import { describe, it, expect } from 'vitest';
import { toolConfig, render, destroy, generateBlobSVG } from '../tools/css/svg-blob-generator.js';

describe('svg-blob-generator', () => {
  it('has correct tool config', () => {
    expect(toolConfig.id).toBe('svg-blob-generator');
    expect(toolConfig.name).toBe('Organic SVG Blob & Wave Generator');
    expect(toolConfig.category).toBe('css');
    expect(toolConfig.icon).toBe('🌊');
    expect(toolConfig.keywords.length).toBeGreaterThan(3);
    expect(toolConfig.steps.length).toBeGreaterThan(2);
    expect(toolConfig.faqs.length).toBeGreaterThan(1);
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

  it('render appends content to container', () => {
    const container = document.createElement('div');
    render(container);
    expect(container.querySelector('.tool-layout')).toBeTruthy();
    expect(container.querySelector('.blob-grid')).toBeTruthy();
    expect(container.querySelector('#blob-type')).toBeTruthy();
    expect(container.querySelector('#blob-color1')).toBeTruthy();
    expect(container.querySelector('#blob-color2')).toBeTruthy();
    expect(container.querySelector('#blob-randomize')).toBeTruthy();
    expect(container.querySelector('#blob-copy')).toBeTruthy();
    expect(container.querySelector('#blob-download')).toBeTruthy();
    expect(container.querySelector('#blob-css')).toBeTruthy();
  });

  it('destroy cleans up without throwing', () => {
    const container = document.createElement('div');
    render(container);
    expect(() => destroy()).not.toThrow();
  });
});
