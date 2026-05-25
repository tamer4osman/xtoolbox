import { describe, it, expect } from 'vitest';
import { toolConfig, render, destroy } from '../tools/pdf/pdf-secure-redact.js';

describe('pdf-secure-redact', () => {
  it('has correct tool config', () => {
    expect(toolConfig.id).toBe('pdf-secure-redact');
    expect(toolConfig.name).toBe('PDF Secure Destructive Redactor');
    expect(toolConfig.category).toBe('pdf');
    expect(toolConfig.icon).toBe('🔒');
    expect(toolConfig.accept).toBe('.pdf');
    expect(toolConfig.maxSizeMB).toBe(100);
    expect(toolConfig.keywords.length).toBeGreaterThan(3);
    expect(toolConfig.steps.length).toBeGreaterThan(3);
    expect(toolConfig.faqs.length).toBeGreaterThan(1);
  });

  it('render appends content to container', () => {
    const container = document.createElement('div');
    render(container);
    expect(container.querySelector('.tool-layout')).toBeTruthy();
    expect(container.querySelector('.tool-upload-area')).toBeTruthy();
    expect(container.querySelector('.tool-options')).toBeTruthy();
    expect(container.querySelector('.tool-processing')).toBeTruthy();
    expect(container.querySelector('#apply-redact-btn')).toBeTruthy();
  });

  it('render injects style element', () => {
    const container = document.createElement('div');
    render(container);
    const style = container.querySelector('style');
    expect(style).toBeTruthy();
    expect(style.textContent).toContain('.redact-overlay');
  });

  it('destroy cleans up without throwing', () => {
    const container = document.createElement('div');
    render(container);
    expect(container.querySelector('style')).toBeTruthy();
    expect(() => destroy()).not.toThrow();
    expect(container.querySelector('style')).toBeFalsy();
  });
});
