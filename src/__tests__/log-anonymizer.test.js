import { describe, it, expect } from 'vitest';
import { toolConfig, anonymizeLog, render, destroy } from '../tools/dev/log-anonymizer.js';

describe('log-anonymizer', () => {
  it('has correct toolConfig', () => {
    expect(toolConfig.id).toBe('log-anonymizer');
    expect(toolConfig.name).toContain('Log');
    expect(toolConfig.category).toBe('dev');
    expect(toolConfig.icon).toBe('🕵️');
    expect(toolConfig.status).toBe('done');
    expect(toolConfig.keywords.length).toBeGreaterThan(3);
    expect(toolConfig.steps.length).toBeGreaterThan(2);
    expect(toolConfig.faqs.length).toBeGreaterThan(1);
  });

  it('anonymizeLog masks IPv4 addresses', () => {
    const text = 'Request from 192.168.1.1 and 10.0.0.1';
    const { result, found } = anonymizeLog(text, ['ipv4']);
    expect(result).toContain('[IP_V4]');
    expect(result).not.toContain('192.168.1.1');
    expect(result).not.toContain('10.0.0.1');
    expect(found.ipv4).toBe(2);
  });

  it('anonymizeLog masks email addresses', () => {
    const text = 'User email: user@example.com sent a message';
    const { result, found } = anonymizeLog(text, ['email']);
    expect(result).toContain('[EMAIL]');
    expect(result).not.toContain('user@example.com');
    expect(found.email).toBe(1);
  });

  it('anonymizeLog masks API keys and tokens', () => {
    const text = 'api_key=sk_abc123xyz and token: bearer_token_456';
    const { result, found } = anonymizeLog(text, ['apiKey']);
    expect(result).toContain('[API_KEY]');
    expect(result).not.toContain('sk_abc123xyz');
    expect(result).not.toContain('bearer_token_456');
    expect(found.apiKey).toBe(2);
  });

  it('anonymizeLog masks bearer tokens', () => {
    const text = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
    const { result, found } = anonymizeLog(text, ['bearerToken']);
    expect(result).toContain('[BEARER_TOKEN]');
    expect(result).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    expect(found.bearerToken).toBe(1);
  });

  it('anonymizeLog masks database connections', () => {
    const text = 'Connecting to mongodb://admin:pass@localhost:27017/mydb';
    const { result, found } = anonymizeLog(text, ['dbConnection']);
    expect(result).toContain('[DB_CONN]');
    expect(result).not.toContain('mongodb://admin:pass@localhost:27017/mydb');
    expect(found.dbConnection).toBe(1);
  });

  it('anonymizeLog masks multiple data types', () => {
    const text = 'IP: 192.168.1.1, Email: test@example.com, Key: api_key=secret123';
    const { result, found } = anonymizeLog(text);
    expect(result).toContain('[IP_V4]');
    expect(result).toContain('[EMAIL]');
    expect(result).toContain('[API_KEY]');
    expect(found.ipv4).toBe(1);
    expect(found.email).toBe(1);
    expect(found.apiKey).toBe(1);
  });

  it('anonymizeLog returns empty found when no sensitive data', () => {
    const text = 'This is a normal log message with no sensitive data.';
    const { result, found } = anonymizeLog(text);
    expect(result).toBe(text);
    expect(Object.keys(found).length).toBe(0);
  });

  it('render appends content to container', () => {
    const container = document.createElement('div');
    render(container);
    expect(container.querySelector('.anonymizer-container')).toBeTruthy();
    expect(container.querySelector('#log-input')).toBeTruthy();
    expect(container.querySelector('#log-output')).toBeTruthy();
    expect(container.querySelector('#anonymize-btn')).toBeTruthy();
    expect(container.querySelector('#copy-btn')).toBeTruthy();
    expect(container.querySelector('#download-btn')).toBeTruthy();
    expect(container.querySelector('#clear-btn')).toBeTruthy();
  });

  it('render creates checkbox options for all data types', () => {
    const container = document.createElement('div');
    render(container);
    expect(container.querySelector('#mask-ipv4')).toBeTruthy();
    expect(container.querySelector('#mask-ipv6')).toBeTruthy();
    expect(container.querySelector('#mask-email')).toBeTruthy();
    expect(container.querySelector('#mask-apikey')).toBeTruthy();
    expect(container.querySelector('#mask-bearer')).toBeTruthy();
    expect(container.querySelector('#mask-db')).toBeTruthy();
    expect(container.querySelector('#mask-credit')).toBeTruthy();
    expect(container.querySelector('#mask-uuid')).toBeTruthy();
  });

  it('destroy cleans up without throwing', () => {
    const container = document.createElement('div');
    render(container);
    expect(() => destroy()).not.toThrow();
  });
});