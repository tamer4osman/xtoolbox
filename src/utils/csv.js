export function parseCSV(text) {
  if (text == null) return [];
  const raw = String(text).replace(/\r\n?/g, "\n");
  if (raw.length === 0) return [];

  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (inQuotes) {
      if (c === '"') {
        if (raw[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += c;
      }
    } else {
      if (c === '"' && cell.length === 0) {
        inQuotes = true;
      } else if (c === '"' && /[",]/.test(raw[i + 1] || "")) {
        inQuotes = false;
      } else if (c === ",") {
        row.push(cell.trim());
        cell = "";
      } else if (c === "\n") {
        row.push(cell.trim());
        rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += c;
      }
    }
  }

  if (cell || row.length > 0) {
    row.push(cell.trim());
    if (row.some(c => c)) rows.push(row);
  }

  return rows;
}
