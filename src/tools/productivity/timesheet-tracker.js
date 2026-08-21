import { downloadBlob } from "../../utils/file.js";

const STORAGE_KEY = "timesheet-tracker-v1";
const MS_HOUR = 3600000;
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function weekStart(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay() === 0 ? 7 : d.getDay();
  d.setDate(d.getDate() - (day - 1));
  return d;
}

export function getWeekKey(date = new Date()) {
  const ws = weekStart(date);
  const target = new Date(ws);
  target.setDate(target.getDate() + 3);
  const yearStart = new Date(target.getFullYear(), 0, 1);
  const week = Math.ceil(((target - yearStart) / 86400000 + 1) / 7);
  return `${target.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function sumEntries(entries) {
  return entries.reduce((acc, e) => acc + (e.out ? e.out - e.in : Date.now() - e.in), 0);
}

export function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms < 0) ms = 0;
  const mins = Math.floor(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function computeDailyTotals(entries, refDate = new Date()) {
  const ws = weekStart(refDate).getTime();
  const totals = Array(7).fill(0);
  for (const e of entries) {
    if (!e.out) continue;
    for (let i = 0; i < 7; i++) {
      const dayStart = ws + i * 86400000;
      const dayEnd = dayStart + 86400000;
      const overlap = Math.min(e.out, dayEnd) - Math.max(e.in, dayStart);
      if (overlap > 0) totals[i] += overlap;
    }
  }
  return totals;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

export function toLocalInputValue(ms) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function toCsv(entries) {
  const rows = [["In", "Out", "Hours", "Note"]];
  [...entries]
    .sort((a, b) => a.in - b.in)
    .forEach(e => {
      const hours = e.out ? ((e.out - e.in) / MS_HOUR).toFixed(2) : "";
      rows.push([
        toLocalInputValue(e.in),
        e.out ? toLocalInputValue(e.out) : "",
        hours,
        `"${(e.note || "").replace(/"/g, '""')}"`
      ]);
    });
  return rows.map(r => r.join(",")).join("\n");
}

function loadData() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (parsed && Array.isArray(parsed.entries)) return parsed;
  } catch {
    /* storage unavailable */
  }
  return { openEntryId: null, entries: [] };
}

let uidCounter = 0;
function uid() {
  uidCounter += 1;
  return `ts${Date.now().toString(36)}${uidCounter}`;
}

let tickTimer = null;
export function cleanup() {
  clearInterval(tickTimer);
  tickTimer = null;
}

export const toolConfig = {
  id: "timesheet-tracker",
  name: "Timesheet Tracker",
  category: "productivity",
  description: "Track work hours with clock-in/out and weekly summaries.",
  icon: "⏱️",
  accept: null,
  maxSizeMB: null,
  keywords: ["timesheet", "hours", "tracker", "clock", "work"],
  steps: [
    "Clock in when you start working",
    "Clock out when you stop",
    "Review your weekly summary",
    "Export as CSV when needed"
  ],
  faqs: [
    {
      question: "Where is my data stored?",
      answer: "Everything is saved locally in your browser. Nothing is uploaded anywhere."
    },
    {
      question: "I forgot to clock out — what do I do?",
      answer:
        "Edit any past entry's times manually using the date/time fields in the history list below."
    }
  ]
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <h1>⏱️ ${toolConfig.name}</h1>
      <p>${toolConfig.description}</p>
      <div class="ts-clock-card">
        <div id="ts-status" class="ts-status"></div>
        <button id="ts-toggle" class="btn btn-primary ts-btn"></button>
      </div>
      <div class="ts-week">
        <h2>This Week <span id="ts-week-key" class="ts-week-key"></span></h2>
        <div id="ts-total" class="ts-total"></div>
        <div id="ts-days" class="ts-days"></div>
      </div>
      <details class="ts-manual">
        <summary>Add / fix an entry manually</summary>
        <div class="ts-manual-form">
          <label>In <input type="datetime-local" id="ts-in"></label>
          <label>Out <input type="datetime-local" id="ts-out"></label>
          <input type="text" id="ts-note" placeholder="Note (optional)" maxlength="80">
          <button id="ts-add" class="btn btn-secondary">Save entry</button>
        </div>
      </details>
      <h2>History</h2>
      <div id="ts-history" aria-live="polite"></div>
      <div class="ts-footer-actions">
        <button id="ts-export" class="btn btn-secondary">Export CSV</button>
        <button id="ts-clear" class="btn btn-danger">Delete All</button>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .ts-clock-card { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); text-align: center; margin: var(--space-3) 0; }
    .ts-status { font-size: var(--text-base); min-height: 24px; margin-bottom: var(--space-2); }
    .ts-status.active { color: var(--color-success, #2a2); font-weight: 600; }
    .ts-btn { font-size: var(--text-lg); padding: var(--space-3) var(--space-6); }
    .ts-btn.out { background: var(--color-danger, #c33); }
    .ts-week h2, #ts-history ~ h2 { margin-top: var(--space-4); }
    .ts-week-key { color: var(--color-text-muted, #888); font-size: var(--text-sm); margin-left: var(--space-2); }
    .ts-total { font-size: var(--text-2xl); font-weight: 700; margin-bottom: var(--space-2); }
    .ts-days { display: flex; gap: var(--space-2); flex-wrap: wrap; }
    .ts-day { flex: 1; min-width: 70px; background: var(--color-surface); border-radius: var(--radius-md); padding: var(--space-2); text-align: center; font-size: var(--text-sm); }
    .ts-day.today { outline: 2px solid var(--color-primary); }
    .ts-day strong { display: block; }
    .ts-manual { margin: var(--space-3) 0; }
    .ts-manual-form { display: flex; flex-wrap: wrap; gap: var(--space-2); align-items: end; padding-top: var(--space-2); }
    .ts-manual-form label { display: flex; flex-direction: column; gap: 2px; font-size: var(--text-sm); }
    .ts-manual-form input { padding: var(--space-1); border: 1px solid var(--color-border); border-radius: var(--radius-sm); }
    .ts-entry { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2) 0; border-bottom: 1px solid var(--color-border); font-size: var(--text-sm); flex-wrap: wrap; }
    .ts-entry .ts-dur { font-weight: 600; min-width: 64px; }
    .ts-entry .ts-note-txt { color: var(--color-text-muted, #888); }
    .ts-entry input[type=datetime-local] { border: none; background: transparent; font-size: var(--text-sm); max-width: 175px; }
    .ts-del { background: none; border: none; cursor: pointer; color: var(--color-text-muted, #999); }
    .ts-del:hover { color: var(--color-danger, #d33); }
    .ts-empty { color: var(--color-text-muted, #888); font-style: italic; }
    .ts-footer-actions { display: flex; gap: var(--space-2); margin-top: var(--space-4); }
    @media (max-width: 600px) { .ts-entry input[type=datetime-local] { max-width: 150px; } }
  `;
  container.appendChild(style);

  let data = loadData();

  clearInterval(tickTimer);
  tickTimer = null;

  const statusEl = container.querySelector("#ts-status");
  const toggleBtn = container.querySelector("#ts-toggle");
  const totalEl = container.querySelector("#ts-total");
  const daysEl = container.querySelector("#ts-days");
  const historyEl = container.querySelector("#ts-history");
  const exportBtn = container.querySelector("#ts-export");

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage unavailable */
    }
  }

  function isDead() {
    return !container.isConnected;
  }

  function renderAll() {
    if (isDead()) return;
    renderStatus();
    renderWeek();
    renderHistory();
  }

  function renderStatus() {
    if (isDead()) return;
    const open = data.entries.find(e => e.id === data.openEntryId);
    toggleBtn.textContent = open ? "⏹ Clock Out" : "▶ Clock In";
    toggleBtn.classList.toggle("out", Boolean(open));
    if (open) {
      statusEl.textContent = `Clocked in at ${new Date(open.in).toLocaleTimeString()} — ${formatDuration(Date.now() - open.in)}`;
      statusEl.classList.add("active");
    } else {
      statusEl.textContent = "Not clocked in";
      statusEl.classList.remove("active");
    }
  }

  function renderWeek() {
    if (isDead()) return;
    const weekKeyEl = container.querySelector("#ts-week-key");
    if (!weekKeyEl) return;
    weekKeyEl.textContent = getWeekKey();
    const weekEntries = data.entries.filter(e => computeDailyTotals([e]).some(t => t > 0));
    const daily = computeDailyTotals(weekEntries);
    const todayIdx = (new Date().getDay() || 7) - 1;
    totalEl.textContent = formatDuration(sumEntries(weekEntries));
    daysEl.innerHTML = daily
      .map(
        (ms, i) =>
          `<div class="ts-day ${i === todayIdx ? "today" : ""}"><strong>${DAY_LABELS[i]}</strong>${ms ? formatDuration(ms) : "–"}</div>`
      )
      .join("");
  }

  function renderHistory() {
    const recent = [...data.entries].sort((a, b) => b.in - a.in).slice(0, 30);
    if (!recent.length) {
      historyEl.innerHTML = `<p class="ts-empty">No entries yet — hit Clock In.</p>`;
      return;
    }
    historyEl.innerHTML = recent
      .map(
        e => `
      <div class="ts-entry" data-id="${e.id}">
        <span class="ts-dur">${e.out ? formatDuration(e.out - e.in) : "…"}</span>
        <input type="datetime-local" value="${toLocalInputValue(e.in)}" data-field="in" aria-label="Clock-in time">
        <span>→</span>
        <input type="datetime-local" value="${e.out ? toLocalInputValue(e.out) : ""}" data-field="out" aria-label="Clock-out time">
        <input type="text" value="${String(e.note || "").replace(/"/g, "&quot;")}" placeholder="note" maxlength="80" class="ts-note-input" style="flex:1;border:1px solid var(--color-border);border-radius:var(--radius-sm);padding:var(--space-1)">
        <button type="button" class="ts-del" title="Delete entry" aria-label="Delete entry">✕</button>
      </div>`
      )
      .join("");
  }

  toggleBtn.addEventListener("click", () => {
    const now = Date.now();
    const open = data.entries.find(e => e.id === data.openEntryId);
    if (open) {
      if (now <= open.in) {
        data.entries = data.entries.filter(e => e.id !== open.id);
      } else {
        open.out = now;
      }
      data.openEntryId = null;
      clearInterval(tickTimer);
      tickTimer = null;
    } else {
      const entry = { id: uid(), in: now, out: null, note: "" };
      data.entries.push(entry);
      data.openEntryId = entry.id;
      tickTimer = setInterval(renderStatus, 1000);
    }
    save();
    renderAll();
  });

  historyEl.addEventListener("change", e => {
    const row = e.target.closest(".ts-entry");
    if (!row) return;
    const entry = data.entries.find(x => x.id === row.dataset.id);
    if (!entry) return;
    const val = e.target.value ? new Date(e.target.value).getTime() : null;
    if (e.target.dataset.field === "in") entry.in = val ?? entry.in;
    if (e.target.dataset.field === "out") entry.out = val;
    save();
    renderAll();
  });

  historyEl.addEventListener("click", e => {
    const del = e.target.closest(".ts-del");
    if (!del) return;
    const id = del.closest(".ts-entry").dataset.id;
    data.entries = data.entries.filter(x => x.id !== id);
    if (data.openEntryId === id) {
      data.openEntryId = null;
      clearInterval(tickTimer);
      tickTimer = null;
    }
    save();
    renderAll();
  });

  container.querySelector("#ts-add").addEventListener("click", () => {
    const inV = container.querySelector("#ts-in").value;
    const outV = container.querySelector("#ts-out").value;
    const note = container.querySelector("#ts-note").value.trim();
    const inMs = new Date(inV).getTime();
    const outMs = outV ? new Date(outV).getTime() : null;
    if (!Number.isFinite(inMs) || (outMs !== null && outMs <= inMs)) {
      statusEl.textContent = "Invalid times — Out must be after In.";
      return;
    }
    data.entries.push({ id: uid(), in: inMs, out: outMs, note });
    container.querySelector("#ts-in").value = "";
    container.querySelector("#ts-out").value = "";
    container.querySelector("#ts-note").value = "";
    save();
    renderAll();
  });

  historyEl.addEventListener("input", e => {
    if (e.target.classList.contains("ts-note-input")) {
      const entry = data.entries.find(x => x.id === e.target.closest(".ts-entry").dataset.id);
      if (entry) {
        entry.note = e.target.value;
        save();
      }
    }
  });

  exportBtn.addEventListener("click", () => {
    if (!data.entries.length) return;
    const blob = new Blob([toCsv(data.entries)], { type: "text/csv" });
    downloadBlob(blob, `timesheet-${getWeekKey()}.csv`);
  });

  container.querySelector("#ts-clear").addEventListener("click", () => {
    if (!window.confirm("Delete ALL timesheet entries? This cannot be undone.")) return;
    data = { openEntryId: null, entries: [] };
    clearInterval(tickTimer);
    tickTimer = null;
    save();
    renderAll();
  });

  if (data.openEntryId && data.entries.some(e => e.id === data.openEntryId)) {
    tickTimer = setInterval(renderStatus, 1000);
  }

  renderAll();
}
