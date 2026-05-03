import { createElement } from '../utils/dom.js';

/**
 * Create a progress bar component
 */
export function createProgressBar({ label = '', showPercent = true }) {
  const container = createElement('div', { className: 'progress-bar-container' });
  container.style.cssText = 'width:100%;margin:var(--space-4) 0;';

  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-2);">
      <span class="progress-label" style="font-size:var(--text-sm);font-weight:500;">${label}</span>
      ${showPercent ? '<span class="progress-percent" style="font-size:var(--text-sm);font-weight:600;color:var(--color-primary);">0%</span>' : ''}
    </div>
    <div style="height:8px;background:var(--color-border);border-radius:var(--radius-full);overflow:hidden;">
      <div class="progress-fill" style="height:100%;background:var(--color-primary);border-radius:var(--radius-full);width:0%;transition:width 0.3s ease;"></div>
    </div>
  `;

  const fill = container.querySelector('.progress-fill');
  const percent = container.querySelector('.progress-percent');

  return {
    element: container,
    setProgress: (p) => {
      fill.style.width = `${Math.min(100, Math.max(0, p))}%`;
      if (percent) percent.textContent = `${Math.round(p)}%`;
    },
    setLabel: (text) => {
      const lbl = container.querySelector('.progress-label');
      if (lbl) lbl.textContent = text;
    },
    show: () => { container.style.display = 'block'; },
    hide: () => { container.style.display = 'none'; }
  };
}
