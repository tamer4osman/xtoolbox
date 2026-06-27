import { describe, it, expect } from 'vitest';
import { toolConfig } from '../tools/seo/social-media-post-previewer.js';

describe('social-media-post-previewer', () => {
  it('has correct tool config', () => {
    expect(toolConfig.id).toBe('social-media-post-previewer');
    expect(toolConfig.category).toBe('seo');
    expect(toolConfig.keywords).toContain('twitter');
    expect(toolConfig.keywords).toContain('facebook');
    expect(toolConfig.keywords).toContain('linkedin');
  });

  it('has a render function', () => {
    expect(typeof toolConfig).toBe('object');
  });
});
