import { describe, it, expect } from 'vitest';

describe('font-subsetter', () => {
  it('exports toolConfig with correct properties', () => {
    import { toolConfig } from '../src/tools/css/font-subsetter.js';
    expect(toolConfig.id).toBe('font-subsetter');
    expect(toolConfig.name).toBe('Font Subsetter');
    expect(toolConfig.category).toBe('css');
  });
});