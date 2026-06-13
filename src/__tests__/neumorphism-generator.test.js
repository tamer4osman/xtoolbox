import { describe, it, expect } from 'vitest';
import { toolConfig, render, destroy } from '../tools/css/neumorphism-generator.js';
import { testToolConfig, testRenderAndDestroy, testSliderInteraction } from './tool-config-test.js';

describe('neumorphism-generator', () => {
  testToolConfig(toolConfig, {
    id: 'neumorphism-generator',
    name: 'CSS Neumorphism Studio',
    category: 'css'
  });

  it('has icon', () => {
    expect(toolConfig.icon).toBe('🔘');
  });

  testRenderAndDestroy(render, destroy, [
    '.tool-layout',
    '.neo-studio',
    '.neo-controls',
    '.neo-preview-area',
    '.neo-card',
    '#neo-css',
    '#neo-copy',
    '#neo-blur',
    '#neo-intensity',
    '#neo-distance',
    '#neo-radius',
    '#neo-bg',
    '#neo-preset'
  ]);

  it('renders all preset options', () => {
    const container = document.createElement('div');
    render(container);
    const select = container.querySelector('#neo-preset');
    expect(select).toBeTruthy();
    expect(select.options.length).toBe(9);
  });

  it('has shape buttons', () => {
    const container = document.createElement('div');
    render(container);
    const shapeBtns = container.querySelectorAll('.neo-shape-btn');
    expect(shapeBtns.length).toBe(3);
    expect(shapeBtns[0].dataset.shape).toBe('convex');
    expect(shapeBtns[1].dataset.shape).toBe('concave');
    expect(shapeBtns[2].dataset.shape).toBe('pressed');
  });

  testSliderInteraction(render, 'neo-blur', 'neo-css', '30', '30px');

  it('shape buttons change shadow type', () => {
    const container = document.createElement('div');
    render(container);
    const convexBtn = container.querySelector('[data-shape="convex"]');
    const concaveBtn = container.querySelector('[data-shape="concave"]');
    convexBtn.click();
    let css = container.querySelector('#neo-css').value;
    expect(css).not.toContain('inset');
    concaveBtn.click();
    css = container.querySelector('#neo-css').value;
    expect(css).toContain('inset');
  });
});