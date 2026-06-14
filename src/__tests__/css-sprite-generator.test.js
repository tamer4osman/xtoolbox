import { describe, it, expect } from 'vitest';

describe('css-sprite-generator', () => {
  it('exports toolConfig with correct properties', () => {
    import { toolConfig } from '../src/tools/css/css-sprite-generator.js';
    expect(toolConfig.id).toBe('css-sprite-generator');
    expect(toolConfig.name).toBe('CSS Sprite Sheet Generator');
    expect(toolConfig.category).toBe('css');
    expect(toolConfig.icon).toBe('🧩');
  });
});