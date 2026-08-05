# MEMORY.md - Long-Term Memory

## Key Decisions & Context

- **PDF Worker Strategy**: All PDF tools use local worker assets via Vite's `?url` syntax to avoid CDN blocking issues.
- **Tool Registry**: `src/data/tools.json` is the primary registry used by the app, while `toolsList.json` is kept in sync for external tracking.
- **Standardization**: All tool files must use `.js` extension, export a `toolConfig`, and a `render` function.
- **Deduplication**: Tools are deduplicated by ID and by (Name, Category) pairs to ensure a clean UI.
- **Chrome DevTools MCP Compatibility**: MiMo V2.5 fails with Chrome DevTools MCP due to Xiaomi API limitations (single-round tool calling, rejects list-type content). Use MiniMax M3 Free for Chrome DevTools testing. This is documented in AGENTS.md under "Model Switching Strategy".

## Recent Achievements (2026-08-05)

- Built **Equation Solver** tool (`src/tools/math/equation-solver.js`) — Phase 28, math. Linear/quadratic/2×2 systems with step-by-step KaTeX. Fully verified: build, 1740 unit tests (53 tool), smoke, Chrome DevTools e2e, perf (10 routes ≤ 50ms), fallow, oxlint. 344 total tools (328 built, 16 planned).
- Router contract confirmed: `src/pages/tool.js` calls `module.cleanup`, NOT `destroy`.

## Recent Achievements (2026-08-03)

- Synced all docs to registry truth: 345 total tools (325 built, 20 planned).
- Fixed drift in README.md (tool count, badge, video 27→26, finance 17→16, productivity 19→18, Phase 28 16/36→17/36), PROJECT-PLAN.md (total, video 27→26, finance 17→16, math 14→13), TOOLS.md (total), MEMORY.md (total).
- Verified clean: toolsList.json ids match tools.json, categories.json sum matches, no missing tool files, no category mismatches.

## Recent Achievements (2026-07-06)

- Phase 28 tool 15/36 built: Video Metadata Editor (video category).
- 345 total tools (325 built, 20 planned).

- Phase 27 complete: all 19 High-Demand Tools built and registered (308 total).
- Remaining: Phase 28 — Legacy Catch-Up (16 planned tools, 1 duplicate removed).
- Reviewed PHASE-28-INSTRUCTIONS.md (20 tools): 7 duplicates skipped, 1 merged into existing tool (podcast-loudness-normalizer → normalize-audio), 12 new planned tools added.
- Upgraded normalize-audio to "Audio Normalizer" with EBU R128 LUFS loudness normalization mode.
- Updated README.md, PROJECT-PLAN.md, and tool-building-progress.md to reflect current status.

## Recent Achievements (2026-05-04)

- Standardized and registered 24 previously hidden tools, bringing the total count to 178.
- Resolved major PDF worker loading errors by migrating to local imports.
- Cleaned up and deduplicated the entire tool library manifest.
- Renamed all `.jsx` files to `.js` and injected missing `toolConfig` exports.
