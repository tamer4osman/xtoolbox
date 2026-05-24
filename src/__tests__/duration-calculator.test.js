import { describe, it, expect } from 'vitest';
import { toolConfig } from '../tools/math/duration-calculator.js';

describe('duration-calculator', () => {
  it('has correct config', () => {
    expect(toolConfig.id).toBe('duration-calculator');
    expect(toolConfig.name).toBe('Time Duration Calculator');
    expect(toolConfig.category).toBe('math');
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
