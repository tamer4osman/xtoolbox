import { describe, it, expect } from 'vitest';
import { toolConfig, generateSchema, render, destroy } from '../tools/dev/sql-to-json.js';

describe('sql-to-json', () => {
  it('has correct toolConfig', () => {
    expect(toolConfig.id).toBe('sql-to-json');
    expect(toolConfig.name).toContain('SQL');
    expect(toolConfig.category).toBe('dev');
    expect(toolConfig.icon).toBe('🗃️');
    expect(toolConfig.status).toBe('done');
    expect(toolConfig.keywords.length).toBeGreaterThan(3);
    expect(toolConfig.steps.length).toBeGreaterThan(2);
    expect(toolConfig.faqs.length).toBeGreaterThan(1);
  });

  it('generateSchema creates valid schema from table structure', () => {
    const tables = {
      users: {
        id: { type: 'integer', nullable: false },
        name: { type: 'string', nullable: true },
        email: { type: 'string', nullable: true }
      }
    };
    const schema = generateSchema(tables);
    expect(schema.users).toBeDefined();
    expect(schema.users.type).toBe('object');
    expect(schema.users.properties.id.type).toBe('integer');
    expect(schema.users.properties.name.type).toBe('string');
    expect(schema.users.properties.email.type).toBe('string');
  });

  it('generateSchema handles multiple tables', () => {
    const tables = {
      users: { id: { type: 'integer', nullable: false } },
      posts: { id: { type: 'integer', nullable: false }, title: { type: 'string', nullable: true } }
    };
    const schema = generateSchema(tables);
    expect(schema.users).toBeDefined();
    expect(schema.posts).toBeDefined();
    expect(schema.posts.properties.title.type).toBe('string');
  });

  it('generateSchema handles empty tables object', () => {
    const schema = generateSchema({});
    expect(Object.keys(schema).length).toBe(0);
  });

  it('render appends content to container', () => {
    const container = document.createElement('div');
    render(container);
    expect(container.querySelector('.sql-converter-container')).toBeTruthy();
    expect(container.querySelector('#sql-input')).toBeTruthy();
    expect(container.querySelector('#json-output')).toBeTruthy();
    expect(container.querySelector('#schema-output')).toBeTruthy();
    expect(container.querySelector('#data-preview')).toBeTruthy();
    expect(container.querySelector('#parse-btn')).toBeTruthy();
    expect(container.querySelector('#copy-json-btn')).toBeTruthy();
    expect(container.querySelector('#copy-schema-btn')).toBeTruthy();
    expect(container.querySelector('#download-json-btn')).toBeTruthy();
    expect(container.querySelector('#download-schema-btn')).toBeTruthy();
    expect(container.querySelector('#clear-btn')).toBeTruthy();
  });

  it('render creates tabs for JSON, Schema, and Preview', () => {
    const container = document.createElement('div');
    render(container);
    const tabs = container.querySelectorAll('.tab');
    expect(tabs.length).toBe(3);
    expect(tabs[0].textContent).toContain('JSON Output');
    expect(tabs[1].textContent).toContain('JSON Schema');
    expect(tabs[2].textContent).toContain('Data Preview');
  });

  it('render creates file upload input', () => {
    const container = document.createElement('div');
    render(container);
    const fileInput = container.querySelector('#file-upload');
    expect(fileInput).toBeTruthy();
    expect(fileInput.type).toBe('file');
    expect(fileInput.accept).toContain('.sql');
  });

  it('destroy cleans up without throwing', () => {
    const container = document.createElement('div');
    render(container);
    expect(() => destroy()).not.toThrow();
  });
});