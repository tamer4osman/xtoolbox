/**
 * Show a toast notification
 */
export function showToast({ message, type = "info", duration = 3000 }) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.setAttribute("aria-live", "polite");
    container.setAttribute("role", "status");
    document.body.appendChild(container);
  }

  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("toast-visible"));

  setTimeout(() => {
    toast.classList.remove("toast-visible");
    toast.classList.add("toast-exit");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
