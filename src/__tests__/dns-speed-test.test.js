import { describe, it, expect } from 'vitest';
import { toolConfig, calcStats } from '../tools/dev/dns-speed-test.js';
import { testSimpleToolConfig } from './tool-config-test.js';

describe('dns-speed-test', () => {
  testSimpleToolConfig(toolConfig, 'dns-speed-test', 'DNS Speed Test', 'dev');
});

describe('calcStats', () => {
  it('calculates average, min, max from ok results', () => {
    const results = [
      { status: 'ok', time: 50 },
      { status: 'ok', time: 100 },
      { status: 'ok', time: 75 },
      { status: 'error', time: 0 }
    ];
    const stats = calcStats(results);
    expect(stats.avg).toBe(75);
    expect(stats.min).toBe(50);
    expect(stats.max).toBe(100);
    expect(stats.count).toBe(3);
  });

  it('returns zeros for empty results', () => {
    const stats = calcStats([]);
    expect(stats).toEqual({ avg: 0, min: 0, max: 0, count: 0 });
  });

  it('returns zeros for all-error results', () => {
    const results = [
      { status: 'error', time: 0 },
      { status: 'error', time: 0 }
    ];
    const stats = calcStats(results);
    expect(stats).toEqual({ avg: 0, min: 0, max: 0, count: 0 });
  });

  it('handles single result', () => {
    const stats = calcStats([{ status: 'ok', time: 42 }]);
    expect(stats.avg).toBe(42);
    expect(stats.min).toBe(42);
    expect(stats.max).toBe(42);
    expect(stats.count).toBe(1);
  });
});
