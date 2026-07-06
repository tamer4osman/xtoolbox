import { describe, it, expect } from 'vitest';
import { convertSheetToXml } from '../tools/text/excel-to-xml.js';

function makeRows(objects) {
  if (objects.length === 0) return [];
  const headers = Object.keys(objects[0]);
  const headerRow = headers.map(h => h);
  const dataRows = objects.map(obj => headers.map(h => obj[h] != null ? obj[h] : ''));
  return [headerRow, ...dataRows];
}

describe('excel-to-xml', () => {
  describe('convertSheetToXml', () => {
    it('converts a simple sheet to XML', () => {
      const rows = makeRows([{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }]);
      const xml = convertSheetToXml(rows);
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<root>');
      expect(xml).toContain('</root>');
      expect(xml).toContain('<name>Alice</name>');
      expect(xml).toContain('<age>30</age>');
      expect(xml).toContain('<name>Bob</name>');
    });

    it('returns <root/> for empty sheet', () => {
      expect(convertSheetToXml([])).toBe('<root/>');
    });

    it('escapes XML special characters', () => {
      const rows = makeRows([{ note: 'a < b & c > d' }]);
      const xml = convertSheetToXml(rows);
      expect(xml).toContain('&lt;');
      expect(xml).toContain('&amp;');
      expect(xml).toContain('&gt;');
      expect(xml).not.toContain('<note>a < b');
    });

    it('sanitizes header names for XML tags', () => {
      const rows = makeRows([{ 'full-name': 'Alice', 'age.yrs': 30 }]);
      const xml = convertSheetToXml(rows);
      expect(xml).toContain('<full-name>');
      expect(xml).toContain('<age_yrs>');
    });
  });
});
