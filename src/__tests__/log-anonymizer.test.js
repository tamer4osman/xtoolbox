import { describe, it, expect } from 'vitest';
import { toolConfig } from '../tools/dev/log-anonymizer.js';

describe('log-anonymizer', () => {
  it('has correct toolConfig', () => {
    expect(toolConfig.id).toBe('log-anonymizer');
    expect(toolConfig.name).toContain('Log');
    expect(toolConfig.category).toBe('dev');
    expect(toolConfig.icon).toBe('🕵️');
    expect(toolConfig.status).toBe('done');
  });

  it('exports render function', async () => {
    const mod = await import('../tools/dev/log-anonymizer.js');
    expect(typeof mod.render).toBe('function');
  });
});
