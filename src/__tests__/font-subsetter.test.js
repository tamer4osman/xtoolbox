import { describe, it, expect } from 'vitest';

describe('font-subsetter', () => {
  it('exports toolConfig with correct properties', () => {
    const { toolConfig } = require('../src/tools/css/font-subsetter.js');
    expect(toolConfig.id).toBe('font-subsetter');
    expect(toolConfig.name).toBe('Font Subsetter');
    expect(toolConfig.category).toBe('css');
  });
});