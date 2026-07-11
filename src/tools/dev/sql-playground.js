import { escapeHtml } from "../../utils/escape-html.js";

export const toolConfig = {
  id: "sql-playground",
  name: "SQL Playground",
  category: "dev",
  description: "Write and execute SQL queries in the browser using SQLite compiled to WASM.",
  icon: "🗃️",
  keywords: ["sql", "sqlite", "playground", "query", "database", "wasm"],
  accept: ".sql,.db,.sqlite",
  maxSizeMB: 10
};

let state = {
  db: null,
  SQL: null,
  schemaLoaded: false
};

const sampleTables = [
  {
    name: "users",
    sql: `CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`
  },
  {
    name: "posts",
    sql: `CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  title TEXT NOT NULL,
  body TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);`
  }
];

const sampleData = [
  {
    table: "users",
    sql: `INSERT INTO users (name, email) VALUES 
  ('Alice', 'alice@example.com'),
  ('Bob', 'bob@example.com'),
  ('Charlie', 'charlie@example.com');`
  },
  {
    table: "posts",
    sql: `INSERT INTO posts (user_id, title, body) VALUES
  (1, 'First Post', 'Hello World!'),
  (2, 'Another Post', 'More content here');`
  }
];

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-header">
        <h1>${toolConfig.name}</h1>
        <p>${toolConfig.description}</p>
      </div>

      <div class="tool-layout">
        <div class="sql-editor-section">
          <h3>SQL Query</h3>
          <textarea id="sqlInput" class="sql-textarea" placeholder="SELECT * FROM users;">SELECT * FROM users;</textarea>
          <div class="action-buttons">
            <button class="btn-primary" id="runBtn">Run Query</button>
            <button class="btn-secondary" id="loadSampleBtn">Load Sample Data</button>
            <button class="btn-secondary" id="clearBtn">Clear</button>
          </div>
        </div>

        <div class="sql-results-section">
          <h3>Results</h3>
          <div class="results-info" id="resultsInfo"></div>
          <div class="results-table-wrapper" id="resultsWrapper">
            <div class="results-placeholder">Run a query to see results</div>
          </div>
        </div>

        <div class="schema-section">
          <h3>Schema</h3>
          <div class="schema-info" id="schemaInfo">No database loaded</div>
        </div>
      </div>
    </div>
  `;

  initSqlJs(container);
}

async function initSqlJs(container) {
  try {
    const initSqlJs = document.createElement("script");
    initSqlJs.src = "https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/sql-wasm.min.js";
    initSqlJs.onload = async () => {
      state.SQL = await initSqlJsPromise();
      state.db = new state.SQL.Database();
      bindEvents(container);
      updateSchema(container);
    };
    initSqlJs.onerror = () => {
      container.querySelector("#resultsInfo").textContent =
        "Failed to load SQL.js. Please refresh.";
    };
    document.head.appendChild(initSqlJs);
  } catch (err) {
    container.querySelector("#resultsInfo").textContent = "Error: " + err.message;
  }
}

function initSqlJsPromise() {
  return new Promise((resolve, reject) => {
    if (window.initSqlJs) {
      window
        .initSqlJs({
          locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/${file}`
        })
        .then(resolve)
        .catch(reject);
    } else {
      reject(new Error("initSqlJs not found"));
    }
  });
}

function bindEvents(container) {
  const runBtn = container.querySelector("#runBtn");
  const loadSampleBtn = container.querySelector("#loadSampleBtn");
  const clearBtn = container.querySelector("#clearBtn");
  runBtn.addEventListener("click", () => executeQuery(container));
  loadSampleBtn.addEventListener("click", () => loadSampleData(container));
  clearBtn.addEventListener("click", () => clearDatabase(container));
}

function executeQuery(container) {
  if (!state.db || !state.SQL) return;

  const sql = container.querySelector("#sqlInput").value.trim();
  if (!sql) return;

  const resultsWrapper = container.querySelector("#resultsWrapper");
  const resultsInfo = container.querySelector("#resultsInfo");

  try {
    const results = state.db.exec(sql);

    if (results.length === 0) {
      const changes = state.db.getRowsModified();
      resultsInfo.textContent = `Query executed. ${changes} row(s) affected.`;
      renderResultsTable(container, [], []);
    } else {
      const columns = results[0].columns;
      const values = results[0].values;
      resultsInfo.textContent = `${values.length} row(s) returned.`;
      renderResultsTable(container, columns, values);
    }
    updateSchema(container);
  } catch (err) {
    resultsInfo.textContent = "Error: " + err.message;
    resultsWrapper.innerHTML = "<div class=\"results-error\">" + escapeHtml(err.message) + "</div>";
  }
}

function renderResultsTable(container, columns, values) {
  const wrapper = container.querySelector("#resultsWrapper");

  if (columns.length === 0) {
    wrapper.innerHTML = '<div class="results-placeholder">No results</div>';
    return;
  }

  let html = '<table class="results-table"><thead><tr>';
  columns.forEach(col => {
    html += "<th>" + escapeHtml(col) + "</th>";
  });
  html += "</tr></thead><tbody>";

  values.forEach(row => {
    html += "<tr>";
    row.forEach(cell => {
      html += "<td>" + (cell === null ? "NULL" : escapeHtml(cell)) + "</td>";
    });
    html += "</tr>";
  });

  html += "</tbody></table>";
  wrapper.innerHTML = html;
}

function loadSampleData(container) {
  if (!state.db) return;

  try {
    sampleTables.forEach(t => {
      state.db.run(t.sql);
    });

    sampleData.forEach(d => {
      state.db.run(d.sql);
    });

    updateSchema(container);
    container.querySelector("#resultsInfo").textContent = "Sample tables created: users, posts";
    container.querySelector("#resultsWrapper").innerHTML =
      '<div class="results-placeholder">Sample data loaded. Try: SELECT * FROM users</div>';
  } catch (err) {
    container.querySelector("#resultsInfo").textContent = "Error: " + err.message;
  }
}

function clearDatabase(container) {
  if (!state.db) return;

  state.db.close();
  state.db = new state.SQL.Database();
  container.querySelector("#sqlInput").value = "SELECT * FROM users;";
  container.querySelector("#resultsWrapper").innerHTML =
    '<div class="results-placeholder">Database cleared. Run a query.</div>';
  container.querySelector("#resultsInfo").textContent = "Database cleared.";
  updateSchema(container);
}

function updateSchema(container) {
  if (!state.db) return;

  const schemaInfo = container.querySelector("#schemaInfo");

  try {
    const tables = state.db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
    );

    if (tables.length === 0 || tables[0].values.length === 0) {
      schemaInfo.textContent = "No tables in database";
      return;
    }

    let html = "";
    tables[0].values.forEach(row => {
      const tableName = row[0];
      html += '<div class="schema-table"><strong>' + tableName + "</strong>";

      const columns = state.db.exec("PRAGMA table_info(" + tableName + ");");
      if (columns.length > 0) {
        columns[0].values.forEach(col => {
          html +=
            '<div class="schema-column">' +
            col[1] +
            " " +
            col[2] +
            (col[5] === 1 ? " PK" : "") +
            "</div>";
        });
      }
      html += "</div>";
    });

    schemaInfo.innerHTML = html;
  } catch (err) {
    schemaInfo.textContent = "Error: " + err.message;
  }
}
