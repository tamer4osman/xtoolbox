export function realReturn(nominalPct, inflationPct) {
  const n = nominalPct / 100;
  const i = inflationPct / 100;
  return (1 + n) / (1 + i) - 1;
}

export function projectAccumulation({
  currentSavings = 0,
  monthlyContribution = 0,
  annualReturnReal = 0,
  years = 0
}) {
  const r = annualReturnReal;
  const monthlyR = r / 12;
  let balance = currentSavings;
  const series = [];
  for (let year = 1; year <= years; year++) {
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + monthlyR) + monthlyContribution;
    }
    series.push(balance);
  }
  return { nestEgg: balance, series };
}

export function simulateWithdrawal({
  nestEgg = 0,
  annualIncomeReal = 0,
  annualReturnReal = 0,
  maxYears = 60
}) {
  if (annualIncomeReal <= 0) return { lastsYears: Infinity, series: [], depleted: false };
  let balance = nestEgg;
  const series = [];
  for (let year = 1; year <= maxYears; year++) {
    balance = balance * (1 + annualReturnReal) - annualIncomeReal;
    series.push(balance);
    if (balance <= 0) {
      return { lastsYears: year, series, depleted: true };
    }
  }
  return { lastsYears: Infinity, series, depleted: false };
}

export function planRetirement(input) {
  const {
    currentAge,
    retirementAge,
    lifeExpectancy,
    currentSavings,
    monthlyContribution,
    preReturnPct,
    postReturnPct,
    inflationPct,
    desiredAnnualIncome
  } = input;

  const yearsToRetire = Math.max(0, retirementAge - currentAge);
  const retirementYears = Math.max(0, lifeExpectancy - retirementAge);
  const preReal = realReturn(preReturnPct, inflationPct);
  const postReal = realReturn(postReturnPct, inflationPct);

  const growth = projectAccumulation({
    currentSavings,
    monthlyContribution,
    annualReturnReal: preReal,
    years: yearsToRetire
  });

  const nestEgg = growth.nestEgg;
  const withdrawal = simulateWithdrawal({
    nestEgg,
    annualIncomeReal: desiredAnnualIncome,
    annualReturnReal: postReal,
    maxYears: Math.max(1, Math.ceil(retirementYears) + 20)
  });

  const firstYearRate = nestEgg > 0 ? desiredAnnualIncome / nestEgg : Infinity;

  return {
    yearsToRetire,
    retirementYears,
    nestEgg,
    firstYearRate,
    safeByGuideline: firstYearRate > 0 && firstYearRate <= 0.04,
    moneyLasts: !withdrawal.depleted || withdrawal.lastsYears >= retirementYears,
    lastsUntilAge: withdrawal.depleted ? retirementAge + withdrawal.lastsYears : lifeExpectancy,
    depletionAge: withdrawal.depleted ? retirementAge + withdrawal.lastsYears : null,
    growthSeries: growth.series,
    withdrawalSeries: withdrawal.series
  };
}

const fmtCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

export const toolConfig = {
  id: "retirement-planner",
  name: "Retirement Planner",
  category: "finance",
  description: "Project retirement savings and withdrawal sustainability.",
  icon: "🏖️",
  accept: null,
  maxSizeMB: null,
  keywords: ["retirement", "plan", "savings", "withdrawal", "future"],
  steps: [
    "Enter your age, savings and monthly contribution",
    "Set your target retirement age and expected returns",
    "Add the annual income you want in retirement",
    "Check whether your money outlives you"
  ],
  faqs: [
    {
      question: "Are results adjusted for inflation?",
      answer:
        "Yes. Returns are converted to real (above-inflation) returns, so all amounts are shown in today's purchasing power."
    },
    {
      question: "What is the 4% guideline?",
      answer:
        "A rule of thumb from the 1994 Bengen study: withdrawing 4% of your nest egg in year one (then adjusting for inflation) historically sustained a 30-year retirement."
    },
    {
      question: "Is this financial advice?",
      answer:
        "No. This is a simplified deterministic projection for education only. Markets fluctuate; consult a professional for real planning."
    }
  ]
};

const FIELDS = [
  { id: "age", label: "Current age", min: 15, max: 80, value: 30 },
  { id: "retire-age", label: "Retirement age", min: 40, max: 90, value: 65 },
  { id: "life-expectancy", label: "Life expectancy", min: 50, max: 120, value: 90 },
  { id: "savings", label: "Current savings ($)", min: 0, max: 100000000, value: 25000, step: 1000 },
  { id: "monthly", label: "Monthly contribution ($)", min: 0, max: 100000, value: 500, step: 50 },
  {
    id: "pre-return",
    label: "Pre-retirement return (%/yr)",
    min: -10,
    max: 30,
    value: 7,
    step: 0.5
  },
  {
    id: "post-return",
    label: "In-retirement return (%/yr)",
    min: -10,
    max: 30,
    value: 5,
    step: 0.5
  },
  { id: "inflation", label: "Inflation (%/yr)", min: 0, max: 20, value: 2.5, step: 0.1 },
  {
    id: "income",
    label: "Desired annual income, today's $",
    min: 0,
    max: 10000000,
    value: 40000,
    step: 1000
  }
];

function readInput(container) {
  const get = id => Number(container.querySelector(`#rp-${id}`).value);
  const values = {};
  FIELDS.forEach(f => {
    let v = get(f.id.replace(/-/g, "-"));
    if (!Number.isFinite(v)) v = f.value;
    v = Math.max(f.min, Math.min(f.max, v));
    values[f.id] = v;
  });
  return {
    currentAge: values.age,
    retirementAge: values["retire-age"],
    lifeExpectancy: values["life-expectancy"],
    currentSavings: values.savings,
    monthlyContribution: values.monthly,
    preReturnPct: values["pre-return"],
    postReturnPct: values["post-return"],
    inflationPct: values.inflation,
    desiredAnnualIncome: values.income
  };
}

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <h1>🏖️ ${toolConfig.name}</h1>
      <p>${toolConfig.description} All figures in today's dollars.</p>
      <div class="rp-grid">
        ${FIELDS.map(
          f => `
        <label class="rp-field">
          <span>${f.label}</span>
          <input type="number" id="rp-${f.id}" value="${f.value}" min="${f.min}" max="${f.max}" step="${f.step || 1}">
        </label>`
        ).join("")}
      </div>
      <div id="rp-verdict" class="rp-verdict" aria-live="polite"></div>
      <div id="rp-stats" class="rp-stats"></div>
      <details class="rp-table-wrap">
        <summary>Year-by-year balances</summary>
        <table class="rp-table"><thead><tr><th>Age</th><th>Phase</th><th>Balance</th></tr></thead><tbody id="rp-tbody"></tbody></table>
      </details>
      <p class="rp-disclaimer">Educational estimate only — not financial advice.</p>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .rp-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: var(--space-3); margin: var(--space-4) 0; }
    .rp-field { display: flex; flex-direction: column; gap: var(--space-1); font-size: var(--text-sm); }
    .rp-field input { padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .rp-verdict { border-radius: var(--radius-lg); padding: var(--space-4); text-align: center; font-size: var(--text-lg); font-weight: 700; margin: var(--space-4) 0; }
    .rp-verdict.ok { background: rgba(46, 160, 67, 0.12); color: var(--color-success, #1a7f37); }
    .rp-verdict.bad { background: rgba(207, 34, 46, 0.1); color: var(--color-danger, #cf222e); }
    .rp-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: var(--space-3); margin-bottom: var(--space-4); }
    .rp-stat { background: var(--color-surface); border-radius: var(--radius-md); padding: var(--space-3); text-align: center; }
    .rp-stat strong { display: block; font-size: var(--text-xl); }
    .rp-stat span { font-size: var(--text-xs); color: var(--color-text-muted, #888); }
    .rp-table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); margin-top: var(--space-3); }
    .rp-table th, .rp-table td { padding: var(--space-1) var(--space-2); border-bottom: 1px solid var(--color-border); text-align: right; font-variant-numeric: tabular-nums; }
    .rp-table th:first-child, .rp-table td:first-child { text-align: left; }
    .rp-disclaimer { font-size: var(--text-xs); color: var(--color-text-muted, #888); margin-top: var(--space-3); }
  `;
  container.appendChild(style);

  function update() {
    const result = planRetirement(readInput(container));
    const verdict = container.querySelector("#rp-verdict");

    if (result.moneyLasts) {
      verdict.className = "rp-verdict ok";
      verdict.textContent = `✅ Sustainable — funds last beyond age ${result.lastsUntilAge}`;
    } else {
      verdict.className = "rp-verdict bad";
      verdict.textContent = `⚠️ Runs out at age ${Math.floor(result.depletionAge)} — consider saving more or retiring later`;
    }

    const rateText =
      result.firstYearRate === Infinity || result.nestEgg <= 0
        ? "—"
        : `${(result.firstYearRate * 100).toFixed(1)}%${result.safeByGuideline ? " ✓" : " (above 4%)"}`;

    container.querySelector("#rp-stats").innerHTML = `
      <div class="rp-stat"><strong>${fmtCurrency.format(result.nestEgg)}</strong><span>Nest egg at ${Math.round(result.retirementAge)}</span></div>
      <div class="rp-stat"><strong>${rateText}</strong><span>Initial withdrawal rate</span></div>
      <div class="rp-stat"><strong>${result.yearsToRetire} yrs</strong><span>Until retirement</span></div>
      <div class="rp-stat"><strong>${result.retirementYears} yrs</strong><span>Retirement funded</span></div>
    `;

    const tbody = [];
    const startAge = readInput(container).currentAge;
    result.growthSeries.forEach((bal, i) => {
      tbody.push(
        `<tr><td>${startAge + i + 1}</td><td>Saving</td><td>${fmtCurrency.format(Math.max(0, bal))}</td></tr>`
      );
    });
    const retireAge = readInput(container).retirementAge;
    result.withdrawalSeries.forEach((bal, i) => {
      tbody.push(
        `<tr><td>${retireAge + i + 1}</td><td>Retired</td><td>${fmtCurrency.format(Math.max(0, bal))}</td></tr>`
      );
    });
    container.querySelector("#rp-tbody").innerHTML = tbody.join("");
  }

  container.addEventListener("input", e => {
    if (e.target.matches(".rp-field input")) update();
  });

  update();
}
