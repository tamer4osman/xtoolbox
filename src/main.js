/**
 * Main entry point
 * Initializes the app: styles, router, navbar, footer
 * Page renderers are lazy-loaded on demand for fast SPA navigation.
 */

// ===== Import Styles =====
import './styles/global.css';
import './styles/components.css';
import './styles/utilities.css';

// ===== Import Core Modules (always needed) =====
import { initRouter, on, setCleanup, setNotFound } from './router.js';
import { renderNavbar, initNavbar } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { initTooltips } from './components/tooltip.js';
import { $ } from './utils/dom-query.js';

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

  // 3. Register routes — lazy load page renderers for fast initial bundle
  on('/', async () => {
    const { renderHome } = await import('./pages/home.js');
    renderHome();
  });

  on('/category/:id', async (params) => {
    const { renderCategory } = await import('./pages/category.js');
    renderCategory(params.id);
  });

  on('/tools/:id', async (params) => {
    const { renderTool, cleanupToolResources } = await import('./pages/tool.js');
    setCleanup(cleanupToolResources);
    await renderTool(params.id);
  });

  on('/about', async () => {
    const { renderAbout } = await import('./pages/about.js');
    renderAbout();
  });

  on('/privacy', async () => {
    const { renderPrivacy } = await import('./pages/privacy.js');
    renderPrivacy();
  });

  on('/terms', async () => {
    const { renderTerms } = await import('./pages/terms.js');
    renderTerms();
  });

  // 4. Set 404 handler
  setNotFound(async () => {
    const { renderNotFound } = await import('./pages/not-found.js');
    renderNotFound();
  });

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
