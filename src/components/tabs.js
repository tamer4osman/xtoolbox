import { createElement } from '../utils/dom.js';

/**
 * Create tabs component
 */
export function createTabs({ tabs, activeIndex = 0, onTabChange }) {
  const container = createElement('div', { className: 'tabs-container' });

  const tabBar = createElement('div', { className: 'tabs-bar' });
  tabBar.style.cssText = 'display:flex;gap:var(--space-1);border-bottom:2px solid var(--color-border);margin-bottom:var(--space-4);';

  const contentPanel = createElement('div', { className: 'tabs-content' });

  let current = activeIndex;

  tabs.forEach((tab, i) => {
    const btn = createElement('button', {
      className: 'tab-btn',
      textContent: tab.label,
      onClick: () => switchTab(i)
    });
    btn.style.cssText = `padding:var(--space-3) var(--space-4);font-size:var(--text-sm);font-weight:500;border:none;background:none;cursor:pointer;color:var(--color-text-secondary);border-bottom:2px solid transparent;margin-bottom:-2px;transition:all 0.2s;`;
    if (i === activeIndex) {
      btn.style.color = 'var(--color-primary)';
      btn.style.borderBottomColor = 'var(--color-primary)';
    }
    tabBar.appendChild(btn);
  });

  function switchTab(index) {
    current = index;
    tabBar.querySelectorAll('.tab-btn').forEach((btn, i) => {
      if (i === index) {
        btn.style.color = 'var(--color-primary)';
        btn.style.borderBottomColor = 'var(--color-primary)';
      } else {
        btn.style.color = 'var(--color-text-secondary)';
        btn.style.borderBottomColor = 'transparent';
      }
    });

    contentPanel.innerHTML = '';
    const content = tabs[index].content;
    if (typeof content === 'string') {
      contentPanel.innerHTML = content;
    } else if (content instanceof Node) {
      contentPanel.appendChild(content);
    }

    if (onTabChange) onTabChange(index);
  }

  // Initialize with first tab content
  const initialContent = tabs[activeIndex].content;
  if (typeof initialContent === 'string') {
    contentPanel.innerHTML = initialContent;
  } else if (initialContent instanceof Node) {
    contentPanel.appendChild(initialContent);
  }

  container.appendChild(tabBar);
  container.appendChild(contentPanel);

  return { element: container, switchTab };
}
