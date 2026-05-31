import { describe, it, expect } from 'vitest';
import { toolConfig } from '../tools/dev/security-headers-generator.js';

describe('security-headers-generator', () => {
  it('has correct toolConfig', () => {
    expect(toolConfig.id).toBe('security-headers-generator');
    expect(toolConfig.name).toContain('Security');
    expect(toolConfig.category).toBe('dev');
    expect(toolConfig.icon).toBe('🛡️');
    expect(toolConfig.status).toBe('done');
  });

  it('exports render function', async () => {
    const mod = await import('../tools/dev/security-headers-generator.js');
    expect(typeof mod.render).toBe('function');
  });
});
