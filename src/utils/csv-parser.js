/**
 * Shared CSV utilities for parsing, generating, and splitting CSV data.
 */

export function escapeCsvValue(v) {
  const s = v == null ? '' : String(v);
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
}

export function generateCsvText(headers, rows) {
  const headerLine = headers.map(escapeCsvValue).join(',');
  const bodyLines = rows.map(r => headers.map(h => escapeCsvValue(r[h])).join(','));
  return headerLine + '\n' + bodyLines.join('\n');
}

export function splitCsvData(data, rowsPerFile) {
  const files = [];
  for (let i = 0; i < data.length; i += rowsPerFile) {
    files.push(data.slice(i, i + rowsPerFile));
  }
  return files;
}
