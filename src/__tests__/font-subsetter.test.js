import { describe, it, expect } from 'vitest';
import { toolConfig } from '../tools/css/font-subsetter.js';

describe('font-subsetter', () => {
  it('exports toolConfig with correct properties', () => {
    expect(toolConfig.id).toBe('font-subsetter');
    expect(toolConfig.name).toBe('Font Subsetter');
    expect(toolConfig.category).toBe('css');
  });
});
