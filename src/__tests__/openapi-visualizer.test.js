import { describe, it, expect } from 'vitest';
import { parseOpenAPI, groupByTag, getMethodColor, parseYAML, parseSpecText, escapeHtml } from '../tools/dev/openapi-visualizer.js';

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

    it('defaults empty tags array to Untagged', () => {
      const spec = {
        paths: { '/items': { get: { operationId: 'getItems', tags: [] } } },
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

  describe('parseYAML', () => {
    it('parses simple key-value pairs', () => {
      const yaml = 'name: test\nversion: "1.0"';
      const result = parseYAML(yaml);
      expect(result.name).toBe('test');
      expect(result.version).toBe('1.0');
    });

    it('parses nested objects', () => {
      const yaml = 'info:\n  title: My API\n  version: 1.0.0';
      const result = parseYAML(yaml);
      expect(result.info.title).toBe('My API');
      expect(result.info.version).toBe('1.0.0');
    });

    it('parses arrays', () => {
      const yaml = 'tags:\n  - Users\n  - Items';
      const result = parseYAML(yaml);
      expect(result).toEqual({ tags: ['Users', 'Items'] });
    });

    it('parses booleans and null', () => {
      const yaml = 'enabled: true\ndisabled: false\nvalue: null';
      const result = parseYAML(yaml);
      expect(result.enabled).toBe(true);
      expect(result.disabled).toBe(false);
      expect(result.value).toBe(null);
    });

    it('parses numbers', () => {
      const yaml = 'count: 42\npi: 3.14';
      const result = parseYAML(yaml);
      expect(result.count).toBe(42);
      expect(result.pi).toBeCloseTo(3.14);
    });

    it('skips comments and blank lines', () => {
      const yaml = '# comment\nname: test\n\n# another comment';
      const result = parseYAML(yaml);
      expect(result.name).toBe('test');
    });
  });

  describe('parseSpecText', () => {
    it('parses JSON input', () => {
      const json = '{"openapi": "3.0.0", "info": {"title": "Test"}}';
      const result = parseSpecText(json);
      expect(result.openapi).toBe('3.0.0');
      expect(result.info.title).toBe('Test');
    });

    it('parses YAML input', () => {
      const yaml = 'openapi: "3.0.0"\ninfo:\n  title: Test';
      const result = parseSpecText(yaml);
      expect(result.openapi).toBe('3.0.0');
      expect(result.info.title).toBe('Test');
    });
  });

  describe('escapeHtml', () => {
    it('escapes ampersands', () => {
      expect(escapeHtml('a&b')).toBe('a&amp;b');
    });

    it('escapes angle brackets', () => {
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    });

    it('escapes quotes', () => {
      expect(escapeHtml('"hello\'')).toBe('&quot;hello&#39;');
    });

    it('handles null/undefined', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });
  });
});
