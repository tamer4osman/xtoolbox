import { describe, it, expect } from 'vitest';
import { toolConfig } from '../tools/productivity/ambient-sound-mixer.js';

describe('ambient-sound-mixer', () => {
  it('has correct toolConfig', () => {
    expect(toolConfig.id).toBe('ambient-sound-mixer');
    expect(toolConfig.name).toContain('Ambient');
    expect(toolConfig.category).toBe('productivity');
    expect(toolConfig.icon).toBe('🎧');
    expect(toolConfig.status).toBe('done');
  });

  it('exports render function', async () => {
    const mod = await import('../tools/productivity/ambient-sound-mixer.js');
    expect(typeof mod.render).toBe('function');
  });
});
