export function renderCategoryCards(tools) {
  return tools
    .map(
      t => `
    <a href="#${t.href}" class="tool-card" data-nav-link="${t.href}">
      <span class="tool-card-icon">${t.icon}</span>
      <h3 class="tool-card-title">${t.name}</h3>
      <p class="tool-card-desc">${t.description}</p>
      ${t.category ? `<span class="tool-card-category">${t.category}</span>` : ""}
    </a>
  `
    )
    .join("");
}
