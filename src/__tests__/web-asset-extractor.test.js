import { describe, it, expect } from 'vitest';
import { toolConfig } from '../tools/dev/web-asset-extractor.js';

describe('web-asset-extractor', () => {
  it('has correct toolConfig', () => {
    expect(toolConfig.id).toBe('web-asset-extractor');
    expect(toolConfig.name).toContain('Asset');
    expect(toolConfig.category).toBe('dev');
    expect(toolConfig.icon).toBe('📦');
    expect(toolConfig.status).toBe('done');
  });

  it('exports render function', async () => {
    const mod = await import('../tools/dev/web-asset-extractor.js');
    expect(typeof mod.render).toBe('function');
  });
});
