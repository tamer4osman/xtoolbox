/**
 * Create a spinner element
 */
export function createSpinner() {
  const el = document.createElement('div');
  el.className = 'spinner';
  return el;
}

/**
 * Create skeleton placeholder elements
 */
export function createSkeleton(count = 3) {
  const container = document.createElement('div');
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement('div');
    skeleton.style.cssText = 'height:80px;background:var(--color-surface);border-radius:var(--radius-md);margin-bottom:var(--space-3);animation:pulse 1.5s ease-in-out infinite;';
    container.appendChild(skeleton);
  }
  return container;
}

/**
 * Show loading state in container
 */
export function showLoading(container) {
  container._originalContent = container.innerHTML;
  container.innerHTML = '<div style="text-align:center;padding:var(--space-8);"><div class="spinner"></div><p>Loading...</p></div>';
}

/**
 * Restore container content
 */
export function hideLoading(container) {
  if (container._originalContent) {
    container.innerHTML = container._originalContent;
    delete container._originalContent;
  }
}
