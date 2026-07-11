# chmod-calculator — Design Spec

**Date:** 2026-06-04
**Phase:** 25 (Most Wanted)
**Category:** dev
**Status:** Approved by user, ready for implementation plan

## Goal

Ship a bidirectional Unix chmod calculator as the next Phase 25 tool. Pure client-side, zero new dependencies, matches the scope of existing dev tools (`subnet-calculator`, `url-parser`).

## Scope (Option B — Standard)

Bidirectional checkbox grid ↔ octal input ↔ symbolic display, with 4-digit special bit support (setuid, setgid, sticky), a `chmod` command line with copy, and preset chips for common modes.

## Out of scope (deferred to follow-up)

- Symbolic-mode parser (`u+x`, `g-w`, `a=r` text input).
- Recursive `-R` UI hint.
- `--reference=file` style copy.
- Explainer panel describing each bit.

## API — pure functions exported from the tool module

All four functions are pure, deterministic, throw nothing, return `null` on bad input.

```js
export function chmodToOctal(perms);
// perms: {
//   owner:   { r: bool, w: bool, x: bool },
//   group:   { r: bool, w: bool, x: bool },
//   other:   { r: bool, w: bool, x: bool },
//   special: { setuid: bool, setgid: bool, sticky: bool }
// }
// returns: string, e.g. "755" or "4755" (4-digit only when a special bit is set)

export function octalToChmod(octal);
// octal: string "755" | "0755" | "4755"
// returns: perms object as above, or null if invalid

export function chmodToSymbolic(perms);
// returns: 10-char string, e.g. "-rwxr-xr-x"
//   setuid sets owner.x slot to 's' (capital 'S' if x bit is off)
//   setgid sets group.x slot to 's' / 'S'
//   sticky sets other.x slot to 't' / 'T'

export function symbolicToChmod(symbolic);
// symbolic: "-rwxr-xr-x" (10 chars) or "rwxr-xr-x" (9 chars)
// returns: perms object or null
//   Used internally for round-trip testing; not user-facing in Option B.
```

## UI layout

```
┌──────────────────────────────────────────────┐
│  Octal:  [ 755 ]   Symbolic:  -rwxr-xr-x     │
├──────────────────────────────────────────────┤
│           │ Read │ Write │ Execute │         │
│  Owner    │  ☑   │  ☑    │   ☑     │         │
│  Group    │  ☑   │  ☐    │   ☑     │         │
│  Other    │  ☑   │  ☐    │   ☑     │         │
├──────────────────────────────────────────────┤
│  Special: ☐ setuid  ☐ setgid  ☐ sticky       │
├──────────────────────────────────────────────┤
│  Command: chmod 755 myfile     [Copy]        │
├──────────────────────────────────────────────┤
│  Presets: [644] [755] [600] [700] [777] [444]│
└──────────────────────────────────────────────┘
```

### Interactions

- Single source of truth: a `perms` object held in a closure inside `render()`.
- **Checkbox / special-bit / preset chip** → updates `perms` immediately, re-renders octal input value, symbolic display, and command line.
- **Octal input** → commits on `Enter` or `blur` only (not on every keystroke, matching `subnet-calculator` and `url-parser` patterns). On commit it parses, updates `perms`, and re-renders the rest.
- **Empty octal input on commit** → treated as `000`. Checkboxes all clear, symbolic shows `----------`, command shows `chmod 000 myfile`.
- Default state on load: octal `755`, symbolic `-rwxr-xr-x` — users see a working tool immediately.
- Preset chips are the simplest path: they set the octal and trigger the same commit pipeline.
- Copy button writes the full command line (e.g., `chmod 755 myfile`) to clipboard via `navigator.clipboard.writeText`.

### Styling

Reuses existing classes and tokens. No new CSS:

- `.tool-layout`, `.form-group`, `.text-input`, `.btn`, `.btn-primary`, `.btn-sm`
- `var(--space-*)`, `var(--color-surface)`, `var(--color-border)`, `var(--color-text-muted)`, `var(--color-danger)`, `var(--radius-md)`

## toolConfig

The entry already exists in `tools.json` and `toolsList.json` with `status: "planned"` and a minimal stub. Keep the existing `id` and `icon` (🔑) to avoid churn. The tool file's `toolConfig` will be the canonical source for `steps` and `faqs`; the registry entries will be updated to use the improved `description` and full `keywords` list.

```js
export const toolConfig = {
  id: "chmod-calculator",
  name: "Chmod Calculator",
  category: "dev",
  description:
    "Convert Unix file permissions between octal, symbolic, and visual checkbox form. Supports setuid, setgid, and sticky bits.",
  icon: "🔑",
  accept: null,
  maxSizeMB: null,
  keywords: [
    "chmod",
    "permissions",
    "unix",
    "linux",
    "octal",
    "symbolic",
    "setuid",
    "setgid",
    "sticky",
    "file permissions"
  ],
  steps: [
    "Toggle checkboxes for owner, group, and other permissions",
    "Or type an octal value (e.g. 755) to set permissions",
    "Copy the chmod command to use in your terminal"
  ],
  faqs: [
    {
      question: "What does 755 mean?",
      answer:
        "Owner can read, write, execute (7 = 4+2+1). Group and others can read and execute (5 = 4+1). Common for executable files and directories."
    },
    {
      question: "What is setuid / setgid / sticky?",
      answer:
        "setuid (4xxx) runs an executable as its owner. setgid (2xxx) runs as the group. Sticky (1xxx) restricts deletion in shared directories like /tmp."
    },
    {
      question: "What is the difference between 644 and 755?",
      answer:
        "644 (-rw-r--r--) is typical for regular files. 755 (-rwxr-xr-x) adds execute permission, needed for scripts and directories."
    }
  ]
};
```

## Error handling

- Empty octal input on commit → treated as `000`, all checkboxes cleared, symbolic shows `----------`, command shows `chmod 000 myfile`. No error UI.
- Non-numeric or out-of-range octal (`"abc"`, `"888"`, `"99999"`) on commit → octal input border turns `var(--color-danger)` for ~1500ms, command line and checkboxes are left at their last valid values. Input value reverts to last valid octal so the user can re-edit.
- All octals accept 3 or 4 digits. Rendered output canonicalises to 3 digits unless a special bit is set.
- All input handling is local to the closure; no module-level mutable state.

## Tests

### Unit (`src/__tests__/chmod-calculator.test.js`, Vitest)

Targets the four pure functions. Sub-millisecond per test.

| #   | Test                | Input                                         | Expected       |
| --- | ------------------- | --------------------------------------------- | -------------- |
| 1   | octal roundtrip 755 | `chmodToOctal(octalToChmod('755'))`           | `'755'`        |
| 2   | octal roundtrip 644 | same shape                                    | `'644'`        |
| 3   | symbolic 755        | `chmodToSymbolic(octalToChmod('755'))`        | `'-rwxr-xr-x'` |
| 4   | symbolic 644        | `'644'`                                       | `'-rw-r--r--'` |
| 5   | 4-digit setuid      | perms with `setuid:true, owner.x:true`        | `'4755'`       |
| 6   | sticky bit          | octalToChmod('1777') → chmodToSymbolic        | `'-rwxrwxrwt'` |
| 7   | invalid octal       | `octalToChmod('888')`                         | `null`         |
| 8   | invalid format      | `octalToChmod('abc')`                         | `null`         |
| 9   | empty perms         | `chmodToOctal({all false})`                   | `'000'`        |
| 10  | symbolic roundtrip  | `chmodToOctal(symbolicToChmod('-rwxr-xr-x'))` | `'755'`        |

### Playwright (`tests/chmod-calculator.spec.js`)

```js
import { test, expect } from "@playwright/test";

test("chmod-calculator loads and reacts", async ({ page }) => {
  await page.goto("/#/tools/chmod-calculator");
  await expect(page.locator("h1")).toContainText("Chmod");
  await page.locator("#cc-octal").fill("644");
  await page.locator("#cc-octal").press("Enter");
  await expect(page.locator("#cc-symbolic")).toContainText("-rw-r--r--");
  await page.locator('button:has-text("777")').click();
  await expect(page.locator("#cc-octal")).toHaveValue("777");
});
```

## Files touched (Step 7 + Step 8 sync per AGENTS.md)

**Important context from ground-truth check:**

- `src/data/tools.json` and `toolsList.json` already contain 280 entries each, including a `chmod-calculator` stub with `status: "planned"`.
- `src/data/categories.json` already counts dev=28 — its totals include both built and planned tools, so the sum stays 280.
- Built / planned split today: 243 / 37. After this change: 244 / 36.

| File                                     | Change                                                                                                                                                                                                                                                                                                    |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/tools/dev/chmod-calculator.js`      | NEW — implementation                                                                                                                                                                                                                                                                                      |
| `src/__tests__/chmod-calculator.test.js` | NEW — 10 unit tests                                                                                                                                                                                                                                                                                       |
| `tests/chmod-calculator.spec.js`         | NEW — Playwright happy path                                                                                                                                                                                                                                                                               |
| `toolsList.json`                         | **Update** the existing `chmod-calculator` entry: change `status` from `"planned"` to `"done"`. Refresh `description` and `keywords` to match the tool file's `toolConfig`.                                                                                                                               |
| `src/data/tools.json`                    | **Update** same entry the same way.                                                                                                                                                                                                                                                                       |
| `src/data/categories.json`               | **No change** — total per-category counts already include planned entries.                                                                                                                                                                                                                                |
| `README.md`                              | Change "243 built, 37 planned" → "244 built, 36 planned" (4 occurrences across header + categories table). Phase 25 section: bump status to "Phase 25: Most Wanted — In Progress (3/37 done)" since `svg-optimizer` and `wcag-contrast-checker` already shipped. Add chmod-calculator to the "done" list. |
| `PROJECT-PLAN.md`                        | Phase 25 row: status `📋 0 39` → `🟡 3 39` (also fixes existing drift — `svg-optimizer` and `wcag-contrast-checker` were shipped but the row was never updated). Total `466 / 480` → `467 / 480`.                                                                                                         |
| `memory/tool-building-progress.md`       | Tick `[x] Chmod Calculator (chmod-calculator)`.                                                                                                                                                                                                                                                           |
| `src/pages/home.js`                      | Grep for any hardcoded "243" tool-count strings (hero, search placeholder, meta description) and bump to "244". The total "280" strings stay.                                                                                                                                                             |
| `src/components/footer.js`               | Same — bump "243"-style built counts to "244". The total "280" tagline stays.                                                                                                                                                                                                                             |

After Step 8, run the registry-sync-checker one-liner to confirm `total: 280 catSum: 280 missing-files: 36 category-mismatches: []` (36 missing files is expected — those are the remaining Phase 25 planned tools).

## Risks

- **Browser clipboard permission** — `navigator.clipboard.writeText` requires a secure context. Dev server is `localhost`, which counts as secure, so OK.
- **Pre-existing registry drift** — `tool-building-progress.md` already has `svg-optimizer` and `wcag-contrast-checker` as `[x]` but `PROJECT-PLAN.md` shows Phase 25 done count as `0`. Also `README.md` says "37 planned" while `PROJECT-PLAN.md` Phase 25 row says `39 total`. The Files-touched table above fixes the Phase 25 done count (0 → 3) while leaving the 37 vs 39 mismatch to a separate registry-sync sweep — out of scope here.
- **Icon mismatch with my initial proposal** — I proposed 🔐 in design Section 1; the existing stub uses 🔑. Spec now keeps 🔑 to minimize churn. No user impact.
- **No new dependencies** — verified. `package.json` is untouched.

## Commit message (Step 9, after user approval)

```
Add chmod-calculator tool (dev)

- Implements bidirectional Unix file-permission calculator
  (checkbox grid ↔ octal ↔ symbolic), including setuid, setgid,
  and sticky special bits, with preset chips and copy-to-clipboard
  chmod command output.
- Pure JS, no new dependencies.
- Adds 10 Vitest unit tests + 1 Playwright happy path.
- Flips planned→done in tools.json and toolsList.json.
- Updates README, PROJECT-PLAN, tool-building-progress, home.js, footer.js
  built/planned counts (243/37 → 244/36).
```
