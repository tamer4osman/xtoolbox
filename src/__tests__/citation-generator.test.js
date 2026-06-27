import { describe, it, expect } from 'vitest';

function formatAPA(d) {
  const a = d.author?.trim() || '';
  const y = d.year?.trim() || '';
  const t = d.title?.trim() || '';
  if (d.sourceType === 'book') return `${a} (${y}). _${t}_. ${d.publisher?.trim() || ''}.`;
  if (d.sourceType === 'website') return `${a} (${y}). ${t}.`;
  let r = `${a} (${y}). ${t}. _${d.journal?.trim() || ''}_`;
  if (d.volume) r += `, _${d.volume.trim()}_`;
  if (d.issue) r += `(${d.issue.trim()})`;
  if (d.pages) r += `, ${d.pages.trim()}`;
  r += '.';
  if (d.doi) r += ` https://doi.org/${d.doi.trim()}`;
  return r;
}

function formatMLA(d) {
  const a = (d.author?.trim() || '').replace(/\.$/, '');
  const t = d.title?.trim() || '';
  const y = d.year?.trim() || '';
  if (d.sourceType === 'book') return `${a}. _${t}_. ${d.publisher?.trim() || ''}, ${y}.`;
  if (d.sourceType === 'website') return `${a}. "${t}." ${d.url?.trim() || ''}.`;
  let r = `${a}. "${t}." _${d.journal?.trim() || ''}_`;
  if (d.volume) r += `, vol. ${d.volume.trim()}`;
  r += `, ${y}`;
  if (d.pages) r += `, pp. ${d.pages.trim()}`;
  r += '.';
  return r;
}

function formatChicago(d) {
  const a = d.author?.trim() || '';
  const t = d.title?.trim() || '';
  const y = d.year?.trim() || '';
  if (d.sourceType === 'book') return `${a}. _${t}_. ${d.publisher?.trim() || ''}, ${y}.`;
  let r = `${a}. "${t}." _${d.journal?.trim() || ''}_`;
  if (d.volume) r += ` ${d.volume.trim()}`;
  r += ` (${y})`;
  if (d.pages) r += `: ${d.pages.trim()}`;
  r += '.';
  return r;
}

describe('citation-generator APA', () => {
  it('formats journal article', () => {
    const result = formatAPA({ author: 'Smith, J.', year: '2024', title: 'Test Article', journal: 'Test Journal', volume: '10', issue: '2', pages: '1-10', sourceType: 'journal' });
    expect(result).toContain('Smith, J. (2024).');
    expect(result).toContain('_Test Journal_');
    expect(result).toContain(', _10_');
    expect(result).toContain('(2)');
    expect(result).toContain(', 1-10.');
  });

  it('formats book', () => {
    const result = formatAPA({ author: 'Doe, A.', year: '2023', title: 'Test Book', publisher: 'Academic Press', sourceType: 'book' });
    expect(result).toBe('Doe, A. (2023). _Test Book_. Academic Press.');
  });

  it('formats website', () => {
    const result = formatAPA({ author: 'Writer, B.', year: '2024', title: 'Page Title', sourceType: 'website' });
    expect(result).toBe('Writer, B. (2024). Page Title.');
  });
});

describe('citation-generator MLA', () => {
  it('formats journal article', () => {
    const result = formatMLA({ author: 'Smith, J.', year: '2024', title: 'Test Article', journal: 'Test Journal', volume: '10', pages: '1-10', sourceType: 'journal' });
    expect(result).toContain('Smith, J.');
    expect(result).toContain('"Test Article."');
    expect(result).toContain('vol. 10');
    expect(result).toContain('pp. 1-10');
  });

  it('formats book', () => {
    const result = formatMLA({ author: 'Doe, A.', year: '2023', title: 'Test Book', publisher: 'Academic Press', sourceType: 'book' });
    expect(result).toBe('Doe, A. _Test Book_. Academic Press, 2023.');
  });
});

describe('citation-generator Chicago', () => {
  it('formats journal article', () => {
    const result = formatChicago({ author: 'Smith, J.', year: '2024', title: 'Test Article', journal: 'Test Journal', volume: '10', pages: '1-10', sourceType: 'journal' });
    expect(result).toContain('Smith, J.');
    expect(result).toContain('"Test Article."');
    expect(result).toContain('(2024)');
    expect(result).toContain(': 1-10.');
  });
});
