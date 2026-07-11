export const toolConfig = {
  id: "database-schema-designer",
  name: "Database Schema Designer",
  category: "dev",
  description:
    "Visual drag-and-drop ER diagram editor with tables, columns, relationships, and SQL export.",
  icon: "🗄️",
  keywords: ["database", "schema", "erd", "designer", "diagram", "sql"],
  accept: "",
  maxSizeMB: 0
};

let state = {
  tables: [],
  relationships: [],
  selectedTable: null,
  dragging: null,
  offsetX: 0,
  offsetY: 0,
  zoom: 1,
  panX: 0,
  panY: 0
};

const tableColors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

function createTable(name = "new_table") {
  const id = Date.now().toString(36);
  const color = tableColors[state.tables.length % tableColors.length];
  return {
    id,
    name,
    x: 100 + state.tables.length * 50,
    y: 100 + state.tables.length * 30,
    columns: [
      { name: "id", type: "INTEGER", primary: true, autoIncrement: true },
      { name: "created_at", type: "DATETIME", default: "CURRENT_TIMESTAMP" }
    ],
    color
  };
}

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-header">
        <h1>${toolConfig.name}</h1>
        <p>${toolConfig.description}</p>
      </div>

      <div class="schema-toolbar">
        <button class="btn-primary" id="addTableBtn">Add Table</button>
        <button class="btn-secondary" id="addColumnBtn" disabled>Add Column</button>
        <button class="btn-secondary" id="exportSqlBtn" disabled>Export SQL</button>
        <button class="btn-secondary" id="clearBtn">Clear All</button>
        <div class="zoom-controls">
          <button class="btn-icon" id="zoomOutBtn">−</button>
          <span id="zoomLevel">100%</span>
          <button class="btn-icon" id="zoomInBtn">+</button>
        </div>
      </div>

      <div class="schema-canvas-wrapper">
        <canvas id="schemaCanvas" width="800" height="500"></canvas>
      </div>

      <div class="column-editor" id="columnEditor" style="display:none;">
        <h3>Edit Column</h3>
        <div class="control-row">
          <label>Column Name</label>
          <input type="text" id="colName" placeholder="column_name">
        </div>
        <div class="control-row">
          <label>Data Type</label>
          <select id="colType">
            <option value="INTEGER">INTEGER</option>
            <option value="TEXT">TEXT</option>
            <option value="VARCHAR(255)">VARCHAR(255)</option>
            <option value="BOOLEAN">BOOLEAN</option>
            <option value="DATETIME">DATETIME</option>
            <option value="REAL">REAL</option>
            <option value="BLOB">BLOB</option>
          </select>
        </div>
        <div class="control-row">
          <label>
            <input type="checkbox" id="colPrimary"> Primary Key
          </label>
        </div>
        <div class="control-row">
          <label>
            <input type="checkbox" id="colAuto" checked> Auto Increment
          </label>
        </div>
        <div class="control-row">
          <label>
            <input type="checkbox" id="colNull"> Allow NULL
          </label>
        </div>
        <div class="action-buttons">
          <button class="btn-primary" id="saveColBtn">Save</button>
          <button class="btn-secondary" id="deleteColBtn">Delete</button>
        </div>
      </div>

      <div class="sql-output" id="sqlOutput" style="display:none;">
        <h3>Generated SQL</h3>
        <pre id="sqlCode"><code></code></pre>
        <div class="action-buttons">
          <button class="btn-secondary" id="copySqlBtn">Copy SQL</button>
          <button class="btn-secondary" id="closeSqlBtn">Close</button>
        </div>
      </div>
    </div>
  `;

  initCanvas(container);
  bindEvents(container);
}

function initCanvas(container) {
  drawCanvas(container);
}

function drawCanvas(container) {
  const canvas = container.querySelector("#schemaCanvas");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(state.panX, state.panY);
  ctx.scale(state.zoom, state.zoom);

  state.relationships.forEach(rel => {
    const from = state.tables.find(t => t.id === rel.from);
    const to = state.tables.find(t => t.id === rel.to);
    if (!from || !to) return;

    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(from.x + 100, from.y + 50);
    ctx.lineTo(to.x + 100, to.y + 50);
    ctx.stroke();
  });

  state.tables.forEach(table => {
    drawTable(ctx, table, table.id === state.selectedTable);
  });

  ctx.restore();

  container.querySelector("#zoomLevel").textContent = Math.round(state.zoom * 100) + "%";
}

function drawTable(ctx, table, selected) {
  const headerHeight = 30;
  const rowHeight = 24;
  const width = 180;
  const height = headerHeight + table.columns.length * rowHeight + 10;

  ctx.fillStyle = selected ? "#e2e8f0" : "#f1f5f9";
  ctx.fillRect(table.x, table.y, width, height);

  ctx.fillStyle = selected ? "#1e293b" : "#334155";
  ctx.strokeRect(table.x, table.y, width, height);

  ctx.fillStyle = table.color;
  ctx.fillRect(table.x, table.y, width, headerHeight);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px Inter, sans-serif";
  ctx.fillText(table.name, table.x + 10, table.y + 20);

  ctx.fillStyle = "#334155";
  ctx.font = "13px Inter, sans-serif";
  table.columns.forEach((col, i) => {
    const y = table.y + headerHeight + i * rowHeight + 18;
    let colText = col.name + " " + col.type;
    if (col.primary) colText += " PK";
    if (col.autoIncrement) colText += " AI";
    ctx.fillText(colText, table.x + 10, y);
  });
}

function bindEvents(container) {
  const canvas = container.querySelector("#schemaCanvas");
  const addTableBtn = container.querySelector("#addTableBtn");
  const addColumnBtn = container.querySelector("#addColumnBtn");
  const exportSqlBtn = container.querySelector("#exportSqlBtn");
  const clearBtn = container.querySelector("#clearBtn");
  const zoomInBtn = container.querySelector("#zoomInBtn");
  const zoomOutBtn = container.querySelector("#zoomOutBtn");
  const saveColBtn = container.querySelector("#saveColBtn");
  const deleteColBtn = container.querySelector("#deleteColBtn");
  const copySqlBtn = container.querySelector("#copySqlBtn");
  const closeSqlBtn = container.querySelector("#closeSqlBtn");

  canvas.addEventListener("mousedown", e => handleMouseDown(e, container));
  canvas.addEventListener("mousemove", e => handleMouseMove(e, container));
  canvas.addEventListener("mouseup", e => handleMouseUp(e, container));
  canvas.addEventListener("dblclick", e => handleDoubleClick(e, container));

  addTableBtn.addEventListener("click", () => addTable(container));
  addColumnBtn.addEventListener("click", () => addColumn(container));
  exportSqlBtn.addEventListener("click", () => exportSQL(container));
  clearBtn.addEventListener("click", () => clearAll(container));
  zoomInBtn.addEventListener("click", () => {
    state.zoom = Math.min(2, state.zoom + 0.1);
    drawCanvas(container);
  });
  zoomOutBtn.addEventListener("click", () => {
    state.zoom = Math.max(0.5, state.zoom - 0.1);
    drawCanvas(container);
  });

  saveColBtn.addEventListener("click", () => saveColumn(container));
  deleteColBtn.addEventListener("click", () => deleteColumn(container));
  copySqlBtn.addEventListener("click", () => copySQL(container));
  closeSqlBtn.addEventListener("click", () => closeSQL(container));
}

function handleMouseDown(e, container) {
  const canvas = container.querySelector("#schemaCanvas");
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left - state.panX) / state.zoom;
  const y = (e.clientY - rect.top - state.panY) / state.zoom;

  state.tables.forEach(table => {
    if (
      x >= table.x &&
      x <= table.x + 180 &&
      y >= table.y &&
      y <= table.y + 30 + table.columns.length * 24
    ) {
      state.selectedTable = table;
      state.dragging = { id: table.id, startX: x - table.x, startY: y - table.y };
    }
  });

  if (state.selectedTable) {
    container.querySelector("#addColumnBtn").disabled = false;
    container.querySelector("#exportSqlBtn").disabled = false;
  }

  drawCanvas(container);
}

function handleMouseMove(e, container) {
  if (!state.dragging) return;

  const canvas = container.querySelector("#schemaCanvas");
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left - state.panX) / state.zoom;
  const y = (e.clientY - rect.top - state.panY) / state.zoom;

  const table = state.tables.find(t => t.id === state.dragging.id);
  if (table) {
    table.x = x - state.dragging.startX;
    table.y = y - state.dragging.startY;
    drawCanvas(container);
  }
}

function handleMouseUp() {
  state.dragging = null;
}

function handleDoubleClick(e, container) {
  const canvas = container.querySelector("#schemaCanvas");
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left - state.panX) / state.zoom;
  const y = (e.clientY - rect.top - state.panY) / state.zoom;

  state.tables.forEach(table => {
    const headerHeight = 30;
    const rowHeight = 24;
    if (
      x >= table.x &&
      x <= table.x + 180 &&
      y >= table.y + headerHeight &&
      y <= table.y + headerHeight + table.columns.length * rowHeight
    ) {
      const colIndex = Math.floor((y - table.y - headerHeight) / rowHeight);
      if (colIndex >= 0 && colIndex < table.columns.length) {
        showColumnEditor(container, table, table.columns[colIndex]);
      }
    }
  });
}

function showColumnEditor(container, table, column) {
  const editor = container.querySelector("#columnEditor");
  editor.style.display = "block";
  container.querySelector("#colName").value = column.name;
  container.querySelector("#colType").value = column.type;
  container.querySelector("#colPrimary").checked = column.primary;
  container.querySelector("#colAuto").checked = column.autoIncrement;
  container.querySelector("#colNull").checked = column.nullable || column.nullable === undefined;

  state.editingColumn = { table, column };
}

function addTable(container) {
  const name = prompt("Table name:", "users");
  if (!name) return;

  const table = createTable(name);
  state.tables.push(table);
  state.selectedTable = table;
  container.querySelector("#addColumnBtn").disabled = false;
  container.querySelector("#exportSqlBtn").disabled = false;
  drawCanvas(container);
}

function addColumn(container) {
  if (!state.selectedTable) return;

  const name = prompt("Column name:", "new_column");
  if (!name) return;

  state.selectedTable.columns.push({
    name,
    type: "VARCHAR(255)",
    primary: false,
    autoIncrement: false
  });
  drawCanvas(container);
}

function saveColumn(container) {
  if (!state.editingColumn) return;

  const { column } = state.editingColumn;
  column.name = container.querySelector("#colName").value;
  column.type = container.querySelector("#colType").value;
  column.primary = container.querySelector("#colPrimary").checked;
  column.autoIncrement = container.querySelector("#colAuto").checked;
  column.nullable = !container.querySelector("#colNull").checked;

  container.querySelector("#columnEditor").style.display = "none";
  state.editingColumn = null;
  drawCanvas(container);
}

function deleteColumn(container) {
  if (!state.editingColumn) return;

  const { table, column } = state.editingColumn;
  table.columns = table.columns.filter(c => c !== column);

  container.querySelector("#columnEditor").style.display = "none";
  state.editingColumn = null;
  drawCanvas(container);
}

function exportSQL(container) {
  if (state.tables.length === 0) {
    alert("Add at least one table first.");
    return;
  }

  let sql = "";

  state.tables.forEach(table => {
    sql += "CREATE TABLE " + table.name + " (\n";
    sql += table.columns
      .map(col => {
        let s = "  " + col.name + " " + col.type;
        if (col.primary) s += " PRIMARY KEY";
        if (col.autoIncrement) s += " AUTOINCREMENT";
        if (!col.nullable && !col.autoIncrement) s += " NOT NULL";
        return s;
      })
      .join(",\n");
    sql += "\n);\n\n";
  });

  state.relationships.forEach(rel => {
    const from = state.tables.find(t => t.id === rel.from);
    const to = state.tables.find(t => t.id === rel.to);
    if (from && to) {
      sql +=
        "ALTER TABLE " +
        from.name +
        " ADD FOREIGN KEY (" +
        rel.fromCol +
        ") REFERENCES " +
        to.name +
        "(" +
        rel.toCol +
        ");\n";
    }
  });

  container.querySelector("#sqlCode").textContent = sql;
  container.querySelector("#sqlOutput").style.display = "block";
}

function copySQL(container) {
  const sql = container.querySelector("#sqlCode").textContent;
  navigator.clipboard.writeText(sql);
  container.querySelector("#copySqlBtn").textContent = "Copied!";
  setTimeout(() => (container.querySelector("#copySqlBtn").textContent = "Copy SQL"), 2000);
}

function closeSQL(container) {
  container.querySelector("#sqlOutput").style.display = "none";
}

function clearAll(container) {
  if (!confirm("Clear all tables?")) return;

  state.tables = [];
  state.relationships = [];
  state.selectedTable = null;
  container.querySelector("#addColumnBtn").disabled = true;
  container.querySelector("#exportSqlBtn").disabled = true;
  drawCanvas(container);
}
