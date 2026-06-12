# Fallow Codebase Report

**Date:** 2026-06-12 (final)
**Fallow version:** 2.89.0

---

## Summary

| Metric | Value |
|--------|-------|
| Files analyzed | 467 |
| Functions analyzed | 4,137 |
| Total JS lines | 47,568 |
| Clone groups | 129 |
| Clone instances | 311 |
| Duplicated lines | 3,443 (7.2%) |
| Files with clones | 142/467 |
| Avg maintainability | 93.8 |

---

## Health Findings

| Severity | Count |
|----------|-------|
| Critical | 25 |
| High | 54 |
| Moderate | 76 |
| **Total** | **155** |

> **Note:** Most findings are test coverage gaps. High CRAP scores are on algorithmic functions (pixel manipulation, XML parsing, calculator logic) where complexity is inherent to the problem domain.

---

## Top 10 Clone Groups

| # | Lines | Files |
|---|-------|-------|
| 1 | 155 | add-subtitles.spec.js + 18 other .spec.js files (test template) |
| 2 | 134 | hash-generator.js, jwt-decoder.js, latex-renderer.js, text-to-handwriting.js |
| 3 | 112 | thesaurus.js, air-quality.js |
| 4 | 84 | text-to-table.test.js, text-to-table.js |
| 5 | 80 | remove-background.js, upscale-image.js |
| 6 | 78 | merge-images.js, images-to-video.js |
| 7 | 78 | csv-splitter.js, excel-to-xml.js |
| 8 | 77 | image-to-pdf.js, images-to-video.js |
| 9 | 73 | image-sharpening.js, pixelate-image.js |
| 10 | 70 | csv-splitter.js, xml-to-excel.js |

---

## Refactoring Progress

| Metric | Original | Final | Change |
|--------|----------|-------|--------|
| Clone groups | 155 | 129 | -26 |
| Duplicated lines | 4,514 | 3,443 | -1,071 |
| Duplication % | 9.4% | 7.2% | -2.2% |

### Factories Created

| Factory | Tools Using It |
|---------|---------------|
| `image-tool-factory.js` | 5 image tools |
| `video-tool-factory.js` | 3 video tools |
| `codec-tool-factory.js` | 4 tools (base64, html-entity, url, morse-code) |
| `basic-tool-factory.js` | word-frequency (others can migrate) |
| `char-grid-factory.js` | unicode-explorer (others can migrate) |

### Utilities Extracted

| Utility | Used By |
|----------|---------|
| `escapeHtml` (dom.js) | 11 tools |
| `BASIC_TOOL_CSS` | 5 tools |
| `LOOKUP_CSS` | 2 tools |
| `TABS_CSS` | 4 tools |
| `CODEC_CSS` | 4 tools |
| `wireTabSwitching` | 2 tools |

### Key Refactorings

1. **CSS modules** — lookup-css, tabs-css, basic-tool-css, char-grid-css
2. **Image tools** — createImageTool factory
3. **Video tools** — video-tool-factory
4. **Codec tools** — codec-tool-factory
5. **escapeHtml** — centralized to utils/dom.js
6. **og-generator** — switch → data-driven
7. **Tab switching** — wireTabSwitching helper
8. **Test helper** — tool-config-test.js

---

## Remaining Targets (Low Priority)

These have too much algorithmic variation to deduplicate safely:

- **Test templates (155 lines)** — 19 .spec.js files have slight variations
- **Image processing (300+ lines)** — Different algorithms per tool
- **PDF tools (250+ lines)** — Different libraries/APIs
- **Video tools (140+ lines)** — Different codecs

---

## Health Score: 93.8/100

- No unused files, exports, or dependencies
- No circular dependencies
- No boundary violations
- 155 findings (mostly test coverage gaps)