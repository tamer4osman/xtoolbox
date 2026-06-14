import { describe, it, expect } from 'vitest';

describe('code-screenshot-generator', () => {
  it('exports toolConfig with correct properties', () => {
    const { toolConfig } = require('../src/tools/dev/code-screenshot-generator.js');
    expect(toolConfig.id).toBe('code-screenshot-generator');
    expect(toolConfig.name).toBe('Code Screenshot Generator');
    expect(toolConfig.category).toBe('dev');
  });
});