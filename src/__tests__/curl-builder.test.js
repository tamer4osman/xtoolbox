import { describe, it, expect } from 'vitest';
import { toolConfig } from '../tools/dev/curl-builder.js';

describe('curl-builder', () => {
  it('has correct config', () => {
    expect(toolConfig.id).toBe('curl-builder');
    expect(toolConfig.name).toBe('cURL Command Builder');
    expect(toolConfig.category).toBe('dev');
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
