import { initHealthForm, calcDueDate, daysBetween, weeksBetween, formatDateLong, formatDateShort } from './health-calculator-factory.js';

export const toolConfig = {
  id: 'due-date-calculator',
  name: 'Pregnancy Due Date Calculator',
  category: 'health',
  description: 'Estimate due date from last period with weekly milestones.',
  icon: '👶',
  status: 'done'
};

const RESULT_STYLES = `
  .due-card { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-6); text-align: center; }
  .due-date { margin-bottom: var(--space-6); padding-bottom: var(--space-6); border-bottom: 1px solid var(--color-border); }
  .due-label { font-size: var(--text-sm); color: var(--color-text-secondary); margin-bottom: var(--space-2); }
  .due-value { font-size: 2rem; font-weight: 700; color: var(--color-primary); }
  .due-weeks { display: flex; justify-content: center; gap: var(--space-8); margin-bottom: var(--space-6); }
  .week-item { text-align: center; }
  .week-number { font-size: 2rem; font-weight: 700; }
  .week-label { font-size: var(--text-sm); color: var(--color-text-secondary); }
  .milestones { text-align: left; background: var(--color-bg); padding: var(--space-4); border-radius: var(--radius-lg); }
  .milestones h3 { font-size: var(--text-sm); margin-bottom: var(--space-3); }
  .milestone { display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--color-border); font-size: var(--text-sm); }
  .milestone:last-child { border: none; }
`;

export function render(container) {
  initHealthForm(container, {
    buttonText: 'Calculate Due Date',
    calculate(lastPeriod, cycle) {
      const dueDate = calcDueDate(lastPeriod, cycle);
      const now = new Date();
      return { dueDate, weeks: weeksBetween(lastPeriod, now), daysLeft: daysBetween(now, dueDate) };
    },
    renderResult(el, { dueDate, weeks, daysLeft }) {
      const viability = new Date(dueDate);
      viability.setDate(viability.getDate() - 196);
      const fullTerm = new Date(dueDate);
      fullTerm.setDate(fullTerm.getDate() - 63);

      el.innerHTML = `
        <div class="due-card">
          <div class="due-date">
            <div class="due-label">Your Due Date</div>
            <div class="due-value">${formatDateLong(dueDate)}</div>
          </div>
          <div class="due-weeks">
            <div class="week-item">
              <div class="week-number">${weeks}</div>
              <div class="week-label">weeks pregnant</div>
            </div>
            <div class="week-item">
              <div class="week-number">${daysLeft}</div>
              <div class="week-label">days to go</div>
            </div>
          </div>
          <div class="milestones">
            <h3>Pregnancy Milestones</h3>
            <div class="milestone">
              <span>Viability (24 weeks)</span>
              <span>${formatDateShort(viability)}</span>
            </div>
            <div class="milestone">
              <span>Full Term (37 weeks)</span>
              <span>${formatDateShort(fullTerm)}</span>
            </div>
            <div class="milestone">
              <span>Due Date</span>
              <span>${formatDateShort(dueDate)}</span>
            </div>
          </div>
        </div>
      `;
    }
  });

  const style = document.createElement('style');
  style.textContent = RESULT_STYLES;
  container.appendChild(style);
}
