import { showToast } from "../../components/toast.js";

export const toolConfig = {
  id: "net-worth-tracker",
  name: "Net Worth Tracker",
  category: "finance",
  description: "Private net worth tracker with assets and liabilities. Data stays local.",
  icon: "📊",
  accept: null,
  maxSizeMB: 0,
  keywords: ["net", "worth", "tracker", "assets", "liabilities", "finance"],
  steps: [
    "Add assets (bank, investments, property)",
    "Add liabilities (loans, credit cards)",
    "Track your net worth in real time"
  ],
  faqs: [
    {
      question: "Is my financial data stored anywhere?",
      answer: "No. All data is stored in your browser. Nothing is sent to any server."
    },
    {
      question: "Can I export my data?",
      answer: "Yes. You can export all data as JSON and import it back later."
    }
  ]
};

export const ASSET_TYPES = [
  "Bank Account",
  "Savings Account",
  "Investment Account",
  "Retirement Account",
  "Real Estate",
  "Vehicle",
  "Other"
];
export const LIABILITY_TYPES = [
  "Mortgage",
  "Auto Loan",
  "Student Loan",
  "Credit Card",
  "Personal Loan",
  "Other"
];

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function calculateNetWorth(entries) {
  const assets = entries.filter(e => e.type === "asset").reduce((sum, e) => sum + e.amount, 0);
  const liabilities = entries
    .filter(e => e.type === "liability")
    .reduce((sum, e) => sum + e.amount, 0);
  return { assets, liabilities, netWorth: assets - liabilities };
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function escapeHtml(str) {
  return String(str).replace(
    /[&<>"']/g,
    c =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[c]
  );
}

export function validateEntries(data) {
  return (
    Array.isArray(data) &&
    data.every(
      it =>
        it &&
        (it.type === "asset" || it.type === "liability") &&
        typeof it.name === "string" &&
        typeof it.amount === "number"
    )
  );
}

export function loadData() {
  try {
    return JSON.parse(localStorage.getItem("networth_entries") || "[]");
  } catch {
    return [];
  }
}

export function saveData(entries) {
  try {
    localStorage.setItem("networth_entries", JSON.stringify(entries));
  } catch (err) {
    console.error("Failed to save net worth data:", err);
  }
}

export function render(container) {
  let entries = loadData();

  container.innerHTML = `
    <div class="tool-layout">
      <div style="display:flex;gap:var(--space-3);margin-bottom:var(--space-3);flex-wrap:wrap;">
        <div style="flex:1;min-width:200px;padding:var(--space-3);background:var(--color-bg-secondary);border-radius:var(--radius-md);">
          <div style="font-size:var(--text-sm);color:var(--color-text-muted);">Total Assets</div>
          <div id="total-assets" style="font-size:var(--text-xl);font-weight:700;color:#22c55e;">$0</div>
        </div>
        <div style="flex:1;min-width:200px;padding:var(--space-3);background:var(--color-bg-secondary);border-radius:var(--radius-md);">
          <div style="font-size:var(--text-sm);color:var(--color-text-muted);">Total Liabilities</div>
          <div id="total-liabilities" style="font-size:var(--text-xl);font-weight:700;color:#ef4444;">$0</div>
        </div>
        <div style="flex:1;min-width:200px;padding:var(--space-3);background:var(--color-bg-secondary);border-radius:var(--radius-md);">
          <div style="font-size:var(--text-sm);color:var(--color-text-muted);">Net Worth</div>
          <div id="net-worth" style="font-size:var(--text-xl);font-weight:700;">$0</div>
        </div>
      </div>
      <div style="display:flex;gap:var(--space-3);margin-bottom:var(--space-3);flex-wrap:wrap;">
        <div style="flex:1;min-width:300px;">
          <h3 style="font-weight:600;margin-bottom:var(--space-2);">Add Entry</h3>
          <div class="form-row">
            <div class="form-group" style="flex:1;">
              <label for="entry-type">Type</label>
              <select id="entry-type" class="text-input">
                <option value="asset">Asset</option>
                <option value="liability">Liability</option>
              </select>
            </div>
            <div class="form-group" style="flex:2;">
              <label for="entry-name">Name</label>
              <input type="text" id="entry-name" class="text-input" placeholder="e.g., Savings Account">
            </div>
          </div>
          <div class="form-group">
            <label for="entry-amount">Amount ($)</label>
            <input type="number" id="entry-amount" class="text-input" placeholder="0">
          </div>
          <button class="btn btn-primary" id="add-entry-btn" style="width:100%;">Add Entry</button>
        </div>
        <div style="flex:1;min-width:300px;">
          <h3 style="font-weight:600;margin-bottom:var(--space-2);">Entries</h3>
          <div id="entries-list" style="max-height:300px;overflow-y:auto;"></div>
        </div>
      </div>
      <div style="display:flex;gap:var(--space-2);margin-bottom:var(--space-3);">
        <button class="btn btn-secondary" id="export-btn">Export JSON</button>
        <button class="btn btn-secondary" id="import-btn">Import JSON</button>
        <input type="file" id="import-file" accept=".json" style="display:none;">
      </div>
    </div>
  `;

  const totalAssets = container.querySelector("#total-assets");
  const totalLiabilities = container.querySelector("#total-liabilities");
  const netWorthEl = container.querySelector("#net-worth");
  const entryType = container.querySelector("#entry-type");
  const entryName = container.querySelector("#entry-name");
  const entryAmount = container.querySelector("#entry-amount");
  const addEntryBtn = container.querySelector("#add-entry-btn");
  const entriesList = container.querySelector("#entries-list");
  const exportBtn = container.querySelector("#export-btn");
  const importBtn = container.querySelector("#import-btn");
  const importFile = container.querySelector("#import-file");

  function renderEntries() {
    const { assets, liabilities, netWorth } = calculateNetWorth(entries);
    totalAssets.textContent = formatCurrency(assets);
    totalLiabilities.textContent = formatCurrency(liabilities);
    netWorthEl.textContent = formatCurrency(netWorth);
    netWorthEl.style.color = netWorth >= 0 ? "#22c55e" : "#ef4444";

    entriesList.innerHTML =
      entries.length === 0
        ? '<div style="color:var(--color-text-muted);">No entries yet</div>'
        : entries
            .map(
              e => `
        <div style="display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2);border:1px solid var(--color-border);border-radius:var(--radius-sm);margin-bottom:var(--space-1);">
          <span style="width:8px;height:8px;border-radius:50%;background:${e.type === "asset" ? "#22c55e" : "#ef4444"};"></span>
          <span style="flex:1;font-weight:500;">${escapeHtml(e.name)}</span>
          <span style="color:${e.type === "asset" ? "#22c55e" : "#ef4444"};">${e.type === "asset" ? "+" : "-"}${formatCurrency(e.amount)}</span>
          <button class="btn btn-secondary btn-sm remove-entry" data-id="${escapeHtml(e.id)}">Remove</button>
        </div>
      `
            )
            .join("");

    entriesList.querySelectorAll(".remove-entry").forEach(btn => {
      btn.addEventListener("click", () => {
        entries = entries.filter(e => e.id !== btn.dataset.id);
        saveData(entries);
        renderEntries();
      });
    });
  }

  addEntryBtn.addEventListener("click", () => {
    const name = entryName.value.trim();
    const amount = parseFloat(entryAmount.value);
    if (!name || isNaN(amount) || amount <= 0) {
      showToast({ message: "Enter valid name and amount.", type: "error" });
      return;
    }
    entries.push({
      id: generateId(),
      type: entryType.value,
      name,
      amount,
      date: new Date().toISOString()
    });
    saveData(entries);
    entryName.value = "";
    entryAmount.value = "";
    renderEntries();
    showToast({ message: `${name} added.`, type: "success" });
  });

  exportBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "networth-data.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast({ message: "Data exported.", type: "success" });
  });

  importBtn.addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!validateEntries(parsed)) {
        throw new Error("Invalid data shape");
      }
      if (entries.length > 0 && !confirm("This will replace all existing entries. Continue?")) {
        return;
      }
      entries = parsed.map(it => ({ ...it, id: it.id || generateId() }));
      saveData(entries);
      renderEntries();
      showToast({ message: "Data imported.", type: "success" });
    } catch {
      showToast({ message: "Invalid JSON file.", type: "error" });
    }
    importFile.value = "";
  });

  renderEntries();
}

export function destroy() {}
