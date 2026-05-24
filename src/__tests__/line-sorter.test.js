import { describe, it, expect } from 'vitest';
import { toolConfig } from '../tools/text/line-sorter.js';

describe('line-sorter', () => {
  it('has correct config', () => {
    expect(toolConfig.id).toBe('line-sorter');
    expect(toolConfig.name).toBe('Text Line Sorter');
    expect(toolConfig.category).toBe('text');
    expect(toolConfig.keywords.length).toBeGreaterThan(3);
  });

  it('has faqs and steps', () => {
    expect(toolConfig.faqs.length).toBeGreaterThan(1);
    expect(toolConfig.steps.length).toBeGreaterThan(2);
  });
});
