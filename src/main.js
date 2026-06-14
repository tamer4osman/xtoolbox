/**
 * Main entry point
 * Initializes the app: styles, router, navbar, footer
 */

// ===== Import Styles =====
import './styles/global.css';
import './styles/components.css';
import './styles/utilities.css';

// ===== Import Core Modules =====
import { initRouter, on, setNotFound } from './router.js';
import { renderNavbar, initNavbar } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { initTooltips } from './components/tooltip.js';
import { $ } from './utils/dom-query.js';

// ===== Import Page Renderers =====
import { renderHome } from './pages/home.js';
import { renderCategory } from './pages/category.js';
import { renderTool } from './pages/tool.js';
import { renderAbout } from './pages/about.js';
import { renderPrivacy } from './pages/privacy.js';
import { renderTerms } from './pages/terms.js';
import { renderNotFound } from './pages/not-found.js';

// ===== Initialize App =====
function initApp() {
  // 1. Render persistent UI (navbar + footer)
  const navbarEl = $('#navbar');
  const footerEl = $('#footer');

  if (navbarEl) navbarEl.innerHTML = renderNavbar();
  if (footerEl) footerEl.innerHTML = renderFooter();

  // 2. Initialize navbar event listeners
  initNavbar();
  initTooltips();

  // 3. Register routes
  on('/', () => renderHome());
  on('/category/:id', (params) => renderCategory(params.id));
  on('/tools/:id', (params) => renderTool(params.id));
  on('/about', () => renderAbout());
  on('/privacy', () => renderPrivacy());
  on('/terms', () => renderTerms());

  // 4. Set 404 handler
  setNotFound(() => renderNotFound());

  // 5. Initialize router
  initRouter();

  // 6. Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/src/sw.js').catch(err => {
        console.log('SW registration failed:', err);
      });
    });
  }
}

// ===== Start App =====
document.addEventListener('DOMContentLoaded', initApp);
