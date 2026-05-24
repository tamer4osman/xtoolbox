import { describe, it, expect } from 'vitest';
import { toolConfig } from '../tools/image/image-filters.js';

describe('image-filters', () => {
  it('has correct config', () => {
    expect(toolConfig.id).toBe('image-filters');
    expect(toolConfig.name).toBe('Image Filter Gallery');
    expect(toolConfig.category).toBe('image');
    expect(toolConfig.accept).toBe('image/*');
    expect(toolConfig.keywords.length).toBeGreaterThan(3);
  });

  it('has faqs', () => {
    expect(toolConfig.faqs.length).toBeGreaterThan(1);
    expect(toolConfig.faqs[0].question).toBeTruthy();
    expect(toolConfig.faqs[0].answer).toBeTruthy();
  });

  it('has steps', () => {
    expect(toolConfig.steps.length).toBeGreaterThan(2);
  });
});
