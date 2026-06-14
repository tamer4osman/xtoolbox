# Design: Split dom.js into Focused Modules

## Problem

`src/utils/dom.js` (69 LOC) exports three unrelated functions:

| Export | LOC | Importers | Purpose |
|--------|-----|-----------|---------|
| `escapeHtml(s)` | 8 | **17 files** | Pure string XSS escaping — NO DOM dependency |
| `$(selector, parent)` | 3 | **8 files** | querySelector shorthand |
| `createElement(tag, attrs, children)` | 16 | **3 files** | DOM element factory |

The fallow analysis flags dom.js as the #1 refactoring target (score 12.4, priority 37.2) because "27 dependents amplify every change." But 17 of those 27 dependents only use `escapeHtml` — a pure string function with zero DOM dependency. This inflates the coupling metric and means any DOM-related change ripples into 17 unrelated tool files.

## Design

### New File Structure

```
src/utils/
  escape-html.js    ← pure string function (17 importers)
  dom-query.js      ← $ selector (8 importers)
  dom-create.js     ← createElement factory (3 importers)
```

Delete `src/utils/dom.js` entirely. No barrel re-export — all 27 imports updated directly.

### File Contents

#### `escape-html.js` (~10 LOC)

```js
/**
 * Escape HTML entities to prevent XSS.
 * Pure string function — no DOM dependency.
 */
export function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

#### `dom-query.js` (~5 LOC)

```js
/**
 * Query selector shorthand.
 */
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}
```

#### `dom-create.js` (~35 LOC)

```js
/**
 * DOM element factory with attribute handling.
 */
const ATTR_HANDLERS = {
  className: (el, value) => (el.className = value),
  innerHTML: (el, value) => (el.innerHTML = value),
  textContent: (el, value) => (el.textContent = value),
  style: (el, value) => {
    if (value && typeof value === 'object') {
      Object.assign(el.style, value);
    } else if (typeof value === 'string') {
      el.style.cssText = value;
    }
  },
  dataset: (el, value) => {
    if (value && typeof value === 'object') {
      Object.assign(el.dataset, value);
    }
  },
};

function handleAttribute(el, key, value) {
  if (typeof ATTR_HANDLERS[key] === 'function') {
    ATTR_HANDLERS[key](el, value);
  } else if (key.startsWith('on')) {
    el.addEventListener(key.slice(2).toLowerCase(), value);
  } else {
    el.setAttribute(key, value);
  }
}

function setAttributes(el, attrs) {
  for (const [key, value] of Object.entries(attrs)) {
    handleAttribute(el, key, value);
  }
}

export function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  setAttributes(el, attrs);
  if (typeof children === 'string') {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    children.forEach(child => {
      if (typeof child === 'string') {
        el.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        el.appendChild(child);
      }
    });
  }
  return el;
}
```

### Import Updates (27 files)

#### `escapeHtml` imports (17 files → `escape-html.js`)

| File | Old Import | New Import |
|------|------------|------------|
| `src/tools/dev/subnet-calculator.js` | `{ escapeHtml } from '../../utils/dom.js'` | `{ escapeHtml } from '../../utils/escape-html.js'` |
| `src/tools/dev/sql-to-json.js` | same | same |
| `src/tools/dev/sitemap-visualizer.js` | same | same |
| `src/tools/dev/nginx-constants.js` | same | same |
| `src/tools/dev/llm-token-counter.js` | same | same |
| `src/tools/dev/gitignore-generator.js` | same | same |
| `src/tools/dev/env-editor.js` | same | same |
| `src/tools/shared/lookup.js` | same | same |
| `src/tools/text/text-diff.js` | same | same |
| `src/tools/seo/og-generator.js` | same | same |
| `src/tools/reference/thesaurus.js` | same | same |
| `src/tools/reference/holiday-calendar.js` | same | same |
| `src/tools/reference/dictionary.js` | same | same |
| `src/tools/reference/book-lookup.js` | same | same |
| `src/tools/health/health-calculator.js` | same | same |
| `src/tools/pdf/pdf-to-epub.js` | same | same |
| `src/__tests__/text-diff.test.js` | `{ escapeHtml } from '../utils/dom.js'` | `{ escapeHtml } from '../utils/escape-html.js'` |

#### `$` imports (7 files → `dom-query.js`)

| File | Old Import | New Import |
|------|------------|------------|
| `src/main.js` | `{ $ } from './utils/dom.js'` | `{ $ } from './utils/dom-query.js'` |
| `src/pages/category.js` | `{ $ } from '../utils/dom.js'` | `{ $ } from '../utils/dom-query.js'` |
| `src/pages/about.js` | same | same |
| `src/pages/not-found.js` | same | same |
| `src/pages/terms.js` | same | same |
| `src/pages/home.js` | same | same |
| `src/pages/privacy.js` | same | same |

#### `$` + `createElement` imports (1 file → split into two)

| File | Old Import | New Import |
|------|------------|------------|
| `src/pages/tool.js` | `{ $, createElement } from '../utils/dom.js'` | `{ $ } from '../utils/dom-query.js'` + `{ createElement } from '../utils/dom-create.js'` |

#### `createElement` imports (2 files → `dom-create.js`)

| File | Old Import | New Import |
|------|------------|------------|
| `src/components/file-upload.js` | `{ createElement } from '../utils/dom.js'` | `{ createElement } from '../utils/dom-create.js'` |
| `src/__tests__/dom.test.js` | `{ createElement, $ } from '../utils/dom.js'` | Split into two imports |

### Test Updates

- Rename `src/__tests__/dom.test.js` → `src/__tests__/dom-query.test.js` (tests `$` only)
- Create `src/__tests__/dom-create.test.js` (move `createElement` tests here)
- Create `src/__tests__/escape-html.test.js` (move `escapeHtml` tests from wherever they exist, or create new)

### Expected Fallow Impact

| Metric | Before | After |
|--------|--------|-------|
| dom.js dependents | 27 | 0 (deleted) |
| escape-html.js dependents | — | 17 |
| dom-query.js dependents | — | 8 |
| dom-create.js dependents | — | 3 |
| Health score | 79 B | Should improve (no high-impact file) |

## Success Criteria

1. All 969 unit tests pass
2. Build succeeds
3. Fallow health score improves (dom.js no longer flagged)
4. No functional changes — pure structural refactoring
