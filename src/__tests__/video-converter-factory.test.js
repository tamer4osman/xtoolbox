import { describe, it, expect } from 'vitest';

describe('video-converter-factory', () => {
  it('exports createVideoConverter function', async () => {
    const module = await import('../tools/video/video-converter-factory.js');
    expect(typeof module.createVideoConverter).toBe('function');
  });
});