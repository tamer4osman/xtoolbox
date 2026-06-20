import { describe, it, expect } from 'vitest';
import { toolConfig, render, destroy } from '../tools/dev/pwa-manifest-generator.js';
import { testSimpleToolConfig } from './tool-config-test.js';

describe('pwa-manifest-generator', () => {
  testSimpleToolConfig(toolConfig, 'pwa-manifest-generator', 'PWA Manifest Generator', 'dev');

  it('exports render function', () => {
    expect(typeof render).toBe('function');
  });

  it('exports destroy function', () => {
    expect(typeof destroy).toBe('function');
  });
});

describe('render', () => {
  function generateManifest(container, overrides = {}) {
    container.querySelector('#pwa-name').value = overrides.name || 'My App';
    container.querySelector('#pwa-short-name').value = overrides.shortName || 'MyApp';
    if (overrides.description) container.querySelector('#pwa-description').value = overrides.description;
    if (overrides.startUrl) container.querySelector('#pwa-start-url').value = overrides.startUrl;
    if (overrides.display) container.querySelector('#pwa-display').value = overrides.display;
    if (overrides.scope) container.querySelector('#pwa-scope').value = overrides.scope;
    if (overrides.icons) container.querySelector('#pwa-icons').value = overrides.icons;
    container.querySelector('#pwa-generate').click();
    return JSON.parse(container.querySelector('#pwa-json').textContent);
  }

  it('creates form with all required fields', () => {
    const container = document.createElement('div');
    render(container);
    expect(container.querySelector('#pwa-name')).toBeTruthy();
    expect(container.querySelector('#pwa-short-name')).toBeTruthy();
    expect(container.querySelector('#pwa-description')).toBeTruthy();
    expect(container.querySelector('#pwa-start-url')).toBeTruthy();
    expect(container.querySelector('#pwa-display')).toBeTruthy();
    expect(container.querySelector('#pwa-bg-color')).toBeTruthy();
    expect(container.querySelector('#pwa-theme-color')).toBeTruthy();
    expect(container.querySelector('#pwa-orientation')).toBeTruthy();
    expect(container.querySelector('#pwa-scope')).toBeTruthy();
    expect(container.querySelector('#pwa-icons')).toBeTruthy();
    expect(container.querySelector('#pwa-generate')).toBeTruthy();
  });

  it('generates manifest JSON on button click', () => {
    const container = document.createElement('div');
    render(container);
    const manifest = generateManifest(container);
    expect(manifest.name).toBe('My App');
    expect(manifest.short_name).toBe('MyApp');
    expect(container.querySelector('#pwa-output').style.display).not.toBe('none');
  });

  it('does not generate when name is missing', () => {
    const container = document.createElement('div');
    render(container);
    container.querySelector('#pwa-short-name').value = 'MyApp';
    expect(container.querySelector('#pwa-output').style.display).toBe('none');
  });

  it('does not generate when short name is missing', () => {
    const container = document.createElement('div');
    render(container);
    container.querySelector('#pwa-name').value = 'My App';
    expect(container.querySelector('#pwa-output').style.display).toBe('none');
  });

  it('assigns correct icon sizes', () => {
    const container = document.createElement('div');
    render(container);
    const icons = 'https://example.com/icon-1.png\nhttps://example.com/icon-2.png\nhttps://example.com/icon-3.png';
    const manifest = generateManifest(container, { icons });
    expect(manifest.icons[0].sizes).toBe('192x192');
    expect(manifest.icons[1].sizes).toBe('512x512');
    expect(manifest.icons[2].sizes).toBe('180x180');
  });

  it('falls back to 192x192 for extra icons', () => {
    const container = document.createElement('div');
    render(container);
    const icons = Array(6).fill(0).map((_, i) => `https://example.com/${i + 1}.png`).join('\n');
    const manifest = generateManifest(container, { icons });
    expect(manifest.icons[5].sizes).toBe('192x192');
  });

  it('includes custom values when provided', () => {
    const container = document.createElement('div');
    render(container);
    const manifest = generateManifest(container, {
      name: 'Test App',
      shortName: 'TestApp',
      description: 'A test app',
      startUrl: '/app',
      display: 'fullscreen',
      scope: '/app'
    });
    expect(manifest.description).toBe('A test app');
    expect(manifest.start_url).toBe('/app');
    expect(manifest.display).toBe('fullscreen');
    expect(manifest.scope).toBe('/app');
  });

  it('omits icons when none provided', () => {
    const container = document.createElement('div');
    render(container);
    const manifest = generateManifest(container);
    expect(manifest.icons).toBeUndefined();
  });
});

describe('destroy', () => {
  it('does not throw', () => {
    expect(() => destroy()).not.toThrow();
  });
});
