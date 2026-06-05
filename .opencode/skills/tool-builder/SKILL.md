---
name: tool-builder
description: Use ONLY when the user asks to build, create, scaffold, or add a new tool to the xtoolbox project. Triggers on phrases like "build a new tool", "add tool", "create tool", "scaffold tool", or naming a specific tool from memory/tool-building-progress.md. Enforces the 10-step tool-building convention from AGENTS.md, including file scaffolding, test templates, doc sync, count propagation, self-test gate, and the user-approval gate.
---

# Tool Builder

End-to-end workflow for adding a new tool to the xtoolbox project. Follows the 10-step convention in `AGENTS.md` strictly. **Never skip steps. Never commit before user approval.**

## When to use

- User says "build / add / create / scaffold a tool"
- User names a specific tool from `memory/tool-building-progress.md` (Phase 25 planned list)
- User asks to "fill a gap" or "implement a missing tool"

If the user just wants to fix or modify an existing tool, do not use this skill — edit in place.

## Step 0 — Confirm the tool

Before any work:

1. Read `memory/tool-building-progress.md` to see what's planned.
2. Read the entry for the target tool (file path, category, library, rationale).
3. Ask the user only if the category, file path, or library is unclear. Otherwise proceed.

## Step 1 — Create the tool file

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

## Step 2 — Unit test

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

## Step 3 — Playwright test

Path: `tests/<tool-id>.spec.js`

```js
import { test, expect } from '@playwright/test';

test('tool-id loads and runs', async ({ page }) => {
  await page.goto('/#/tools/tool-id');
  await expect(page.locator('h1')).toContainText('Tool Name');
});
```

Add deeper interaction only if the tool has a non-trivial happy path.

## Step 4 — Verify build

```bash
npm run build
```

Must exit 0. If it fails, fix the tool file before proceeding. Common causes: bad import path, missing export, syntax error, missing dependency in `package.json`.

## Step 5 — Verify unit tests

```bash
npm run test:unit
```

All tests must pass. The Playwright suite (`npm run test`) is **not** required here — that runs in CI.

## Step 6 — Self-test with Chrome DevTools (BLOCKING)

Before asking the user, smoke-test the tool yourself with the Chrome DevTools MCP. Start the dev server if it is not already running:

```bash
npm run dev
```

Then verify all of the following:

- **Navigate** to `http://localhost:3000/#/tools/<tool-id>`.
- **Snapshot** the page — confirm the UI renders (tool header, primary controls visible) with no broken layouts.
- **Console** — `list_console_messages` must show 0 errors. Warnings about pre-existing a11y issues on other tools are fine; a fresh error from your new tool is not.
- **Network** — `list_network_requests` must show 0 4xx/5xx. The new tool's `.js` module must return 200, and every helper it imports (`../../components/...`, `../../utils/...`) must resolve. If a 4xx appears, the Vite module cache is likely stale: stop the dev server, `rm -rf node_modules/.vite`, restart, and re-test.
- **Interaction** — click the primary action button and verify the expected output/UI change happens. If the tool is purely input-driven (e.g. paste XML and click Format), simulate that input and assert the result appears.

If any check fails, fix the code and re-run from Step 1. **Do not bother the user with a broken tool** — the user gate is for them to validate the polished version, not to find obvious bugs.

## Step 7 — User testing gate (BLOCKING)

Tell the user:

> Tool is ready at `http://localhost:3000/#/tools/<tool-id>`. Please test these interactions:
>
> 1. …
> 2. …
> 3. …

Be specific about what to try — call out the primary controls, any edge cases, and any persistence behavior. **Wait for explicit approval.** Do not proceed to Step 8 if the user has not approved.

## Step 8 — Update docs (all required, all in one pass)

| File | Change |
|------|--------|
| `toolsList.json` | Add or update the entry. Set `"status": "done"`. |
| `src/data/tools.json` | Add the tool object. `id`, `name`, `category`, `description`, `icon`, `keywords`, `accept`, `maxSizeMB`, `status: "done"`. |
| `README.md` | Increment total tool count. Add a row to the matching category table if a new tool. Update the Phase section only if the phase gains its first completion or finishes. |
| `PROJECT-PLAN.md` | Bump the "Tasks Done" total by 1. If the phase finished, mark it ✅. |
| `memory/tool-building-progress.md` | Tick the `[ ]` to `[x]` for the tool. |

## Step 9 — Update main-page counts (all required)

These MUST reflect the new total — the tool count appears in 4 user-facing files and must agree:

- `src/pages/home.js` — hero headline (e.g. "280+ tools"), search placeholder ("Search 280 tools"), meta description, popular tools list (only if the new tool should be featured).
- `src/data/categories.json` — bump the `toolCount` for the matching category. Audit other categories if you suspect drift.
- `src/components/footer.js` — tagline count (e.g. "280 free online tools").

After editing, run this grep to verify consistency:

```bash
rg -n "(\\d+)\\+?\\s*(free\\s*)?(online\\s*)?tools" README.md src/pages/home.js src/components/footer.js PROJECT-PLAN.md
```

Every number should be the same.

## Step 10 — Commit (only after user approval)

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

- Do not commit before Step 7 (user) approval. Step 6 is your own self-test; only the user's explicit approval clears the gate to Steps 8-10.
- Do not edit `package.json` to add a dependency without asking — many Phase 25 tools can be built with browser built-ins only (see the AGENTS.md / README convention).
- Do not add a tool to `src/data/tools.json` without also adding it to `toolsList.json` and vice versa.
- Do not add comments to the tool source (AGENTS.md: "DO NOT ADD ANY COMMENTS unless asked").
- Do not modify `opencode.json`, model config, or the existing skill files.
