import { describe, it, expect } from 'vitest';
import { toolConfig } from '../tools/productivity/ambient-sound-mixer.js';
import { testSimpleToolConfig } from './tool-config-test.js';

describe('ambient-sound-mixer', () => {
  testSimpleToolConfig(toolConfig, 'ambient-sound-mixer', 'Ambient Focus Soundboard', 'productivity');

  it('exports render function', async () => {
    const mod = await import('../tools/productivity/ambient-sound-mixer.js');
    expect(typeof mod.render).toBe('function');
  });
});
