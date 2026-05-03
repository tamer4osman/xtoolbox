import { $ } from '../utils/dom.js';
import { updatePageMeta } from '../utils/seo.js';
import { createToolCard } from '../components/card.js';
import toolsData from '../data/tools.json';
import categoriesData from '../data/categories.json';

export function renderCategory(categoryId) {
  const main = $('#main-content');
  const category = categoriesData.find(c => c.id === categoryId);

  if (!category) {
    main.innerHTML = `<div class="container"><div class="error-page"><h1>Category Not Found</h1><p>This category doesn't exist.</p><a href="#/" class="btn btn-primary">Go to Homepage</a></div></div>`;
    return;
  }

  const tools = toolsData.filter(t => t.category === categoryId);

  updatePageMeta({
    title: `${category.name} - Free Online Tools`,
    description: category.description,
    url: `${window.location.origin}/category/${categoryId}`
  });

  main.innerHTML = `
    <div class="container page-content">
      <div class="category-header">
        <span class="category-icon">${category.icon}</span>
        <h1>${category.name}</h1>
        <p>${category.description}</p>
      </div>
      <div class="tools-grid" id="category-tools"></div>
    </div>
  `;

  const grid = main.querySelector('#category-tools');
  tools.forEach(tool => {
    const card = createToolCard({
      title: tool.name,
      description: tool.description,
      icon: tool.icon,
      href: tool.href,
      category: tool.category
    });
    grid.appendChild(card);
  });
}
