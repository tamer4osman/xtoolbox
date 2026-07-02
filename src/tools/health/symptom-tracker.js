import { showToast } from "../../components/toast.js";
import { downloadBlob } from "../../utils/file.js";

export const toolConfig = {
  id: "symptom-tracker",
  name: "Symptom Onset Tracker",
  category: "health",
  description: "Log symptoms with onset, severity, and notes. Export printable PDF for doctors.",
  icon: "🩺",
  accept: null,
  maxSizeMB: 0,
  keywords: ["symptom", "tracker", "health", "medical", "doctor", "log"],
  steps: [
    "Log symptoms with date, severity, and notes",
    "View timeline of symptoms",
    "Export printable summary for your doctor",
  ],
  faqs: [
    {
      question: "Is this a medical diagnostic tool?",
      answer: "No. This is a tracking tool to help you organize information for doctor visits.",
    },
    {
      question: "Is my health data private?",
      answer: "Yes. All data is stored in your browser and never leaves your device.",
    },
  ],
};

export const BODY_PARTS = [
  "Head",
  "Eyes",
  "Ears",
  "Nose",
  "Throat",
  "Chest",
  "Back",
  "Abdomen",
  "Arms",
  "Hands",
  "Legs",
  "Feet",
  "Skin",
  "General",
];

export const SEVERITY_LEVELS = [
  { value: 1, label: "Mild", color: "#22c55e" },
  { value: 2, label: "Moderate", color: "#f59e0b" },
  { value: 3, label: "Severe", color: "#ef4444" },
  { value: 4, label: "Very Severe", color: "#991b1b" },
];

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function loadData() {
  try {
    return JSON.parse(localStorage.getItem("symptom_entries") || "[]");
  } catch {
    return [];
  }
}

export function saveData(entries) {
  localStorage.setItem("symptom_entries", JSON.stringify(entries));
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function render(container) {
  let entries = loadData();

  container.innerHTML = `
    <div class="tool-layout">
      <div class="form-group">
        <label for="symptom-name">Symptom</label>
        <input type="text" id="symptom-name" class="text-input" placeholder="e.g., Headache, Nausea, Fatigue">
      </div>
      <div class="form-row">
        <div class="form-group" style="flex:1;">
          <label for="body-part">Body Part</label>
          <select id="body-part" class="text-input">
            ${BODY_PARTS.map((p) => `<option value="${p}">${p}</option>`).join("")}
          </select>
        </div>
        <div class="form-group" style="flex:1;">
          <label for="severity">Severity</label>
          <select id="severity" class="text-input">
            ${SEVERITY_LEVELS.map((s) => `<option value="${s.value}">${s.label}</option>`).join("")}
          </select>
        </div>
        <div class="form-group" style="flex:1;">
          <label for="onset-date">Onset Date & Time</label>
          <input type="datetime-local" id="onset-date" class="text-input">
        </div>
      </div>
      <div class="form-group">
        <label for="symptom-notes">Notes</label>
        <textarea id="symptom-notes" class="text-input" rows="3" placeholder="Duration, triggers, associated symptoms..."></textarea>
      </div>
      <button class="btn btn-primary btn-lg" id="add-symptom-btn" style="width:100%;">Log Symptom</button>
      <div style="display:flex;gap:var(--space-2);margin:var(--space-3) 0;">
        <button class="btn btn-secondary" id="export-pdf-btn">Export Summary</button>
        <button class="btn btn-secondary" id="clear-all-btn">Clear All</button>
      </div>
      <div id="symptoms-list"></div>
    </div>
  `;

  const symptomName = container.querySelector("#symptom-name");
  const bodyPart = container.querySelector("#body-part");
  const severity = container.querySelector("#severity");
  const onsetDate = container.querySelector("#onset-date");
  const symptomNotes = container.querySelector("#symptom-notes");
  const addSymptomBtn = container.querySelector("#add-symptom-btn");
  const symptomsList = container.querySelector("#symptoms-list");
  const exportPdfBtn = container.querySelector("#export-pdf-btn");
  const clearAllBtn = container.querySelector("#clear-all-btn");

  onsetDate.value = new Date().toISOString().slice(0, 16);

  function renderSymptoms() {
    const sorted = [...entries].sort((a, b) => new Date(b.onset) - new Date(a.onset));
    symptomsList.innerHTML =
      sorted.length === 0
        ? '<div style="color:var(--color-text-muted);">No symptoms logged yet</div>'
        : sorted
            .map((e) => {
              const sev = SEVERITY_LEVELS.find((s) => s.value === e.severity) || SEVERITY_LEVELS[0];
              return `
          <div style="padding:var(--space-3);border:1px solid var(--color-border);border-radius:var(--radius-md);margin-bottom:var(--space-2);border-left:4px solid ${sev.color};">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div>
                <span style="font-weight:700;">${e.name}</span>
                <span style="color:var(--color-text-muted);font-size:var(--text-sm);"> (${e.bodyPart})</span>
              </div>
              <button class="btn btn-secondary btn-sm remove-symptom" data-id="${e.id}">Remove</button>
            </div>
            <div style="display:flex;gap:var(--space-2);margin-top:var(--space-1);font-size:var(--text-sm);">
              <span style="padding:2px 8px;background:${sev.color};color:white;border-radius:var(--radius-sm);">${sev.label}</span>
              <span style="color:var(--color-text-muted);">${formatDate(e.onset)}</span>
            </div>
            ${e.notes ? `<div style="margin-top:var(--space-2);font-size:var(--text-sm);color:var(--color-text-muted);">${e.notes}</div>` : ""}
          </div>
        `;
            })
            .join("");

    symptomsList.querySelectorAll(".remove-symptom").forEach((btn) => {
      btn.addEventListener("click", () => {
        entries = entries.filter((e) => e.id !== btn.dataset.id);
        saveData(entries);
        renderSymptoms();
      });
    });
  }

  addSymptomBtn.addEventListener("click", () => {
    const name = symptomName.value.trim();
    if (!name) {
      showToast({ message: "Enter a symptom name.", type: "error" });
      return;
    }
    entries.push({
      id: generateId(),
      name,
      bodyPart: bodyPart.value,
      severity: parseInt(severity.value),
      onset: onsetDate.value || new Date().toISOString(),
      notes: symptomNotes.value.trim(),
    });
    saveData(entries);
    symptomName.value = "";
    symptomNotes.value = "";
    renderSymptoms();
    showToast({ message: `${name} logged.`, type: "success" });
  });

  exportPdfBtn.addEventListener("click", () => {
    if (entries.length === 0) {
      showToast({ message: "No symptoms to export.", type: "error" });
      return;
    }
    const sorted = [...entries].sort((a, b) => new Date(b.onset) - new Date(a.onset));
    const text = sorted
      .map((e) => {
        const sev = SEVERITY_LEVELS.find((s) => s.value === e.severity);
        return `[${formatDate(e.onset)}] ${e.name} (${e.bodyPart}) - ${sev?.label}\n${e.notes || "No notes"}`;
      })
      .join("\n\n");
    const header = `Symptom Log Summary\nGenerated: ${new Date().toLocaleDateString()}\nTotal entries: ${entries.length}\n${"=".repeat(40)}\n\n`;
    const blob = new Blob([header + text], { type: "text/plain" });
    downloadBlob(blob, "symptom-log.txt");
    showToast({ message: "Summary exported.", type: "success" });
  });

  clearAllBtn.addEventListener("click", () => {
    if (entries.length === 0) return;
    entries = [];
    saveData(entries);
    renderSymptoms();
    showToast({ message: "All entries cleared.", type: "success" });
  });

  renderSymptoms();
}

export function destroy() {}
