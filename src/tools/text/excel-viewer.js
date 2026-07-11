import { readSheet } from "read-excel-file/browser";
import writeExcelFile from "write-excel-file/browser";
import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { downloadBlob } from "../../utils/file.js";

export const toolConfig = {
  id: "excel-viewer",
  name: "Excel Viewer & Editor",
  category: "text",
  description:
    "View and edit Excel spreadsheets (.xlsx, .xls, .csv) in the browser. Export as CSV or new XLSX.",
  icon: "📊",
  accept: ".xlsx,.xls,.csv",
  maxSizeMB: 20,
  keywords: [
    "excel viewer",
    "xlsx viewer",
    "spreadsheet viewer",
    "open excel online",
    "edit excel"
  ],
  steps: ["Upload an Excel or CSV file", "View and edit the data", "Export as CSV or XLSX"],
  faqs: [
    {
      question: "What formats supported?",
      answer: "We support .xlsx, .xls, and .csv files up to 20MB."
    },
    {
      question: "Can I edit the data?",
      answer: "Yes! Double-click any cell to edit. Changes are saved when you export."
    },
    { question: "Can I export my changes?", answer: "Yes, export as CSV or XLSX format." }
  ]
};

export function render(container) {
  let sheets = null;
  let currentFile = null;
  let editedData = {};
  let activeSheetIdx = 0;

  const upload = createFileUpload({
    accept: ".xlsx,.xls,.csv",
    multiple: false,
    maxSizeMB: 20,
    onFilesSelected: files => {
      if (files.length > 0) {
        currentFile = files[0];
        loadWorkbook(files[0]);
      }
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="excel-toolbar" id="toolbar" style="display:none;gap:var(--space-2);margin:var(--space-4) 0;">
        <button class="btn btn-secondary" id="export-csv">Export CSV</button>
        <button class="btn btn-primary" id="export-xlsx">Export XLSX</button>
        <button class="btn btn-ghost" id="clear-data">Clear</button>
      </div>
      <div class="excel-container" id="excel-container" style="overflow:auto;max-height:500px;border:var(--border);border-radius:var(--radius-lg);display:none;"></div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Loading spreadsheet...</p></div>
    </div>
    <style>
      .excel-toolbar { display:flex;flex-wrap:wrap; }
      .excel-table { border-collapse:collapse;width:100%;font-size:14px; }
      .excel-table th,.excel-table td { border:1px solid var(--color-border);padding:8px;text-align:left; }
      .excel-table th { background:var(--color-surface);font-weight:600; }
      .excel-table td:hover { background:var(--color-surface);cursor:pointer; }
      .excel-table td:focus { outline:2px solid var(--color-primary);outline-offset:-2px; }
      .sheet-tabs { display:flex;gap:var(--space-2);margin-bottom:var(--space-3);flex-wrap:wrap; }
      .sheet-tab { padding:var(--space-2) var(--space-3);background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius);cursor:pointer; }
      .sheet-tab.active { background:var(--color-primary);color:white;border-color:var(--color-primary); }
    </style>
  `;

  container.querySelector("#upload-area").appendChild(upload.element);
  const toolbar = container.querySelector("#toolbar");
  const excelContainer = container.querySelector("#excel-container");
  const processing = container.querySelector("#processing");
  const exportCsv = container.querySelector("#export-csv");
  const exportXlsx = container.querySelector("#export-xlsx");
  const clearData = container.querySelector("#clear-data");

  async function loadWorkbook(file) {
    processing.style.display = "flex";
    excelContainer.style.display = "none";
    toolbar.style.display = "none";

    try {
      const data = await file.arrayBuffer();
      sheets = await readSheet(data);
      activeSheetIdx = 0;
      editedData = {};
      renderSheet(0);
      toolbar.style.display = "flex";
      showToast({ message: "Spreadsheet loaded!", type: "success" });
    } catch (err) {
      console.error("Load error:", err);
      showToast({ message: "Failed to load file: " + err.message, type: "error" });
    } finally {
      processing.style.display = "none";
    }
  }

  function renderSheet(idx) {
    activeSheetIdx = idx;
    const sheet = sheets[idx];
    const data = sheet.data;

    if (data.length === 0) {
      excelContainer.innerHTML =
        '<p style="padding:var(--space-4);color:var(--color-text-secondary);">Empty spreadsheet</p>';
      excelContainer.style.display = "block";
      return;
    }

    const maxCols = Math.max(...data.map(row => row.length));
    const headers = data[0] || [];
    const rows = data.slice(1);

    let html = '<div class="sheet-tabs">';
    sheets.forEach((s, i) => {
      html += `<button class="sheet-tab ${i === idx ? "active" : ""}" data-idx="${i}">${s.sheet}</button>`;
    });
    html += "</div>";

    html += '<table class="excel-table" contenteditable>';
    html += "<thead><tr>";
    headers.forEach((header, i) => {
      html += `<th contenteditable="true" data-row="-1" data-col="${i}">${header ?? ""}</th>`;
    });
    html += "</tr></thead><tbody>";

    rows.forEach((row, rowIdx) => {
      html += "<tr>";
      for (let i = 0; i < maxCols; i++) {
        html += `<td contenteditable="true" data-row="${rowIdx}" data-col="${i}">${row[i] ?? ""}</td>`;
      }
      html += "</tr>";
    });
    html += "</tbody></table>";

    excelContainer.innerHTML = html;
    excelContainer.style.display = "block";

    excelContainer.querySelectorAll(".sheet-tab").forEach(tab => {
      tab.addEventListener("click", () => renderSheet(parseInt(tab.dataset.idx)));
    });

    excelContainer.querySelectorAll("td, th").forEach(cell => {
      cell.addEventListener("blur", () => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const key = `${activeSheetIdx}:${row}:${col}`;
        editedData[key] = cell.textContent;
      });
    });
  }

  exportCsv.addEventListener("click", () => {
    if (!sheets) return;
    const sheet = sheets[activeSheetIdx];
    const data = sheet.data;
    const csv = data
      .map(row =>
        row
          .map(cell => {
            const str = String(cell ?? "");
            return str.includes(",") || str.includes('"') || str.includes("\n")
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          })
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const filename = currentFile.name.replace(/\.[^.]+$/, ".csv");
    downloadBlob(blob, filename);
    showToast({ message: "Exported as CSV!", type: "success" });
  });

  exportXlsx.addEventListener("click", async () => {
    if (!sheets) return;
    const sheet = sheets[activeSheetIdx];
    let data = sheet.data.map(row => [...row]);

    Object.entries(editedData).forEach(([key, value]) => {
      const [sheetIdx, rowIdx, colIdx] = key.split(":").map(Number);
      if (sheetIdx === activeSheetIdx && rowIdx >= 0) {
        const r = rowIdx + 1;
        if (data[r] === undefined) data[r] = [];
        data[r][colIdx] = value;
      }
    });

    const sheetData = data.map(row =>
      row.map(cell => ({ type: String, value: cell != null ? String(cell) : "" }))
    );

    try {
      const blob = await writeExcelFile(sheetData, {
        columns: (data[0] || []).map(h => ({ header: String(h ?? "") }))
      }).toBlob();
      const filename = currentFile.name.replace(/\.[^.]+$/, "_edited.xlsx");
      downloadBlob(blob, filename);
      showToast({ message: "Exported as XLSX!", type: "success" });
    } catch (err) {
      showToast({ message: "Export error: " + err.message, type: "error" });
    }
  });

  clearData.addEventListener("click", () => {
    if (currentFile) loadWorkbook(currentFile);
    editedData = {};
  });
}

export function destroy() {}
