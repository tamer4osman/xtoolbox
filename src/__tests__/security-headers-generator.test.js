import { describe, it, expect } from 'vitest';
import { toolConfig } from '../tools/dev/security-headers-generator.js';
import { testSimpleToolConfig } from './tool-config-test.js';

describe('security-headers-generator', () => {
  testSimpleToolConfig(toolConfig, 'security-headers-generator', toolConfig.name, 'dev');

  it('has icon and status', () => {
    expect(toolConfig.icon).toBe('🛡️');
    expect(toolConfig.status).toBe('done');
  });

  it('exports render function', async () => {
    const mod = await import('../tools/dev/security-headers-generator.js');
    expect(typeof mod.render).toBe('function');
  });
});
