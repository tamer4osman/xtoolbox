import { describe, it, expect } from 'vitest';
import { toolConfig, render, destroy } from '../tools/css/glassmorphism-generator.js';

describe('glassmorphism-generator', () => {
  it('has correct tool config', () => {
    expect(toolConfig.id).toBe('glassmorphism-generator');
    expect(toolConfig.name).toBe('CSS Glassmorphism Studio');
    expect(toolConfig.category).toBe('css');
    expect(toolConfig.icon).toBe('🔮');
    expect(toolConfig.keywords.length).toBeGreaterThan(3);
    expect(toolConfig.steps.length).toBeGreaterThan(2);
    expect(toolConfig.faqs.length).toBeGreaterThan(1);
  });

  it('render appends content to container', () => {
    const container = document.createElement('div');
    render(container);
    expect(container.querySelector('.tool-layout')).toBeTruthy();
    expect(container.querySelector('.gg-studio')).toBeTruthy();
    expect(container.querySelector('.gg-controls')).toBeTruthy();
    expect(container.querySelector('.gg-preview-area')).toBeTruthy();
    expect(container.querySelector('.gg-card')).toBeTruthy();
    expect(container.querySelector('#gg-css')).toBeTruthy();
    expect(container.querySelector('#gg-copy')).toBeTruthy();
    expect(container.querySelector('#gg-blur')).toBeTruthy();
    expect(container.querySelector('#gg-opacity')).toBeTruthy();
    expect(container.querySelector('#gg-radius')).toBeTruthy();
    expect(container.querySelector('#gg-hue')).toBeTruthy();
    expect(container.querySelector('#gg-safari')).toBeTruthy();
  });

  it('renders all background options', () => {
    const container = document.createElement('div');
    render(container);
    const select = container.querySelector('#gg-bg');
    expect(select).toBeTruthy();
    expect(select.options.length).toBe(8);
  });

  it('destroy cleans up without throwing', () => {
    const container = document.createElement('div');
    render(container);
    expect(() => destroy()).not.toThrow();
  });

  it('update updates CSS output on slider change', () => {
    const container = document.createElement('div');
    render(container);
    const blur = container.querySelector('#gg-blur');
    blur.value = '20';
    blur.dispatchEvent(new Event('input'));
    const css = container.querySelector('#gg-css').value;
    expect(css).toContain('blur(20px)');
    expect(css).toContain('.glass');
    expect(css).toContain('backdrop-filter');
  });
});
