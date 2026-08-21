---
name: tool-builder
description: Use ONLY when the user asks to build, create, scaffold, or add a new tool to the xtoolbox project. Triggers on phrases like "build a new tool", "add tool", "create tool", "scaffold tool", "next tool", or naming a specific tool id from memory/tool-building-progress.md. Enforces the 21-step convention from AGENTS.md — duplicate check, research, design grilling, security review, file scaffolding, test templates, smoke + browser checks, doc sync, count propagation, and the user-approval gate.
---

# Tool Builder

End-to-end workflow for adding a new tool to xtoolbox. Mirrors the 21-step convention in `AGENTS.md`.

**Two absolute rules:** Never skip a blocking gate. Never commit before the user approves (Step 17).

## Workflow at a Glance

| Phase            | Steps | Gate to exit phase                          |
| ---------------- | ----- | ------------------------------------------- |
| Discovery        | 0     | No functional duplicate exists              |
| Research         | 1-2   | Approach chosen + authoritative docs fetched |
| Design           | 3     | User confirms shared design understanding   |
| Implementation   | 4-7   | Tool file + unit + E2E tests written        |
| Automated checks | 8-16  | All 9 automated gates pass                  |
| Approval         | 17    | User explicitly approves                    |
| Ship             | 18-20 | Docs synced, counts propagated, committed   |

### TL;DR (repeat builders)

```
0  duplicate check → 1-2 research + docs → 3 grill design
4  scaffold (toolConfig + render + cleanup) → 5 security checklist
6-7 tests → 8 build (+size if new deps) → 9 unit tests
10 npm run smoke <id> → 11 MCP browser check (+mobile viewport)
12 perf <50ms warm → 13 fallow → 14 oxlint/oxfmt → 16 gate + scans
   self code review → 17 USER APPROVAL
18 both registries + docs → 19 counts (static files!) → 20 commit
```

First tool? Read every step below — the details prevent rework.

## Modifying an Existing Tool

For fixes or enhancements to a registered tool, run Steps 5-17 only:

1. Edit the tool file
2. Security review (Step 5) — skip checklist items with no new network/DOM/CDN surface
3. Unit tests — only for new logic
4. Playwright tests — only if behavior changed non-trivially
5. Steps 8-14 as normal (build, tests, smoke, perf, Fallow, lint)

Skip Step 18/19 entirely — the tool is already registered; no counts change.

---

## Phase 1 — Discovery

### Step 0 — Duplicate Check (BLOCKING — always first)

Before writing any code, verify the tool does not already exist, even under another name:

1. Search `src/data/tools.json` by name, category, and keywords for functional overlap
2. Search `src/tools/` for related implementations (e.g., grep all compress tools before building a compressor)
3. Check `toolsList.json` for registered entries

Decision matrix:

| Finding                        | Action                                                        |
| ------------------------------ | ------------------------------------------------------------- |
| Same function, same name       | STOP — tool exists                                            |
| Same function, different name  | STOP — propose extending or renaming the existing tool        |
| Partial overlap                | Note overlap, propose differentiation, get user confirmation  |
| No overlap                     | Proceed to Step 1                                             |

## Phase 2 — Research

### Step 1 — Research & Confirm Approach (BLOCKING)

Research the best implementation path:

1. Web search: `"how to implement [tool] in JavaScript browser"`, `"[tool] open source library JavaScript"`
2. Check existing project tools for reusable patterns and factories
3. For any candidate library/framework/API, pull current docs via `context7` — training data goes stale

Choose one path:

- Pure browser APIs (Canvas, Web Audio, FileReader, Compression Streams…)
- WASM already in the project (`@ffmpeg/ffmpeg`, `pdf-lib`, `tesseract.js`, ONNX Runtime)
- New npm dependency (check `package.json`; ask before adding)
- Pure JS implementation

Present to the user and wait for confirmation:

> - Best approach: [chosen method]
> - Libraries needed: [none / package name]
> - Potential issues: [concerns]

### Step 2 — Fetch Authoritative Docs (BLOCKING)

Do not rely on memory. Before writing code you MUST call `context7` and/or `webfetch` at least once and record findings.

Required minimum:

1. Official docs for the chosen approach — prefer `context7` (`resolve-library-id`, then `query-docs`)
2. One reference implementation or official tutorial via `webfetch`

Optional: GitHub reference repos, MDN pages for browser APIs.

Record gotchas, anti-patterns, and browser compatibility issues — these are your implementation reference for Step 4. If docs contradict the Step 1 decision, re-confirm with the user first.

## Phase 3 — Design

### Step 3 — Grill the Design (BLOCKING)

Use the `grill-me` skill to interview the user before writing any code.

Rules of engagement:

- Ask questions in batches of 3-4, multiple choice (A/B/C), each with a clearly labeled **Recommended** option and a one-line reason
- Wait for the user's answers before presenting the next batch
- Look up facts yourself (filesystem, existing tools); ask only about decisions that belong to the user
- Do not act on any decision until confirmed

Minimum question coverage:

| Area          | Ask about                                                                 |
| ------------- | ------------------------------------------------------------------------- |
| UI layout     | Upload area, options panel, preview, download — closest existing layout?  |
| Library       | Which WASM/npm/browser API? Already in `package.json`?                   |
| Factory       | Reuse an existing factory (`image-tool-factory`, `video-tool-factory`, `codec-factory`, `lookup-tool-factory`, `merge-tool-factory`, `pdf-options-tool-factory`) or bespoke scaffold? |
| Edge cases    | Empty input, huge files, unsupported formats, browser support             |
| Errors        | try/catch boundaries, user-facing messages, graceful degradation          |
| Tool-specific | Any non-obvious UX or algorithm choices                                   |

Question format:

```
**Question N of M: [Topic]**

[Context sentence]

- **A) [Option]** — [description]
- **B) [Option]** — [description]

Recommended: **A** — [one-line reason]
```

## Phase 4 — Implementation

### Step 4 — Create the Tool File

Path: `src/tools/<category>/<tool-id>.js`. Must export both `toolConfig` and `render`. Skeleton (no comments — AGENTS.md forbids them):

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

export function cleanup() {
  worker?.terminate();
  URL.revokeObjectURL(objectUrl);
}
```

Export `cleanup` only if `render` created resources (workers, listeners, blob URLs, intervals). The router calls it on navigation — guard against double invocation and make it safe to run before processing ever started.

Conventions:

- **Study exemplars, not just neighbors** — `src/tools/image/jpg-to-webp.js` (factory-based image tool), `src/tools/video/video-to-gif.js` (ffmpeg.wasm lifecycle), `src/tools/audio/noise-remover.js` (Web Audio + heavy processing), `src/tools/pdf/pdf-utils.js` (worker via Vite `?url`)
- Read 2-3 neighboring tools in the same category first; match their patterns and DOM helpers
- Reuse `src/utils/file.js` (`formatFileSize`, `downloadBlob`, `readFileAsArrayBuffer`, `readFileAsText`)
- Reuse `src/utils/escape-html.js` (`escapeHtml`) and `src/utils/clipboard.js` (`copyToClipboard`)
- **Enforce `toolConfig.maxSizeMB`** — validate uploaded file size against it before any processing; show a friendly rejection naming the limit. Never rely on the UI alone
- PDF tools: local workers via Vite `?url` imports — see `src/tools/pdf/pdf-utils.js`
- Only import `../../styles/components.css` if a needed class is missing; otherwise rely on the shared system

#### WASM & Resource Lifecycle (ffmpeg.wasm, tesseract.js, ONNX)

Heavy WASM cores are 30 MB+ (ffmpeg) and language data 5-15 MB (tesseract traineddata). Rules:

- **Lazy-load on user action** — never at module top level or page load. Fetch the core only when the user starts processing; show a progress indicator during download
- **Worker lifecycle: create once → reuse → terminate** — creating a worker per job wastes seconds of setup and risks crashes from parallel instances. Terminate in `module.cleanup()` (router calls it on navigation) or in a `finally` block around processing
- **Never spawn unbounded workers** — cap concurrency at 2-3 (mobile Safari kills tabs ≈400 MB); serialize jobs through one worker or a small pool
- **ffmpeg virtual FS leaks** — call `ffmpeg.deleteFile(name)` after every `readFile`, or `terminate()` on navigation; the FS persists between `exec()` calls
- **Blob URLs** — pair every `URL.createObjectURL()` with `URL.revokeObjectURL()` after use
- **Event listeners** — remove progress/status handlers (`ffmpeg.off(...)`, `removeEventListener`) on completion and cleanup
- **Cross-origin isolation** — multi-thread cores need COOP/COEP headers; feature-detect `window.crossOriginIsolated === true` and fall back to the single-thread core otherwise
- **Large inputs** — warn above ~500 MB (video) and stream/segment where possible; WASM linear memory only grows, never shrinks

### Step 5 — Security Review (BLOCKING)

Run this checklist before writing tests.

**Network**

- [ ] No raw `fetch()` — external calls use `safeFetch` from `src/utils/safe-fetch.js`
- [ ] HTTPS only — zero `http://` URLs
- [ ] No API keys anywhere

**DOM**

- [ ] No `innerHTML` with unescaped user input — use `escapeHtml()`
- [ ] No `eval()` / `new Function()` / `document.write()`

**CDN resources**

- [ ] Every injected `<script>`/`<link>` has SRI `integrity` + `crossOrigin="anonymous"`
- [ ] New CDN domains added to CSP in `vite.config.js` AND `_headers`

**Forbidden patterns**

- [ ] No `document.cookie`
- [ ] No `localStorage.setItem` with sensitive data
- [ ] No `window.open` without user gesture
- [ ] No dynamic `import()` from untrusted CDNs
- [ ] No CDN fonts without a `font-src` CSP entry

Any failure = fix now. Do not write tests for insecure code.

### Step 6 — Unit Tests

Path: `src/__tests__/<tool-id>.test.js`. Vitest; test pure logic, not DOM rendering.

```js
import { describe, it, expect } from "vitest";

describe("tool-id", () => {
  it("does the thing", () => {
    expect(/* ... */).toBe(/* ... */);
  });
});
```

If logic lives inside DOM code, export pure helpers and test those. Tests must be fast and offline.

### Step 7 — Playwright Test

Path: `tests/<tool-id>.spec.js`. Minimum viable happy path:

```js
import { test, expect } from "@playwright/test";

test("tool-id loads and runs", async ({ page }) => {
  await page.goto("/#/tools/tool-id");
  await expect(page.locator("h1")).toContainText("Tool Name");
});
```

Add deeper interaction tests only for non-trivial flows.

**Accessibility scan** — if `@axe-core/playwright` is installed (ask before adding the dependency), add an axe scan scoped to the tool container and assert zero critical/serious violations:

```js
import AxeBuilder from "@axe-core/playwright";

test("tool-id has no a11y violations", async ({ page }) => {
  await page.goto("/#/tools/tool-id");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .include("#tool-container")
    .analyze();
  expect(results.violations.filter(v => ["critical", "serious"].includes(v.impact))).toEqual([]);
});
```

Automated scans catch roughly 30% of WCAG criteria — pair with the manual Lighthouse check in Step 11, not replace it.

## Phase 5 — Automated Checks

All steps in this phase are BLOCKING. Fix failures and re-run; never carry a red gate forward.

**Parallelization:** Steps 8-9 (build+unit) must precede 10-11 (browser). Steps 12-14 are independent of each other and of the browser checks — run them concurrently while smoke/MCP proceeds.

**Failure taxonomy** — most common failures and their fixes:

| Gate | Symptom | Fix |
| ---- | ------- | --- |
| 8 build | Bad import path / missing export | Fix module graph; check `package.json` deps |
| 10 smoke | Tool `.js` module 404s | Stale Vite cache — delete `node_modules/.vite`, restart dev server |
| 10 smoke | Console errors on load | Usually unguarded browser API or missing DOM element — check render order |
| 11 MCP | CSP violation in console | New CDN domain missing from `vite.config.js` + `_headers` |
| 12 perf | Warm nav >50ms | Static WASM/JSON import in tool chunk — lazy-load it |
| 13 fallow | Unused export flagged | Remove it or consume it; no barrel re-exports for dead code |
| 16 gate | `http://` match | Swap to HTTPS; localhost exempt only |

### Step 8 — Build

```bash
npm run build
```

Must exit 0. Common failures: bad import path, missing export, syntax error, missing dependency.

**Bundle budget (conditional):** if the tool added a new npm dependency, also run:

```bash
npm run size
```

size-limit must pass. On failure, `npx size-limit --why` shows the offending dependency — consider dynamic `import()` so the dep lands in the tool's lazy chunk instead of a shared one.

### Step 9 — Unit Tests

```bash
npm run test:unit
```

All must pass. The full Playwright suite (`npm run test`) runs in CI, not here.

### Step 10 — Smoke Test (BLOCKING)

Start the dev server if not running (`npm run dev`), then:

```bash
npm run smoke <tool-id>
```

`scripts/smoke-test-tool.mjs` launches headless Chrome and verifies all seven checks:

1. **Load** — `#tool-container` renders (no infinite spinner)
2. **Header** — `.tool-header h1` matches the `tools.json` name
3. **Primary control** — ≥1 `input`/`button`/`textarea`/`select` inside `#tool-container`
4. **No error state** — no `.error-state`/`.error-page` element
5. **0 console errors** (third-party ad noise filtered)
6. **0 uncaught page errors**
7. **0 failed requests** — the tool `.js` module and every import return 200

Pass = exit code 0. On exit 1, fix and re-run. If the tool module 404s, the Vite cache is stale: stop server, delete `node_modules/.vite`, restart, re-test.

Never present a broken tool to the user — the Step 17 gate is for validating polish, not finding obvious bugs.

### Step 11 — Chrome DevTools MCP Page Check (BLOCKING)

With Chrome DevTools MCP connected:

1. `navigate_page` → `http://localhost:3000/#/tools/<tool-id>`
2. `list_console_messages` — filter errors/warnings; fix any tool-related ones
3. `list_network_requests` — tool module + all imports must be 200; no 4xx/5xx
4. `take_snapshot` — confirm correct render
5. **Mobile spot-check** — resize viewport to ~390×844 (or run `npm run test:mobile -- tests/<tool-id>.spec.js`) and confirm the layout doesn't break; most tools are consumer-facing and mobile-first usage is common

Optional Lighthouse a11y audit (score ≥ 90 required if run): only when the tool adds new interactive controls. Skip otherwise. For a deeper WCAG-oriented audit, use the project's `accessibility-audit` skill (`.opencode/skills/accessibility-audit`).

**MiMo V2.5 limitation:** Chrome DevTools MCP fails silently under MiMo V2.5 (single-round tool calls, strict schemas). Switch to MiniMax M3 Free (`opencode-zen/minimax-m3-free`) or Blackbox AI MiniMax for this step. Xiaomi API issue, not an OpenCode bug.

### Step 12 — SPA Performance Regression (BLOCKING)

Dev server running, then:

```bash
node scripts/measure-spa-performance.mjs
```

Navigates all 8 page templates twice (cold + warm). Warm navigation must stay **under 50ms** per route. Tool pages are represented by `#/tools/jpg-to-webp` and `#/tools/json-formatter` samples.

On failure:

- Reduce static imports pulled into the tool chunk
- Heavy WASM cores (ffmpeg ≈31 MB, tesseract core ≈2 MB + 5-15 MB traineddata) must be **lazy-loaded on user action** — a top-level `import` of them is the most common cause of this gate failing
- Move synchronous DOM work off the critical path (`queueMicrotask`, lazy render)
- Dynamic-import large JSON (tools.json ≈ 50 kB)

### Step 13 — Fallow Static Analysis (BLOCKING)

```bash
npx fallow dead-code --changed-since=HEAD~1
npx fallow dupes --changed-since=HEAD~1
npx fallow health --format compact
```

- Dead code: 0 unused exports in the new file
- Duplication ≤ 8%
- Health: no new CRAP > 200 functions

Fix or refactor until clean.

### Step 14 — Oxlint + Oxfmt (BLOCKING)

```bash
npx oxlint src/tools/<category>/<tool-id>.js
npx oxfmt --write src/tools/<category>/<tool-id>.js
```

0 lint errors (warnings OK); file formatted.

### Step 15 — MSW Mocks (optional)

Only for tools calling external APIs (weather, crypto-prices, currency-converter…):

```bash
npx msw init public/ --worker
```

Create `src/mocks/handlers.js`:

```js
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("https://api.example.com/endpoint", () =>
    HttpResponse.json({ /* mock */ })
  )
];
```

Payoff: offline tests, error-state coverage, no live-API flakiness.

### Step 16 — Final Security Gate (BLOCKING)

Re-verify on the finished file (use the Grep tool or PowerShell `Select-String` — raw `grep`/`rg` may not exist on Windows):

1. Console clean (confirmed in Steps 10-11) ⇒ no CSP violations
2. `fetch(` — 0 matches outside `safeFetch` usage
3. `eval(` / `new Function(` — 0 matches
4. Injected script/link elements — each followed by `integrity` within 2 lines
5. `http://` — 0 matches except localhost

**Automated scans**

- **Dependency audit** (only if the tool added a new npm dependency):

```bash
npm audit --omit=dev
```

Must report 0 high/critical vulnerabilities. On failure, switch to an alternative package or get explicit user sign-off before proceeding.

- **Secret scan** on the tool file and every other changed file — all patterns must return 0 matches:

```text
sk-[a-zA-Z0-9]{20,}                                        OpenAI/Stripe-style keys
AKIA[0-9A-Z]{16}                                           AWS access keys
ghp_[A-Za-z0-9]{36}  |  github_pat_[A-Za-z0-9_]{40,}       GitHub tokens
-----BEGIN [A-Z ]*PRIVATE KEY-----                         Private key blocks
(?i)(api[_-]?key|secret|token|password)\s*[:=]\s*["'][^"']{8,}["']   Hardcoded credentials
```

Failure ⇒ fix, restart from Step 8.

## Self Code Review

Run after all Phase 5 gates pass, **before Step 17**. Automated checks catch mechanical failures; this catches the design flaws they cannot see. Passing tests is not permission to skip it.

**Process:**

1. Run `git diff` and re-read every changed line as if reviewing a stranger's PR — assume it contains bugs and hunt for them
2. If a `code-reviewer` subagent is available, dispatch it on the diff in parallel with your own review; treat its findings like gate failures

**Review checklist:**

| Concern      | Question                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------- |
| Spec fidelity | Implements exactly what was agreed in Step 3 — no more, no less? Any scope creep?             |
| Correctness  | Walk happy path AND failure paths: empty input, max-size file, malformed data, missing browser API |
| Simplicity   | Any abstraction used once? Any function doing three jobs? Simplify                             |
| Duplication  | Could an existing factory/utility replace new code?                                            |
| Conventions  | Naming, structure, error handling consistent with neighboring tools in the category?           |
| Residue      | `console.log`, commented-out code, TODOs, unused imports/variables — all removed               |
| Constants    | Magic numbers extracted to named constants                                                     |
| Immutability | No input mutation; new objects over in-place edits                                             |

**Adversarial pass** — answer these explicitly before proceeding:

- What input breaks this tool?
- What happens on double-click or rapid re-run while processing?
- What leaks (memory, listeners, blob URLs, workers)?
- What does the user see when everything fails — is the error message actionable?

Fix anything found, then re-run the affected gates (Steps 8-16) before presenting.

## Phase 6 — Approval

### Step 17 — User Testing Gate (BLOCKING)

Tell the user:

> Tool ready at `http://localhost:3000/#/tools/<tool-id>`. Please test:
> 1. …
> 2. …
> 3. …

List specific interactions: primary controls, edge cases, persistence. Then WAIT. No approval = no Step 18.

## Phase 7 — Ship

### Step 18 — Update Docs (one pass, no skips)

| File                               | Change                                                                                              |
| ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| `src/data/tools.json`              | Add tool object: `id`, `name`, `category`, `description`, `icon`, `keywords`, `accept`, `maxSizeMB`, `status: "done"` |
| `toolsList.json`                   | Add matching entry with `"status": "done"`                                                          |
| `README.md`                        | Bump total count; add row to the category table; update phase status only if a phase milestone hit   |
| `PROJECT-PLAN.md`                  | Update total count and phase progress                                                               |
| `memory/tool-building-progress.md` | Tick `[ ]` → `[x]` for this tool                                                                    |

### Step 19 — Propagate Counts

Count surfaces split into two classes — know which is which:

**Dynamic (no edit needed)** — derive from `availableTools` at runtime:

- `src/pages/home.js` (meta description, search placeholder)
- `src/components/footer.js` (tagline)
- `src/pages/about.js` (meta + body)

Verify they contain no hardcoded totals (should find nothing):

```
pattern: \b\d{3}\+?\s+(free\s+)?(online\s+)?tools\b  in src/pages/*.js, src/components/footer.js
```

**Static (must edit)**:

| File             | Location                                  |
| ---------------- | ----------------------------------------- |
| `src/data/categories.json` | `toolCount` of the tool's category      |
| `index.html`     | meta description AND og:description       |
| `manifest.json`  | `description`                             |
| `package.json`   | `description`                             |

Cross-platform verify (works in PowerShell — no `rg` needed):

```bash
node -e "const fs=require('fs');const t=JSON.parse(fs.readFileSync('src/data/tools.json')).length;const c=JSON.parse(fs.readFileSync('src/data/categories.json'));console.log('registry:',t,'catSum:',c.reduce((s,x)=>s+x.toolCount,0));for(const f of['index.html','manifest.json','package.json','README.md']){const m=(fs.readFileSync(f,'utf8').match(/\d+\+?\s*(free\s+)?(online\s+)?tools/g)||[]).join(' | ');console.log(f,m||'(none)')}"
```

Every printed number must equal the registry total. Finish with the **registry-sync-checker** skill's one-liner for the full audit (ids, files, categories).

### Step 20 — Commit (only after Step 17 approval)

Stage only touched files. Conventional commit per AGENTS.md:

```
feat(<tool-id>): add <Tool Name> (<category>)

- Implements <one-line summary>
- Uses <library / API>
- Adds unit + Playwright tests
- Syncs registry, docs, and counts
```

Never commit secrets. Never force-push. Never amend a pushed commit.

---

## Abort & Rollback

The forward path assumes every gate is passable. When it isn't — user rejects at Step 17 with an unfixable concern, a dependency turns out unusable, scope collapses — abort cleanly instead of shipping a half-state:

**If the user rejects but the fix is clear:** treat it as gate failure — fix, re-run affected gates (Steps 8-16 + self review), re-present.

**If aborting:**

1. Remove the entry from `src/data/tools.json` AND `toolsList.json` (both or neither)
2. Restore the category `toolCount` in `src/data/categories.json`
3. Delete the tool file, unit test, and Playwright spec
4. Revert count edits in `README.md`, `PROJECT-PLAN.md`, `index.html`, `manifest.json`, `package.json`
5. Run the registry-sync-checker one-liner — must report clean totals and 0 missing/orphaned files
6. Report to the user exactly what was built, why it was abandoned, and what state the repo is in

Never leave a half-registered tool: registry entries without files, files without entries, or counts that disagree. An honest "aborted, repo restored" beats a broken build.

## Definition of Done

Before declaring the tool complete, ALL boxes ticked:

- [ ] Duplicate check passed (Step 0)
- [ ] Approach confirmed by user + docs fetched (Steps 1-2)
- [ ] Design grilled and agreed (Step 3)
- [ ] Tool file follows skeleton, exports `toolConfig` + `render`, zero comments (Step 4)
- [ ] Security review + final gate clean, incl. dependency audit and secret scan (Steps 5, 16)
- [ ] Unit + Playwright tests written and green (Steps 6-9)
- [ ] Smoke test exit 0 (Step 10)
- [ ] Browser check clean via MCP (Step 11)
- [ ] Perf warm <50ms (Step 12)
- [ ] Fallow + oxlint + oxfmt clean (Steps 13-14)
- [ ] Self code review completed — checklist + adversarial pass clean
- [ ] WASM resources cleaned up: workers terminated, `deleteFile` called, blob URLs revoked, listeners removed (Step 4 lifecycle rules)
- [ ] Bundle budget passed if new deps added (Step 8)
- [ ] User approved (Step 17)
- [ ] Both registries updated identically (Step 18)
- [ ] Static counts bumped; dynamic surfaces verified (Step 19)
- [ ] Committed with conventional message (Step 20)

## Red Lines

- Do not commit before Step 17 approval — Steps 10-16 are automated; only explicit user approval opens Steps 18-20
- Do not add dependencies to `package.json` without asking
- Do not touch one registry without the other — `src/data/tools.json` and `toolsList.json` move together
- Do not add comments to tool source
- Do not modify `opencode.json`, model config, or skill files during a build (user-requested skill maintenance is the only exception)
- Never raw `fetch()` for external APIs — `safeFetch()` only
- Never `eval()` / `new Function()`
- Never skip SRI on CDN assets
- Never embed API keys — 100% client-side app, no backend
- Never hardcode secrets, tokens, passwords, or private keys anywhere in source — the Step 16 secret scan must stay at 0 matches
- Never use `http://` for external resources — HTTPS only
- Never leave WASM resources dangling — every worker created must be terminated in `module.cleanup()`, every ffmpeg virtual file deleted after read, every blob URL revoked. Leaks compound across SPA navigation
- Never import heavy WASM cores statically — lazy-load on user action with progress UI
