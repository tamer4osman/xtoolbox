import writeExcelFile from "write-excel-file/browser";
import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { downloadBlob, formatFileSize } from "../../utils/file.js";

export function parseXmlToRows(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "text/xml");
  const root = doc.documentElement;
  if (!root) return { rows: [], headers: [] };

  const rowElements = [];
  for (let i = 0; i < root.children.length; i++) {
    rowElements.push(root.children[i]);
  }
  if (rowElements.length === 0) return { rows: [], headers: [] };

  const headerSet = new Set();
  for (const el of rowElements) {
    for (let i = 0; i < el.children.length; i++) {
      headerSet.add(el.children[i].tagName);
    }
  }
  const headers = Array.from(headerSet);

  const rows = rowElements.map(el => {
    const row = {};
    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i];
      row[child.tagName] = child.textContent || "";
    }
    return row;
  });

  return { rows, headers };
}

export function rowsToSheet(rows, headers) {
  const headerRow = headers.map(h => ({ type: String, value: h }));
  const dataRows = rows.map(row =>
    headers.map(h => {
      const val = row[h] ?? "";
      return { type: String, value: String(val) };
    })
  );
  return [headerRow, ...dataRows];
}

export const toolConfig = {
  id: "xml-to-excel",
  name: "XML to Excel",
  category: "text",
  description:
    "Convert XML files to Excel spreadsheets (.xlsx). Automatically detects row elements.",
  icon: "📊",
  accept: ".xml",
  maxSizeMB: 10,
  keywords: ["xml to excel", "xml to xlsx", "convert xml to spreadsheet"],
  steps: ["Upload XML file", "Review detected rows", 'Click "Convert"', "Download XLSX"],
  faqs: [
    {
      question: "How does it detect rows?",
      answer:
        "The tool looks for repeated child elements under the root. Each child becomes a spreadsheet row, with sub-elements as columns."
    },
    {
      question: "What if my XML has nested data?",
      answer:
        "Only direct child elements of the root are treated as rows. Deeply nested data may not be fully captured."
    }
  ]
};

export function render(container) {
  let currentFile = null;

  const upload = createFileUpload({
    accept: ".xml",
    multiple: false,
    maxSizeMB: 10,
    onFilesSelected: async files => {
      if (files.length === 0) return;
      currentFile = files[0];
      fileInfo.textContent = `${currentFile.name} — ${formatFileSize(currentFile.size)}`;

      const text = await currentFile.text();
      const result = parseXmlToRows(text);

      if (result.rows.length === 0) {
        showToast({ message: "No repeated row elements found in XML", type: "error" });
        return;
      }

      rowCount.textContent = `${result.rows.length} rows, ${result.headers.length} columns`;
      optionsArea.style.display = "block";
      currentResult = result;
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;">
        <div id="file-info" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">-</div>
        <div id="row-count" style="font-size:var(--text-sm);color:var(--color-text-muted);margin-bottom:var(--space-4);"></div>
        <button class="btn btn-primary btn-lg" id="convert-btn" style="width:100%;">Convert to Excel</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;">
        <div class="spinner"></div>
        <p>Generating Excel file...</p>
      </div>
      <div class="tool-results" id="results" style="display:none;text-align:center;">
        <div id="preview-table" style="max-height:300px;overflow:auto;border:1px solid var(--color-border);border-radius:var(--radius-md);margin:var(--space-4) 0;"></div>
        <button class="btn btn-primary btn-lg" id="download-btn">Download XLSX</button>
      </div>
    </div>
  `;

  container.querySelector("#upload-area").appendChild(upload.element);
  const optionsArea = container.querySelector("#options-area");
  const fileInfo = container.querySelector("#file-info");
  const rowCount = container.querySelector("#row-count");
  const convertBtn = container.querySelector("#convert-btn");
  const processing = container.querySelector("#processing");
  const results = container.querySelector("#results");
  const previewTable = container.querySelector("#preview-table");
  const downloadBtn = container.querySelector("#download-btn");
  let currentResult = null;
  let excelBlob = null;

  convertBtn.addEventListener("click", () => {
    if (!currentResult) return;

    processing.style.display = "block";
    convertBtn.style.display = "none";
    results.style.display = "none";

    setTimeout(async () => {
      try {
        const sheetData = rowsToSheet(currentResult.rows, currentResult.headers);
        excelBlob = await writeExcelFile(sheetData, {
          columns: currentResult.headers.map(h => ({ header: h }))
        }).toBlob();

        const headers = currentResult.headers;
        const data = currentResult.rows;
        let html = '<table style="width:100%;border-collapse:collapse;font-size:var(--text-sm);">';
        html += "<thead><tr>";
        for (const h of headers) {
          html += `<th style="padding:var(--space-2);border-bottom:2px solid var(--color-border);text-align:left;background:var(--color-surface);font-weight:600;">${h}</th>`;
        }
        html += "</tr></thead><tbody>";
        for (let i = 0; i < Math.min(data.length, 50); i++) {
          html += "<tr>";
          for (const h of headers) {
            html += `<td style="padding:var(--space-2);border-bottom:1px solid var(--color-border);">${data[i][h] || ""}</td>`;
          }
          html += "</tr>";
        }
        if (data.length > 50) {
          html += `<tr><td colspan="${headers.length}" style="padding:var(--space-2);text-align:center;color:var(--color-text-muted);font-style:italic;">... and ${data.length - 50} more rows</td></tr>`;
        }
        html += "</tbody></table>";
        previewTable.innerHTML = html;

        results.style.display = "block";
        showToast({ message: "Excel file ready!", type: "success" });
      } catch (err) {
        showToast({ message: "Error: " + err.message, type: "error" });
      } finally {
        processing.style.display = "none";
        convertBtn.style.display = "inline-flex";
      }
    }, 50);
  });

  downloadBtn.addEventListener("click", () => {
    if (!excelBlob) return;
    downloadBlob(excelBlob, currentFile.name.replace(/\.xml$/i, ".xlsx"));
  });
}

export function destroy() {}
