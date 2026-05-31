import { describe, it, expect } from 'vitest';
import { toolConfig } from '../tools/seo/bulk-utm-builder.js';

describe('bulk-utm-builder', () => {
  it('has correct toolConfig', () => {
    expect(toolConfig.id).toBe('bulk-utm-builder');
    expect(toolConfig.name).toContain('UTM');
    expect(toolConfig.category).toBe('seo');
    expect(toolConfig.icon).toBe('🔗');
    expect(toolConfig.status).toBe('done');
  });

  it('exports render function', async () => {
    const mod = await import('../tools/seo/bulk-utm-builder.js');
    expect(typeof mod.render).toBe('function');
  });
});
