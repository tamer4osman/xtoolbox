/**
 * Show a modal dialog
 */
export function showModal({ title, content, onClose }) {
  let container = document.getElementById('modal-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'modal-container';
    document.body.appendChild(container);
  }

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:var(--space-4);';

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.cssText = 'background:var(--color-bg);border-radius:var(--radius-xl);max-width:600px;width:100%;max-height:80vh;overflow-y:auto;box-shadow:var(--shadow-xl);';

  modal.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-6);border-bottom:1px solid var(--color-border);">
      <h2 style="font-size:var(--text-xl);font-weight:700;">${title}</h2>
      <button class="modal-close" style="background:none;border:none;font-size:var(--text-xl);cursor:pointer;color:var(--color-text-muted);padding:var(--space-2);">✕</button>
    </div>
    <div class="modal-body" style="padding:var(--space-6);"></div>
  `;

  const body = modal.querySelector('.modal-body');
  if (typeof content === 'string') {
    body.innerHTML = content;
  } else if (content instanceof Node) {
    body.appendChild(content);
  }

  overlay.appendChild(modal);
  container.appendChild(overlay);

  function close() {
    overlay.remove();
    if (onClose) onClose();
  }

  modal.querySelector('.modal-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function handler(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', handler); }
  });

  return { close };
}
