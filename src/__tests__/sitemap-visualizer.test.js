import { describe, it, expect } from 'vitest';
import { toolConfig } from '../tools/dev/sitemap-visualizer.js';

describe('sitemap-visualizer', () => {
  it('has correct toolConfig', () => {
    expect(toolConfig.id).toBe('sitemap-visualizer');
    expect(toolConfig.name).toContain('Sitemap');
    expect(toolConfig.category).toBe('dev');
    expect(toolConfig.icon).toBe('🌳');
    expect(toolConfig.status).toBe('done');
  });

  it('exports render function', async () => {
    const mod = await import('../tools/dev/sitemap-visualizer.js');
    expect(typeof mod.render).toBe('function');
  });
});
