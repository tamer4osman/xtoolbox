import { describe, it, expect } from 'vitest';

describe('mock-data-generator', () => {
  it('exports toolConfig with correct properties', () => {
    import { toolConfig } from '../src/tools/dev/mock-data-generator.js';
    expect(toolConfig.id).toBe('mock-data-generator');
    expect(toolConfig.name).toBe('Mock Data Generator');
    expect(toolConfig.category).toBe('dev');
  });
});