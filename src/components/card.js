export function renderCategoryCards(tools) {
  return tools.map(t => `
    <a href="#${t.href}" class="tool-card" data-nav-link="${t.href}">
      <span class="tool-card-icon">${t.icon}</span>
      <h3 class="tool-card-title">${t.name}</h3>
      <p class="tool-card-desc">${t.description}</p>
      ${t.category ? `<span class="tool-card-category">${t.category}</span>` : ''}
    </a>
  `).join('');
}

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
