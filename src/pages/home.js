import { $, createElement } from '../utils/dom.js';
import { debounce } from '../utils/debounce.js';
import { navigate } from '../router.js';
import { updatePageMeta } from '../utils/seo.js';
import { createToolCard } from '../components/card.js';
import toolsData from '../data/tools.json';
import categoriesData from '../data/categories.json';

export function renderHome() {
  const main = $('#main-content');

  updatePageMeta({
    title: 'XToolBox - Free Online Tools',
    description: '227 free online tools. Compress images, edit PDFs, convert videos and more. 100% client-side — your files never leave your device.',
    url: window.location.origin
  });

  const popularTools = [
    'compress-image', 'merge-pdf', 'remove-background', 'image-to-text',
    'compress-video', 'qr-generator', 'password-generator', 'resize-image',
    'video-to-gif', 'markdown-html', 'color-blindness', 'scientific-calculator',
    'stopwatch', 'image-filters', 'countdown-timer', 'typing-speed-test'
  ];

  const popular = popularTools.map(id => toolsData.find(t => t.id === id)).filter(Boolean);

  main.innerHTML = `
    <div class="hero">
      <div class="container">
        <h1>Free Online Tools — 100% Private</h1>
        <p class="slogan">We are the tools you need every day.</p>
        <p>All processing happens in your browser. Your files never leave your device.</p>
        <div class="hero-search">
          <div class="search-wrapper">
            <input type="text" id="search-input" placeholder="Search 227 tools..." autocomplete="off" aria-label="Search tools">
            <div id="search-results" class="search-results"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <section style="margin-top: var(--space-12);">
        <div class="section-header">
          <h2 class="section-title">Popular Tools</h2>
        </div>
        <div class="tools-grid" id="popular-tools"></div>
      </section>

      <section style="margin-top: var(--space-12);">
        <div class="section-header">
          <h2 class="section-title">All Categories</h2>
        </div>
        <div class="tools-grid" id="categories-grid"></div>
      </section>

      <section style="margin-top: var(--space-12);">
        <h2 class="section-title text-center">Why XToolBox?</h2>
        <div class="features">
          <div class="feature-card">
            <div class="feature-icon">🆓</div>
            <h3>100% Free</h3>
            <p>No hidden fees, no premium plans. Every tool is completely free to use.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3>Completely Private</h3>
            <p>All processing happens in your browser. Your files never leave your device.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>No Upload Needed</h3>
            <p>Everything runs client-side. No waiting for uploads or downloads from servers.</p>
          </div>
        </div>
      </section>
    </div>
  `;

  // Render popular tools
  const popularGrid = main.querySelector('#popular-tools');
  popular.forEach(tool => {
    const card = createToolCard({
      title: tool.name,
      description: tool.description,
      icon: tool.icon,
      href: tool.href,
      category: tool.category
    });
    popularGrid.appendChild(card);
  });

  // Render categories
  const catGrid = main.querySelector('#categories-grid');
  categoriesData.forEach(cat => {
    const card = createToolCard({
      title: cat.name,
      description: cat.description,
      icon: cat.icon,
      href: `/category/${cat.id}`,
      category: `${cat.toolCount} tools`
    });
    catGrid.appendChild(card);
  });

  // Search functionality
  initSearch();
  initAllSearchInputs();
}

function initSearch() {
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  if (!searchInput || !searchResults) return;

  const handleSearch = debounce((e) => {
    const query = e.target.value.trim().toLowerCase();
    if (query.length < 2) {
      searchResults.innerHTML = '';
      searchResults.classList.remove('visible');
      return;
    }
    const results = searchTools(query);
    renderSearchResults(results, searchResults, query);
  }, 300);

  searchInput.addEventListener('input', handleSearch);

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper')) {
      searchResults.classList.remove('visible');
    }
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchResults.classList.remove('visible');
      searchInput.blur();
    }
    if (e.key === 'Enter') {
      const firstResult = searchResults.querySelector('.search-result-item');
      if (firstResult) firstResult.click();
    }
  });
}

export function initAllSearchInputs() {
  // Hero search (already initialized in initSearch, but re-run for safety)
  const heroInput = document.getElementById('search-input');
  const heroResults = document.getElementById('search-results');
  if (heroInput && heroResults) initSearchInput(heroInput, heroResults);

  // Navbar search
  const navbarInput = document.getElementById('navbar-search-input');
  const navbarResults = document.getElementById('navbar-search-results');
  if (navbarInput && navbarResults) initSearchInput(navbarInput, navbarResults);

  // Mobile search
  const mobileInput = document.getElementById('mobile-search-input');
  if (mobileInput) {
    mobileInput.addEventListener('input', debounce((e) => {
      const query = e.target.value.trim().toLowerCase();
      if (query.length < 2) {
        mobileInput.classList.remove('search-active');
        return;
      }
      const results = searchTools(query);
      if (results.length > 0) {
        mobileInput.classList.add('search-active');
        // For mobile, navigate to first result on Enter
      } else {
        mobileInput.classList.remove('search-active');
      }
    }, 300));

    mobileInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = e.target.value.trim().toLowerCase();
        const results = searchTools(query);
        if (results.length > 0) {
          navigate(`/tools/${results[0].id}`);
        }
      }
    });
  }
}

function initSearchInput(input, resultsContainer) {
  const handleSearch = debounce((e) => {
    const query = e.target.value.trim().toLowerCase();
    if (query.length < 2) {
      resultsContainer.innerHTML = '';
      resultsContainer.classList.remove('visible');
      return;
    }
    const results = searchTools(query);
    renderSearchResults(results, resultsContainer, query);
  }, 300);

  input.addEventListener('input', handleSearch);

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar-search')) {
      resultsContainer.classList.remove('visible');
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      resultsContainer.classList.remove('visible');
      input.blur();
    }
    if (e.key === 'Enter') {
      const firstResult = resultsContainer.querySelector('.search-result-item');
      if (firstResult) firstResult.click();
    }
  });
}

function searchTools(query) {
  const words = query.split(/\s+/);
  return toolsData
    .map(tool => {
      let score = 0;
      const searchableText = [tool.name, tool.description, tool.category, ...(tool.keywords || [])].join(' ').toLowerCase();
      for (const word of words) {
        if (tool.name.toLowerCase().includes(word)) score += 10;
        if ((tool.keywords || []).some(k => k.includes(word))) score += 5;
        if (tool.description.toLowerCase().includes(word)) score += 3;
        if (tool.category.toLowerCase().includes(word)) score += 1;
        if (searchableText.includes(word)) score += 1;
      }
      return { ...tool, score };
    })
    .filter(tool => tool.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

function renderSearchResults(results, container, query) {
  if (results.length === 0) {
    container.innerHTML = '<div class="search-no-results"><p>No tools found. Try a different search term.</p></div>';
    container.classList.add('visible');
    return;
  }

  container.innerHTML = results.map(tool => `
    <a href="#/tools/${tool.id}" class="search-result-item" data-tool-id="${tool.id}">
      <span class="search-result-icon">${tool.icon}</span>
      <div class="search-result-info">
        <span class="search-result-name">${highlightMatch(tool.name, query)}</span>
        <span class="search-result-desc">${tool.description}</span>
      </div>
      <span class="search-result-category">${tool.category}</span>
    </a>
  `).join('');

  container.classList.add('visible');

  container.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(`/tools/${item.dataset.toolId}`);
      container.classList.remove('visible');
    });
  });
}

function highlightMatch(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}
