# dom.js Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split `src/utils/dom.js` (69 LOC, 3 unrelated exports) into 3 focused modules: `escape-html.js`, `dom-query.js`, `dom-create.js`. Delete `dom.js`, update all 27 imports.

**Architecture:** Pure structural refactoring — no behavior changes. Each new file contains one concern: string escaping, DOM querying, or DOM creation. All 27 import paths updated directly (no barrel re-export).

**Tech Stack:** Vanilla JS, Vitest for tests

---

## File Structure

```
src/utils/
  escape-html.js    ← CREATE: pure string escapeHtml() function
  dom-query.js      ← CREATE: $() querySelector shorthand
  dom-create.js     ← CREATE: createElement() factory + helpers
  dom.js            ← DELETE: after all imports updated

src/__tests__/
  escape-html.test.js   ← CREATE: tests for escapeHtml
  dom-query.test.js     ← CREATE: tests for $
  dom-create.test.js    ← CREATE: tests for createElement
  dom.test.js           ← DELETE: after new test files created
```

---

### Task 1: Create `escape-html.js` and its tests

**Files:**

- Create: `src/utils/escape-html.js`
- Create: `src/__tests__/escape-html.test.js`

- [ ] **Step 1: Write the test file**

```js
// src/__tests__/escape-html.test.js
import { describe, it, expect } from "vitest";
import { escapeHtml } from "../utils/escape-html.js";

describe("escapeHtml", () => {
  it("escapes ampersands", () => {
    expect(escapeHtml("a&b")).toBe("a&amp;b");
  });

  it("escapes less-than", () => {
    expect(escapeHtml("a<b")).toBe("a&lt;b");
  });

  it("escapes greater-than", () => {
    expect(escapeHtml("a>b")).toBe("a&gt;b");
  });

  it("escapes double quotes", () => {
    expect(escapeHtml('a"b')).toBe("a&quot;b");
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("a'b")).toBe("a&#39;b");
  });

  it("escapes multiple entities", () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
    );
  });

  it("returns empty string for null", () => {
    expect(escapeHtml(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(escapeHtml(undefined)).toBe("");
  });

  it("converts numbers to string", () => {
    expect(escapeHtml(42)).toBe("42");
  });

  it("handles plain text unchanged", () => {
    expect(escapeHtml("hello world")).toBe("hello world");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/__tests__/escape-html.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Create the implementation**

```js
// src/utils/escape-html.js
/**
 * Escape HTML entities to prevent XSS.
 * Pure string function — no DOM dependency.
 */
export function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/escape-html.test.js`
Expected: 10/10 PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/escape-html.js src/__tests__/escape-html.test.js
git commit -m "refactor: extract escapeHtml to utils/escape-html.js"
```

---

### Task 2: Create `dom-query.js` and its tests

**Files:**

- Create: `src/utils/dom-query.js`
- Create: `src/__tests__/dom-query.test.js`

- [ ] **Step 1: Write the test file**

```js
// src/__tests__/dom-query.test.js
import { describe, it, expect } from "vitest";
import { $ } from "../utils/dom-query.js";

describe("$", () => {
  it("queries element by selector", () => {
    document.body.innerHTML = '<div id="test">hi</div>';
    expect($("#test").textContent).toBe("hi");
  });

  it("queries within parent", () => {
    document.body.innerHTML = '<section><p class="para">text</p></section>';
    const section = document.querySelector("section");
    expect($(".para", section).textContent).toBe("text");
  });

  it("returns null for missing element", () => {
    expect($("#missing")).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/__tests__/dom-query.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Create the implementation**

```js
// src/utils/dom-query.js
/**
 * Query selector shorthand.
 */
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/dom-query.test.js`
Expected: 3/3 PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/dom-query.js src/__tests__/dom-query.test.js
git commit -m "refactor: extract $ selector to utils/dom-query.js"
```

---

### Task 3: Create `dom-create.js` and its tests

**Files:**

- Create: `src/utils/dom-create.js`
- Create: `src/__tests__/dom-create.test.js`

- [ ] **Step 1: Write the test file**

```js
// src/__tests__/dom-create.test.js
import { describe, it, expect } from "vitest";
import { createElement } from "../utils/dom-create.js";

describe("createElement", () => {
  it("creates element with tag", () => {
    const el = createElement("div");
    expect(el.tagName.toLowerCase()).toBe("div");
  });

  it("sets className", () => {
    const el = createElement("div", { className: "test-class" });
    expect(el.className).toBe("test-class");
  });

  it("sets id attribute", () => {
    const el = createElement("div", { id: "my-id" });
    expect(el.id).toBe("my-id");
  });

  it("sets textContent", () => {
    const el = createElement("div", { textContent: "hello" });
    expect(el.textContent).toBe("hello");
  });

  it("sets innerHTML", () => {
    const el = createElement("div", { innerHTML: "<span>hi</span>" });
    expect(el.innerHTML).toBe("<span>hi</span>");
  });

  it("sets style object", () => {
    const el = createElement("div", { style: { color: "red", fontSize: "12px" } });
    expect(el.style.color).toBe("red");
    expect(el.style.fontSize).toBe("12px");
  });

  it("sets dataset", () => {
    const el = createElement("div", { dataset: { foo: "bar" } });
    expect(el.dataset.foo).toBe("bar");
  });

  it("adds string children", () => {
    const el = createElement("div", {}, ["hello", " ", "world"]);
    expect(el.textContent).toBe("hello world");
  });

  it("adds node children", () => {
    const child = document.createElement("span");
    child.textContent = "hi";
    const el = createElement("div", {}, [child]);
    expect(el.children.length).toBe(1);
    expect(el.children[0].tagName.toLowerCase()).toBe("span");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/__tests__/dom-create.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Create the implementation**

```js
// src/utils/dom-create.js
/**
 * DOM element factory with attribute handling.
 */
const ATTR_HANDLERS = {
  className: (el, value) => (el.className = value),
  innerHTML: (el, value) => (el.innerHTML = value),
  textContent: (el, value) => (el.textContent = value),
  style: (el, value) => {
    if (value && typeof value === "object") {
      Object.assign(el.style, value);
    } else if (typeof value === "string") {
      el.style.cssText = value;
    }
  },
  dataset: (el, value) => {
    if (value && typeof value === "object") {
      Object.assign(el.dataset, value);
    }
  }
};

function handleAttribute(el, key, value) {
  if (typeof ATTR_HANDLERS[key] === "function") {
    ATTR_HANDLERS[key](el, value);
  } else if (key.startsWith("on")) {
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
  if (typeof children === "string") {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    children.forEach(child => {
      if (typeof child === "string") {
        el.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        el.appendChild(child);
      }
    });
  }
  return el;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/dom-create.test.js`
Expected: 9/9 PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/dom-create.js src/__tests__/dom-create.test.js
git commit -m "refactor: extract createElement to utils/dom-create.js"
```

---

### Task 4: Update `escapeHtml` imports (17 files)

**Files:**

- Modify: 17 files (see table in design doc)

- [ ] **Step 1: Update all escapeHtml imports**

Replace `from '../../utils/dom.js'` with `from '../../utils/escape-html.js'` in these files:

```bash
# Tools (16 files)
rg -l "escapeHtml.*utils/dom" src/tools/ | ForEach-Object { (Get-Content $_) -replace "from '\.\./\.\./utils/dom\.js'" -replace "from '../../utils/dom.js'", "from '../../utils/escape-html.js'" | Set-Content $_ }
```

Or manually update each file:

1. `src/tools/dev/subnet-calculator.js` — line 1
2. `src/tools/dev/sql-to-json.js` — line 1
3. `src/tools/dev/sitemap-visualizer.js` — line 1
4. `src/tools/dev/nginx-constants.js` — line 1
5. `src/tools/dev/llm-token-counter.js` — line 3
6. `src/tools/dev/gitignore-generator.js` — line 4
7. `src/tools/dev/env-editor.js` — line 4
8. `src/tools/shared/lookup.js` — line 1
9. `src/tools/text/text-diff.js` — line 1
10. `src/tools/seo/og-generator.js` — line 1
11. `src/tools/reference/thesaurus.js` — line 2
12. `src/tools/reference/holiday-calendar.js` — line 2
13. `src/tools/reference/dictionary.js` — line 2
14. `src/tools/reference/book-lookup.js` — line 2
15. `src/tools/health/health-calculator.js` — line 14
16. `src/tools/pdf/pdf-to-epub.js` — line 4

And the test file: 17. `src/__tests__/text-diff.test.js` — line 3: change `'../utils/dom.js'` → `'../utils/escape-html.js'`

- [ ] **Step 2: Run unit tests to verify no breakage**

Run: `npx vitest run`
Expected: All tests PASS (969+)

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: update 17 escapeHtml imports to utils/escape-html.js"
```

---

### Task 5: Update `$` imports (8 files)

**Files:**

- Modify: 8 files

- [ ] **Step 1: Update all $ imports**

Replace `from './utils/dom.js'` with `from './utils/dom-query.js'` in:

1. `src/main.js` — line 16
2. `src/pages/category.js` — line 1
3. `src/pages/about.js` — line 1
4. `src/pages/not-found.js` — line 1
5. `src/pages/terms.js` — line 1
6. `src/pages/home.js` — line 1
7. `src/pages/privacy.js` — line 1

And the mixed import: 8. `src/pages/tool.js` — line 1: change `{ $, createElement } from '../utils/dom.js'` → `{ $ } from '../utils/dom-query.js'` + `{ createElement } from '../utils/dom-create.js'`

- [ ] **Step 2: Run unit tests to verify no breakage**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: update 8 $ imports to utils/dom-query.js"
```

---

### Task 6: Update `createElement` imports (2 files)

**Files:**

- Modify: `src/components/file-upload.js`
- Modify: `src/__tests__/dom.test.js`

- [ ] **Step 1: Update file-upload.js**

Change line 2:

```js
// Before
import { createElement } from "../utils/dom.js";
// After
import { createElement } from "../utils/dom-create.js";
```

- [ ] **Step 2: Update dom.test.js**

Change line 2:

```js
// Before
import { createElement, $ } from "../utils/dom.js";
// After
import { createElement } from "../utils/dom-create.js";
import { $ } from "../utils/dom-query.js";
```

- [ ] **Step 3: Run unit tests to verify no breakage**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: update 2 createElement imports to utils/dom-create.js"
```

---

### Task 7: Delete old files and verify

**Files:**

- Delete: `src/utils/dom.js`
- Delete: `src/__tests__/dom.test.js` (replaced by dom-query.test.js and dom-create.test.js)

- [ ] **Step 1: Delete dom.js**

```bash
rm src/utils/dom.js
```

- [ ] **Step 2: Delete old dom.test.js**

```bash
rm src/__tests__/dom.test.js
```

- [ ] **Step 3: Verify no remaining imports of dom.js**

Run: `rg "utils/dom\.js" src/`
Expected: No matches

- [ ] **Step 4: Run full unit test suite**

Run: `npx vitest run`
Expected: All tests PASS (should be 972+ now with new test files)

- [ ] **Step 5: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 6: Run fallow health**

Run: `npx fallow health --format compact`
Expected: dom.js no longer flagged, health score improved

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor: delete dom.js and dom.test.js after split"
```

---

### Task 8: Final verification

- [ ] **Step 1: Run full test suite one more time**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 2: Verify file counts**

- `src/utils/escape-html.js` exists
- `src/utils/dom-query.js` exists
- `src/utils/dom-create.js` exists
- `src/utils/dom.js` does NOT exist
- `src/__tests__/escape-html.test.js` exists
- `src/__tests__/dom-query.test.js` exists
- `src/__tests__/dom-create.test.js` exists
- `src/__tests__/dom.test.js` does NOT exist

- [ ] **Step 3: Final commit if any cleanup needed**

```bash
git add -A
git commit -m "refactor(dom): complete dom.js split into focused modules"
```
