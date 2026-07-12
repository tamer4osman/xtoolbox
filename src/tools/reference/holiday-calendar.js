import { createLookupTool } from "../shared/lookup-tool-factory.js";
import { escapeHtml } from "../../utils/escape-html.js";

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" }
];

const { toolConfig, render } = createLookupTool({
  toolConfig: {
    id: "holiday-calendar",
    name: "Public Holiday Calendar",
    category: "reference",
    description: "View public holidays for any country and year.",
    icon: "📅",
    status: "done"
  },
  contentHTML: `
    <div class="search-box">
      <select id="country-select" class="tool-select">
        <option value="">Select Country</option>
      </select>
      <input type="number" id="year-input" class="tool-input year-input" value="2026" min="1900" max="2100" />
      <button id="search-btn" class="tool-button primary">Get Holidays</button>
    </div>
  `,
  resultHTML: `
    <h3 id="result-title"></h3>
    <div id="holidays-list" class="holidays-list"></div>
  `,
  extraCSS: `
    .tool-select, .year-input { padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: white; }
    .year-input { width: 100px; }
    #result-title { margin-bottom: var(--space-4); }
    .holiday-item { display: flex; justify-content: space-between; align-items: center; padding: var(--space-3) var(--space-4); background: var(--color-surface); border-radius: var(--radius-md); margin-bottom: var(--space-2); }
    .holiday-date { font-weight: 600; color: var(--color-primary); }
    .holiday-name { flex: 1; margin-left: var(--space-3); }
    .holiday-type { font-size: var(--text-sm); color: var(--color-text-muted); }
  `,
  searchButtonId: "search-btn",
  inputSelector: "select, input",
  errorMessage: "Could not load holidays. Try another country.",
  validate: () => (!document.querySelector("#country-select")?.value ? "Select a country" : null),
  onSearch: async (vals, container) => {
    const country = container.querySelector("#country-select").value;
    const year = container.querySelector("#year-input").value;
    const res = await fetch("https://date.nager.at/api/v3/PublicHolidays/" + year + "/" + country, {
      signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) throw new Error("Failed to fetch holidays");
    const holidays = await res.json();
    const countryName = COUNTRIES.find(c => c.code === country)?.name || country;

    container.querySelector("#result-title").textContent =
      "Holidays in " + countryName + " " + year;
    container.querySelector("#holidays-list").innerHTML = holidays
      .map(
        h => `
      <div class="holiday-item">
        <span class="holiday-date">${escapeHtml(h.date)}</span>
        <span class="holiday-name">${escapeHtml(h.localName)}</span>
        <span class="holiday-type">${escapeHtml(h.counties ? h.counties.join(", ") : h.type)}</span>
      </div>
    `
      )
      .join("");
  },
  init(container) {
    const countrySelect = container.querySelector("#country-select");
    COUNTRIES.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.code;
      opt.textContent = c.name;
      countrySelect.appendChild(opt);
    });
  }
});

export { toolConfig, render };
