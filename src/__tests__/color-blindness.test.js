import { describe, it, expect } from 'vitest';
import { toolConfig } from '../tools/image/color-blindness.js';

describe('color-blindness', () => {
  it('has correct config', () => {
    expect(toolConfig.id).toBe('color-blindness');
    expect(toolConfig.name).toBe('Color Blindness Simulator');
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
