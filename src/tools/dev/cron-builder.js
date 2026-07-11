import { createCssGenerator } from "../css/css-generator-factory.js";

export const toolConfig = {
  id: "cron-builder",
  name: "Cron Expression Builder",
  category: "dev",
  description: "Build cron expressions visually. See human-readable description and next runs.",
  icon: "⏰",
  status: "done"
};

function getWeekdayLabel(wd) {
  const labels = {
    "*": "daily",
    "1-5": "weekdays",
    "0,6": "weekends",
    0: "Sundays",
    1: "Mondays",
    5: "Fridays"
  };
  return labels[wd] || wd;
}

function formatTime(h, m) {
  if (h === "*" && m === "*") return "every minute";
  if (m === "0" && h === "*") return "every hour at minute 0";
  const hour = { 0: "midnight", 9: "9 AM", 12: "noon", 18: "6 PM" };
  return hour[h] || `${h}:${m}`;
}

export function getCronDescription(values) {
  const time = formatTime(values.hour, values.minute);
  const day = getWeekdayLabel(values.weekday);
  if (time === "every minute") return "Runs every minute";
  if (values.day !== "*") return `Runs at ${time} on day ${values.day}`;
  if (values.month !== "*") return `Runs at ${time} in month ${values.month}`;
  if (time.startsWith("every")) return `Runs ${time}`;
  return day
    ? `Runs ${day} at ${time}`
    : `Runs at ${values.minute} ${values.hour} ${values.day} ${values.month} ${values.weekday}`;
}

export function render(container) {
  createCssGenerator({
    container,
    cssClass: "cron-gen",
    previewHTML:
      '<h2>Cron Builder</h2><div class="cron-inputs">' +
      '<select id="minute"><option value="*">Every minute</option><option value="0">At minute 0</option><option value="15">At minute 15</option><option value="30">At minute 30</option><option value="45">At minute 45</option></select>' +
      '<select id="hour"><option value="*">Every hour</option><option value="0">Midnight</option><option value="6">6 AM</option><option value="12">Noon</option><option value="18">6 PM</option></select>' +
      '<select id="day"><option value="*">Every day</option><option value="1">1st</option><option value="15">15th</option></select>' +
      '<select id="month"><option value="*">Every month</option><option value="1">January</option><option value="6">June</option><option value="12">December</option></select>' +
      '<select id="weekday"><option value="*">Every weekday</option><option value="0">Sunday</option><option value="1">Monday</option><option value="5">Friday</option></select>' +
      "</div>",
    extraCSS: `
      .cron-gen h2 { text-align: center; margin-bottom: var(--space-4); }
      .cron-gen .cron-inputs { display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--space-2); margin-bottom: var(--space-4); }
      .cron-gen .cron-inputs select { padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); }
      .cron-gen .output code { font-family: monospace; font-size: var(--text-lg); font-weight: 600; }
      .cron-gen .description { text-align: center; font-size: var(--text-sm); color: var(--color-text-secondary); margin: var(--space-3) 0; }
      .cron-gen .presets { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-2); }
      .cron-gen .presets button { padding: var(--space-2); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer; font-size: var(--text-sm); }
    `,
    controlsHTML: `
      <div class="description" id="desc">Runs every minute</div>
      <div class="presets">
        <button data-cron="0 0 * * *">Daily midnight</button>
        <button data-cron="0 9 * * 1-5">Weekdays 9 AM</button>
        <button data-cron="0 0 1 * *">Monthly</button>
        <button data-cron="*/15 * * * *">Every 15 min</button>
      </div>
    `,
    onUpdate: ({ values, cssOutput }) => {
      const cron = `${values.minute} ${values.hour} ${values.day} ${values.month} ${values.weekday}`;
      cssOutput.textContent = cron;
      const desc = getCronDescription(values);
      const descEl = container.querySelector("#desc");
      if (descEl) descEl.textContent = desc;
    }
  });

  container.querySelectorAll(".presets button").forEach(btn => {
    btn.addEventListener("click", () => {
      const c = btn.dataset.cron.split(" ");
      container.querySelector("#minute").value = c[0];
      container.querySelector("#hour").value = c[1];
      container.querySelector("#day").value = c[2];
      container.querySelector("#month").value = c[3];
      container.querySelector("#weekday").value = c[4];
      container.querySelector("#minute").dispatchEvent(new Event("change", { bubbles: true }));
    });
  });
}
