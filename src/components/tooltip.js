/**
 * Simple tooltip - add data-tooltip attribute to elements
 * CSS handles the display via [data-tooltip]:hover::after
 */
export function initTooltips() {
  // Add tooltip CSS if not already present
  if (!document.getElementById('tooltip-styles')) {
    const style = document.createElement('style');
    style.id = 'tooltip-styles';
    style.textContent = `
      [data-tooltip] { position: relative; }
      [data-tooltip]:hover::after {
        content: attr(data-tooltip);
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        padding: 4px 8px;
        background: var(--color-text);
        color: white;
        font-size: var(--text-xs);
        border-radius: var(--radius-sm);
        white-space: nowrap;
        z-index: 1000;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  }
}
