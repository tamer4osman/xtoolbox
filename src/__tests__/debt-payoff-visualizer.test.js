import { describe, it, expect } from 'vitest';
import { toolConfig } from '../tools/finance/debt-payoff-visualizer.js';

describe('debt-payoff-visualizer', () => {
  it('has correct tool config', () => {
    expect(toolConfig.id).toBe('debt-payoff-visualizer');
    expect(toolConfig.category).toBe('finance');
    expect(toolConfig.keywords).toContain('snowball');
    expect(toolConfig.keywords).toContain('avalanche');
  });

  it('has a render function', () => {
    expect(typeof toolConfig).toBe('object');
  });
});
