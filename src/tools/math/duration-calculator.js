export const toolConfig = {
  id: "duration-calculator",
  name: "Time Duration Calculator",
  category: "math",
  description:
    "Calculate the exact duration between two dates/times. See results in years, months, weeks, days, hours, minutes, and seconds.",
  icon: "⏳",
  accept: null,
  maxSizeMB: null,
  keywords: [
    "duration calculator",
    "time duration",
    "date difference",
    "time span",
    "elapsed time",
    "hours between dates"
  ],
  steps: [
    "Pick a start date and time",
    "Pick an end date and time",
    "See the duration broken down in multiple units"
  ],
  faqs: [
    {
      question: "What is the difference between this and Date Difference?",
      answer:
        "This calculator includes time-of-day precision and shows durations in years, months, weeks, days, hours, minutes, and seconds simultaneously."
    },
    {
      question: "Does it account for daylight saving?",
      answer:
        "Calculations are based on UTC timestamps, which gives consistent results regardless of DST changes."
    }
  ]
};

export function render(container) {
  const now = new Date();
  const pad = n => String(n).padStart(2, "0");
  const nowStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const nowTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  container.innerHTML = `
    <div class="tool-layout">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
        <div class="form-group">
          <label>Start Date</label>
          <input type="date" id="dc-start-date" class="text-input" value="${nowStr}">
        </div>
        <div class="form-group">
          <label>Start Time</label>
          <input type="time" id="dc-start-time" class="text-input" value="${nowTime}">
        </div>
        <div class="form-group">
          <label>End Date</label>
          <input type="date" id="dc-end-date" class="text-input" value="${nowStr}">
        </div>
        <div class="form-group">
          <label>End Time</label>
          <input type="time" id="dc-end-time" class="text-input" value="${nowTime}">
        </div>
      </div>

      <div style="display:flex;gap:var(--space-3);margin:var(--space-4) 0;">
        <button class="btn btn-primary" id="dc-calc" style="flex:1;">Calculate</button>
        <button class="btn btn-secondary" id="dc-now" style="flex:none;">Now → Now</button>
      </div>

      <div id="dc-results" style="display:none;">
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:var(--space-3);margin-bottom:var(--space-4);">
          <div class="result-card" style="background:var(--color-surface);border-radius:var(--radius-md);padding:var(--space-3);text-align:center;">
            <div style="font-size:var(--text-xs);color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.5px;">Years</div>
            <div id="dc-years" style="font-size:var(--text-2xl);font-weight:700;margin-top:var(--space-1);">0</div>
          </div>
          <div class="result-card" style="background:var(--color-surface);border-radius:var(--radius-md);padding:var(--space-3);text-align:center;">
            <div style="font-size:var(--text-xs);color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.5px;">Months</div>
            <div id="dc-months" style="font-size:var(--text-2xl);font-weight:700;margin-top:var(--space-1);">0</div>
          </div>
          <div class="result-card" style="background:var(--color-surface);border-radius:var(--radius-md);padding:var(--space-3);text-align:center;">
            <div style="font-size:var(--text-xs);color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.5px;">Weeks</div>
            <div id="dc-weeks" style="font-size:var(--text-2xl);font-weight:700;margin-top:var(--space-1);">0</div>
          </div>
          <div class="result-card" style="background:var(--color-surface);border-radius:var(--radius-md);padding:var(--space-3);text-align:center;">
            <div style="font-size:var(--text-xs);color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.5px;">Days</div>
            <div id="dc-days" style="font-size:var(--text-2xl);font-weight:700;margin-top:var(--space-1);">0</div>
          </div>
          <div class="result-card" style="background:var(--color-surface);border-radius:var(--radius-md);padding:var(--space-3);text-align:center;">
            <div style="font-size:var(--text-xs);color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.5px;">Hours</div>
            <div id="dc-hours" style="font-size:var(--text-2xl);font-weight:700;margin-top:var(--space-1);">0</div>
          </div>
          <div class="result-card" style="background:var(--color-surface);border-radius:var(--radius-md);padding:var(--space-3);text-align:center;">
            <div style="font-size:var(--text-xs);color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.5px;">Minutes</div>
            <div id="dc-minutes" style="font-size:var(--text-2xl);font-weight:700;margin-top:var(--space-1);">0</div>
          </div>
          <div class="result-card" style="background:var(--color-surface);border-radius:var(--radius-md);padding:var(--space-3);text-align:center;">
            <div style="font-size:var(--text-xs);color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.5px;">Seconds</div>
            <div id="dc-seconds" style="font-size:var(--text-2xl);font-weight:700;margin-top:var(--space-1);">0</div>
          </div>
        </div>

        <div style="background:var(--color-surface);border-radius:var(--radius-md);padding:var(--space-4);">
          <div style="font-weight:600;margin-bottom:var(--space-2);">Breakdown</div>
          <div id="dc-breakdown" style="font-family:monospace;font-size:var(--text-sm);line-height:1.8;"></div>
        </div>
      </div>
    </div>
  `;

  const startDate = container.querySelector("#dc-start-date");
  const startTime = container.querySelector("#dc-start-time");
  const endDate = container.querySelector("#dc-end-date");
  const endTime = container.querySelector("#dc-end-time");
  const resultsDiv = container.querySelector("#dc-results");
  const calcBtn = container.querySelector("#dc-calc");
  const nowBtn = container.querySelector("#dc-now");

  function getMs(v) {
    switch (v) {
      case "years":
        return 365.25 * 24 * 60 * 60 * 1000;
      case "months":
        return 30.4375 * 24 * 60 * 60 * 1000;
      case "weeks":
        return 7 * 24 * 60 * 60 * 1000;
      case "days":
        return 24 * 60 * 60 * 1000;
      case "hours":
        return 60 * 60 * 1000;
      case "minutes":
        return 60 * 1000;
      case "seconds":
        return 1000;
      default:
        return 1;
    }
  }

  function calculate() {
    const s = new Date(`${startDate.value}T${startTime.value || "00:00"}`);
    const e = new Date(`${endDate.value}T${endTime.value || "00:00"}`);
    const diff = e - s;

    if (diff < 0) {
      resultsDiv.style.display = "block";
      resultsDiv
        .querySelectorAll(
          ".result-card #dc-years, .result-card #dc-months, .result-card #dc-weeks, .result-card #dc-days, .result-card #dc-hours, .result-card #dc-minutes, .result-card #dc-seconds"
        )
        .forEach(el => {});
      document
        .querySelectorAll(
          "#dc-years, #dc-months, #dc-weeks, #dc-days, #dc-hours, #dc-minutes, #dc-seconds"
        )
        .forEach(el => {
          if (resultsDiv.contains(el)) el.textContent = "—";
        });
      container.querySelector("#dc-breakdown").textContent = "End must be after start.";
      return;
    }

    const absMs = Math.abs(diff);
    const units = ["years", "months", "weeks", "days", "hours", "minutes", "seconds"];
    const ids = [
      "dc-years",
      "dc-months",
      "dc-weeks",
      "dc-days",
      "dc-hours",
      "dc-minutes",
      "dc-seconds"
    ];

    ids.forEach((id, i) => {
      const val = absMs / getMs(units[i]);
      const el = container.querySelector(`#${id}`);
      if (el) el.textContent = formatNum(val);
    });

    const totalDays = Math.floor(absMs / getMs("days"));
    const h = Math.floor((absMs % getMs("days")) / getMs("hours"));
    const m = Math.floor((absMs % getMs("hours")) / getMs("minutes"));
    const secs = Math.floor((absMs % getMs("minutes")) / getMs("seconds"));

    const years = Math.floor(totalDays / 365.25);
    const remDaysAfterYears = totalDays % 365.25;
    const months = Math.floor(remDaysAfterYears / 30.4375);
    const days = Math.floor(remDaysAfterYears % 30.4375);

    let breakdown = "";
    if (years > 0) breakdown += `${years}y `;
    if (months > 0) breakdown += `${months}mo `;
    if (days > 0) breakdown += `${days}d `;
    if (h > 0 || m > 0 || secs > 0 || (!years && !months && !days)) {
      breakdown += `${h}h ${m}m ${secs}s`;
    }

    container.querySelector("#dc-breakdown").textContent = breakdown.trim();

    resultsDiv.style.display = "block";
  }

  function formatNum(n) {
    if (n >= 1e6) return n.toExponential(2);
    if (n >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
    if (n >= 1) return n.toFixed(1);
    if (n >= 0.001) return n.toFixed(3);
    return n < 1e-6 ? n.toExponential(2) : n.toFixed(6);
  }

  calcBtn.addEventListener("click", calculate);
  nowBtn.addEventListener("click", () => {
    const n = new Date();
    startDate.value = `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
    startTime.value = `${pad(n.getHours())}:${pad(n.getMinutes())}`;
    endDate.value = startDate.value;
    endTime.value = startTime.value;
    calculate();
  });

  calculate();
}

export function destroy() {}
