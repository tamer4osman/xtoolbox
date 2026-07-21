---
name: improve-codebase-architecture
description: Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick.
disable-model-invocation: true
---

# Improve Codebase Architecture

Surface architectural friction and propose **deepening opportunities** — refactors that turn shallow modules into deep ones. The aim is testability and AI-navigability.

## Process

### 1. Explore

**Scope before you scan — YAGNI.** Deepening a module pays off by making future changes to it easier, so put extra weight on the parts of the codebase that have recently changed. Decide _where_ to look before you look:

- If the user named a direction — a module, a subsystem, a pain point — take it, and skip the inference below.
- Otherwise, walk back a good stretch of the commit history (`git log --oneline`) to find the codebase's hot spots — the files and areas that keep coming up — and let those paths pull your attention first.

Then explore the codebase organically and note where you experience friction:

- Where does understanding one concept require bouncing between many small modules?
- Where are modules **shallow** — interface nearly as complex as the implementation?
- Where have pure functions been extracted just for testability, but the real bugs hide in how they're called (no **locality**)?
- Where do tightly-coupled modules leak across their seams?
- Which parts of the codebase are untested, or hard to test through their current interface?

Apply the **deletion test** to anything you suspect is shallow: would deleting it concentrate complexity, or just move it? A "yes, concentrates" is the signal you want.

### 2. Present candidates as an HTML report

Write a self-contained HTML file to the OS temp directory so nothing lands in the repo. Resolve the temp dir from `$TMPDIR`, falling back to `/tmp` (or `%TEMP%` on Windows), and write to `<tmpdir>/architecture-review-<timestamp>.html` so each run gets a fresh file. Open it for the user.

The report uses **Tailwind via CDN** for layout and styling, and **Mermaid via CDN** for diagrams where a graph/flow/sequence reliably communicates the structure. Each candidate gets a **before/after visualisation**. Be visual.

For each candidate, render a card with:

- **Files** — which files/modules are involved
- **Problem** — why the current architecture is causing friction
- **Solution** — plain English description of what would change
- **Benefits** — explained in terms of locality and leverage, and how tests would improve
- **Before / After diagram** — side-by-side illustrating the shallowness and the deepening
- **Recommendation strength** — one of `Strong`, `Worth exploring`, `Speculative`, rendered as a badge

End the report with a **Top recommendation** section: which candidate you'd tackle first and why.

Do NOT propose interfaces yet. After the file is written, ask the user: "Which of these would you like to explore?"

### 3. Grilling loop

Once the user picks a candidate, run the grill-me skill to walk the decision tree with them — constraints, dependencies, the shape of the deepened module, what sits behind the seam, what tests survive.

## xtoolbox-specific guidance

When analyzing this codebase, pay attention to:

- **Factory pattern opportunities**: `src/tools/image/image-tool-factory.js`, `video-tool-factory.js`, `codec-factory.js` — are there tools that should use these but don't?
- **Tool file structure**: Each tool should follow the standard pattern (imports → helpers → config → render). Tools that deviate are candidates for refactoring.
- **Shared utilities**: `src/utils/` — are there duplicate utility functions across tools that should be extracted?
- **Registry sync**: `tools.json` and `toolsList.json` — are there structural inconsistencies?
- **Page templates**: `src/pages/` — are there page patterns that could be consolidated?
- **Component reuse**: `src/components/` — are there UI patterns repeated across tools that should be components?

## Glossary

Use these terms exactly:

- **Module**: a file or directory with a clear responsibility
- **Interface**: the public surface of a module (exports, config, render function)
- **Depth**: ratio of implementation complexity to interface simplicity (deep = good)
- **Seam**: a place where modules meet and can be independently tested/replaced
- **Adapter**: code that translates between two module interfaces
- **Leverage**: one change improving many call sites
- **Locality**: related logic concentrated in one place

**Never substitute**: component, service, unit (for module) · API, signature (for interface) · boundary (for seam) · layer, wrapper (for module, when you mean module).
