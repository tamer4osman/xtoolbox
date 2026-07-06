# MEMORY.md - Long-Term Memory

## Key Decisions & Context

- **PDF Worker Strategy**: All PDF tools use local worker assets via Vite's `?url` syntax to avoid CDN blocking issues.
- **Tool Registry**: `src/data/tools.json` is the primary registry used by the app, while `toolsList.json` is kept in sync for external tracking.
- **Standardization**: All tool files must use `.js` extension, export a `toolConfig`, and a `render` function.
- **Deduplication**: Tools are deduplicated by ID and by (Name, Category) pairs to ensure a clean UI.
- **Chrome DevTools MCP Compatibility**: MiMo V2.5 fails with Chrome DevTools MCP due to Xiaomi API limitations (single-round tool calling, rejects list-type content). Use MiniMax M3 Free for Chrome DevTools testing. This is documented in AGENTS.md under "Model Switching Strategy".

## Recent Achievements (2026-07-06)

- Phase 28 tool 1/36 built: Image Blur (image category).
- 345 total tools (313 built, 32 planned).

- Phase 27 complete: all 19 High-Demand Tools built and registered (308 total).
- Remaining: Phase 28 — Legacy Catch-Up (36 planned tools).
- Reviewed PHASE-28-INSTRUCTIONS.md (20 tools): 7 duplicates skipped, 1 merged into existing tool (podcast-loudness-normalizer → normalize-audio), 12 new planned tools added.
- Upgraded normalize-audio to "Audio Normalizer" with EBU R128 LUFS loudness normalization mode.
- Updated README.md, PROJECT-PLAN.md, and tool-building-progress.md to reflect current status.

## Recent Achievements (2026-05-04)

- Standardized and registered 24 previously hidden tools, bringing the total count to 178.
- Resolved major PDF worker loading errors by migrating to local imports.
- Cleaned up and deduplicated the entire tool library manifest.
- Renamed all `.jsx` files to `.js` and injected missing `toolConfig` exports.
