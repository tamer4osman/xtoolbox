import { describe, it, expect } from 'vitest';
import { splitCsvData, generateCsvText } from '../tools/text/csv-splitter.js';

describe('csv-splitter', () => {
  describe('splitCsvData', () => {
    const data = [
      { name: 'A', val: '1' },
      { name: 'B', val: '2' },
      { name: 'C', val: '3' },
      { name: 'D', val: '4' },
      { name: 'E', val: '5' },
    ];

    it('splits into chunks of given size', () => {
      const chunks = splitCsvData(data, 2);
      expect(chunks).toHaveLength(3);
      expect(chunks[0]).toHaveLength(2);
      expect(chunks[1]).toHaveLength(2);
      expect(chunks[2]).toHaveLength(1);
    });

    it('returns single chunk if size >= data length', () => {
      const chunks = splitCsvData(data, 10);
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toHaveLength(5);
    });

    it('returns empty array for empty data', () => {
      expect(splitCsvData([], 5)).toEqual([]);
    });
  });

  describe('generateCsvText', () => {
    it('generates CSV with headers and rows', () => {
      const csv = generateCsvText(['name', 'age'], [
        { name: 'Alice', age: '30' },
        { name: 'Bob', age: '25' },
      ]);
      expect(csv).toBe('name,age\nAlice,30\nBob,25');
    });

    it('escapes commas and quotes', () => {
      const csv = generateCsvText(['note'], [
        { note: 'hello, world' },
        { note: 'say "hi"' },
      ]);
      expect(csv).toContain('"hello, world"');
      expect(csv).toContain('"say ""hi"""');
    });
  });
});
