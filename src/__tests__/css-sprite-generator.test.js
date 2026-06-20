import { describe, it, expect } from 'vitest';
import { toolConfig } from '../tools/css/css-sprite-generator.js';

describe('css-sprite-generator', () => {
  it('exports toolConfig with correct properties', () => {
    expect(toolConfig.id).toBe('css-sprite-generator');
    expect(toolConfig.name).toBe('CSS Sprite Sheet Generator');
    expect(toolConfig.category).toBe('css');
    expect(toolConfig.icon).toBe('🧩');
  });
});
