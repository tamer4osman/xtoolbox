---
name: registry-sync-checker
description: Use ONLY when the user asks to verify, audit, sync, or fix the tool registry in the xtoolbox project. Triggers on phrases like "check tool counts", "verify registry", "sync tools", "audit categories", "fix tool count mismatch", or when a tool was just added/removed and consistency needs confirmation. Cross-checks toolsList.json, src/data/tools.json, src/data/categories.json, README.md, PROJECT-PLAN.md, src/pages/home.js, src/components/footer.js, and the on-disk src/tools/ tree.
---

# Registry Sync Checker

Single source of truth = `src/data/tools.json`. Every other registry, doc, and UI surface must agree with it. This skill detects drift and prescribes fixes.

## When to use

- After adding or removing a tool (the `tool-builder` skill ends by referencing this one).
- User says "check counts", "verify registry", "sync", "fix mismatch", "audit categories".
- Before a release or deploy.
- Any time README / PROJECT-PLAN / home / footer disagree.

## Files in scope

| File | Role |
|------|------|
| `src/data/tools.json` | **Authoritative runtime registry.** Every tool registered here appears in the app. |
| `toolsList.json` | External tracking. Must mirror `src/data/tools.json` by `id`. |
| `src/data/categories.json` | Per-category `toolCount`. Sum must equal tools.json length. |
| `src/tools/**/*.js` | On-disk implementations. Each `toolConfig.id` should have a matching file. |
| `README.md` | Total tool count, per-category tables, phase status. |
| `PROJECT-PLAN.md` | Total tool count, per-phase progress table. |
| `src/pages/home.js` | Hero count, search placeholder, meta description, popular tools list. |
| `src/components/footer.js` | Tagline count. |
| `memory/tool-building-progress.md` | Phase 25 checklist. |

## Step 1 — Compute ground truth

Count tools by reading `src/data/tools.json`. Use this one-liner:

```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('src/data/tools.json')).length)"
```

Build a category histogram:

```bash
node -e "const t=JSON.parse(require('fs').readFileSync('src/data/tools.json'));const h={};for(const x of t){h[x.category]=(h[x.category]||0)+1}console.log(h)"
```

## Step 2 — Cross-check each surface

Run these checks in parallel. Each is a single grep / count. **Any mismatch is a bug to fix.**

### 2a. `toolsList.json` vs `src/data/tools.json`

Both files' `id` sets must be equal (or `toolsList.json` may be a subset of "planned" entries — verify by reading both).

```bash
node -e "const a=JSON.parse(require('fs').readFileSync('src/data/tools.json')).map(t=>t.id).sort();const b=JSON.parse(require('fs').readFileSync('toolsList.json')).map(t=>t.id).sort();console.log('only in tools.json:',a.filter(x=>!b.includes(x)));console.log('only in toolsList.json:',b.filter(x=>!a.includes(x)))"
```

### 2b. `src/data/categories.json` totals

Sum of every `toolCount` should equal `src/data/tools.json` length. Each category's count should match the histogram from Step 1.

```bash
node -e "const c=JSON.parse(require('fs').readFileSync('src/data/categories.json'));console.log('sum:',c.reduce((s,x)=>s+x.toolCount,0));console.log(c.map(x=>x.id+'='+x.toolCount).join('\n'))"
```

### 2c. On-disk implementations

Each `toolConfig.id` in `src/data/tools.json` with `status: "done"` (or no status field, which means done) should have a file under `src/tools/<category>/<id>.js`. Orphaned files (no registry entry) should be flagged too.

```bash
node -e "const t=JSON.parse(require('fs').readFileSync('src/data/tools.json'));const fs=require('fs');const path=require('path');const missing=t.filter(x=>!fs.existsSync(path.join('src/tools',x.category,x.id+'.js'))).map(x=>x.id+' ['+x.category+']');console.log('registered but no file:',missing)"
```

```bash
rg -l "export const toolConfig" src/tools | node -e "const fs=require('fs');const files=require('fs').readFileSync(0,'utf8').split('\n').filter(Boolean);const t=JSON.parse(fs.readFileSync('src/data/tools.json'));const ids=new Set(t.map(x=>x.id));const orphans=files.map(f=>{const m=f.match(/src\\\/tools\\\/([^\\]+)\\\/([^.]+)\.js$/);return m?{id:m[2],cat:m[1]}:null}).filter(x=>x&&!ids.has(x.id));console.log('files with no registry entry:',orphors)"
```

### 2d. README / PROJECT-PLAN / home / footer counts

Every user-facing number must match. Common locations to grep:

```bash
rg -n "(\\d+)\\+?\\s*(free\\s*)?(online\\s*)?tools" README.md src/pages/home.js src/components/footer.js PROJECT-PLAN.md
```

Also grep for hardcoded category table rows that may have drifted:

```bash
rg -n "\\| (PDF|Image|Video|Audio|OCR|QR|Privacy|Weather|Reference|Finance|Math|Health|Text|Encoding|Visualization|CSS|Developer|Fun|Business|SEO|Productivity)" README.md
```

## Step 3 — Report findings

Produce a concise report:

```
Ground truth: N total tools (from src/data/tools.json)
  - By category: pdf=34, image=36, ...

Mismatches:
  [ ] toolsList.json: 2 ids missing (X, Y)
  [ ] categories.json: dev count is 15, expected 16
  [ ] README.md: says "280 tools", actual is 278
  [ ] home.js hero: "280+ free online tools", actual is 278
  [ ] 1 file in src/tools/ has no registry entry: src/tools/dev/sql-to-json.js
```

## Step 4 — Apply fixes

For each mismatch, edit the offending file directly. Do not touch the authoritative `src/data/tools.json` unless it is itself the source of the error (e.g. an entry has the wrong `category`).

Order of operations when a count is wrong in multiple places:

1. Fix the **source** first (registry file or on-disk file).
2. Then propagate the corrected number to categories.json, README, PROJECT-PLAN, home.js, footer.js.
3. Re-run Step 2 to confirm all checks pass.

## Step 5 — Verify clean

Re-run every check in Step 2. Output should be empty (no mismatches, no orphans). If the user wants a one-liner summary, run:

```bash
node -e "const t=JSON.parse(require('fs').readFileSync('src/data/tools.json'));const fs=require('fs');const path=require('path');const c=JSON.parse(require('fs').readFileSync('src/data/categories.json'));const total=t.length;const catSum=c.reduce((s,x)=>s+x.toolCount,0);const missing=t.filter(x=>!fs.existsSync(path.join('src/tools',x.category,x.id+'.js'))).length;const cat={};for(const x of t)cat[x.category]=(cat[x.category]||0)+1;const catMism=Object.entries(cat).filter(([k,v])=>c.find(x=>x.id===k)?.toolCount!==v);console.log('total:',total,'catSum:',catSum,'missing-files:',missing,'category-mismatches:',catMism)"
```

Expected output: `total: N catSum: N missing-files: 0 category-mismatches: []`.

## Common drift patterns to watch for

- **Phase 25 partial completion** — `tool-building-progress.md` checkbox ticked, but README / home / footer not bumped.
- **New category added** — tools present but `categories.json` not extended, so sum is wrong.
- **Tool renamed** — `tools.json` updated, `toolsList.json` forgotten.
- **Tool file moved to a different category** — `tools.json` category updated, `categories.json` totals not rebalanced.
- **Phase count in README says 332 but actual is 308 + 24 planned = 332** — when one of the planned tools ships, the "planned" line must move to "built" and the total stays the same.

## Red lines

- Do not invent counts. Always derive from `src/data/tools.json`.
- Do not modify `src/data/tools.json` to "make the numbers match" — fix the docs / UI instead.
- Do not delete a tool file to silence an orphan warning without first checking the user (orphans are usually in-progress work).
