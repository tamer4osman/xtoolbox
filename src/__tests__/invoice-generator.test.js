import { describe, it, expect } from 'vitest';
import { toolConfig, render } from '../tools/business/invoice-generator.js';

describe('invoice-generator', () => {
  it('exports toolConfig with correct id', () => {
    expect(toolConfig.id).toBe('invoice-generator');
  });

  it('exports render function', () => {
    expect(typeof render).toBe('function');
  });
});