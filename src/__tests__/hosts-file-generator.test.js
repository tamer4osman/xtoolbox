import { describe, it, expect } from 'vitest';
import { toolConfig, render, destroy } from '../tools/dev/hosts-file-generator.js';

describe('hosts-file-generator', () => {
  it('has correct tool config', () => {
    expect(toolConfig.id).toBe('hosts-file-generator');
    expect(toolConfig.name).toBe('Hosts File Configurator');
    expect(toolConfig.category).toBe('dev');
    expect(toolConfig.icon).toBe('🌐');
    expect(toolConfig.keywords.length).toBeGreaterThan(3);
    expect(toolConfig.steps.length).toBeGreaterThan(2);
    expect(toolConfig.faqs.length).toBeGreaterThan(1);
  });

  it('render appends content to container', () => {
    const container = document.createElement('div');
    render(container);
    expect(container.querySelector('.tool-layout')).toBeTruthy();
    expect(container.querySelector('#hfg-template')).toBeTruthy();
    expect(container.querySelector('#hfg-entries')).toBeTruthy();
    expect(container.querySelector('#hfg-add')).toBeTruthy();
    expect(container.querySelector('#hfg-output')).toBeTruthy();
    expect(container.querySelector('#hfg-copy')).toBeTruthy();
    expect(container.querySelector('#hfg-download')).toBeTruthy();
  });

  it('has template options', () => {
    const container = document.createElement('div');
    render(container);
    const select = container.querySelector('#hfg-template');
    expect(select).toBeTruthy();
    expect(select.options.length).toBe(5);
  });

  it('destroy cleans up without throwing', () => {
    const container = document.createElement('div');
    render(container);
    expect(() => destroy()).not.toThrow();
  });

  it('adding entry creates a row', () => {
    const container = document.createElement('div');
    render(container);
    const addBtn = container.querySelector('#hfg-add');
    addBtn.click();
    const rows = container.querySelectorAll('.hfg-row');
    expect(rows.length).toBe(1);
  });

  it('template selection loads entries', () => {
    const container = document.createElement('div');
    render(container);
    const select = container.querySelector('#hfg-template');
    select.value = '1'; // Localhost template
    select.dispatchEvent(new Event('change'));
    const rows = container.querySelectorAll('.hfg-row');
    expect(rows.length).toBe(1);
    const ip = rows[0].querySelector('.hfg-ip').value;
    expect(ip).toBe('127.0.0.1');
  });

  it('output updates on entry change', () => {
    const container = document.createElement('div');
    render(container);
    const addBtn = container.querySelector('#hfg-add');
    addBtn.click();
    const ipInput = container.querySelector('.hfg-ip');
    const hostnameInput = container.querySelector('.hfg-hostname');
    ipInput.value = '192.168.1.1';
    hostnameInput.value = 'test.local';
    ipInput.dispatchEvent(new Event('input'));
    hostnameInput.dispatchEvent(new Event('input'));
    const output = container.querySelector('#hfg-output').textContent;
    expect(output).toContain('192.168.1.1');
    expect(output).toContain('test.local');
  });
});