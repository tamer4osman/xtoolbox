/**
 * Simple hash-based router
 * Uses #/path format: #/tools/merge-pdf, #/category/pdf, etc.
 */

const routes = {};
let currentRoute = null;
let notFoundHandler = null;

export function on(path, handler) {
  routes[path] = { handler, pattern: pathToRegex(path) };
}

export function setNotFound(handler) {
  notFoundHandler = handler;
}

export function navigate(path) {
  window.location.hash = '#' + path;
}

/**
 * @public
 */
export function getCurrentPath() {
  return window.location.hash.slice(1) || '/';
}

function pathToRegex(path) {
  const pattern = path.replace(/\//g, '\\/').replace(/:([^/]+)/g, '([^/]+)');
  return new RegExp('^' + pattern + '$');
}

function matchRoute(path) {
  for (const [routePath, route] of Object.entries(routes)) {
    const match = path.match(route.pattern);
    if (match) {
      const paramNames = (routePath.match(/:([^/]+)/g) || []).map(p => p.slice(1));
      const params = {};
      paramNames.forEach((name, i) => { params[name] = match[i + 1]; });
      return { handler: route.handler, params };
    }
  }
  return null;
}

async function handleRouteChange() {
  const path = getCurrentPath();

  if (currentRoute && currentRoute.startsWith('/tools/') && !path.startsWith('/tools/')) {
    const { cleanupToolResources } = await import('./pages/tool.js');
    await cleanupToolResources();
  }

  let cleanup = currentCleanup;
  currentCleanup = null;
  if (cleanup) {
    try { await cleanup(); } catch (e) { console.error('Route cleanup error:', e); }
  }

  const matched = matchRoute(path);

  if (matched) {
    currentRoute = path;
    await matched.handler(matched.params);
  } else if (notFoundHandler) {
    await notFoundHandler();
  }

  window.scrollTo(0, 0);
  updateActiveLinks(path);
}

export function setCleanup(fn) {
  currentCleanup = fn;
}

let currentCleanup = null;

function updateActiveLinks(currentPath) {
  document.querySelectorAll('[data-nav-link]').forEach(link => {
    const href = link.getAttribute('data-nav-link');
    if (currentPath.startsWith(href) && href !== '/') {
      link.classList.add('active');
    } else if (currentPath === '/' && href === '/') {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

export function initRouter() {
  window.addEventListener('hashchange', handleRouteChange);
  handleRouteChange();
}
