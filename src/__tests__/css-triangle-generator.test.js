import { describe, it, expect } from 'vitest';
import { toolConfig } from '../tools/css/css-triangle-generator.js';

describe('css-triangle-generator', () => {
  it('has correct toolConfig', () => {
    expect(toolConfig.id).toBe('css-triangle-generator');
    expect(toolConfig.name).toContain('Triangle');
    expect(toolConfig.category).toBe('css');
    expect(toolConfig.icon).toBe('🔺');
    expect(toolConfig.status).toBe('done');
  });

  it('exports render function', async () => {
    const mod = await import('../tools/css/css-triangle-generator.js');
    expect(typeof mod.render).toBe('function');
  });
});
