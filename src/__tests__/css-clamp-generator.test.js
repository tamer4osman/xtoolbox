import { describe, it, expect } from 'vitest';
import { toolConfig, render, destroy } from '../tools/css/css-clamp-generator.js';
import { testToolConfig } from './tool-config-test.js';

describe('css-clamp-generator', () => {
  testToolConfig(toolConfig, {
    id: 'css-clamp-generator',
    name: 'Fluid Typography (CSS Clamp) Calculator',
    category: 'css'
  });

  it('has icon', () => {
    expect(toolConfig.icon).toBe('📐');
  });

  it('render appends content to container', () => {
    const container = document.createElement('div');
    render(container);
    expect(container.querySelector('.tool-layout')).toBeTruthy();
    expect(container.querySelector('.clamp-grid')).toBeTruthy();
    expect(container.querySelector('.clamp-inputs')).toBeTruthy();
    expect(container.querySelector('.clamp-chart')).toBeTruthy();
    expect(container.querySelector('#cc-min-vw')).toBeTruthy();
    expect(container.querySelector('#cc-max-vw')).toBeTruthy();
    expect(container.querySelector('#cc-min-size')).toBeTruthy();
    expect(container.querySelector('#cc-max-size')).toBeTruthy();
    expect(container.querySelector('#cc-css')).toBeTruthy();
    expect(container.querySelector('#cc-copy')).toBeTruthy();
    expect(container.querySelector('#cc-preview-text')).toBeTruthy();
  });

  it('destroy cleans up without throwing', () => {
    const container = document.createElement('div');
    render(container);
    expect(() => destroy()).not.toThrow();
  });

  it('generates valid clamp CSS on default values', () => {
    const container = document.createElement('div');
    render(container);
    const css = container.querySelector('#cc-css').value;
    expect(css).toContain('clamp(');
    expect(css).toContain('font-size:');
    expect(css).toContain('.fluid-text');
    expect(css).toContain('16px');
    expect(css).toContain('32px');
  });

  it('updates clamp output when min size changes', () => {
    const container = document.createElement('div');
    render(container);
    const minSize = container.querySelector('#cc-min-size');
    minSize.value = '24';
    minSize.dispatchEvent(new Event('input'));
    const css = container.querySelector('#cc-css').value;
    expect(css).toContain('clamp(24px');
  });
});
