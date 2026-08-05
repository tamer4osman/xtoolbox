import { add, subtract, multiply, transpose, inv, det } from "mathjs";
import { showToast } from "../../components/toast.js";
import { copyToClipboard } from "../../utils/clipboard.js";
import { escapeHtml } from "../../utils/escape-html.js";

const MIN_SIZE = 2;
const MAX_SIZE = 6;

export const toolConfig = {
  id: "matrix-calc",
  name: "Matrix Calculator",
  category: "math",
  description:
    "Add, subtract, multiply, transpose, invert, and take the determinant of matrices from 2×2 up to 6×6. Copy the result as CSV, space-separated text, or LaTeX — all computed entirely in your browser.",
  icon: "🔢",
  keywords: [
    "matrix",
    "calculator",
    "matrices",
    "add",
    "subtract",
    "multiply",
    "transpose",
    "inverse",
    "invert",
    "determinant",
    "det",
    "linear algebra",
    "math"
  ],
  steps: [
    "Choose the size for Matrix A and Matrix B (from 2×2 up to 6×6)",
    "Type a number into every cell of both matrices",
    "Pick an operation: add, subtract, multiply, transpose, invert, or determinant",
    "Copy the result as CSV, space-separated text, or LaTeX"
  ],
  faqs: [
    {
      question: "What operations does this calculator support?",
      answer:
        "Addition (A + B), subtraction (A − B), matrix multiplication (A × B), transpose (Aᵀ), inverse (A⁻¹), and determinant (det A). For inner matrix multiplication, the number of columns in A must equal the number of rows in B."
    },
    {
      question: "Which matrices can be inverted?",
      answer:
        "Only square matrices (rows = columns) that are non-singular — meaning their determinant is non-zero — have an inverse. The tool shows a clear error if you try to invert a non-square or singular matrix."
    },
    {
      question: "What is the Size Lock option?",
      answer:
        "Size Lock keeps Matrix B exactly the same size as Matrix A, which is convenient when you're adding or subtracting two matrices, since those operations require matching dimensions."
    },
    {
      question: "Can I copy the result into a spreadsheet?",
      answer:
        "Yes. Choose CSV from the output format — the result is copied row by row, so pasting into Excel, Google Sheets, or Numbers fills the cells correctly."
    },
    {
      question: "Is my data sent to a server?",
      answer:
        "No. All calculations run locally in your browser using math.js. Nothing you enter ever leaves your machine."
    }
  ]
};

export function formatNumber(n) {
  if (typeof n !== "number" || !Number.isFinite(n)) return "undefined";
  if (Math.abs(n) < 1e-10) return "0";
  return String(Number(n.toPrecision(6)));
}

export function parseValue(text) {
  const str = String(text ?? "").trim();
  if (str === "") throw new Error("Every cell must contain a number.");
  const num = Number(str);
  if (!Number.isFinite(num)) throw new Error(`"${str}" is not a valid number.`);
  return num;
}

export function buildMatrix(model) {
  const rows = model.length;
  const cols = rows > 0 ? model[0].length : 0;
  const matrix = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push(parseValue(model[r][c]));
    }
    matrix.push(row);
  }
  return matrix;
}

export function performOperation(op, matrixA, matrixB) {
  let value;
  let scalar = false;
  switch (op) {
    case "add":
      value = add(matrixA, matrixB);
      break;
    case "sub":
      value = subtract(matrixA, matrixB);
      break;
    case "mul":
      value = multiply(matrixA, matrixB);
      break;
    case "trans":
      value = transpose(matrixA);
      break;
    case "inv":
      value = inv(matrixA);
      break;
    case "det":
      value = det(matrixA);
      scalar = true;
      break;
    default:
      throw new Error("Unknown operation.");
  }
  return { value, scalar };
}

export function matrixToCsv(value) {
  return value.map(row => row.map(formatNumber).join(",")).join("\n");
}

export function matrixToSpaced(value) {
  return value.map(row => row.map(formatNumber).join(" ")).join("\n");
}

export function matrixToLatex(value) {
  const body = value.map(row => row.map(cell => formatNumber(cell)).join(" & ")).join(" \\\\ ");
  return `\\begin{pmatrix}${body}\\end{pmatrix}`;
}

export function resultToText(result, format) {
  const value = result.value;
  if (result.scalar) return formatNumber(value);
  if (format === "csv") return matrixToCsv(value);
  if (format === "spaces") return matrixToSpaced(value);
  return matrixToLatex(value);
}

function makeModel(rows, cols, fill = "") {
  return Array.from({ length: rows }, () => Array(cols).fill(fill));
}

function resizeModel(model, rows, cols) {
  const next = makeModel(rows, cols);
  for (let r = 0; r < Math.min(rows, model.length); r++) {
    for (let c = 0; c < Math.min(cols, model[r].length); c++) {
      next[r][c] = model[r][c];
    }
  }
  return next;
}

function identityModel(rows, cols) {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => (r === c ? "1" : "0"))
  );
}

function fillSizeSelect(select, value) {
  let options = "";
  for (let i = MIN_SIZE; i <= MAX_SIZE; i++) {
    options += `<option value="${i}">${i}</option>`;
  }
  select.innerHTML = options;
  select.value = String(value);
}

export function render(container) {
  const style = document.createElement("style");
  style.textContent = `
    .mc-wrap{max-width:820px}
    .mc-card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);margin-bottom:var(--space-4)}
    .mc-matrices{display:flex;gap:var(--space-4);flex-wrap:wrap}
    .mc-matrix{flex:1;min-width:280px}
    .mc-mat-head{display:flex;align-items:baseline;justify-content:space-between;gap:var(--space-2);margin-bottom:var(--space-3);flex-wrap:wrap}
    .mc-mat-title{font-size:var(--text-base);font-weight:600}
    .mc-size-ctl{display:flex;gap:var(--space-2);align-items:flex-end;font-size:var(--text-sm)}
    .mc-size-ctl label{display:flex;flex-direction:column;gap:var(--space-1);color:var(--color-text-muted);font-size:var(--text-xs)}
    .mc-size-ctl select{padding:var(--space-1);border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-bg);color:var(--color-text)}
    .mc-grid{display:grid;gap:var(--space-1)}
    .mc-grid input{width:100%;min-width:0;padding:var(--space-2);text-align:center;border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-bg);color:var(--color-text);font-family:monospace}
    .mc-grid input:focus{border-color:var(--color-primary);outline:none}
    .mc-quick{display:flex;gap:var(--space-2);margin-top:var(--space-3);flex-wrap:wrap}
    .mc-lock{display:flex;align-items:center;gap:var(--space-2);margin:var(--space-4) 0;font-size:var(--text-sm);color:var(--color-text-muted)}
    .mc-ops{display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-4)}
    .mc-result{margin-top:var(--space-4)}
    .mc-result-label{font-size:var(--text-xs);text-transform:uppercase;letter-spacing:0.08em;color:var(--color-text-muted);margin-bottom:var(--space-2)}
    .mc-result-grid{display:inline-grid;gap:var(--space-1)}
    .mc-cell-outline{min-width:3.2em;padding:var(--space-2);text-align:center;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-sm);font-family:monospace}
    .mc-scalar{font-size:1.6em;font-family:monospace;padding:var(--space-3);border:1px solid var(--color-primary);background:color-mix(in srgb, var(--color-primary) 8%, var(--color-surface));border-radius:var(--radius-md);display:inline-block}
    .mc-error{background:var(--color-surface);border:1px solid var(--color-danger, #ef4444);border-left:3px solid var(--color-danger, #ef4444);color:var(--color-danger, #ef4444);border-radius:var(--radius-md);padding:var(--space-3);font-size:var(--text-sm)}
    .mc-actions{display:flex;gap:var(--space-2);flex-wrap:wrap;margin-top:var(--space-4);align-items:center}
    .mc-format{display:flex;flex-direction:column;gap:var(--space-1);font-size:var(--text-xs);color:var(--color-text-muted)}
    .mc-format select{padding:var(--space-2);border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-bg);color:var(--color-text);font-size:var(--text-sm)}
  `;
  container.appendChild(style);

  container.innerHTML = `
    <div class="mc-wrap">
      <div class="mc-card">
        <div class="mc-matrices">
          <div class="mc-matrix">
            <div class="mc-mat-head">
              <span class="mc-mat-title">Matrix A</span>
              <div class="mc-size-ctl">
                <label>Rows <select id="mc-a-rows"></select></label>
                <label>Cols <select id="mc-a-cols"></select></label>
              </div>
            </div>
            <div class="mc-grid" id="mc-a-grid"></div>
            <div class="mc-quick">
              <button id="mc-a-identity" class="btn btn-ghost btn-sm" type="button">Identity</button>
              <button id="mc-a-zero" class="btn btn-ghost btn-sm" type="button">Zeros</button>
            </div>
          </div>
          <div class="mc-matrix">
            <div class="mc-mat-head">
              <span class="mc-mat-title">Matrix B</span>
              <div class="mc-size-ctl">
                <label>Rows <select id="mc-b-rows"></select></label>
                <label>Cols <select id="mc-b-cols"></select></label>
              </div>
            </div>
            <div class="mc-grid" id="mc-b-grid"></div>
            <div class="mc-quick">
              <button id="mc-b-identity" class="btn btn-ghost btn-sm" type="button">Identity</button>
              <button id="mc-b-zero" class="btn btn-ghost btn-sm" type="button">Zeros</button>
            </div>
          </div>
        </div>

        <label class="mc-lock"><input type="checkbox" id="mc-lock" checked /> Size Lock — keep Matrix B the same size as Matrix A</label>

        <div class="mc-ops">
          <button id="mc-op-add" class="btn btn-primary" type="button">A + B</button>
          <button id="mc-op-sub" class="btn btn-secondary" type="button">A − B</button>
          <button id="mc-op-mul" class="btn btn-secondary" type="button">A × B</button>
          <button id="mc-op-trans" class="btn btn-secondary" type="button">Aᵀ</button>
          <button id="mc-op-inv" class="btn btn-secondary" type="button">A⁻¹</button>
          <button id="mc-op-det" class="btn btn-secondary" type="button">det(A)</button>
        </div>

        <div id="mc-result" class="mc-result"></div>

        <div class="mc-actions">
          <span class="mc-format">
            <label for="mc-format">Copy result as</label>
            <select id="mc-format">
              <option value="csv">CSV</option>
              <option value="spaces">Space-separated</option>
              <option value="latex">LaTeX matrix</option>
            </select>
          </span>
          <button id="mc-copy" class="btn btn-secondary" type="button" disabled>Copy Result</button>
          <button id="mc-clear" class="btn btn-secondary" type="button">Clear</button>
        </div>
      </div>
    </div>
  `;

  const aRows = container.querySelector("#mc-a-rows");
  const aCols = container.querySelector("#mc-a-cols");
  const bRows = container.querySelector("#mc-b-rows");
  const bCols = container.querySelector("#mc-b-cols");
  const aGrid = container.querySelector("#mc-a-grid");
  const bGrid = container.querySelector("#mc-b-grid");
  const lockEl = container.querySelector("#mc-lock");
  const resultEl = container.querySelector("#mc-result");
  const copyBtn = container.querySelector("#mc-copy");
  const formatEl = container.querySelector("#mc-format");
  const clearBtn = container.querySelector("#mc-clear");

  fillSizeSelect(aRows, 2);
  fillSizeSelect(aCols, 2);
  fillSizeSelect(bRows, 2);
  fillSizeSelect(bCols, 2);

  let modelA = makeModel(2, 2);
  let modelB = makeModel(2, 2);
  let currentResult = null;

  function readFlat(grid, rows, cols) {
    const inputs = grid.querySelectorAll("input");
    const flat = [...inputs].map(i => i.value);
    const matrix = [];
    for (let r = 0; r < rows; r++) {
      matrix.push(flat.slice(r * cols, (r + 1) * cols));
    }
    return matrix;
  }

  function renderGrid(grid, model, rows, cols) {
    grid.style.gridTemplateColumns = `repeat(${cols}, minmax(3em, 1fr))`;
    grid.innerHTML = "";
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const input = document.createElement("input");
        input.type = "text";
        input.inputMode = "decimal";
        input.name = `mc-cell-${r}-${c}`;
        input.value = model[r][c];
        input.setAttribute(
          "aria-label",
          `Matrix ${grid === aGrid ? "A" : "B"} row ${r + 1} column ${c + 1}`
        );
        grid.appendChild(input);
      }
    }
  }

  function renderA() {
    const rows = parseInt(aRows.value, 10);
    const cols = parseInt(aCols.value, 10);
    modelA = resizeModel(modelA, rows, cols);
    renderGrid(aGrid, modelA, rows, cols);
  }

  function renderB() {
    const rows = parseInt(bRows.value, 10);
    const cols = parseInt(bCols.value, 10);
    modelB = resizeModel(modelB, rows, cols);
    renderGrid(bGrid, modelB, rows, cols);
  }

  function syncLock() {
    if (!lockEl.checked) return;
    const rows = parseInt(aRows.value, 10);
    const cols = parseInt(aCols.value, 10);
    bRows.value = String(rows);
    bCols.value = String(cols);
    renderB();
  }

  function showResult(html) {
    resultEl.innerHTML = html;
  }

  function clearResult() {
    currentResult = null;
    resultEl.innerHTML = "";
    copyBtn.disabled = true;
  }

  function showError(message) {
    clearResult();
    showResult(`<div class="mc-error">${escapeHtml(message)}</div>`);
  }

  function compute(op) {
    let matrixA;
    let matrixB;
    try {
      matrixA = buildMatrix(readFlat(aGrid, parseInt(aRows.value, 10), parseInt(aCols.value, 10)));
      if (op === "add" || op === "sub" || op === "mul") {
        matrixB = buildMatrix(
          readFlat(bGrid, parseInt(bRows.value, 10), parseInt(bCols.value, 10))
        );
      }
    } catch (error) {
      showError(error.message);
      return;
    }

    let result;
    try {
      result = performOperation(op, matrixA, matrixB);
    } catch (error) {
      showError(error.message);
      return;
    }

    currentResult = result;
    if (result.scalar) {
      showResult(`
        <div class="mc-result-label">Result</div>
        <div class="mc-scalar">${formatNumber(result.value)}</div>`);
    } else {
      const m = result.value;
      const cells = m
        .map(row => row.map(v => `<div class="mc-cell-outline">${formatNumber(v)}</div>`).join(""))
        .join("");
      showResult(`
        <div class="mc-result-label">Result</div>
        <div class="mc-result-grid" style="grid-template-columns:repeat(${m[0].length}, 3.2em)">${cells}</div>`);
    }
    copyBtn.disabled = false;
  }

  async function copyResult() {
    if (!currentResult) return;
    const text = resultToText(currentResult, formatEl.value);
    await copyToClipboard(text);
    const original = copyBtn.textContent;
    copyBtn.textContent = "Copied ✓";
    showToast({ message: "Result copied", type: "success" });
    setTimeout(() => {
      copyBtn.textContent = original;
    }, 2000);
  }

  function fillMatrix(which, kind) {
    const rows = which === "a" ? parseInt(aRows.value, 10) : parseInt(bRows.value, 10);
    const cols = which === "a" ? parseInt(aCols.value, 10) : parseInt(bCols.value, 10);
    const model = kind === "identity" ? identityModel(rows, cols) : makeModel(rows, cols, "0");
    if (which === "a") {
      modelA = model;
      renderA();
    } else {
      modelB = model;
      renderB();
    }
  }

  function clearAll() {
    modelA = makeModel(parseInt(aRows.value, 10), parseInt(aCols.value, 10));
    modelB = makeModel(parseInt(bRows.value, 10), parseInt(bCols.value, 10));
    renderA();
    renderB();
    clearResult();
  }

  aRows.addEventListener("change", renderA);
  aCols.addEventListener("change", renderA);
  bRows.addEventListener("change", renderB);
  bCols.addEventListener("change", renderB);

  aRows.addEventListener("change", syncLock);
  aCols.addEventListener("change", syncLock);
  lockEl.addEventListener("change", syncLock);

  container
    .querySelector("#mc-a-identity")
    .addEventListener("click", () => fillMatrix("a", "identity"));
  container.querySelector("#mc-a-zero").addEventListener("click", () => fillMatrix("a", "zero"));
  container
    .querySelector("#mc-b-identity")
    .addEventListener("click", () => fillMatrix("b", "identity"));
  container.querySelector("#mc-b-zero").addEventListener("click", () => fillMatrix("b", "zero"));

  const opMap = {
    "mc-op-add": "add",
    "mc-op-sub": "sub",
    "mc-op-mul": "mul",
    "mc-op-trans": "trans",
    "mc-op-inv": "inv",
    "mc-op-det": "det"
  };
  for (const [id, op] of Object.entries(opMap)) {
    container.querySelector(`#${id}`).addEventListener("click", () => compute(op));
  }

  copyBtn.addEventListener("click", copyResult);
  clearBtn.addEventListener("click", clearAll);

  renderA();
  renderB();
}

export function cleanup() {}
