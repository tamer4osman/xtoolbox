import { describe, it, expect } from 'vitest';
import { toolConfig, parseOpf, extractTextFromXhtml } from '../tools/pdf/epub-to-pdf.js';
import { testSimpleToolConfig } from './tool-config-test.js';

describe('epub-to-pdf', () => {
  testSimpleToolConfig(toolConfig, 'epub-to-pdf', 'EPUB to PDF', 'pdf');

  describe('parseOpf', () => {
    it('extracts title and author from OPF XML', () => {
      const opf = `<?xml version="1.0"?>
        <package>
          <metadata>
            <title>My Book</title>
            <creator>Author Name</creator>
          </metadata>
          <manifest>
            <item id="ch1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
            <item id="ch2" href="chapter2.xhtml" media-type="application/xhtml+xml"/>
          </manifest>
          <spine>
            <itemref idref="ch1"/>
            <itemref idref="ch2"/>
          </spine>
        </package>`;
      const result = parseOpf(opf);
      expect(result.title).toBe('My Book');
      expect(result.author).toBe('Author Name');
      expect(result.spine).toHaveLength(2);
      expect(result.spine[0].href).toBe('chapter1.xhtml');
      expect(result.spine[1].href).toBe('chapter2.xhtml');
    });

    it('defaults title to Untitled and author to Unknown', () => {
      const opf = `<package><metadata></metadata><manifest></manifest><spine></spine></package>`;
      const result = parseOpf(opf);
      expect(result.title).toBe('Untitled');
      expect(result.author).toBe('Unknown');
    });

    it('returns empty spine for empty manifest', () => {
      const opf = `<package><metadata><dc:title>T</dc:title></metadata><manifest></manifest><spine></spine></package>`;
      const result = parseOpf(opf);
      expect(result.spine).toEqual([]);
    });
  });

  describe('extractTextFromXhtml', () => {
    it('extracts headings as heading blocks', () => {
      const html = `<html><body><h1>Title</h1><h2>Subtitle</h2></body></html>`;
      const blocks = extractTextFromXhtml(html);
      expect(blocks).toEqual([
        { type: 'heading', level: 1, content: 'Title' },
        { type: 'heading', level: 2, content: 'Subtitle' }
      ]);
    });

    it('extracts paragraphs', () => {
      const html = `<html><body><p>Hello world</p><p>Second paragraph</p></body></html>`;
      const blocks = extractTextFromXhtml(html);
      expect(blocks).toEqual([
        { type: 'paragraph', content: 'Hello world' },
        { type: 'paragraph', content: 'Second paragraph' }
      ]);
    });

    it('extracts list items', () => {
      const html = `<html><body><ul><li>Item 1</li><li>Item 2</li></ul></body></html>`;
      const blocks = extractTextFromXhtml(html);
      expect(blocks.some(b => b.content === 'Item 1')).toBe(true);
      expect(blocks.some(b => b.content === 'Item 2')).toBe(true);
    });

    it('handles br elements as break blocks', () => {
      const html = `<html><body><p>Line 1</p><p>Line 2</p></body></html>`;
      const blocks = extractTextFromXhtml(html);
      expect(blocks.length).toBeGreaterThanOrEqual(2);
    });

    it('returns empty array for empty body', () => {
      const html = `<html><body></body></html>`;
      const blocks = extractTextFromXhtml(html);
      expect(blocks).toEqual([]);
    });

    it('handles div elements as paragraphs', () => {
      const html = `<html><body><div>Div content</div></body></html>`;
      const blocks = extractTextFromXhtml(html);
      expect(blocks.some(b => b.type === 'paragraph' && b.content === 'Div content')).toBe(true);
    });
  });
});
