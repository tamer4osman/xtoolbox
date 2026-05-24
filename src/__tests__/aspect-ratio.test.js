import { describe, it, expect } from 'vitest';
import { toolConfig } from '../tools/math/aspect-ratio.js';

describe('aspect-ratio', () => {
  it('has correct config', () => {
    expect(toolConfig.id).toBe('aspect-ratio');
    expect(toolConfig.name).toBe('Aspect Ratio Calculator');
    expect(toolConfig.category).toBe('math');
    expect(toolConfig.keywords.length).toBeGreaterThan(3);
  });

  it('has faqs and steps', () => {
    expect(toolConfig.faqs.length).toBeGreaterThan(1);
    expect(toolConfig.steps.length).toBeGreaterThan(2);
  });
});
