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
    container.querySelector('#pwa-name').value = 'My App';
    container.querySelector('#pwa-short-name').value = 'MyApp';
    container.querySelector('#pwa-generate').click();
    const json = container.querySelector('#pwa-json').textContent;
    const manifest = JSON.parse(json);
    expect(manifest.name).toBe('My App');
    expect(manifest.short_name).toBe('MyApp');
    expect(container.querySelector('#pwa-output').style.display).not.toBe('none');
  });

  it('does not generate when name is missing', () => {
    const container = document.createElement('div');
    render(container);
    container.querySelector('#pwa-short-name').value = 'MyApp';
    const output = container.querySelector('#pwa-output');
    expect(output.style.display).toBe('none');
  });

  it('does not generate when short name is missing', () => {
    const container = document.createElement('div');
    render(container);
    container.querySelector('#pwa-name').value = 'My App';
    const output = container.querySelector('#pwa-output');
    expect(output.style.display).toBe('none');
  });

  it('assigns correct icon sizes', () => {
    const container = document.createElement('div');
    render(container);
    container.querySelector('#pwa-name').value = 'My App';
    container.querySelector('#pwa-short-name').value = 'MyApp';
    container.querySelector('#pwa-icons').value = 'https://example.com/icon-1.png\nhttps://example.com/icon-2.png\nhttps://example.com/icon-3.png';
    container.querySelector('#pwa-generate').click();
    const manifest = JSON.parse(container.querySelector('#pwa-json').textContent);
    expect(manifest.icons[0].sizes).toBe('192x192');
    expect(manifest.icons[1].sizes).toBe('512x512');
    expect(manifest.icons[2].sizes).toBe('180x180');
  });

  it('falls back to 192x192 for extra icons', () => {
    const container = document.createElement('div');
    render(container);
    container.querySelector('#pwa-name').value = 'My App';
    container.querySelector('#pwa-short-name').value = 'MyApp';
    container.querySelector('#pwa-icons').value = 'https://example.com/1.png\nhttps://example.com/2.png\nhttps://example.com/3.png\nhttps://example.com/4.png\nhttps://example.com/5.png\nhttps://example.com/6.png';
    container.querySelector('#pwa-generate').click();
    const manifest = JSON.parse(container.querySelector('#pwa-json').textContent);
    expect(manifest.icons[5].sizes).toBe('192x192');
  });

  it('includes custom values when provided', () => {
    const container = document.createElement('div');
    render(container);
    container.querySelector('#pwa-name').value = 'Test App';
    container.querySelector('#pwa-short-name').value = 'TestApp';
    container.querySelector('#pwa-description').value = 'A test app';
    container.querySelector('#pwa-start-url').value = '/app';
    container.querySelector('#pwa-display').value = 'fullscreen';
    container.querySelector('#pwa-scope').value = '/app';
    container.querySelector('#pwa-generate').click();
    const manifest = JSON.parse(container.querySelector('#pwa-json').textContent);
    expect(manifest.description).toBe('A test app');
    expect(manifest.start_url).toBe('/app');
    expect(manifest.display).toBe('fullscreen');
    expect(manifest.scope).toBe('/app');
  });

  it('omits icons when none provided', () => {
    const container = document.createElement('div');
    render(container);
    container.querySelector('#pwa-name').value = 'My App';
    container.querySelector('#pwa-short-name').value = 'MyApp';
    container.querySelector('#pwa-generate').click();
    const manifest = JSON.parse(container.querySelector('#pwa-json').textContent);
    expect(manifest.icons).toBeUndefined();
  });
});

describe('destroy', () => {
  it('does not throw', () => {
    expect(() => destroy()).not.toThrow();
  });
});
