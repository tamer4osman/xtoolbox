/**
 * Create a tool card component
 */
export function createToolCard({ title, description, icon, href, category }) {
  const card = document.createElement('a');
  card.href = `#${href}`;
  card.className = 'tool-card';
  card.setAttribute('data-nav-link', href);
  card.innerHTML = `
    <span class="tool-card-icon">${icon}</span>
    <h3 class="tool-card-title">${title}</h3>
    <p class="tool-card-desc">${description}</p>
    ${category ? `<span class="tool-card-category">${category}</span>` : ''}
  `;
  return card;
}
