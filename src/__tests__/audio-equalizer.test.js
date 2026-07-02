import { describe, it, expect } from 'vitest';
import { toolConfig } from '../tools/audio/audio-equalizer.js';

describe('audio-equalizer', () => {
  it('has correct tool config', () => {
    expect(toolConfig.id).toBe('audio-equalizer');
    expect(toolConfig.name).toBe('Audio Equalizer');
    expect(toolConfig.category).toBe('audio');
    expect(toolConfig.accept).toBe('audio/*');
    expect(toolConfig.maxSizeMB).toBe(100);
  });

  it('has required keywords', () => {
    expect(toolConfig.keywords).toContain('equalizer');
    expect(toolConfig.keywords).toContain('eq');
    expect(toolConfig.keywords).toContain('spectrum');
  });

  it('has steps and faqs', () => {
    expect(toolConfig.steps.length).toBeGreaterThan(0);
    expect(toolConfig.faqs.length).toBeGreaterThan(0);
  });
});
