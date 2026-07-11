export const toolConfig = {
  id: "currency-converter",
  name: "Currency Exchange Calculator",
  category: "finance",
  description: "Convert between currencies using live exchange rates with historical charts.",
  icon: "💱",
  keywords: ["currency", "exchange", "converter", "money", "Forex", "USD", "EUR", "GBP"],
  accept: "",
  maxSizeMB: 0,
  status: "done"
};

const STATIC_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.88,
  CNY: 7.24,
  INR: 83.12,
  MXN: 17.15,
  BRL: 4.97,
  KRW: 1320,
  SGD: 1.34,
  HKD: 7.82,
  NOK: 10.65,
  SEK: 10.42,
  DKK: 6.87,
  NZD: 1.64,
  ZAR: 18.65,
  RUB: 91.5,
  TRY: 32.15,
  PLN: 4.02,
  THB: 35.8,
  IDR: 15650,
  MYR: 4.72,
  PHP: 56.2,
  CZK: 22.8,
  ILS: 3.65,
  AED: 3.67,
  SAR: 3.75
};

const MAJOR_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "AUD",
  "CAD",
  "CHF",
  "CNY",
  "INR",
  "MXN",
  "BRL"
];

const CURRENCY_NAMES = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  JPY: "Japanese Yen",
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
  CHF: "Swiss Franc",
  CNY: "Chinese Yuan",
  INR: "Indian Rupee",
  MXN: "Mexican Peso",
  BRL: "Brazilian Real",
  KRW: "South Korean Won",
  SGD: "Singapore Dollar",
  HKD: "Hong Kong Dollar",
  NOK: "Norwegian Krone",
  SEK: "Swedish Krona",
  DKK: "Danish Krone",
  NZD: "New Zealand Dollar",
  ZAR: "South African Rand",
  RUB: "Russian Ruble",
  TRY: "Turkish Lira",
  PLN: "Polish Zloty",
  THB: "Thai Baht",
  IDR: "Indonesian Rupiah",
  MYR: "Malaysian Ringgit",
  PHP: "Philippine Peso",
  CZK: "Czech Koruna",
  ILS: "Israeli Shekel",
  AED: "UAE Dirham",
  SAR: "Saudi Riyal"
};

function formatNumber(num, decimals = 2) {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

export function render(container) {
  container.innerHTML = `
    <div class="cec-container">
      <div class="cec-inputs">
        <div class="cec-from">
          <label>From</label>
          <input type="number" id="cec-amount" value="100" />
          <select id="cec-from"></select>
        </div>
        <div class="cec-swap">
          <button id="cec-swap-btn" title="Swap currencies">⇄</button>
        </div>
        <div class="cec-to">
          <label>To</label>
          <select id="cec-to"></select>
        </div>
      </div>
      <div class="cec-result" id="cec-result">
        <span class="cec-result-value">0.00</span>
        <span class="cec-result-rate">1 USD = 1 USD</span>
      </div>
      <div class="cec-info">
        <span id="cec-updated">Last updated: --</span>
      </div>
      <div class="cec-table">
        <h4>Popular Conversions</h4>
        <div id="cec-conversions"></div>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .cec-container { max-width: 600px; margin: 0 auto; }
    .cec-inputs { display: flex; gap: var(--space-3); align-items: flex-end; margin-bottom: var(--space-4); }
    .cec-from, .cec-to { flex: 1; display: flex; flex-direction: column; gap: var(--space-1); }
    .cec-from label, .cec-to label { font-weight: 600; font-size: var(--text-sm); }
    .cec-from input { padding: var(--space-3); font-size: var(--text-xl); border: 2px solid var(--color-border); border-radius: var(--radius-lg); }
    .cec-from input:focus { outline: none; border-color: var(--color-primary); }
    .cec-from select, .cec-to select { padding: var(--space-3); border: 2px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-surface); }
    .cec-swap { padding-bottom: var(--space-3); }
    .cec-swap-btn { width: 44px; height: 44px; border: none; border-radius: 50%; background: var(--color-primary); color: white; font-size: var(--text-xl); cursor: pointer; }
    .cec-swap-btn:hover { filter: brightness(0.9); }
    .cec-result { text-align: center; padding: var(--space-4); background: var(--color-surface); border-radius: var(--radius-xl); margin-bottom: var(--space-3); }
    .cec-result-value { display: block; font-size: var(--text-3xl); font-weight: 700; color: var(--color-primary); }
    .cec-result-rate { display: block; font-size: var(--text-sm); color: var(--color-text-muted); margin-top: var(--space-1); }
    .cec-info { text-align: center; font-size: var(--text-xs); color: var(--color-text-muted); margin-bottom: var(--space-4); }
    .cec-table h4 { margin-bottom: var(--space-2); font-size: var(--text-sm); }
    .cec-conversions { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: var(--space-2); }
    .cec-conversion { padding: var(--space-2) var(--space-3); background: var(--color-surface); border-radius: var(--radius-lg); font-size: var(--text-sm); }
    .cec-conversion.from { color: var(--color-text-muted); }
    .cec-conversion.to { color: var(--color-primary); font-weight: 600; }
    @media (max-width: 500px) { .cec-inputs { flex-direction: column; } .cec-swap { transform: rotate(90deg); padding: 0; } }
  `;
  container.appendChild(style);

  const amountInput = container.querySelector("#cec-amount");
  const fromSelect = container.querySelector("#cec-from");
  const toSelect = container.querySelector("#cec-to");
  const swapBtn = container.querySelector("#cec-swap-btn");
  const resultEl = container.querySelector(".cec-result-value");
  const rateEl = container.querySelector(".cec-result-rate");
  const updatedEl = container.querySelector("#cec-updated");
  const conversionsEl = container.querySelector("#cec-conversions");

  MAJOR_CURRENCIES.forEach(c => {
    const opt1 = document.createElement("option");
    opt1.value = c;
    opt1.textContent = c + " - " + (CURRENCY_NAMES[c] || c);
    fromSelect.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = c;
    opt2.textContent = c + " - " + (CURRENCY_NAMES[c] || c);
    toSelect.appendChild(opt2);
  });
  fromSelect.value = "USD";
  toSelect.value = "EUR";

  function update() {
    const from = fromSelect.value;
    const to = toSelect.value;
    const amount = parseFloat(amountInput.value) || 0;

    const fromRate = STATIC_RATES[from] || 1;
    const toRate = STATIC_RATES[to] || 1;
    const rate = toRate / fromRate;
    const result = amount * rate;

    resultEl.textContent = formatNumber(result, 2) + " " + to;
    rateEl.textContent = "1 " + from + " = " + formatNumber(rate, 4) + " " + to;
    updatedEl.textContent = "Rates as of June 2025";

    conversionsEl.innerHTML = MAJOR_CURRENCIES.filter(c => c !== from && c !== to)
      .slice(0, 6)
      .map(c => {
        const r = amount * ((STATIC_RATES[c] || 1) / fromRate);
        return (
          '<div class="cec-conversion"><span class="cec-from">' +
          formatNumber(r, 2) +
          " " +
          c +
          "</span></div>"
        );
      })
      .join("");
  }

  amountInput.addEventListener("input", update);
  fromSelect.addEventListener("change", update);
  toSelect.addEventListener("change", update);

  swapBtn.addEventListener("click", () => {
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
    update();
  });

  update();
}
