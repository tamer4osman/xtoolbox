import { describe, it, expect } from 'vitest';
import { toolConfig, render, destroy } from '../tools/pdf/pdf-annotator.js';
import { testToolConfig, testRenderAndDestroy } from './tool-config-test.js';

describe('pdf-annotator', () => {
  testToolConfig(toolConfig, {
    id: 'pdf-annotator',
    name: 'PDF Annotator',
    category: 'pdf'
  });

  it('has correct icon and config', () => {
    expect(toolConfig.icon).toBe('✏️');
    expect(toolConfig.accept).toBe('.pdf');
    expect(toolConfig.maxSizeMB).toBe(100);
  });

  it('has at least 5 steps', () => {
    expect(toolConfig.steps.length).toBeGreaterThanOrEqual(5);
  });

  it('has at least 3 FAQs', () => {
    expect(toolConfig.faqs.length).toBeGreaterThanOrEqual(3);
  });

  it('has relevant keywords', () => {
    expect(toolConfig.keywords).toContain('pdf annotate');
    expect(toolConfig.keywords).toContain('pdf highlight');
  });

  testRenderAndDestroy(render, destroy, [
    '.tool-layout',
    '.tool-upload-area',
    '.tool-options',
    '.tool-processing',
    '#download-anno-btn'
  ]);

  it('render creates annotation toolbar placeholder', () => {
    const container = document.createElement('div');
    render(container);
    const toolbar = container.querySelector('#anno-toolbar');
    expect(toolbar).toBeTruthy();
    expect(toolbar.className).toBe('anno-toolbar');
  });

  it('render creates page navigation', () => {
    const container = document.createElement('div');
    render(container);
    expect(container.querySelector('#prev-page')).toBeTruthy();
    expect(container.querySelector('#next-page')).toBeTruthy();
    expect(container.querySelector('#page-indicator')).toBeTruthy();
  });

  it('render creates canvas container', () => {
    const container = document.createElement('div');
    render(container);
    expect(container.querySelector('#anno-canvas-container')).toBeTruthy();
  });

  it('render injects style element', () => {
    const container = document.createElement('div');
    render(container);
    const style = container.querySelector('style');
    expect(style).toBeTruthy();
    expect(style.textContent).toContain('.anno-toolbar');
  });

  it('destroy cleans up without throwing', () => {
    const container = document.createElement('div');
    render(container);
    expect(() => destroy()).not.toThrow();
  });
});
