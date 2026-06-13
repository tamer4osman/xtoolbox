import { describe, it, expect } from 'vitest';
import { toolConfig, generateSchema, render, destroy } from '../tools/dev/sql-to-json.js';
import { testToolConfig, testRenderAndDestroy } from './tool-config-test.js';

describe('sql-to-json', () => {
  testToolConfig(toolConfig, {
    id: 'sql-to-json',
    name: 'SQL to JSON & Schema Converter',
    category: 'dev'
  });

  it('has icon and status', () => {
    expect(toolConfig.icon).toBe('🗃️');
    expect(toolConfig.status).toBe('done');
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

  testRenderAndDestroy(render, destroy, [
    '.sql-converter-container',
    '#sql-input',
    '#json-output',
    '#schema-output',
    '#data-preview',
    '#parse-btn',
    '#copy-json-btn',
    '#copy-schema-btn',
    '#download-json-btn',
    '#download-schema-btn',
    '#clear-btn'
  ]);

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
});