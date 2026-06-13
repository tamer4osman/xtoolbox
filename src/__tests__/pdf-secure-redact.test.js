import { describe, it, expect } from 'vitest';
import { toolConfig, render, destroy } from '../tools/pdf/pdf-secure-redact.js';
import { testToolConfig, testRenderAndDestroy } from './tool-config-test.js';

describe('pdf-secure-redact', () => {
  testToolConfig(toolConfig, {
    id: 'pdf-secure-redact',
    name: 'PDF Visual Redactor',
    category: 'pdf'
  });

  it('has icon and config', () => {
    expect(toolConfig.icon).toBe('🔒');
    expect(toolConfig.accept).toBe('.pdf');
    expect(toolConfig.maxSizeMB).toBe(100);
  });

  testRenderAndDestroy(render, destroy, [
    '.tool-layout',
    '.tool-upload-area',
    '.tool-options',
    '.tool-processing',
    '#apply-redact-btn'
  ]);

  it('render injects style element', () => {
    const container = document.createElement('div');
    render(container);
    const style = container.querySelector('style');
    expect(style).toBeTruthy();
    expect(style.textContent).toContain('.redact-overlay');
  });
});
