import { describe, it, expect } from 'vitest';
import { parseOpenAPI, groupByTag, getMethodColor } from '../tools/dev/openapi-visualizer.js';

describe('openapi-visualizer', () => {
  describe('parseOpenAPI', () => {
    it('parses endpoints from paths', () => {
      const spec = {
        paths: {
          '/users': {
            get: { operationId: 'listUsers', summary: 'List users', tags: ['Users'] },
            post: { operationId: 'createUser', summary: 'Create user', tags: ['Users'] },
          },
        },
      };
      const endpoints = parseOpenAPI(spec);
      expect(endpoints).toHaveLength(2);
      expect(endpoints[0].method).toBe('GET');
      expect(endpoints[1].method).toBe('POST');
    });

    it('defaults tags to Untagged', () => {
      const spec = {
        paths: { '/items': { get: { operationId: 'getItems' } } },
      };
      const endpoints = parseOpenAPI(spec);
      expect(endpoints[0].tags).toEqual(['Untagged']);
    });

    it('handles empty paths', () => {
      expect(parseOpenAPI({})).toEqual([]);
      expect(parseOpenAPI({ paths: {} })).toEqual([]);
    });

    it('skips non-HTTP methods', () => {
      const spec = {
        paths: { '/test': { parameters: [], get: { operationId: 'test' } } },
      };
      const endpoints = parseOpenAPI(spec);
      expect(endpoints).toHaveLength(1);
      expect(endpoints[0].method).toBe('GET');
    });

    it('parses all HTTP methods', () => {
      const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];
      const paths = {};
      methods.forEach((m) => {
        paths['/test'] = paths['/test'] || {};
        paths['/test'][m] = { operationId: m };
      });
      const endpoints = parseOpenAPI({ paths });
      expect(endpoints).toHaveLength(7);
    });
  });

  describe('groupByTag', () => {
    it('groups endpoints by tag', () => {
      const endpoints = [
        { path: '/a', method: 'GET', tags: ['Users'] },
        { path: '/b', method: 'GET', tags: ['Users'] },
        { path: '/c', method: 'GET', tags: ['Items'] },
      ];
      const groups = groupByTag(endpoints);
      expect(Object.keys(groups)).toEqual(['Users', 'Items']);
      expect(groups['Users']).toHaveLength(2);
      expect(groups['Items']).toHaveLength(1);
    });

    it('handles endpoints with multiple tags', () => {
      const endpoints = [{ path: '/a', method: 'GET', tags: ['Admin', 'Users'] }];
      const groups = groupByTag(endpoints);
      expect(groups['Admin']).toHaveLength(1);
      expect(groups['Users']).toHaveLength(1);
    });

    it('returns empty object for empty input', () => {
      expect(groupByTag([])).toEqual({});
    });
  });

  describe('getMethodColor', () => {
    it('returns correct color for GET', () => {
      expect(getMethodColor('GET')).toBe('#61affe');
    });

    it('returns correct color for POST', () => {
      expect(getMethodColor('POST')).toBe('#49cc90');
    });

    it('returns correct color for DELETE', () => {
      expect(getMethodColor('DELETE')).toBe('#f93e3e');
    });

    it('returns default color for unknown method', () => {
      expect(getMethodColor('UNKNOWN')).toBe('#999');
    });

    it('returns correct color for PUT', () => {
      expect(getMethodColor('PUT')).toBe('#fca130');
    });
  });
});
