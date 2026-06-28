---
name: tool-builder
description: Use ONLY when the user asks to build, create, scaffold, or add a new tool to the xtoolbox project. Triggers on phrases like "build a new tool", "add tool", "create tool", "scaffold tool", or naming a specific tool from memory/tool-building-progress.md. Enforces the 17-step tool-building convention from AGENTS.md, including duplicate check, webfetch research, file scaffolding, test templates, doc sync, count propagation, self-test gate, and the user-approval gate.
---

# Tool Builder

End-to-end workflow for adding a new tool to the xtoolbox project. Follows the 17-step convention in `AGENTS.md` strictly. **Never skip steps. Never commit before user approval.**

## When to use

- User says "build / add / create / scaffold a tool"
- User names a specific tool from `memory/tool-building-progress.md` (Phase 25 planned list)
- User asks to "fill a gap" or "implement a missing tool"

## Modifying an existing tool

For fixes, updates, or enhancements to an existing tool, follow Steps 4-14:
1. Edit the tool file
2. (Skip unit test if no new logic)
3. (Skip Playwright test if trivial)
4. Verify build
5. Verify unit tests
6. Run Chrome DevTools checks (including Lighthouse a11y) — same as new tools
7. Run SPA performance regression check — same as new tools
8. Run Fallow
9. Present for user approval

Skip docs/count propagation only when the tool is already in the registry and the change doesn't add a new tool.

## Step 1 — Duplicate Check (BLOCKING — do this FIRST)

Before writing ANY code, verify the tool doesn't already exist (even under a different name):

1. **Search `src/data/tools.json`** — by name, category, and keywords for functional overlaps
2. **Search `src/tools/` directory** — grep for related terms (e.g. for "compress" check all compress tools)
3. **Check `toolsList.json`** — for registered tools
4. **Decision:**
   - **Same function, same name** → STOP. Tool already exists.
   - **Same function, different name** → STOP. Tell user, suggest extending/renaming the existing tool instead.
   - **Partial overlap** → Note the overlap, propose how to differentiate, get user confirmation before proceeding.
   - **No overlap** → Proceed to Step 2.

## Step 2 — Research & Confirm (BLOCKING)

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
   
   Wait for user confirmation before proceeding to Step 3.

## Step 3 — Webfetch Best Practices (BLOCKING)

**MUST call the `webfetch` tool.** Do not skip this step. Do not rely on memory or assumptions. Fetch authoritative documentation to ensure the implementation follows official patterns, not guesswork.

**Required fetches (at minimum):**
1. Official library/API docs for the approach chosen in Step 2
2. One reference implementation or tutorial showing the recommended usage pattern

**Optional fetches (if relevant):**
- Open-source reference implementations on GitHub
- MDN Web Docs for browser API usage

**How to structure the fetch:**
1. Identify the primary library/API chosen in Step 2
2. Call `webfetch` on its official "getting started" or "loading" documentation page
3. Note any gotchas, anti-patterns, or browser compatibility issues

**Output:** Document findings in your response. These become the implementation reference for Step 4. If the fetched docs reveal a better approach than Step 2 decided, re-confirm with the user before proceeding.

**Gate:** Do not proceed to Step 4 until you have called `webfetch` at least once and documented the results.

## Step 4 — Create the tool file

Path: `src/tools/<category>/<tool-id>.js`

The file MUST export both `toolConfig` and `render`. Use this skeleton (no comments in code per AGENTS.md):

```js
import { downloadBlob } from '../../utils/file.js';

export const toolConfig = {
  id: 'tool-id',
  name: 'Tool Name',
  category: 'category',
  description: 'One-line description for cards and meta tags.',
  icon: '🛠️',
  keywords: ['keyword1', 'keyword2'],
  accept: '',
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
- Reuse `src/utils/dom.js` (`createElement`, `$`, `$$`) and `src/utils/format.js` when applicable.
- For PDF tools, use local worker assets via Vite `?url` (see `src/tools/pdf/pdf-utils.js` for the pattern).
- Import styles from `../../styles/components.css` only if a needed class is missing there — otherwise rely on the shared system.

## Step 5 — Unit test

Path: `src/__tests__/<tool-id>.test.js`

Use Vitest. Test pure logic only (not DOM rendering unless trivial). Example:

```js
import { describe, it, expect } from 'vitest';
// import the pure functions your tool exports if you split them out

describe('tool-id', () => {
  it('does the thing', () => {
    expect(/* ... */).toBe(/* ... */);
  });
});
```

If the tool is heavily DOM-bound, export the pure helpers and test those. Keep tests fast and offline.

## Step 6 — Playwright test

Path: `tests/<tool-id>.spec.js`

```js
import { test, expect } from '@playwright/test';

test('tool-id loads and runs', async ({ page }) => {
  await page.goto('/#/tools/tool-id');
  await expect(page.locator('h1')).toContainText('Tool Name');
});
```

Add deeper interaction only if the tool has a non-trivial happy path.

## Step 7 — Verify build

```bash
npm run build
```

Must exit 0. If it fails, fix the tool file before proceeding. Common causes: bad import path, missing export, syntax error, missing dependency in `package.json`.

## Step 8 — Verify unit tests

```bash
npm run test:unit
```

All tests must pass. The Playwright suite (`npm run test`) is **not** required here — that runs in CI.

## Step 9 — Self-test with Chrome DevTools (BLOCKING)

Before asking the user, smoke-test the tool yourself with the Chrome DevTools MCP. Start the dev server if it is not already running:

```bash
npm run dev
```

Then verify all of the following in order:

1. **Navigate** — Go to `http://localhost:3000/#/tools/tool-id`
2. **Snapshot** — Confirm UI renders (tool header, primary controls visible) with no broken layouts
3. **Console** — `list_console_messages` must show 0 errors. Warnings about pre-existing a11y issues on other tools are fine; a fresh error from your new tool is not
4. **Network** — `list_network_requests` must show 0 4xx/5xx. The new tool's `.js` module must return 200, and every helper it imports must resolve. If a 4xx appears, clear Vite cache: stop server, `rm -rf node_modules/.vite`, restart, re-test
5. **Lighthouse** — Run `lighthouse_audit` with a11y. Score must be >= 90. Fix any critical issues found (missing labels, low contrast, heading order). SEO/best-practice scores don't need to pass
6. **Interaction** — Click the primary action button and verify expected output. For input-driven tools, simulate input and assert result appears

If any check fails, fix the code and re-run from Step 4. **Do not bother the user with a broken tool** — the user gate is for them to validate the polished version, not to find obvious bugs.

## Step 10 — SPA performance regression check (BLOCKING)

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

**If a previous run already passed and only your tool was added:** Focus on whether the tool page itself renders fast. The other page template times should be unchanged. If a non-tool page (e.g. home, about) regressed, you may have pulled new deps into a shared chunk.

## Step 11 — Fallow static analysis (BLOCKING)

Run Fallow against the new tool's file to catch dead code and complexity issues before the user sees it:

```bash
npx fallow dead-code src/tools/<category>/<tool-id>.js
npx fallow health src/tools/<category>/<tool-id>.js
```

- **Dead code** — Fallow must report 0 unused exports in the new tool file. Every exported symbol (`toolConfig`, `render`, and any helper functions) must be consumed by the module graph. If Fallow flags something, either remove it or add a re-export/barrel.
- **Health** — Fallow must not report any file with complexity above the project threshold. If the tool file triggers a warning, refactor to reduce branching.

If either check fails, fix the code and re-run Step 11. Do not proceed to Step 12 until both pass clean.

## Step 12 — Oxlint + Oxfmt (BLOCKING)

Fast Rust-based linting and formatting (replaces ESLint + Prettier). Scope to new tool only:

```bash
npx oxlint src/tools/<category>/<tool-id>.js
npx oxfmt --write src/tools/<category>/<tool-id>.js
```

- **Oxlint** — 0 lint errors (warnings are OK)
- **Oxfmt** — File formatted

If either fails, fix and re-run. Do not proceed until both pass.

## Step 13 — (Optional) MSW for external APIs

If the tool calls external APIs (crypto-prices, currency-converter, weather, etc.), add MSW mocks:

```bash
npx msw init public/ --worker
```

Create `src/mocks/handlers.js`:

```js
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('https://api.example.com/endpoint', () => {
    return HttpResponse.json({ /* mock response */ });
  })
];
```

Why: Tests don't depend on live APIs, can test error states, work offline.

## Step 14 — User testing gate (BLOCKING)

Tell the user:

> Tool is ready at `http://localhost:3000/#/tools/<tool-id>`. Please test these interactions:
>
> 1. …
> 2. …
> 3. …

Be specific about what to try — call out the primary controls, any edge cases, and any persistence behavior. **Wait for explicit approval.** Do not proceed to Step 15 if the user has not approved.

## Step 15 — Update docs (all required, all in one pass)

| File | Change |
|------|--------|
| `toolsList.json` | Add or update the entry. Set `"status": "done"`. |
| `src/data/tools.json` | Add the tool object. `id`, `name`, `category`, `description`, `icon`, `keywords`, `accept`, `maxSizeMB`, `status: "done"`. |
| `README.md` | Increment total tool count. Add a row to the matching category table if a new tool. Update the Phase section only if the phase gains its first completion or finishes. |
| `PROJECT-PLAN.md` | Bump the "Tasks Done" total by 1. If the phase finished, mark it ✅. |
| `memory/tool-building-progress.md` | Tick the `[ ]` to `[x]` for the tool. |

## Step 16 — Update main-page counts (all required)

These MUST reflect the new total — the tool count appears in 4 user-facing files and must agree:

- `src/pages/home.js` — hero headline (e.g. "280+ tools"), search placeholder ("Search 280 tools"), meta description, popular tools list (only if the new tool should be featured).
- `src/data/categories.json` — bump the `toolCount` for the matching category. Audit other categories if you suspect drift.
- `src/components/footer.js` — tagline count (e.g. "280 free online tools").

After editing, run this grep to verify consistency:

```bash
rg -n "(\\d+)\\+?\\s*(free\\s*)?(online\\s*)?tools" README.md src/pages/home.js src/components/footer.js PROJECT-PLAN.md
```

Every number should be the same.

## Step 17 — Commit (only after user approval)

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

- Do not commit before Step 14 (user) approval. Steps 9-12 are automated checks; only the user's explicit approval clears the gate to Steps 15-17.
- Do not edit `package.json` to add a dependency without asking — many Phase 25 tools can be built with browser built-ins only (see the AGENTS.md / README convention).
- Do not add a tool to `src/data/tools.json` without also adding it to `toolsList.json` and vice versa.
- Do not add comments to the tool source (AGENTS.md: "DO NOT ADD ANY COMMENTS unless asked").
- Do not modify `opencode.json`, model config, or the existing skill files.
