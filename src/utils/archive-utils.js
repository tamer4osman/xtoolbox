const LOCAL_FILE_HEADER = 'PK\x03\x04';
const CENTRAL_DIRECTORY_END = 'PK\x05\x06';

export function findLocalFileHeaders(data) {
  const headers = [];
  const view = new Uint8Array(data);
  const sigBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);

  for (let i = 0; i <= view.length - 30; i++) {
    if (view[i] === sigBytes[0] && view[i + 1] === sigBytes[1] &&
        view[i + 2] === sigBytes[2] && view[i + 3] === sigBytes[3]) {
      const header = parseLocalFileHeader(view, i);
      if (header) {
        headers.push(header);
        i += 30 + header.fileNameLength + header.extraFieldLength - 1;
      }
    }
  }
  return headers;
}

export function parseLocalFileHeader(view, offset) {
  if (offset + 30 > view.length) return null;

  const sig = String.fromCharCode(view[offset], view[offset + 1], view[offset + 2], view[offset + 3]);
  if (sig !== LOCAL_FILE_HEADER) return null;

  const versionNeeded = view[offset + 4] | (view[offset + 5] << 8);
  const flags = view[offset + 6] | (view[offset + 7] << 8);
  const compressionMethod = view[offset + 8] | (view[offset + 9] << 8);
  const lastModTime = view[offset + 10] | (view[offset + 11] << 8);
  const lastModDate = view[offset + 12] | (view[offset + 13] << 8);
  const crc32 = view[offset + 14] | (view[offset + 15] << 8) |
                (view[offset + 16] << 16) | ((view[offset + 17] << 24) >>> 0);
  const compressedSize = view[offset + 18] | (view[offset + 19] << 8) |
                         (view[offset + 20] << 16) | ((view[offset + 21] << 24) >>> 0);
  const uncompressedSize = view[offset + 22] | (view[offset + 23] << 8) |
                           (view[offset + 24] << 16) | ((view[offset + 25] << 24) >>> 0);
  const fileNameLength = view[offset + 26] | (view[offset + 27] << 8);
  const extraFieldLength = view[offset + 28] | (view[offset + 29] << 8);

  if (fileNameLength > 65535 || fileNameLength < 0) return null;
  if (offset + 30 + fileNameLength > view.length) return null;

  let fileName = '';
  for (let j = 0; j < fileNameLength; j++) {
    fileName += String.fromCharCode(view[offset + 30 + j]);
  }

  const dataStart = offset + 30 + fileNameLength + extraFieldLength;
  const dataEnd = dataStart + compressedSize;

  return {
    offset,
    versionNeeded,
    flags,
    compressionMethod,
    lastModTime,
    lastModDate,
    crc32,
    compressedSize,
    uncompressedSize,
    fileNameLength,
    extraFieldLength,
    fileName,
    dataStart,
    dataEnd
  };
}

export function extractEntryData(view, header) {
  if (header.dataEnd > view.length) return null;
  return view.slice(header.dataStart, header.dataEnd);
}

export function formatZipDate(time, date) {
  const seconds = (time & 0x1f) * 2;
  const minutes = (time >> 5) & 0x3f;
  const hours = (time >> 11) & 0x1f;
  const day = (date & 0x1f) || 1;
  const month = ((date >> 5) & 0x0f) || 1;
  const year = ((date >> 9) & 0x7f) + 1980;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function getCompressionMethodName(method) {
  const methods = { 0: 'Stored', 1: 'Shrunk', 2: 'Reduced', 3: 'Imploded', 8: 'Deflated', 9: 'Deflate64' };
  return methods[method] || `Method ${method}`;
}

export function isDirectory(header) {
  return header.fileName.endsWith('/') && header.uncompressedSize === 0;
}

export function hasDataDescriptor(header) {
  return (header.flags & 0x08) !== 0;
}
