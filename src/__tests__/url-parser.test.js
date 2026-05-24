import { describe, it, expect } from 'vitest';
import { parseUrl, buildUrl, toolConfig } from '../tools/dev/url-parser.js';

describe('url-parser', () => {
  describe('parseUrl', () => {
    it('parses basic URL', () => {
      const r = parseUrl('https://example.com/path');
      expect(r.valid).toBe(true);
      expect(r.protocol).toBe('https');
      expect(r.hostname).toBe('example.com');
      expect(r.pathname).toBe('/path');
    });

    it('parses URL with query params', () => {
      const r = parseUrl('https://example.com/search?q=hello&page=1');
      expect(r.params).toEqual({ q: 'hello', page: '1' });
    });

    it('parses URL with hash', () => {
      const r = parseUrl('https://example.com/page#section');
      expect(r.hash).toBe('section');
    });

    it('parses URL with port', () => {
      const r = parseUrl('http://localhost:3000/api');
      expect(r.port).toBe('3000');
      expect(r.host).toBe('localhost:3000');
    });

    it('returns invalid for bad URL', () => {
      expect(parseUrl('not a url').valid).toBe(false);
      expect(parseUrl('').valid).toBe(false);
    });
  });

  describe('buildUrl', () => {
    it('builds basic URL', () => {
      expect(buildUrl({ protocol: 'https', hostname: 'example.com', pathname: '/api' }))
        .toBe('https://example.com/api');
    });

    it('builds URL with params', () => {
      expect(buildUrl({ protocol: 'https', hostname: 'example.com', params: { q: 'test', page: '2' } }))
        .toBe('https://example.com/?q=test&page=2');
    });

    it('builds URL with hash', () => {
      expect(buildUrl({ protocol: 'https', hostname: 'example.com', pathname: '/page', hash: 'top' }))
        .toBe('https://example.com/page#top');
    });
  });

  it('has correct config', () => {
    expect(toolConfig.id).toBe('url-parser');
    expect(toolConfig.category).toBe('dev');
    expect(toolConfig.keywords.length).toBeGreaterThan(3);
  });
});
