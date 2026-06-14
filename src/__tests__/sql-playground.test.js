import { describe, it, expect } from 'vitest';

describe('sql-playground', () => {
  it('exports toolConfig with correct properties', () => {
    import { toolConfig } from '../src/tools/dev/sql-playground.js';
    expect(toolConfig.id).toBe('sql-playground');
    expect(toolConfig.name).toBe('SQL Playground');
    expect(toolConfig.category).toBe('dev');
  });
});