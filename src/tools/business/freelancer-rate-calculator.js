import { downloadBlob } from "../../utils/file.js";

export const toolConfig = {
  id: "freelancer-rate-calculator",
  name: "Freelancer Rate Calculator",
  category: "business",
  description:
    "Calculate optimal hourly/daily/project rates based on income, expenses, and billable hours.",
  icon: "💵",
  keywords: ["freelancer", "rate", "calculator", "hourly", "salary", "income"],
  accept: "",
  maxSizeMB: 10
};

export function render(container) {
  let state = {
    desiredAnnualIncome: 100000,
    businessExpenses: 15000,
    workingWeeks: 48,
    billableHoursPerDay: 6,
    workDaysPerWeek: 5,
    vacationDaysPerYear: 15,
    state: "CA",
    includeTaxes: true,
    taxRate: 25
  };

  container.innerHTML = `
    <div class="tool-container">
      <h1>${toolConfig.name}</h1>
      <p>${toolConfig.description}</p>
      <div class="form-section">
        <label for="desiredIncome">Desired Annual Income (Net)</label>
        <input type="number" id="desiredIncome" value="${state.desiredAnnualIncome}" min="10000" step="1000" />
        <span class="help-text">How much you want to take home per year</span>
      </div>
      <div class="form-section">
        <label for="businessExpenses">Annual Business Expenses</label>
        <input type="number" id="businessExpenses" value="${state.businessExpenses}" min="0" step="500" />
        <span class="help-text">Equipment, software, insurance, etc.</span>
      </div>
      <div class="form-section">
        <label for="workingWeeks">Working Weeks Per Year</label>
        <input type="number" id="workingWeeks" value="${state.workingWeeks}" min="1" max="52" />
        <span class="help-text">Subtract vacation, holidays, sick time</span>
      </div>
      <div class="form-section">
        <label for="billableHours">Billable Hours Per Day</label>
        <input type="number" id="billableHours" value="${state.billableHoursPerDay}" min="1" max="12" step="0.5" />
        <span class="help-text">Actual client-facing hours</span>
      </div>
      <div class="form-section">
        <label for="workDays">Work Days Per Week</label>
        <input type="number" id="workDays" value="${state.workDaysPerWeek}" min="1" max="7" />
      </div>
      <div class="form-section">
        <label>Include Taxes?</label>
        <label class="checkbox-label">
          <input type="checkbox" id="includeTaxes" checked />
          Calculate for gross rate (before taxes)
        </label>
      </div>
      <div class="form-section" id="taxSection" style="display: block;">
        <label for="taxRate">Tax Rate (%)</label>
        <input type="number" id="taxRate" value="${state.taxRate}" min="0" max="50" />
      </div>
      <div class="results-section">
        <h3>Your Optimal Rates</h3>
        <div class="result-card">
          <div class="result-label">Hourly Rate</div>
          <div class="result-value" id="hourlyRate">$0</div>
        </div>
        <div class="result-card">
          <div class="result-label">Daily Rate</div>
          <div class="result-value" id="dailyRate">$0</div>
        </div>
        <div class="result-card">
          <div class="result-label">Weekly Rate</div>
          <div class="result-value" id="weeklyRate">$0</div>
        </div>
        <div class="result-card highlight">
          <div class="result-label">Monthly Retainer (Min)</div>
          <div class="result-value" id="monthlyRate">$0</div>
        </div>
      </div>
      <div class="results-section">
        <h3>Breakdown</h3>
        <div class="breakdown-item">
          <span>Target Annual Revenue Needed:</span>
          <span id="targetRevenue">$0</span>
        </div>
        <div class="breakdown-item">
          <span>Working Days/Year:</span>
          <span id="workingDaysYear">0</span>
        </div>
        <div class="breakdown-item">
          <span>Billable Hours/Year:</span>
          <span id="billableHoursYear">0</span>
        </div>
        <div class="breakdown-item">
          <span>Cost Per Day (expenses ÷ days):</span>
          <span id="costPerDay">$0</span>
        </div>
      </div>
      <button type="button" id="exportPdf" class="btn-secondary">Export Summary</button>
    </div>
  `;

  const $ = id => container.querySelector(id);
  const el = sel => container.querySelector(sel);
  const formatCurrency = num =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(num);

  function calculate() {
    const targetIncome = parseFloat($("#desiredIncome").value) || 0;
    const expenses = parseFloat($("#businessExpenses").value) || 0;
    const weeks = parseFloat($("#workingWeeks").value) || 48;
    const hoursPerDay = parseFloat($("#billableHours").value) || 6;
    const daysPerWeek = parseFloat($("#workDays").value) || 5;
    const includeTaxes = $("#includeTaxes").checked;
    const taxRate = parseFloat($("#taxRate").value) || 0;

    let grossTarget = targetIncome;
    if (includeTaxes) {
      grossTarget = targetIncome / (1 - taxRate / 100);
    }

    const totalNeeded = grossTarget + expenses;
    const workingDaysPerYear = weeks * daysPerWeek;
    const billableHoursPerYear = workingDaysPerYear * hoursPerDay;

    const hourlyRate = totalNeeded / billableHoursPerYear;
    const dailyRate = hourlyRate * hoursPerDay;
    const weeklyRate = dailyRate * daysPerWeek;
    const monthlyRate = weeklyRate * 4.33;
    const costPerDay = expenses / workingDaysPerYear;

    $("#hourlyRate").textContent = formatCurrency(hourlyRate);
    $("#dailyRate").textContent = formatCurrency(dailyRate);
    $("#weeklyRate").textContent = formatCurrency(weeklyRate);
    $("#monthlyRate").textContent = formatCurrency(monthlyRate);

    $("#targetRevenue").textContent = formatCurrency(totalNeeded);
    $("#workingDaysYear").textContent = workingDaysPerYear;
    $("#billableHoursYear").textContent = billableHoursPerYear;
    $("#costPerDay").textContent = formatCurrency(costPerDay);
  }

  const inputs = container.querySelectorAll("input");
  inputs.forEach(input => {
    input.addEventListener("input", calculate);
    input.addEventListener("change", calculate);
  });

  el("#includeTaxes").addEventListener("change", e => {
    el("#taxSection").style.display = e.target.checked ? "block" : "none";
    calculate();
  });

  calculate();

  el("#exportPdf").addEventListener("click", () => {
    const hourly = $("#hourlyRate").textContent;
    const daily = $("#dailyRate").textContent;
    const weekly = $("#weeklyRate").textContent;
    const monthly = $("#monthlyRate").textContent;

    const content = `FREELANCE RATE CALCULATION RESULTS
================================

Hourly Rate: ${hourly}
Daily Rate: ${daily}
Weekly Rate: ${weekly}
Monthly Retainer: ${monthly}

Input Parameters:
- Desired Annual Income: ${formatCurrency(parseFloat($("#desiredIncome").value))}
- Business Expenses: ${formatCurrency(parseFloat($("#businessExpenses").value))}
- Working Weeks/Year: ${$("#workingWeeks").value}
- Billable Hours/Day: ${$("#billableHours").value}
- Work Days/Week: ${$("#workDays").value}
- Include Taxes: ${$("#includeTaxes").checked ? "Yes" : "No"}

Generated: ${new Date().toLocaleDateString()}

Note: These are minimum recommended rates. Adjust based on market rates, experience, and value provided.
`;

    const blob = new Blob([content], { type: "text/plain" });
    downloadBlob(blob, "freelance-rate-calculation.txt");
  });
}
