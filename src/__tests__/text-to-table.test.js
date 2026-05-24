import { describe, it, expect } from 'vitest';

// Re-import the helper functions by duplicating them for unit testing
function detectDelimiter(text) {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length === 0) return '\t';
  const delimiters = ['\t', ',', '|', ';', '^'];
  const scores = delimiters.map(d => {
    const count = lines.reduce((s, l) => {
      const inQuotes = l.match(/"[^"]*"/g) || [];
      let stripped = l;
      inQuotes.forEach(q => { stripped = stripped.replace(q, ''); });
      return s + (stripped.match(new RegExp(`${d === '\t' ? '\\t' : d === '|' ? '\\|' : d === '^' ? '\\^' : d === ';' ? ';' : ','}`, 'g')) || []).length;
    }, 0);
    return { d, count };
  });
  scores.sort((a, b) => b.count - a.count);
  if (scores[0].count === 0) return '\t';
  return scores[0].d;
}

function parseTable(text, delimiter, hasHeader) {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  const parseLine = line => {
    const result = [];
    let current = '';
    let inQuote = false;
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === delimiter && !inQuote) { result.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    result.push(current.trim());
    return result;
  };
  const parsedLines = lines.map(parseLine);
  const maxCols = Math.max(...parsedLines.map(l => l.length));
  const normalized = parsedLines.map(l => {
    while (l.length < maxCols) l.push('');
    return l;
  });
  if (hasHeader) {
    return { headers: normalized[0], rows: normalized.slice(1) };
  }
  return { headers: normalized[0].map((_, i) => `Column ${i + 1}`), rows: normalized };
}

describe('text-to-table', () => {
  describe('detectDelimiter', () => {
    it('detects tab', () => {
      expect(detectDelimiter('a\tb\tc\n1\t2\t3')).toBe('\t');
    });

    it('detects comma', () => {
      expect(detectDelimiter('a,b,c\n1,2,3')).toBe(',');
    });

    it('detects pipe', () => {
      expect(detectDelimiter('a|b|c\n1|2|3')).toBe('|');
    });

    it('detects semicolon', () => {
      expect(detectDelimiter('a;b;c\n1;2;3')).toBe(';');
    });

    it('returns tab for empty text', () => {
      expect(detectDelimiter('')).toBe('\t');
    });

    it('returns tab for single word', () => {
      expect(detectDelimiter('hello')).toBe('\t');
    });
  });

  describe('parseTable', () => {
    it('parses tab-separated with header', () => {
      const r = parseTable('Name\tAge\nAlice\t30\nBob\t25', '\t', true);
      expect(r.headers).toEqual(['Name', 'Age']);
      expect(r.rows).toEqual([['Alice', '30'], ['Bob', '25']]);
    });

    it('parses comma-separated with header', () => {
      const r = parseTable('Name,Age\nAlice,30\nBob,25', ',', true);
      expect(r.headers).toEqual(['Name', 'Age']);
      expect(r.rows.length).toBe(2);
    });

    it('parses pipe-separated without header', () => {
      const r = parseTable('Alice|30\nBob|25', '|', false);
      expect(r.headers).toEqual(['Column 1', 'Column 2']);
      expect(r.rows.length).toBe(2);
    });

    it('handles quoted values with commas', () => {
      const r = parseTable('Name,City\n"Smith, John",NYC', ',', true);
      expect(r.headers).toEqual(['Name', 'City']);
      expect(r.rows[0][0]).toBe('Smith, John');
    });

    it('returns empty for blank input', () => {
      const r = parseTable('', '\t', true);
      expect(r.headers).toEqual([]);
      expect(r.rows).toEqual([]);
    });

    it('normalizes rows with fewer columns', () => {
      const r = parseTable('A\tB\tC\n1\t2', '\t', true);
      expect(r.rows[0].length).toBe(3);
      expect(r.rows[0][2]).toBe('');
    });
  });
});
