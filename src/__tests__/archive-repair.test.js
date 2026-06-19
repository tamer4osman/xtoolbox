import { describe, it, expect } from 'vitest';
import { toolConfig } from '../tools/productivity/archive-repair.js';
import { testSimpleToolConfig } from './tool-config-test.js';
import {
  findLocalFileHeaders,
  parseLocalFileHeader,
  extractEntryData,
  formatZipDate,
  getCompressionMethodName,
  isDirectory,
  hasDataDescriptor
} from '../utils/archive-utils.js';

function buildLocalFileHeader(overrides = {}) {
  const defaults = {
    versionNeeded: 20,
    flags: 0,
    compressionMethod: 8,
    lastModTime: 0x5820,
    lastModDate: 0x5249,
    crc32: 0x12345678,
    compressedSize: 10,
    uncompressedSize: 20,
    fileName: 'test.txt',
    extraFieldLength: 0,
    data: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  };
  const cfg = { ...defaults, ...overrides };
  const nameBytes = new TextEncoder().encode(cfg.fileName);
  const buf = new ArrayBuffer(30 + nameBytes.length + cfg.extraFieldLength + cfg.data.length);
  const view = new Uint8Array(buf);

  const dv = new DataView(buf);
  dv.setUint32(0, 0x04034b50, true);
  dv.setUint16(4, cfg.versionNeeded, true);
  dv.setUint16(6, cfg.flags, true);
  dv.setUint16(8, cfg.compressionMethod, true);
  dv.setUint16(10, cfg.lastModTime, true);
  dv.setUint16(12, cfg.lastModDate, true);
  dv.setUint32(14, cfg.crc32 >>> 0, true);
  dv.setUint32(18, cfg.compressedSize, true);
  dv.setUint32(22, cfg.uncompressedSize, true);
  dv.setUint16(26, nameBytes.length, true);
  dv.setUint16(28, cfg.extraFieldLength, true);

  view.set(nameBytes, 30);
  view.set(cfg.data, 30 + nameBytes.length);

  return buf;
}

describe('archive-repair tool config', () => {
  testSimpleToolConfig(toolConfig, 'archive-repair', 'Archive Repair & Recovery', 'productivity');
});

describe('parseLocalFileHeader', () => {
  it('parses a valid header', () => {
    const buf = buildLocalFileHeader({ fileName: 'hello.txt', compressionMethod: 0, compressedSize: 5, uncompressedSize: 5 });
    const result = parseLocalFileHeader(new Uint8Array(buf), 0);
    expect(result).not.toBeNull();
    expect(result.fileName).toBe('hello.txt');
    expect(result.compressionMethod).toBe(0);
    expect(result.compressedSize).toBe(5);
    expect(result.uncompressedSize).toBe(5);
    expect(result.dataStart).toBe(30 + 9);
    expect(result.dataEnd).toBe(30 + 9 + 5);
  });

  it('returns null for invalid signature', () => {
    const buf = new ArrayBuffer(30);
    const view = new Uint8Array(buf);
    view[0] = 0x00; view[1] = 0x00; view[2] = 0x00; view[3] = 0x00;
    const result = parseLocalFileHeader(view, 0);
    expect(result).toBeNull();
  });

  it('returns null when buffer too short', () => {
    const view = new Uint8Array(10);
    const result = parseLocalFileHeader(view, 0);
    expect(result).toBeNull();
  });

  it('handles extra field data', () => {
    const buf = buildLocalFileHeader({ fileName: 'a.txt', extraFieldLength: 6 });
    const result = parseLocalFileHeader(new Uint8Array(buf), 0);
    expect(result).not.toBeNull();
    expect(result.extraFieldLength).toBe(6);
    expect(result.dataStart).toBe(30 + 5 + 6);
  });
});

describe('findLocalFileHeaders', () => {
  it('finds a single header', () => {
    const buf = buildLocalFileHeader();
    const headers = findLocalFileHeaders(buf);
    expect(headers.length).toBe(1);
    expect(headers[0].fileName).toBe('test.txt');
  });

  it('finds multiple headers', () => {
    const buf1 = buildLocalFileHeader({ fileName: 'a.txt', compressedSize: 3, uncompressedSize: 3, data: new Uint8Array([1, 2, 3]) });
    const buf2 = buildLocalFileHeader({ fileName: 'b.txt', compressedSize: 2, uncompressedSize: 2, data: new Uint8Array([4, 5]) });
    const combined = new Uint8Array(buf1.byteLength + buf2.byteLength);
    combined.set(new Uint8Array(buf1), 0);
    combined.set(new Uint8Array(buf2), buf1.byteLength);
    const headers = findLocalFileHeaders(combined.buffer);
    expect(headers.length).toBe(2);
    expect(headers[0].fileName).toBe('a.txt');
    expect(headers[1].fileName).toBe('b.txt');
  });

  it('returns empty for non-ZIP data', () => {
    const buf = new ArrayBuffer(100);
    const view = new Uint8Array(buf);
    view.fill(0xFF);
    const headers = findLocalFileHeaders(buf);
    expect(headers.length).toBe(0);
  });
});

describe('extractEntryData', () => {
  it('returns correct slice', () => {
    const data = new Uint8Array([10, 20, 30, 40, 50]);
    const header = { dataStart: 2, dataEnd: 5 };
    const result = extractEntryData(data, header);
    expect(result).toEqual(new Uint8Array([30, 40, 50]));
  });

  it('returns null when data extends beyond buffer', () => {
    const data = new Uint8Array(5);
    const header = { dataStart: 3, dataEnd: 10 };
    const result = extractEntryData(data, header);
    expect(result).toBeNull();
  });
});

describe('formatZipDate', () => {
  it('formats date correctly', () => {
    const result = formatZipDate(0x5820, 0x5249);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  it('formats zero date', () => {
    const result = formatZipDate(0, 0);
    expect(result).toBe('1980-01-01 00:00:00');
  });
});

describe('getCompressionMethodName', () => {
  it('returns Stored for 0', () => {
    expect(getCompressionMethodName(0)).toBe('Stored');
  });

  it('returns Deflated for 8', () => {
    expect(getCompressionMethodName(8)).toBe('Deflated');
  });

  it('returns fallback for unknown', () => {
    expect(getCompressionMethodName(99)).toBe('Method 99');
  });
});

describe('isDirectory', () => {
  it('returns true for directory entry', () => {
    expect(isDirectory({ fileName: 'folder/', uncompressedSize: 0 })).toBe(true);
  });

  it('returns false for file entry', () => {
    expect(isDirectory({ fileName: 'file.txt', uncompressedSize: 100 })).toBe(false);
  });
});

describe('hasDataDescriptor', () => {
  it('returns true when flag bit 3 is set', () => {
    expect(hasDataDescriptor({ flags: 0x08 })).toBe(true);
  });

  it('returns false when flag bit 3 is not set', () => {
    expect(hasDataDescriptor({ flags: 0x00 })).toBe(false);
  });
});
