import { describe, it, expect } from 'vitest';
import { deepDiff, pathToString, buildPatch } from '../tools/dev/json-diff-viewer.js';

describe('deepDiff', () => {
  it('returns empty for identical primitives', () => {
    expect(deepDiff(1, 1)).toEqual([]);
    expect(deepDiff('a', 'a')).toEqual([]);
    expect(deepDiff(null, null)).toEqual([]);
    expect(deepDiff(true, true)).toEqual([]);
  });

  it('detects changed primitives', () => {
    const d = deepDiff(1, 2);
    expect(d).toHaveLength(1);
    expect(d[0].type).toBe('changed');
    expect(d[0].oldValue).toBe(1);
    expect(d[0].newValue).toBe(2);
  });

  it('detects type mismatch', () => {
    const d = deepDiff(1, '1');
    expect(d).toHaveLength(1);
    expect(d[0].type).toBe('changed');
  });

  it('detects added keys', () => {
    const d = deepDiff({ a: 1 }, { a: 1, b: 2 });
    expect(d).toHaveLength(1);
    expect(d[0].type).toBe('added');
    expect(d[0].path).toEqual(['b']);
    expect(d[0].newValue).toBe(2);
  });

  it('detects removed keys', () => {
    const d = deepDiff({ a: 1, b: 2 }, { a: 1 });
    expect(d).toHaveLength(1);
    expect(d[0].type).toBe('removed');
    expect(d[0].path).toEqual(['b']);
    expect(d[0].oldValue).toBe(2);
  });

  it('detects changed values in objects', () => {
    const d = deepDiff({ x: 1 }, { x: 2 });
    expect(d).toHaveLength(1);
    expect(d[0].type).toBe('changed');
    expect(d[0].path).toEqual(['x']);
  });

  it('handles nested objects', () => {
    const d = deepDiff({ a: { b: 1 } }, { a: { b: 2 } });
    expect(d).toHaveLength(1);
    expect(d[0].path).toEqual(['a', 'b']);
  });

  it('handles arrays by index', () => {
    const d = deepDiff([1, 2, 3], [1, 9, 3]);
    expect(d).toHaveLength(1);
    expect(d[0].path).toEqual(['1']);
    expect(d[0].oldValue).toBe(2);
    expect(d[0].newValue).toBe(9);
  });

  it('detects array length changes', () => {
    const d = deepDiff([1], [1, 2]);
    expect(d).toHaveLength(1);
    expect(d[0].type).toBe('added');
    expect(d[0].path).toEqual(['1']);
  });

  it('handles null vs object', () => {
    const d = deepDiff(null, { a: 1 });
    expect(d).toHaveLength(1);
    expect(d[0].type).toBe('changed');
  });

  it('handles deeply nested changes', () => {
    const a = { a: { b: { c: { d: 1 } } } };
    const b = { a: { b: { c: { d: 2 } } } };
    const d = deepDiff(a, b);
    expect(d).toHaveLength(1);
    expect(d[0].path).toEqual(['a', 'b', 'c', 'd']);
  });
});

describe('pathToString', () => {
  it('joins simple keys with dots', () => {
    expect(pathToString(['a', 'b'])).toBe('a.b');
  });

  it('uses bracket notation for numeric keys', () => {
    expect(pathToString(['a', '0'])).toBe('a[0]');
  });

  it('returns bare key for single segment', () => {
    expect(pathToString(['name'])).toBe('name');
  });

  it('handles mixed segments', () => {
    expect(pathToString(['users', '0', 'name'])).toBe('users[0].name');
  });
});

describe('buildPatch', () => {
  it('builds add operations', () => {
    const changes = [{ type: 'added', path: ['b'], newValue: 2 }];
    const patch = buildPatch(changes);
    expect(patch).toEqual([{ op: 'add', path: '/b', value: 2 }]);
  });

  it('builds remove operations', () => {
    const changes = [{ type: 'removed', path: ['b'], oldValue: 2 }];
    const patch = buildPatch(changes);
    expect(patch).toEqual([{ op: 'remove', path: '/b' }]);
  });

  it('builds replace operations', () => {
    const changes = [{ type: 'changed', path: ['a'], oldValue: 1, newValue: 2 }];
    const patch = buildPatch(changes);
    expect(patch).toEqual([{ op: 'replace', path: '/a', value: 2 }]);
  });

  it('handles nested paths', () => {
    const changes = [{ type: 'changed', path: ['a', 'b', 'c'], oldValue: 1, newValue: 2 }];
    const patch = buildPatch(changes);
    expect(patch[0].path).toBe('/a/b/c');
  });
});
