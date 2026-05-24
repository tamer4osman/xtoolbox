import { describe, it, expect } from 'vitest';
import { parseXmlToRows } from '../tools/text/xml-to-excel.js';

describe('xml-to-excel', () => {
  describe('parseXmlToRows', () => {
    it('parses simple XML with repeated rows', () => {
      const xml = `<root>
        <person><name>Alice</name><age>30</age></person>
        <person><name>Bob</name><age>25</age></person>
      </root>`;
      const result = parseXmlToRows(xml);
      expect(result.headers).toEqual(['name', 'age']);
      expect(result.rows).toHaveLength(2);
      expect(result.rows[0]).toEqual({ name: 'Alice', age: '30' });
      expect(result.rows[1]).toEqual({ name: 'Bob', age: '25' });
    });

    it('returns empty arrays for single root element', () => {
      expect(parseXmlToRows('<root/>').rows).toEqual([]);
      expect(parseXmlToRows('<root/>').headers).toEqual([]);
    });

    it('handles rows with varying children', () => {
      const xml = `<data>
        <item><id>1</id><name>X</name></item>
        <item><id>2</id><name>Y</name><extra>Z</extra></item>
      </data>`;
      const result = parseXmlToRows(xml);
      expect(result.headers).toContain('id');
      expect(result.headers).toContain('name');
      expect(result.headers).toContain('extra');
      expect(result.rows[1].extra).toBe('Z');
    });

    it('handles invalid XML gracefully', () => {
      const result = parseXmlToRows('not xml');
      expect(result.rows).toEqual([]);
      expect(result.headers).toEqual([]);
    });
  });
});
