export const toolConfig = {
  id: "json-csv",
  name: "JSON to CSV",
  category: "text",
  description: "Convert JSON array to CSV format.",
  icon: "📊",
  status: "done"
};

export function jsonToCsv(data) {
  if (!Array.isArray(data)) {
    data = [data];
  }
  if (data.length === 0) return "";

  const objects = data.filter(
    item => item !== null && typeof item === "object" && !Array.isArray(item)
  );
  if (objects.length === 0) return "";

  const headers = Object.keys(objects[0]);
  const rows = objects.map(row =>
    headers
      .map(h => {
        const val = row[h];
        if (val === null || val === undefined) return "";
        const str = String(val);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      })
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

export function render(container) {
  container.innerHTML = `
    <div class="tool-layout" style="display:grid;grid-template-columns:minmax(0,1fr);gap:var(--space-4);">
      <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:var(--space-3);">
          <div>
            <label for="json-input" style="font-size:var(--text-sm);font-weight:600;color:var(--color-text-muted);display:block;margin-bottom:var(--space-2);">JSON Input (array)</label>
            <textarea id="json-input" class="text-input" placeholder='[{"name":"Alice","age":30},{"name":"Bob","age":25}]' rows="8" style="width:100%;font-family:monospace;"></textarea>
          </div>
          <div>
            <label for="csv-output" style="font-size:var(--text-sm);font-weight:600;color:var(--color-text-muted);display:block;margin-bottom:var(--space-2);">CSV Output</label>
            <textarea id="csv-output" class="text-input" readonly rows="8" style="width:100%;font-family:monospace;"></textarea>
          </div>
        </div>
        <div style="display:flex;gap:var(--space-2);margin-top:var(--space-3);flex-wrap:wrap;">
          <button id="convert-json-csv" class="btn btn-primary">Convert to CSV</button>
          <button id="copy-csv" class="btn btn-secondary">Copy CSV</button>
          <button id="clear-json" class="btn btn-secondary">Clear</button>
        </div>
      </div>
    </div>
  `;

  const textarea = document.getElementById("json-input");
  const output = document.getElementById("csv-output");
  const convertBtn = document.getElementById("convert-json-csv");
  const copyBtn = document.getElementById("copy-csv");
  const clearBtn = document.getElementById("clear-json");

  if (!textarea || !output) return;

  function convert() {
    try {
      const json = JSON.parse(textarea.value);
      const csv = jsonToCsv(json);
      output.value = csv;
    } catch (e) {
      output.value = "Error: Invalid JSON";
    }
  }

  if (convertBtn) convertBtn.addEventListener("click", convert);

  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      navigator.clipboard
        .writeText(output.value)
        .then(() => {
          copyBtn.textContent = "Copied!";
          setTimeout(() => (copyBtn.textContent = "Copy CSV"), 2000);
        })
        .catch(() => {
          copyBtn.textContent = "Failed";
          setTimeout(() => (copyBtn.textContent = "Copy CSV"), 2000);
        });
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      textarea.value = "";
      output.value = "";
      textarea.focus();
    });
  }
}

export function destroy() {}
