import { describe, it, expect } from 'vitest';
import { toolConfig } from '../tools/dev/web-asset-extractor.js';
import { testSimpleToolConfig } from './tool-config-test.js';

describe('web-asset-extractor', () => {
  testSimpleToolConfig(toolConfig, 'web-asset-extractor', toolConfig.name, 'dev');

  it('has icon and status', () => {
    expect(toolConfig.icon).toBe('📦');
    expect(toolConfig.status).toBe('done');
  });

  it('exports render function', async () => {
    const mod = await import('../tools/dev/web-asset-extractor.js');
    expect(typeof mod.render).toBe('function');
  });
});
