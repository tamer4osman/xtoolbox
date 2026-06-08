import { describe, it, expect } from 'vitest';
import { jsonToCsv } from '../tools/text/json-csv.js';

describe('json-csv: jsonToCsv', () => {
  it('handles empty array', () => {
    expect(jsonToCsv([])).toBe('');
  });

  it('converts single object to one row', () => {
    const json = [{ name: 'Alice', age: 30 }];
    const csv = jsonToCsv(json);
    expect(csv).toBe('name,age\nAlice,30');
  });

  it('converts multiple objects to rows', () => {
    const json = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 }
    ];
    const csv = jsonToCsv(json);
    expect(csv).toBe('name,age\nAlice,30\nBob,25');
  });

  it('wraps values containing commas in quotes', () => {
    const json = [{ name: 'Smith, John', city: 'New York, NY' }];
    const csv = jsonToCsv(json);
    expect(csv).toBe('name,city\n"Smith, John","New York, NY"');
  });

  it('escapes double quotes in values', () => {
    const json = [{ name: 'John "The Boss" Doe' }];
    const csv = jsonToCsv(json);
    expect(csv).toBe('name\n"John ""The Boss"" Doe"');
  });

  it('wraps values containing newlines in quotes', () => {
    const json = [{ address: '123 Main St\nApt 4' }];
    const csv = jsonToCsv(json);
    expect(csv).toBe('address\n"123 Main St\nApt 4"');
  });

  it('handles null values as empty string', () => {
    const json = [{ name: 'Alice', age: null }];
    const csv = jsonToCsv(json);
    expect(csv).toBe('name,age\nAlice,');
  });

  it('handles undefined values as empty string', () => {
    const json = [{ name: 'Bob', age: undefined }];
    const csv = jsonToCsv(json);
    expect(csv).toBe('name,age\nBob,');
  });

  it('wraps single object in array', () => {
    const single = { name: 'Alice', age: 30 };
    const csv = jsonToCsv(single);
    expect(csv).toBe('name,age\nAlice,30');
  });
});