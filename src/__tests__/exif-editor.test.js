import { describe, it, expect } from 'vitest';

const FIELDS = {
  '0th': { 271: 'Make', 272: 'Model', 305: 'Software', 306: 'DateTime' },
  'Exif': { 33434: 'ExposureTime', 33437: 'FNumber', 36867: 'DateTimeOriginal', 37386: 'FocalLength' },
  'GPS': { 2: 'GPSLatitudeRef', 3: 'GPSLatitude', 4: 'GPSLongitudeRef', 5: 'GPSLongitude' }
};

function formatValue(ifd, tag, value) {
  if (value === undefined || value === null) return '';
  if (ifd === 'GPS') {
    if (tag === 2 || tag === 4) return value === 'N' || value === 'E' ? 'N/E' : 'S/W';
    if (tag === 3 || tag === 5) {
      if (Array.isArray(value) && value.length === 3) {
        const d = value[0][0] / value[0][1];
        const m = value[1][0] / value[1][1];
        const s = value[2][0] / value[2][1];
        return `${d}° ${m}' ${s}"`;
      }
      return String(value);
    }
  }
  if (Array.isArray(value) && value.length === 2 && typeof value[0] === 'number') {
    return value[1] === 0 ? '0' : `${value[0]}/${value[1]}`;
  }
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

function parseInput(ifd, tag, raw) {
  if (!raw || !raw.trim()) return undefined;
  const val = raw.trim();
  if (ifd === 'GPS') {
    if (tag === 2 || tag === 4) return val.toUpperCase().startsWith('N') || val.toUpperCase().startsWith('E') ? val[0] : 'S';
    if (tag === 3 || tag === 5) {
      const match = val.match(/(\d+)[°d]\s*(\d+)[′']\s*([\d.]+)[″"]/);
      if (match) {
        return [[parseInt(match[1]), 1], [parseInt(match[2]), 1], [Math.round(parseFloat(match[3]) * 100), 100]];
      }
      const num = parseFloat(val);
      if (!isNaN(num)) return [[Math.round(num * 10000), 10000], [0, 1], [0, 1]];
      return undefined;
    }
  }
  if ([33434, 33437, 37377, 37378, 37386].includes(tag)) {
    if (val.includes('/')) {
      const [n, d] = val.split('/').map(Number);
      if (!isNaN(n) && !isNaN(d) && d !== 0) return [n, d];
    }
    const num = parseFloat(val);
    if (!isNaN(num)) return [Math.round(num * 100), 100];
    return undefined;
  }
  return val;
}

describe('exif-editor formatting', () => {
  it('formats GPS DMS coordinates', () => {
    const result = formatValue('GPS', 3, [[48, 1], [51, 1], [2400, 100]]);
    expect(result).toBe("48° 51' 24\"");
  });

  it('formats rational values', () => {
    expect(formatValue('Exif', 33434, [1, 250])).toBe('1/250');
    expect(formatValue('Exif', 33437, [28, 10])).toBe('28/10');
  });

  it('formats GPS ref', () => {
    expect(formatValue('GPS', 2, 'N')).toBe('N/E');
    expect(formatValue('GPS', 2, 'S')).toBe('S/W');
  });

  it('handles undefined values', () => {
    expect(formatValue('Exif', 33434, undefined)).toBe('');
    expect(formatValue('GPS', 3, null)).toBe('');
  });
});

describe('exif-editor parsing', () => {
  it('parses GPS DMS string', () => {
    const result = parseInput('GPS', 3, "48° 51' 24\"");
    expect(result).toEqual([[48, 1], [51, 1], [2400, 100]]);
  });

  it('parses rational string', () => {
    expect(parseInput('Exif', 33434, '1/250')).toEqual([1, 250]);
    expect(parseInput('Exif', 33437, '2.8')).toEqual([280, 100]);
  });

  it('parses GPS ref', () => {
    expect(parseInput('GPS', 2, 'North')).toBe('N');
    expect(parseInput('GPS', 4, 'East')).toBe('E');
    expect(parseInput('GPS', 2, 'South')).toBe('S');
  });

  it('returns undefined for empty input', () => {
    expect(parseInput('Exif', 33434, '')).toBeUndefined();
    expect(parseInput('Exif', 33434, '   ')).toBeUndefined();
  });
});
