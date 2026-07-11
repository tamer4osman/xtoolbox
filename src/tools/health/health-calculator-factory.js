const CYCLE_OPTIONS = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35];

const FORM_STYLES = `
  .health-container { max-width: 500px; margin: 0 auto; }
  .health-form { background: var(--color-surface); padding: var(--space-6); border-radius: var(--radius-xl); margin-bottom: var(--space-6); }
  .health-form .form-group { margin-bottom: var(--space-4); text-align: left; }
  .health-form .form-group label { display: block; margin-bottom: var(--space-2); font-weight: 500; }
  .health-form .form-group input, .health-form .form-group select { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
  .health-form .calc-button { width: 100%; padding: var(--space-4); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
  .hidden { display: none; }
`;

function buildCycleSelect() {
  return `<select id="cycle">${CYCLE_OPTIONS.map(
    d =>
      `<option value="${d}"${d === 28 ? " selected" : ""}>${d} days${d === 28 ? " (typical)" : ""}</option>`
  ).join("")}</select>`;
}

export function renderHealthForm(container, { buttonText = "Calculate", resultId = "result" }) {
  container.innerHTML = `
    <div class="health-container">
      <div class="health-form">
        <div class="form-group">
          <label>First Day of Last Period</label>
          <input type="date" id="last-period" />
        </div>
        <div class="form-group">
          <label>Cycle Length (days)</label>
          ${buildCycleSelect()}
        </div>
        <button id="calc-btn" class="calc-button">${buttonText}</button>
      </div>
      <div id="${resultId}" class="hidden"></div>
    </div>
    <style>${FORM_STYLES}</style>
  `;
}

export function initHealthForm(
  container,
  { buttonText = "Calculate", resultId = "result", calculate, renderResult }
) {
  renderHealthForm(container, { buttonText, resultId });

  const today = new Date().toISOString().split("T")[0];
  const lastPeriodInput = container.querySelector("#last-period");
  lastPeriodInput.value = today;
  lastPeriodInput.max = today;

  function run() {
    const lastPeriod = new Date(container.querySelector("#last-period").value);
    const cycle = parseInt(container.querySelector("#cycle").value) || 28;
    const data = calculate(lastPeriod, cycle);
    renderResult(container.querySelector(`#${resultId}`), data);
    container.querySelector(`#${resultId}`).classList.remove("hidden");
  }

  container.querySelector("#calc-btn").addEventListener("click", run);
  run();
}

const MS_PER_DAY = 86400000;
const MS_PER_WEEK = 7 * MS_PER_DAY;
const OVULATION_OFFSET = 14;

export function calcOvulationDate(lastPeriod, cycle) {
  const d = new Date(lastPeriod);
  d.setDate(d.getDate() + cycle - OVULATION_OFFSET);
  return d;
}

export function calcDueDate(lastPeriod, cycle) {
  const ovulation = calcOvulationDate(lastPeriod, cycle);
  const d = new Date(ovulation);
  d.setDate(d.getDate() + 280);
  return d;
}

export function daysBetween(a, b) {
  return Math.floor((b - a) / MS_PER_DAY);
}

export function weeksBetween(a, b) {
  return Math.floor((b - a) / MS_PER_WEEK);
}

export function formatDateShort(d) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateLong(d) {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
