---
name: tool-builder
description: Use ONLY when the user asks to build, create, scaffold, or add a new tool to the xtoolbox project. Triggers on phrases like "build a new tool", "add tool", "create tool", "scaffold tool", or naming a specific tool from memory/tool-building-progress.md. Enforces the 20-step tool-building convention from AGENTS.md, including duplicate check, webfetch research, design grilling, security review, file scaffolding, test templates, doc sync, count propagation, self-test gate, and the user-approval gate.
---

# Tool Builder

End-to-end workflow for adding a new tool to the xtoolbox project. Follows the 20-step convention in `AGENTS.md` strictly. **Never skip steps. Never commit before user approval.**

## When to use

- User says "build / add / create / scaffold a tool"
- User names a specific tool from `memory/tool-building-progress.md`
- User asks to "fill a gap" or "implement a missing tool"

## Modifying an existing tool

For fixes, updates, or enhancements to an existing tool, follow Steps 5-17:

1. Edit the tool file
2. Run security review on changed code (Step 5 checklist — skip if no new network/DOM/CDN changes)
3. (Skip unit test if no new logic)
4. (Skip Playwright test if trivial)
5. Verify build
6. Verify unit tests
7. Run SPA performance regression check — same as new tools
8. Run Fallow — same as new tools
9. Present for user approval

Skip docs/count propagation only when the tool is already in the registry and the change doesn't add a new tool.

## Step 0 — Duplicate Check (BLOCKING — do this FIRST)

Before writing ANY code, verify the tool doesn't already exist (even under a different name):

1. **Search `src/data/tools.json`** — by name, category, and keywords for functional overlaps
2. **Search `src/tools/` directory** — grep for related terms (e.g. for "compress" check all compress tools)
3. **Check `toolsList.json`** — for registered tools
4. **Decision:**
   - **Same function, same name** → STOP. Tool already exists.
   - **Same function, different name** → STOP. Tell user, suggest extending/renaming the existing tool instead.
   - **Partial overlap** → Note the overlap, propose how to differentiate, get user confirmation before proceeding.
   - **No overlap** → Proceed to Step 1.

## Step 1 — Research & Confirm (BLOCKING)

After passing the duplicate check, before any work:

1. **Web Search** — Research the best approach for this tool type:
   - Search for "how to implement [tool name] in JavaScript browser"
   - Search for "[tool name] open source library JavaScript"
   - Check existing tools in the project for similar patterns
   - Identify libraries needed (WASM, npm packages) or if pure JS is sufficient

2. **Approach Decision** — Choose the best implementation path:
   - Pure browser APIs (Canvas, Web Audio, FileReader, etc.)
   - WASM modules already in project (pdf-lib, tesseract, ffmpeg.wasm)
   - External library via CDN (check if already available in package.json)
   - Pure JS implementation (most reliable for client-side only)

3. **Confirm with User** — Present findings:
   - "Best approach: [chosen method]"
   - "Libraries needed: [none / package name]"
   - "Potential issues: [any concerns]"

   Wait for user confirmation before proceeding to Step 2.

## Step 2 — Webfetch Best Practices (BLOCKING)

**MUST call the `webfetch` tool.** Do not skip this step. Do not rely on memory or assumptions. Fetch authoritative documentation to ensure the implementation follows official patterns, not guesswork.

**Required fetches (at minimum):**

1. Official library/API docs for the approach chosen in Step 1
2. One reference implementation or tutorial showing the recommended usage pattern

**Optional fetches (if relevant):**

- Open-source reference implementations on GitHub
- MDN Web Docs for browser API usage

**How to structure the fetch:**

1. Identify the primary library/API chosen in Step 1
2. Call `webfetch` on its official "getting started" or "loading" documentation page
3. Note any gotchas, anti-patterns, or browser compatibility issues

**Output:** Document findings in your response. These become the implementation reference for Step 4. If the fetched docs reveal a better approach than Step 1 decided, re-confirm with the user before proceeding.

**Gate:** Do not proceed to Step 3 until you have called `webfetch` at least once and documented the results.

## Step 3 — Grill the design (BLOCKING)

Use the `grill-me` skill to interview the user on every design decision before writing any code. This step resolves ambiguities that would otherwise become rework.

**How to grill:**

1. Ask questions **one batch at a time** (3-4 questions per batch is fine), using **multiple choice format** with 2-4 options each.
2. For each question, provide your **recommended answer** clearly labeled as "Recommended" — the user can pick any option or choose the recommendation.
3. After presenting all questions in the batch, wait for the user's selections before moving to the next batch (if any).
4. If a _fact_ can be found by exploring the environment (filesystem, tools, existing tools), look it up rather than asking.
5. The _decisions_ are the user's — put each one to them and wait for their answer.

**Question format template:**

```
**Question N of M: [Topic]**

[Context sentence]

- **A) [Option]** — [description] (matches spec / simplest / etc.)
- **B) [Option]** — [description]
- **C) [Option]** — [description]

Recommended: **A** — [one-line reason]
```

**What to grill on (minimum):**

- **UI layout** — upload area, options panel, preview, download. Which existing tool's layout is closest?
- **Library choices** — which WASM module, npm package, or pure browser API? Is it already in `package.json`?
- **Factory pattern** — does an existing factory apply (`image-tool-factory`, `video-tool-factory`, `codec-factory`, `lookup-tool-factory`, `merge-tool-factory`, `pdf-options-tool-factory`)? Or does this tool need a bespoke scaffold?
- **Edge cases** — empty input, huge files, unsupported formats, browser compatibility
- **Error handling** — try/catch boundaries, user-facing error messages, graceful degradation
- **Tool-specific decisions** — any non-obvious UX or algorithm choices unique to this tool

**Gate:** Do not proceed to Step 4 until the user confirms you have reached a shared understanding. Do not act on any decision until confirmed.

## Step 4 — Create the tool file

Path: `src/tools/<category>/<tool-id>.js`

The file MUST export both `toolConfig` and `render`. Use this skeleton (no comments in code per AGENTS.md):

```js
export const toolConfig = {
  id: "tool-id",
  name: "Tool Name",
  category: "category",
  description: "One-line description for cards and meta tags.",
  icon: "🛠️",
  keywords: ["keyword1", "keyword2"],
  accept: "",
  maxSizeMB: 10
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <h1>${toolConfig.name}</h1>
      <p>${toolConfig.description}</p>
      <div id="tool-ui"></div>
    </div>
  `;
}
```

Conventions to mimic from existing tools:

- Look at 2-3 neighboring tools in the same category to match patterns, error handling, and DOM helpers used.
- Reuse `src/utils/file.js` (`formatFileSize`, `downloadBlob`, `readFileAsArrayBuffer`, `readFileAsText`).
- Reuse `src/utils/escape-html.js` (`escapeHtml`) and `src/utils/clipboard.js` (`copyToClipboard`) when applicable.
- For PDF tools, use local worker assets via Vite `?url` (see `src/tools/pdf/pdf-utils.js` for the pattern).
- Import styles from `../../styles/components.css` only if a needed class is missing there — otherwise rely on the shared system.

## Step 5 — Security review (BLOCKING)

After creating the tool file, run through this checklist **before** writing tests:

### Network requests

- **No raw `fetch()`** — If the tool calls external APIs, use `safeFetch` from `src/utils/safe-fetch.js` (rate limiting + 429 handling). Never use raw `fetch()` with `AbortSignal.timeout`.
- **HTTPS only** — All external URLs must use `https://`. No `http://` anywhere in the tool.
- **No API keys** — This is a 100% client-side app. Never embed or require API keys.

### DOM safety

- **No `innerHTML` with user input** — If the tool renders user-supplied text, use `escapeHtml()` from `src/utils/escape-html.js`. `innerHTML` with static/constant strings is fine.
- **No `eval()` / `new Function()`** — Use safe alternatives (JSON.parse, DOMParser, template literals). If you need YAML parsing, use a safe library.
- **No `document.write()`** — Ever.

### CDN resources (scripts + stylesheets)

- **SRI integrity required** — Every `document.createElement("script")` or `document.createElement("link")` loading from a CDN must include `integrity` and `crossOrigin = "anonymous"` attributes.
- **CSP compliance** — If using a new CDN domain, it must be added to `vite.config.js` CSP and `_headers` CSP. Check `script-src`, `style-src`, `font-src` as needed.

### Forbidden patterns

- ❌ `document.cookie` access
- ❌ `localStorage.setItem` with sensitive data (tokens, passwords)
- ❌ `window.open` without user gesture
- ❌ Dynamic `import()` from untrusted CDN (use local or add SRI)
- ❌ Loading fonts from CDN without `font-src` CSP entry

### If the tool fails any check

Fix the issue before proceeding. Do not write tests for insecure code.

## Step 6 — Write unit tests

Path: `src/__tests__/<tool-id>.test.js`

Use Vitest. Test pure logic only (not DOM rendering unless trivial). Example:

```js
import { describe, it, expect } from "vitest";

describe("tool-id", () => {
  it("does the thing", () => {
    expect(/* ... */).toBe(/* ... */);
  });
});
```

If the tool is heavily DOM-bound, export the pure helpers and test those. Keep tests fast and offline.

## Step 7 — Write Playwright test

Path: `tests/<tool-id>.spec.js`

```js
import { test, expect } from "@playwright/test";

test("tool-id loads and runs", async ({ page }) => {
  await page.goto("/#/tools/tool-id");
  await expect(page.locator("h1")).toContainText("Tool Name");
});
```

Add deeper interaction only if the tool has a non-trivial happy path.

## Step 8 — Verify build

```bash
npm run build
```

Must exit 0. If it fails, fix the tool file before proceeding. Common causes: bad import path, missing export, syntax error, missing dependency in `package.json`.

## Step 9 — Verify unit tests

```bash
npm run test:unit
```

All tests must pass. The Playwright suite (`npm run test`) is **not** required here — that runs in CI.

## Step 10 — Smoke test (BLOCKING)

Before asking the user, run the automated smoke test. Start the dev server if it is not already running:

```bash
npm run dev
```

Then run the smoke test against the new tool:

```bash
npm run smoke <tool-id>
```

The script (`scripts/smoke-test-tool.mjs`) launches headless Chrome and verifies all of the following in one shot:

1. **Load** — `#tool-container` renders with content (no infinite spinner)
2. **Header** — `.tool-header h1` matches the tool name in `tools.json`
3. **Primary control** — at least one `input`, `button`, `textarea`, or `select` exists inside `#tool-container`
4. **No error state** — no `.error-state` / `.error-page` element rendered
5. **0 console errors** — filters out third-party ad/favicon noise
6. **0 uncaught page errors** — no thrown exceptions
7. **0 failed network requests** — no 4xx/5xx (filters out ad/favicon). The new tool's `.js` module must return 200, and every helper it imports must resolve

**Pass criteria:** script exits 0 (all checks pass). If it exits 1, fix the reported issue and re-run.

**If a 4xx appears on the tool's `.js` module:** the Vite module cache may be stale — stop server, `rm -rf node_modules/.vite`, restart, re-test.

**Lighthouse a11y (manual, optional):** For a deeper visual audit, run `lighthouse_audit` via the Chrome DevTools MCP. Score must be >= 90. Fix any critical issues found (missing labels, low contrast, heading order). SEO/best-practice scores don't need to pass. This is separate from the automated smoke test and can be skipped if the tool has no new interactive controls.

If any check fails, fix the code and re-run from Step 4. **Do not bother the user with a broken tool** — the user gate is for them to validate the polished version, not to find obvious bugs.

## Step 11 — SPA performance regression check (BLOCKING)

Verify that adding the new tool doesn't regress SPA navigation performance. Run the automated Playwright-based performance check with the dev server running:

```bash
node scripts/measure-spa-performance.mjs
```

This script navigates through all 8 page templates (home, category×2, tool×2, about, privacy, terms) **twice** — cold (module fetch) first, then warm (cached). The warm pass must finish under **50ms** for every route.

**If it fails:**

- Check if your tool's module is pulling excessive static imports into its chunk
- Check if the tool's render function does synchronous DOM work that blocks the main thread
- Move non-critical content (ads, related tools, FAQ) behind `queueMicrotask` or lazy rendering
- Verify no `import` of large JSON data (tools.json is ~50 kB — use dynamic import if your tool needs it)

## Step 12 — Fallow static analysis (BLOCKING)

Run Fallow against the new tool's file to catch dead code and complexity issues before the user sees it:

```bash
npx fallow dead-code --changed-since=HEAD~1
npx fallow dupes --changed-since=HEAD~1
npx fallow health --format compact
```

- **Dead code** — Fallow must report 0 unused exports in the new tool file. Every exported symbol (`toolConfig`, `render`, and any helper functions) must be consumed by the module graph. If Fallow flags something, either remove it or add a re-export/barrel.
- **Health** — Fallow must not report any file with complexity above the project threshold. If the tool file triggers a warning, refactor to reduce branching.

If either check fails, fix the code and re-run Step 12. Do not proceed to Step 13 until both pass clean.

## Step 13 — Oxlint + Oxfmt (BLOCKING)

Fast Rust-based linting and formatting (replaces ESLint + Prettier). Scope to new tool only:

```bash
npx oxlint src/tools/<category>/<tool-id>.js
npx oxfmt --write src/tools/<category>/<tool-id>.js
```

- **Oxlint** — 0 lint errors (warnings are OK)
- **Oxfmt** — File formatted

If either fails, fix and re-run. Do not proceed until both pass.

## Step 14 — (Optional) MSW for external APIs

If the tool calls external APIs (crypto-prices, currency-converter, weather, etc.), add MSW mocks:

```bash
npx msw init public/ --worker
```

Create `src/mocks/handlers.js`:

```js
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("https://api.example.com/endpoint", () => {
    return HttpResponse.json({/* mock response */});
  })
];
```

Why: Tests don't depend on live APIs, can test error states, work offline.

## Step 15 — Security gate (BLOCKING)

Before presenting to the user, verify:

1. **No console errors** from the tool (Step 10 confirmed this)
2. **CSP violations** — Check `list_console_messages` for any CSP block errors. A clean console = no CSP violations
3. **No raw `fetch()`** — Grep the tool file: `grep -n "fetch(" src/tools/<category>/<tool-id>.js`. If found, must use `safeFetch` instead
4. **No `eval()` / `new Function()`** — Grep: `grep -n "eval\|new Function" src/tools/<category>/<tool-id>.js`. Must be 0 matches
5. **CDN resources have SRI** — Grep: `grep -n "createElement.*script\|createElement.*link" src/tools/<category>/<tool-id>.js`. If any match, verify each has `integrity` attribute on the next 2 lines
6. **HTTPS only** — Grep: `grep -n "http://" src/tools/<category>/<tool-id>.js`. Must be 0 matches (except `http://localhost` for dev)

If any check fails, fix and re-run from Step 4. **Do not present insecure code to the user.**

## Step 16 — User testing gate (BLOCKING)

Tell the user:

> Tool is ready at `http://localhost:3000/#/tools/<tool-id>`. Please test these interactions:
>
> 1. …
> 2. …
> 3. …

Be specific about what to try — call out the primary controls, any edge cases, and any persistence behavior. **Wait for explicit approval.** Do not proceed to Step 17 if the user has not approved.

## Step 17 — Update docs (all required, all in one pass)

| File                               | Change                                                                                                                                                                 |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `toolsList.json`                   | Add or update the entry. Set `"status": "done"`.                                                                                                                       |
| `src/data/tools.json`              | Add the tool object. `id`, `name`, `category`, `description`, `icon`, `keywords`, `accept`, `maxSizeMB`, `status: "done"`.                                             |
| `README.md`                        | Increment total tool count. Add a row to the matching category table if a new tool. Update the Phase section only if the phase gains its first completion or finishes. |
| `PROJECT-PLAN.md`                  | Update phase progress, tool count.                                                                                                                                     |
| `memory/tool-building-progress.md` | Tick the `[ ]` to `[x]` for the tool.                                                                                                                                  |

## Step 18 — Update main-page counts (all required)

These MUST reflect the new total — the tool count appears in 4 user-facing files and must agree:

- `src/pages/home.js` — hero headline (e.g. "280+ tools"), search placeholder ("Search 280 tools"), meta description, popular tools list (only if the new tool should be featured).
- `src/data/categories.json` — bump the `toolCount` for the matching category. Audit other categories if you suspect drift.
- `src/components/footer.js` — tagline count (e.g. "280 free online tools").

After editing, run this grep to verify consistency:

```bash
rg -n "(\\d+)\\+?\\s*(free\\s*)?(online\\s*)?tools" README.md src/pages/home.js src/components/footer.js PROJECT-PLAN.md
```

Every number should be the same.

## Step 19 — Commit (only after user approval)

Stage only the files you touched. Write a descriptive commit message:

```
Add <tool-name> tool (<category>)

- Implements <one-line summary>
- Uses <library if any>
- Adds unit + Playwright tests
- Updates registry, docs, and counts
```

**Never commit secrets, never force-push, never amend a pushed commit.**

## Red lines

- Do not commit before Step 16 (user) approval. Steps 10-15 are automated checks; only the user's explicit approval clears the gate to Steps 17-19.
- Do not edit `package.json` to add a dependency without asking — many Phase 25 tools can be built with browser built-ins only (see the AGENTS.md / README convention).
- Do not add a tool to `src/data/tools.json` without also adding it to `toolsList.json` and vice versa.
- Do not add comments to the tool source (AGENTS.md: "DO NOT ADD ANY COMMENTS unless asked").
- Do not modify `opencode.json`, model config, or the existing skill files.
- **Never use raw `fetch()` for external APIs** — always use `safeFetch()` from `src/utils/safe-fetch.js`.
- **Never use `eval()` or `new Function()`** — use safe alternatives.
- **Never skip SRI on CDN scripts/stylesheets** — compute the hash via browser, add `integrity` + `crossOrigin`.
- **Never embed API keys** — this is a 100% client-side app with no backend.
- **Never use `http://`** for external resources — HTTPS only.
