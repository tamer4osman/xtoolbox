/**
 * Simple hash-based router
 * Uses #/path format: #/tools/merge-pdf, #/category/pdf, etc.
 */

import { endProcessing, getProcessingLabel } from "./utils/processing-guard.js";

const routes = {};
let currentRoute = null;
let currentCleanup = null;
let notFoundHandler = null;
let navigationGuard = null;
let guardSuspended = false;

export function on(path, handler) {
  routes[path] = { handler, pattern: pathToRegex(path) };
}

export function setNotFound(handler) {
  notFoundHandler = handler;
}

export function navigate(path) {
  window.location.hash = "#" + path;
}

/**
 * @public
 */
export function getCurrentPath() {
  return window.location.hash.slice(1) || "/";
}

function pathToRegex(path) {
  const pattern = path.replace(/\//g, "\\/").replace(/:([^/]+)/g, "([^/]+)");
  return new RegExp("^" + pattern + "$");
}

function matchRoute(path) {
  for (const [routePath, route] of Object.entries(routes)) {
    const match = path.match(route.pattern);
    if (match) {
      const paramNames = (routePath.match(/:([^/]+)/g) || []).map(p => p.slice(1));
      const params = {};
      paramNames.forEach((name, i) => {
        params[name] = match[i + 1];
      });
      return { handler: route.handler, params };
    }
  }
  return null;
}

async function handleRouteChange() {
  const path = getCurrentPath();

  if (guardSuspended) {
    guardSuspended = false;
  } else if (committedPath !== null && navigationGuard && navigationGuard()) {
    const label = getProcessingLabel() || "Work";
    if (!window.confirm(`${label} is still running. Leave and discard it?`)) {
      revertToCommitted();
      return;
    }
    endProcessing();
  }

  if (currentRoute && currentRoute.startsWith("/tools/") && !path.startsWith("/tools/")) {
    const { cleanupToolResources } = await import("./pages/tool.js");
    await cleanupToolResources();
  }

  let cleanup = currentCleanup;
  currentCleanup = null;
  if (cleanup) {
    try {
      await cleanup();
    } catch (e) {
      console.error("Route cleanup error:", e);
    }
  }

  const matched = matchRoute(path);

  if (matched) {
    currentRoute = path;
    try {
      await matched.handler(matched.params);
      committedPath = path;
    } catch (e) {
      await renderRouteError(path, e);
    }
  } else if (notFoundHandler) {
    try {
      await notFoundHandler();
      committedPath = path;
    } catch (e) {
      await renderRouteError(path, e);
    }
  }

  window.scrollTo(0, 0);
  updateActiveLinks(path);
}

let committedPath = null;

function revertToCommitted() {
  guardSuspended = true;
  window.location.hash = "#" + committedPath;
}

async function renderRouteError(path, error) {
  console.error("Route render failed for", path, error);
  const main = document.getElementById("main-content");
  if (main) {
    main.innerHTML = `
      <div class="container">
        <div class="error-page">
          <h1>Something went wrong</h1>
          <p>This page failed to load. Please refresh the page or go back and try again.</p>
        </div>
      </div>
    `;
  }
  try {
    const { showToast } = await import("./components/toast.js");
    showToast({ message: "Page failed to load", type: "error", duration: 5000 });
  } catch (toastErr) {
    console.error("Toast unavailable:", toastErr);
  }
}

export function setCleanup(fn) {
  currentCleanup = fn;
}

/**
 * Register a guard consulted before every route change. Return true from the
 * guard to require user confirmation before leaving the current view.
 * @public
 */
export function setNavigationGuard(fn) {
  navigationGuard = typeof fn === "function" ? fn : null;
}

function updateActiveLinks(currentPath) {
  document.querySelectorAll("[data-nav-link]").forEach(link => {
    const href = link.getAttribute("data-nav-link");
    if (currentPath.startsWith(href) && href !== "/") {
      link.classList.add("active");
    } else if (currentPath === "/" && href === "/") {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

export function initRouter() {
  window.addEventListener("hashchange", handleRouteChange);
  handleRouteChange();
}
