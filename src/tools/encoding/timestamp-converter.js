import { showToast } from "../../components/toast.js";
import { copyToClipboard } from "../../utils/clipboard.js";

export const toolConfig = {
  id: "timestamp-converter",
  name: "Timestamp Converter",
  category: "encoding",
  description: "Convert between Unix timestamps and human-readable dates.",
  icon: "⏰",
  keywords: ["unix timestamp", "epoch", "date converter", "timestamp to date"],
  steps: [
    "Enter a Unix timestamp or select a date",
    "Click Convert to see the result",
    "Copy any value with one click"
  ],
  faqs: [
    {
      question: "What is a Unix timestamp?",
      answer: "A Unix timestamp is the number of seconds since January 1, 1970 (UTC)."
    },
    {
      question: "Does it support milliseconds?",
      answer: "Yes, it auto-detects seconds vs milliseconds."
    }
  ]
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-layout">
      <div class="ts-section">
        <h3>Timestamp → Date</h3>
        <div class="ts-input-row">
          <input type="text" id="ts-input" placeholder="Unix timestamp (e.g., 1704067200)" />
          <button class="btn btn-primary" id="ts-convert">Convert</button>
        </div>
      </div>

      <div class="ts-section">
        <h3>Date → Timestamp</h3>
        <div class="ts-input-row">
          <input type="datetime-local" id="date-input" />
          <button class="btn btn-primary" id="date-convert">Convert</button>
        </div>
      </div>

      <div class="ts-results" id="ts-results" style="display:none;">
        <h3>Results</h3>
        <div id="ts-results-content"></div>
      </div>

      <button class="btn btn-secondary" id="now-btn" style="margin-top:var(--space-4);">⏰ Now</button>
    </div>

    <style>
      .ts-section { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-lg); margin-bottom: var(--space-4); }
      .ts-section h3 { margin-bottom: var(--space-3); font-size: var(--text-lg); }
      .ts-input-row { display: flex; gap: var(--space-3); }
      .ts-input-row input { flex: 1; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-base); }
      .ts-results { background: var(--color-primary-light); padding: var(--space-4); border-radius: var(--radius-lg); }
      .ts-results h3 { margin-bottom: var(--space-3); }
      .ts-result-row { display: flex; justify-content: space-between; align-items: center; padding: var(--space-2) 0; border-bottom: 1px solid rgba(0,0,0,0.05); }
      .ts-result-row:last-child { border-bottom: none; }
      .ts-result-label { color: var(--color-text-secondary); font-size: var(--text-sm); }
      .ts-result-value { font-family: monospace; background: var(--color-bg); padding: var(--space-1) var(--space-2); border-radius: var(--radius-sm); cursor: pointer; font-size: var(--text-sm); }
      .ts-result-value:hover { background: var(--color-primary); color: white; }
    </style>
  `;

  const tsInput = container.querySelector("#ts-input");
  const dateInput = container.querySelector("#date-input");
  const tsConvertBtn = container.querySelector("#ts-convert");
  const dateConvertBtn = container.querySelector("#date-convert");
  const nowBtn = container.querySelector("#now-btn");
  const resultsDiv = container.querySelector("#ts-results");
  const resultsContent = container.querySelector("#ts-results-content");

  function getRelativeTime(date) {
    const now = new Date();
    const diff = now - date;
    const abs = Math.abs(diff);
    const seconds = Math.floor(abs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    let unit, value;
    if (years > 0) {
      unit = "year";
      value = years;
    } else if (months > 0) {
      unit = "month";
      value = months;
    } else if (days > 0) {
      unit = "day";
      value = days;
    } else if (hours > 0) {
      unit = "hour";
      value = hours;
    } else if (minutes > 0) {
      unit = "minute";
      value = minutes;
    } else {
      unit = "second";
      value = seconds;
    }

    const prefix = diff > 0 ? "ago" : "from now";
    return `${value} ${unit}${value > 1 ? "s" : ""} ${prefix}`;
  }

  function showResults(rows) {
    resultsContent.innerHTML = rows
      .map(
        ([label, value]) => `
      <div class="ts-result-row">
        <span class="ts-result-label">${label}</span>
        <span class="ts-result-value" data-copy="${value}">${value}</span>
      </div>
    `
      )
      .join("");
    resultsDiv.style.display = "block";

    resultsContent.querySelectorAll(".ts-result-value").forEach(el => {
      el.addEventListener("click", () => {
        copyToClipboard(el.dataset.copy);
        showToast({ message: "Copied!", type: "success" });
      });
    });
  }

  tsConvertBtn.addEventListener("click", () => {
    const ts = parseInt(tsInput.value, 10);
    if (isNaN(ts)) {
      showToast({ message: "Please enter a valid timestamp", type: "error" });
      return;
    }
    const date = ts < 10000000000 ? new Date(ts * 1000) : new Date(ts);
    showResults([
      ["Local", date.toLocaleString()],
      ["ISO", date.toISOString()],
      ["UTC", date.toUTCString()],
      ["Relative", getRelativeTime(date)]
    ]);
  });

  dateConvertBtn.addEventListener("click", () => {
    const date = new Date(dateInput.value);
    if (isNaN(date.getTime())) {
      showToast({ message: "Please select a valid date", type: "error" });
      return;
    }
    showResults([
      ["Seconds", Math.floor(date.getTime() / 1000).toString()],
      ["Milliseconds", date.getTime().toString()],
      ["ISO", date.toISOString()],
      ["UTC", date.toUTCString()]
    ]);
  });

  nowBtn.addEventListener("click", () => {
    const now = new Date();
    tsInput.value = Math.floor(now.getTime() / 1000).toString();
    dateInput.value = now.toISOString().slice(0, 16);
    tsConvertBtn.click();
  });
}

export function destroy() {}
