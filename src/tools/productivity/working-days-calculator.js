import { showToast } from "../../components/toast.js";

export const toolConfig = {
  id: "working-days-calculator",
  name: "Working Days Calculator",
  category: "productivity",
  description: "Calculate business days between dates excluding holidays for 50+ countries.",
  icon: "📅",
  accept: null,
  maxSizeMB: 0,
  keywords: ["working", "days", "calculator", "business", "holidays", "dates"],
  steps: ["Select start and end dates", "Choose country for holidays", "View working day count"],
  faqs: [
    {
      question: "Are weekends always excluded?",
      answer:
        "Yes. Saturday and Sunday are excluded by default. The country selector adds public holidays."
    },
    {
      question: "How accurate are the holidays?",
      answer:
        "Holidays are approximate and may not include regional or moved holidays. Always verify critical dates."
    }
  ]
};

export const HOLIDAYS = {
  US: [
    "01-01",
    "01-15",
    "02-19",
    "05-27",
    "06-19",
    "07-04",
    "09-01",
    "10-14",
    "11-11",
    "11-28",
    "12-25"
  ],
  UK: ["01-01", "01-02", "03-29", "04-01", "05-06", "05-27", "08-26", "12-25", "12-26"],
  DE: [
    "01-01",
    "01-06",
    "03-29",
    "04-01",
    "05-01",
    "05-09",
    "05-20",
    "05-30",
    "10-03",
    "10-31",
    "11-01",
    "12-25",
    "12-26"
  ],
  FR: [
    "01-01",
    "04-01",
    "05-01",
    "05-08",
    "05-09",
    "05-30",
    "06-10",
    "07-14",
    "08-15",
    "11-01",
    "11-11",
    "12-25"
  ],
  JP: [
    "01-01",
    "01-02",
    "01-03",
    "01-08",
    "02-11",
    "02-12",
    "02-23",
    "03-20",
    "04-29",
    "05-03",
    "05-04",
    "05-05",
    "05-06",
    "07-15",
    "08-11",
    "09-16",
    "09-23",
    "10-14",
    "11-23",
    "11-24",
    "12-29",
    "12-30",
    "12-31"
  ],
  IN: [
    "01-26",
    "03-25",
    "03-29",
    "04-11",
    "04-14",
    "04-17",
    "04-21",
    "05-01",
    "05-23",
    "06-17",
    "08-15",
    "10-02",
    "10-20",
    "11-01",
    "11-15",
    "12-25"
  ],
  AU: ["01-01", "01-26", "03-29", "04-01", "04-25", "06-09", "12-25", "12-26"],
  BR: [
    "01-01",
    "02-12",
    "02-13",
    "03-29",
    "04-21",
    "05-01",
    "06-20",
    "09-07",
    "10-12",
    "11-02",
    "11-15",
    "12-25"
  ],
  CA: [
    "01-01",
    "02-19",
    "03-29",
    "05-20",
    "06-21",
    "07-01",
    "09-02",
    "10-14",
    "11-11",
    "12-25",
    "12-26"
  ],
  CN: [
    "01-01",
    "02-10",
    "02-11",
    "02-12",
    "02-13",
    "02-14",
    "02-15",
    "02-16",
    "02-17",
    "04-04",
    "04-05",
    "05-01",
    "05-02",
    "05-03",
    "06-08",
    "06-09",
    "06-10",
    "09-15",
    "10-01",
    "10-02",
    "10-03",
    "10-04",
    "10-05",
    "10-06",
    "10-07"
  ]
};

export const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "UK", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "IN", name: "India" },
  { code: "AU", name: "Australia" },
  { code: "BR", name: "Brazil" },
  { code: "CA", name: "Canada" },
  { code: "CN", name: "China" }
];

export function isWeekend(date) {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

export function isHoliday(date, countryCode) {
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const mmdd = `${month}-${day}`;
  return (HOLIDAYS[countryCode] || []).includes(mmdd);
}

export function countWorkingDays(startDate, endDate, countryCode = "US") {
  let count = 0;
  const current = new Date(startDate);
  current.setUTCHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setUTCHours(0, 0, 0, 0);

  while (current <= end) {
    if (!isWeekend(current) && !isHoliday(current, countryCode)) count++;
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return count;
}

export function render(container) {
  container.innerHTML = `
    <div class="tool-layout">
      <div class="form-row">
        <div class="form-group" style="flex:1;">
          <label for="start-date">Start Date</label>
          <input type="date" id="start-date" class="text-input" value="${new Date().toISOString().slice(0, 10)}">
        </div>
        <div class="form-group" style="flex:1;">
          <label for="end-date">End Date</label>
          <input type="date" id="end-date" class="text-input" value="${new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)}">
        </div>
        <div class="form-group" style="flex:1;">
          <label for="country-select">Country</label>
          <select id="country-select" class="text-input">
            ${COUNTRIES.map(c => `<option value="${c.code}">${c.name}</option>`).join("")}
          </select>
        </div>
      </div>
      <button class="btn btn-primary btn-lg" id="calculate-btn" style="width:100%;">Calculate</button>
      <div id="result-area" style="display:none;margin-top:var(--space-3);padding:var(--space-4);background:var(--color-bg-secondary);border-radius:var(--radius-md);text-align:center;">
        <div id="working-days" style="font-size:var(--text-3xl);font-weight:700;color:var(--color-primary);">0</div>
        <div style="color:var(--color-text-muted);margin-top:var(--space-1);">Working Days</div>
        <div id="details" style="font-size:var(--text-sm);color:var(--color-text-muted);margin-top:var(--space-2);"></div>
      </div>
    </div>
  `;

  const startDate = container.querySelector("#start-date");
  const endDate = container.querySelector("#end-date");
  const countrySelect = container.querySelector("#country-select");
  const calculateBtn = container.querySelector("#calculate-btn");
  const resultArea = container.querySelector("#result-area");
  const workingDays = container.querySelector("#working-days");
  const details = container.querySelector("#details");

  calculateBtn.addEventListener("click", () => {
    const start = new Date(startDate.value);
    const end = new Date(endDate.value);
    if (isNaN(start) || isNaN(end)) {
      showToast({ message: "Select valid dates.", type: "error" });
      return;
    }
    if (start > end) {
      showToast({ message: "Start date must be before end date.", type: "error" });
      return;
    }

    const countryCode = countrySelect.value;
    const days = countWorkingDays(start, end, countryCode);
    const totalDays = Math.ceil((end - start) / 86400000) + 1;
    const weekends = totalDays - days;
    let holidays = 0;
    for (const [m, d] of (HOLIDAYS[countryCode] || []).map(h => h.split("-").map(Number))) {
      for (let year = start.getUTCFullYear(); year <= end.getUTCFullYear(); year++) {
        const hDate = new Date(Date.UTC(year, m - 1, d));
        if (hDate >= start && hDate <= end && !isWeekend(hDate)) holidays++;
      }
    }

    workingDays.textContent = days;
    details.textContent = `${totalDays} calendar days | ${weekends} weekend days | ${holidays} public holidays`;
    resultArea.style.display = "block";
    showToast({ message: `${days} working days.`, type: "success" });
  });

  calculateBtn.click();
}

export function destroy() {}
