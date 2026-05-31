import { describe, it, expect } from 'vitest';
import { toolConfig, render, destroy } from '../tools/css/neumorphism-generator.js';

describe('neumorphism-generator', () => {
  it('has correct tool config', () => {
    expect(toolConfig.id).toBe('neumorphism-generator');
    expect(toolConfig.name).toBe('CSS Neumorphism Studio');
    expect(toolConfig.category).toBe('css');
    expect(toolConfig.icon).toBe('🔘');
    expect(toolConfig.keywords.length).toBeGreaterThan(3);
    expect(toolConfig.steps.length).toBeGreaterThan(2);
    expect(toolConfig.faqs.length).toBeGreaterThan(1);
  });

  it('render appends content to container', () => {
    const container = document.createElement('div');
    render(container);
    expect(container.querySelector('.tool-layout')).toBeTruthy();
    expect(container.querySelector('.neo-studio')).toBeTruthy();
    expect(container.querySelector('.neo-controls')).toBeTruthy();
    expect(container.querySelector('.neo-preview-area')).toBeTruthy();
    expect(container.querySelector('.neo-card')).toBeTruthy();
    expect(container.querySelector('#neo-css')).toBeTruthy();
    expect(container.querySelector('#neo-copy')).toBeTruthy();
    expect(container.querySelector('#neo-blur')).toBeTruthy();
    expect(container.querySelector('#neo-intensity')).toBeTruthy();
    expect(container.querySelector('#neo-distance')).toBeTruthy();
    expect(container.querySelector('#neo-radius')).toBeTruthy();
    expect(container.querySelector('#neo-bg')).toBeTruthy();
    expect(container.querySelector('#neo-preset')).toBeTruthy();
  });

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

  it('destroy cleans up without throwing', () => {
    const container = document.createElement('div');
    render(container);
    expect(() => destroy()).not.toThrow();
  });

  it('update updates CSS output on slider change', () => {
    const container = document.createElement('div');
    render(container);
    const blur = container.querySelector('#neo-blur');
    blur.value = '30';
    blur.dispatchEvent(new Event('input'));
    const css = container.querySelector('#neo-css').value;
    expect(css).toContain('.neumorphic');
    expect(css).toContain('box-shadow');
    expect(css).toContain('30px');
  });

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