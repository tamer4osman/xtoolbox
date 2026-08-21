export const COUNTRIES = [
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    currency: "USD",
    allowance: 15000,
    brackets: [
      [11925, 0.1],
      [48475, 0.12],
      [103350, 0.22],
      [197300, 0.24],
      [250525, 0.32],
      [626350, 0.35],
      [Infinity, 0.37]
    ],
    social: { rate: 0.0765, cap: 176100, overCapRate: 0.0145 },
    childBenefitMonthly: 167
  },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    currency: "GBP",
    allowance: 12570,
    brackets: [
      [37700, 0.2],
      [112570, 0.4],
      [Infinity, 0.45]
    ],
    social: { rate: 0.08, floor: 12570, cap: 50270, overCapRate: 0.02 },
    childBenefitMonthly: 26,
    childBenefitAdditional: 17
  },
  {
    code: "DE",
    name: "Germany",
    flag: "🇩🇪",
    currency: "EUR",
    allowance: 12096,
    brackets: [
      [14000, 0.14],
      [31000, 0.24],
      [45000, 0.3],
      [66760, 0.38],
      [277826, 0.42],
      [Infinity, 0.45]
    ],
    social: { rate: 0.2, cap: 96600, overCapRate: 0.09 },
    childBenefitMonthly: 255
  },
  {
    code: "FR",
    name: "France",
    flag: "🇫🇷",
    currency: "EUR",
    allowance: 0,
    brackets: [
      [11294, 0],
      [28797, 0.11],
      [82341, 0.3],
      [177106, 0.41],
      [Infinity, 0.45]
    ],
    social: { rate: 0.22 },
    childBenefitMinKids: 2,
    childBenefitMonthly: 185
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    currency: "CAD",
    allowance: 16129,
    brackets: [
      [57375, 0.15],
      [114750, 0.205],
      [177882, 0.26],
      [253414, 0.29],
      [Infinity, 0.33]
    ],
    social: { rate: 0.071, cap: 71300 },
    childBenefitMonthly: 500
  },
  {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    currency: "AUD",
    allowance: 18200,
    brackets: [
      [26800, 0.16],
      [135000, 0.3],
      [190000, 0.37],
      [Infinity, 0.45]
    ],
    social: { rate: 0.02 }
  },
  {
    code: "JP",
    name: "Japan",
    flag: "🇯🇵",
    currency: "JPY",
    allowance: 1030000,
    brackets: [
      [1950000, 0.05],
      [3300000, 0.1],
      [6950000, 0.2],
      [9000000, 0.23],
      [18000000, 0.33],
      [40000000, 0.4],
      [Infinity, 0.45]
    ],
    social: { rate: 0.146, cap: 15000000, overCapRate: 0.01 },
    childBenefitMonthly: 15000
  },
  {
    code: "IN",
    name: "India",
    flag: "🇮🇳",
    currency: "INR",
    allowance: 75000,
    brackets: [
      [400000, 0],
      [800000, 0.05],
      [1200000, 0.1],
      [1600000, 0.15],
      [2000000, 0.2],
      [2400000, 0.25],
      [Infinity, 0.3]
    ],
    social: { rate: 0.12, cap: 180000 }
  },
  {
    code: "BR",
    name: "Brazil",
    flag: "🇧🇷",
    currency: "BRL",
    allowance: 24000,
    brackets: [
      [36960, 0.075],
      [55976, 0.15],
      [89984, 0.225],
      [Infinity, 0.275]
    ],
    social: { rate: 0.11, cap: 114086 }
  },
  {
    code: "ES",
    name: "Spain",
    flag: "🇪🇸",
    currency: "EUR",
    allowance: 5550,
    brackets: [
      [12450, 0.19],
      [20200, 0.24],
      [35200, 0.3],
      [60000, 0.37],
      [300000, 0.45],
      [Infinity, 0.47]
    ],
    social: { rate: 0.0635 }
  },
  {
    code: "NL",
    name: "Netherlands",
    flag: "🇳🇱",
    currency: "EUR",
    allowance: 0,
    brackets: [
      [75518, 0.3653],
      [Infinity, 0.4952]
    ],
    social: { rate: 0.2765, cap: 38441 },
    childBenefitMonthly: 293
  },
  {
    code: "AE",
    name: "UAE",
    flag: "🇦🇪",
    currency: "AED",
    allowance: 0,
    brackets: [[Infinity, 0]],
    social: { rate: 0 }
  }
];

export function computeTakeHome(country, grossAnnual) {
  const gross = Math.max(0, Number(grossAnnual) || 0);
  const taxable = Math.max(0, gross - country.allowance);
  let tax = 0;
  let lower = 0;
  for (const [upTo, rate] of country.brackets) {
    if (taxable <= lower) break;
    tax += (Math.min(taxable, upTo) - lower) * rate;
    lower = upTo;
  }
  const s = country.social;
  const cappedBase = Math.min(gross, s.cap ?? gross);
  const aboveCap = Math.max(0, gross - (s.cap ?? gross));
  const social =
    Math.max(0, cappedBase - (s.floor ?? 0)) * s.rate + aboveCap * (s.overCapRate ?? 0);
  const net = gross - tax - social;
  const totalDeductions = tax + social;
  return { gross, tax, social, net, effective: gross > 0 ? totalDeductions / gross : 0 };
}

export function calcChildBenefits(country, kids) {
  const n = Math.max(0, Math.min(5, Math.floor(kids) || 0));
  if (!n) return 0;
  if (n < (country.childBenefitMinKids ?? 1)) return 0;
  const base = country.childBenefitMonthly ?? 0;
  if (!base) return 0;
  return base + (n - 1) * (country.childBenefitAdditional ?? base);
}

function householdResult(country, grossAnnual, married, kids) {
  if (!married || grossAnnual <= 0) {
    const base = computeTakeHome(country, grossAnnual);
    const benefits = calcChildBenefits(country, kids) * 12;
    return { country, ...base, benefits, net: base.net + benefits };
  }
  const half = computeTakeHome(country, grossAnnual / 2);
  const gross = half.gross * 2;
  const tax = half.tax * 2;
  const social = half.social * 2;
  const benefits = calcChildBenefits(country, kids) * 12;
  return {
    country,
    gross,
    tax,
    social,
    benefits,
    net: gross - tax - social + benefits,
    effective: gross > 0 ? (tax + social) / gross : 0
  };
}

export function rankCountries(grossAnnual, { married = false, kids = 0 } = {}) {
  return COUNTRIES.map(country => householdResult(country, grossAnnual, married, kids)).sort(
    (a, b) => a.effective - b.effective || a.country.name.localeCompare(b.country.name)
  );
}

const formatters = new Map();
function fmtCurrency(amount, code) {
  if (!formatters.has(code)) {
    formatters.set(
      code,
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: code,
        maximumFractionDigits: 0
      })
    );
  }
  return formatters.get(code).format(Math.max(0, amount));
}

export const toolConfig = {
  id: "salary-calc",
  name: "Multi-Country Salary Calculator",
  category: "finance",
  description: "Estimate take-home pay across 12 countries with simplified tax rules.",
  icon: "💰",
  accept: null,
  maxSizeMB: null,
  keywords: ["salary", "tax", "income", "calculator", "country"],
  steps: [
    "Enter your gross salary",
    "Pick annual or monthly",
    "Compare take-home pay across countries"
  ],
  faqs: [
    {
      question: "How accurate are these numbers?",
      answer:
        "They are simplified estimates using national-level brackets and typical employee social contributions (2025). Local surcharges, regional taxes, deductions and credits are not included."
    },
    {
      question: "Why is each result in a different currency?",
      answer:
        "Each country is calculated in its own currency at the same numeric gross amount, so you compare tax burden levels, not exchange-rate-converted purchasing power."
    },
    {
      question: "Is this tax advice?",
      answer: "No. For filing decisions consult a local tax professional."
    }
  ]
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <h1>💰 ${toolConfig.name}</h1>
      <div class="sc-controls">
        <label>Gross <input type="number" id="sc-gross" value="60000" min="0" step="1000"></label>
        <label>
          Period
          <select id="sc-period">
            <option value="1">per year</option>
            <option value="12">per month</option>
          </select>
        </label>
        <label>
          Household
          <select id="sc-household">
            <option value="single">Single</option>
            <option value="married">Married (both earn 50/50)</option>
          </select>
        </label>
        <label>Children <input type="number" id="sc-kids" value="0" min="0" max="5" step="1"></label>
      </div>
      <p class="sc-note">Same numeric amount applied in each country's own currency. % = take-home before child benefits; the monthly figure includes them. Married = income split between two spouses.</p>
      <div id="sc-results" aria-live="polite"></div>
      <p class="sc-disclaimer">Simplified estimates (2025 national rules). Not tax advice.</p>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .sc-controls { display: flex; gap: var(--space-3); flex-wrap: wrap; align-items: end; margin: var(--space-4) 0; }
    .sc-controls label { display: flex; flex-direction: column; gap: 2px; font-size: var(--text-sm); font-weight: 600; }
    .sc-controls input, .sc-controls select { padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); min-width: 140px; }
    .sc-note { font-size: var(--text-xs); color: var(--color-text-muted, #888); margin-bottom: var(--space-3); }
    .sc-row { background: var(--color-surface); border-radius: var(--radius-md); padding: var(--space-2) var(--space-3); margin-bottom: var(--space-2); }
    .sc-main { display: flex; align-items: center; gap: var(--space-3); cursor: pointer; }
    .sc-flag { font-size: var(--text-xl); width: 32px; text-align: center; }
    .sc-name { flex: 1; min-width: 130px; font-weight: 600; }
    .sc-bar-track { flex: 2; height: 12px; background: var(--color-bg, #eee); border-radius: 6px; overflow: hidden; min-width: 90px; }
    .sc-bar-fill { height: 100%; background: var(--color-primary); }
    .sc-pct { width: 64px; text-align: right; font-weight: 700; font-variant-numeric: tabular-nums; }
    .sc-net { width: 130px; text-align: right; font-size: var(--text-sm); white-space: nowrap; }
    .sc-detail { padding: var(--space-2) var(--space-1) 0; font-size: var(--text-sm); color: var(--color-text-muted, #777); display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--space-2); }
    .sc-detail strong { color: inherit; }
    .sc-hidden { display: none; }
    .sc-disclaimer { font-size: var(--text-xs); color: var(--color-text-muted, #888); margin-top: var(--space-3); }
    @media (max-width: 600px) { .sc-net { display: none; } }
  `;
  container.appendChild(style);

  const grossInput = container.querySelector("#sc-gross");
  const periodSelect = container.querySelector("#sc-period");
  const householdSelect = container.querySelector("#sc-household");
  const kidsInput = container.querySelector("#sc-kids");
  const resultsEl = container.querySelector("#sc-results");

  function update() {
    const multiplier = Number(periodSelect.value);
    const gross = (Number(grossInput.value) || 0) * multiplier;
    const opts = {
      married: householdSelect.value === "married",
      kids: Math.max(0, Math.min(5, parseInt(kidsInput.value, 10) || 0))
    };
    const ranked = rankCountries(gross, opts);
    if (!ranked.length || gross <= 0) {
      resultsEl.innerHTML = `<p class="sc-note">Enter a gross amount greater than zero.</p>`;
      return;
    }
    resultsEl.innerHTML = ranked
      .map(r => {
        const takeHomePct = (1 - r.effective) * 100;
        const fmt = a => fmtCurrency(a, r.country.currency);
        const benefitsLine =
          r.benefits > 0 ? `<span>Child benefits <strong>${fmt(r.benefits)}</strong></span>` : "";
        return `
        <details class="sc-row">
          <summary class="sc-main">
            <span class="sc-flag">${r.country.flag}</span>
            <span class="sc-name">${r.country.name}${opts.kids > 0 && r.benefits > 0 ? " 👶" : ""}</span>
            <span class="sc-bar-track"><span class="sc-bar-fill" style="width:${takeHomePct}%"></span></span>
            <span class="sc-pct">${takeHomePct.toFixed(1)}%</span>
            <span class="sc-net">${fmt(r.net / 12)}/mo</span>
          </summary>
          <div class="sc-detail">
            <span>Gross/yr <strong>${fmt(r.gross)}</strong></span>
            <span>Income tax <strong>${fmt(r.tax)}</strong></span>
            <span>Social <strong>${fmt(r.social)}</strong></span>
            ${benefitsLine}
            <span>Net/yr <strong>${fmt(r.net)}</strong></span>
            <span>Effective rate <strong>${(r.effective * 100).toFixed(1)}%</strong></span>
          </div>
        </details>`;
      })
      .join("");
  }

  grossInput.addEventListener("input", update);
  periodSelect.addEventListener("change", update);
  householdSelect.addEventListener("change", update);
  kidsInput.addEventListener("input", update);
  update();
}
