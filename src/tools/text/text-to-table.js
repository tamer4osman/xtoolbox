export const toolConfig = {
  id: "text-to-table",
  name: "Text to Table",
  category: "text",
  description: "Convert delimited text (TSV, CSV, pipe, custom) into formatted HTML tables.",
  icon: "📋",
  status: "done"
};

function detectDelimiter(text) {
  const lines = text
    .trim()
    .split("\n")
    .filter(l => l.trim());
  if (lines.length === 0) return "\t";
  const delimiters = ["\t", ",", "|", ";", "^"];
  const scores = delimiters.map(d => {
    const count = lines.reduce((s, l) => {
      const inQuotes = l.match(/"[^"]*"/g) || [];
      let stripped = l;
      inQuotes.forEach(q => {
        stripped = stripped.replace(q, "");
      });
      return (
        s +
        (
          stripped.match(
            new RegExp(
              `${d === "\t" ? "\\t" : d === "|" ? "\\|" : d === "^" ? "\\^" : d === ";" ? ";" : ","}`,
              "g"
            )
          ) || []
        ).length
      );
    }, 0);
    return { d, count };
  });
  scores.sort((a, b) => b.count - a.count);
  if (scores[0].count === 0) return "\t";
  return scores[0].d;
}

function parseTable(text, delimiter, hasHeader) {
  const lines = text
    .trim()
    .split("\n")
    .filter(l => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  const parseLine = line => {
    const result = [];
    let current = "";
    let inQuote = false;
    for (const ch of line) {
      if (ch === '"') {
        inQuote = !inQuote;
        continue;
      }
      if (ch === delimiter && !inQuote) {
        result.push(current.trim());
        current = "";
        continue;
      }
      current += ch;
    }
    result.push(current.trim());
    return result;
  };
  const parsedLines = lines.map(parseLine);
  const maxCols = Math.max(...parsedLines.map(l => l.length));
  const normalized = parsedLines.map(l => {
    while (l.length < maxCols) l.push("");
    return l;
  });
  if (hasHeader) {
    return { headers: normalized[0], rows: normalized.slice(1) };
  }
  return { headers: normalized[0].map((_, i) => `Column ${i + 1}`), rows: normalized };
}

export function render(container) {
  container.innerHTML = `
    <div class="tt-container">
      <div class="tt-input-section">
        <div class="tt-toolbar">
          <select id="tt-delimiter">
            <option value="auto">Auto-detect</option>
            <option value="\t">Tab (TSV)</option>
            <option value=",">Comma (CSV)</option>
            <option value="|">Pipe</option>
            <option value=";">Semicolon</option>
            <option value="^">Caret</option>
          </select>
          <label class="tt-header-label">
            <input type="checkbox" id="tt-header" checked>
            First row is header
          </label>
          <button id="tt-copy-html" class="tt-btn tt-btn-secondary">Copy HTML</button>
          <button id="tt-copy-md" class="tt-btn tt-btn-secondary">Copy Markdown</button>
          <button id="tt-copy-csv" class="tt-btn tt-btn-secondary">Copy CSV</button>
        </div>
        <textarea id="tt-input" placeholder="Paste your delimited text here...&#10;&#10;Name\tAge\tCity&#10;Alice\t30\tNew York&#10;Bob\t25\tLos Angeles&#10;Carol\t35\tChicago"></textarea>
      </div>
      <div class="tt-output">
        <div class="tt-stats" id="tt-stats"></div>
        <div class="tt-table-wrap">
          <table id="tt-table"></table>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .tt-container { max-width: 1000px; margin: 0 auto; }
    .tt-input-section { margin-bottom: var(--space-4); }
    .tt-toolbar { display: flex; flex-wrap: wrap; gap: var(--space-2); align-items: center; margin-bottom: var(--space-3); }
    .tt-toolbar select { padding: var(--space-1) var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); font-size: var(--text-sm); }
    .tt-header-label { display: flex; align-items: center; gap: var(--space-1); font-size: var(--text-sm); cursor: pointer; }
    .tt-header-label input { cursor: pointer; }
    .tt-btn { padding: var(--space-1) var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer; font-size: var(--text-sm); background: var(--color-surface); transition: background .15s; }
    .tt-btn:hover { background: var(--color-bg); }
    #tt-input { width: 100%; min-height: 180px; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-xl); background: var(--color-surface); resize: vertical; font-family: monospace; font-size: var(--text-xs); line-height: 1.5; }
    .tt-output { }
    .tt-stats { display: flex; gap: var(--space-3); margin-bottom: var(--space-3); }
    .tt-stat { background: var(--color-surface); padding: var(--space-2) var(--space-3); border-radius: var(--radius-lg); font-size: var(--text-sm); }
    .tt-stat strong { color: var(--color-primary); }
    .tt-table-wrap { overflow-x: auto; background: var(--color-surface); border-radius: var(--radius-xl); }
    #tt-table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); }
    #tt-table th, #tt-table td { padding: var(--space-2) var(--space-3); text-align: left; border: 1px solid var(--color-border); white-space: nowrap; }
    #tt-table th { background: var(--color-bg); font-weight: 600; position: sticky; top: 0; }
    #tt-table tr:hover { background: var(--color-bg); }
  `;
  container.appendChild(style);

  function update() {
    const text = container.querySelector("#tt-input").value;
    const delimiterChoice = container.querySelector("#tt-delimiter").value;
    const hasHeader = container.querySelector("#tt-header").checked;

    let delimiter = delimiterChoice === "auto" ? detectDelimiter(text) : delimiterChoice;
    const { headers, rows } = parseTable(text, delimiter, hasHeader);

    if (rows.length === 0) {
      container.querySelector("#tt-stats").innerHTML = "";
      container.querySelector("#tt-table").innerHTML =
        '<tbody><tr><td style="text-align:center;padding:2rem;color:var(--color-text-secondary)">Paste delimited text to see preview</td></tr></tbody>';
      return;
    }

    container.querySelector("#tt-stats").innerHTML = `
      <span class="tt-stat">Rows: <strong>${rows.length}</strong></span>
      <span class="tt-stat">Columns: <strong>${headers.length}</strong></span>
      <span class="tt-stat">Cells: <strong>${rows.length * headers.length}</strong></span>
    `;

    let html = "<thead><tr>" + headers.map(h => `<th>${h}</th>`).join("") + "</tr></thead><tbody>";
    html += rows
      .map(row => "<tr>" + row.map(cell => `<td>${cell}</td>`).join("") + "</tr>")
      .join("");
    html += "</tbody>";
    container.querySelector("#tt-table").innerHTML = html;

    container.querySelector("#tt-copy-html").textContent = "Copy HTML";
    container.querySelector("#tt-copy-md").textContent = "Copy Markdown";
    container.querySelector("#tt-copy-csv").textContent = "Copy CSV";
  }

  container.querySelector("#tt-input").addEventListener("input", update);
  container.querySelector("#tt-delimiter").addEventListener("change", update);
  container.querySelector("#tt-header").addEventListener("change", update);

  container.querySelector("#tt-copy-html").addEventListener("click", () => {
    const table = container.querySelector("#tt-table");
    const html = "<table>\n" + table.outerHTML + "\n</table>";
    navigator.clipboard.writeText(html).then(() => {
      container.querySelector("#tt-copy-html").textContent = "Copied!";
      setTimeout(() => (container.querySelector("#tt-copy-html").textContent = "Copy HTML"), 1500);
    });
  });

  container.querySelector("#tt-copy-md").addEventListener("click", () => {
    const text = container.querySelector("#tt-input").value;
    const delimiterChoice = container.querySelector("#tt-delimiter").value;
    const hasHeader = container.querySelector("#tt-header").checked;
    const delimiter = delimiterChoice === "auto" ? detectDelimiter(text) : delimiterChoice;
    const { headers, rows } = parseTable(text, delimiter, hasHeader);
    if (rows.length === 0) return;
    let md = "| " + headers.join(" | ") + " |\n| " + headers.map(() => "---").join(" | ") + " |\n";
    md += rows.map(row => "| " + row.join(" | ") + " |").join("\n");
    navigator.clipboard.writeText(md).then(() => {
      container.querySelector("#tt-copy-md").textContent = "Copied!";
      setTimeout(
        () => (container.querySelector("#tt-copy-md").textContent = "Copy Markdown"),
        1500
      );
    });
  });

  container.querySelector("#tt-copy-csv").addEventListener("click", () => {
    const text = container.querySelector("#tt-input").value;
    const delimiterChoice = container.querySelector("#tt-delimiter").value;
    const hasHeader = container.querySelector("#tt-header").checked;
    const delimiter = delimiterChoice === "auto" ? detectDelimiter(text) : delimiterChoice;
    const { headers, rows } = parseTable(text, delimiter, hasHeader);
    if (rows.length === 0) return;
    const escapeCsv = v => {
      if (v.includes(",") || v.includes('"') || v.includes("\n"))
        return '"' + v.replace(/"/g, '""') + '"';
      return v;
    };
    const csv = [headers.join(","), ...rows.map(r => r.map(escapeCsv).join(","))].join("\n");
    navigator.clipboard.writeText(csv).then(() => {
      container.querySelector("#tt-copy-csv").textContent = "Copied!";
      setTimeout(() => (container.querySelector("#tt-copy-csv").textContent = "Copy CSV"), 1500);
    });
  });

  update();
}
