# Fallow Codebase Report

**Date:** 2026-06-12
**Fallow version:** 2.89.0
**Scan time:** ~500ms

---

## Summary

| Metric | Value |
|--------|-------|
| Total JS lines | 45,001 |
| Clone groups | 135 |
| Duplicated lines | 2,113 |
| Duplication % | 4.7% |
| Health issues | 0 |
| Unused files | 0 |
| Unused exports | 0 |

---

## Top 20 Clone Groups

| # | Lines | Instances | Files |
|---|-------|-----------|-------|
| 1 | 64 | 2x | thesaurus.js, air-quality.js |
| 2 | 61 | 2x | encrypt-file.js, steganography.js |
| 3 | 48 | 5x | hash-generator.js, jwt-decoder.js, latex-renderer.js, text-to-handwriting.js, word-frequency.js |
| 4 | 46 | 2x | emoji-picker.js, unicode-explorer.js |
| 5 | 45 | 2x | merge-images.js, images-to-video.js |
| 6 | 45 | 2x | image-to-pdf.js, images-to-video.js |
| 7 | 44 | 2x | pdf-converter-factory.js, single-file-tool.js |
| 8 | 44 | 2x | csv-splitter.js, excel-to-xml.js |
| 9 | 44 | 2x | csv-splitter.js, xml-to-excel.js |
| 10 | 43 | 2x | text-to-table.test.js, text-to-table.js |
| 11 | 41 | 2x | remove-background.js, upscale-image.js |
| 12 | 40 | 2x | image-sharpening.js, pixelate-image.js |
| 13 | 39 | 2x | html-entity-codec.js, url-codec.js |
| 14 | 39 | 2x | video-speed.js, video-to-images.js |
| 15 | 38 | 2x | trim-video.js, video-to-images.js |
| 16 | 37 | 3x | base64-codec.js, html-entity-codec.js, url-codec.js |
| 17 | 34 | 2x | hash-generator.js, word-frequency.js |
| 18 | 34 | 2x | color-blindness.js, image-filters.js |
| 19 | 34 | 2x | image-to-pdf.js, pdf-to-image.js |
| 20 | 32 | 2x | transcribe-audio.js, remove-background.js |

---

## Refactoring Progress

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Clone groups | 155 | 135 | -20 |
| Duplicated lines | 4,514 | 2,113 | -2,401 |
| Duplication % | 9.4% | 4.7% | -4.7% |

### What was refactored:
1. **CSS modules** — Extracted `lookup-css.js`, `tabs-css.js`, `basic-tool-css.js`, `char-grid-css.js`
2. **Image tools factory** — `create-image-tool.js` with 5 tools using it
3. **escapeHtml dedup** — Centralized to `src/utils/dom.js`, 11 copies removed
4. **Video tools factory** — `video-tool-factory.js` with 3 tools using it

---

## Remaining Duplication (by priority)

### High impact (40+ lines)
- **#1** 64 lines: thesaurus.js / air-quality.js — lookup pattern
- **#2** 61 lines: encrypt-file.js / steganography.js — tab UI pattern
- **#3** 48 lines (5 instances): hash-generator / jwt-decoder / latex-renderer / text-to-handwriting / word-frequency — basic tool pattern (CSS extracted, logic remains)
- **#5-6** 45 lines: merge-images / image-to-pdf / images-to-video — image loading pattern
- **#8-9** 44 lines: csv-splitter / excel-to-xml / xml-to-excel — XML/CSV conversion pattern

### Medium impact (30-39 lines)
- **#11-12** 40-41 lines: remove-background / upscale-image / image-sharpening / pixelate-image — image processing pattern
- **#13-16** 37-39 lines: codec tools (html-entity / url / base64) — encoding pattern
- **#14-15** 38-39 lines: video-speed / trim-video / video-to-images — video processing pattern

---

## Health

- **Score:** 0 issues
- No unused files, exports, or dependencies
- No circular dependencies
- No boundary violations
