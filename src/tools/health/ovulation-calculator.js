import { initHealthForm, calcOvulationDate, formatDateShort } from "./health-calculator-factory.js";

export const toolConfig = {
  id: "ovulation-calculator",
  name: "Ovulation Calculator",
  category: "health",
  description: "Predict ovulation and fertile windows.",
  icon: "📅",
  status: "done"
};

const RESULT_STYLES = `
  .ovu-card { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-6); }
  .ovu-main { text-align: center; margin-bottom: var(--space-6); padding-bottom: var(--space-6); border-bottom: 1px solid var(--color-border); }
  .ovu-icon { font-size: 3rem; margin-bottom: var(--space-2); }
  .ovu-title { font-size: var(--text-sm); color: var(--color-text-secondary); }
  .ovu-dates { font-size: var(--text-xl); font-weight: 600; color: var(--color-primary); }
  .ovu-dates-list { display: flex; flex-direction: column; gap: var(--space-3); margin-bottom: var(--space-4); }
  .date-item { display: flex; justify-content: space-between; padding: var(--space-3); background: var(--color-bg); border-radius: var(--radius-md); }
  .date-label { color: var(--color-text-secondary); font-size: var(--text-sm); }
  .date-value { font-weight: 600; }
  .ovu-disclaimer { text-align: center; font-size: var(--text-xs); color: var(--color-text-muted); margin-top: var(--space-4); }
`;

export function render(container) {
  initHealthForm(container, {
    buttonText: "Calculate",
    calculate(lastPeriod, cycle) {
      const ovulation = calcOvulationDate(lastPeriod, cycle);

      const fertileStart = new Date(ovulation);
      fertileStart.setDate(fertileStart.getDate() - 5);
      const fertileEnd = new Date(ovulation);
      fertileEnd.setDate(fertileEnd.getDate() + 1);

      const nextPeriod = new Date(lastPeriod);
      nextPeriod.setDate(nextPeriod.getDate() + cycle);

      return { ovulation, fertileStart, fertileEnd, nextPeriod };
    },
    renderResult(el, { ovulation, fertileStart, fertileEnd, nextPeriod }) {
      el.innerHTML = `
        <div class="ovu-card">
          <div class="ovu-main">
            <div class="ovu-icon">🥚</div>
            <div class="ovu-title">Fertile Window</div>
            <div class="ovu-dates">${formatDateShort(fertileStart)} - ${formatDateShort(fertileEnd)}</div>
          </div>
          <div class="ovu-dates-list">
            <div class="date-item">
              <span class="date-label">Ovulation</span>
              <span class="date-value">${formatDateShort(ovulation)}</span>
            </div>
            <div class="date-item">
              <span class="date-label">Best Day to Conceive</span>
              <span class="date-value">${formatDateShort(ovulation)}</span>
            </div>
            <div class="date-item">
              <span class="date-label">Period Expected</span>
              <span class="date-value">${formatDateShort(nextPeriod)}</span>
            </div>
          </div>
          <div class="ovu-disclaimer">
            <small>This is an estimate. Consult a healthcare provider for accurate fertility tracking.</small>
          </div>
        </div>
      `;
    }
  });

  const style = document.createElement("style");
  style.textContent = RESULT_STYLES;
  container.appendChild(style);
}
