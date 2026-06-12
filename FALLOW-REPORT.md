# Fallow Codebase Report

**Date:** 2026-06-12 (updated)
**Fallow version:** 2.89.0

---

## Summary

| Metric | Value |
|--------|-------|
| Files analyzed | 487 |
| Functions analyzed | 4,137 |
| Total JS lines | 47,621 |
| Clone groups | 131 |
| Clone instances | ~300 |
| Duplicated lines | 3,571 (7.5%) |
| Files with clones | ~140/464 |
| Avg maintainability | 93.8 |

---

## Health Findings

| Severity | Count | Action |
|----------|-------|--------|
| Critical | 25 | Increase coverage (12), Refactor function (12), Add tests (1) |
| High | 54 | Add tests |
| Moderate | 76 | Add tests |
| **Total** | **155** | |

### Top CRAP Scores

| # | CRAP | CC | Cog | Function | File |
|---|------|----|-----|----------|------|
| 1 | 420 | 20 | 23 | `parseUA` | dev/user-agent-parser.js:33 |
| 2 | 272 | 16 | 8 | `onSearch` | weather/air-quality.js:87 |
| 3 | 240 | 15 | 22 | `applyContentAwareFill` | image/remove-text-image.js:153 |
| 4 | 240 | 15 | 26 | `checkPasswordInfo` | pdf/pdf-password-info.js:64 |
| 5 | 210 | 14 | 12 | `<arrow>` | math/fraction-calculator.js:70 |
| 6 | 182 | 13 | 19 | `onConvert` | pdf/epub-to-pdf.js:126 |
| 7 | 172 | 26 | 30 | `<arrow>` | math/scientific-calculator.js:129 |
| 8 | 156 | 12 | 22 | `applyPixelation` | image/pixelate-image.js:175 |
| 9 | 156 | 12 | 26 | `<arrow>` | pdf/image-to-pdf.js:68 |
| 10 | 156 | 12 | 29 | `nodeToObj` | text/xml-json.js:54 |

### Files with Most Findings

| # | Findings | File |
|---|----------|------|
| 1 | 5 | pdf/epub-to-pdf.js |
| 2 | 4 | text/xml-to-csv.js |
| 3 | 3 | image/collage-maker.js |
| 4 | 3 | pdf/fill-pdf-forms.js |
| 5 | 3 | image/crop-image.js |
| 6 | 3 | audio/audio-utils.js |
| 7 | 2 | math/scientific-calculator.js |
| 8 | 2 | weather/air-quality.js |
| 9 | 2 | dev/env-editor.js |
| 10 | 2 | image/remove-text-image.js |

> **Note:** High CRAP scores on algorithmic functions (pixel manipulation, XML parsing, calculator logic) are inherent to the problem domain. Refactoring would reduce readability. `renderPreview` in og-generator.js was refactored (4 identical switch cases → data-driven).

---

## Top 20 Clone Groups (by line count)

| # | Lines | Copies | Files |
|---|-------|--------|-------|
| 1 | 166 | 5x | hash-generator.js, jwt-decoder.js, latex-renderer.js, text-to-handwriting.js, word-frequency.js |
| 2 | 155 | 19x | add-subtitles.spec.js + 18 other .spec.js files (test template) |
| 3 | 113 | 2x | encrypt-file.js, steganography.js |
| 4 | 112 | 2x | thesaurus.js, air-quality.js |
| 5 | 104 | 3x | base64-codec.js, html-entity-codec.js, url-codec.js |
| 6 | 88 | 2x | emoji-picker.js, unicode-explorer.js |
| 7 | 84 | 2x | text-to-table.test.js, text-to-table.js |
| 8 | 80 | 2x | remove-background.js, upscale-image.js |
| 9 | 78 | 2x | merge-images.js, images-to-video.js |
| 10 | 78 | 2x | csv-splitter.js, excel-to-xml.js |
| 11 | 77 | 2x | image-to-pdf.js, images-to-video.js |
| 12 | 76 | 2x | html-entity-codec.js, url-codec.js |
| 13 | 73 | 2x | image-sharpening.js, pixelate-image.js |
| 14 | 70 | 2x | csv-splitter.js, xml-to-excel.js |
| 15 | 70 | 2x | video-speed.js, video-to-images.js |
| 16 | 66 | 2x | hash-generator.js, word-frequency.js |
| 17 | 63 | 2x | pdf-converter-factory.js, single-file-tool.js |
| 18 | 61 | 2x | transcribe-audio.js, remove-background.js |
| 19 | 61 | 2x | color-blindness.js, image-filters.js |
| 20 | 60 | 2x | image-to-pdf.js, pdf-to-image.js |

---

## Duplication Breakdown

### By Category
- **Test files**: ~155 lines from 19 identical `.spec.js` test templates (group #2)
- **Tool utilities**: ~166 lines from 5 basic-tool wrappers (group #1)
- **Image tools**: ~350 lines across image processing functions
- **PDF tools**: ~250 lines across PDF conversion functions
- **Video tools**: ~140 lines across video processing functions
- **Codec tools**: ~180 lines across encoding/decoding functions
- **Lookup tools**: ~112 lines from thesaurus/air-quality

### Remaining Duplication (by priority)

**High impact (70+ lines):**
- **#1** 166 lines (5x): basic tool pattern — CSS extracted, logic remains
- **#2** 155 lines (19x): test template — identical across all .spec.js files
- **#3** 113 lines: encrypt-file / steganography — tab UI pattern
- **#4** 112 lines: thesaurus / air-quality — lookup pattern
- **#5** 104 lines (3x): codec tools — encoding pattern
- **#6** 88 lines: emoji-picker / unicode-explorer — char grid pattern

**Medium impact (60-80 lines):**
- Image tools: remove-background, upscale-image, merge-images, image-sharpening, pixelate-image
- PDF tools: image-to-pdf, pdf-to-image, pdf-converter-factory
- Video tools: video-speed, video-to-images
- CSV/XML: csv-splitter, excel-to-xml, xml-to-excel

---

## Refactoring Progress

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Clone groups | 155 | 135 | -20 |
| Duplicated lines | 4,514 | 3,812 | -702 |
| Duplication % | 9.4% | 8.0% | -1.4% |

### Sessions

**Session 2026-06-12 (initial):**
1. **CSS modules** — Extracted `lookup-css.js`, `tabs-css.js`, `basic-tool-css.js`, `char-grid-css.js`
2. **Image tools factory** — `create-image-tool.js` with 5 tools using it
3. **escapeHtml dedup** — Centralized to `src/utils/dom.js`, 11 copies removed
4. **Video tools factory** — `video-tool-factory.js` with 3 tools using it
5. **og-generator** — Data-driven preview rendering (switch → lookup)

**Session 2026-06-12 (parallel agents):**
1. **Codec tools** — `codec-tool-factory.js` + `codec-css.js` for 3 tools (base64, html-entity, url)
2. **Tab switching** — `tab-switching.js` helper for privacy tools (encrypt-file, steganography)
3. **Test helper** — `tool-config-test.js` for standardized tool config tests

### Remaining targets:
1. **Test template** (#2, 155 lines) — 19 identical .spec.js files could share a test helper
2. **Basic tool pattern** (#1, 166 lines) — 5 tools with identical skeleton (CSS extracted, event binding remains)
3. **Encrypt/steganography** (#3, 113 lines) — Tab UI + file processing pattern
4. **Codec tools** (#5, 104 lines) — 3 encoding tools with shared structure

---

## Health Score

**93.8/100** maintainability average

- No unused files, exports, or dependencies
- No circular dependencies
- No boundary violations
- 25 critical findings (mostly coverage gaps in complex functions)
- 54 high findings (test coverage needed)
- 76 moderate findings (test coverage needed)
