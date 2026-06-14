import { describe, it, expect } from 'vitest';

describe('database-schema-designer', () => {
  it('exports toolConfig with correct properties', () => {
    const { toolConfig } = require('../src/tools/dev/database-schema-designer.js');
    expect(toolConfig.id).toBe('database-schema-designer');
    expect(toolConfig.name).toBe('Database Schema Designer');
    expect(toolConfig.category).toBe('dev');
  });
});