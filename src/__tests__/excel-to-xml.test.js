import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { convertSheetToXml } from '../tools/text/excel-to-xml.js';

function makeSheet(rows) {
  const ws = XLSX.utils.json_to_sheet(rows);
  return ws;
}

describe('excel-to-xml', () => {
  describe('convertSheetToXml', () => {
    it('converts a simple sheet to XML', () => {
      const sheet = makeSheet([{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }]);
      const xml = convertSheetToXml(sheet);
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<root>');
      expect(xml).toContain('</root>');
      expect(xml).toContain('<name>Alice</name>');
      expect(xml).toContain('<age>30</age>');
      expect(xml).toContain('<name>Bob</name>');
    });

    it('returns <root/> for empty sheet', () => {
      const sheet = XLSX.utils.aoa_to_sheet([]);
      expect(convertSheetToXml(sheet)).toBe('<root/>');
    });

    it('escapes XML special characters', () => {
      const sheet = makeSheet([{ note: 'a < b & c > d' }]);
      const xml = convertSheetToXml(sheet);
      expect(xml).toContain('&lt;');
      expect(xml).toContain('&amp;');
      expect(xml).toContain('&gt;');
      expect(xml).not.toContain('<note>a < b');
    });

    it('sanitizes header names for XML tags', () => {
      const sheet = makeSheet([{ 'full-name': 'Alice', 'age.yrs': 30 }]);
      const xml = convertSheetToXml(sheet);
      expect(xml).toContain('<full-name>');
      expect(xml).toContain('<age_yrs>');
    });
  });
});
